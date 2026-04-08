from flask import Blueprint, jsonify
from app.extensions import db
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.models.leave import Leave
from app.models.announcement import Announcement
from app.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
import json
import os

dashboard_bp = Blueprint('dashboard', __name__)


def success_response(data, message="Success"):
    return jsonify({"status": "success", "data": data, "message": message})


def get_redis_client():
    try:
        import redis
        r = redis.from_url(os.environ.get(
            'REDIS_URL', 'redis://localhost:6379/0'))
        r.ping()
        return r
    except:
        return None


@dashboard_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_stats():
    claims = get_jwt()
    user_id = int(get_jwt_identity())
    user_role = claims.get('role')

    if user_role == 'employee':
        user = db.session.get(User, user_id)
        if not user or not user.employee_id:
            return jsonify({"status": "error", "data": {}, "message": "Employee record not found"}), 404
        emp_id = user.employee_id
        total_employees = 1
        attendance_records = Attendance.query.filter_by(
            employee_id=emp_id).count()
        leaves = Leave.query.filter_by(employee_id=emp_id).all()
        leave_progress = {"pending": 0, "approved": 0, "rejected": 0}
        for l in leaves:
            leave_progress[l.status] = leave_progress.get(l.status, 0) + 1
        return success_response({
            "employee_id": emp_id,
            "attendance_records": attendance_records,
            "leave_summary": leave_progress,
            "recent_announcements": [a.to_dict() for a in Announcement.query.order_by(Announcement.created_at.desc()).limit(5).all()]
        })

    # Admin flow (full analytics)
    redis_client = get_redis_client()
    cache_key = 'dashboard_stats'
    if redis_client:
        cached = redis_client.get(cache_key)
        if cached:
            return jsonify({"status": "success", "data": json.loads(cached), "message": "From cache"})

    total_employees = Employee.query.filter_by(is_deleted=False).count()
    pending_leaves = Leave.query.filter_by(status='pending').count()
    approved_leaves = Leave.query.filter_by(status='approved').count()
    from datetime import date
    today_attendance = Attendance.query.filter_by(date=date.today()).count()
    recent_announcements = Announcement.query.order_by(
        Announcement.created_at.desc()).limit(5).all()

    stats = {
        "total_employees": total_employees,
        "pending_leaves": pending_leaves,
        "approved_leaves": approved_leaves,
        "today_attendance": today_attendance,
        "recent_announcements": [a.to_dict() for a in recent_announcements],
        "attendance_rate": round((today_attendance / total_employees * 100) if total_employees > 0 else 0, 1),
    }

    if redis_client:
        redis_client.setex(cache_key, 300, json.dumps(stats)
                           )  # Cache 5 minutes

    return success_response(stats)
