# routes.py
import base64
import io
# import os
from datetime import date, datetime, timedelta
from functools import wraps

import jwt
import numpy as np
from bcrypt import checkpw, gensalt, hashpw
from config import Config
from db import db_connection
from deepface import DeepFace
from flask import Blueprint, jsonify, request
from PIL import Image
from pymongo import MongoClient

# Create a Blueprint instance

auth_bp = Blueprint("auth", __name__)

# students : mongodb+srv://br5183268_db_user:5OYRptTxnfDDzoB3@students.06odf13.mongodb.net/
# attendance_records : mongodb+srv://br5183268_db_user:5OYRptTxnfDDzoB3@attendance_records.06odf13.mongodb.net/

students_collection = db_connection.db["students"]  # type:ignore
attendance_records = db_connection.db["attendance_records"]  # type:ignore
schedules_collection = db_connection.db["schedules"]  # type:ignore


# -- Helper function for pass word hashing and serialization --


def serialize_student(data):
    hashed_password = hashpw(data["password"].encode("utf-8"), gensalt())
    user_data = {
        "studentId": data["studentId"],
        "name": data["name"],
        "email": data["email"],
        "password": hashed_password.decode("utf-8"),
        "face_image_b64": None,
        "section": None,
    }
    return user_data


# -- Helper function for JWT authentication --
def token_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({"message": "Authorization header is missing"}), 401
        try:
            token = auth_header.split(" ")[1]
            payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            student_id = payload.get("studentId")
            return f(student_id, *args, **kwargs)
        except IndexError:
            return jsonify({"message": "Token format is invalid"}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token has expired"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"message": "Invalid token"}), 401

    return decorated_function


# --- Helper function for Anti-Spoofing Check ---


def is_live_person(images_b64):
    if len(images_b64) < 2:
        return False, "Not enough images for liveness check"

    first_image_data = base64.b64decode(images_b64[0].split(",")[1])
    first_img = Image.open(io.BytesIO(first_image_data))
    first_img_array = np.array(first_img)

    for img_b64 in images_b64[1:]:
        img_data = base64.b64decode(img_b64.split(",")[1])
        img = Image.open(io.BytesIO(img_data))
        img_array = np.array(img)

        if np.array_equal(first_img_array, img_array):
            return False, "Liveness check failed: Images are identical."

    return True, "Liveness check passed."


# -- API Endpoints --


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not all(
        k in data for k in ("studentId", "name", "email", "password")
    ):
        return jsonify({"message": "Missing data"}), 400

    if students_collection.find_one({"studentId": data["studentId"]}):
        return jsonify({"message": "User already exists"}), 409

    try:
        user_data = serialize_student(data)
        students_collection.insert_one(user_data)
        return jsonify({"message": "User registered successfully"}), 201
    except Exception as e:
        return jsonify({"message": f"Registration failed: {e}"}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data or not all(k in data for k in ("studentId", "password")):
        return jsonify({"message": "Missing studentId or password"}), 400

    user = students_collection.find_one({"studentId": data["studentId"]})

    if not user:
        return jsonify({"message": "User not found"}), 404

    if checkpw(data["password"].encode("utf-8"), user["password"].encode("utf-8")):
        payload = {
            "studentId": user["studentId"],
            "exp": datetime.utcnow() + timedelta(minutes=30),
        }
        token = jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")
        return jsonify({"token": token}), 200
    else:
        return jsonify({"message": "Invalid credentials"}), 401


@auth_bp.route("/check-face-data-presence/<student_id>", methods=["GET"])
@token_required
def check_face_presence(authenticated_student_id, student_id):
    if authenticated_student_id != student_id:
        return jsonify({"message": "Unauthorized"}), 401

    user = students_collection.find_one({"studentId": student_id})
    if user and user.get("face_image_b64"):
        return jsonify({"hasFaceData": True}), 200
    else:
        return jsonify({"hasFaceData": False}), 200


@auth_bp.route("/add-face-data/<student_id>", methods=["POST"])
@token_required
def add_face_data(authenticated_student_id, student_id):
    if authenticated_student_id != student_id:
        return jsonify({"message": "Unauthorized"}), 401
    data = request.get_json()
    images_b64 = data.get("images")

    if not images_b64 or not isinstance(images_b64, list):
        return jsonify({"message": "No image data received or invalid format"}), 400

    is_live, message = is_live_person(images_b64)
    if not is_live:
        return jsonify({"message": message}), 400

    try:
        DeepFace.analyze(
            img_path=images_b64[0],
            actions=["age"],
            enforce_detection=True,
            detector_backend="retinaface",
            anti_spoofing=True,
        )
        students_collection.update_one(
            {"studentId": student_id},
            {"$set": {"face_image_b64": images_b64[0]}},
            upsert=True,
        )

        return (
            jsonify(
                {"message": "Face data enrolled successfully with anti-spoofing check"}
            ),
            201,
        )
    except Exception as e:
        return jsonify({"message": f"Enrollment failed: {e}"}), 500


@auth_bp.route("/compare-face-data/<student_id>", methods=["POST"])
@token_required
def compare_face_data(authenticated_student_id, student_id):
    if authenticated_student_id != student_id:
        return jsonify({"message": "Unauthorized"}), 401

    data = request.get_json()
    images_b64 = data.get("images")

    if not images_b64 or not isinstance(images_b64, list):
        return jsonify({"message": "No image data received or invalid format"}), 400

    is_live, message = is_live_person(images_b64)
    if not is_live:
        return jsonify({"message": message}), 400

    try:
        user = students_collection.find_one({"studentId": student_id})
        if not user or not user.get("face_image_b64"):
            return jsonify({"message": "No face data found for this student"}), 404

        stored_image_b64 = user["face_image_b64"]

        all_verified = False
        for live_image_b64 in images_b64:
            result = DeepFace.verify(
                img1_path=stored_image_b64,
                img2_path=live_image_b64,
                enforce_detection=True,
                anti_spoofing=True,
                detector_backend="retinaface",
                model_name="Facenet512",
                distance_metric="euclidean_l2",
            )
            if result["verified"]:
                all_verified = True
                break

        if all_verified:
            today_date = datetime.today().isoformat()[:10]
            attendance_records.update_one(
                {"date": today_date},
                {"$addToSet": {"student_ids": student_id}},
                upsert=True,
            )
            return (
                jsonify({"message": "Face matched! Attendance marked successfully"}),
                200,
            )
        else:
            return jsonify({"message": "Face does not match or is a spoof"}), 401

    except Exception as e:
        if str(e).lower() == "Exception while processing img2_path".lower():
            return jsonify({"message": "Face does not match or is a spoof"}), 401
        return jsonify({"message": f"Comparison failed: {e}"}), 500


@auth_bp.route("/is-todays-attendance-marked/<student_id>", methods=["GET"])
@token_required
def has_todays_attendance_marked(authenticated_student_id, student_id):
    if authenticated_student_id != student_id:
        return jsonify({"message": "Unauthorized"}), 401

    today_date = date.today().isoformat()
    attendance_record = attendance_records.find_one(
        {"date": today_date, "student_ids": student_id}
    )

    if attendance_record:
        return jsonify({"isAttendanceMarked": True}), 200
    else:
        return jsonify({"isAttendanceMarked": False}), 200


@auth_bp.route("/profile", methods=["GET", "PATCH"])  # type:ignore
@token_required
def profile(student_id):
    """
    Handles fetching and updating the authenticated user's profile.
    """
    if request.method == "GET":
        user = students_collection.find_one(
            {"studentId": student_id}, {"password": 0, "face_image_b64": 0, "_id": 0}
        )
        if user:
            return jsonify(user), 200
        else:
            return jsonify({"message": "Profile not found"}), 404

    elif request.method == "PATCH":
        data = request.get_json()
        allowed_fields = ["name", "email", "section"]
        update_data = {k: v for k, v in data.items() if k in allowed_fields}

        if not update_data:
            return jsonify({"message": "No valid fields provided for update"}), 400

        try:
            result = students_collection.update_one(
                {"studentId": student_id}, {"$set": update_data}
            )
            if result.matched_count == 0:
                return jsonify({"message": "User not found"}), 404
            return jsonify({"message": "Profile updated successfully"}), 200
        except Exception as e:
            return jsonify({"message": f"Update failed: {e}"}), 500


@auth_bp.route("/change-password", methods=["POST"])
@token_required
def change_password(student_id):
    """
    Allows the authenticated user to change their password.
    """
    data = request.get_json()
    old_password = data.get("oldPassword")
    new_password = data.get("newPassword")

    if not old_password or not new_password:
        return jsonify({"message": "Missing oldPassword or newPassword"}), 400

    user = students_collection.find_one({"studentId": student_id})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if checkpw(old_password.encode("utf-8"), user["password"].encode("utf-8")):
        hashed_password = hashpw(new_password.encode("utf-8"), gensalt())
        students_collection.update_one(
            {"studentId": student_id},
            {"$set": {"password": hashed_password.decode("utf-8")}},
        )
        return jsonify({"message": "Password changed successfully"}), 200
    else:
        return jsonify({"message": "Invalid old password"}), 401


@auth_bp.route("/api/admin/schedules", methods=["GET", "POST"])  # type:ignore
def admin_schedules():
    """
    Handles fetching and updating schedules for a specific section by an admin.
    """
    if request.method == "GET":
        section = request.args.get("section")
        if not section:
            return jsonify({"message": "Missing section parameter"}), 400

        try:
            schedule = schedules_collection.find_one(
                {"section": section}, {"_id": 0, "schedule_details": 1}
            )
            if schedule:
                return jsonify({"schedule": schedule["schedule_details"]}), 200
            else:
                return jsonify({"message": "No schedule found for this section"}), 404
        except Exception as e:
            return jsonify({"message": f"Failed to fetch schedule: {e}"}), 500

    elif request.method == "POST":
        data = request.get_json()
        section = data.get("section")
        schedule = data.get("schedule")

        if not section or not schedule:
            return jsonify({"message": "Missing section or schedule data"}), 400

        try:
            schedules_collection.update_one(
                {"section": section},
                {"$set": {"schedule_details": schedule}},
                upsert=True,
            )
            return (
                jsonify({"message": f"Schedule for {section} updated successfully"}),
                200,
            )
        except Exception as e:
            return jsonify({"message": f"Failed to update schedule: {e}"}), 500


@auth_bp.route("/api/schedules/<student_id>", methods=["GET"])
@token_required
def get_schedule(authenticated_student_id, student_id):
    """
    Returns the schedule for the authenticated student's section.
    """
    if authenticated_student_id != student_id:
        return jsonify({"message": "Unauthorized"}), 401

    user = students_collection.find_one({"studentId": student_id}, {"section": 1})
    if not user or not user.get("section"):
        return jsonify({"message": "Student section not found"}), 404

    schedule = schedules_collection.find_one(
        {"section": user["section"]}, {"_id": 0, "schedule_details": 1}
    )

    if schedule:
        return jsonify({"schedule": schedule["schedule_details"]}), 200
    else:
        return jsonify({"message": "No schedule found for your section"}), 404


@auth_bp.route("/api/attendance/today", methods=["GET"])
def get_today_attendance():
    """
    Returns a list of student IDs and names who have marked their attendance today.
    """
    today_date = date.today().isoformat()
    record = attendance_records.find_one({"date": today_date})

    if record and record.get("student_ids"):
        student_ids = record["student_ids"]
        students_info = list(
            students_collection.find(
                {"studentId": {"$in": student_ids}},
                {"_id": 0, "studentId": 1, "name": 1},
            )
        )
        return jsonify({"students": students_info}), 200
    else:
        return jsonify({"students": []}), 200


@auth_bp.route("/api/attendance/history", methods=["GET"])
def get_attendance_history():
    """
    Returns a list of all historical attendance records, including student names.
    """
    history = list(attendance_records.find({}, {"_id": 0}).sort("date", -1))

    # Create a mapping of studentId to name
    all_student_ids = [
        student_id for record in history for student_id in record.get("student_ids", [])
    ]
    students_data = students_collection.find(
        {"studentId": {"$in": all_student_ids}}, {"_id": 0, "studentId": 1, "name": 1}
    )
    name_map = {student["studentId"]: student["name"] for student in students_data}

    # Replace student_ids with full student objects in each record
    for record in history:
        record["students"] = [
            {"studentId": student_id, "name": name_map.get(student_id, "N/A")}
            for student_id in record.get("student_ids", [])
        ]
        del record["student_ids"]

    if history:
        return jsonify({"history": history}), 200
    else:
        return jsonify({"message": "No attendance history found"}), 404
