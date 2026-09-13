// Осенние сцены-фоны. Все цвета — токены интерфейса, поэтому сцены сами подстраиваются под тему.
// viewBox 0 0 400 800, привязка к нижнему краю: на любом экране горизонт остаётся внизу.
const SCENES = {
  none:     { title: "Без фона" },
  town:     { title: "Осенний город" },
  village:  { title: "Деревенский домик" },
  sea:      { title: "Море и хижина" },
  mountain: { title: "Горный хребет" },
};

// детерминированный «случайный» генератор, чтобы сцена была одинаковой при каждом открытии
const rng = seed => { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };

// падающие листья
function leavesSvg(n, seed = 1){
  const rnd = rng(seed);
  const fills = ["var(--accent)", "var(--amber)", "var(--leaf)", "var(--accent-deep)"];
  return `<g class="leaves">` + Array.from({length:n}, (_, k) => {
    const x = Math.round(rnd()*400), t = (10 + rnd()*10).toFixed(1), d = (-rnd()*20).toFixed(1), sz = (0.45 + rnd()*0.5).toFixed(2);
    return `<g transform="translate(${x} 0)"><g class="leaf" style="--t:${t}s;--d:${d}s"><path transform="scale(${sz})" fill="${fills[k%4]}" opacity=".9" d="M0-9l3 5 7-3-4 6 5 5-6 0 0 8-3-5-3 5 0-8-6 0 5-5-4-6 7 3z"/></g></g>`;
  }).join("") + `</g>`;
}
const skyDefs = `<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky1)"/><stop offset=".55" stop-color="var(--sky2)"/><stop offset="1" stop-color="var(--sky3)"/></linearGradient>
  <linearGradient id="water" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sky3)"/><stop offset=".5" stop-color="var(--water)"/><stop offset="1" stop-color="var(--hill2)"/></linearGradient>
  <radialGradient id="glow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="var(--amber)" stop-opacity=".6"/><stop offset="1" stop-color="var(--amber)" stop-opacity="0"/></radialGradient>
  <radialGradient id="fire" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="var(--leaf)" stop-opacity=".9"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient>
</defs>`;
const stars = (seed=2, n=26, maxY=330) => { const rnd=rng(seed); return `<g class="stars night">`+Array.from({length:n},()=>`<circle class="star" style="--d:${(-rnd()*4).toFixed(1)}s" cx="${Math.round(rnd()*400)}" cy="${Math.round(rnd()*maxY)}" r="${(0.6+rnd()*1.1).toFixed(1)}" fill="var(--moon)" opacity=".8"/>`).join("")+`</g>`; };
const moon = (x, y, r) => `<g class="night"><circle cx="${x}" cy="${y}" r="${r*3}" fill="url(#glow)"/><circle cx="${x}" cy="${y}" r="${r}" fill="var(--orb)"/></g><g class="day sun"><circle cx="${x}" cy="${y}" r="${r*4}" fill="url(#glow)"/><circle cx="${x}" cy="${y}" r="${r*1.15}" fill="var(--orb)"/></g>`;
// дневные детали: облака и птицы (ночью скрыты через CSS)
const dayClouds = (seed=4) => { const rnd=rng(seed); return `<g class="day">`+Array.from({length:3},(_,k)=>{ const y=60+Math.round(rnd()*200), s=(0.7+rnd()*0.8).toFixed(2), tt=(70+rnd()*60).toFixed(0), d=(-rnd()*90).toFixed(0);
  return `<g class="daycloud" style="--y:${y}px;--t:${tt}s;--d:${d}s"><g transform="scale(${s})" fill="var(--cloud)"><ellipse cx="0" cy="0" rx="48" ry="13"/><ellipse cx="-14" cy="-9" rx="24" ry="13"/><ellipse cx="18" cy="-7" rx="20" ry="11"/></g></g>`; }).join("")+`</g>`; };
const birds = (seed=6, n=4) => { const rnd=rng(seed); return `<g class="day">`+Array.from({length:n},()=>{ const y=90+Math.round(rnd()*220), s=(0.6+rnd()*0.7).toFixed(2), tt=(28+rnd()*30).toFixed(0), d=(-rnd()*50).toFixed(0);
  return `<g class="bird" style="--y:${y}px;--t:${tt}s;--d:${d}s"><path transform="scale(${s})" d="M0 0q6-6 12 0q6-6 12 0" fill="none" stroke="var(--figure)" stroke-width="2" opacity=".7"/></g>`; }).join("")+`</g>`; };
const win = (x, y, w, h, d, dim) => `<rect class="win" style="--d:${d}s" x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="var(--leaf)" opacity="${dim?".35":"1"}"/>`;
const tree = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-2" y="-6" width="4" height="26" fill="var(--hill1)"/><circle cx="0" cy="-14" r="16" fill="${c}"/><circle cx="-9" cy="-6" r="11" fill="${c}"/><circle cx="9" cy="-6" r="11" fill="${c}"/></g>`;
const pine = (x, y, s, c="var(--hill1)") => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0-30L12-8H-12zM0-20L14 4H-14zM0-8L16 16H-16z" fill="${c}"/><rect x="-2" y="14" width="4" height="8" fill="${c}"/></g>`;
const house = (x, y, s, d) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-22 0v-22l22-16 22 16V0z" fill="var(--hill1)"/><path d="M-26-20l26-19 26 19" fill="none" stroke="var(--accent-deep)" stroke-width="3"/>${win(-14,-14,8,9,d)}${win(6,-14,8,9,d+1.3)}<rect x="10" y="-38" width="6" height="12" fill="var(--hill1)"/></g>`;
// силуэт прохожего: голова, тело, ноги шагают
// внешняя группа держит позицию атрибутом, внутренняя анимируется CSS-transform (он перекрыл бы атрибут)
const person = (x, y, s, cls, style) => `<g transform="translate(${x} ${y})"><g class="${cls}" style="${style};--s:${s}"><g class="body"><circle cx="0" cy="-30" r="4.5" fill="var(--figure)"/><path d="M-4-24h8l3 16h-3l-1 12h-2l-1-10-1 10h-2l-1-12h-3z" fill="var(--figure)"/></g></g></g>`;
// многоэтажка: сетка окон, часть окон погашена
const block = (x, y, w, h, cols, rows, seed, shop) => {
  const rnd = rng(seed); const cw = w/cols, rh = (h-(shop?26:0))/rows; let out = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="var(--hill1)"/>`;
  for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){ const lit = rnd() > 0.6; out += win(x+c*cw+cw*0.3, y+r*rh+rh*0.28, cw*0.4, rh*0.42, (rnd()*5).toFixed(1), !lit); }
  if(shop){ const sy = y+h-26; out += `<rect x="${x}" y="${sy}" width="${w}" height="26" fill="var(--hill2)"/><rect x="${x+4}" y="${sy+3}" width="${w-8}" height="6" rx="1" fill="var(--accent)"/><rect x="${x+w/2-6}" y="${sy+11}" width="12" height="15" fill="var(--leaf)" opacity=".85"/>`; }
  return out;
};

const SCENE_SVG = {
  // Город: улица с перспективой, многоэтажки, магазины с прохожими
  town: () => `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice">${skyDefs}
    <rect width="400" height="800" fill="url(#sky)"/>${stars(3,30,300)}${moon(320,110,18)}${dayClouds(4)}${birds(6,3)}
    <g fill="var(--hill3)"><rect x="0" y="300" width="34" height="200"/><rect x="40" y="340" width="26" height="160"/><rect x="72" y="310" width="40" height="190"/><rect x="118" y="360" width="30" height="140"/><rect x="152" y="330" width="22" height="170"/><rect x="226" y="350" width="26" height="150"/><rect x="258" y="320" width="36" height="180"/><rect x="300" y="290" width="30" height="210"/><rect x="336" y="345" width="24" height="155"/><rect x="366" y="315" width="34" height="185"/></g>
    <g class="stars night">${Array.from({length:40},(_,k)=>`<rect class="star" style="--d:${(k*0.37%4).toFixed(1)}s" x="${8+(k*37)%390}" y="${330+(k*53)%150}" width="3" height="4" fill="var(--leaf)" opacity=".5"/>`).join("")}</g>
    <!-- дорога в перспективе -->
    <path d="M104 800L192 470h16L296 800z" fill="var(--road)"/>
    <path d="M70 800L188 470h4L104 800z" fill="var(--hill2)"/><path d="M330 800L212 470h-4L296 800z" fill="var(--hill2)"/>
    <g stroke="var(--leaf)" stroke-width="3" opacity=".8"><path d="M200 500v14M200 540v22M200 592v30M200 655v40M200 730v70" stroke-dasharray="0"/></g>
    <!-- дома слева -->
    ${block(0,380,110,350,4,5,21,true)}${block(96,430,60,300,3,4,22,true)}${block(150,470,28,260,2,4,23,false)}<rect x="0" y="730" width="120" height="70" fill="var(--hill2)"/>
    <!-- дома справа -->
    ${block(290,380,110,350,4,5,31,true)}${block(244,430,60,300,3,4,32,true)}${block(222,470,28,260,2,4,33,false)}<rect x="280" y="730" width="120" height="70" fill="var(--hill2)"/>
    <!-- деревья и фонари вдоль тротуаров -->
    ${tree(130,560,1.1,"var(--accent)")}${tree(270,560,1.1,"var(--amber)")}${tree(160,520,.7,"var(--accent-deep)")}${tree(240,520,.7,"var(--accent)")}
    <g class="lamp"><rect x="140" y="600" width="3" height="60" fill="var(--hill2)"/><circle cx="141.5" cy="598" r="4" fill="var(--leaf)"/><circle cx="141.5" cy="598" r="26" fill="url(#glow)"/></g>
    <g class="lamp"><rect x="257" y="600" width="3" height="60" fill="var(--hill2)"/><circle cx="258.5" cy="598" r="4" fill="var(--leaf)"/><circle cx="258.5" cy="598" r="26" fill="url(#glow)"/></g>
    <g class="lamp"><rect x="112" y="700" width="4" height="70" fill="var(--hill2)"/><circle cx="114" cy="697" r="5" fill="var(--leaf)"/><circle cx="114" cy="697" r="34" fill="url(#glow)"/></g>
    <g class="lamp"><rect x="284" y="700" width="4" height="70" fill="var(--hill2)"/><circle cx="286" cy="697" r="5" fill="var(--leaf)"/><circle cx="286" cy="697" r="34" fill="url(#glow)"/></g>
    <!-- прохожие: идут по тротуарам, заходят в магазины и выходят -->
    ${person(0,742,1.1,"walker","--t:22s;--d:0s;--from:-30px;--to:150px")}
    ${person(0,738,1.0,"walker","--t:26s;--d:-9s;--from:150px;--to:-30px")}
    ${person(0,742,1.1,"walker","--t:24s;--d:-4s;--from:430px;--to:250px")}
    ${person(0,740,1.0,"walker","--t:28s;--d:-15s;--from:250px;--to:430px")}
    ${person(55,730,1.0,"enter","--t:14s;--d:-3s")}
    ${person(345,730,1.0,"exit","--t:16s;--d:-7s")}
    ${person(126,730,.85,"enter","--t:18s;--d:-11s")}
    ${person(274,730,.85,"exit","--t:15s;--d:-2s")}
    ${person(30,760,1.0,"walker","--t:30s;--d:-6s;--from:0px;--to:90px")}${person(300,760,1.0,"walker","--t:27s;--d:-12s;--from:80px;--to:-10px")}
    <g class="day">${person(0,744,1.05,"walker","--t:20s;--d:-13s;--from:160px;--to:-30px")}${person(0,744,.95,"walker","--t:23s;--d:-7s;--from:240px;--to:430px")}${person(200,730,.9,"enter","--t:12s;--d:-5s")}${person(60,760,1.0,"walker","--t:25s;--d:-18s;--from:60px;--to:-20px")}</g>
    ${leavesSvg(12, 3)}</svg>`,
  village: () => `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice">${skyDefs}
    <rect width="400" height="800" fill="url(#sky)"/>${stars(5)}${moon(70,110,14)}${dayClouds(9)}${birds(12,4)}
    <path d="M0 540Q120 500 240 530T400 500V800H0z" fill="var(--hill3)"/>
    <path d="M0 610Q140 570 400 600V800H0z" fill="var(--hill2)"/>
    ${tree(330,600,2.2,"var(--accent)")}${tree(50,610,1.5,"var(--amber)")}
    <g transform="translate(200 660)"><path d="M-52 0v-40l52-36 52 36V0z" fill="var(--hill1)"/><path d="M-60-36l60-44 60 44" fill="none" stroke="var(--accent-deep)" stroke-width="5"/>${win(-34,-30,14,16,0)}${win(-8,-30,16,16,1.1)}${win(20,-30,14,16,2.2)}<rect x="-20" y="-8" width="16" height="8" fill="var(--accent-deep)"/><rect x="22" y="-84" width="12" height="26" fill="var(--hill1)"/>
      <g class="smoke"><circle cx="28" cy="-92" r="5" fill="var(--muted)" style="--d:0s"/><circle cx="28" cy="-92" r="6" fill="var(--muted)" style="--d:1.6s"/><circle cx="28" cy="-92" r="4" fill="var(--muted)" style="--d:3.2s"/></g></g>
    <g fill="var(--hill1)"><rect x="0" y="672" width="400" height="128"/></g>
    <g stroke="var(--hill2)" stroke-width="3"><path d="M20 690v-24M50 690v-24M80 690v-24M110 690v-24M290 690v-24M320 690v-24M350 690v-24M380 690v-24M10 676h110M280 676h110"/></g>
    <g fill="var(--accent-deep)"><ellipse cx="300" cy="700" rx="28" ry="16"/><ellipse cx="350" cy="705" rx="22" ry="13"/></g>
    ${leavesSvg(12, 7)}</svg>`,
  // Море: пляж, чайки, краб, дельфин, костёр у хижины
  sea: () => `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice">${skyDefs}
    <rect width="400" height="800" fill="url(#sky)"/>${stars(8)}${moon(300,150,22)}${dayClouds(14)}
    <g class="gull" style="--t:34s;--d:0s;--y:180px"><path d="M0 0q6-6 12 0q6-6 12 0" fill="none" stroke="var(--moon)" stroke-width="2" opacity=".8"/></g>
    <g class="gull" style="--t:41s;--d:-14s;--y:230px"><path d="M0 0q5-5 10 0q5-5 10 0" fill="none" stroke="var(--moon)" stroke-width="1.6" opacity=".7"/></g>
    <g class="gull" style="--t:29s;--d:-22s;--y:150px"><path d="M0 0q4-4 8 0q4-4 8 0" fill="none" stroke="var(--moon)" stroke-width="1.4" opacity=".6"/></g>
    <rect x="0" y="450" width="400" height="350" fill="url(#water)"/>
    <path class="glint" d="M270 460h60M282 478h36M290 496h20" stroke="var(--amber)" stroke-width="2" opacity=".6"/>
    <g class="wave w1"><path d="M-80 490q20-8 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0v300H-80z" fill="var(--water)" opacity=".9"/></g>
    <g class="dolphin"><path d="M0 0c10-14 30-16 40-4-6-2-12 0-16 4 8 0 14 6 14 12-10-6-22-6-38-4z" fill="var(--hill1)"/></g>
    <g class="boat"><path d="M320 575l8 14h40l8-14z" fill="var(--hill1)"/><rect x="345" y="543" width="2" height="32" fill="var(--hill1)"/><path d="M347 545l22 26h-22z" fill="var(--accent)"/></g>
    <g class="wave w2"><path d="M-80 560q20-10 40 0t40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0 40 0v240H-80z" fill="var(--hill3)" opacity=".95"/></g>
    <!-- пляж -->
    <path d="M0 640Q100 600 220 630T400 610V800H0z" fill="var(--sand)"/>
    <path class="foam" d="M0 642Q100 602 220 632T400 612" fill="none" stroke="var(--moon)" stroke-width="3" opacity=".5"/>
    <g fill="var(--hill2)" opacity=".7"><ellipse cx="60" cy="700" rx="14" ry="4"/><ellipse cx="330" cy="720" rx="10" ry="3"/><ellipse cx="210" cy="690" rx="8" ry="3"/></g>
    <path d="M300 650l40-6 6 8-42 8z" fill="var(--hill2)"/>
    <g class="crab"><g fill="var(--accent)"><ellipse cx="0" cy="0" rx="9" ry="6"/><circle cx="-4" cy="-6" r="2"/><circle cx="4" cy="-6" r="2"/><path d="M-9 2l-6 3M-8-2l-7 0M9 2l6 3M8-2l7 0M-11-5l-4-4M11-5l4-4" stroke="var(--accent)" stroke-width="2"/></g></g>
    <!-- хижина на сваях и костёр -->
    <g transform="translate(110 640)"><rect x="-30" y="-6" width="8" height="40" fill="var(--hill1)"/><rect x="22" y="-6" width="8" height="40" fill="var(--hill1)"/><path d="M-36 0v-30l36-24 36 24V0z" fill="var(--hill1)"/><path d="M-42-28l42-30 42 30" fill="none" stroke="var(--accent-deep)" stroke-width="4"/>${win(-10,-22,20,16,0)}<rect x="-70" y="0" width="140" height="6" fill="var(--hill1)"/><path d="M-70 6l-10 10h20z" fill="var(--hill1)"/></g>
    <g transform="translate(215 715)"><circle class="firelight" cx="0" cy="-8" r="34" fill="url(#fire)"/><path d="M-10 0l4-6 4 6 4-6 4 6z" fill="var(--hill1)"/><path class="flame" d="M0-2c-6-6-6-14 0-20 0 6 4 8 4 12 2-4 4-6 4-10 4 8 2 16-8 18z" fill="var(--accent)"/><path class="flame" style="--d:-.4s" d="M0-3c-3-4-3-8 0-12 0 4 3 5 3 8 3-5 1-9-3-12" fill="var(--leaf)"/></g>
    ${person(190,732,.9,"sit","")}
    ${tree(40,660,1.3,"var(--accent-deep)")}${tree(370,668,1.1,"var(--accent)")}
    ${leavesSvg(8, 11)}</svg>`,
  // Горы: дальние хребты, лес, водопад под мостом, орёл, облако
  mountain: () => `<svg viewBox="0 0 400 800" preserveAspectRatio="xMidYMax slice">${skyDefs}
    <defs><clipPath id="fallClip"><path d="M184 616h32l10 184H172z"/></clipPath></defs>
    <rect width="400" height="800" fill="url(#sky)"/>${stars(11)}${moon(90,130,16)}${dayClouds(19)}${birds(21,3)}
    <g class="eagle"><path d="M0 0q-8-8-16-2 4 0 8 3-4 1-8 5 8-4 16 0 8-4 16 0-4-4-8-5 4-3 8-3-8-6-16 2z" fill="var(--hill1)"/></g>
    <!-- дальний хребет; шапки повторяют наклон склонов каждой вершины -->
    <path d="M0 470L70 340l50 60 60-120 70 110 50-70 60 100 40-50v330H0z" fill="var(--hill3)"/>
    <g fill="var(--moon)" opacity=".55">
      <path d="M180 280L163 314l7-8 6 10 7-10 7 10 6-8 5.6 6z"/>
      <path d="M70 340L55 368l7-6 6 8 7-8 6 8 6-6 6 4z"/>
      <path d="M300 320L280 348l7-6 6 8 7-8 6 8 6-6 4.8 4z"/>
    </g>
    <g class="cloud"><ellipse cx="0" cy="0" rx="46" ry="12" fill="var(--moon)" opacity=".18"/><ellipse cx="-12" cy="-8" rx="22" ry="12" fill="var(--moon)" opacity=".18"/><ellipse cx="16" cy="-6" rx="18" ry="10" fill="var(--moon)" opacity=".18"/></g>
    <!-- средний хребет -->
    <path d="M0 560l60-90 60 70 60-110 70 120 60-80 90 110v220H0z" fill="var(--hill2)"/>
    <path d="M180 430L166 456l6-5 5 7 6-7 5 7 6-5 6 4z" fill="var(--moon)" opacity=".4"/>
    <g>${[20,50,80,110,140,300,330,360,390].map((x,k)=>pine(x, 585+(k%3)*8, .8+(k%3)*.15, "var(--hill1)")).join("")}</g>
    <!-- ущелье: скалы по бокам, водопад между ними -->
    <path d="M148 618q52 8 104 0V800H148z" fill="var(--hill2)"/>
    <g clip-path="url(#fallClip)">
      <path d="M184 616h32l10 184H172z" fill="var(--water)"/>
      <path d="M190 616h20l6 184H184z" fill="var(--moon)" opacity=".22"/>
      <g stroke="var(--moon)" stroke-linecap="round">
        ${(()=>{ const r=rng(17); return Array.from({length:7},(_,k)=>{ const x=186+Math.round(r()*28), len=14+Math.round(r()*34), w=(1.2+r()*1.6).toFixed(1), t=(6.5+r()*4).toFixed(1), d=(-r()*10).toFixed(1); return `<path class="streak" style="--t:${t}s;--d:${d}s" stroke-width="${w}" d="M${x} ${590-len}v${len}"/>`; }).join(""); })()}
      </g>
    </g>
    <path d="M0 640l40-60 40 30 30-50 30 60V800H0z" fill="var(--hill1)"/>
    <path d="M400 640l-50-70-40 40-30-50-40 70V800h160z" fill="var(--hill1)"/>
    <g class="mist"><ellipse cx="200" cy="792" rx="46" ry="12" fill="var(--moon)" opacity=".25"/><ellipse cx="184" cy="784" rx="22" ry="9" fill="var(--moon)" opacity=".2"/><ellipse cx="220" cy="786" rx="26" ry="10" fill="var(--moon)" opacity=".2"/></g>
    <!-- подвесной мост над ущельем -->
    <g class="bridge"><path d="M140 618q60 22 120 0" fill="none" stroke="var(--accent-deep)" stroke-width="4"/><path d="M140 600q60 26 120 0" fill="none" stroke="var(--muted)" stroke-width="1.5"/><g stroke="var(--muted)" stroke-width="1.2"><path d="M155 606v12M170 610v13M185 613v14M200 614v15M215 613v14M230 610v13M245 606v12"/></g></g>
    <rect x="136" y="596" width="5" height="28" fill="var(--hill2)"/><rect x="259" y="596" width="5" height="28" fill="var(--hill2)"/>
    <g transform="translate(70 620)"><path d="M-20 0v-20l20-14 20 14V0z" fill="var(--hill2)"/><path d="M-24-18l24-17 24 17" fill="none" stroke="var(--accent-deep)" stroke-width="3"/>${win(-6,-14,12,10,0)}<rect x="8" y="-34" width="5" height="10" fill="var(--hill2)"/><g class="smoke"><circle cx="10" cy="-40" r="3" fill="var(--muted)" style="--d:0s"/><circle cx="10" cy="-40" r="4" fill="var(--muted)" style="--d:2s"/></g></g>
    ${pine(30,660,1.3,"var(--hill2)")}${pine(60,672,1.0,"var(--hill2)")}${pine(370,670,1.4,"var(--hill2)")}${pine(340,680,1.0,"var(--hill2)")}
    ${tree(100,690,1.1,"var(--accent)")}${tree(310,700,1.0,"var(--amber)")}
    ${leavesSvg(10, 5)}</svg>`,
};
