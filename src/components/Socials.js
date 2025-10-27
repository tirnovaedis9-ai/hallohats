
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from 'react-bootstrap';
import { FaXTwitter } from 'react-icons/fa6';
import './Socials.css';

const Socials = () => {
  const { t } = useTranslation();
  return (
    <section id="socials" className="section">
      <Container className="text-center">
        <h2 className="mb-4">{t('socials.title')}</h2>
        <div className="social-icons">
          <a href="https://x.com/hotmemecoin" target="_blank" rel="noopener noreferrer" className="social-icon twitter">
            <FaXTwitter />
          </a>
        </div>
      </Container>
    </section>
  );
};

export default Socials;
