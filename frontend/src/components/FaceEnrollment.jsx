import React, { useState, useRef } from "react";
import Webcam from "react-webcam";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const FaceEnrollment = () => {
  const [message, setMessage] = useState("Click 'Start' to capture your face.");
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureComplete, setCaptureComplete] = useState(false);
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 720,
    height: 540,
    facingMode: "user",
  };

  const sendImagesToBackend = async (imagesSrc) => {
    try {
      const token = Cookies.get("auth_token");
      if (!token) {
        toast.error("Please log in to enroll face data.");
        setMessage("Please log in to enroll face data.");
        setIsCapturing(false);
        setCaptureComplete(false);
        return;
      }

      const payload = JSON.parse(atob(token.split(".")[1]));
      const studentId = payload.studentId;

      const res = await fetch(
        `http://127.0.0.1:5000/add-face-data/${studentId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ images: imagesSrc }),
        }
      );

      const result = await res.json();
      if (res.ok) {
        toast.success("Face data successfully enrolled!");
        setMessage("Face data successfully enrolled!");
        if (webcamRef.current && webcamRef.current.video) {
          const stream = webcamRef.current.video.srcObject;
          if (stream) {
            stream.getTracks().forEach((track) => track.stop());
          }
        }
        setCaptureComplete(true);
        setIsCapturing(false);
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        toast.error(`${result.message}`);
        setMessage(`${result.message}`);
        setIsCapturing(false);
        setCaptureComplete(false);
      }
    } catch (error) {
      toast.error(`${error}`);
      setMessage(`${error}`);
      console.error(error);
      setIsCapturing(false);
      setCaptureComplete(false);
    }
  };

  const handleCapture = async () => {
    setMessage("Capturing frames for liveness check...");
    setIsCapturing(true);
    setCaptureComplete(false);

    // Add a check to ensure webcamRef is not null before proceeding
    if (!webcamRef.current) {
      toast.error("Webcam is not ready.");
      setMessage("Webcam is not ready.");
      setIsCapturing(false);
      setCaptureComplete(false);
      return;
    }

    const images = [];
    const captureInterval = 300; // 300ms between captures

    for (let i = 0; i < 3; i++) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        images.push(imageSrc);
      } else {
        toast.error("Failed to capture image from webcam.");
        setMessage("Failed to capture image from webcam.");
        setIsCapturing(false);
        setCaptureComplete(false);
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, captureInterval));
    }

    setMessage("Images captured! Sending to server for processing...");
    sendImagesToBackend(images);
  };

  return (
    <div className="p-4 text-center bg-transparent animate-fade-in-slow">
      <h2 className="mb-4 text-2xl font-bold text-gray-100 drop-shadow-lg">
        Add Your Face Data
      </h2>
      <p className="mb-6 text-gray-400 drop-shadow-sm">{message}</p>
      <div className="relative flex items-center justify-center mb-6">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="border rounded-lg border-white/20 transform scale-x-[-1]"
        />
        {isCapturing && (
          <div className="absolute inset-0 flex items-center justify-center text-xl font-bold rounded-lg text-white/50 bg-black/50">
            Processing...
          </div>
        )}
      </div>
      {!isCapturing && !captureComplete && (
        <button
          onClick={handleCapture}
          className="relative z-10 py-3 px-6 text-white font-bold rounded-lg overflow-hidden bg-purple-600/70 shadow-lg transition-all duration-500 hover:scale-101 hover:shadow-[0_0_20px_rgba(129,59,246,0.5)] cursor-pointer disabled:opacity-50"
          disabled={isCapturing}
        >
          <span className="relative z-10">Start Face Enrollment</span>
        </button>
      )}
    </div>
  );
};

export default FaceEnrollment;
