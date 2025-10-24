
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Button } from 'react-bootstrap';
import './Hero.css';
import icon3d from '../assets/images/3d-icon.png';
import shopIcon from '../assets/images/shop.png';
import startIcon from '../assets/game/start.png';
import GameModal from './GameModal';

const Hero = ({ onOpenMemeGenerator, onOpenShopModal }) => {
  const { t } = useTranslation();
  const [isGameModalOpen, setGameModalOpen] = useState(false);

  return (
    <div className="hero-section">
      <Container className="h-100 d-flex flex-column justify-content-center align-items-center text-center text-white hero-content">
        <div>
          <h1 className="hero-slogan display-4 fw-bold">{t('hero.slogan')}</h1>
          <p className="lead fs-4 text-white-75 fw-light">{t('hero.subtitle')}</p>
          <Button variant="danger" size="lg" className="mt-4 hero-btn">{t('hero.buy_button')}</Button>
        </div>
      </Container>
      <img 
        src={icon3d} 
        alt="Meme Generator" 
        className="pfp-editor-icon"
        onClick={onOpenMemeGenerator}
      />
      <img 
        src={shopIcon} 
        alt="Shop" 
        className="shop-icon"
        onClick={onOpenShopModal}
      />
      <img
        src={startIcon}
        alt="Start Game"
        className="game-start-icon"
        onClick={() => setGameModalOpen(true)}
      />
      <GameModal isOpen={isGameModalOpen} onClose={() => setGameModalOpen(false)} />
    </div>
  );
};

export default Hero;
