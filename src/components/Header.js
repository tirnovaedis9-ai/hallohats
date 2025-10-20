import React from 'react';
import { useTranslation } from 'react-i18next';
import { Navbar, Nav, Container } from 'react-bootstrap';
import { FaSun, FaMoon } from 'react-icons/fa';
import './Header.css';
import logo from '../assets/images/logo.png';

const Header = ({ theme, toggleTheme }) => {
  const { t } = useTranslation();

  return (
    <Navbar collapseOnSelect expand="lg" bg="custom-red" variant="dark" fixed="top">
      <Container>
        <Navbar.Brand href="#home">
          <img src={logo} alt="Logo" className="logo-img" />
          CMC
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="mx-auto">
            <Nav.Link href="#about">{t('header.about')}</Nav.Link>
            <Nav.Link href="#features">{t('header.features')}</Nav.Link>
            <Nav.Link href="#tokenomics">{t('header.tokenomics')}</Nav.Link>
            <Nav.Link href="#roadmap">{t('header.roadmap')}</Nav.Link>
            <Nav.Link href="#socials">{t('header.socials')}</Nav.Link>
          </Nav>
          <Nav className="ms-auto align-items-center">
            <button onClick={toggleTheme} className="theme-toggle-btn">
              {theme === 'light' ? <FaMoon /> : <FaSun />}
            </button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;