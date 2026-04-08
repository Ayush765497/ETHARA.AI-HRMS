from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.announcement import Announcement, Survey, SurveyResponse
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from functools import wraps

announcements_bp = Blueprint('announcements', __name__)


def role_required(role):
    def outer(fn):
        @wraps(fn)
        def inner(*args, **kwargs):
            claims = get_jwt() or {}
            if claims.get('role') != role:
                return jsonify({'status': 'error', 'data': {}, 'message': 'Unauthorized access'}), 403
            return fn(*args, **kwargs)
        return inner
    return outer


def success_response(data, message="Success"):
    return jsonify({"status": "success", "data": data, "message": message})


@announcements_bp.route('/', methods=['GET'])
@jwt_required()
def get_announcements():
    anns = Announcement.query.order_by(
        Announcement.is_pinned.desc(), Announcement.created_at.desc()).all()
    return success_response([a.to_dict() for a in anns])


@announcements_bp.route('/', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_announcement():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    ann = Announcement(title=data.get('title', '').strip(), content=data.get('content', '').strip(),
                       created_by=user_id, is_pinned=data.get('is_pinned', False))
    db.session.add(ann)
    db.session.commit()
    return success_response(ann.to_dict()), 201


@announcements_bp.route('/<int:ann_id>', methods=['DELETE'])
@jwt_required()
@role_required('admin')
def delete_announcement(ann_id):
    ann = Announcement.query.get_or_404(ann_id)
    db.session.delete(ann)
    db.session.commit()
    return success_response({}, "Deleted")


@announcements_bp.route('/surveys', methods=['GET'])
@jwt_required()
def get_surveys():
    surveys = Survey.query.order_by(Survey.created_at.desc()).all()
    return success_response([s.to_dict() for s in surveys])


@announcements_bp.route('/surveys', methods=['POST'])
@jwt_required()
@role_required('admin')
def create_survey():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    survey = Survey(title=data.get('title', '').strip(), description=data.get('description'),
                    questions=data.get('questions', []), created_by=user_id)
    db.session.add(survey)
    db.session.commit()
    return success_response(survey.to_dict()), 201


@announcements_bp.route('/surveys/<int:survey_id>/respond', methods=['POST'])
@jwt_required()
def respond_survey(survey_id):
    data = request.get_json()
    response = SurveyResponse(survey_id=survey_id, employee_id=data['employee_id'],
                              answers=data.get('answers', {}))
    db.session.add(response)
    db.session.commit()
    return success_response({}, "Response submitted"), 201
