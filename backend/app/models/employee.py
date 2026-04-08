from app.extensions import db
from datetime import datetime


class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    employees = db.relationship(
        'Employee', backref='department_rel', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'name': self.name, 'description': self.description}


class Employee(db.Model):
    __tablename__ = 'employees'
    id = db.Column(db.Integer, primary_key=True)
    # user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    phone_number = db.Column(db.String(20))
    phone_number_2 = db.Column(db.String(20))
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    job_title = db.Column(db.String(100))
    job_category = db.Column(db.String(100))  # Full time, Part time, Contract
    employment_date = db.Column(db.Date)
    date_of_birth = db.Column(db.Date)
    gender = db.Column(db.String(20))
    city = db.Column(db.String(100))
    residential_address = db.Column(db.Text)
    profile_image = db.Column(db.String(255))
    # Next of Kin
    next_of_kin_name = db.Column(db.String(100))
    next_of_kin_phone = db.Column(db.String(20))
    next_of_kin_relationship = db.Column(db.String(50))
    # Education
    highest_qualification = db.Column(db.String(100))
    institution = db.Column(db.String(150))
    graduation_year = db.Column(db.Integer)
    # Guarantor
    guarantor_name = db.Column(db.String(100))
    guarantor_occupation = db.Column(db.String(100))
    guarantor_phone = db.Column(db.String(20))
    # Family
    marital_status = db.Column(db.String(30))
    spouse_name = db.Column(db.String(100))
    number_of_children = db.Column(db.Integer, default=0)
    # Financial
    bank_name = db.Column(db.String(100))
    account_number = db.Column(db.String(50))
    account_name = db.Column(db.String(100))
    salary = db.Column(db.Numeric(12, 2), default=0)
    is_deleted = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'email': self.email,
            'phone_number': self.phone_number,
            'phone_number_2': self.phone_number_2,
            'department_id': self.department_id,
            'department': self.department_rel.name if self.department_rel else None,
            'job_title': self.job_title,
            'job_category': self.job_category,
            'employment_date': self.employment_date.isoformat() if self.employment_date else None,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'gender': self.gender,
            'city': self.city,
            'residential_address': self.residential_address,
            'profile_image': self.profile_image,
            'next_of_kin_name': self.next_of_kin_name,
            'next_of_kin_phone': self.next_of_kin_phone,
            'next_of_kin_relationship': self.next_of_kin_relationship,
            'highest_qualification': self.highest_qualification,
            'institution': self.institution,
            'graduation_year': self.graduation_year,
            'guarantor_name': self.guarantor_name,
            'guarantor_occupation': self.guarantor_occupation,
            'guarantor_phone': self.guarantor_phone,
            'marital_status': self.marital_status,
            'spouse_name': self.spouse_name,
            'number_of_children': self.number_of_children,
            'bank_name': self.bank_name,
            'account_number': self.account_number,
            'account_name': self.account_name,
            'salary': float(self.salary) if self.salary else 0,
            'is_deleted': self.is_deleted,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
