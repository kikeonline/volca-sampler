import React from 'react';

import {
  HardwareConsole,
  LibraryPrep,
  WorkflowStudio,
} from './DesignConcepts.js';
import './design-concepts.css';

const conceptPaths = {
  '/design-concepts/hardware-console': 'hardware-console',
  '/design-concepts/workflow-studio': 'workflow-studio',
  '/design-concepts/library-prep': 'library-prep',
};

export function getDesignConceptFromPath(pathname) {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';
  return conceptPaths[normalizedPath] || null;
}

export function DesignConceptPreview({ concept }) {
  if (concept === 'hardware-console') {
    return <HardwareConsole />;
  }
  if (concept === 'workflow-studio') {
    return <WorkflowStudio />;
  }
  return <LibraryPrep />;
}
