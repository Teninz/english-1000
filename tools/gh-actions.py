"""Запуск и опрос workflow «Android APK» без gh: используется токен GitHub, который
Git Credential Manager сохранил после первого push. Токен не печатается.

  python tools/gh-actions.py dispatch <ветка>      запустить сборку и показать последние запуски
  python tools/gh-actions.py runs                  последние запуски
  python tools/gh-actions.py artifacts <run_id> <папка>   скачать и распаковать артефакты
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


def api(method, path, body=None, raw=False):
    req = urllib.request.Request(
        f"https://api.github.com{path}", method=method,
        data=json.dumps(body).encode() if body else None,
        headers={"Authorization": f"Bearer {token()}", "Accept": "application/vnd.github+json",
                 "X-GitHub-Api-Version": "2022-11-28", "Content-Type": "application/json"})
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


def main():
    cmd = sys.argv[1]
    if cmd == "dispatch":
        print(api("POST", f"/repos/{REPO}/actions/workflows/android.yml/dispatches", {"ref": sys.argv[2]}))
        time.sleep(6)
        cmd = "runs"
    if cmd == "runs":
        for run in api("GET", f"/repos/{REPO}/actions/workflows/android.yml/runs?per_page=4")["workflow_runs"]:
            print(run["id"], run["status"], run["conclusion"], run["head_branch"], run["event"], run["created_at"], run["html_url"])
    if cmd == "artifacts":
        run_id, out_dir = sys.argv[2], sys.argv[3]
        for a in api("GET", f"/repos/{REPO}/actions/runs/{run_id}/artifacts")["artifacts"]:
            data = api("GET", f"/repos/{REPO}/actions/artifacts/{a['id']}/zip", raw=True)
            with zipfile.ZipFile(io.BytesIO(data)) as z:
                z.extractall(out_dir)
                print(a["name"], "->", out_dir, z.namelist())


if __name__ == "__main__":
    main()
