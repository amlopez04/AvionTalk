import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Start MSW worker in development
async function enableMocking() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  const { worker } = await import('./mocks/browser');
  return worker.start({
    onUnhandledRequest: 'warn', // Show warnings for unhandled requests
  }).then(() => {
    console.log('✅ MSW worker started successfully');
    console.log('📡 Mock API is now active');
  }).catch((error) => {
    console.error('❌ Failed to start MSW worker:', error);
  });
}

// Wait for MSW to be ready before rendering
enableMocking()
  .then(() => {
    console.log('🚀 Starting React app...');
  })
  .catch((error) => {
    console.error('⚠️ MSW failed to start, but continuing anyway:', error);
  })
  .finally(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );

    // If you want to start measuring performance in your app, pass a function
    // to log results (for example: reportWebVitals(console.log))
    // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
    reportWebVitals();
  });
