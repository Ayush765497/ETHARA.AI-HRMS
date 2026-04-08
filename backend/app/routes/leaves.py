from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.leave import Leave, LeaveType, LeaveBalance
from app.models.employee import Employee
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from functools import wraps
from datetime import date


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


leaves_bp = Blueprint('leaves', __name__)


def success_response(data, message="Success"):
    return jsonify({"status": "success", "data": data, "message": message})


def error_response(message, status_code=400):
    return jsonify({"status": "error", "data": {}, "message": message}), status_code


@leaves_bp.route('/types', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_leave_types():
    types = LeaveType.query.all()
    return success_response([t.to_dict() for t in types])


@leaves_bp.route('/types', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_leave_type():
    data = request.get_json()
    lt = LeaveType(name=data['name'], total_days=data.get(
        'total_days', 20), description=data.get('description'))
    db.session.add(lt)
    db.session.commit()
    return success_response(lt.to_dict()), 201


@leaves_bp.route('/balance/<int:employee_id>', methods=['GET'])
@jwt_required()
def get_balance(employee_id):
    claims = get_jwt() or {}
    if claims.get('role') == 'employee':
        current_user = db.session.get(User, int(get_jwt_identity()))
        if not current_user or not current_user.employee_id:
            return error_response('Employee information not found', 404)
        employee_id = current_user.employee_id
    year = request.args.get('year', date.today().year, type=int)
    balances = LeaveBalance.query.filter_by(
        employee_id=employee_id, year=year).all()
    # Also include leave types with 0 used
    leave_types = LeaveType.query.all()
    result = []
    for lt in leave_types:
        bal = next((b for b in balances if b.leave_type_id == lt.id), None)
        result.append({
            'leave_type': lt.name,
            'leave_type_id': lt.id,
            'total_days': bal.total_days if bal else lt.total_days,
            'used_days': bal.used_days if bal else 0,
            'remaining_days': bal.remaining_days if bal else lt.total_days,
        })
    return success_response(result)


@leaves_bp.route('/', methods=['GET'])
@jwt_required()
def get_leaves():
    employee_id = request.args.get('employee_id', type=int)
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    claims = get_jwt() or {}
    if claims.get('role') == 'employee':
        current_user = db.session.get(User, int(get_jwt_identity()))
        if not current_user or not current_user.employee_id:
            return error_response('Employee information not found', 404)
        employee_id = current_user.employee_id
    query = Leave.query
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    if status:
        query = query.filter_by(status=status)
    total = query.count()
    leaves = query.order_by(Leave.created_at.desc()).offset(
        (page-1)*20).limit(20).all()
    return success_response({"leaves": [l.to_dict() for l in leaves], "total": total, "page": page})


@leaves_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('employee')
def apply_leave():
    data = request.get_json() or {}
    current_user = db.session.get(User, int(get_jwt_identity()))
    if not current_user or not current_user.employee_id:
        return error_response('Employee information not found', 404)
    employee_id = data.get('employee_id', current_user.employee_id)
    if employee_id != current_user.employee_id:
        employee_id = current_user.employee_id
    required = ['leave_type_id', 'start_date', 'end_date']
    for f in required:
        if not data.get(f):
            return error_response(f"{f} is required")
    leave = Leave(
        employee_id=employee_id, leave_type_id=data['leave_type_id'],
        start_date=date.fromisoformat(data['start_date']),
        end_date=date.fromisoformat(data['end_date']),
        duration=data.get('duration'),
        resumption_date=date.fromisoformat(
            data['resumption_date']) if data.get('resumption_date') else None,
        reason=data.get('reason'), relief_officer_id=data.get('relief_officer_id'),
        handover_document=data.get('handover_document')
    )
    db.session.add(leave)
    db.session.commit()
    return success_response(leave.to_dict(), "Leave application submitted"), 201


@leaves_bp.route('/<int:leave_id>/approve', methods=['PUT'])
@jwt_required()
@role_required('admin')
def approve_leave(leave_id):
    user_id = int(get_jwt_identity())
    leave = Leave.query.get_or_404(leave_id)
    data = request.get_json()
    leave.status = data.get('status', 'approved')
    leave.admin_comment = data.get('comment', '')
    leave.approved_by = user_id
    # Update balance if approved
    if leave.status == 'approved':
        year = leave.start_date.year
        bal = LeaveBalance.query.filter_by(
            employee_id=leave.employee_id, leave_type_id=leave.leave_type_id, year=year).first()
        if not bal:
            lt = LeaveType.query.get(leave.leave_type_id)
            bal = LeaveBalance(employee_id=leave.employee_id, leave_type_id=leave.leave_type_id,
                               year=year, total_days=lt.total_days if lt else 0)
            db.session.add(bal)
        if bal and leave.duration:
            bal.used_days = (bal.used_days or 0) + leave.duration
            bal.remaining_days = bal.total_days - bal.used_days
    db.session.commit()
    return success_response(leave.to_dict(), f"Leave {leave.status}")


@leaves_bp.route('/<int:leave_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_leave(leave_id):
    leave = Leave.query.get_or_404(leave_id)
    db.session.delete(leave)
    db.session.commit()
    return success_response({}, "Deleted")
