import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Main entry

const MobileController = {
    init() {
        this.isMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1);
        this.isPWA = window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;

        if (this.isMobile) {
            document.documentElement.classList.add('mobile-device');
            document.body.classList.add('mobile-device');
            this.setupMobileFlow();
        }
    },

    setupMobileFlow() {
        const overlay = document.getElementById('mobile-splash-overlay');
        const pwaBox = document.getElementById('pwa-instructions');
        const enterBtn = document.getElementById('btn-enter-fullscreen');
        
        if (!overlay) return;
        overlay.style.display = 'flex';

        if (this.isPWA) {
            pwaBox.innerHTML = "<p class='status-good text-green-400'>✓ Running in App Mode for optimal performance.</p>";
        } else {
            const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
            if (isiOS) {
                pwaBox.innerHTML = "<p class='tip text-cyan'>💡 <strong>Best Experience:</strong> Tap the <strong>Share</strong> icon below and select <strong>'Add to Home Screen'</strong> to run full screen without browser bars.</p>";
            } else {
                pwaBox.innerHTML = "<p class='tip text-cyan'>💡 <strong>Best Experience:</strong> Tap the browser menu (three dots) and select <strong>'Install App'</strong> or <strong>'Add to Home Screen'</strong>.</p>";
            }
        }

        enterBtn.addEventListener('click', () => {
            this.launchFullscreen();
            overlay.style.display = 'none';
            if (window.dispatchEvent) {
                window.dispatchEvent(new Event('resize'));
            }
        });
    },

    launchFullscreen() {
        const docEl = document.documentElement;
        const requestFS = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullscreen || docEl.msRequestFullscreen;
        if (requestFS) {
            requestFS.call(docEl).catch(err => {
                console.warn(`Fullscreen request deferred or blocked: ${err.message}`);
            });
        }
    }
};

document.addEventListener('DOMContentLoaded', () => MobileController.init());

try {
  const root = document.getElementById('root');
  if (!root) throw new Error("Root element not found");

  createRoot(root).render(
    <App />
  )
} catch (e) {
  console.error("Mount error:", e);
  document.body.innerHTML += `<div style="color:red; font-size:2em">${e.message}</div>`;
}
