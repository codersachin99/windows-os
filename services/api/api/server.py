"""
Entry point for Win7 Simulator Backend & Static Server.
Serves static assets, local mirror fallback, and JSON API endpoints.
"""

from http.server import ThreadingHTTPServer

from core.config import SERVER_HOST, SERVER_PORT, DB_PATH, STORAGE_DIR
from database.connection import initialize_database
from handlers.request_handler import SimuRequestHandler


def run_server():
    """Initializes database schema and starts the multi-threaded HTTP server."""
    initialize_database()

    print("=" * 65)
    print(" Win7 Simu Local Backend Server v3.0")
    print(f" URL:           http://{SERVER_HOST}:{SERVER_PORT}/")
    print(f" SQLite DB:     {DB_PATH}")
    print(f" Theme Storage: {STORAGE_DIR}")
    print("=" * 65)
    print("Press Ctrl+C to stop.")

    server_address = (SERVER_HOST, SERVER_PORT)
    http_server = ThreadingHTTPServer(server_address, SimuRequestHandler)
    try:
        http_server.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server cleanly...")
        http_server.server_close()


if __name__ == "__main__":
    run_server()
