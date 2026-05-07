from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.performance import Goal, KeyResult, Feedback, Recognition
from flask_jwt_extended import jwt_required, get_jwt_identity

performance_bp = Blueprint('performance', __name__)

def success_response(data, message="Success"):
    return jsonify({"status": "success", "data": data, "message": message})

@performance_bp.route('/goals', methods=['GET'])
@jwt_required()
def get_goals():
    employee_id = request.args.get('employee_id', type=int)
    query = Goal.query
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    goals = query.order_by(Goal.created_at.desc()).all()
    return success_response([g.to_dict() for g in goals])

@performance_bp.route('/goals', methods=['POST'])
@jwt_required()
def create_goal():
    data = request.get_json()
    from datetime import date
    goal = Goal(employee_id=data['employee_id'], title=data['title'],
                description=data.get('description'),
                project_id=data.get('project_id') if data.get('project_id') else None,
                target_date=date.fromisoformat(data['target_date']) if data.get('target_date') else None)
    db.session.add(goal)
    db.session.flush()
    for kr_data in data.get('key_results', []):
        kr = KeyResult(goal_id=goal.id, title=kr_data['title'])
        db.session.add(kr)
    db.session.commit()
    return success_response(goal.to_dict()), 201

@performance_bp.route('/goals/<int:goal_id>', methods=['PUT'])
@jwt_required()
def update_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)
    data = request.get_json()
    for f in ['title', 'description', 'progress', 'status']:
        if f in data:
            setattr(goal, f, data[f])
    db.session.commit()
    return success_response(goal.to_dict())

@performance_bp.route('/goals/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    goal = Goal.query.get_or_404(goal_id)
    db.session.delete(goal)
    db.session.commit()
    return success_response({}, "Deleted")

@performance_bp.route('/feedback', methods=['GET'])
@jwt_required()
def get_feedback():
    employee_id = request.args.get('employee_id', type=int)
    query = Feedback.query
    if employee_id:
        query = query.filter_by(to_employee_id=employee_id)
    return success_response([f.to_dict() for f in query.order_by(Feedback.created_at.desc()).all()])

@performance_bp.route('/feedback', methods=['POST'])
@jwt_required()
def create_feedback():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    fb = Feedback(from_user_id=user_id, to_employee_id=data['to_employee_id'],
                  message=data['message'], rating=data.get('rating'))
    db.session.add(fb)
    db.session.commit()
    return success_response(fb.to_dict()), 201

@performance_bp.route('/recognitions', methods=['GET'])
@jwt_required()
def get_recognitions():
    recognitions = Recognition.query.order_by(Recognition.created_at.desc()).limit(20).all()
    return success_response([r.to_dict() for r in recognitions])

@performance_bp.route('/recognitions', methods=['POST'])
@jwt_required()
def create_recognition():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    rec = Recognition(from_user_id=user_id, to_employee_id=data['to_employee_id'],
                      message=data['message'], badge=data.get('badge', 'star'))
    db.session.add(rec)
    db.session.commit()
    return success_response(rec.to_dict()), 201
