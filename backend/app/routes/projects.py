from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.project import Project
from app.routes.auth import role_required
from datetime import datetime

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    return jsonify({"status": "success", "data": [p.to_dict() for p in projects]})

@projects_bp.route('', methods=['POST'])
@role_required('admin')
def create_project():
    data = request.get_json() or {}
    name = data.get('name')
    if not name:
        return jsonify({"status": "error", "message": "Project name is required"}), 400
    
    project = Project(
        name=name,
        description=data.get('description'),
        status=data.get('status', 'active'),
        end_date=datetime.strptime(data.get('end_date'), '%Y-%m-%d').date() if data.get('end_date') else None
    )
    db.session.add(project)
    db.session.commit()
    return jsonify({"status": "success", "data": project.to_dict(), "message": "Project created successfully"}), 201

@projects_bp.route('/<int:id>', methods=['DELETE'])
@role_required('admin')
def delete_project(id):
    project = db.session.get(Project, id)
    if not project:
        return jsonify({"status": "error", "message": "Project not found"}), 404
    db.session.delete(project)
    db.session.commit()
    return jsonify({"status": "success", "message": "Project deleted"})
