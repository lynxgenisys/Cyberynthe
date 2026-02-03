import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Main entry

try {
  const root = document.getElementById('root');
  if (!root) throw new Error("Root element not found");

  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  )
  // Render start
} catch (e) {
  console.error("Mount error:", e);
  document.body.innerHTML += `<div style="color:red; font-size:2em">${e.message}</div>`;
}
