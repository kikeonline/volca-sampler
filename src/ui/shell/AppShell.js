import React from 'react';

import classes from './AppShell.module.css';

/**
 * @param {{
 *   children: React.ReactNode,
 *   commandBar?: React.ReactNode,
 *   utilityRail?: React.ReactNode,
 *   workspaceNav?: React.ReactNode,
 *   transferDeck?: React.ReactNode,
 *   transferLabel?: string,
 *   mainId?: string,
 *   mainLabel?: string,
 *   skipLinkLabel?: string,
 *   className?: string,
 * }} props
 */
function AppShell({
  children,
  commandBar,
  utilityRail,
  workspaceNav,
  transferDeck,
  transferLabel = 'Transfer deck',
  mainId = 'main-workspace',
  mainLabel = 'Workspace',
  skipLinkLabel = 'Skip to workspace',
  className = '',
}) {
  const shellClassName = [
    classes.shell,
    commandBar ? classes.hasCommandBar : '',
    utilityRail ? classes.hasUtilityRail : '',
    transferDeck ? classes.hasTransferDeck : '',
    workspaceNav ? classes.hasWorkspaceNav : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={shellClassName}>
      <a className={classes.skipLink} href={`#${mainId}`}>
        {skipLinkLabel}
      </a>

      {commandBar ? (
        <div className={classes.commandBarSlot}>{commandBar}</div>
      ) : null}

      <div className={classes.layout}>
        {utilityRail ? (
          <div className={classes.utilityRailSlot}>{utilityRail}</div>
        ) : null}

        <main
          aria-label={mainLabel}
          className={classes.workspace}
          id={mainId}
          tabIndex={-1}
        >
          {children}
        </main>

        {transferDeck ? (
          <aside
            aria-label={transferLabel}
            className={classes.transferDeck}
          >
            {transferDeck}
          </aside>
        ) : null}
      </div>

      {workspaceNav ? (
        <div className={classes.workspaceNavSlot}>{workspaceNav}</div>
      ) : null}
    </div>
  );
}

export default AppShell;
