# models.py

from bcrypt import hashpw, gensalt
from datetime import datetime, date

class Student:
    def __init__(self, studentId, name, email, password):
        self.studentId = studentId
        self.name = name
        self.email = email
        self.password = hash_password(password)
        self.face_image_b64 = None

def hash_password(password):
    return hashpw(password.encode('utf-8'), gensalt()).decode('utf-8')

def serialize_student(data):
    return {
        'studentId': data['studentId'],
        'name': data['name'],
        'email': data['email'],
        'password': hash_password(data['password']),
        'face_image_b64': None
    }

def serialize_attendance_record(student_id):
    return {
        'date': date.today().isoformat(),
        'student_ids': [student_id]
    }