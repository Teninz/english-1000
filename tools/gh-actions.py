"""Запуск и опрос workflow «Android APK» без gh: используется токен GitHub, который
Git Credential Manager сохранил после первого push. Токен не печатается.

  python tools/gh-actions.py dispatch <ветка>      запустить сборку и показать последние запуски
  python tools/gh-actions.py runs                  последние запуски
  python tools/gh-actions.py artifacts <run_id> <папка>   скачать и распаковать артефакты
  python tools/gh-actions.py publish-pack                  выложить клипы art/companion-v2 в релиз fox-pack-<версия>
                                                           (имена файлов: <лиса>__<клип>.webm, scene__<файл>.webm)
"""
import io
import json
import subprocess
import sys
import time
import urllib.request
import zipfile

REPO = "Teninz/english-1000"


def token():
    out = subprocess.run(["git", "credential", "fill"], input="protocol=https\nhost=github.com\n\n",
                         capture_output=True, text=True, check=True).stdout
    return dict(line.split("=", 1) for line in out.splitlines() if "=" in line)["password"]


def api(method, path, body=None, raw=False, upload=None):
    url = path if path.startswith("http") else f"https://api.github.com{path}"
    headers = {"Authorization": f"Bearer {token()}", "Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
    if upload is not None:
        data, headers["Content-Type"] = upload, "application/octet-stream"
    else:
        data, headers["Content-Type"] = (json.dumps(body).encode() if body else None), "application/json"
    req = urllib.request.Request(url, method=method, data=data, headers=headers)
    if raw:
        # Архив артефакта отдаётся редиректом на подписанную ссылку хранилища: туда токен GitHub передавать нельзя.
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *args, **kwargs):
                return None
        try:
            urllib.request.build_opener(NoRedirect).open(req)
        except urllib.error.HTTPError as e:
            if e.code not in (301, 302, 303, 307, 308):
                raise
            with urllib.request.urlopen(e.headers["Location"]) as r:
                return r.read()
        raise RuntimeError("ожидался редирект на архив артефакта")
    with urllib.request.urlopen(req) as r:
        data = r.read()
        return json.loads(data) if data else {"status": r.status}


def publish_pack():
    """Клипы набора уходят в релиз fox-pack-<версия>; тег не начинается с v, поэтому сборку APK не запускает."""
    from pathlib import Path
    root = Path(__file__).resolve().parent.parent
    pack = json.loads((root / "art" / "companion-v2" / "manifest.json").read_text(encoding="utf-8"))
    tag = f"fox-pack-{pack['version']}"
    sha = subprocess.run(["git", "rev-parse", "HEAD"], capture_output=True, text=True, check=True, cwd=root).stdout.strip()
    try:
        release = api("GET", f"/repos/{REPO}/releases/tags/{tag}")
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise
        release = api("POST", f"/repos/{REPO}/releases", {"tag_name": tag, "target_commitish": sha, "name": f"Набор анимаций лисы {pack['version']}",
                      "body": "Клипы компаньона для ShadowFox Eng: приложение скачивает их по кнопке в домике лисы. Не для установки вручную.", "prerelease": True})
    existing = {a["name"]: a for a in release.get("assets", [])}
    files = [p for p in (root / "art" / "companion-v2").rglob("*.webm")]
    for f in sorted(files):
        name = f.relative_to(root / "art" / "companion-v2").as_posix().replace("/", "__")
        if name in existing:
            if existing[name]["size"] == f.stat().st_size:
                print("skip", name); continue
            api("DELETE", f"/repos/{REPO}/releases/assets/{existing[name]['id']}")
        upload_url = release["upload_url"].split("{")[0] + f"?name={name}"
        for attempt in range(4):  # загрузка на uploads.github.com иногда отвечает 5xx — повторяем
            try:
                api("POST", upload_url, upload=f.read_bytes()); break
            except urllib.error.HTTPError as e:
                if e.code < 500 or attempt == 3:
                    raise
                time.sleep(3 * (attempt + 1))
        print("uploaded", name, f.stat().st_size // 1024, "KB")
    print("release:", release["html_url"])


def main():
    cmd = sys.argv[1]
    if cmd == "dispatch":
        print(api("POST", f"/repos/{REPO}/actions/workflows/android.yml/dispatches", {"ref": sys.argv[2]}))
        time.sleep(6)
        cmd = "runs"
    if cmd == "runs":
        for run in api("GET", f"/repos/{REPO}/actions/workflows/android.yml/runs?per_page=4")["workflow_runs"]:
            print(run["id"], run["status"], run["conclusion"], run["head_branch"], run["event"], run["created_at"], run["html_url"])
    if cmd == "publish-pack":
        publish_pack()
    if cmd == "artifacts":
        run_id, out_dir = sys.argv[2], sys.argv[3]
        for a in api("GET", f"/repos/{REPO}/actions/runs/{run_id}/artifacts")["artifacts"]:
            data = api("GET", f"/repos/{REPO}/actions/artifacts/{a['id']}/zip", raw=True)
            with zipfile.ZipFile(io.BytesIO(data)) as z:
                z.extractall(out_dir)
                print(a["name"], "->", out_dir, z.namelist())


if __name__ == "__main__":
    main()
