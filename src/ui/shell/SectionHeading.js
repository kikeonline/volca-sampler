import React from 'react';

import classes from './Panel.module.css';

/**
 * @param {{
 *   title: React.ReactNode,
 *   as?: React.ElementType,
 *   eyebrow?: React.ReactNode,
 *   description?: React.ReactNode,
 *   actions?: React.ReactNode,
 *   id?: string,
 *   className?: string,
 * }} props
 */
function SectionHeading({
  title,
  as: Heading = 'h2',
  eyebrow,
  description,
  actions,
  id,
  className = '',
}) {
  return (
    <div
      className={[classes.sectionHeading, className]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={classes.headingCopy}>
        {eyebrow ? <span className={classes.eyebrow}>{eyebrow}</span> : null}
        <Heading className={classes.headingTitle} id={id}>
          {title}
        </Heading>
        {description ? (
          <p className={classes.headingDescription}>{description}</p>
        ) : null}
      </div>
      {actions ? <div className={classes.headingActions}>{actions}</div> : null}
    </div>
  );
}

export default SectionHeading;
