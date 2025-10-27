import React, { useState, useEffect, Suspense } from 'react';
import './App.css';
import { useTranslation } from 'react-i18next';

import Header from './components/Header';
import Hero from './components/Hero';
import About from './components/About';
import Features from './components/Features';
import Tokenomics from './components/Tokenomics';
import TokenInfo from './components/TokenInfo';
import Roadmap from './components/Roadmap';
import Socials from './components/Socials';
import Footer from './components/Footer';
import MemeGeneratorModal from './components/MemeGeneratorModal';

import ScrollToTopButton from './components/ScrollToTopButton';
import AnimatedSection from './components/AnimatedSection';
import LanguageSelector from './components/LanguageSelector';


function App() {
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState('light');
  const [showMemeGenerator, setShowMemeGenerator] = useState(false);


  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 18 || currentHour < 6) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    document.body.className = theme + '-theme';
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleOpenMemeGenerator = () => setShowMemeGenerator(true);
  const handleCloseMemeGenerator = () => setShowMemeGenerator(false);




  return (
    <Suspense fallback="Loading...">
      <>
        <Header theme={theme} toggleTheme={toggleTheme} />
        <LanguageSelector />
        <main>
          <Hero onOpenMemeGenerator={handleOpenMemeGenerator} />
          <div id="about">
            <AnimatedSection>
              <About />
            </AnimatedSection>
          </div>
          <div id="features">
            <AnimatedSection>
              <Features />
            </AnimatedSection>
          </div>
          <div id="tokenomics">
            <AnimatedSection>
              <Tokenomics />
            </AnimatedSection>
          </div>
          <div id="tokeninfo">
            <AnimatedSection>
              <TokenInfo />
            </AnimatedSection>
          </div>
          <div id="roadmap">
            <AnimatedSection>
              <Roadmap />
            </AnimatedSection>
          </div>
          <div id="socials">
            <AnimatedSection>
              <Socials />
            </AnimatedSection>
          </div>
        </main>
        <Footer />
        <ScrollToTopButton />
        <MemeGeneratorModal key={`meme-${i18n.language}`} show={showMemeGenerator} onHide={handleCloseMemeGenerator} theme={theme} t={t} />

      </>
    </Suspense>
  );
}

export default App;
