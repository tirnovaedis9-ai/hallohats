
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container } from 'react-bootstrap';
import './Roadmap.css';

const Roadmap = () => {
  const { t } = useTranslation();

  const timelineItems = [
    { title: "Phase 1", text: t('roadmap.phase1') },
    { title: "Phase 2", text: t('roadmap.phase2') },
    { title: "Phase 3", text: t('roadmap.phase3') },
  ];

  return (
    <section id="roadmap" className="section">
      <Container>
        <h2 className="text-center mb-5">{t('roadmap.title')}</h2>
        <div className="roadmap-timeline">
          {timelineItems.map((item, index) => (
            <div className={`timeline-item ${index % 2 === 0 ? 'left' : 'right'}`} key={index}>
              <div className="timeline-content">
                <h5>{item.title}</h5>
                <p>{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default Roadmap;
