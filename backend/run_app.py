"""Portable launcher for the Smart Asset Management Tool.

Starts the API (which also serves the built frontend) on 127.0.0.1, opens the
browser, and keeps the console open. This is the PyInstaller entry point.
Mirrors the Smart Commissioning Tool's portable model.
"""
import multiprocessing
import os
import sys
import threading
import time
import webbrowser


def _open_browser(url: str) -> None:
    time.sleep(1.5)
    try:
        webbrowser.open(url)
    except Exception:
        pass


def main() -> None:
    import uvicorn
    from app.main import app

    port = int(os.environ.get("SAM_PORT", "8000"))
    url = f"http://127.0.0.1:{port}/"
    if os.environ.get("SAM_NO_BROWSER") != "1":
        threading.Thread(target=_open_browser, args=(url,), daemon=True).start()
    print("=" * 56)
    print("  Smart Asset Management Tool")
    print(f"  Open: {url}")
    print("  Keep this window open. Press Ctrl+C to stop.")
    print("=" * 56)
    uvicorn.run(app, host="127.0.0.1", port=port, log_level="info")


if __name__ == "__main__":
    multiprocessing.freeze_support()
    main()
