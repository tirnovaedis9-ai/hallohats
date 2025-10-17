
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col } from 'react-bootstrap';
import { FaUsers, FaHandshake, FaBolt } from 'react-icons/fa';
import './Features.css';

const Features = () => {
  const { t } = useTranslation();

  const featuresData = [
    {
      icon: <FaUsers size={40} className="feature-icon" />,
      title: t('features.feature1_title'),
      text: t('features.feature1_text'),
    },
    {
      icon: <FaHandshake size={40} className="feature-icon" />,
      title: t('features.feature2_title'),
      text: t('features.feature2_text'),
    },
    {
      icon: <FaBolt size={40} className="feature-icon" />,
      title: t('features.feature3_title'),
      text: t('features.feature3_text'),
    },
  ];

  return (
    <section id="features" className="section">
      <Container>
        <h2 className="text-center mb-5">{t('features.title')}</h2>
        <Row>
          {featuresData.map((feature, index) => (
            <Col md={4} key={index} className="mb-4">
              <div className="card-custom text-center h-100">
                <div className="mb-3">{feature.icon}</div>
                <h5>{feature.title}</h5>
                <p className="mb-0">{feature.text}</p>
              </div>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Features;
