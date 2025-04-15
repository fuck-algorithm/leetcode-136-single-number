import React from 'react';
import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // 保存语言选择到localStorage
    localStorage.setItem('i18nextLng', lng);
  };

  const currentLanguage = i18n.language;
  
  return (
    <div className="language-switcher">
      <button 
        className={`language-button ${currentLanguage === 'zh' ? 'active' : ''}`}
        onClick={() => changeLanguage('zh')}
        title="简体中文"
      >
        CN
      </button>
      <button 
        className={`language-button ${currentLanguage === 'en' ? 'active' : ''}`}
        onClick={() => changeLanguage('en')}
        title="English"
      >
        EN
      </button>
    </div>
  );
};

export default LanguageSwitcher; 