from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from functools import wraps
from datetime import datetime, date


def role_required(role):
    def outer(fn):
        @wraps(fn)
        def inner(*args, **kwargs):
            claims = get_jwt()
            if claims.get('role') != role:
                return jsonify({'status': 'error', 'data': {}, 'message': 'Unauthorized access'}), 403
            return fn(*args, **kwargs)
        return inner
    return outer


attendance_bp = Blueprint('attendance', __name__)


def success_response(data, message="Success"):
    return jsonify({"status": "success", "data": data, "message": message})


@attendance_bp.route('/', methods=['GET'])
@jwt_required()
def get_attendance():
    employee_id = request.args.get('employee_id', type=int)
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 30, type=int)
    claims = get_jwt() or {}
    if claims.get('role') == 'employee':
        current_user = db.session.get(User, int(get_jwt_identity()))
        if not current_user or not current_user.employee_id:
            return jsonify({'status': 'error', 'data': {}, 'message': 'Employee record not found'}), 404
        employee_id = current_user.employee_id

    query = Attendance.query
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    if month and year:
        query = query.filter(db.extract('month', Attendance.date) == month,
                             db.extract('year', Attendance.date) == year)
    total = query.count()
    records = query.order_by(Attendance.date.desc()).offset(
        (page-1)*per_page).limit(per_page).all()
    return success_response({"records": [r.to_dict() for r in records], "total": total})


@attendance_bp.route('/mark', methods=['POST'])
@jwt_required()
@role_required('employee')
def mark_attendance():
    data = request.get_json() or {}
    employee_id = data.get('employee_id')
    current_user = db.session.get(User, int(get_jwt_identity()))
    if not current_user or not current_user.employee_id:
        return jsonify({'status': 'error', 'data': {}, 'message': 'Employee record not found'}), 404
    if employee_id and employee_id != current_user.employee_id:
        employee_id = current_user.employee_id
    if not employee_id:
        employee_id = current_user.employee_id
    today = date.today()
    existing = Attendance.query.filter_by(
        employee_id=employee_id, date=today).first()
    if existing:
        if not existing.check_out:
            existing.check_out = datetime.utcnow()
            db.session.commit()
            return success_response(existing.to_dict(), "Checked out successfully")
        return jsonify({"status": "error", "message": "Already marked today"}), 400
    record = Attendance(
        employee_id=employee_id, date=today,
        check_in=datetime.utcnow(), status=data.get('status', 'present')
    )
    db.session.add(record)
    db.session.commit()
    return success_response(record.to_dict(), "Checked in successfully"), 201


@attendance_bp.route('/<int:att_id>', methods=['PUT'])
@jwt_required()
def update_attendance(att_id):
    record = Attendance.query.get_or_404(att_id)
    data = request.get_json()
    for field in ['status', 'notes']:
        if field in data:
            setattr(record, field, data[field])
    db.session.commit()
    return success_response(record.to_dict(), "Updated successfully")
