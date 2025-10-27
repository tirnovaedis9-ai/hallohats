

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from 'react-bootstrap';
import './Tokenomics.css';

const Tokenomics = () => {
  const { t } = useTranslation();

  const tokenData = [
    { name: t('tokenomics.public_sale'), value: 90, color: '#ff7518' }, // Orange
    { name: t('tokenomics.team'), value: 10, color: '#9d4edd' },     // Purple
  ];

  // Create the conic-gradient string from the data
  let cumulativePercent = 0;
  const gradientParts = tokenData.map(item => {
    const start = cumulativePercent;
    const end = cumulativePercent + item.value;
    cumulativePercent = end;
    return `${item.color} ${start}% ${end}%`;
  });
  const conicGradient = `conic-gradient(${gradientParts.join(', ')})`;

  return (
    <div className="section">
      <Container className="text-center">
        <h2 className="mb-5">{t('tokenomics.title')}</h2>
        <div className="tokenomics-container">
          <div className="donut-chart" style={{ background: conicGradient }}></div>
          <ul className="tokenomics-legend">
            {tokenData.map((item, index) => (
              <li key={index}>
                <span className="legend-color-box" style={{ backgroundColor: item.color }}></span>
                {item.name}: <strong>{item.value}%</strong>
              </li>
            ))}
          </ul>
        </div>
        <p className="lead mt-5">{t('tokenomics.text')}</p>
      </Container>
    </div>
  );
};

export default Tokenomics;
