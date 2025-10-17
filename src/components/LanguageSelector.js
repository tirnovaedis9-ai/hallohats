import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dropdown } from 'react-bootstrap';
import './LanguageSelector.css';

const languages = [
  { code: 'en', name: 'English', country_code: 'gb' },
  { code: 'de', name: 'Deutsch', country_code: 'de' },
  { code: 'fr', name: 'Français', country_code: 'fr' },
  { code: 'es', name: 'Español', country_code: 'es' },
  { code: 'it', name: 'Italiano', country_code: 'it' },
  { code: 'ru', name: 'Русский', country_code: 'ru' },
  { code: 'pt', name: 'Português', country_code: 'pt' },
  { code: 'tr', name: 'Türkçe', country_code: 'tr' },
  { code: 'zh', name: '中文', country_code: 'cn' },
  { code: 'ko', name: '한국어', country_code: 'kr' },
  { code: 'ja', name: '日本語', country_code: 'jp' },
  { code: 'vi', name: 'Tiếng Việt', country_code: 'vn' },
  { code: 'id', name: 'Bahasa Indonesia', country_code: 'id' },
  { code: 'hi', name: 'हिन्दी', country_code: 'in' },
  { code: 'ar', name: 'العربية', country_code: 'sa' },
];

const LanguageSelector = () => {
  const { i18n } = useTranslation();

  return (
    <div className="language-selector-container">
      <Dropdown className="lang-selector">
        <Dropdown.Toggle variant="link" id="dropdown-basic">
          <span className={`fi fi-${languages.find(l => i18n.language.startsWith(l.code))?.country_code}`}></span>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          {languages.map(({ code, name, country_code }) => (
            <Dropdown.Item key={code} onClick={() => i18n.changeLanguage(code)}>
              <span className={`fi fi-${country_code} me-2`}></span> {name}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default LanguageSelector;
