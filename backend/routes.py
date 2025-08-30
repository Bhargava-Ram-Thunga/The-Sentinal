# routes.py
from datetime import datetime, date, timedelta
from flask import Blueprint, jsonify, request
from functools import wraps
from bcrypt import checkpw, gensalt, hashpw
import jwt
import numpy as np
import base64
from PIL import Image
import io
from pymongo import MongoClient
import os
from deepface import DeepFace
from db import db_connection
from config import Config

# Create a Blueprint instance

auth_bp = Blueprint('auth', __name__)

# students : mongodb+srv://br5183268_db_user:5OYRptTxnfDDzoB3@students.06odf13.mongodb.net/
# attendance_records : mongodb+srv://br5183268_db_user:5OYRptTxnfDDzoB3@attendance_records.06odf13.mongodb.net/

students_collection = db_connection.db['students']
attendance_records = db_connection.db['attendance_records']


# -- Helper function for pass word hashing and serialization --

def serialize_student(data):
    hashed_password = hashpw(data['password'].encode('utf-8'), gensalt())
    user_data = {
        'studentId': data['studentId'],
        'name': data['name'],
        'email': data['email'],
        'password': hashed_password.decode('utf-8'),
        'face_image_b64': None
    }
    return user_data

# -- Helper function for JWT authentication --
def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return jsonify({'message': 'Authorization header is missing'}), 401
        try:
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
            student_id = payload.get('studentId')
            return f(student_id, *args, **kwargs)
        except IndexError:
            return jsonify({'message': 'Token format is invalid'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
    return decorated_function

# --- Helper function for Anti-Spoofing Check ---

def is_live_person(images_b64):
    if len(images_b64) < 2:
        return False, "Not enough images for liveness check"
    
    first_image_data = base64.b64decode(images_b64[0].split(',')[1])
    first_img = Image.open(io.BytesIO(first_image_data))
    first_img_array = np.array(first_img)
    
    for img_b64 in images_b64[1:]:
        img_data = base64.b64decode(img_b64.split(',')[1])
        img = Image.open(io.BytesIO(img_data))
        img_array = np.array(img)
        
        if np.array_equal(first_img_array, img_array):
            return False, "Liveness check failed: Images are identical."
    
    return True, "Liveness check passed."

# -- API Endpoints --

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not all(k in data for k in ('studentId', 'name', 'email', 'password')):
        return jsonify({'message': 'Missing data'}), 400

    if students_collection.find_one({'studentId': data['studentId']}):
        return jsonify({'message': 'User already exists'}), 409

    try:
        user_data = serialize_student(data)
        students_collection.insert_one(user_data)
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'message': f'Registration failed: {e}'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ('studentId', 'password')):
        return jsonify({'message': 'Missing studentId or password'}), 400

    user = students_collection.find_one({'studentId': data['studentId']})

    if not user:
        return jsonify({'message': 'User not found'}), 404

    if checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
        payload = {'studentId': user['studentId'], 'exp': datetime.utcnow() + timedelta(minutes=30)}
        token = jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
        return jsonify({'token': token}), 200
    else:
        return jsonify({'message': 'Invalid credentials'}), 401
        

@auth_bp.route('/check-face-data-presence/<student_id>', methods=['GET'])
@token_required
def check_face_presence(authenticated_student_id, student_id):
    if authenticated_student_id != student_id:
        return jsonify({'message': 'Unauthorized'}), 401

    user = students_collection.find_one({'studentId': student_id})
    if user and user.get('face_image_b64'):
        return jsonify({'hasFaceData': True}), 200
    else:
        return jsonify({'hasFaceData': False}), 200

@auth_bp.route('/add-face-data/<student_id>', methods=['POST'])
@token_required
def add_face_data(authenticated_student_id, student_id):
    if authenticated_student_id != student_id:
        return jsonify({'message': 'Unauthorized'}), 401
    data = request.get_json()
    images_b64 = data.get('images')

    if not images_b64 or not isinstance(images_b64, list):
        return jsonify({'message': 'No image data received or invalid format'}), 400
    
    is_live, message = is_live_person(images_b64)
    if not is_live:
        return jsonify({'message': message}), 400

    try:
        DeepFace.analyze(img_path=images_b64[0], actions=['age'], enforce_detection=True, detector_backend='retinaface',anti_spoofing=True)

        students_collection.update_one(
            {'studentId': student_id},
            {'$set': {'face_image_b64': images_b64[0]}},
            upsert=True
        )
        
        return jsonify({'message': 'Face data enrolled successfully with anti-spoofing check'}), 201
    except Exception as e:
        return jsonify({'message': f'Enrollment failed: {e}'}), 500


@auth_bp.route('/compare-face-data/<student_id>', methods=['POST'])
@token_required
def compare_face_data(authenticated_student_id, student_id):
    if authenticated_student_id != student_id:
        return jsonify({'message': 'Unauthorized'}), 401
        
    data = request.get_json()
    images_b64 = data.get('images')

    if not images_b64 or not isinstance(images_b64, list):
        return jsonify({'message': 'No image data received or invalid format'}), 400

    is_live, message = is_live_person(images_b64)
    if not is_live:
        return jsonify({'message': message}), 400

    try:
        user = students_collection.find_one({'studentId': student_id})
        if not user or not user.get('face_image_b64'):
            return jsonify({'message': 'No face data found for this student'}), 404
        
        stored_image_b64 = user['face_image_b64']
        
        all_verified = False
        for live_image_b64 in images_b64:
            result = DeepFace.verify(
                img1_path=stored_image_b64,
                img2_path=live_image_b64,
                enforce_detection=True,
                anti_spoofing=True,
                detector_backend='retinaface',
                model_name='Facenet512',
                distance_metric='euclidean_l2'
            )
            if result['verified']:
                all_verified = True
                break
        
        if all_verified:
            today_date = datetime.today().isoformat()[:10]
            attendance_records.update_one(
                {'date': today_date},
                {'$addToSet': {'student_ids': student_id}},
                upsert=True
            )
            return jsonify({'message': 'Face matched! Attendance marked successfully'}), 200
        else:
            return jsonify({'message': 'Face does not match or is a spoof'}), 401
            
    except Exception as e:
        if str(e).lower() == "Exception while processing img2_path".lower():
            return jsonify({'message': 'Face does not match or is a spoof'}), 401
        return jsonify({'message': f'Comparison failed: {e}'}), 500


@auth_bp.route('/is-todays-attendance-marked/<student_id>', methods=['GET'])
@token_required
def has_todays_attendance_marked(authenticated_student_id, student_id):
    if authenticated_student_id != student_id:
        return jsonify({'message': 'Unauthorized'}), 401
        
    today_date = date.today().isoformat()
    attendance_record = attendance_records.find_one({
        'date': today_date,
        'student_ids': student_id
    })
    
    if attendance_record:
        return jsonify({'isAttendanceMarked': True}), 200
    else:
        return jsonify({'isAttendanceMarked': False}), 200


@auth_bp.route('/profile', methods=['GET'])
@token_required
def profile(student_id):
    """
    Fetches the profile information for the authenticated user.
    """
    user = students_collection.find_one({'studentId': student_id}, {'password': 0, 'face_image_b64': 0, '_id': 0})
    if user:
        return jsonify(user), 200
    else:
        return jsonify({'message': 'Profile not found'}), 404

@auth_bp.route('/api/attendance/today', methods=['GET'])
def get_today_attendance():
    """
    Returns a list of student IDs who have marked their attendance today.
    """
    today_date = date.today().isoformat()
    record = attendance_records.find_one({'date': today_date})
    
    if record:
        return jsonify({'student_ids': record.get('student_ids', [])}), 200
    else:
        return jsonify({'student_ids': []}), 200

@auth_bp.route('/api/attendance/history', methods=['GET'])
def get_attendance_history():
    """
    Returns a list of all historical attendance records.
    """
    history = list(attendance_records.find({}, {'_id': 0}).sort('date', -1))
    if history:
        return jsonify({'history': history}), 200
    else:
        return jsonify({'message': 'No attendance history found'}), 404

