import logging
from sqlalchemy import or_
from flask import request
from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.employee import Employee, Department
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from functools import wraps


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


employees_bp = Blueprint('employees', __name__)


def success_response(data, message="Success"):
    return jsonify({"status": "success", "data": data, "message": message})


def error_response(message, status_code=400):
    return jsonify({"status": "error", "data": {}, "message": message}), status_code


@employees_bp.route('/', methods=['GET'])
@jwt_required()
@role_required("admin")
def get_employees():
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    search = request.args.get('search', '')
    department_id = request.args.get('department_id', type=int)

    query = Employee.query.filter_by(is_deleted=False)

    if search:
        query = query.filter(
            or_(Employee.first_name.ilike(f'%{search}%'),
                Employee.last_name.ilike(f'%{search}%'),
                Employee.email.ilike(f'%{search}%'))
        )

    if department_id:
        query = query.filter_by(department_id=department_id)

    total = query.count()

    employees = query.offset((page - 1) * per_page).limit(per_page).all()

    logging.warning(f"Fetched {len(employees)} employees")

    return success_response({
        "employees": [e.to_dict() for e in employees],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page
    })


@employees_bp.route('/<int:emp_id>', methods=['GET'])
@jwt_required()
def get_employee(emp_id):
    claims = get_jwt()
    if claims.get('role') == 'employee':
        user_id = int(get_jwt_identity())
        from app.models.user import User
        user = db.session.get(User, user_id)
        if not user or user.employee_id != emp_id:
            return error_response('Unauthorized access', 403)
    emp = Employee.query.filter_by(id=emp_id, is_deleted=False).first_or_404()
    return success_response(emp.to_dict())


@employees_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_employee():
    data = request.get_json()
    if not data.get('first_name') or not data.get('last_name') or not data.get('email'):
        return error_response("First name, last name and email are required")
    if Employee.query.filter_by(email=data['email'], is_deleted=False).first():
        return error_response("Email already exists")
    emp = Employee(
        first_name=data['first_name'], last_name=data['last_name'], email=data['email'],
        phone_number=data.get('phone_number'), phone_number_2=data.get('phone_number_2'),
        department_id=data.get('department_id'), job_title=data.get('job_title'),
        job_category=data.get('job_category'), city=data.get('city'),
        residential_address=data.get('residential_address'), gender=data.get('gender'),
        date_of_birth=data.get('date_of_birth'), salary=data.get('salary', 0),
    )
    db.session.add(emp)
    db.session.commit()
    return success_response(emp.to_dict(), "Employee created successfully"), 201


@employees_bp.route('/<int:emp_id>', methods=['PUT'])
@jwt_required()
@role_required('admin')
def update_employee(emp_id):
    emp = Employee.query.filter_by(id=emp_id, is_deleted=False).first_or_404()
    data = request.get_json()
    fields = [
        'first_name', 'last_name', 'email', 'phone_number', 'phone_number_2',
        'department_id', 'job_title', 'job_category', 'city', 'residential_address',
        'gender', 'profile_image', 'next_of_kin_name', 'next_of_kin_phone',
        'next_of_kin_relationship', 'highest_qualification', 'institution', 'graduation_year',
        'guarantor_name', 'guarantor_occupation', 'guarantor_phone', 'marital_status',
        'spouse_name', 'number_of_children', 'bank_name', 'account_number', 'account_name', 'salary'
    ]
    for field in fields:
        if field in data:
            setattr(emp, field, data[field])
    if 'date_of_birth' in data and data['date_of_birth']:
        from datetime import date
        emp.date_of_birth = date.fromisoformat(data['date_of_birth'])
    if 'employment_date' in data and data['employment_date']:
        from datetime import date
        emp.employment_date = date.fromisoformat(data['employment_date'])
    db.session.commit()
    return success_response(emp.to_dict(), "Employee updated successfully")


@employees_bp.route('/<int:emp_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_employee(emp_id):
    print(f"Fetching data for user: {emp_id}")
    emp = Employee.query.filter_by(id=emp_id, is_deleted=False).first_or_404()
    emp.is_deleted = True
    db.session.commit()
    return success_response({}, "Employee deleted successfully")

# Departments


@employees_bp.route('/departments', methods=['GET'])
@jwt_required()
def get_departments():
    depts = Department.query.all()
    return success_response([d.to_dict() for d in depts])


@employees_bp.route('/departments', methods=['POST'])
@jwt_required()
def create_department():
    data = request.get_json()
    dept = Department(name=data['name'], description=data.get('description'))
    db.session.add(dept)
    db.session.commit()
    return success_response(dept.to_dict(), "Department created"), 201
