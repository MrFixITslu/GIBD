/**
 * Main application entry point.
 * This file handles the initialization of the React application and mounts the root
 * component (`App`) into the DOM.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/styles/design-system.css';

// 1. Locate the root DOM node. The React application will be rendered inside this element.
// This element is defined in `index.html`.
const rootElement = document.getElementById('root');

// 2. Perform a critical check to ensure the root element exists. If it doesn't,
// the application cannot start. This provides a clear error message for developers
// if the `index.html` file is missing the required <div id="root"></div>.
if (!rootElement) {
  const errorMsg = "Fatal: Root element with ID 'root' not found in the DOM. React app cannot be mounted. Ensure index.html contains <div id='root'></div>.";
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// 3. Create a React root using the `createRoot` API, which is standard for React 18+.
// This enables concurrent rendering features.
const root = ReactDOM.createRoot(rootElement);

// 4. Render the main App component into the root.
// We wrap the App in `<React.StrictMode>` which is a development tool that highlights
// potential problems in the application. It does not affect the production build.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
