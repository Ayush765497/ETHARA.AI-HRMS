from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.document import Document
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from functools import wraps
import cloudinary.uploader

documents_bp = Blueprint('documents', __name__)


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


def error_response(message, status_code=400):
    return jsonify({"status": "error", "data": {}, "message": message}), status_code


@documents_bp.route('/', methods=['GET'])
@jwt_required()
def get_documents():
    employee_id = request.args.get('employee_id', type=int)
    claims = get_jwt() or {}
    if claims.get('role') == 'employee':
        user = db.session.get(User, int(get_jwt_identity()))
        employee_id = user.employee_id if user and user.employee_id else employee_id
    query = Document.query
    if employee_id:
        query = query.filter_by(employee_id=employee_id)
    docs = query.order_by(Document.created_at.desc()).all()
    return success_response([d.to_dict() for d in docs])


@documents_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_document():
    user_id = int(get_jwt_identity())
    claims = get_jwt() or {}
    current_user = db.session.get(User, user_id)
    if 'file' not in request.files:
        return error_response("No file provided")
    file = request.files['file']
    employee_id = request.form.get('employee_id', type=int)
    title = request.form.get('title', file.filename)
    if claims.get('role') == 'employee':
        if not current_user or not current_user.employee_id:
            return error_response("Employee information not available", 403)
        employee_id = current_user.employee_id
    if not employee_id:
        return error_response("employee_id is required")
    try:
        result = cloudinary.uploader.upload(
            file, folder=f"hrms/documents/{employee_id}", resource_type="auto")
        doc = Document(employee_id=employee_id, title=title, file_url=result['secure_url'],
                       file_type=result.get('format'), file_size=result.get('bytes'), uploaded_by=user_id)
        db.session.add(doc)
        db.session.commit()
        return success_response(doc.to_dict(), "Document uploaded successfully"), 201
    except Exception as e:
        return error_response(f"Upload failed: {str(e)}", 500)


@documents_bp.route('/<int:doc_id>', methods=['DELETE'])
@jwt_required()
def delete_document(doc_id):
    doc = Document.query.get_or_404(doc_id)
    current_user = db.session.get(User, int(get_jwt_identity()))
    claims = get_jwt() or {}
    if claims.get('role') != 'admin' and (not current_user or current_user.employee_id != doc.employee_id):
        return error_response('Unauthorized access', 403)
    db.session.delete(doc)
    db.session.commit()
    return success_response({}, "Deleted")
