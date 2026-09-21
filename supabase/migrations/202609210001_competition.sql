-- Закрытый недельный рейтинг ShadowFox Eng.
-- Приложение передаёт только абсолютную сумму баллов текущей недели.
create extension if not exists pgcrypto;

create table if not exists public.competition_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 2 and 30),
  invite_code text not null unique,
  active_device_id text not null check (char_length(active_device_id) between 8 and 160),
  score_epoch uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.competition_friendships (
  user_a uuid not null references public.competition_profiles(id) on delete cascade,
  user_b uuid not null references public.competition_profiles(id) on delete cascade,
  requested_by uuid not null references public.competition_profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_a,user_b),
  check (user_a::text < user_b::text),
  check (requested_by=user_a or requested_by=user_b)
);

create table if not exists public.competition_weekly_scores (
  user_id uuid not null references public.competition_profiles(id) on delete cascade,
  week_id text not null check (week_id ~ '^\d{4}-W\d{2}$'),
  score_epoch uuid not null,
  points integer not null check (points between 0 and 1425),
  updated_at timestamptz not null default now(),
  primary key (user_id,week_id)
);

create table if not exists public.competition_sync_usage (
  user_id uuid not null references public.competition_profiles(id) on delete cascade,
  sync_day date not null,
  used smallint not null check (used between 1 and 2),
  primary key (user_id,sync_day)
);

create table if not exists public.competition_retired_epochs (
  user_id uuid not null references public.competition_profiles(id) on delete cascade,
  score_epoch uuid not null,
  retired_at timestamptz not null default now(),
  primary key (user_id,score_epoch)
);

alter table public.competition_profiles enable row level security;
alter table public.competition_friendships enable row level security;
alter table public.competition_weekly_scores enable row level security;
alter table public.competition_sync_usage enable row level security;
alter table public.competition_retired_epochs enable row level security;

revoke all on public.competition_profiles,public.competition_friendships,public.competition_weekly_scores,public.competition_sync_usage,public.competition_retired_epochs from anon,authenticated;

create or replace function public.competition_register(p_nickname text,p_device_id text)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_user uuid:=auth.uid();v_profile public.competition_profiles;
begin
  if v_user is null then raise exception 'authentication_required';end if;
  p_nickname:=btrim(p_nickname);p_device_id:=btrim(p_device_id);
  if char_length(p_nickname) not between 2 and 30 then raise exception 'invalid_nickname';end if;
  if char_length(p_device_id) not between 8 and 160 then raise exception 'invalid_device';end if;
  insert into public.competition_profiles(id,nickname,invite_code,active_device_id)
  values(v_user,p_nickname,upper(encode(gen_random_bytes(5),'hex')),p_device_id)
  on conflict(id) do update set nickname=excluded.nickname,updated_at=now()
  returning * into v_profile;
  if v_profile.active_device_id<>p_device_id then raise exception 'device_mismatch';end if;

  return jsonb_build_object('id',v_profile.id,'nickname',v_profile.nickname,'invite_code',v_profile.invite_code);
end $$;

create or replace function public.competition_add_friend(p_code text)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_user uuid:=auth.uid();v_target uuid;v_a uuid;v_b uuid;
begin
  if v_user is null then raise exception 'authentication_required';end if;
  select id into v_target from public.competition_profiles where invite_code=upper(btrim(p_code));
  if v_target is null then raise exception 'friend_not_found';end if;
  if v_target=v_user then raise exception 'same_user';end if;
  if v_user::text<v_target::text then v_a:=v_user;v_b:=v_target;else v_a:=v_target;v_b:=v_user;end if;
  insert into public.competition_friendships(user_a,user_b,requested_by)
  values(v_a,v_b,v_user)
  on conflict(user_a,user_b) do nothing;
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.competition_accept_friend(p_requester uuid)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare v_user uuid:=auth.uid();v_changed integer;
begin
  if v_user is null then raise exception 'authentication_required';end if;
  update public.competition_friendships set status='accepted',updated_at=now()
  where status='pending' and requested_by=p_requester and ((user_a=v_user and user_b=p_requester) or (user_b=v_user and user_a=p_requester));
  get diagnostics v_changed=row_count;if v_changed<>1 then raise exception 'request_not_found';end if;
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.competition_remove_friend(p_friend uuid)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception 'authentication_required';end if;
  delete from public.competition_friendships where (user_a=v_user and user_b=p_friend) or (user_b=v_user and user_a=p_friend);
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.competition_delete_profile()
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare v_user uuid:=auth.uid();
begin
  if v_user is null then raise exception 'authentication_required';end if;
  delete from public.competition_profiles where id=v_user;
  return jsonb_build_object('ok',true);
end $$;

create or replace function public.competition_sync(p_week_id text,p_score_epoch uuid,p_retired_epochs uuid[],p_points integer,p_device_id text)
returns jsonb
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare
  v_user uuid:=auth.uid();v_profile public.competition_profiles;v_old public.competition_weekly_scores;v_used smallint;v_now timestamptz:=now();v_friends jsonb;v_requests jsonb;
begin
  if v_user is null then raise exception 'authentication_required';end if;
  if p_week_id not in (
    to_char((v_now at time zone 'utc')-interval '1 day','IYYY-"W"IW'),
    to_char(v_now at time zone 'utc','IYYY-"W"IW'),
    to_char((v_now at time zone 'utc')+interval '1 day','IYYY-"W"IW')
  ) then raise exception 'invalid_week';end if;
  if p_points not between 0 and 1425 then raise exception 'invalid_points';end if;
  if cardinality(coalesce(p_retired_epochs,'{}'::uuid[]))>500 then raise exception 'too_many_retired_epochs';end if;
  select * into v_profile from public.competition_profiles where id=v_user for update;
  if not found then raise exception 'profile_required';end if;
  if v_profile.active_device_id<>p_device_id then raise exception 'device_mismatch';end if;
  insert into public.competition_retired_epochs(user_id,score_epoch)
  select v_user,e from unnest(coalesce(p_retired_epochs,'{}'::uuid[])) e where e<>p_score_epoch
  on conflict do nothing;
  if exists(select 1 from public.competition_retired_epochs where user_id=v_user and score_epoch=p_score_epoch) then
    raise exception 'retired_score_epoch';
  end if;

  insert into public.competition_sync_usage(user_id,sync_day,used) values(v_user,(v_now at time zone 'utc')::date,1)
  on conflict(user_id,sync_day) do update set used=public.competition_sync_usage.used+1 where public.competition_sync_usage.used<2
  returning used into v_used;
  if v_used is null then raise exception 'two_syncs_per_day';end if;

  select * into v_old from public.competition_weekly_scores where user_id=v_user and week_id=p_week_id for update;
  if found and v_old.score_epoch=p_score_epoch and p_points<v_old.points then raise exception 'score_decrease_without_reset';end if;
  if v_profile.score_epoch is not null and v_profile.score_epoch<>p_score_epoch then
    insert into public.competition_retired_epochs(user_id,score_epoch) values(v_user,v_profile.score_epoch) on conflict do nothing;
  end if;
  update public.competition_profiles set score_epoch=p_score_epoch,updated_at=v_now where id=v_user;
  insert into public.competition_weekly_scores(user_id,week_id,score_epoch,points,updated_at)
  values(v_user,p_week_id,p_score_epoch,p_points,v_now)
  on conflict(user_id,week_id) do update set score_epoch=excluded.score_epoch,points=excluded.points,updated_at=excluded.updated_at;

  select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'nickname',p.nickname,'points',coalesce(s.points,0),'updated_at',s.updated_at) order by coalesce(s.points,0) desc,p.nickname),'[]'::jsonb)
  into v_friends
  from public.competition_profiles p
  left join public.competition_weekly_scores s on s.user_id=p.id and s.week_id=p_week_id
  where p.id in (
    select case when f.user_a=v_user then f.user_b else f.user_a end from public.competition_friendships f where f.status='accepted' and (f.user_a=v_user or f.user_b=v_user)
  );

  select coalesce(jsonb_agg(jsonb_build_object('id',p.id,'nickname',p.nickname) order by p.nickname),'[]'::jsonb)
  into v_requests
  from public.competition_friendships f
  join public.competition_profiles p on p.id=f.requested_by
  where f.status='pending' and f.requested_by<>v_user and (f.user_a=v_user or f.user_b=v_user);

  return jsonb_build_object('friends',v_friends,'requests',v_requests,'quota_day',(v_now at time zone 'utc')::date,'quota_used',v_used,'updated_at',v_now);
end $$;

revoke all on function public.competition_register(text,text),public.competition_add_friend(text),public.competition_accept_friend(uuid),public.competition_remove_friend(uuid),public.competition_delete_profile(),public.competition_sync(text,uuid,uuid[],integer,text) from public,anon;
grant execute on function public.competition_register(text,text),public.competition_add_friend(text),public.competition_accept_friend(uuid),public.competition_remove_friend(uuid),public.competition_delete_profile(),public.competition_sync(text,uuid,uuid[],integer,text) to authenticated;
