from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.recruitment import Job, Candidate
from flask_jwt_extended import jwt_required

recruitment_bp = Blueprint('recruitment', __name__)

def success_response(data, message="Success"):
    return jsonify({"status": "success", "data": data, "message": message})

@recruitment_bp.route('/jobs', methods=['GET'])
@jwt_required()
def get_jobs():
    jobs = Job.query.order_by(Job.created_at.desc()).all()
    return success_response([j.to_dict() for j in jobs])

@recruitment_bp.route('/jobs', methods=['POST'])
@jwt_required()
def create_job():
    data = request.get_json()
    job = Job(title=data['title'], department_id=data.get('department_id'),
              description=data.get('description'), requirements=data.get('requirements'),
              job_type=data.get('job_type'), location=data.get('location'))
    db.session.add(job)
    db.session.commit()
    return success_response(job.to_dict()), 201

@recruitment_bp.route('/jobs/<int:job_id>', methods=['PUT'])
@jwt_required()
def update_job(job_id):
    job = Job.query.get_or_404(job_id)
    data = request.get_json()
    for f in ['title', 'description', 'requirements', 'job_type', 'location', 'status']:
        if f in data:
            setattr(job, f, data[f])
    db.session.commit()
    return success_response(job.to_dict())

@recruitment_bp.route('/jobs/<int:job_id>', methods=['DELETE'])
@jwt_required()
def delete_job(job_id):
    job = Job.query.get_or_404(job_id)
    db.session.delete(job)
    db.session.commit()
    return success_response({}, "Deleted")

@recruitment_bp.route('/candidates', methods=['GET'])
@jwt_required()
def get_candidates():
    job_id = request.args.get('job_id', type=int)
    status = request.args.get('status')
    query = Candidate.query
    if job_id:
        query = query.filter_by(job_id=job_id)
    if status:
        query = query.filter_by(status=status)
    return success_response([c.to_dict() for c in query.order_by(Candidate.created_at.desc()).all()])

@recruitment_bp.route('/candidates', methods=['POST'])
@jwt_required()
def create_candidate():
    data = request.get_json()
    candidate = Candidate(
        job_id=data.get('job_id'), first_name=data['first_name'], last_name=data['last_name'],
        email=data.get('email'), phone=data.get('phone'), resume_url=data.get('resume_url'),
        notes=data.get('notes')
    )
    db.session.add(candidate)
    db.session.commit()
    return success_response(candidate.to_dict()), 201

@recruitment_bp.route('/candidates/<int:c_id>', methods=['PUT'])
@jwt_required()
def update_candidate(c_id):
    candidate = Candidate.query.get_or_404(c_id)
    data = request.get_json()
    for f in ['status', 'notes', 'resume_url']:
        if f in data:
            setattr(candidate, f, data[f])
    db.session.commit()
    return success_response(candidate.to_dict())
