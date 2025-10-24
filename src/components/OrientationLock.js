import React from 'react';
import './OrientationLock.css';
import { useTranslation } from 'react-i18next';
import Lottie from 'lottie-react';
import rotateDeviceAnimation from '../assets/animations/Rotate Phone.json'; // Assuming the user saved it as 'Rotate Phone.json'

const OrientationLock = () => {
  const { t } = useTranslation();

  return (
    <div className="orientation-lock-overlay">
      <div className="orientation-lock-message">
        <Lottie animationData={rotateDeviceAnimation} loop={true} autoplay={true} style={{ width: 200, height: 200 }} />
        <p>{t('orientation.rotate_device')}</p>
      </div>
    </div>
  );
};

export default OrientationLock;
