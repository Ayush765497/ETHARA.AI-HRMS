from app.extensions import db
from datetime import datetime

class Payroll(db.Model):
    __tablename__ = 'payrolls'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    month = db.Column(db.Integer, nullable=False)
    year = db.Column(db.Integer, nullable=False)
    basic_salary = db.Column(db.Numeric(12, 2), default=0)
    allowances = db.Column(db.Numeric(12, 2), default=0)
    deductions = db.Column(db.Numeric(12, 2), default=0)
    tax = db.Column(db.Numeric(12, 2), default=0)
    pension = db.Column(db.Numeric(12, 2), default=0)
    net_salary = db.Column(db.Numeric(12, 2), default=0)
    status = db.Column(db.String(30), default='pending')  # pending, paid
    payment_date = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    employee = db.relationship('Employee', backref='payrolls', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'employee_id': self.employee_id,
            'employee_name': f"{self.employee.first_name} {self.employee.last_name}" if self.employee else None,
            'month': self.month, 'year': self.year,
            'basic_salary': float(self.basic_salary), 'allowances': float(self.allowances),
            'deductions': float(self.deductions), 'tax': float(self.tax),
            'pension': float(self.pension), 'net_salary': float(self.net_salary),
            'status': self.status,
            'payment_date': self.payment_date.isoformat() if self.payment_date else None,
        }
