import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Modal, Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import * as faceapi from 'face-api.js';
import { useTranslation } from 'react-i18next';
import { FaStar, FaPlus, FaMinus, FaArrowLeft, FaArrowRight, FaArrowUp, FaArrowDown, FaUndo } from 'react-icons/fa';
import './MemeGeneratorModal.css';
import hatImageSrc from '../assets/images/hat.png';
import btcImageSrc from '../assets/images/btc.png';
import walmartImageSrc from '../assets/images/walmart.png';
import { removeBackground } from '@imgly/background-removal';

const MemeGeneratorModal = ({ show, onHide, theme }) => {
  const { t } = useTranslation();
  const MAX_CANVAS_SIZE = 500;
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageCanvasRef = useRef(null); // Holds the user image with any erasing
  const [userImage, setUserImage] = useState(null); // Holds the pristine original image
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [memeText] = useState('+999');
  const [rotateIcon, setRotateIcon] = useState(null);
  const [isErasing, setIsErasing] = useState(false);
  const [isFileSelected, setIsFileSelected] = useState(false);
        const interactionTimeoutRef = useRef(null); // Ref to store the timeout ID
  
              const defaultHatProps = { x: 0, y: -100, scale: 0.4, rotation: 0, minScale: 0.05, maxScale: 1.0, rotateX: 0, rotateY: 0 };
              const defaultBtcProps = { x: -150, y: 150, scale: 0.08, rotation: 0, minScale: 0.01, maxScale: 0.5, rotateX: 0, rotateY: 0 };
              const defaultWalmartProps = { x: 150, y: 150, scale: 0.08, rotation: 0, minScale: 0.01, maxScale: 0.5, rotateX: 0, rotateY: 0 };  
        const [overlays, setOverlays] = useState({    hat: { id: 'hat', img: null, ...defaultHatProps, visible: true },
    btc: { id: 'btc', img: null, ...defaultBtcProps, visible: true },
    walmart: { id: 'walmart', img: null, ...defaultWalmartProps, visible: true },
  });

  // --- Interaction State ---
  const [selectedOverlay, setSelectedOverlay] = useState(null); // State to track which overlay is selected
  const [activeDraggable, setActiveDraggable] = useState(null); // 'hat', 'btc', 'walmart'
  const [isInteracting, setIsInteracting] = useState(false); // New state for active interaction
  const [isDetectingFace, setIsDetectingFace] = useState(false);
  const [action, setAction] = useState(null);
  const [startMouse, setStartMouse] = useState({ x: 0, y: 0 });
  const [startOverlayProps, setStartOverlayProps] = useState(null);
  const mousePosRef = useRef({ x: 0, y: 0 });

  const [canvasWidth, setCanvasWidth] = useState(400);
  const [canvasHeight, setCanvasHeight] = useState(400);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleRemoveImage = () => {
    setUserImage(null);
    imageCanvasRef.current = null;
    setCanvasWidth(400);
    setCanvasHeight(400);
    setOverlays({
        hat: { ...overlays.hat, ...defaultHatProps },
        btc: { ...overlays.btc, ...defaultBtcProps },
        walmart: { ...overlays.walmart, ...defaultWalmartProps },
    });
    setIsFileSelected(false);
  };

  const handleMoveOverlayX = useCallback((direction) => {
    if (!selectedOverlay) return;
    clearTimeout(interactionTimeoutRef.current); // Clear any existing timeout
    setIsInteracting(true);
    setOverlays(prev => ({
      ...prev,
      [selectedOverlay]: {
        ...prev[selectedOverlay],
        x: prev[selectedOverlay].x + (direction === 'left' ? -1 : 1),
      },
    }));
    interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 1000);
  }, [selectedOverlay]);

  const handleMoveOverlayY = useCallback((direction) => {
    if (!selectedOverlay) return;
    clearTimeout(interactionTimeoutRef.current); // Clear any existing timeout
    setIsInteracting(true);
    setOverlays(prev => ({
      ...prev,
      [selectedOverlay]: {
        ...prev[selectedOverlay],
        y: prev[selectedOverlay].y + (direction === 'up' ? -1 : 1),
      },
    }));
    interactionTimeoutRef.current = setTimeout(() => setIsInteracting(false), 1000);
  }, [selectedOverlay]);

  const handleScaleOverlay = useCallback((event) => {
    if (!selectedOverlay) return;
    const newScale = parseFloat(event.target.value);
    setOverlays(prev => ({
      ...prev,
      [selectedOverlay]: {
        ...prev[selectedOverlay],
        scale: newScale,
      },
    }));
  }, [selectedOverlay]);

  const handleRotateOverlay = useCallback((newRotation) => {
    if (!selectedOverlay) return;
    setOverlays(prev => ({
      ...prev,
      [selectedOverlay]: {
        ...prev[selectedOverlay],
        rotation: newRotation,
      },
    }));
  }, [selectedOverlay]);

  const handleRotateXChange = useCallback((value) => {
      if (!selectedOverlay) return;
      setOverlays(prev => ({
          ...prev,
          [selectedOverlay]: { ...prev[selectedOverlay], rotateX: value },
      }));
  }, [selectedOverlay]);

              const handleRotateYChange = useCallback((value) => {
                  if (!selectedOverlay) return;
                  setOverlays(prev => ({
                      ...prev,
                      [selectedOverlay]: { ...prev[selectedOverlay], rotateY: value },
                  }));
              }, [selectedOverlay]);  const handleResetAll = useCallback(() => {
    if (!selectedOverlay) return;
    let defaultProps;
    if (selectedOverlay === 'hat') {
      defaultProps = defaultHatProps;
    } else if (selectedOverlay === 'btc') {
      defaultProps = defaultBtcProps;
    } else if (selectedOverlay === 'walmart') {
      defaultProps = defaultWalmartProps;
    }

    if (defaultProps) {
      setOverlays(prev => ({
        ...prev,
        [selectedOverlay]: {
          ...prev[selectedOverlay],
          ...defaultProps,
        },
      }));
    }
  }, [selectedOverlay]);

  const handleResetProperty = useCallback((property) => {
    if (!selectedOverlay) return;
    let defaultProps;
    if (selectedOverlay === 'hat') {
      defaultProps = defaultHatProps;
    } else if (selectedOverlay === 'btc') {
      defaultProps = defaultBtcProps;
    } else if (selectedOverlay === 'walmart') {
      defaultProps = defaultWalmartProps;
    }

    if (defaultProps && defaultProps.hasOwnProperty(property)) {
      setOverlays(prev => ({
        ...prev,
        [selectedOverlay]: {
          ...prev[selectedOverlay],
          [property]: defaultProps[property],
        },
      }));
    }
  }, [selectedOverlay]);

  const handleResetPosition = useCallback(() => {
    if (!selectedOverlay) return;
    let defaultProps;
    if (selectedOverlay === 'hat') {
      defaultProps = defaultHatProps;
    } else if (selectedOverlay === 'btc') {
      defaultProps = defaultBtcProps;
    } else if (selectedOverlay === 'walmart') {
      defaultProps = defaultWalmartProps;
    }

    if (defaultProps) {
      setOverlays(prev => ({
        ...prev,
        [selectedOverlay]: {
          ...prev[selectedOverlay],
          x: defaultProps.x,
          y: defaultProps.y,
        },
      }));
    }
  }, [selectedOverlay]);

  useEffect(() => {
    const imageSources = {
      hat: hatImageSrc,
      btc: btcImageSrc,
      walmart: walmartImageSrc,
    };

    Object.keys(imageSources).forEach(key => {
      const img = new Image();
      img.src = imageSources[key];
      img.onload = () => {
        setOverlays(prev => ({
          ...prev,
          [key]: { ...prev[key], img: img },
        }));
      };
    });

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

  const handleAutoPosition = useCallback(async () => {
    if (!userImage || !modelsLoaded || !overlays.hat.img || !overlays.btc.img || !overlays.walmart.img) return;

    setIsDetecting(true);

    const detections = await faceapi.detectSingleFace(userImage, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 })).withFaceLandmarks();

    if (detections) {
        const landmarks = detections.landmarks;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const scaleX = canvas.width / userImage.width;
        const scaleY = canvas.height / userImage.height;

        const leftEye = landmarks.getLeftEye();
        const rightEye = landmarks.getRightEye();
        const leftEyeBrow = landmarks.getLeftEyeBrow();
        const nose = landmarks.getNose();

        const faceAngle = Math.atan2(rightEye[3].y - leftEye[0].y, rightEye[3].x - leftEye[0].x) * 180 / Math.PI;
        
        const faceBox = detections.detection.box;
        const scaledFaceBoxWidth = faceBox.width * scaleX;
        
        const eyebrowCenterY = (leftEyeBrow.map(p => p.y).reduce((a, b) => a + b, 0) / leftEyeBrow.length) * scaleY;
        const hatScale = (scaledFaceBoxWidth / overlays.hat.img.width) * 1.4;
        const hatX = (landmarks.getNose()[0].x * scaleX) - (canvas.width / 2);
        const hatY = eyebrowCenterY - (overlays.hat.img.height * hatScale * 0.4) - (canvas.height / 2);

        const singleEyeWidth = (rightEye[3].x - rightEye[0].x) * scaleX;
        const desiredLogoWidth = singleEyeWidth * 0.3;

        const minLogoScale = 0.05;

        let btcLogoScale = desiredLogoWidth / overlays.btc.img.width;
        if (btcLogoScale < minLogoScale) btcLogoScale = minLogoScale;

        let walmartLogoScale = desiredLogoWidth / overlays.walmart.img.width;
        if (walmartLogoScale < minLogoScale) walmartLogoScale = minLogoScale;

        const x_offset = singleEyeWidth * 0.5;
        const leftCheekX = ((leftEye[0].x + leftEye[3].x) / 2 * scaleX) - x_offset;
        const rightCheekX = ((rightEye[0].x + rightEye[3].x) / 2 * scaleX) + x_offset;
        const cheekY = nose[4].y * scaleY;

        const btcX = leftCheekX - (canvas.width / 2);
        const btcY = cheekY - (canvas.height / 2);
        
        const walmartX = rightCheekX - (canvas.width / 2);
        const walmartY = cheekY - (canvas.height / 2);

        setOverlays(prev => ({
            ...prev,
            hat: { ...prev.hat, x: hatX, y: hatY, scale: hatScale, rotation: faceAngle, rotateX: 0, rotateY: 0 },
            btc: { ...prev.btc, x: btcX, y: btcY, scale: btcLogoScale, rotation: faceAngle, rotateX: 0, rotateY: 0 },
            walmart: { ...prev.walmart, x: walmartX, y: walmartY, scale: walmartLogoScale, rotation: faceAngle, rotateX: 0, rotateY: 0 }
        }));
    }

    setIsDetecting(false);
  }, [userImage, modelsLoaded, overlays.hat.img, overlays.btc.img, overlays.walmart.img]);

  const getHandles = (overlay) => {
    if (!overlay || !overlay.img) return {};
    const { scale } = overlay;
    const halfW = (overlay.img.width * scale) / 2;
    const halfH = (overlay.img.height * scale) / 2;

    return {
      br: { x: halfW, y: halfH, cursor: 'se-resize', action: 'resize' },
      bl: { x: -halfW, y: halfH, cursor: 'sw-resize', action: 'resize' },
      tr: { x: halfW, y: -halfH, cursor: 'ne-resize', action: 'resize' },
      tl: { x: -halfW, y: -halfH, cursor: 'nw-resize', action: 'resize' },
      rot_top: { x: 0, y: -halfH - 20, cursor: 'grab', action: 'rotate' },
      rot_bottom: { x: 0, y: halfH + 20, cursor: 'grab', action: 'rotate' },
    };
  };

  const toRadians = (degrees) => degrees * Math.PI / 180;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (userImage) {
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

      // Faux 3D effect
      const angleX = toRadians(props.rotateX);
      const angleY = toRadians(props.rotateY);
      ctx.transform(1, Math.tan(angleX), Math.tan(angleY), 1, 0, 0); // Apply skews
      ctx.scale(Math.cos(angleY), Math.cos(angleX)); // Apply foreshortening

      ctx.save();
      if (props.id === 'walmart') {
        ctx.beginPath();
        ctx.arc(0, 0, (props.img.width * props.scale) / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
      }
      ctx.drawImage(props.img, -props.img.width * props.scale / 2, -props.img.height * props.scale / 2, props.img.width * props.scale, props.img.height * props.scale);
      ctx.restore();

      if (props.id === selectedOverlay && !isInteracting) {
        const handleSize = 16; // Made handles bigger for mobile
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 2;
        ctx.strokeRect(
          -props.img.width * props.scale / 2, 
          -props.img.height * props.scale / 2, 
          props.img.width * props.scale, 
          props.img.height * props.scale
        );

        const handles = getHandles(props);
        Object.values(handles).forEach(handle => {
          ctx.save();
          if (handle.action === 'rotate' && rotateIcon) {
            const iconSize = 32; // Made handles bigger for mobile
            ctx.drawImage(rotateIcon, handle.x - iconSize / 2, handle.y - iconSize / 2, iconSize, iconSize);
          } else if (handle.action === 'resize') {
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
        Object.values(overlays).forEach(drawOverlay);

        // Only draw memeText if user image is present
        ctx.save();
        ctx.shadowColor = 'purple';
        ctx.shadowBlur = 15;
        ctx.font = `40px Poppins`;
        ctx.fillStyle = '#00ff00';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(memeText, 20, canvas.height - 20);
        ctx.restore();
    }

  }, [userImage, overlays, canvasWidth, canvasHeight, selectedOverlay, memeText, theme, rotateIcon, isInteracting, action]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsFileSelected(true);
      setIsDetecting(true); // Show spinner

      // First, remove the background
      removeBackground(file, {
        publicPath: 'https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/'
      })
        .then((blob) => {
          // Create a new Image object from the processed blob
          const processedImg = new Image();
          processedImg.onload = () => {
            // Now that the background-removed image is loaded, set it as the main image
            setUserImage(processedImg);

            // Adjust canvas size based on the new image dimensions
            let newWidth = processedImg.width;
            let newHeight = processedImg.height;
            if (newWidth > MAX_CANVAS_SIZE || newHeight > MAX_CANVAS_SIZE) {
              if (newWidth > newHeight) {
                newHeight = (newHeight / newWidth) * MAX_CANVAS_SIZE;
                newWidth = MAX_CANVAS_SIZE;
              } else {
                newWidth = (newWidth / newHeight) * MAX_CANVAS_SIZE;
                newHeight = MAX_CANVAS_SIZE;
              }
            }
            setCanvasWidth(newWidth);
            setCanvasHeight(newHeight);
            setSelectedOverlay('hat');
            // The useEffect for [userImage, modelsLoaded] will trigger handleAutoPosition,
            // which will set isDetecting to false when it's done.
          };
          processedImg.src = URL.createObjectURL(blob);
        })
        .catch((error) => {
          console.error("Failed to remove background:", error);
          // If background removal fails, fall back to using the original image
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              setUserImage(img);
              let newWidth = img.width;
              let newHeight = img.height;
              if (newWidth > MAX_CANVAS_SIZE || newHeight > MAX_CANVAS_SIZE) {
                if (newWidth > newHeight) {
                  newHeight = (newHeight / newWidth) * MAX_CANVAS_SIZE;
                  newWidth = MAX_CANVAS_SIZE;
                } else {
                  newWidth = (newWidth / newHeight) * MAX_CANVAS_SIZE;
                  newHeight = MAX_CANVAS_SIZE;
                }
              }
              setCanvasWidth(newWidth);
              setCanvasHeight(newHeight);
              setSelectedOverlay('hat');
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        });
    }
  };

  useEffect(() => {
    if (userImage && modelsLoaded) {
      handleAutoPosition();
    }
  }, [userImage, modelsLoaded, handleAutoPosition]);

  const handleDownload = () => {
    setTimeout(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const link = document.createElement('a');
            link.download = 'cmc_meme.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        }
    }, 50);
  };

  const hitTest = (x, y, overlay, checkHandles = false) => {
    if (!userImage) return null;
    const { img, x: objX, y: objY, scale, rotation } = overlay;
    if (!img) return false;

    const canvas = canvasRef.current;
    if (!canvas) return false;

    const translatedX = x - (canvas.width / 2 + objX);
    const translatedY = y - (canvas.height / 2 + objY);

    const angleRad = -rotation * Math.PI / 180;
    const rotatedX = translatedX * Math.cos(angleRad) - translatedY * Math.sin(angleRad);
    const rotatedY = translatedX * Math.sin(angleRad) + translatedY * Math.cos(angleRad);

    const halfWidth = (img.width * scale) / 2;
    const halfHeight = (img.height * scale) / 2;

    if (checkHandles) {
      const handles = getHandles(overlay);
      const resizeHandleVisualSize = 16; // From drawCanvas
      const rotateHandleVisualSize = 32; // From drawCanvas

      for (const key in handles) {
        const handle = handles[key];
        let currentHandleHitArea = handle.action === 'resize' ? resizeHandleVisualSize + 4 : rotateHandleVisualSize + 8; // Add a small buffer

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

    // If no handle hit (or not checking handles), check if inside the main body for drag
    if (
      rotatedX >= -halfWidth &&
      rotatedX <= halfWidth &&
      rotatedY >= -halfHeight &&
      rotatedY <= halfHeight
    ) {
      return { type: 'drag' };
    }

    return null;
  };

  const handleMouseDown = (e) => {
    if (!userImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    mousePosRef.current = { x: mouseX, y: mouseY };

    if (selectedOverlay) {
      const overlay = overlays[selectedOverlay];
      const hitResult = hitTest(mouseX, mouseY, overlay, true);
      if (hitResult) {
        setAction(hitResult.type === 'resize' ? `resize-${hitResult.corner}` : hitResult.type);
        setIsInteracting(true); // Set interacting to true
        setStartMouse({ x: mouseX, y: mouseY });
        setStartOverlayProps({ ...overlay });
        return;
      }
    }

    const overlayKeys = Object.keys(overlays).reverse();
    let hitDetected = false;
    for (const key of overlayKeys) {
      const overlay = overlays[key];
      if (overlay.visible) {
        const hitResult = hitTest(mouseX, mouseY, overlay);
        if (hitResult) {
          setSelectedOverlay(key);
          setIsInteracting(true); // Set interacting to true
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
  };

  const handleMouseMove = (e) => {
    if (!userImage) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    mousePosRef.current = { x: mouseX, y: mouseY };

    if (!action) {
      let cursor = 'default';
      const overlayKeys = Object.keys(overlays).reverse();
      for (const key of overlayKeys) {
        const overlay = overlays[key];
        if (!overlay.visible) continue;
        
        const hitResult = key === selectedOverlay ? hitTest(mouseX, mouseY, overlay, true) : hitTest(mouseX, mouseY, overlay);

        if (hitResult) {
          if (hitResult.type === 'drag') {
            cursor = 'move';
          } else {
            const handles = getHandles(overlay);
            cursor = handles[hitResult.corner]?.cursor || 'default';
          }
          break;
        }
      }
      canvas.style.cursor = cursor;
    }
  };

  useEffect(() => {
    if (!action || !selectedOverlay) return;

    let animationFrameId;

    const animationLoop = () => {
      const canvas = canvasRef.current;
      if (!canvas || !startOverlayProps) {
        animationFrameId = requestAnimationFrame(animationLoop);
        return;
      }
      
      const { x: mouseX, y: mouseY } = mousePosRef.current;
      
      if (action === 'drag') {
        const dx = mouseX - startMouse.x;
        const dy = mouseY - startMouse.y;
        setOverlays(prev => ({
          ...prev,
          [selectedOverlay]: { ...prev[selectedOverlay], x: startOverlayProps.x + dx, y: startOverlayProps.y + dy }
        }));
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

          let scaleX = 1;
          if (cornerVec.x !== 0) {
              scaleX = Math.abs(rotatedMouseX / cornerVec.x);
          }
          
          let scaleY = 1;
          if (cornerVec.y !== 0) {
              scaleY = Math.abs(rotatedMouseY / cornerVec.y);
          }

          const newScale = (scaleX + scaleY) / 2;

          if (isFinite(newScale) && newScale > 0.001) {
              setOverlays(prev => ({
                  ...prev,
                  [selectedOverlay]: { ...prev[selectedOverlay], scale: newScale }
              }));
          }
      } else if (action === 'rotate') {
        const centerX = startOverlayProps.x + canvas.width / 2;
        const centerY = startOverlayProps.y + canvas.height / 2;

        const startAngle = Math.atan2(startMouse.y - centerY, startMouse.x - centerX) * 180 / Math.PI;
        const currentAngle = Math.atan2(mouseY - centerY, mouseX - centerX) * 180 / Math.PI;

        const newRotation = startOverlayProps.rotation + (currentAngle - startAngle);

        setOverlays(prev => ({
          ...prev,
          [selectedOverlay]: { ...prev[selectedOverlay], rotation: newRotation }
        }));
      }
      animationFrameId = requestAnimationFrame(animationLoop);
    };

    animationFrameId = requestAnimationFrame(animationLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [action, selectedOverlay, startMouse, startOverlayProps]);

  const handleMouseUp = (e) => {
    if(action) {
      setAction(null);
      const canvas = canvasRef.current;
      if(canvas) canvas.style.cursor = 'default';
      setActiveDraggable(null);
      setIsInteracting(false); // Set interacting to false
      setIsInteracting(false); // Set interacting to false
    }
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleMouseDown(e.touches[0]);
    }
  };

  const handleTouchMove = (e) => {
    e.preventDefault();
    if (e.touches.length > 0) {
      handleMouseMove(e.touches[0]);
    }
  };

  const handleTouchEnd = () => {
    handleMouseUp();
  };

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

  return (
    <Modal show={show} onHide={onHide} centered data-bs-theme={theme} dialogClassName="meme-generator-modal">
      <Modal.Header closeButton>
        
      </Modal.Header>
      <Modal.Body>
        <Row className="justify-content-center">
          <Col md={8} className="text-center">
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
              {isDetecting && (
                <div className="detection-spinner">
                  <Spinner animation="border" variant="danger" />
                  <p>{t('meme_generator.detecting_face')}</p>
                </div>
              )}
            </div>
            {/* New Controls for positioning and scaling */}
            <div className={`d-flex justify-content-center align-items-center mt-3 mb-3 ${selectedOverlay ? 'controls-active' : ''}`}>
              <div className="d-flex flex-column align-items-center me-3"> {/* Group for movement controls */}
                {/* Vertical Movement Controls (Top) */}
                <Button 
                  variant="outline-secondary" 
                  onClick={() => handleMoveOverlayY('up')} 
                  disabled={!selectedOverlay}
                  className="mb-2"
                >
                  <FaArrowUp />
                </Button>

                                <div className="d-flex justify-content-center align-items-center">

                                  {/* Horizontal Movement Controls */}

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

                

                                {/* Vertical Movement Controls (Bottom) */}

                                <Button 

                                  variant="outline-secondary" 

                                  onClick={() => handleMoveOverlayY('down')} 

                                  disabled={!selectedOverlay}

                                  className="mt-2"

                                >

                                  <FaArrowDown />

                                </Button>

                                {/* Master Reset Button */}
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

                

                              <div className="vr mx-3"></div> {/* Separator between movement and scale/rotation */}

                

                              <div className="d-flex flex-column align-items-center ms-3"> {/* Group for scale and rotation controls */}

                

                                <div className="d-flex flex-column align-items-center">

                                {/* Scale Control */}

                                <div className="d-flex align-items-center mb-3" style={{ width: '200px' }}>

                                  <span className="me-2" style={{color: 'yellow'}}>{t('meme_generator.scale')}</span>

                                  <Form.Range

                                    min={selectedOverlay ? overlays[selectedOverlay].minScale : 0.01}

                                    max={selectedOverlay ? overlays[selectedOverlay].maxScale : 2.0}

                                    step="0.001"

                                    value={selectedOverlay ? overlays[selectedOverlay].scale : 1}

                                    onChange={handleScaleOverlay}

                                    onMouseDown={() => setIsInteracting(true)}

                                    onMouseUp={() => setIsInteracting(false)}

                                    disabled={!selectedOverlay}

                                  />

                                  <Button variant="link" size="sm" onClick={() => handleResetProperty('scale')} disabled={!selectedOverlay} className="p-0 ms-2">

                                    <FaUndo />

                                  </Button>

                                </div>

                

                                {/* Rotation Control */}

                                <div className="d-flex align-items-center" style={{ width: '200px' }}>

                                  <span className="me-2" style={{color: 'orange'}}>{t('meme_generator.rotate')}</span>

                                  <Form.Range

                                    min="-180" 

                                    max="180" 

                                    step="0.001" 

                                    value={selectedOverlay ? overlays[selectedOverlay].rotation : 0}

                                    onChange={(e) => handleRotateOverlay(parseFloat(e.target.value))}

                                    onMouseDown={() => setIsInteracting(true)}

                                    onMouseUp={() => setIsInteracting(false)}

                                    disabled={!selectedOverlay}

                                  />

                                  <Button variant="link" size="sm" onClick={() => handleResetProperty('rotation')} disabled={!selectedOverlay} className="p-0 ms-2">

                                    <FaUndo />

                                  </Button>

                                </div>

                

                                {/* RotateX Control */}

                                <div className="d-flex align-items-center mt-3" style={{ width: '200px' }}>

                                  <span className="me-2" style={{ whiteSpace: 'nowrap', color: 'red' }}>{t('meme_generator.rotate_x')}</span>

                                  <Form.Range

                                    min="-90"

                                    max="90"

                                    step="1"

                                    value={selectedOverlay ? overlays[selectedOverlay].rotateX : 0}

                                    onChange={(e) => handleRotateXChange(parseFloat(e.target.value))}

                                    onMouseDown={() => setIsInteracting(true)}

                                    onMouseUp={() => setIsInteracting(false)}

                                    disabled={!selectedOverlay}

                                  />

                                  <Button variant="link" size="sm" onClick={() => handleResetProperty('rotateX')} disabled={!selectedOverlay} className="p-0 ms-2">

                                    <FaUndo />

                                  </Button>

                                </div>

                

                                {/* RotateY Control */}

                                <div className="d-flex align-items-center mt-3" style={{ width: '200px' }}>

                                  <span className="me-2" style={{ whiteSpace: 'nowrap', color: 'red' }}>{t('meme_generator.rotate_y')}</span>

                                  <Form.Range

                                    min="-90"

                                    max="90"

                                    step="1"

                                    value={selectedOverlay ? overlays[selectedOverlay].rotateY : 0}

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
            <Form className="meme-form">
              <Form.Control 
                ref={fileInputRef}
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                style={{ display: 'none' }}
              />

              {/* Removed Auto-Position and Show-Landmarks buttons */}

            </Form>
            <div className="d-flex justify-content-center mt-3">
              <Button variant="primary" onClick={handleDownload} disabled={!userImage}>{t('meme_generator.download_button')}</Button>
            </div>
          </Col>
        </Row>
      </Modal.Body>
    </Modal>
  );
};

export default MemeGeneratorModal;