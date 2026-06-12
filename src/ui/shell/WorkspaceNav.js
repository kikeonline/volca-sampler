import React from 'react';

import classes from './WorkspaceNav.module.css';

/**
 * @typedef {object} WorkspaceNavItem
 * @property {string} id
 * @property {React.ReactNode} label
 * @property {React.ReactNode} [icon]
 * @property {React.ReactNode} [badge]
 * @property {boolean} [disabled]
 */

/**
 * Controlled mobile navigation. Keep the item list to five top-level
 * destinations or fewer so labels remain readable on narrow screens.
 *
 * @param {{
 *   items: WorkspaceNavItem[],
 *   activeId?: string,
 *   onNavigate: (id: string, item: WorkspaceNavItem) => void,
 *   ariaLabel?: string,
 *   className?: string,
 * }} props
 */
function WorkspaceNav({
  items,
  activeId,
  onNavigate,
  ariaLabel = 'Workspace navigation',
  className = '',
}) {
  return (
    <nav
      aria-label={ariaLabel}
      className={[classes.nav, className].filter(Boolean).join(' ')}
    >
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
            <span className={classes.iconWrap}>
              {item.icon ? (
                <span aria-hidden="true" className={classes.icon}>
                  {item.icon}
                </span>
              ) : null}
              {item.badge != null ? (
                <span className={classes.badge}>{item.badge}</span>
              ) : null}
            </span>
            <span className={classes.label}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export default WorkspaceNav;
