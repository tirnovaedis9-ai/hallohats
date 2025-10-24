import React, { useState, useEffect } from 'react';
import './GameModal.css';
import Game from './Game';
import gameBG from '../assets/game/BGgame.png';
import OrientationLock from './OrientationLock'; // Import the new component

const GameModal = ({ isOpen, onClose }) => {
  const [score, setScore] = useState(0);
  const [isSoundModalOpen, setIsSoundModalOpen] = useState(false);
  
  // State to track orientation
  const [isLandscape, setIsLandscape] = useState(window.matchMedia("(orientation: landscape)").matches);

  useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscape(window.matchMedia("(orientation: landscape)").matches);
    };

    const mediaQueryList = window.matchMedia("(orientation: landscape)");
    mediaQueryList.addEventListener('change', handleOrientationChange);

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Initial check
    handleOrientationChange();

    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
      mediaQueryList.removeEventListener('change', handleOrientationChange);
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // On mobile/tablet, show orientation lock if not landscape
  const isMobileDevice = window.innerWidth <= 1024; // Consistent with CSS media query
  if (isMobileDevice && !isLandscape) {
    return <OrientationLock />;
  }

  return (
    <div className="game-modal-overlay" onClick={onClose}>
      <div className="game-modal-wrapper">
        <div className="score-notch" onClick={(e) => e.stopPropagation()}>{score}</div>
        <button className="game-modal-sound-btn" onClick={(e) => { e.stopPropagation(); setIsSoundModalOpen(true); }}>🎵</button>
        <button className="game-modal-close-btn" onClick={onClose}>&times;</button>
        <div 
          className="game-modal-content" 
          onClick={(e) => e.stopPropagation()}
          style={{ backgroundImage: `url(${gameBG})` }}
        >
          <Game
            score={score}
            setScore={setScore}
            isSoundModalOpen={isSoundModalOpen}
            setIsSoundModalOpen={setIsSoundModalOpen}
          />
        </div>
      </div>
    </div>
  );
};

export default GameModal;
