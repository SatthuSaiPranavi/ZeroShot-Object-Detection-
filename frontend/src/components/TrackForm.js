import React, { useEffect, useRef, useState } from "react";

function TrackForm() {
  const [video, setVideo] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // File upload handler
  const handleVideoChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setVideo(selectedFile);
      setVideoPreview(URL.createObjectURL(selectedFile));
      setResultUrl(null);
      setUploadProgress(0);
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
    if (droppedFile && droppedFile.type.startsWith('video/')) {
      setVideo(droppedFile);
      setVideoPreview(URL.createObjectURL(droppedFile));
      setResultUrl(null);
      setUploadProgress(0);
    }
  };

  // Submit video for tracking
  const submitVideo = async () => {
    if (!video) {
      alert("Please upload a video first.");
      return;
    }

    setLoading(true);
    setResultUrl(null);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("video", video);

    try {
      const xhr = new XMLHttpRequest();
      
      // Track upload progress
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
        }
      });

      const response = await new Promise((resolve, reject) => {
        xhr.open('POST', 'http://localhost:8000/track');
        xhr.responseType = 'blob';
        
        xhr.onload = () => {
          if (xhr.status === 200) {
            resolve(xhr.response);
          } else {
            reject(new Error(`HTTP ${xhr.status}`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(formData);
      });

      const url = URL.createObjectURL(new Blob([response], { type: "video/mp4" }));
      setResultUrl(url);
    } catch (err) {
      console.error("Error tracking video:", err);
      alert("Failed to track video. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="track-container">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Header */}
      <header className={`track-header ${isLoaded ? 'loaded' : ''}`}>
        <div className="header-content">
          <div className="icon-badge">🎯</div>
          <h1>Object Tracking</h1>
          <p>Track multiple objects across video frames with precision AI algorithms</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Upload Section */}
        <div className={`upload-section ${isLoaded ? 'loaded' : ''}`}>
          <div className="upload-card">
            <h3>📹 Upload Video</h3>
            <div 
              className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-content">
                <div className="upload-icon">🎬</div>
                <p>Drop a video here or click to browse</p>
                <span className="upload-hint">Supports MP4, AVI, MOV, WebM</span>
                {video && (
                  <div className="file-info">
                    <span className="file-name">📄 {video.name}</span>
                    <span className="file-size">
                      {(video.size / (1024 * 1024)).toFixed(2)} MB
                    </span>
                  </div>
                )}
              </div>
              <input 
                ref={fileInputRef}
                type="file" 
                onChange={handleVideoChange}
                accept="video/*"
                style={{ display: 'none' }}
              />
            </div>

            {/* Upload Progress */}
            {loading && uploadProgress > 0 && uploadProgress < 100 && (
              <div className="progress-container">
                <div className="progress-label">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Track Button */}
            <button 
              onClick={submitVideo} 
              className={`action-button primary ${!video ? 'disabled' : ''}`}
              disabled={!video || loading}
            >
              {loading ? (
                <span className="loading-content">
                  <div className="spinner"></div>
                  {uploadProgress === 100 ? 'Processing...' : 'Uploading...'}
                </span>
              ) : (
                "🎯 Start Tracking"
              )}
            </button>
          </div>
        </div>

        {/* Video Display Section */}
        <div className={`video-section ${isLoaded ? 'loaded' : ''}`}>
          {/* Original Video Preview */}
          {videoPreview && (
            <div className="video-card">
              <div className="video-header">
                <h3>📹 Original Video</h3>
                <span className="video-badge">Input</span>
              </div>
              <div className="video-container">
                <video 
                  src={videoPreview} 
                  controls 
                  className="video-player"
                />
              </div>
            </div>
          )}

          {/* Tracked Result Video */}
          {resultUrl && (
            <div className="video-card result-card">
              <div className="video-header">
                <h3>🎯 Tracked Result</h3>
                <span className="video-badge success">Output</span>
              </div>
              <div className="video-container">
                <video 
                  src={resultUrl} 
                  controls 
                  className="video-player"
                />
              </div>
              <div className="result-actions">
                <a 
                  href={resultUrl} 
                  download="tracked_video.mp4"
                  className="download-button"
                >
                  💾 Download Result
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Info Cards */}
        {!videoPreview && !resultUrl && (
          <div className={`info-section ${isLoaded ? 'loaded' : ''}`}>
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h4>Real-time Processing</h4>
              <p>Advanced algorithms process your video frame by frame</p>
            </div>
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h4>Multi-object Tracking</h4>
              <p>Track multiple objects simultaneously with high accuracy</p>
            </div>
            
          </div>
        )}
      </div>

      <style jsx>{`
        .track-container {
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
          background: linear-gradient(45deg, #8b5cf6, #ec4899);
          top: 10%;
          left: -10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 200px;
          height: 200px;
          background: linear-gradient(45deg, #f59e0b, #10b981);
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

        .track-header {
          text-align: center;
          padding: 60px 20px 40px;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .track-header.loaded {
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
            linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2));
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
        }

        .track-header h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          margin: 0 0 15px 0;
          background: linear-gradient(135deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .track-header p {
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

        .upload-section {
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease 0.2s;
          display: flex;
          justify-content: center;
        }

        .upload-section.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .upload-card {
          background: 
            linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 30px;
          max-width: 600px;
          width: 100%;
          transition: all 0.3s ease;
        }

        .upload-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .upload-card h3 {
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
          border-color: #8b5cf6;
          background: rgba(139, 92, 246, 0.05);
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

        .file-info {
          margin-top: 15px;
          padding: 12px 20px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .file-name {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .file-size {
          font-size: 0.8rem;
          opacity: 0.7;
        }

        .progress-container {
          margin-bottom: 20px;
        }

        .progress-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .progress-bar {
          height: 8px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #8b5cf6, #ec4899);
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .action-button {
          width: 100%;
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
          background: linear-gradient(135deg, #8b5cf6, #ec4899);
          color: white;
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3);
        }

        .action-button.primary:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.4);
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

        .video-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease 0.4s;
        }

        .video-section.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .video-card {
          background: 
            linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 25px;
          transition: all 0.3s ease;
        }

        .video-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .video-card.result-card {
          border-color: rgba(16, 185, 129, 0.3);
        }

        .video-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .video-header h3 {
          margin: 0;
          font-size: 1.3rem;
          color: #e2e8f0;
        }

        .video-badge {
          background: rgba(139, 92, 246, 0.2);
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .video-badge.success {
          background: rgba(16, 185, 129, 0.2);
          border-color: rgba(16, 185, 129, 0.3);
        }

        .video-container {
          border-radius: 12px;
          overflow: hidden;
          background: #000;
        }

        .video-player {
          width: 100%;
          display: block;
          border-radius: 12px;
        }

        .result-actions {
          margin-top: 20px;
          display: flex;
          justify-content: center;
        }

        .download-button {
          padding: 12px 24px;
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          text-decoration: none;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        .download-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4);
        }

        .info-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease 0.6s;
        }

        .info-section.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .info-card {
          background: 
            linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 25px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .info-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .info-icon {
          font-size: 2.5rem;
          margin-bottom: 15px;
        }

        .info-card h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 10px 0;
          color: #e2e8f0;
        }

        .info-card p {
          font-size: 0.9rem;
          opacity: 0.8;
          margin: 0;
          line-height: 1.5;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .track-header {
            padding: 40px 20px 30px;
          }

          .video-section {
            grid-template-columns: 1fr;
          }

          .info-section {
            grid-template-columns: 1fr;
          }

          .upload-card {
            padding: 25px 20px;
          }
        }

        @media (max-width: 480px) {
          .icon-badge {
            font-size: 2.5rem;
            padding: 15px;
          }

          .track-header h1 {
            font-size: 1.8rem;
          }

          .track-header p {
            font-size: 1rem;
          }

          .upload-zone {
            padding: 30px 15px;
          }

          .upload-icon {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
}

export default TrackForm;