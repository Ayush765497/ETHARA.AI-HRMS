from app.extensions import db
from datetime import datetime

class Course(db.Model):
    __tablename__ = 'courses'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    category = db.Column(db.String(100))
    duration_hours = db.Column(db.Integer)
    thumbnail = db.Column(db.String(255))
    instructor = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    enrollments = db.relationship('Enrollment', backref='course', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'description': self.description,
                'category': self.category, 'duration_hours': self.duration_hours,
                'thumbnail': self.thumbnail, 'instructor': self.instructor,
                'created_at': self.created_at.isoformat() if self.created_at else None}

class Enrollment(db.Model):
    __tablename__ = 'enrollments'
    id = db.Column(db.Integer, primary_key=True)
    course_id = db.Column(db.Integer, db.ForeignKey('courses.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    progress = db.Column(db.Integer, default=0)  # 0-100
    status = db.Column(db.String(30), default='enrolled')  # enrolled, completed
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    employee = db.relationship('Employee', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'course_id': self.course_id, 'employee_id': self.employee_id,
            'employee_name': f"{self.employee.first_name} {self.employee.last_name}" if self.employee else None,
            'progress': self.progress, 'status': self.status,
            'enrolled_at': self.enrolled_at.isoformat() if self.enrolled_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }
