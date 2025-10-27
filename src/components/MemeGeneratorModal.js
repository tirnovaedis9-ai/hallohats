import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, Spinner, Alert } from 'react-bootstrap';
import * as faceapi from 'face-api.js';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown, FaUndo, FaCamera, FaVideo, FaImage, FaUser, FaExclamationTriangle } from 'react-icons/fa';
import './MemeGeneratorModal.css';
import hatImageSrc from '../assets/images/hat.png';
import btcImageSrc from '../assets/images/btc.png';
import walmartImageSrc from '../assets/images/walmart.png';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const defaultHatProps = { x: 0, y: -100, scale: 0.4, rotation: 0, minScale: 0.05, maxScale: 0.8, rotateX: 0, rotateY: 0, scaleX: 1 };
const defaultBtcProps = { x: -150, y: 150, scale: 0.08, rotation: 0, minScale: 0.01, maxScale: 0.25, rotateX: 0, rotateY: 0 };
const defaultWalmartProps = { x: 150, y: 150, scale: 0.08, rotation: 0, minScale: 0.01, maxScale: 0.25, rotateX: 0, rotateY: 0 };

const COOLDOWN_MINUTES = 30;
const REMBG_API_URL = "http://localhost:8000/remove-background";

const MemeGeneratorModal = ({ show, onHide, theme }) => {
  const { t } = useTranslation();
  const MAX_CANVAS_SIZE = 2000;
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageCanvasRef = useRef(null);
  const [userImage, setUserImage] = useState(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [memeText] = useState('+999');
  const [rotateIcon, setRotateIcon] = useState(null);
  const [isFileSelected, setIsFileSelected] = useState(false);
  const interactionTimeoutRef = useRef(null);
  const ffmpegRef = useRef(new FFmpeg());
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [overlays, setOverlays] = useState([]);
  const [selectedOverlay, setSelectedOverlay] = useState(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [action, setAction] = useState(null);
  const [startMouse, setStartMouse] = useState({ x: 0, y: 0 });
  const [startOverlayProps, setStartOverlayProps] = useState(null);
  const [removeBg, setRemoveBg] = useState(false);
  const [originalFile, setOriginalFile] = useState(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [colorInputValue, setColorInputValue] = useState('#FFFFFF');
  const [canvasWidth, setCanvasWidth] = useState(400);
  const [canvasHeight, setCanvasHeight] = useState(400);
  const [mode, setMode] = useState('photo');
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const recordedChunksRef = useRef([]);
  const animationFrameRef = useRef(null);
  const hueRef = useRef(0);

  // --- New states for BG Removal Cooldown ---
  const [isBgRemovalBlocked, setIsBgRemovalBlocked] = useState(false);
  const [bgRemovalTimeLeft, setBgRemovalTimeLeft] = useState(0);
  const [bgRemovalError, setBgRemovalError] = useState(null);
  const cooldownTimerRef = useRef(null);

  // --- Cooldown Logic ---
  useEffect(() => {
    if (!show) {
      clearInterval(cooldownTimerRef.current);
      return;
    }

    const checkCooldown = () => {
      const lastUsed = localStorage.getItem('lastBgRemovalTimestamp');
      if (lastUsed) {
        const now = new Date().getTime();
        const timePassed = now - parseInt(lastUsed, 10);
        const cooldownMillis = COOLDOWN_MINUTES * 60 * 1000;

        if (timePassed < cooldownMillis) {
          const timeLeft = cooldownMillis - timePassed;
          setIsBgRemovalBlocked(true);
          setBgRemovalTimeLeft(timeLeft);

          cooldownTimerRef.current = setInterval(() => {
            setBgRemovalTimeLeft(prev => {
              if (prev <= 1000) {
                clearInterval(cooldownTimerRef.current);
                setIsBgRemovalBlocked(false);
                return 0;
              }
              return prev - 1000;
            });
          }, 1000);
        } else {
          setIsBgRemovalBlocked(false);
          setBgRemovalTimeLeft(0);
        }
      }
    };

    checkCooldown();
    
    const handleStorageChange = () => checkCooldown();
    window.addEventListener('storage', handleStorageChange);

    return () => {
        clearInterval(cooldownTimerRef.current);
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [show]);

  const formatTimeLeft = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const processImageWithRembg = async (file) => {
    if (isBgRemovalBlocked) {
      console.log("Background removal is on cooldown.");
      return null;
    }

    setIsDetecting(true);
    setBgRemovalError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(REMBG_API_URL, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to connect to the local Rembg server.');
      }

      const blob = await response.blob();
      localStorage.setItem('lastBgRemovalTimestamp', new Date().getTime().toString());
      
      // Manually trigger the cooldown check since storage event is not always reliable across tabs
      const lastUsed = new Date().getTime().toString();
      localStorage.setItem('lastBgRemovalTimestamp', lastUsed);
      const cooldownMillis = COOLDOWN_MINUTES * 60 * 1000;
      setIsBgRemovalBlocked(true);
      setBgRemovalTimeLeft(cooldownMillis);
       cooldownTimerRef.current = setInterval(() => {
        setBgRemovalTimeLeft(prev => {
          if (prev <= 1000) {
            clearInterval(cooldownTimerRef.current);
            setIsBgRemovalBlocked(false);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);


      return URL.createObjectURL(blob);

    } catch (error) {
      console.error("Error removing background with Rembg:", error);
      setBgRemovalError(t('meme_generator.rembg_error'));
      return null;
    } finally {
      setIsDetecting(false);
    }
  };

  const handleToggleRemoveBg = useCallback(async () => {
    if (isBgRemovalBlocked) return;
    const newRemoveBgState = !removeBg;
    setRemoveBg(newRemoveBgState);

    if (!originalFile) return;

    const loadImage = (src) => {
      const img = new Image();
      img.onload = () => {
        setUserImage(img);
        setIsDetecting(false);
      };
      img.onerror = () => {
        console.error("Image load error during toggle.");
        setIsDetecting(false);
      };
      img.src = src;
    };

    if (newRemoveBgState) {
      const processedImageSrc = await processImageWithRembg(originalFile);
      if (processedImageSrc) {
        loadImage(processedImageSrc);
      } else {
        setRemoveBg(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => loadImage(e.target.result);
      reader.readAsDataURL(originalFile);
    }
  }, [removeBg, originalFile, isBgRemovalBlocked, t, processImageWithRembg]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setOriginalFile(file);
    setIsFileSelected(true);
    setBgRemovalError(null);

    const processImage = (imageSrc) => {
      const img = new Image();
      img.onload = () => {
        let newWidth = img.width;
        let newHeight = img.height;
        if (newWidth > MAX_CANVAS_SIZE || newHeight > MAX_CANVAS_SIZE) {
          const ratio = newWidth > newHeight ? MAX_CANVAS_SIZE / newWidth : MAX_CANVAS_SIZE / newHeight;
          newWidth *= ratio;
          newHeight *= ratio;
        }
        setCanvasWidth(newWidth);
        setCanvasHeight(newHeight);
        setUserImage(img);
        handleAutoPosition(img);
      };
      img.onerror = () => {
        console.error("Failed to load image from source.");
        setIsDetecting(false);
      };
      img.src = imageSrc;
    };

    if (removeBg) {
      if (isBgRemovalBlocked) {
          const reader = new FileReader();
          reader.onload = (e) => processImage(e.target.result);
          reader.readAsDataURL(file);
          setRemoveBg(false);
          return;
      }
      processImageWithRembg(file).then(processedImageSrc => {
        if (processedImageSrc) {
          processImage(processedImageSrc);
        } else {
           const reader = new FileReader();
           reader.onload = (e) => processImage(e.target.result);
           reader.readAsDataURL(file);
           setRemoveBg(false);
        }
      });
    } else {
      const reader = new FileReader();
      reader.onload = (e) => processImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setUserImage(null);
    imageCanvasRef.current = null;
    setCanvasWidth(400);
    setCanvasHeight(400);
    setOverlays([]);
    setIsFileSelected(false);
    setBgRemovalError(null);
  };

  const handleMoveOverlayX = useCallback((direction) => {
    if (!selectedOverlay) return;
    clearTimeout(interactionTimeoutRef.current);
    setIsInteracting(true);
    setOverlays(prev => prev.map(o =>
      o.id === selectedOverlay
        ? { ...o, x: o.x + (direction === 'left' ? -1 : 1) }
        : o
    ));
    interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 1000);
  }, [selectedOverlay]);

  const handleMoveOverlayY = useCallback((direction) => {
    if (!selectedOverlay) return;
    clearTimeout(interactionTimeoutRef.current);
    setIsInteracting(true);
    setOverlays(prev => prev.map(o =>
      o.id === selectedOverlay
        ? { ...o, y: o.y + (direction === 'up' ? -1 : 1) }
        : o
    ));
    interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 1000);
  }, [selectedOverlay]);

  const handleScaleOverlay = useCallback((event) => {
    if (!selectedOverlay) return;
    const newScale = parseFloat(event.target.value);
    setOverlays(prev => prev.map(o =>
      o.id === selectedOverlay
        ? { ...o, scale: newScale }
        : o
    ));
  }, [selectedOverlay]);

  const handleRotateOverlay = useCallback((newRotation) => {
    if (!selectedOverlay) return;
    setOverlays(prev => prev.map(o =>
      o.id === selectedOverlay
        ? { ...o, rotation: newRotation }
        : o
    ));
  }, [selectedOverlay]);

  const handleRotateXChange = useCallback((value) => {
    if (!selectedOverlay) return;
    setOverlays(prev => prev.map(o =>
      o.id === selectedOverlay
        ? { ...o, rotateX: value }
        : o
    ));
  }, [selectedOverlay]);

  const handleRotateYChange = useCallback((value) => {
    if (!selectedOverlay) return;
    setOverlays(prev => prev.map(o =>
      o.id === selectedOverlay
        ? { ...o, rotateY: value }
        : o
    ));
  }, [selectedOverlay]);

  const handleResetAll = useCallback(() => {
    if (!selectedOverlay) return;
    const overlay = overlays.find(o => o.id === selectedOverlay);
    if (!overlay) return;

    let defaultProps;
    if (overlay.type === 'hat') defaultProps = defaultHatProps;
    else if (overlay.type === 'btc') defaultProps = defaultBtcProps;
    else if (overlay.type === 'walmart') defaultProps = defaultWalmartProps;

    if (defaultProps) {
      setOverlays(prev => prev.map(o =>
        o.id === selectedOverlay
          ? { ...o, ...defaultProps }
          : o
      ));
    }
  }, [selectedOverlay, overlays]);

  const handleResetProperty = useCallback((property) => {
    if (!selectedOverlay) return;
    const overlay = overlays.find(o => o.id === selectedOverlay);
    if (!overlay) return;

    let defaultProps;
    if (overlay.type === 'hat') defaultProps = defaultHatProps;
    else if (overlay.type === 'btc') defaultProps = defaultBtcProps;
    else if (overlay.type === 'walmart') defaultProps = defaultWalmartProps;

    if (defaultProps && defaultProps.hasOwnProperty(property)) {
      setOverlays(prev => prev.map(o =>
        o.id === selectedOverlay
          ? { ...o, [property]: defaultProps[property] }
          : o
      ));
    }
  }, [selectedOverlay, overlays]);

  const handleResetPosition = useCallback(() => {
    if (!selectedOverlay) return;
    const overlay = overlays.find(o => o.id === selectedOverlay);
    if (!overlay) return;

    let defaultProps;
    if (overlay.type === 'hat') defaultProps = defaultHatProps;
    else if (overlay.type === 'btc') defaultProps = defaultBtcProps;
    else if (overlay.type === 'walmart') defaultProps = defaultWalmartProps;

    if (defaultProps) {
      setOverlays(prev => prev.map(o =>
        o.id === selectedOverlay
          ? { ...o, x: defaultProps.x, y: defaultProps.y }
          : o
      ));
    }
  }, [selectedOverlay, overlays]);

  useEffect(() => {
    const icon = new Image();
    icon.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent("<svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'><path fill='#007bff' d='M12 4V2.21c0-.45.54-.67.85-.35l2.79 2.79c.2.2.2.51 0 .71l-2.79 2.79c-.31.31-.85.09-.85-.36V6c-3.31 0-6 2.69-6 6s2.69 6 6 6s6-2.69 6-6h2c0 4.42-3.58 8-8 8s-8-3.58-8-8s3.58-8 8-8Z'/></svg>");
    icon.onload = () => setRotateIcon(icon);
  }, []);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = '/models';
      try {
        await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
        await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
        setModelsLoaded(true);
      } catch (error) {
        console.error("Error loading Face-API models:", error);
      }
    };
    loadModels();

    return () => {
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadFFmpeg = async () => {
      const ffmpeg = ffmpegRef.current;
      ffmpeg.on('log', ({ message }) => {
        console.log(message);
      });
      try {
        await ffmpeg.load({
          coreURL: "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js",
          wasmURL: "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.wasm"
        });
        setFfmpegLoaded(true);
      } catch (error) {
        console.error("Failed to load ffmpeg-core.js", error);
      }
    };
    loadFFmpeg();
  }, []);

  const handleAutoPosition = useCallback(async (imageToProcess) => {
    if (!imageToProcess || !modelsLoaded) return;

    const hatImg = new Image();
    hatImg.src = hatImageSrc;
    const btcImg = new Image();
    btcImg.src = btcImageSrc;
    const walmartImg = new Image();
    walmartImg.src = walmartImageSrc;

    await Promise.all([
        new Promise(resolve => hatImg.onload = resolve),
        new Promise(resolve => btcImg.onload = resolve),
        new Promise(resolve => walmartImg.onload = resolve),
    ]);

    try {
      console.log("Starting multi-face detection...");
      const detections = await faceapi.detectAllFaces(imageToProcess, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.35 })).withFaceLandmarks();
      console.log(`Face detection finished. Found ${detections.length} faces.`);

      if (detections.length > 0) {
        const newOverlays = [];
        const canvas = canvasRef.current;
        if (!canvas) return;

        const scaleX = canvas.width / imageToProcess.width;
        const scaleY = canvas.height / imageToProcess.height;

        detections.forEach((detection, index) => {
          console.log(`Processing face #${index + 1}`);
          const landmarks = detection.landmarks;
          const jawline = landmarks.getJawOutline();
          const leftEye = landmarks.getLeftEye();
          const rightEye = landmarks.getRightEye();
          const faceAngle = Math.atan2(rightEye[3].y - leftEye[0].y, rightEye[3].x - leftEye[0].x) * 180 / Math.PI;
          const faceWidth = landmarks.getJawOutline()[16].x - landmarks.getJawOutline()[0].x;
          let hatScale = (faceWidth / hatImg.width) * 1.5 * scaleX; 
          const dynamicMaxHatScale = hatScale * 3;
          const hatX = (landmarks.getNose()[0].x * scaleX) - (canvas.width / 2);
          const hatY = (landmarks.getLeftEyeBrow()[2].y * scaleY) - (hatImg.height * hatScale * 0.5) - (canvas.height / 2);

          newOverlays.push({
            id: `hat-${index}`,
            type: 'hat',
            img: hatImg,
            ...defaultHatProps,
            x: hatX,
            y: hatY,
            scale: hatScale,
            maxScale: dynamicMaxHatScale,
            rotation: faceAngle,
            visible: true,
          });

          const eyeWidth = (rightEye[3].x - rightEye[0].x) * scaleX;
          let logoScale = (eyeWidth / btcImg.width) * 0.9;
          const dynamicMaxLogoScale = logoScale * 3;
          const cheekY = ((landmarks.getNose()[0].y + landmarks.getNose()[8].y) / 2) * scaleY;
          const walmartX = (landmarks.getLeftEye()[0].x - eyeWidth * 0.5) * scaleX;
          const btcX = (landmarks.getRightEye()[3].x + eyeWidth * 0.5) * scaleX;

          newOverlays.push({
            id: `btc-${index}`,
            type: 'btc',
            img: btcImg,
            ...defaultBtcProps,
            x: walmartX - (canvas.width / 2),
            y: cheekY - (canvas.height / 2),
            scale: logoScale,
            maxScale: dynamicMaxLogoScale,
            rotation: faceAngle,
            visible: true,
          });

          newOverlays.push({
            id: `walmart-${index}`,
            type: 'walmart',
            img: walmartImg,
            ...defaultWalmartProps,
            x: btcX - (canvas.width / 2),
            y: cheekY - (canvas.height / 2),
            scale: logoScale,
            maxScale: dynamicMaxLogoScale,
            rotation: faceAngle,
            visible: true,
          });
        });

        setOverlays(newOverlays);
        if (newOverlays.length > 0) {
            setSelectedOverlay('hat-0');
        }
        console.log("Overlays updated:", newOverlays);

      } else {
        console.log("No faces detected.");
        setOverlays([]);
      }
    } catch (error) {
      console.error("Error in handleAutoPosition:", error);
    } finally {
      console.log("Finalizing auto position, hiding spinner.");
      setIsDetecting(false);
    }
  }, [modelsLoaded]);

  const getHandles = useCallback((overlay) => {
    if (!overlay || !overlay.img) return {};
    const { scale, type } = overlay;
    const scaleX = type === 'hat' ? overlay.scaleX || 1 : 1;
    const halfW = (overlay.img.width * scale * scaleX) / 2;
    const halfH = (overlay.img.height * scale) / 2;

    const handles = {
      br: { x: halfW, y: halfH, cursor: 'se-resize', action: 'resize' },
      bl: { x: -halfW, y: halfH, cursor: 'sw-resize', action: 'resize' },
      tr: { x: halfW, y: -halfH, cursor: 'ne-resize', action: 'resize' },
      tl: { x: -halfW, y: -halfH, cursor: 'nw-resize', action: 'resize' },
      rot_top: { x: 0, y: -halfH - 20, cursor: 'grab', action: 'rotate' },
      rot_bottom: { x: 0, y: halfH + 20, cursor: 'grab', action: 'rotate' },
    };

    if (type === 'hat') {
      handles.mr = { x: halfW, y: 0, cursor: 'ew-resize', action: 'resize-x' };
      handles.ml = { x: -halfW, y: 0, cursor: 'ew-resize', action: 'resize-x' };
    }

    return handles;
  }, []);

  const toRadians = (degrees) => degrees * Math.PI / 180;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (userImage) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(userImage, 0, 0, canvas.width, canvas.height);
    } else {
        ctx.fillStyle = theme === 'dark' ? '#333' : '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    const drawOverlay = (props) => {
      if (!props.img || !props.visible) return;
      ctx.save();
      ctx.translate(canvas.width / 2 + props.x, canvas.height / 2 + props.y);
      ctx.rotate(toRadians(props.rotation));

      const angleX = toRadians(props.rotateX);
      const angleY = toRadians(props.rotateY);
      const perspective = 500;
      const f = perspective / (perspective + 0);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const m11 = f * cosY;
      const m12 = 0;
      const m21 = f * sinX * sinY;
      const m22 = f * cosX;
      const m31 = 0;
      const m32 = 0;
      ctx.transform(m11, m21, m12, m22, m31, m32);

      ctx.save();
      const scaleX = props.type === 'hat' ? props.scaleX || 1 : 1;
      const newWidth = props.img.width * props.scale * scaleX;
      const newHeight = props.img.height * props.scale;

      if (props.type === 'walmart') {
        ctx.beginPath();
        ctx.arc(0, 0, (props.img.width * props.scale) / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }
      ctx.drawImage(props.img, -newWidth / 2, -newHeight / 2, newWidth, newHeight);
      ctx.restore();

      if (props.id === selectedOverlay && !isInteracting && !isRecording) {
        const handleSize = 16;
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.strokeRect(-newWidth / 2, -newHeight / 2, newWidth, newHeight);

        const handles = getHandles(props);
        Object.values(handles).forEach(handle => {
          ctx.save();
          if (handle.action === 'rotate' && rotateIcon) {
            const iconSize = 32;
            ctx.drawImage(rotateIcon, handle.x - iconSize / 2, handle.y - iconSize / 2, iconSize, iconSize);
          } else if (handle.action === 'resize' || handle.action === 'resize-x') {
            ctx.fillStyle = '#007bff';
            ctx.beginPath();
            ctx.arc(handle.x, handle.y, handleSize / 2, 0, 2 * Math.PI);
            ctx.fill();
          }
          ctx.restore();
        });
      }

      ctx.restore();
    };

    if (userImage) {
        overlays.forEach(drawOverlay);
        ctx.save();
        ctx.shadowColor = 'purple';
        ctx.shadowBlur = 15;
        const fontSize = Math.max(24, canvas.width * 0.05); // 5% of canvas width, with a minimum of 24px
        ctx.font = `${fontSize}px Poppins`;
        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        const textX = canvas.width * 0.02; // 2% from the left
        const textY = canvas.height * 0.98; // 2% from the bottom
        ctx.fillText(memeText, textX, textY);
        ctx.restore();
    }

  }, [userImage, overlays, selectedOverlay, memeText, theme, rotateIcon, isInteracting, backgroundColor, getHandles, isRecording]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  useEffect(() => {
    if (mode === 'video' && userImage) {
      const animateBackground = () => {
        let newHue = hueRef.current + 0.2;
        if (newHue > 60) {
          newHue = 0;
        }
        hueRef.current = newHue;
        setBackgroundColor(`hsl(${hueRef.current}, 100%, 50%)`);
        animationFrameRef.current = requestAnimationFrame(animateBackground);
      };
      animationFrameRef.current = requestAnimationFrame(animateBackground);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
    }

    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [mode, userImage]);

    const handleDownload = () => {
      if (mode === 'photo') {
        setTimeout(() => {
            const canvas = canvasRef.current;
            if (canvas) {
                const link = document.createElement('a');
                link.download = 'hot_meme.png';
                link.href = canvas.toDataURL('image/png');
                link.click();
            }
        }, 50);
      } else { 
        setIsRecording(true);
        const canvas = canvasRef.current;
        if (!canvas) return;

        let mimeType = 'video/webm';
        if (MediaRecorder.isTypeSupported('video/webm; codecs=vp8')) {
          mimeType = 'video/webm; codecs=vp8';
        }

        const stream = canvas.captureStream(60); 
        mediaRecorderRef.current = new MediaRecorder(stream, {
           mimeType: mimeType,
           videoBitsPerSecond: 10000000
        });
        recordedChunksRef.current = [];
  
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
  
        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(recordedChunksRef.current, { type: mimeType });
          convertWebmToMp4(blob);
          setIsRecording(false);
          hueRef.current = 0;
        };
  
        hueRef.current = 0;
        setBackgroundColor('hsl(0, 100%, 50%)');
        
        mediaRecorderRef.current.start();
  
        let frameCount = 0;
  
        const recordAnimation = () => {
          if (frameCount < 300) {
            hueRef.current = frameCount * 0.2;
            setBackgroundColor(`hsl(${hueRef.current}, 100%, 50%)`);
            animationFrameRef.current = requestAnimationFrame(recordAnimation);
            frameCount++;
          } else {
            if (mediaRecorderRef.current.state === "recording") {
              mediaRecorderRef.current.stop();
            }
            setMode('video'); 
          }
        };
        cancelAnimationFrame(animationFrameRef.current);
        recordAnimation();
      }
    };

  const convertWebmToMp4 = async (webmBlob) => {
    if (!ffmpegLoaded) {
      console.error("ffmpeg is not loaded yet.");
      return;
    }
    setIsConverting(true);
    const ffmpeg = ffmpegRef.current;
    try {
      const inputFileName = 'input.webm';
      const outputFileName = 'output.mp4';

      await ffmpeg.writeFile(inputFileName, await fetchFile(webmBlob));
      await ffmpeg.exec(['-i', inputFileName, '-c:v', 'copy', '-c:a', 'copy', outputFileName]);
      const data = await ffmpeg.readFile(outputFileName);

      const mp4Blob = new Blob([data.buffer], { type: 'video/mp4' });
      const url = URL.createObjectURL(mp4Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hot_meme.mp4';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error converting video:", error);
    } finally {
      setIsConverting(false);
    }
  };

  const hitTest = useCallback((x, y, overlay, checkHandles = false) => {
    if (!userImage) return null;
    const { img, x: objX, y: objY, scale, rotation, type } = overlay;
    if (!img) return false;

    const canvas = canvasRef.current;
    if (!canvas) return false;

    const translatedX = x - (canvas.width / 2 + objX);
    const translatedY = y - (canvas.height / 2 + objY);

    const angleRad = -rotation * Math.PI / 180;
    const rotatedX = translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
    const rotatedY = translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);

    const scaleX = type === 'hat' ? overlay.scaleX || 1 : 1;
    const halfWidth = (img.width * scale * scaleX) / 2;
    const halfHeight = (img.height * scale) / 2;

    if (checkHandles) {
      const handles = getHandles(overlay);
      const resizeHandleVisualSize = 16;
      const rotateHandleVisualSize = 32;

      for (const key in handles) {
        const handle = handles[key];
        let currentHandleHitArea = handle.action === 'resize' || handle.action === 'resize-x' ? resizeHandleVisualSize + 4 : rotateHandleVisualSize + 8;

        if (
          rotatedX >= handle.x - currentHandleHitArea / 2 &&
          rotatedX <= handle.x + currentHandleHitArea / 2 &&
          rotatedY >= handle.y - currentHandleHitArea / 2 &&
          rotatedY <= handle.y + currentHandleHitArea / 2
        ) {
          return { type: handle.action, corner: key };
        }
      }
    }

    if (
      rotatedX >= -halfWidth &&
      rotatedX <= halfWidth &&
      rotatedY >= -halfHeight &&
      rotatedY <= halfHeight
    ) {
      return { type: 'drag' };
    }

    return null;
  }, [userImage, getHandles]);

  const handleMouseDown = useCallback((e) => {
    if (!userImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    mousePosRef.current = { x: mouseX, y: mouseY };

    const selected = overlays.find(o => o.id === selectedOverlay);
    if (selected) {
      const hitResult = hitTest(mouseX, mouseY, selected, true);
      if (hitResult) {
        setAction(hitResult.type === 'resize' ? `resize-${hitResult.corner}` : hitResult.type);
        setIsInteracting(true);
        setStartMouse({ x: mouseX, y: mouseY });
        setStartOverlayProps({ ...selected });
        return;
      }
    }

    let hitDetected = false;
    for (let i = overlays.length - 1; i >= 0; i--) {
      const overlay = overlays[i];
      if (overlay.visible) {
        const hitResult = hitTest(mouseX, mouseY, overlay);
        if (hitResult) {
          setSelectedOverlay(overlay.id);
          setIsInteracting(true);
          setAction(hitResult.type);
          setStartMouse({ x: mouseX, y: mouseY });
          setStartOverlayProps({ ...overlay });
          hitDetected = true;
          break;
        }
      }
    }

    if (!hitDetected) {
      setSelectedOverlay(null);
    }
  }, [userImage, overlays, selectedOverlay, hitTest]);

  const handleMouseMove = useCallback((e) => {
    if (!userImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    if (action && selectedOverlay && startOverlayProps) {
      const { x: startX, y: startY } = startMouse;

      const updateOverlay = (props) => {
        setOverlays(prev => prev.map(o => o.id === selectedOverlay ? { ...o, ...props } : o));
      };

      if (action === 'drag') {
        const dx = mouseX - startX;
        const dy = mouseY - startY;
        updateOverlay({ x: startOverlayProps.x + dx, y: startOverlayProps.y + dy });
      } else if (action === 'resize-x') {
        const { x: objX, y: objY, rotation, img, scaleX: startScaleX } = startOverlayProps;
        if (!img) return;

        const centerX = objX + canvas.width / 2;
        const centerY = objY + canvas.height / 2;
        
        const startMouseVec = { x: startMouse.x - centerX, y: startMouse.y - centerY };
        const angleRad = -rotation * Math.PI / 180;
        const rotatedStartMouseX = startMouseVec.x * Math.cos(angleRad) - startMouseVec.y * Math.sin(angleRad);

        const mouseVec = { x: mouseX - centerX, y: mouseY - centerY };
        const rotatedCurrentMouseX = mouseVec.x * Math.cos(angleRad) - mouseVec.y * Math.sin(angleRad);

        if (rotatedStartMouseX === 0) return;

        const scaleMultiplier = rotatedCurrentMouseX / rotatedStartMouseX;
        const newScaleX = startScaleX * scaleMultiplier;

        if (isFinite(newScaleX) && newScaleX > 0.1) {
            updateOverlay({ scaleX: newScaleX });
        }
      } else if (action.startsWith('resize-')) {
        const corner = action.split('-')[1];
        const { x: objX, y: objY, rotation, img } = startOverlayProps;
        if (!img) return;

        const centerX = objX + canvas.width / 2;
        const centerY = objY + canvas.height / 2;
        const mouseVec = { x: mouseX - centerX, y: mouseY - centerY };

        const halfW = img.width / 2;
        const halfH = img.height / 2;
        let cornerVec;
        switch (corner) {
          case 'tl': cornerVec = { x: -halfW, y: -halfH }; break;
          case 'tr': cornerVec = { x: halfW, y: -halfH }; break;
          case 'bl': cornerVec = { x: -halfW, y: halfH }; break;
          case 'br': cornerVec = { x: halfW, y: halfH }; break;
          default: return;
        }

        const angleRad = -rotation * Math.PI / 180;
        const rotatedMouseX = mouseVec.x * Math.cos(angleRad) - mouseVec.y * Math.sin(angleRad);
        const rotatedMouseY = mouseVec.x * Math.sin(angleRad) + mouseVec.y * Math.cos(angleRad);

        let scaleValX = 1;
        if (cornerVec.x !== 0) scaleValX = Math.abs(rotatedMouseX / cornerVec.x);
        let scaleValY = 1;
        if (cornerVec.y !== 0) scaleValY = Math.abs(rotatedMouseY / cornerVec.y);

        const newScale = (scaleValX + scaleValY) / 2;

        if (isFinite(newScale) && newScale > startOverlayProps.minScale && newScale < startOverlayProps.maxScale) {
          updateOverlay({ scale: newScale });
        }
      } else if (action === 'rotate') {
        const centerX = startOverlayProps.x + canvas.width / 2;
        const centerY = startOverlayProps.y + canvas.height / 2;
        const startAngle = Math.atan2(startY - centerY, startX - centerX) * 180 / Math.PI;
        const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;
        const newRotation = startOverlayProps.rotation + (currentAngle - startAngle);
        updateOverlay({ rotation: newRotation });
      }
    } else {
      let cursor = 'default';
      let cursorSet = false;

      const selected = overlays.find(o => o.id === selectedOverlay);
      if (selected) {
        const hitResult = hitTest(mouseX, mouseY, selected, true);
        if (hitResult) {
          if (hitResult.type === 'drag') {
            cursor = 'move';
          } else {
            const handles = getHandles(selected);
            cursor = handles[hitResult.corner]?.cursor || 'default';
          }
          cursorSet = true;
        }
      }

      if (!cursorSet) {
        for (let i = overlays.length - 1; i >= 0; i--) {
          const overlay = overlays[i];
          if (!overlay.visible || overlay.id === selectedOverlay) continue;
          const hitResult = hitTest(mouseX, mouseY, overlay);
          if (hitResult) {
            cursor = 'move';
            break;
          }
        }
      }
      canvas.style.cursor = cursor;
    }
  }, [userImage, action, overlays, selectedOverlay, startOverlayProps, startMouse, hitTest, getHandles]);

  const handleMouseUp = useCallback((e) => {
    if(action) {
      setAction(null);
      const canvas = canvasRef.current;
      if(canvas) canvas.style.cursor = 'default';
      setIsInteracting(false);
    }
  }, [action]);

  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleMouseDown(e.touches[0]);
    }
  }, [handleMouseDown]);

  const handleTouchMove = useCallback((e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleMouseMove(e.touches[0]);
    }
  }, [handleMouseMove]);

  const handleTouchEnd = useCallback(() => {
    handleMouseUp();
  }, [handleMouseUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const options = { passive: false };
    canvas.addEventListener('touchstart', handleTouchStart, options);
    canvas.addEventListener('touchmove', handleTouchMove, options);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  const selectedOverlayProps = overlays.find(o => o.id === selectedOverlay);

  return (
    <Modal show={show} onHide={onHide} centered data-bs-theme={theme} dialogClassName="meme-generator-modal">
      <Modal.Header closeButton>
        {userImage && (
          <div className="color-palette-container">
            <div className="color-palette">
              <div 
                className={`color-swatch transparent ${backgroundColor === 'transparent' ? 'selected' : ''}`}
                onClick={() => setBackgroundColor('transparent')}
                title={t('meme_generator.transparent')}
              ></div>
              {['#FFFFFF', '#000000', '#FF4136', '#FF851B', '#FFDC00', '#2ECC40', '#0074D9', '#B10DC9'].map(color => (
                <div 
                  key={color}
                  className={`color-swatch ${backgroundColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                  setBackgroundColor(color);
                  setColorInputValue(color);
                }}
                ></div>
              ))}
              <label className="color-swatch custom-color-swatch">
                🎨
                <input 
                  type="color" 
                  className="custom-color-input"
                  value={colorInputValue}
                  onChange={(e) => {
                    setColorInputValue(e.target.value);
                    setBackgroundColor(e.target.value);
                  }}
                  title={t('meme_generator.custom_color')}
                />
              </label>
            </div>
          </div>
        )}
      </Modal.Header>
      <Modal.Body>
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
            <div className="canvas-wrapper">
              <div className="d-flex justify-content-center align-items-center mb-3 flex-wrap">
                   <div 
                      className={`mode-toggle me-3 ${isBgRemovalBlocked ? 'disabled' : ''}`}
                      onClick={() => !(isDetecting || isRecording || isBgRemovalBlocked) && handleToggleRemoveBg()}
                      title={isBgRemovalBlocked ? t('meme_generator.cooldown_active', { time: formatTimeLeft(bgRemovalTimeLeft) }) : t('meme_generator.remove_background')}
                    >
                    <div className={`toggle-option ${!removeBg ? 'active' : ''}`}>
                      <FaImage />
                    </div>
                    <div className={`toggle-option ${removeBg ? 'active' : ''}`}>
                      <FaUser />
                    </div>
                  </div>
                  <div className="mode-toggle me-3" onClick={() => !isRecording && setMode(prev => prev === 'photo' ? 'video' : 'photo')}>
                    <div className={`toggle-option ${mode === 'photo' ? 'active' : ''}`}>
                      <FaCamera />
                    </div>
                    <div className={`toggle-option ${mode === 'video' ? 'active' : ''}`}>
                      <FaVideo />
                    </div>
                  </div>
              </div>
               {isBgRemovalBlocked && (
                <Alert variant="warning" className="p-2 small">
                  {t('meme_generator.cooldown_active', { time: formatTimeLeft(bgRemovalTimeLeft) })}
                </Alert>
              )}
              {bgRemovalError && (
                <Alert variant="danger" className="p-2 small">
                   <FaExclamationTriangle /> {bgRemovalError}
                </Alert>
              )}
              <div className={`canvas-container ${!userImage ? 'no-image' : ''}`}>
                {userImage && (
                  <button className="remove-image-btn" onClick={handleRemoveImage}>&times;</button>
                )}
                <canvas 
                  ref={canvasRef}
                  width={canvasWidth} 
                  height={canvasHeight}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUp}
                  onMouseLeave={handleMouseUp}
                  onClick={!userImage ? handleUploadClick : undefined}
                  style={{ cursor: !userImage ? 'pointer' : 'auto' }}
                ></canvas>
                {!userImage && !isFileSelected && (
                  <div className="upload-placeholder" onClick={handleUploadClick}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" className="bi bi-upload" viewBox="0 0 16 16">
                      <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                      <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                    </svg>
                    <p>{t('meme_generator.upload_placeholder')}</p>
                  </div>
                )}
                {(isDetecting || isRecording || isConverting) && (
                  <div className="detection-spinner">
                    <Spinner animation="border" variant="danger" />
                    <p>{t(isConverting ? 'meme_generator.converting' : isRecording ? 'meme_generator.recording' : 'meme_generator.detecting_face')}</p>
                  </div>
                )}
              </div>
            </div>
            {userImage && overlays.length > 0 && (
            <div className={`meme-controls-container d-flex justify-content-center align-items-center mt-3 mb-3 ${selectedOverlay ? 'controls-active' : ''}`}>
              <div className="d-flex flex-column align-items-center me-3">
                <Button 
                  variant="outline-secondary" 
                  onClick={() => handleMoveOverlayY('up')} 
                  disabled={!selectedOverlay}
                  className="mb-2"
                >
                  <FaArrowUp />
                </Button>
                <div className="d-flex justify-content-center align-items-center">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => handleMoveOverlayX('left')} 
                    disabled={!selectedOverlay}
                    className="me-2"
                  >
                    <FaArrowLeft />
                  </Button>
                  <Button variant="outline-secondary" onClick={handleResetPosition} disabled={!selectedOverlay}>
                    <FaUndo />
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => handleMoveOverlayX('right')} 
                    disabled={!selectedOverlay}
                    className="ms-2"
                  >
                    <FaArrowRight />
                  </Button>
                </div>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => handleMoveOverlayY('down')} 
                  disabled={!selectedOverlay}
                  className="mt-2"
                >
                  <FaArrowDown />
                </Button>
                <Button 
                  variant="outline-danger" 
                  size="sm"
                  onClick={handleResetAll}
                  disabled={!selectedOverlay}
                  className="mt-3"
                >
                  {t('meme_generator.reset_all')}
                </Button>
              </div>
              <div className="vr mx-3"></div>
              <div className="d-flex flex-column align-items-center ms-3">
                <div className="d-flex flex-column align-items-center">
                <div className="d-flex align-items-center mb-3" style={{ width: '200px' }}>
                  <span className="me-2" style={{color: 'yellow'}}>{t('meme_generator.scale')}</span>
                  <Form.Range
                    min={selectedOverlayProps ? selectedOverlayProps.minScale : 0.01}
                    max={selectedOverlayProps ? selectedOverlayProps.maxScale : 2.0}
                    step="0.001"
                    value={selectedOverlayProps ? selectedOverlayProps.scale : 1}
                    onChange={handleScaleOverlay}
                    onMouseDown={() => setIsInteracting(true)}
                    onMouseUp={() => setIsInteracting(false)}
                    disabled={!selectedOverlay}
                  />
                  <Button variant="link" size="sm" onClick={() => handleResetProperty('scale')} disabled={!selectedOverlay} className="p-0 ms-2">
                    <FaUndo />
                  </Button>
                </div>
                <div className="d-flex align-items-center" style={{ width: '200px' }}>
                  <span className="me-2" style={{color: 'orange'}}>{t('meme_generator.rotate')}</span>
                  <Form.Range
                    min="-180" 
                    max="180" 
                    step="0.001" 
                    value={selectedOverlayProps ? selectedOverlayProps.rotation : 0}
                    onChange={(e) => handleRotateOverlay(parseFloat(e.target.value))}
                    onMouseDown={() => setIsInteracting(true)}
                    onMouseUp={() => setIsInteracting(false)}
                    disabled={!selectedOverlay}
                  />
                  <Button variant="link" size="sm" onClick={() => handleResetProperty('rotation')} disabled={!selectedOverlay} className="p-0 ms-2">
                    <FaUndo />
                  </Button>
                </div>
                <div className="d-flex align-items-center mt-3" style={{ width: '200px' }}>
                  <span className="me-2" style={{ whiteSpace: 'nowrap', color: 'red' }}>{t('meme_generator.rotate_x')}</span>
                  <Form.Range
                    min="-180"
                    max="180"
                    step="1"
                    value={selectedOverlayProps ? selectedOverlayProps.rotateX : 0}
                    onChange={(e) => handleRotateXChange(parseFloat(e.target.value))}
                    onMouseDown={() => setIsInteracting(true)}
                    onMouseUp={() => setIsInteracting(false)}
                    disabled={!selectedOverlay}
                  />
                  <Button variant="link" size="sm" onClick={() => handleResetProperty('rotateX')} disabled={!selectedOverlay} className="p-0 ms-2">
                    <FaUndo />
                  </Button>
                </div>
                <div className="d-flex align-items-center mt-3" style={{ width: '200px' }}>
                  <span className="me-2" style={{ whiteSpace: 'nowrap', color: 'red' }}>{t('meme_generator.rotate_y')}</span>
                  <Form.Range
                    min="-180"
                    max="180"
                    step="1"
                    value={selectedOverlayProps ? selectedOverlayProps.rotateY : 0}
                    onChange={(e) => handleRotateYChange(parseFloat(e.target.value))}
                    onMouseDown={() => setIsInteracting(true)}
                    onMouseUp={() => setIsInteracting(false)}
                    disabled={!selectedOverlay}
                  />
                  <Button variant="link" size="sm" onClick={() => handleResetProperty('rotateY')} disabled={!selectedOverlay} className="p-0 ms-2">
                    <FaUndo />
                  </Button>
                </div>
              </div>
              </div>
            </div>
            )}
            <Form className="meme-form">
              <Form.Control 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ display: 'none' }}
              />
            </Form>
            <div className="d-flex justify-content-center mt-3">
              <Button variant="primary" onClick={handleDownload} disabled={!userImage || isRecording}>{t('meme_generator.download_button')}</Button>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default MemeGeneratorModal;
