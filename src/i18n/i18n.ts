import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言文件 - 使用类型断言解决类型问题
const translationEN = require('./locales/en.json') as Record<string, any>;
const translationZH = require('./locales/zh.json') as Record<string, any>;

// 语言资源
const resources = {
  en: {
    translation: translationEN
  },
  zh: {
    translation: translationZH
  }
};

i18n
  // 检测用户语言
  .use(LanguageDetector)
  // 将i18n实例传递给react-i18next
  .use(initReactI18next)
  // 初始化i18next
  .init({
    resources,
    fallbackLng: 'zh',
    debug: import.meta.env.DEV, // 使用Vite环境变量
    interpolation: {
      escapeValue: false, // 不转义HTML内容
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    }
  });

export default i18n; 