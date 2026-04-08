from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.course import Course, Enrollment
from flask_jwt_extended import jwt_required

courses_bp = Blueprint('courses', __name__)

def success_response(data, message="Success"):
    return jsonify({"status": "success", "data": data, "message": message})

@courses_bp.route('/', methods=['GET'])
@jwt_required()
def get_courses():
    courses = Course.query.filter_by(is_active=True).order_by(Course.created_at.desc()).all()
    return success_response([c.to_dict() for c in courses])

@courses_bp.route('/', methods=['POST'])
@jwt_required()
def create_course():
    data = request.get_json()
    course = Course(title=data['title'], description=data.get('description'),
                    category=data.get('category'), duration_hours=data.get('duration_hours'),
                    instructor=data.get('instructor'), thumbnail=data.get('thumbnail'))
    db.session.add(course)
    db.session.commit()
    return success_response(course.to_dict()), 201

@courses_bp.route('/enroll', methods=['POST'])
@jwt_required()
def enroll():
    data = request.get_json()
    existing = Enrollment.query.filter_by(course_id=data['course_id'], employee_id=data['employee_id']).first()
    if existing:
        return jsonify({"status": "error", "message": "Already enrolled"}), 400
    enrollment = Enrollment(course_id=data['course_id'], employee_id=data['employee_id'])
    db.session.add(enrollment)
    db.session.commit()
    return success_response(enrollment.to_dict(), "Enrolled successfully"), 201

@courses_bp.route('/enrollments', methods=['GET'])
@jwt_required()
def get_enrollments():
    employee_id = request.args.get('employee_id', type=int)
    query = Enrollment.query
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    enrollments = query.all()
    return success_response([e.to_dict() for e in enrollments])

@courses_bp.route('/enrollments/<int:enrollment_id>/progress', methods=['PUT'])
@jwt_required()
def update_progress(enrollment_id):
    enrollment = Enrollment.query.get_or_404(enrollment_id)
    data = request.get_json()
    enrollment.progress = data.get('progress', enrollment.progress)
    if enrollment.progress >= 100:
        enrollment.status = 'completed'
        from datetime import datetime
        enrollment.completed_at = datetime.utcnow()
    db.session.commit()
    return success_response(enrollment.to_dict())
