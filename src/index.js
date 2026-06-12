import React from 'react';
import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';
import './bootstrap.scss';
import './index.css';
import App from './App.js';
import GlobalErrorBoundary from './GlobalErrorBoundary.js';
import reportWebVitals from './reportWebVitals.js';
import { AudioPlaybackContextProvider } from './utils/audioData.js';
import { initPlugins } from './pluginStore';
import {
  DesignConceptPreview,
  getDesignConceptFromPath,
} from './design-concepts/index.js';

globalThis.Buffer = Buffer;

// polyfills
if (!Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function arrayBuffer() {
    return new Response(this).arrayBuffer();
  };
}
// Firefox leaves TouchEvent undefined if the device
// doesn't support touch.
// We don't actually need to instantiate the class but we will need to check
// if an event is a TouchEvent.
if (typeof TouchEvent === 'undefined') {
  window.TouchEvent = /** @type {typeof TouchEvent} */ (
    class TouchEvent extends Event {}
  );
}

const designConcept = getDesignConceptFromPath(window.location.pathname);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {designConcept ? (
      <DesignConceptPreview concept={designConcept} />
    ) : (
      <GlobalErrorBoundary>
        <AudioPlaybackContextProvider>
          <App />
        </AudioPlaybackContextProvider>
      </GlobalErrorBoundary>
    )}
  </React.StrictMode>
);

if (!designConcept) {
  initPlugins();
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
