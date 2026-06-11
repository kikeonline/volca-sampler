import React from 'react';
import ReactDOMServer from 'react-dom/server';
import fs from 'fs';
import { createServer } from 'vite';

const vite = await createServer({
  appType: 'custom',
  optimizeDeps: {
    noDiscovery: true,
  },
  server: {
    middlewareMode: true,
  },
});

try {
  const { default: App } = await vite.ssrLoadModule('/src/App.js');
  const html = ReactDOMServer.renderToStaticMarkup(React.createElement(App));
  fs.writeFileSync('build/static.html', html);
  console.log('Static HTML generated at build/static.html');
} finally {
  await vite.close();
}
