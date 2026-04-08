from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.payroll import Payroll
from app.models.employee import Employee
from flask_jwt_extended import jwt_required
from datetime import datetime

payroll_bp = Blueprint('payroll', __name__)

def success_response(data, message="Success"):
    return jsonify({"status": "success", "data": data, "message": message})

@payroll_bp.route('/', methods=['GET'])
@jwt_required()
def get_payrolls():
    month = request.args.get('month', type=int)
    year = request.args.get('year', type=int)
    employee_id = request.args.get('employee_id', type=int)
    query = Payroll.query
    if month:
        query = query.filter_by(month=month)
    if year:
        query = query.filter_by(year=year)
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    payrolls = query.order_by(Payroll.year.desc(), Payroll.month.desc()).all()
    return success_response([p.to_dict() for p in payrolls])

@payroll_bp.route('/', methods=['POST'])
@jwt_required()
def create_payroll():
    data = request.get_json()
    payroll = Payroll(
        employee_id=data['employee_id'], month=data['month'], year=data['year'],
        basic_salary=data.get('basic_salary', 0), allowances=data.get('allowances', 0),
        deductions=data.get('deductions', 0), tax=data.get('tax', 0),
        pension=data.get('pension', 0), net_salary=data.get('net_salary', 0)
    )
    db.session.add(payroll)
    db.session.commit()
    return success_response(payroll.to_dict()), 201

@payroll_bp.route('/<int:payroll_id>/mark-paid', methods=['PUT'])
@jwt_required()
def mark_paid(payroll_id):
    payroll = Payroll.query.get_or_404(payroll_id)
    payroll.status = 'paid'
    payroll.payment_date = datetime.utcnow()
    db.session.commit()
    return success_response(payroll.to_dict(), "Marked as paid")

@payroll_bp.route('/generate', methods=['POST'])
@jwt_required()
def generate_payroll():
    """Auto-generate payroll for all employees for a given month/year"""
    data = request.get_json()
    month, year = data['month'], data['year']
    employees = Employee.query.filter_by(is_deleted=False).all()
    created = []
    for emp in employees:
        existing = Payroll.query.filter_by(employee_id=emp.id, month=month, year=year).first()
        if not existing:
            basic = float(emp.salary or 0)
            tax = round(basic * 0.1, 2)
            pension = round(basic * 0.08, 2)
            net = round(basic - tax - pension, 2)
            p = Payroll(employee_id=emp.id, month=month, year=year,
                        basic_salary=basic, tax=tax, pension=pension, net_salary=net)
            db.session.add(p)
            created.append(emp.id)
    db.session.commit()
    return success_response({"generated": len(created)}, f"Generated payroll for {len(created)} employees")
