import React from 'react';
import { createRoot } from 'react-dom/client';
import intl from 'react-intl-universal';
import App from './App';

const locales = {
  'en-US': require('./locales/en-US.json'),
  'zh-CN': require('./locales/zh-CN.json'),
};

intl.init({
  currentLocale: 'en-US',
  locales,
});

const root = createRoot(document.getElementById('root'));
root.render(<App />);
