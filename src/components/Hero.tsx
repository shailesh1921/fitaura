import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import './Hero.css';

interface HeroProps {
  // Pass your actual .m3u8 URL here. Defaults to a dummy URL if not provided.
  videoSrc?: string;
  // Fallback gym image for slow connections or errors.
  fallbackImageSrc?: string;
}

const Hero: React.FC<HeroProps> = ({
  videoSrc = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8', // Replace with your actual fitness video
  fallbackImageSrc = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1920&auto=format&fit=crop'
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoHasError, setVideoHasError] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSrc) return;

    let hls: Hls | null = null;

    // Check if the browser natively supports HLS (e.g., Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc;
      video.addEventListener('error', () => setVideoHasError(true));
    } 
    // Otherwise, use hls.js if supported
    else if (Hls.isSupported()) {
      hls = new Hls({
        // Optional: fine-tune settings for your specific stream if needed
        enableWorker: true,
        lowLatencyMode: true,
      });

      hls.loadSource(videoSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        // Attempt to play once manifest is parsed
        video.play().catch((err) => {
          console.warn("Autoplay blocked or failed:", err);
        });
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.error('HLS Network error, attempting recovery...');
              hls?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.error('HLS Media error, attempting recovery...');
              hls?.recoverMediaError();
              break;
            default:
              console.error('HLS Fatal error, destroying instance.');
              hls?.destroy();
              setVideoHasError(true);
              break;
          }
        }
      });
    } else {
      // Browser doesn't support HLS natively or via hls.js
      setVideoHasError(true);
    }

    // Cleanup on unmount
    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [videoSrc]);

  return (
    <section className="hero-container" style={{ backgroundImage: `url(${fallbackImageSrc})` }}>
      {/* Background Video Layer */}
      {!videoHasError && (
        <video
          ref={videoRef}
          className="hero-video"
          autoPlay
          muted
          loop
          playsInline
        />
      )}

      {/* Dark-to-transparent Gradient Overlay */}
      <div className="hero-overlay"></div>

      {/* Content Layer */}
      <div className="hero-content">
        <h1 className="hero-headline">Your AI Fitness Coach</h1>
        <p className="hero-subtext">
          Personalized training and nutrition protocols driven by real-time physiological data.
        </p>
        <button className="hero-cta" onClick={() => window.location.href = '/app/dashboard.html'}>
          Start Your Transformation
        </button>
      </div>

      {/* Scroll Cue Indicator */}
      <div className="hero-scroll-cue">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </section>
  );
};

export default Hero;
