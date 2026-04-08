from app.extensions import db
from datetime import datetime

class Announcement(db.Model):
    __tablename__ = 'announcements'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    is_pinned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'content': self.content,
                'is_pinned': self.is_pinned, 'created_at': self.created_at.isoformat() if self.created_at else None}

class Survey(db.Model):
    __tablename__ = 'surveys'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    questions = db.Column(db.JSON)
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    responses = db.relationship('SurveyResponse', backref='survey', lazy=True)

    def to_dict(self):
        return {'id': self.id, 'title': self.title, 'description': self.description,
                'questions': self.questions, 'is_active': self.is_active,
                'created_at': self.created_at.isoformat() if self.created_at else None}

class SurveyResponse(db.Model):
    __tablename__ = 'survey_responses'
    id = db.Column(db.Integer, primary_key=True)
    survey_id = db.Column(db.Integer, db.ForeignKey('surveys.id'), nullable=False)
    employee_id = db.Column(db.Integer, db.ForeignKey('employees.id'), nullable=False)
    answers = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
