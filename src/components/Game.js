import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Game.css';
import Obstacle from './Obstacle';
import Coin from './Coin';

// Animation frames
import frame1 from '../assets/game/pozisyon(1).png';
import frame2 from '../assets/game/pozisyon(2).png';
import frame3 from '../assets/game/pozisyon(3).png';
import frame4 from '../assets/game/pozisyon(4).png';
import frame5 from '../assets/game/pozisyon(5).png';
import frame6 from '../assets/game/pozisyon(6).png';
import frame7 from '../assets/game/pozisyon(7).png';
import frame8 from '../assets/game/pozisyon(8).png';
import frame9 from '../assets/game/pozisyon(9).png';
import frame10 from '../assets/game/pozisyon(10).png';
import frame11 from '../assets/game/pozisyon(11).png';
import frame12 from '../assets/game/pozisyon(12).png';
import frame13 from '../assets/game/pozisyon(13).png';

// Game assets
import coinImage from '../assets/game/gameCOIN.png';
import gameBG from '../assets/game/BGgame.png';
import gameWay from '../assets/game/gameWAY.png';

// Celestial Body Assets
import sunImage from '../assets/game/uSUNgame.png';
import mercuryImage from '../assets/game/uMERCURYgame.png';
import venusImage from '../assets/game/uVENÜSgame.png';
import worldImage from '../assets/game/uWORLDgame.png';
import marsImage from '../assets/game/uMARSgame.png';
import saturnImage from '../assets/game/uSATÜRNgame.png';
import uranusImage from '../assets/game/uURANÜSgame.png';
import neptuneImage from '../assets/game/uNEPTÜNgame.png';
import blackHoleImage from '../assets/game/uTON618game.png';
import blackHoleSound from '../assets/game/sound/BlackHole.mp3';
import gameMusic1 from '../assets/game/sound/sound (1).mp3';
import gameMusic2 from '../assets/game/sound/sound (2).mp3';
import gameMusic3 from '../assets/game/sound/sound (3).mp3';
import SoundSettingsModal from './SoundSettingsModal';

import frontCaracter1 from '../assets/game/Caracter/frontCaracter (1).png';
import frontCaracter2 from '../assets/game/Caracter/frontCaracter (2).png';
import frontCaracter3 from '../assets/game/Caracter/frontCaracter (3).png';
import frontCaracter4 from '../assets/game/Caracter/frontCaracter (4).png';
import frontCaracter5 from '../assets/game/Caracter/frontCaracter (5).png';
import frontCaracter6 from '../assets/game/Caracter/frontCaracter (6).png';
import frontCaracter7 from '../assets/game/Caracter/frontCaracter (7).png';
import frontCaracter8 from '../assets/game/Caracter/frontCaracter (8).png';
import frontCaracter9 from '../assets/game/Caracter/frontCaracter (9).png';
import frontCaracter10 from '../assets/game/Caracter/frontCaracter (10).png';
import frontCaracter11 from '../assets/game/Caracter/frontCaracter (11).png';
import frontCaracter12 from '../assets/game/Caracter/frontCaracter (12).png';
import frontCaracter13 from '../assets/game/Caracter/frontCaracter (13).png';
import frontCaracter14 from '../assets/game/Caracter/frontCaracter (14).png';
import frontCaracter15 from '../assets/game/Caracter/frontCaracter (15).png';

import backCaracter1 from '../assets/game/Caracter/backCaracter (1).png';
import backCaracter2 from '../assets/game/Caracter/backCaracter (2).png';
import backCaracter3 from '../assets/game/Caracter/backCaracter (3).png';
import backCaracter4 from '../assets/game/Caracter/backCaracter (4).png';
import backCaracter5 from '../assets/game/Caracter/backCaracter (5).png';
import backCaracter6 from '../assets/game/Caracter/backCaracter (6).png';
import backCaracter7 from '../assets/game/Caracter/backCaracter (7).png';
import backCaracter8 from '../assets/game/Caracter/backCaracter (8).png';
import backCaracter9 from '../assets/game/Caracter/backCaracter (9).png';
import backCaracter10 from '../assets/game/Caracter/backCaracter (10).png';
import backCaracter11 from '../assets/game/Caracter/backCaracter (11).png';
import backCaracter12 from '../assets/game/Caracter/backCaracter (12).png';
import backCaracter13 from '../assets/game/Caracter/backCaracter (13).png';
import backCaracter14 from '../assets/game/Caracter/backCaracter (14).png';
import backCaracter15 from '../assets/game/Caracter/backCaracter (15).png';

const FRONT_CHARACTERS = [
  frontCaracter1, frontCaracter2, frontCaracter3, frontCaracter4, frontCaracter5,
  frontCaracter6, frontCaracter7, frontCaracter8, frontCaracter9, frontCaracter10, frontCaracter11, frontCaracter12, frontCaracter13, frontCaracter14, frontCaracter15
];
const BACK_CHARACTERS = [
  backCaracter1, backCaracter2, backCaracter3, backCaracter4, backCaracter5,
  backCaracter6, backCaracter7, backCaracter8, backCaracter9, backCaracter10, backCaracter11, backCaracter12, backCaracter13, backCaracter14, backCaracter15
];

// --- GAME CONSTANTS ---
const runFrames = [frame1, frame2, frame3, frame4];
const jumpFrames = [frame5, frame6, frame7, frame8, frame9, frame10, frame11, frame12, frame13];
const JUMP_ANIMATION_SPEED = 80;
const JUMP_FORCE = 15; // Initial force for a small jump
const GRAVITY = -1.5;
const FLOAT_GRAVITY = -0.4; // Lighter gravity while floating
const MAX_FLOAT_FRAMES = 90; // 1.5 seconds at 60fps
const GAME_SPEED = 2;

// --- CELESTIAL SEQUENCE ---
const PLANETS = [worldImage, mercuryImage, venusImage, marsImage, saturnImage, uranusImage, neptuneImage];
const PLANET_COUNT = PLANETS.length; // This will be 7
const BLACK_HOLE_INDEX = PLANET_COUNT; // Index 7 (after all planets)
const CELESTIAL_BODIES = [...PLANETS, blackHoleImage]; // Black hole is now at index 7

// Entity Dimensions
const PLAYER_WIDTH = 65;
const PLAYER_HEIGHT = 113;
const OBSTACLE_WIDTH = 40;
const OBSTACLE_HEIGHT = 80;
const COIN_WIDTH = 40;
const COIN_HEIGHT = 40;

const ALL_GAME_MUSIC = [gameMusic1, gameMusic2, gameMusic3];

const Game = ({ score, setScore, isSoundModalOpen, setIsSoundModalOpen }) => {
  // Player State
  const [isFalling, setIsFalling] = useState(false);
  const [jumpVelocity, setJumpVelocity] = useState(0);
  const [playerPositionY, setPlayerPositionY] = useState(0);

  // Game Object State
  const [obstacles, setObstacles] = useState([]);
  const [coins, setCoins] = useState([]);

  // Game Meta State
  const [isGameOver, setIsGameOver] = useState(false);
  const [runFrameIndex, setRunFrameIndex] = useState(0);
  const [jumpFrameIndex, setJumpFrameIndex] = useState(0);
  const [scoreToAdd, setScoreToAdd] = useState(0);
  const gameMusicRef = useRef(null);
  const [currentMusicIndex, setCurrentMusicIndex] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(true);
  const [musicVolume, setMusicVolume] = useState(0.5);


  // --- Celestial Body & Effects State ---
  const [roadPosition, setRoadPosition] = useState(0);
  const [celestialBodyIndex, setCelestialBodyIndex] = useState(0);
  const [planetXPos, setPlanetXPos] = useState(window.innerWidth);
  const [isBlackHoleCentered, setIsBlackHoleCentered] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [breathScale, setBreathScale] = useState(1);
  const [isCharactersPulled, setIsCharactersPulled] = useState(false);
  const [isGamePaused, setIsGamePaused] = useState(false);

  useEffect(() => {
    // This cleanup function will run when the component unmounts
    return () => {
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []); // Empty dependency array means this runs only on mount and unmount

  useEffect(() => {
    setIsGamePaused(isSoundModalOpen);
  }, [isSoundModalOpen]);

  const toggleMusic = useCallback(() => {
    setIsMusicPlaying(prev => !prev);
  }, []);
  const CHARACTER_COUNT = 15;
  const CHARACTER_SIZE = 60;
  const CHARACTER_HORIZONTAL_PADDING = 130;
  const CHARACTER_VERTICAL_OFFSET = 0;
  const CHARACTER_MAX_VERTICAL_RANGE = 200;

  const [characters, setCharacters] = useState(() => {
    const initialCharacters = [];
    const availableWidth = window.innerWidth - 2 * CHARACTER_HORIZONTAL_PADDING;
    const availableHeight = CHARACTER_MAX_VERTICAL_RANGE - CHARACTER_SIZE;

    const numCols = Math.ceil(Math.sqrt(CHARACTER_COUNT));
    const numRows = Math.ceil(CHARACTER_COUNT / numCols);

    const cellWidth = availableWidth / numCols;
    const cellHeight = availableHeight / numRows;

    let placedCount = 0;
    for (let row = 0; row < numRows && placedCount < CHARACTER_COUNT; row++) {
      for (let col = 0; col < numCols && placedCount < CHARACTER_COUNT; col++) {
        const xOffset = CHARACTER_HORIZONTAL_PADDING + col * cellWidth;
        const yOffset = CHARACTER_VERTICAL_OFFSET + row * cellHeight;

        let randomXInCell = xOffset + Math.random() * (cellWidth - CHARACTER_SIZE);
        randomXInCell = Math.max(CHARACTER_HORIZONTAL_PADDING, Math.min(randomXInCell, window.innerWidth - CHARACTER_HORIZONTAL_PADDING - CHARACTER_SIZE));

        let randomYInCell = yOffset + Math.random() * (cellHeight - CHARACTER_SIZE);
        randomYInCell = Math.max(CHARACTER_VERTICAL_OFFSET, Math.min(randomYInCell, CHARACTER_MAX_VERTICAL_RANGE - CHARACTER_SIZE));

        initialCharacters.push({
          id: placedCount,
          isFacingFront: Math.random() > 0.5,
          image: Math.random() > 0.5 ? FRONT_CHARACTERS[placedCount] : BACK_CHARACTERS[placedCount],
          status: 'active',
          x: randomXInCell,
          y: randomYInCell,
        });
        placedCount++;
      }
    }
    return initialCharacters;
  });

  // Screen Dimensions
  const [screenDimensions, setScreenDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [gameContainerHeight, setGameContainerHeight] = useState(0);

  // Refs
  const gameContainerRef = useRef(null);
  const playerRef = useRef(null);
  const shakeTriggeredRef = useRef(false);
  const audioRef = useRef(null);
  const jumpRequestRef = useRef(false);
  const coyoteTimeCounterRef = useRef(0);
  const floatDurationCounterRef = useRef(0);
  const jumpHoldRef = useRef(false);
  const jumpLockRef = useRef(false); // Prevents multiple jump triggers
  const gameOverRef = useRef(false);

  const animationFrameRef = useRef(null);
  const celestialBodyIndexRef = useRef(celestialBodyIndex);
  const planetXPosRef = useRef(planetXPos);
  const isBlackHoleCenteredRef = useRef(isBlackHoleCentered);
  const isShakingRef = useRef(isShaking);
  const hasIncrementedRef = useRef(false);

  useEffect(() => { celestialBodyIndexRef.current = celestialBodyIndex; }, [celestialBodyIndex]);
  useEffect(() => { planetXPosRef.current = planetXPos; }, [planetXPos]);
  useEffect(() => { isBlackHoleCenteredRef.current = isBlackHoleCentered; }, [isBlackHoleCentered]);
  useEffect(() => { isShakingRef.current = isShaking; }, [isShaking]);

  useEffect(() => {
    if (!gameMusicRef.current) {
      gameMusicRef.current = new Audio(ALL_GAME_MUSIC[currentMusicIndex]);
      gameMusicRef.current.loop = true;
    } else {
      gameMusicRef.current.src = ALL_GAME_MUSIC[currentMusicIndex];
      gameMusicRef.current.load();
    }

    if (isMusicPlaying) {
      gameMusicRef.current.play().catch(e => console.error("Play error:", e));
    }
  }, [currentMusicIndex, isMusicPlaying]);

  useEffect(() => {
    if (gameMusicRef.current) {
      if (isMusicPlaying && !isGameOver) {
        gameMusicRef.current.play().catch(e => console.error("Play error:", e));
      } else {
        gameMusicRef.current.pause();
      }
    }
    return () => {
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
      }
    };
  }, [isMusicPlaying, isGameOver]);

  useEffect(() => {
    if (gameMusicRef.current) {
      gameMusicRef.current.volume = musicVolume;
    }
  }, [musicVolume]);

  useEffect(() => {
    const handleResize = () => {
      setScreenDimensions({ width: window.innerWidth, height: window.innerHeight });
      if (gameContainerRef.current) {
        setGameContainerHeight(gameContainerRef.current.offsetHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const allImages = [
      ...runFrames, ...jumpFrames, coinImage, gameBG, gameWay,
      ...PLANETS, sunImage, blackHoleImage
    ];
    allImages.forEach(src => { if(typeof src === 'string') new Image().src = src; });
  }, []);

  const jumpVelocityRef = useRef(jumpVelocity);
  useEffect(() => { jumpVelocityRef.current = jumpVelocity; }, [jumpVelocity]);

  const playerPositionYRef = useRef(playerPositionY);
  useEffect(() => { playerPositionYRef.current = playerPositionY; }, [playerPositionY]);

  const isMusicPlayingRef = useRef(isMusicPlaying);
  useEffect(() => { isMusicPlayingRef.current = isMusicPlaying; }, [isMusicPlaying]);

  const gameContainerHeightRef = useRef(gameContainerHeight);
  useEffect(() => { gameContainerHeightRef.current = gameContainerHeight; }, [gameContainerHeight]);

  const screenDimensionsRef = useRef(screenDimensions);
  useEffect(() => { screenDimensionsRef.current = screenDimensions; }, [screenDimensions]);


  useEffect(() => {
    if (isGameOver || isGamePaused) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const update = () => {
      // --- Animation of celestial bodies and road ---
      const currentCelestialBodyIndex = celestialBodyIndexRef.current;
      const breathAmplitude = isBlackHoleCenteredRef.current ? 0.06 : 0.03;
      const breath = 1 + Math.sin(Date.now() / 800) * breathAmplitude;
      setBreathScale(breath);
      const isCurrentBodyBlackHole = currentCelestialBodyIndex === BLACK_HOLE_INDEX;

      setRoadPosition(prevPos => {
        const newPos = prevPos - GAME_SPEED;
        if (newPos <= -screenDimensionsRef.current.width) return 0;
        return newPos;
      });

      if (isCurrentBodyBlackHole) {
        if (!shakeTriggeredRef.current) {
          setIsShaking(true);
          shakeTriggeredRef.current = true;
          if (!audioRef.current) {
            audioRef.current = new Audio(blackHoleSound);
            audioRef.current.loop = true;
            audioRef.current.play();
          }
          if (gameMusicRef.current) {
            gameMusicRef.current.pause();
          }
        }

        if (!isBlackHoleCenteredRef.current) {
          setPlanetXPos(prevPos => {
            const blackHoleVisualWidth = screenDimensionsRef.current.width * 0.18;
            const targetXPos = (screenDimensionsRef.current.width / 2) - (blackHoleVisualWidth / 2);

            if (prevPos > targetXPos) {
              const newPos = prevPos - GAME_SPEED;
              return newPos < targetXPos ? targetXPos : newPos;
            } else {
              setIsBlackHoleCentered(true);
              setIsCharactersPulled(true);
              return targetXPos;
            }
          });
        }
      } else {
        setPlanetXPos(prevPos => {
          const newPos = prevPos - GAME_SPEED * 1.5;
          const planetVisualWidth = screenDimensionsRef.current.width * 0.2;
          if (newPos <= -planetVisualWidth) {
            if (!hasIncrementedRef.current) {
                setCelestialBodyIndex(prevIndex => prevIndex + 1);
                hasIncrementedRef.current = true;
            }
            return screenDimensionsRef.current.width;
          } else {
            hasIncrementedRef.current = false;
          }
          return newPos;
        });
        if (gameMusicRef.current && isMusicPlayingRef.current) {
          gameMusicRef.current.play();
        }
      }

      // --- Player physics and movement ---
      let newVelocity = jumpVelocityRef.current;

      if (jumpRequestRef.current && coyoteTimeCounterRef.current > 0) {
        newVelocity = JUMP_FORCE;
        coyoteTimeCounterRef.current = 0;
        floatDurationCounterRef.current = 0;
      }
      jumpRequestRef.current = false;

      if (jumpHoldRef.current && newVelocity > 0 && floatDurationCounterRef.current < MAX_FLOAT_FRAMES) {
        newVelocity += FLOAT_GRAVITY;
        floatDurationCounterRef.current++;
      } else {
        newVelocity += GRAVITY;
      }

      let newY = playerPositionYRef.current + newVelocity;
      const groundY = gameContainerHeightRef.current * 0.61;

      if (newY > groundY - PLAYER_HEIGHT) {
        newY = groundY - PLAYER_HEIGHT;
        newVelocity = 0;
      }

      const playerBox = {
        x: screenDimensionsRef.current.width * 0.15,
        y: groundY - newY - PLAYER_HEIGHT,
        width: PLAYER_WIDTH,
        height: PLAYER_HEIGHT
      };

      let onSurface = false;

      setObstacles(prevObstacles => {
        const updatedObstacles = prevObstacles.map(o => ({ ...o, x: o.x - GAME_SPEED })).filter(o => o.x > -OBSTACLE_WIDTH);

        for (const obstacle of updatedObstacles) {
          const horizontalPadding = 10;
          const verticalPadding = 0;
          const obstacleBox = {
            x: obstacle.x + horizontalPadding,
            y: groundY - OBSTACLE_HEIGHT + verticalPadding - 10, // Shifted up by 10 pixels
            width: OBSTACLE_WIDTH - (horizontalPadding * 2),
            height: OBSTACLE_HEIGHT
          };

          if (playerBox.x < obstacleBox.x + obstacleBox.width && playerBox.x + playerBox.width > obstacleBox.x) {
            const playerBottom = playerBox.y + playerBox.height;
            const obstacleTop = obstacleBox.y;
            const landingTolerance = 5; // pixels

            // Check for landing on top of the obstacle
            if (
              newVelocity <= 0 && // Player is moving down
              playerBottom >= obstacleTop && // Player's feet are at or below the obstacle's top
              (playerBottom - newVelocity) <= obstacleTop + landingTolerance // Player was above the obstacle in the previous frame
            ) {
              onSurface = true;
              newY = OBSTACLE_HEIGHT - verticalPadding + 5; // Position player on top of the obstacle
              newVelocity = 0;
              break;
            } 
            // Check for collision with the side of the obstacle
            else if (playerBox.y < obstacleBox.y + obstacleBox.height && playerBox.y + playerBox.height > obstacleBox.y) {
              gameOverRef.current = true;
              break;
            }
          }
        }
        return updatedObstacles;
      });

      if (gameOverRef.current) {
        setIsGameOver(true);
        return; // Stop the loop on game over
      }

      // Ground collision check
      if (!onSurface && newY < 0) {
        newY = 0;
        newVelocity = 0;
        onSurface = true; // Now on ground
      }

      if (onSurface) { // If on any surface (obstacle or ground)
        coyoteTimeCounterRef.current = 10;
        setIsFalling(false);
        jumpLockRef.current = false;
      } else { // In air
        coyoteTimeCounterRef.current--;
        setIsFalling(true);
      }

      setPlayerPositionY(newY);
      setJumpVelocity(newVelocity);



      // --- Coin collection ---
      setCoins(prevCoins => {
        const playerBox = {
          x: screenDimensionsRef.current.width * 0.15,
          y: groundY - newY - PLAYER_HEIGHT,
          width: PLAYER_WIDTH,
          height: PLAYER_HEIGHT
        };
        let collectedCoinIds = new Set();

        const updatedCoins = prevCoins.map(c => ({
          ...c,
          x: c.x - GAME_SPEED
        })).filter(c => {
          if (c.x < -COIN_WIDTH) return false; // Off-screen check

          const coinBox = {
            x: c.x,
            y: groundY - c.y - COIN_HEIGHT,
            width: COIN_WIDTH,
            height: COIN_HEIGHT
          };

          if (playerBox.x < coinBox.x + coinBox.width &&
              playerBox.x + playerBox.width > coinBox.x &&
              playerBox.y < coinBox.y + coinBox.height &&
              playerBox.y + playerBox.height > coinBox.y) {
            collectedCoinIds.add(c.id);
            return false; // Remove collected coins
          }
          return true;
        });

        if (collectedCoinIds.size > 0) {
          setScoreToAdd(prev => prev + 10 * collectedCoinIds.size);
        }
        return updatedCoins;
      });

      animationFrameRef.current = requestAnimationFrame(update);
    };

    animationFrameRef.current = requestAnimationFrame(update);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isGameOver, isGamePaused, isFalling, jumpFrameIndex, runFrameIndex]);


  const restartGame = useCallback(() => {
    setIsGameOver(false);
    setObstacles([]);
    setCoins([]);
    setIsFalling(false);
    setJumpVelocity(0);
    setPlayerPositionY(0);
    setScore(0);
    setRunFrameIndex(0);
    setJumpFrameIndex(0);
    setRoadPosition(0);
    setCelestialBodyIndex(0);
    setPlanetXPos(window.innerWidth);
    setIsBlackHoleCentered(false);
    setIsShaking(false);
    shakeTriggeredRef.current = false;
    setIsCharactersPulled(false);
    jumpLockRef.current = false; // Reset jump lock
    gameOverRef.current = false; // Reset game over ref
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (gameMusicRef.current) {
      gameMusicRef.current.pause();
      gameMusicRef.current.currentTime = 0;
      setIsMusicPlaying(true);
    }
    setCharacters(() => {
      const initialCharacters = [];
      const availableWidth = window.innerWidth - 2 * CHARACTER_HORIZONTAL_PADDING;
      const availableHeight = CHARACTER_MAX_VERTICAL_RANGE - CHARACTER_SIZE;

      const numCols = Math.ceil(Math.sqrt(CHARACTER_COUNT));
      const numRows = Math.ceil(CHARACTER_COUNT / numCols);

      const cellWidth = availableWidth / numCols;
      const cellHeight = availableHeight / numRows;

      let placedCount = 0;
      for (let row = 0; row < numRows && placedCount < CHARACTER_COUNT; row++) {
        for (let col = 0; col < numCols && placedCount < CHARACTER_COUNT; col++) {
          const xOffset = CHARACTER_HORIZONTAL_PADDING + col * cellWidth;
          const yOffset = CHARACTER_VERTICAL_OFFSET + row * cellHeight;

          let randomXInCell = xOffset + Math.random() * (cellWidth - CHARACTER_SIZE);
          randomXInCell = Math.max(CHARACTER_HORIZONTAL_PADDING, Math.min(randomXInCell, window.innerWidth - CHARACTER_HORIZONTAL_PADDING - CHARACTER_SIZE));

          let randomYInCell = yOffset + Math.random() * (cellHeight - CHARACTER_SIZE);
          randomYInCell = Math.max(CHARACTER_VERTICAL_OFFSET, Math.min(randomYInCell, CHARACTER_MAX_VERTICAL_RANGE - CHARACTER_SIZE));

          initialCharacters.push({
            id: placedCount,
            isFacingFront: Math.random() > 0.5,
            image: Math.random() > 0.5 ? FRONT_CHARACTERS[placedCount] : BACK_CHARACTERS[placedCount],
            status: 'active',
            x: randomXInCell,
            y: randomYInCell,
          });
          placedCount++;
        }
      }
      return initialCharacters;
    });
    hasIncrementedRef.current = false;
  }, [setScore]);

  useEffect(() => {
    if (isGameOver) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    }
  }, [isGameOver, setScore]);

  useEffect(() => {
    if (scoreToAdd > 0 && !isGameOver) {
      const interval = setInterval(() => {
        setScore(prevScore => prevScore + 1);
        setScoreToAdd(prevScoreToAdd => prevScoreToAdd - 1);
      }, 50);

      return () => clearInterval(interval);
    }
  }, [scoreToAdd, setScore, isGameOver]);

  const characterTimeoutsRef = useRef({});

  useEffect(() => {
    if (isGamePaused) return;
    const scheduleFlip = (charId) => {
      const delay = Math.random() * 3000 + 2000;
      characterTimeoutsRef.current[charId] = setTimeout(() => {
        setCharacters(prevChars => prevChars.map(c => {
          if (c.id === charId && c.status === 'active') {
            const newFacingFront = !c.isFacingFront;
            return {
              ...c,
              isFacingFront: newFacingFront,
              image: newFacingFront ? FRONT_CHARACTERS[c.id] : BACK_CHARACTERS[c.id],
            };
          }
          return c;
        }));
        scheduleFlip(charId);
      }, delay);
    };

    characters.filter(c => c.status === 'active').forEach(char => scheduleFlip(char.id));

    return () => {
      Object.values(characterTimeoutsRef.current).forEach(clearTimeout);
    };
  }, [characters, isGamePaused]);

  useEffect(() => {
    if (isGameOver || isFalling || isGamePaused) return;
    const frameInterval = setInterval(() => {
      setRunFrameIndex(prevFrame => (prevFrame + 1) % runFrames.length);
    }, 100);
    return () => clearInterval(frameInterval);
  }, [isGameOver, isFalling, isGamePaused]);

  useEffect(() => {
    if (!isFalling || isGamePaused) {
      setJumpFrameIndex(0);
      return;
    }
    const frameInterval = setInterval(() => {
      setJumpFrameIndex(prevFrame => {
        const nextFrame = (prevFrame < jumpFrames.length - 1) ? prevFrame + 1 : prevFrame;
        console.log('Jump Animation - jumpFrameIndex:', nextFrame, 'isFalling:', isFalling);
        return nextFrame;
      });
    }, JUMP_ANIMATION_SPEED);
    return () => clearInterval(frameInterval);
  }, [isFalling, isGamePaused]);

  useEffect(() => {
    if (isGameOver || isGamePaused) return;
    let obstacleTimer;
    const createObstacleGroup = () => {
      const groupSize = Math.floor(Math.random() * 9) + 1;
      const newObstacles = [];
      const startX = screenDimensions.width;
      for (let i = 0; i < groupSize; i++) {
        newObstacles.push({ id: Date.now() + i, x: startX + i * OBSTACLE_WIDTH });
      }
      setObstacles(prev => [...prev, ...newObstacles]);
      const nextGroupDelay = Math.random() * 4000 + 12000;
      obstacleTimer = setTimeout(createObstacleGroup, nextGroupDelay);
    };
    obstacleTimer = setTimeout(createObstacleGroup, 2000);
    return () => clearTimeout(obstacleTimer);
  }, [isGameOver, screenDimensions.width, isGamePaused]);

  useEffect(() => {
    if (isGameOver || isGamePaused) return;
    let coinTimer;
    const createCoin = () => {
      const newCoin = {
        id: Date.now(),
        x: screenDimensions.width,
        y: Math.random() * 100
      };
      setCoins(prev => [...prev, newCoin]);
      const nextCoinDelay = Math.random() * 1500 + 1000;
      coinTimer = setTimeout(createCoin, nextCoinDelay);
    };
    coinTimer = setTimeout(createCoin, 1500);
    return () => clearTimeout(coinTimer);
  }, [isGameOver, screenDimensions.width, isGamePaused]);

  useEffect(() => {
    if (isCharactersPulled) {
      Object.values(characterTimeoutsRef.current).forEach(clearTimeout);
      characterTimeoutsRef.current = {};

      const activeCharacters = characters.filter(c => c.status === 'active');
      const shuffledCharacterIds = activeCharacters.map(c => c.id).sort(() => Math.random() - 0.5);

      const animationDelay = 500; // Slower stagger
      const animationDuration = 2500; // Slower pull

      let absorbedCount = 0;

      shuffledCharacterIds.forEach((charId, index) => {
        characterTimeoutsRef.current[charId] = setTimeout(() => {
          const blackHoleVisualWidth = screenDimensions.width * 0.26;
          const blackHoleVisualHeight = blackHoleVisualWidth;
          const blackHoleTopOffset = screenDimensions.height * 0.05;

          const blackHoleCenterX = (screenDimensions.width / 2);
          const blackHoleCenterYFromTop = blackHoleTopOffset + (blackHoleVisualHeight / 2);
          const blackHoleCenterYFromBottom = screenDimensions.height - blackHoleCenterYFromTop;

          const targetCharacterX = blackHoleCenterX - (CHARACTER_SIZE / 2);
          const targetCharacterY = blackHoleCenterYFromBottom - (CHARACTER_SIZE / 2);

          setCharacters(prevChars => prevChars.map(c => {
            if (c.id === charId) {
              return {
                ...c,
                status: 'pulling',
                targetPullX: targetCharacterX,
                targetPullY: targetCharacterY,
              };
            }
            return c;
          }));

          characterTimeoutsRef.current[`${charId}-absorbed`] = setTimeout(() => {
            setCharacters(prevChars => {
              const updatedChars = prevChars.map(c => {
                if (c.id === charId) {
                  return { ...c, status: 'absorbed' };
                }
                return c;
              });
              absorbedCount++;
              if (absorbedCount === shuffledCharacterIds.length) {
                setIsShaking(false);
              }
              return updatedChars;
            });
          }, animationDuration);

        }, index * animationDelay);
      });

      return () => {
        Object.values(characterTimeoutsRef.current).forEach(clearTimeout);
      };
    }
  }, [isCharactersPulled, characters, screenDimensions.height, screenDimensions.width]);

  const handlePressStart = useCallback((e) => {
    if (e) e.preventDefault();
    if (isGameOver) {
      restartGame();
      return;
    }
    if (jumpLockRef.current) return;

    jumpRequestRef.current = true;
    jumpHoldRef.current = true;
    jumpLockRef.current = true;
  }, [isGameOver, restartGame]);

  const handlePressEnd = useCallback((e) => {
    if (e) e.preventDefault();
    jumpHoldRef.current = false;
  }, []);

  // Setup Input Listeners
  useEffect(() => {
    const gameElement = gameContainerRef.current;
    if (!gameElement) return;

    const options = { passive: false };

    // Mouse and Touch events
    gameElement.addEventListener('mousedown', handlePressStart, options);
    gameElement.addEventListener('mouseup', handlePressEnd, options);
    gameElement.addEventListener('touchstart', handlePressStart, options);
    gameElement.addEventListener('touchend', handlePressEnd, options);

    // Keyboard events
    const handleKeyDown = (e) => {
      if (e.code === 'Space' && !e.repeat) {
        handlePressStart(e);
      }
    };
    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        handlePressEnd(e);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      gameElement.removeEventListener('mousedown', handlePressStart, options);
      gameElement.removeEventListener('mouseup', handlePressEnd, options);
      gameElement.removeEventListener('touchstart', handlePressStart, options);
      gameElement.removeEventListener('touchend', handlePressEnd, options);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePressStart, handlePressEnd]);

  

  const playerImage = isFalling ? jumpFrames[jumpFrameIndex] : runFrames[runFrameIndex];
  const currentCelestialBodyImage = CELESTIAL_BODIES[celestialBodyIndex];
  const isBlackHole = currentCelestialBodyImage === blackHoleImage;
  const celestialVerticalPosition = isBlackHole ? '0%' : '0%';

  return (
    <div
      ref={gameContainerRef}
      className={`game-container ${isShaking ? 'shake' : ''}`}
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${gameBG})`,
        backgroundPosition: `0px 0`
      }}
    >
      <SoundSettingsModal
        isOpen={isSoundModalOpen}
        onClose={() => setIsSoundModalOpen(false)}
        isMusicPlaying={isMusicPlaying}
        toggleMusic={toggleMusic}
        musicVolume={musicVolume}
        setMusicVolume={setMusicVolume}
        currentMusicIndex={currentMusicIndex}
        setCurrentMusicIndex={setCurrentMusicIndex}
        allMusicTracks={ALL_GAME_MUSIC}
        gameMusicRef={gameMusicRef}
      />
      <div
        className="game-road"
        style={{
          backgroundImage: `url(${gameWay})`,
          backgroundPosition: `${roadPosition}px bottom`
        }}
      ></div>

      {currentCelestialBodyImage && (
        <img
          src={currentCelestialBodyImage}
          className="game-world-image"
          alt=""
          style={{
            top: celestialVerticalPosition,
            transform: `translateX(${planetXPos}px) scale(${breathScale})`,
          }}
        />
      )}

      {isGameOver && (
        <div className="game-over-message">
          Game Over
          <button className="restart-button" onClick={restartGame}>Yeniden Başla</button>
        </div>
      )}

      <img
        ref={playerRef}
        src={playerImage}
        alt="Player"
        className={`player-character`}
        style={{
          bottom: `calc(39% + ${playerPositionY}px)`
        }}
      />
      {obstacles.map(obstacle => <Obstacle key={obstacle.id} id={obstacle.id} x={obstacle.x} />)}
      {coins.map(coin => <Coin key={coin.id} id={coin.id} y={coin.y} x={coin.x} />)}

      {characters.filter(char => char.status !== 'absorbed').map(char => (
        <div
          key={char.id}
          className={`character-flipper ${char.isFacingFront ? 'front' : 'back'} ${char.status === 'pulling' ? 'is-pulling' : ''}`}
          style={{
            position: 'absolute',
            left: char.status === 'pulling' ? char.targetPullX : char.x,
            bottom: char.status === 'pulling' ? char.targetPullY : char.y,
            transition: char.status === 'pulling' ? 'left 2.5s ease-in-out, bottom 2.5s ease-in-out, transform 2.5s ease-in-out, opacity 2.5s ease-in-out' : 'none',
            transform: char.status === 'pulling' ? 'scale(0)' : 'scale(1)',
            opacity: char.status === 'pulling' ? 0 : 1,
          }}
        >
          <div className="character-pull-wrapper">
            <img
              src={char.image}
              alt={`character-${char.id}`}
              className="character-image"
            />
          </div>
        </div>
      ))}


    </div>
  );

};

export default Game;