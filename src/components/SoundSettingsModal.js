import React from 'react';
import './SoundSettingsModal.css'; // Yeni CSS dosyası oluşturulacak

const SoundSettingsModal = ({
  isOpen,
  onClose,
  isMusicPlaying,
  toggleMusic,
  musicVolume,
  setMusicVolume,
  currentMusicIndex,
  setCurrentMusicIndex,
  allMusicTracks,
  gameMusicRef // gameMusicRef'i de prop olarak alacağız
}) => {
  if (!isOpen) return null;

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setMusicVolume(newVolume);
  };

  const handleNextTrack = () => {
    const nextIndex = (currentMusicIndex + 1) % allMusicTracks.length;
    setCurrentMusicIndex(nextIndex); // Sadece state'i güncelle
  };

  const handlePrevTrack = () => {
    const prevIndex = (currentMusicIndex - 1 + allMusicTracks.length) % allMusicTracks.length;
    setCurrentMusicIndex(prevIndex); // Sadece state'i güncelle
  };

  return (
    <div className="sound-settings-modal-overlay">
          <div className="sound-settings-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="sound-settings-close-button" onClick={onClose}>X</button>
      
              <div className="music-controls">
                  <button onClick={handlePrevTrack}>{'<'}</button>
                  <div className="music-animation-container">
                      <div className={`music-animation ${isMusicPlaying ? 'playing' : ''}`}>
                          <span className="music-bar"></span>
                          <span className="music-bar"></span>
                          <span className="music-bar"></span>
                      </div>
                  </div>
                  <button onClick={handleNextTrack}>{'>'}</button>
              </div>
      
              <div className="track-indicator">
                  {allMusicTracks.map((_, index) => (
                      <span key={index} className={`track-dot ${index === currentMusicIndex ? 'active' : ''}`}></span>
                  ))}
              </div>
      
              <div className="volume-controls">
                <button onClick={toggleMusic}>
                  {isMusicPlaying ? '🔊' : '🔇'}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={musicVolume}
                  onChange={handleVolumeChange}
                />
              </div>
      </div>
    </div>
  );
};

export default SoundSettingsModal;
