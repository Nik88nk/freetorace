"""Ponte della demo online: nel browser (Pyodide) risponde alle chiamate /api/* della pagina
usando il motore vero di f1cruscotto, senza server. I file li prepara strumenti/demo.py."""
import json
import threading
import time
import urllib.parse
from datetime import timedelta

threading.Thread.start = lambda self: None   # nel browser niente thread: il replay avanza a ogni richiesta

import f1cruscotto as f

FOLDER = "/data/race"
with open("/data/circuit.json", encoding="utf-8") as fh:
    CIRCUIT = json.load(fh)
f.SOURCE = f.Replay(FOLDER)
_last = time.monotonic()


def _step():
    global _last
    now = time.monotonic()
    dt, _last = now - _last, now
    r = f.SOURCE
    if r.paused:
        return
    with r.lk:
        r.vt = min(r.t1, r.vt + timedelta(seconds=dt * r.speed))
        r._advance()


def _route(path, body):
    global _last
    u = urllib.parse.urlparse(path)
    if f.ENGINE.cal is None:              # il riavvio del replay azzera la taratura
        f.ENGINE.cal = CIRCUIT["cal"]
    if u.path == "/api/state":
        _step()
        snap = f.ENGINE.snapshot()
        snap["source"] = f.SOURCE.info()
        snap["calStatus"] = "pronta"
        return snap
    if u.path == "/api/history":
        return f.ENGINE.history()
    if u.path == "/api/circuit":
        return CIRCUIT
    if u.path == "/api/setup":
        return {"askShortcut": False}
    if u.path == "/api/sessions":
        return [{"name": f.SOURCE.name, "path": FOLDER, "origin": "demo", "mtime": time.time()}]
    if u.path == "/api/calendar":
        return []
    if u.path in ("/api/play", "/api/ctl"):
        s = f.SOURCE
        a = body.get("action")
        if a == "pause":
            s.paused = not s.paused
        elif a == "speed":
            s.speed = float(body["value"])
        elif a == "seek":
            s.seek(body["value"])
        _last = time.monotonic()
        return s.info()
    return {"error": "non disponibile nella demo"}


def handle(path, body=""):
    try:
        return json.dumps(_route(path, json.loads(body) if body else {}))
    except Exception as e:
        return json.dumps({"error": repr(e)})
