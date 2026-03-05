import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const features = [
    {
      id: 1,
      title: "Object Detection & Segmentation",
      description: "Upload an image or use live camera for zero-shot detection with advanced AI algorithms",
      icon: "🔍",
      route: "/detection",
      gradient: "from-blue-500 to-purple-600",
      delay: "0ms"
    },
    {
      id: 2,
      title: "Object Tracking",
      description: "Track multiple objects in real-time using your camera with precision tracking technology",
      icon: "🎯",
      route: "/tracking",
      gradient: "from-purple-500 to-pink-600",
      delay: "200ms"
    },
    {
      id: 3,
      title: "Scene Understanding",
      description: "Get high-level AI-powered insights about the environment with contextual analysis",
      icon: "🌆",
      route: "/scene",
      gradient: "from-pink-500 to-orange-600",
      delay: "400ms"
    }
  ];

  return (
    <div className="home-container" style={{
      '--mouse-x': `${mousePosition.x}%`,
      '--mouse-y': `${mousePosition.y}%`
    }}>
      {/* Animated Background Elements */}
      <div className="background-elements">
        <div className="floating-orb orb-1"></div>
        <div className="floating-orb orb-2"></div>
        <div className="floating-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Header Section */}
      <header className={`home-header ${isLoaded ? 'loaded' : ''}`}>
        <div className="logo-container">
          <div className="logo-icon">🤖</div>
          <h1>AI Vision Platform</h1>
        </div>
        <p className="subtitle">
          Explore our cutting-edge AI-powered computer vision features
        </p>
        <div className="header-stats">
          
          <div className="stat-item">
            <span className="stat-number">Real-time</span>
            <span className="stat-label">Processing</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">24/7</span>
            <span className="stat-label">Available</span>
          </div>
        </div>
      </header>

      {/* Features Grid */}
      <div className="features-section">
        <h2 className="features-title">Choose Your AI Experience</h2>
        <div className="card-container">
          {features.map((feature, index) => (
            <Link 
              key={feature.id}
              to={feature.route} 
              className={`feature-card ${isLoaded ? 'loaded' : ''}`}
              style={{ animationDelay: feature.delay }}
            >
              <div className="card-background"></div>
              <div className="card-content">
                <div className="icon-container">
                  <span className="feature-icon">{feature.icon}</span>
                  <div className="icon-glow"></div>
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="card-footer">
                  <span className="explore-text">Explore Feature</span>
                  <div className="arrow">→</div>
                </div>
              </div>
              <div className="card-border"></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bottom-cta">
        <p>Ready to experience the future of computer vision?</p>
        <div className="pulse-dot"></div>
      </div>

      <style jsx>{`
        .home-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-height: 100vh;
          background: 
            radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(56, 189, 248, 0.1) 0%, transparent 50%),
            linear-gradient(135deg, #0c0c0c 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #0a2647 100%);
          color: white;
          padding: 0;
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
          opacity: 0.3;
          animation: float 6s ease-in-out infinite;
        }

        .orb-1 {
          width: 200px;
          height: 200px;
          background: linear-gradient(45deg, #3b82f6, #8b5cf6);
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .orb-2 {
          width: 150px;
          height: 150px;
          background: linear-gradient(45deg, #ec4899, #f59e0b);
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }

        .orb-3 {
          width: 180px;
          height: 180px;
          background: linear-gradient(45deg, #10b981, #3b82f6);
          bottom: 20%;
          left: 60%;
          animation-delay: 4s;
        }

        .grid-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.5;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }

        .home-header {
          text-align: center;
          padding: 80px 20px 60px;
          position: relative;
          z-index: 1;
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s ease;
        }

        .home-header.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .logo-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }

        .logo-icon {
          font-size: 3rem;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6, #ec4899);
          background-size: 200% 200%;
          animation: gradientShift 3s ease infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .home-header h1 {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          margin: 0;
          background: linear-gradient(135deg, #ffffff, #e2e8f0, #cbd5e1);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.02em;
        }

        .subtitle {
          font-size: clamp(1rem, 2.5vw, 1.3rem);
          opacity: 0.8;
          margin: 20px 0 40px;
          font-weight: 300;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .header-stats {
          display: flex;
          justify-content: center;
          gap: 40px;
          margin-top: 40px;
          flex-wrap: wrap;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 5px;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .features-section {
          width: 100%;
          max-width: 1200px;
          padding: 0 20px;
          position: relative;
          z-index: 1;
        }

        .features-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 50px;
          opacity: 0.9;
        }

        .card-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
          margin-bottom: 80px;
        }

        .feature-card {
          position: relative;
          padding: 0;
          border-radius: 20px;
          text-decoration: none;
          color: white;
          display: block;
          overflow: hidden;
          opacity: 0;
          transform: translateY(50px);
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
          background: transparent;
          min-height: 280px;
        }

        .feature-card.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .card-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          transition: all 0.3s ease;
        }

        .feature-card:hover .card-background {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.08) 100%);
          border-color: rgba(255, 255, 255, 0.2);
          transform: scale(1.02);
        }

        .card-content {
          position: relative;
          z-index: 2;
          padding: 40px 30px;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .icon-container {
          position: relative;
          margin-bottom: 25px;
          display: flex;
          justify-content: center;
        }

        .feature-icon {
          font-size: 3rem;
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.5));
        }

        .icon-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 80px;
          height: 80px;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.3) 0%, transparent 70%);
          border-radius: 50%;
          animation: pulse 2s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.3; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.1; }
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 15px 0;
          text-align: center;
          background: linear-gradient(135deg, #ffffff, #e2e8f0);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .feature-description {
          font-size: 1rem;
          opacity: 0.85;
          line-height: 1.6;
          text-align: center;
          margin: 0 0 30px 0;
          font-weight: 300;
        }

        .card-footer {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-top: auto;
          padding-top: 20px;
        }

        .explore-text {
          font-size: 0.9rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          opacity: 0.8;
        }

        .arrow {
          font-size: 1.2rem;
          transition: transform 0.3s ease;
        }

        .feature-card:hover .arrow {
          transform: translateX(5px);
        }

        .card-border {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 20px;
          padding: 2px;
          background: linear-gradient(135deg, 
            rgba(59, 130, 246, 0.5) 0%, 
            rgba(139, 92, 246, 0.5) 25%, 
            rgba(236, 72, 153, 0.5) 50%, 
            rgba(245, 158, 11, 0.5) 75%, 
            rgba(16, 185, 129, 0.5) 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .feature-card:hover .card-border {
          opacity: 1;
        }

        .card-border::before {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          right: 2px;
          bottom: 2px;
          background: rgba(15, 32, 39, 0.9);
          border-radius: 18px;
        }

        .bottom-cta {
          text-align: center;
          padding: 40px 20px;
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          gap: 15px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .bottom-cta p {
          font-size: 1.1rem;
          opacity: 0.8;
          margin: 0;
          font-weight: 300;
        }

        .pulse-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: #10b981;
          animation: pulseGlow 2s ease-in-out infinite;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
        }

        @keyframes pulseGlow {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .home-header {
            padding: 60px 20px 40px;
          }

          .logo-container {
            flex-direction: column;
            gap: 10px;
          }

          .header-stats {
            gap: 20px;
          }

          .card-container {
            grid-template-columns: 1fr;
            gap: 20px;
            padding: 0 10px;
          }

          .feature-card {
            min-height: 250px;
          }

          .card-content {
            padding: 30px 25px;
          }

          .bottom-cta {
            flex-direction: column;
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .home-header {
            padding: 40px 15px 30px;
          }

          .features-title {
            font-size: 1.5rem;
            margin-bottom: 30px;
          }

          .card-container {
            padding: 0 5px;
          }

          .feature-card {
            min-height: 220px;
          }

          .card-content {
            padding: 25px 20px;
          }

          .feature-icon {
            font-size: 2.5rem;
          }

          .feature-title {
            font-size: 1.3rem;
          }

          .feature-description {
            font-size: 0.9rem;
          }
        }

        /* Accessibility */
        @media (prefers-reduced-motion: reduce) {
          .floating-orb,
          .pulse-dot,
          .icon-glow {
            animation: none;
          }
          
          .feature-card {
            transition: none;
          }
        }

        /* High contrast mode */
        @media (prefers-contrast: high) {
          .feature-card {
            border: 2px solid white;
          }
          
          .card-background {
            background: rgba(0, 0, 0, 0.8);
          }
        }

        /* Dark mode optimization */
        @media (prefers-color-scheme: dark) {
          .home-container {
            background: 
              radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(56, 189, 248, 0.15) 0%, transparent 50%),
              linear-gradient(135deg, #000000 0%, #0a0a0a 25%, #111827 50%, #1f2937 75%, #374151 100%);
          }
        }
      `}</style>
    </div>
  );
}

export default Home;