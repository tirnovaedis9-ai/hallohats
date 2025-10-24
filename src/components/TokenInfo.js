
import React from 'react';
import { useTranslation } from 'react-i18next';
import './TokenInfo.css';

const TokenInfo = () => {
  const { t } = useTranslation();

  const tokenDetails = [
    { label: t('tokenInfo.name'), value: t('tokenInfo.name_value') },
    { label: t('tokenInfo.symbol'), value: t('tokenInfo.symbol_value') },
    { label: t('tokenInfo.supply'), value: t('tokenInfo.supply_value') },
    { label: t('tokenInfo.contract'), value: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
  ];

  return (
    <div className="section">
      <div className="container">
        <h2 className="text-center mb-5">{t('tokenInfo.title')}</h2>
        <div className="token-info-card">
          <div className="token-info-grid">
            {tokenDetails.map((item, index) => (
              <div key={index} className="token-info-item">
                <span className="token-info-label">{item.label}</span>
                <span className="token-info-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenInfo;

