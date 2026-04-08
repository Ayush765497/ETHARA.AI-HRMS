from app import create_app
from app.extensions import socketio

app = create_app()

if __name__ == '__main__':
    print("=" * 50)
    print("  Next AI HRMS Backend Starting...")
    print("  URL: http://localhost:5000")
    print("  DB:  SQLite (hrms.db) - no PostgreSQL needed")
    print("=" * 50)
    # Use socketio.run to handle Socket.IO, but fall back to app.run if issues
    try:
        socketio.run(app, debug=True, host='0.0.0.0',
                     port=5000, allow_unsafe_werkzeug=True)
    except Exception:
        app.run(debug=True, host='0.0.0.0', port=5000)
