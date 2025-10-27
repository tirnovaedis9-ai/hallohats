
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col, Image } from 'react-bootstrap';
import hatImage from '../assets/images/hat.png';

const About = () => {
  const { t } = useTranslation();
  return (
    <section id="about" className="section">
      <Container>
        <Row className="align-items-center">
          <Col lg={7}>
            <div className="card-custom">
              <h2 className="mb-4">{t('about.title')}</h2>
              <p>
                {t('about.text')}
              </p>
            </div>
          </Col>
          <Col lg={5} className="text-center d-none d-lg-block">
             <Image src={hatImage} alt="HOT Hat" fluid style={{ maxWidth: '300px' }} />
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default About;
