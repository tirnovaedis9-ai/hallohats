
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from 'react-bootstrap';
import './Footer.css';

const Footer = () => {
  const { t } = useTranslation();
  return (
    <footer className="footer">
      <Container className="text-center py-3">
        <p>&copy; {new Date().getFullYear()} {t('footer.text')}</p>
      </Container>
    </footer>
  );
};

export default Footer;
