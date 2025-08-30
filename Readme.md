# The Sentinel: Integrity. Verified.

## Project Overview

Every successful operation starts with a simple rule: **no room for error**.  
The Sentinel is built on that principle. This isn't your average attendance solution; it's a strategically engineered, **anti-spoofing attendance system**. It stands as a definitive verdict on who is present and who isn't.

By leveraging a meticulously crafted **facial recognition model** and **liveness detection**, we ensure that every record is beyond reproach, eliminating fraud with surgical precision.

This is a **complete, full-stack solution**. The backend is a fortress, and the frontend is an executive dashboard—clean, intuitive, and built for people who value their time.

Unlike a simple login form that can be defeated with a stolen password or a static photo, this system demands **genuine presence**. It’s designed for environments where accountability is paramount and cutting corners is not an option.

The Sentinel doesn't make assumptions; **it verifies**. This is not about trusting your employees; it’s about providing them with a system they can trust, and that, in turn, allows management to act with unshakable confidence.

---

## Key Features 🔐

### **Verifiable Presence**

The core of the system is the integration of **DeepFace** and **RetinaFace**. We don't just recognize a face; we verify a living person.  
A photograph or a screen recording won't cut it.

- **Multi-frame capture sequence** + **anti-spoofing logic** = digital lie detector.
- Detects subtle variations only a live person can produce.
- Guarantees the presented face belongs to a real individual.

This is the difference between a system that works and one that is just for show.

---

### **Executive Access**

The dedicated **admin dashboard** is a **command center**.  
It provides a **real-time, unfiltered view of attendance records**, allowing for quick decisions and comprehensive oversight.

From this single interface, administrators can:

- Pull **daily attendance logs**.
- Review **historical records**.
- Identify **patterns of presence/absence**.

This isn't just **data**; it's **actionable intelligence**.

---

### **Bulletproof Security**

Your data is protected by **military-grade security**.

- **Passwords** are one-way hashed with **bcrypt**.
- **JWT tokens** handle sessions statelessly.

➡️ Even if breached, no one can access original passwords.  
➡️ JWT tokens are clean, expirable keys.

It’s a **secure, efficient** way to do business.

---

### **Seamless User Experience**

Frontend is built with **React** for speed and simplicity.

- **react-hot-toast** → immediate feedback.
- **react-router-dom** → smooth navigation.
- **react-webcam** → direct camera feed integration.

The flow: **log in → capture face → done.**  
No unnecessary clicks. No wasted time.

---

### **Historical Data Integrity**

Attendance records are logged in **MongoDB**.

- Flexible **NoSQL structure**.
- Fast queries.
- Evolves with your needs.

Every check-in becomes a **permanent record**—ready whenever you need it.

---

## Tech Stack 💻

### **Frontend**

- **React** → component-based, scalable, modern.
- **Tailwind CSS** → sleek, responsive, utility-first design.
- **React-Webcam** → direct video feed for liveness detection.

### **Backend**

- **Flask** → lean, secure, and efficient.
- **DeepFace + TensorFlow** → facial recognition + anti-spoofing.
- **PyJWT + Bcrypt** → authentication & encryption.

### **Database**

- **MongoDB** → flexible powerhouse, schema-free, future-proof.

---

## Getting Started 🚀

This is a **two-part operation**. Don’t skip steps.

### **Prerequisites**

- Python **3.8+**
- Node.js **16+** & npm
- MongoDB Community Server (local)

---

### **1. Backend Setup**

Navigate to the `backend` directory.

Install Python dependencies:

```bash
pip install -r requirements.txt
```
