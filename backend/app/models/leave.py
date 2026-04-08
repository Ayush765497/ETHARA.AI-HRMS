from app.extensions import db
from datetime import datetime

class LeaveType(db.Model):
    __tablename__ = 'leave_types'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)  # Annual, Sick, Maternity, Casual
    total_days = db.Column(db.Integer, default=20)
    description = db.Column(db.Text)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'total_days': self.total_days, 'description': self.description}

class LeaveBalance(db.Model):
    __tablename__ = 'leave_balances'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    leave_type_id = db.Column(db.Integer, db.ForeignKey('leave_types.id'), nullable=False)
    year = db.Column(db.Integer, nullable=False)
    total_days = db.Column(db.Integer, default=0)
    used_days = db.Column(db.Integer, default=0)
    remaining_days = db.Column(db.Integer, default=0)

    employee = db.relationship('Employee', backref='leave_balances', lazy=True)
    leave_type = db.relationship('LeaveType', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'leave_type': self.leave_type.name if self.leave_type else None,
            'total_days': self.total_days,
            'used_days': self.used_days,
            'remaining_days': self.remaining_days,
            'year': self.year
        }

class Leave(db.Model):
    __tablename__ = 'leaves'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    leave_type_id = db.Column(db.Integer, db.ForeignKey('leave_types.id'), nullable=False)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    resumption_date = db.Column(db.Date)
    duration = db.Column(db.Integer)
    reason = db.Column(db.Text)
    relief_officer_id = db.Column(db.Integer, db.ForeignKey('employees.id'))
    handover_document = db.Column(db.String(255))
    status = db.Column(db.String(30), default='pending')  # pending, approved, rejected, recalled
    admin_comment = db.Column(db.Text)
    approved_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    employee = db.relationship('Employee', foreign_keys=[employee_id], backref='leaves', lazy=True)
    relief_officer = db.relationship('Employee', foreign_keys=[relief_officer_id], lazy=True)
    leave_type = db.relationship('LeaveType', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'employee_id': self.employee_id,
            'employee_name': f"{self.employee.first_name} {self.employee.last_name}" if self.employee else None,
            'department': self.employee.department_rel.name if self.employee and self.employee.department_rel else None,
            'leave_type': self.leave_type.name if self.leave_type else None,
            'leave_type_id': self.leave_type_id,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'resumption_date': self.resumption_date.isoformat() if self.resumption_date else None,
            'duration': self.duration,
            'reason': self.reason,
            'relief_officer': f"{self.relief_officer.first_name} {self.relief_officer.last_name}" if self.relief_officer else None,
            'handover_document': self.handover_document,
            'status': self.status,
            'admin_comment': self.admin_comment,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
