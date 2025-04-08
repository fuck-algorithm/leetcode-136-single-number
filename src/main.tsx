import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// 创建全局样式以移除所有链接下划线
const style = document.createElement('style');
style.textContent = `
  /* 强制移除所有链接下划线 */
  a, a:link, a:visited, a:hover, a:active, a:focus {
    text-decoration: none !important;
    border-bottom: none !important;
    box-shadow: none !important;
    -webkit-box-shadow: none !important;
    outline: none !important;
  }
  
  /* 特别针对标题中的链接 */
  .main-title a {
    text-decoration: none !important;
    border-bottom: none !important;
  }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 