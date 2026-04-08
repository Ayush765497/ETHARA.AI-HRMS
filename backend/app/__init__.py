from flask import Flask
from app.config import Config
from app.extensions import db, jwt, socketio, migrate


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize core extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # CORS — allow all origins in development, specific in production
    from flask_cors import CORS
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Socket.IO — optional, skip if issues
    try:
        socketio.init_app(app, cors_allowed_origins="*",
                          async_mode='threading')
    except Exception:
        pass

    # Cloudinary — optional
    try:
        import cloudinary
        cloudinary.config(
            cloud_name=app.config.get('CLOUDINARY_CLOUD_NAME', ''),
            api_key=app.config.get('CLOUDINARY_API_KEY', ''),
            api_secret=app.config.get('CLOUDINARY_API_SECRET', '')
        )
    except Exception:
        pass

    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.employees import employees_bp
    from app.routes.attendance import attendance_bp
    from app.routes.leaves import leaves_bp
    from app.routes.recruitment import recruitment_bp
    from app.routes.performance import performance_bp
    from app.routes.payroll import payroll_bp
    from app.routes.documents import documents_bp
    # from app.routes.chat import chat_bp
    from app.routes.announcements import announcements_bp
    from app.routes.courses import courses_bp
    from app.routes.dashboard import dashboard_bp

    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(employees_bp, url_prefix='/employees')
    app.register_blueprint(attendance_bp, url_prefix='/attendance')
    app.register_blueprint(leaves_bp, url_prefix='/leaves')
    app.register_blueprint(recruitment_bp, url_prefix='/recruitment')
    app.register_blueprint(performance_bp, url_prefix='/performance')
    app.register_blueprint(payroll_bp, url_prefix='/payroll')
    app.register_blueprint(documents_bp, url_prefix='/documents')
    # app.register_blueprint(chat_bp, url_prefix='/chat')
    app.register_blueprint(announcements_bp, url_prefix='/announcements')
    app.register_blueprint(courses_bp, url_prefix='/courses')
    app.register_blueprint(dashboard_bp, url_prefix='/dashboard')

    # Health check
    @app.route('/')
    def health():
        return {'status': 'Next AI HRMS API running', 'version': '1.0.0'}

    # Import models so SQLAlchemy knows about them
    with app.app_context():
        from app.models import user, employee, attendance, leave, recruitment, performance, payroll, document,  announcement, course
        db.create_all()  # Auto-create tables on startup

    return app
