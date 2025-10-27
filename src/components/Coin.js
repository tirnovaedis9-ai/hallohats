import React from 'react';
import './Coin.css';
import coinImage from '../assets/game/gameCOIN.png';

const Coin = ({ id, y, x }) => {
  return (
    <div 
      className="coin" 
      data-id={id}
      style={{ bottom: `calc(39% + ${y}px)`, transform: `translateX(${x}px)` }}
    >
      <img src={coinImage} alt="Coin" />
    </div>
  );
};

export default Coin;
