import React from 'react';
import './Obstacle.css';
import obstacleImage from '../assets/game/obstacle.png';

const Obstacle = ({ id, x }) => {
  return (
    <div 
      className="obstacle" 
      data-id={id} 
      style={{ left: `${x}px` }}
    >
      <img src={obstacleImage} alt="Obstacle" />
    </div>
  );
};

export default Obstacle;
