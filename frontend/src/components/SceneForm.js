import React, { useEffect, useRef, useState } from "react";

function SceneForm() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Function to call backend API directly
  const getSceneUnderstanding = async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    
    try {
      const response = await fetch(
        "http://localhost:8000/scene-understanding/",
        {
          method: "POST",
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error("Failed to fetch scene description");
      }
      
      return await response.json();
    } catch (err) {
      console.error("Error fetching scene understanding:", err);
      throw err;
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setCaption("");
      setError("");
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
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setCaption("");
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError("Please select an image first.");
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const result = await getSceneUnderstanding(file);
      setCaption(result.scene_description || "No caption returned.");
    } catch (err) {
      setError("Failed to get scene caption. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scene-container">
      {/* Background Elements */}
      <div className="background-elements">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Header */}
      <header className={`scene-header ${isLoaded ? 'loaded' : ''}`}>
        <div className="header-content">
          <div className="icon-badge">🌆</div>
          <h1>Scene Understanding</h1>
          <p>Get high-level AI-powered insights about the environment with contextual analysis</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Upload Section */}
        <div className={`upload-section ${isLoaded ? 'loaded' : ''}`}>
          <div className="upload-card">
            <h3>📁 Upload Image for Analysis</h3>
            <form onSubmit={handleSubmit}>
              <div 
                className={`upload-zone ${dragOver ? 'drag-over' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="upload-content">
                  <div className="upload-icon">🖼️</div>
                  <p>Drop an image here or click to browse</p>
                  <span className="upload-hint">Supports JPG, PNG, WebP</span>
                  {file && (
                    <div className="file-info">
                      <span className="file-name">📄 {file.name}</span>
                      <span className="file-size">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </span>
                    </div>
                  )}
                </div>
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>

              <button 
                type="submit"
                className={`action-button primary ${!file ? 'disabled' : ''}`}
                disabled={!file || loading}
              >
                {loading ? (
                  <span className="loading-content">
                    <div className="spinner"></div>
                    Analyzing Scene...
                  </span>
                ) : (
                  "🔍 Analyze Scene"
                )}
              </button>
            </form>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {(preview || caption) && (
          <div className={`results-section ${isLoaded ? 'loaded' : ''}`}>
            {/* Image Preview */}
            {preview && (
              <div className="preview-card">
                <div className="preview-header">
                  <h3>📸 Uploaded Image</h3>
                </div>
                <div className="image-container">
                  <img 
                    src={preview} 
                    alt="Scene preview" 
                    className="preview-image"
                  />
                </div>
              </div>
            )}

            {/* Scene Description */}
            {caption && (
              <div className="caption-card">
                <div className="caption-header">
                  <h3>🌆 Scene Analysis</h3>
                </div>
                <div className="caption-content">
                  <div className="caption-icon">💬</div>
                  <p className="caption-text">{caption}</p>
                </div>
                <div className="caption-footer">
                  <span className="caption-hint">
                    ✨ Powered by advanced computer vision AI
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Cards - Show when no results */}
        {!preview && !caption && (
          <div className={`info-section ${isLoaded ? 'loaded' : ''}`}>
            
            <div className="info-card">
              <div className="info-icon">🎯</div>
              <h4>Contextual Understanding</h4>
              <p>Get detailed descriptions including objects, activities, and atmosphere</p>
            </div>
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <h4>Instant Results</h4>
              <p>Receive comprehensive scene descriptions in seconds</p>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .scene-container {
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
          background: linear-gradient(45deg, #ec4899, #f59e0b);
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

        .scene-header {
          text-align: center;
          padding: 60px 20px 40px;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .scene-header.loaded {
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
            linear-gradient(135deg, rgba(236, 72, 153, 0.2), rgba(245, 158, 11, 0.2));
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
        }

        .scene-header h1 {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          margin: 0 0 15px 0;
          background: linear-gradient(135deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .scene-header p {
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
          border-color: #ec4899;
          background: rgba(236, 72, 153, 0.05);
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
          background: rgba(236, 72, 153, 0.1);
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          border: 1px solid rgba(236, 72, 153, 0.3);
        }

        .file-name {
          font-size: 0.9rem;
          font-weight: 500;
        }

        .file-size {
          font-size: 0.8rem;
          opacity: 0.7;
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
          background: linear-gradient(135deg, #ec4899, #f59e0b);
          color: white;
          box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
        }

        .action-button.primary:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(236, 72, 153, 0.4);
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

        .error-message {
          margin-top: 20px;
          padding: 12px 20px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 12px;
          color: #fca5a5;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.95rem;
        }

        .error-icon {
          font-size: 1.2rem;
        }

        .results-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease 0.4s;
        }

        .results-section.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .preview-card,
        .caption-card {
          background: 
            linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          padding: 25px;
          transition: all 0.3s ease;
        }

        .preview-card:hover,
        .caption-card:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-5px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .preview-header,
        .caption-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }

        .preview-header h3,
        .caption-header h3 {
          margin: 0;
          font-size: 1.3rem;
          color: #e2e8f0;
        }

        .caption-badge {
          background: linear-gradient(135deg, #ec4899, #f59e0b);
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .image-container {
          border-radius: 12px;
          overflow: hidden;
          background: #000;
        }

        .preview-image {
          width: 100%;
          height: auto;
          display: block;
          border-radius: 12px;
        }

        .caption-content {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 25px;
          margin-bottom: 15px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .caption-icon {
          font-size: 2rem;
          margin-bottom: 15px;
          text-align: center;
        }

        .caption-text {
          font-size: 1.05rem;
          line-height: 1.7;
          color: #e2e8f0;
          margin: 0;
          text-align: justify;
        }

        .caption-footer {
          text-align: center;
          padding-top: 10px;
        }

        .caption-hint {
          font-size: 0.85rem;
          opacity: 0.6;
          font-style: italic;
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
          .scene-header {
            padding: 40px 20px 30px;
          }

          .results-section {
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

          .scene-header h1 {
            font-size: 1.8rem;
          }

          .scene-header p {
            font-size: 1rem;
          }

          .upload-zone {
            padding: 30px 15px;
          }

          .upload-icon {
            font-size: 2rem;
          }

          .caption-text {
            font-size: 0.95rem;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .floating-orb {
            animation: none;
          }
          
          .scene-header,
          .upload-section,
          .results-section,
          .info-section {
            transition: none;
          }
        }
      `}</style>
    </div>
  );
}

export default SceneForm;