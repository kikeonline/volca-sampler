import React, { forwardRef } from 'react';

/** @type {Record<string, string>} */
const segmentPoints = {
  a: '4,1 18,1 20,3 18,5 4,5 2,3',
  b: '19,4 21,6 21,18 19,20 17,18 17,7',
  c: '19,20 21,22 21,34 19,36 17,34 17,23',
  d: '4,35 18,35 20,37 18,39 4,39 2,37',
  e: '3,20 5,22 5,34 3,36 1,34 1,22',
  f: '3,4 5,6 5,18 3,20 1,18 1,6',
  g: '4,18 18,18 20,20 18,22 4,22 2,20',
};

/** @type {Record<string, string>} */
const digitSegments = {
  0: 'abcdef',
  1: 'bc',
  2: 'abdeg',
  3: 'abcdg',
  4: 'bcfg',
  5: 'acdfg',
  6: 'acdefg',
  7: 'abc',
  8: 'abcdefg',
  9: 'abcdfg',
  S: 'acdfg',
};

/**
 * @typedef {{
 *   value: string;
 *   color?: string;
 *   strokeColor?: string;
 *   digitCount?: number;
 *   decimalAfter?: number;
 *   pointClassName?: string;
 *   ariaLabel?: string;
 *   ariaHidden?: boolean;
 * }} SevenSegmentDisplayProps
 */

const SevenSegmentDisplay = forwardRef(
  /**
   * @param {SevenSegmentDisplayProps} props
   * @param {React.ForwardedRef<SVGSVGElement>} ref
   */
  function SevenSegmentDisplay(
    {
      value,
      color = 'currentColor',
      strokeColor = 'transparent',
      digitCount = 4,
      decimalAfter,
      pointClassName,
      ariaLabel,
      ariaHidden = false,
    },
    ref
  ) {
    const digits = String(value).padStart(digitCount, ' ').slice(-digitCount);
    return (
      <svg
        aria-hidden={ariaHidden || undefined}
        aria-label={ariaHidden ? undefined : ariaLabel || String(value)}
        focusable="false"
        ref={ref}
        role={ariaHidden ? undefined : 'img'}
        viewBox={`0 0 ${digitCount * 24} 40`}
      >
        {Array.from(digits).map((digit, index) => (
          <g key={index} data-digit transform={`translate(${index * 24} 0)`}>
            {Array.from(digitSegments[digit] || '').map((segment) => (
              <polygon
                key={segment}
                points={segmentPoints[segment]}
                fill={color}
                stroke={strokeColor}
              />
            ))}
          </g>
        ))}
        {decimalAfter !== undefined && (
          <circle
            className={pointClassName}
            cx={(decimalAfter + 1) * 24 - 1}
            cy="36"
            r="1.8"
            fill={color}
          />
        )}
      </svg>
    );
  }
);

export default SevenSegmentDisplay;
