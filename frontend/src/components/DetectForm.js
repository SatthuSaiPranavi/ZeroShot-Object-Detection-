import React, { useEffect, useRef, useState } from "react";

function DetectForm() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [detections, setDetections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // File upload
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      stopCamera();
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setDetections([]);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type.startsWith('image/')) {
      stopCamera();
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setDetections([]);
    }
  };

  // Start camera - EXACT COPY from working version
  const startCamera = async () => {
    try {
      setFile(null);
      setPreview(null);
      setDetections([]);

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setStreaming(true); // mark streaming as true
      }
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  // Stop camera - EXACT COPY from working version
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setStreaming(false); // mark streaming as false
  };

  // Capture frame - EXACT COPY from working version
  const captureFrame = async () => {
    if (!videoRef.current || !prompt) {
      alert("Start camera and enter a prompt first.");
      return;
    }

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);

    const dataUrl = canvas.toDataURL("image/jpeg");
    setPreview(dataUrl);
    setDetections([]);

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/detect_camera", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image_base64: dataUrl, prompt }),
      });
      const data = await res.json();
      setDetections(data.detections);
    } catch (err) {
      console.error("Camera detect error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Detect for uploaded file - EXACT COPY from working version
  const handleDetect = async () => {
    if (!file || !prompt) {
      alert("Please upload an image and enter a prompt.");
      return;
    }

    stopCamera();

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("prompt", prompt);

    try {
      const res = await fetch("http://localhost:8000/detect", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setDetections(data.detections);
    } catch (err) {
      console.error("Error detecting:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="detect-container">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Header */}
      <header className={`detect-header ${isLoaded ? 'loaded' : ''}`}>
        <div className="header-content">
          <div className="icon-badge">🔍</div>
          <h1>Object Detection & Segmentation</h1>
          <p>Advanced AI-powered object detection with real-time segmentation capabilities</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Prompt Input Section */}
        <div className={`prompt-section ${isLoaded ? 'loaded' : ''}`}>
          <h3>Detection Prompt</h3>
          <div className="input-container">
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Enter detection prompt (e.g., red helmet, person, car)"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="prompt-input"
              />
              <div className="input-glow"></div>
            </div>
          </div>
        </div>

        {/* Upload and Camera Controls */}
        <div className={`controls-section ${isLoaded ? 'loaded' : ''}`}>
          {/* File Upload Card */}
          <div className="control-card">
            <h3>📁 Upload Image</h3>
            <div 
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-content">
                <div className="upload-icon">📸</div>
                <p>Drop an image here or click to browse</p>
                <span className="upload-hint">Supports JPG, PNG, WebP</span>
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            <button 
              onClick={handleDetect} 
              className={`action-button primary ${!file || !prompt ? 'disabled' : ''}`}
              disabled={!file || !prompt || loading}
            >
              {loading ? (
                <span className="loading-content">
                  <div className="spinner"></div>
                  Analyzing...
                </span>
              ) : (
                "🚀 Detect Objects"
              )}
            </button>
          </div>

          {/* Camera Card */}
          <div className="control-card">
            <h3>📹 Live Camera</h3>
            <div className="camera-controls">
              <button 
                onClick={startCamera}
                className="action-button secondary"
              >
                📹 Start Camera
              </button>
              <button 
                onClick={captureFrame}
                className="action-button primary"
              >
                {loading ? (
                  <span className="loading-content">
                    <div className="spinner"></div>
                    Detecting...
                  </span>
                ) : (
                  "📸 Capture & Detect"
                )}
              </button>
              <button 
                onClick={stopCamera}
                className="action-button danger"
              >
                ⏹️ Stop Camera
              </button>
            </div>
          </div>
        </div>

        {/* EXACT COPY of working layout from DetectForm copy.js */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            marginTop: "20px",
            alignItems: "flex-start",
          }}
        >
          {/* Live Camera */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{
              width: "400px",
              border: streaming ? "1px solid #ccc" : "none",
              display: streaming ? "block" : "none",
            }}
          />

          {/* Preview with detections */}
          {preview && (
            <div
              style={{
                position: "relative",
                display: "inline-block",
              }}
            >
              <img
                id="preview-img"
                src={preview}
                alt="preview"
                style={{ maxWidth: "500px", border: "1px solid #ccc" }}
              />

              {/* Masks */}
              {detections.map((det, idx) => (
                <img
                  key={`mask-${idx}`}
                  src={`data:image/png;base64,${det.mask}`}
                  alt="mask"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    maxWidth: "500px",
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                  }}
                />
              ))}

              {/* Bounding boxes */}
              {detections.map((det, idx) => {
                const [x1, y1, x2, y2] = det.box;
                const img = document.querySelector("#preview-img");
                const scaleX = img ? img.clientWidth / img.naturalWidth : 1;
                const scaleY = img ? img.clientHeight / img.naturalHeight : 1;

                return (
                  <div
                    key={`box-${idx}`}
                    style={{
                      position: "absolute",
                      left: `${x1 * scaleX}px`,
                      top: `${y1 * scaleY}px`,
                      width: `${(x2 - x1) * scaleX}px`,
                      height: `${(y2 - y1) * scaleY}px`,
                      border: "2px solid red",
                      boxSizing: "border-box",
                    }}
                  >
                    <span
                      style={{
                        background: "red",
                        color: "white",
                        fontSize: "12px",
                        padding: "2px 4px",
                        position: "absolute",
                        top: "-20px",
                        left: "0",
                      }}
                    >
                      {det.label} ({det.score.toFixed(2)})
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />

      <style jsx>{`
        .detect-container {
          min-height: 100vh;
          background: 
            linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a2647 100%);
          color: white;
          position: relative;
          overflow-x: hidden;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .background-elements {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 0;
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(40px);
          opacity: 0.2;
          animation: float 8s ease-in-out infinite;
        }

        .orb-1 {
          width: 300px;
          height: 300px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          top: 10%;
          left: -10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 200px;
          height: 200px;
          background: linear-gradient(45deg, #ec4899, #f59e0b);
          bottom: 10%;
          right: -5%;
          animation-delay: 4s;
        }

        .grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.1); }
        }

        .detect-header {
          text-align: center;
          padding: 60px 20px 40px;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .detect-header.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .header-content {
          max-width: 800px;
          margin: 0 auto;
        }

        .icon-badge {
          display: inline-block;
          font-size: 3rem;
          margin-bottom: 20px;
          padding: 20px;
          background: 
            linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2));
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
        }

        .detect-header h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          margin: 0 0 15px 0;
          background: linear-gradient(135deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .detect-header p {
          font-size: 1.1rem;
          opacity: 0.8;
          font-weight: 300;
          margin: 0;
        }

        .main-content {
          position: relative;
          z-index: 1;
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 20px 60px;
        }

        .prompt-section {
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease 0.2s;
        }

        .prompt-section.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .prompt-section h3 {
          text-align: center;
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 20px;
          color: #e2e8f0;
        }

        .input-container {
          display: flex;
          justify-content: center;
        }

        .input-wrapper {
          position: relative;
          max-width: 500px;
          width: 100%;
        }

        .prompt-input {
          width: 100%;
          padding: 16px 24px;
          font-size: 1rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          color: white;
          backdrop-filter: blur(20px);
          transition: all 0.3s ease;
          box-sizing: border-box;
        }

        .prompt-input::placeholder {
          color: rgba(255, 255, 255, 0.5);
        }

        .prompt-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: rgba(255, 255, 255, 0.08);
        }

        .input-glow {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .prompt-input:focus + .input-glow {
          opacity: 1;
        }

        .controls-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease 0.4s;
        }

        .controls-section.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .control-card {
          background: 
            linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          transition: all 0.3s ease;
        }

        .control-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .control-card h3 {
          font-size: 1.3rem;
          font-weight: 600;
          margin: 0 0 20px 0;
          text-align: center;
          color: #e2e8f0;
        }

        .upload-zone {
          border: 2px dashed rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-bottom: 20px;
          background: rgba(255, 255, 255, 0.02);
        }

        .upload-zone:hover,
        .upload-zone.drag-over {
          border-color: #3b82f6;
          background: rgba(59, 130, 246, 0.05);
          transform: scale(1.02);
        }

        .upload-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .upload-icon {
          font-size: 2.5rem;
          margin-bottom: 10px;
        }

        .upload-zone p {
          margin: 0;
          font-size: 1rem;
          font-weight: 500;
        }

        .upload-hint {
          font-size: 0.85rem;
          opacity: 0.6;
        }

        .camera-controls {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .action-button {
          padding: 14px 24px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 50px;
        }

        .action-button.primary {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
        }

        .action-button.primary:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4);
        }

        .action-button.secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .action-button.secondary:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-2px);
        }

        .action-button.danger {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .action-button.danger:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
        }

        .action-button.disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }

        .loading-content {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Results Section Styling */
        .results-wrapper {
          margin-top: 40px;
        }

        .results-flex {
          display: flex;
          gap: 30px;
          align-items: flex-start;
          flex-wrap: wrap;
        }

        .camera-display-card {
          background: 
            linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 25px;
          position: relative;
          flex: 1;
          min-width: 350px;
        }

        .camera-display-card h3 {
          margin: 0 0 15px 0;
          font-size: 1.3rem;
          color: #e2e8f0;
          text-align: center;
        }

        .live-video {
          width: 100%;
          max-width: 400px;
          border-radius: 12px;
          border: 2px solid #3b82f6;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .live-indicator {
          position: absolute;
          top: 35px;
          right: 35px;
          background: rgba(0, 0, 0, 0.7);
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: #ef4444;
          border-radius: 50%;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }

        .preview-card {
          background: 
            linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 25px;
          flex: 1;
          min-width: 350px;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .preview-header h3 {
          margin: 0;
          font-size: 1.3rem;
          color: #e2e8f0;
        }

        .detection-badge {
          background: linear-gradient(135deg, #10b981, #059669);
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .preview-container-inner {
          position: relative;
          display: inline-block;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .preview-img {
          max-width: 100%;
          height: auto;
          display: block;
          border-radius: 12px;
          border: 2px solid #3b82f6;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .detection-mask-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          border-radius: 12px;
        }

        .bounding-box-overlay {
          position: absolute;
          border: 3px solid #3b82f6;
          box-sizing: border-box;
          border-radius: 4px;
          box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
        }

        .detection-label-overlay {
          position: absolute;
          top: -30px;
          left: 0;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 4px;
          white-space: nowrap;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .detection-summary {
          margin-top: 20px;
        }

        .detection-summary h4 {
          font-size: 1.1rem;
          margin: 0 0 15px 0;
          color: #e2e8f0;
        }

        .detection-items {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .detection-item {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 10px 15px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .item-label {
          font-weight: 600;
          min-width: 80px;
          color: #e2e8f0;
          font-size: 0.9rem;
        }

        .confidence-bar {
          flex: 1;
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
        }

        .confidence-fill {
          height: 100%;
          background: linear-gradient(90deg, #10b981, #3b82f6);
          border-radius: 3px;
          transition: width 0.5s ease;
        }

        .confidence-percent {
          font-weight: 600;
          color: #3b82f6;
          min-width: 50px;
          text-align: right;
          font-size: 0.85rem;
        }

        /* Responsive Design Updates */
        @media (max-width: 768px) {
          .results-flex {
            flex-direction: column;
            gap: 20px;
          }

          .camera-display-card,
          .preview-card {
            min-width: auto;
          }

          .live-video {
            max-width: 100%;
          }

          .detection-item {
            flex-direction: column;
            align-items: stretch;
            gap: 8px;
          }

          .item-label {
            min-width: auto;
            text-align: center;
          }

          .confidence-percent {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}

export default DetectForm;
