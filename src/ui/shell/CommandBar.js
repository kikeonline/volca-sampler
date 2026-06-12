import React from 'react';

import classes from './CommandBar.module.css';

/**
 * @param {{
 *   title: React.ReactNode,
 *   brand?: React.ReactNode,
 *   context?: React.ReactNode,
 *   status?: React.ReactNode,
 *   actions?: React.ReactNode,
 *   ariaLabel?: string,
 *   className?: string,
 * }} props
 */
function CommandBar({
  title,
  brand,
  context,
  status,
  actions,
  ariaLabel = 'Application controls',
  className = '',
}) {
  return (
    <header
      aria-label={ariaLabel}
      className={[classes.commandBar, className].filter(Boolean).join(' ')}
    >
      {brand ? <div className={classes.brand}>{brand}</div> : null}

      <div className={classes.identity}>
        <strong className={classes.title}>{title}</strong>
        {context ? <span className={classes.context}>{context}</span> : null}
      </div>

      {status ? <div className={classes.status}>{status}</div> : null}
      {actions ? <div className={classes.actions}>{actions}</div> : null}
    </header>
  );
}

export default CommandBar;
