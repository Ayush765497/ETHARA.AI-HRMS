from app.extensions import db
from datetime import datetime

class Goal(db.Model):
    __tablename__ = 'goals'
    id = db.Column(db.Integer, primary_key=True)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    target_date = db.Column(db.Date)
    progress = db.Column(db.Integer, default=0)  # 0-100
    status = db.Column(db.String(30), default='in_progress')  # in_progress, completed, overdue
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    employee = db.relationship('Employee', backref='goals', lazy=True)
    key_results = db.relationship('KeyResult', backref='goal', lazy=True, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id, 'employee_id': self.employee_id,
            'employee_name': f"{self.employee.first_name} {self.employee.last_name}" if self.employee else None,
            'title': self.title, 'description': self.description,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'progress': self.progress, 'status': self.status,
            'key_results': [kr.to_dict() for kr in self.key_results],
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class KeyResult(db.Model):
    __tablename__ = 'key_results'
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    progress = db.Column(db.Integer, default=0)
    is_completed = db.Column(db.Boolean, default=False)

    def to_dict(self):
        return {'id': self.id, 'goal_id': self.goal_id, 'title': self.title,
                'progress': self.progress, 'is_completed': self.is_completed}

class Feedback(db.Model):
    __tablename__ = 'feedback'
    id = db.Column(db.Integer, primary_key=True)
    from_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    to_employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer)  # 1-5
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    to_employee = db.relationship('Employee', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'to_employee_id': self.to_employee_id,
            'employee_name': f"{self.to_employee.first_name} {self.to_employee.last_name}" if self.to_employee else None,
            'message': self.message, 'rating': self.rating,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Recognition(db.Model):
    __tablename__ = 'recognitions'
    id = db.Column(db.Integer, primary_key=True)
    from_user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    to_employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    badge = db.Column(db.String(50))  # star, trophy, etc.
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    to_employee = db.relationship('Employee', lazy=True)

    def to_dict(self):
        return {
            'id': self.id, 'to_employee_id': self.to_employee_id,
            'employee_name': f"{self.to_employee.first_name} {self.to_employee.last_name}" if self.to_employee else None,
            'message': self.message, 'badge': self.badge,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
