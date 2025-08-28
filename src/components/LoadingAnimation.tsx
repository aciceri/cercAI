import { useState, useEffect } from "react";
import "./LoadingAnimation.css";

interface LoadingAnimationProps {
  message?: string;
  showTimer?: boolean;
}

function LoadingAnimation({
  message = "Loading results...",
  showTimer = true,
}: LoadingAnimationProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!showTimer) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [showTimer]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="loading-animation">
      <div className="loading-spinner"></div>
      <div className="loading-text">
        <div className="loading-message">{message}</div>
        {showTimer && (
          <div className="loading-timer">
            Time elapsed: {formatTime(elapsed)}
          </div>
        )}
      </div>
    </div>
  );
}

export default LoadingAnimation;
