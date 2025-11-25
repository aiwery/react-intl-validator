import React from 'react';
import intl from 'react-intl-universal';

export default function App() {
  return (
    <div style={{ padding: 20 }}>
      <h1>{intl.get('greeting.hello')}</h1>
      <p>{intl.get('common.description')}</p>
    </div>
  );
}
