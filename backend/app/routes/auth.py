from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.user import User
from app.models.employee import Employee
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request, get_jwt
from functools import wraps


def role_required(role):
    def wrapper(fn):
        @wraps(fn)
        def decorated(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt() or {}
            if claims.get('role') != role:
                return jsonify({'status': 'error', 'data': {}, 'message': 'Unauthorized access'}), 403
            return fn(*args, **kwargs)
        return decorated
    return wrapper


auth_bp = Blueprint('auth', __name__)


def success(data, message="Success", code=200):
    return jsonify({"status": "success", "data": data, "message": message}), code


def error(message, code=400):
    return jsonify({"status": "error", "data": {}, "message": message}), code


# ------------------------------------------------------------------
# POST /auth/signup  (alias: /auth/register)
# ------------------------------------------------------------------
@auth_bp.route('/signup', methods=['POST'])
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''
    name = data.get('name') or data.get('first_name') or ''

    if not email or not password:
        return error("Email and password are required")
    if len(password) < 6:
        return error("Password must be at least 6 characters")
    if User.query.filter_by(email=email).first():
        return error("An account with this email already exists")

    user = User(email=email, role=data.get('role', 'employee'))
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(
        user.id), additional_claims={'role': user.role})
    return success({"token": token, "user": user.to_dict()}, "Account created successfully", 201)


# ------------------------------------------------------------------
# POST /auth/login
# ------------------------------------------------------------------
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return error("Email and password are required")

    user = User.query.filter_by(email=email).first()
    if not user:
        return error("No account found with this email", 401)
    if not user.check_password(password):
        return error("Incorrect password", 401)
    if not user.is_active:
        return error("This account has been deactivated", 403)

    token = create_access_token(identity=str(
        user.id), additional_claims={'role': user.role})
    return success({"token": token, "user": user.to_dict()}, "Login successful")


# ------------------------------------------------------------------
# GET /auth/me
# ------------------------------------------------------------------
@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return error("User not found", 404)
    data = user.to_dict()
    if user.employee_id:
        emp = db.session.get(Employee, user.employee_id)
        if emp:
            data['employee'] = emp.to_dict()
    return success(data)


# ------------------------------------------------------------------
# PUT /auth/change-password
# ------------------------------------------------------------------
@auth_bp.route('/change-password', methods=['PUT'])
@jwt_required()
def change_password():
    user_id = int(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return error("User not found", 404)
    data = request.get_json(silent=True) or {}
    if not user.check_password(data.get('current_password', '')):
        return error("Current password is incorrect")
    new_pw = data.get('new_password', '')
    if len(new_pw) < 6:
        return error("New password must be at least 6 characters")
    user.set_password(new_pw)
    db.session.commit()
    return success({}, "Password changed successfully")
