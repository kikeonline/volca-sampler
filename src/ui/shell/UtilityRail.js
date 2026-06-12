import React from 'react';

import classes from './UtilityRail.module.css';

/**
 * @typedef {object} UtilityRailItem
 * @property {string} id
 * @property {React.ReactNode} label
 * @property {React.ReactNode} [icon]
 * @property {React.ReactNode} [badge]
 * @property {boolean} [disabled]
 */

/**
 * @param {{
 *   items: UtilityRailItem[],
 *   activeId?: string,
 *   onNavigate: (id: string, item: UtilityRailItem) => void,
 *   ariaLabel?: string,
 *   header?: React.ReactNode,
 *   footer?: React.ReactNode,
 *   className?: string,
 * }} props
 */
function UtilityRail({
  items,
  activeId,
  onNavigate,
  ariaLabel = 'Primary workspace',
  header,
  footer,
  className = '',
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className={[classes.rail, className].filter(Boolean).join(' ')}
    >
      {header ? <div className={classes.header}>{header}</div> : null}

      <div className={classes.items}>
        {items.map((item) => {
          const isActive = item.id === activeId;

          return (
            <button
              aria-current={isActive ? 'page' : undefined}
              className={classes.item}
              disabled={item.disabled}
              key={item.id}
              onClick={() => onNavigate(item.id, item)}
              type="button"
            >
              {item.icon ? (
                <span aria-hidden="true" className={classes.icon}>
                  {item.icon}
                </span>
              ) : null}
              <span className={classes.label}>{item.label}</span>
              {item.badge != null ? (
                <span className={classes.badge}>{item.badge}</span>
              ) : null}
            </button>
          );
        })}
      </div>

      {footer ? <div className={classes.footer}>{footer}</div> : null}
    </nav>
  );
}

export default UtilityRail;
