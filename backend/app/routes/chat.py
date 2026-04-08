from flask import Blueprint, request, jsonify
from app.extensions import db, socketio
from app.models.chat import Message, Channel
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_socketio import join_room, leave_room, emit

chat_bp = Blueprint('chat', __name__)

def success_response(data, message="Success"):
    return jsonify({"status": "success", "data": data, "message": message})

@chat_bp.route('/channels', methods=['GET'])
@jwt_required()
def get_channels():
    channels = Channel.query.all()
    return success_response([c.to_dict() for c in channels])

@chat_bp.route('/channels', methods=['POST'])
@jwt_required()
def create_channel():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    channel = Channel(name=data['name'], description=data.get('description'), created_by=user_id)
    db.session.add(channel)
    db.session.commit()
    return success_response(channel.to_dict()), 201

@chat_bp.route('/messages', methods=['GET'])
@jwt_required()
def get_messages():
    channel_id = request.args.get('channel_id', type=int)
    receiver_id = request.args.get('receiver_id', type=int)
    user_id = int(get_jwt_identity())
    page = request.args.get('page', 1, type=int)
    query = Message.query
    if channel_id:
        query = query.filter_by(channel_id=channel_id)
    elif receiver_id:
        query = query.filter(
            db.or_(
                db.and_(Message.sender_id == user_id, Message.receiver_id == receiver_id),
                db.and_(Message.sender_id == receiver_id, Message.receiver_id == user_id)
            )
        )
    messages = query.order_by(Message.created_at.asc()).offset((page-1)*50).limit(50).all()
    return success_response([m.to_dict() for m in messages])

@chat_bp.route('/messages', methods=['POST'])
@jwt_required()
def send_message():
    user_id = int(get_jwt_identity())
    data = request.get_json()
    msg = Message(sender_id=user_id, receiver_id=data.get('receiver_id'),
                  channel_id=data.get('channel_id'), content=data['content'])
    db.session.add(msg)
    db.session.commit()
    return success_response(msg.to_dict()), 201

# Socket.IO events
@socketio.on('join')
def on_join(data):
    room = data.get('room', 'general')
    join_room(room)

@socketio.on('leave')
def on_leave(data):
    room = data.get('room', 'general')
    leave_room(room)

@socketio.on('send_message')
def handle_message(data):
    room = data.get('room', 'general')
    emit('new_message', data, to=room)
