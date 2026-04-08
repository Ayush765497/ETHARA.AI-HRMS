from app.extensions import db
from datetime import datetime

class Job(db.Model):
    __tablename__ = 'jobs'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    job_type = db.Column(db.String(50))  # Full time, Part time, Contract
    location = db.Column(db.String(100))
    status = db.Column(db.String(30), default='open')  # open, closed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    department = db.relationship('Department', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'title': self.title,
            'department': self.department.name if self.department else None,
            'description': self.description, 'requirements': self.requirements,
            'job_type': self.job_type, 'location': self.location,
            'status': self.status, 'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Candidate(db.Model):
    __tablename__ = 'candidates'
    id = db.Column(db.Integer, primary_key=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id'))
    first_name = db.Column(db.String(100), nullable=False)
    last_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150))
    phone = db.Column(db.String(20))
    resume_url = db.Column(db.String(255))
    status = db.Column(db.String(30), default='applied')  # applied, shortlisted, interviewed, hired, rejected
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    job = db.relationship('Job', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'first_name': self.first_name, 'last_name': self.last_name,
            'full_name': f"{self.first_name} {self.last_name}",
            'email': self.email, 'phone': self.phone,
            'resume_url': self.resume_url, 'status': self.status,
            'job_title': self.job.title if self.job else None, 'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
