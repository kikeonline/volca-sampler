import React from 'react';

import classes from './Panel.module.css';

/**
 * @param {{
 *   children: React.ReactNode,
 *   as?: React.ElementType,
 *   variant?: 'default' | 'raised' | 'inset',
 *   padding?: 'none' | 'compact' | 'normal',
 *   ariaLabel?: string,
 *   labelledBy?: string,
 *   className?: string,
 * }} props
 */
function Panel({
  children,
  as: Component = 'section',
  variant = 'default',
  padding = 'normal',
  ariaLabel,
  labelledBy,
  className = '',
}) {
  return (
    <Component
      aria-label={ariaLabel}
      aria-labelledby={labelledBy}
      className={[classes.panel, className].filter(Boolean).join(' ')}
      data-padding={padding}
      data-variant={variant}
    >
      {children}
    </Component>
  );
}

export default Panel;
