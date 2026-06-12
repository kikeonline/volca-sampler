import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';

import { usePreviewAudio } from '../../sampleCacheStore.js';
import { useWaveformPlayback } from '../../utils/waveform.js';

import classes from './LibraryGrid.module.css';

/** @typedef {import('../../store.js').SampleContainer} SampleContainer */
/** @typedef {'user' | 'factory'} SampleType */

/**
 * @param {{
 *   sample: SampleContainer;
 *   sampleCache: import('../../sampleCacheStore.js').SampleCache | null;
 *   type: SampleType;
 *   selected: boolean;
 *   focused: boolean;
 *   index: number;
 *   onFocus: () => void;
 *   onSelectionChange: (selected: boolean) => void;
 *   onPreview: () => void;
 *   renderWaveform?: (context: {
 *     sample: SampleContainer;
 *     type: SampleType;
 *     selected: boolean;
 *     focused: boolean;
 *   }) => React.ReactNode;
 * }} props
 */
function LibrarySampleCard({
  sample,
  sampleCache,
  type,
  selected,
  focused,
  index,
  onFocus,
  onSelectionChange,
  onPreview,
  renderWaveform,
}) {
  const reactId = useId();
  const nameId = `${reactId}-name`;
  const selectionLabel = `Select ${sample.metadata.name}`;
  const slotLabel = `Slot ${sample.metadata.slotNumber}`;
  const waveformContext = { sample, type, selected, focused };
  const waveformBars = useMemo(
    () => createWaveformBars(sample, index),
    [index, sample]
  );
  const [audioRequested, setAudioRequested] = useState(false);
  const { audioBuffer } = usePreviewAudio(sampleCache, audioRequested);
  const { isPlaybackActive, stopPlayback, togglePlayback } =
    useWaveformPlayback(audioBuffer || null);
  useEffect(() => stopPlayback, [stopPlayback]);
  const handlePreview = useCallback(
    (event) => {
      setAudioRequested(true);
      togglePlayback(event.nativeEvent);
      onPreview();
    },
    [onPreview, togglePlayback]
  );

  return (
    <article
      aria-labelledby={nameId}
      className={[
        classes.card,
        selected ? classes.cardSelected : '',
        focused ? classes.cardFocused : '',
        type === 'factory' ? classes.cardFactory : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className={classes.cardTopline}>
        <label className={classes.selectionControl}>
          <input
            aria-label={selectionLabel}
            checked={selected}
            onChange={(event) => onSelectionChange(event.target.checked)}
            type="checkbox"
          />
          <span aria-hidden="true" className={classes.checkboxVisual}>
            <CheckIcon />
          </span>
        </label>

        <div className={classes.badges}>
          <span className={classes.typeBadge}>
            {type === 'user' ? 'Yours' : 'Factory'}
          </span>
          {type === 'factory' && (
            <span className={classes.readOnlyBadge}>
              <LockIcon />
              Read only
            </span>
          )}
        </div>
      </div>

      <button
        aria-current={focused ? 'true' : undefined}
        className={classes.focusButton}
        onClick={onFocus}
        type="button"
      >
        <span className={classes.nameRow}>
          <span
            className={classes.sampleName}
            id={nameId}
            title={sample.metadata.name}
          >
            {sample.metadata.name}
          </span>
          <span aria-label={slotLabel} className={classes.slot}>
            S.{String(sample.metadata.slotNumber).padStart(3, '0')}
          </span>
        </span>

        <span className={classes.waveformFrame}>
          {renderWaveform ? (
            renderWaveform(waveformContext)
          ) : (
            <span aria-hidden="true" className={classes.waveform}>
              {waveformBars.map((height, barIndex) => (
                <i
                  key={barIndex}
                  style={{
                    height: `${height}%`,
                  }}
                />
              ))}
            </span>
          )}
        </span>

        <span className={classes.focusHint}>
          {focused ? 'Focused sample' : 'Open sample'}
          <ChevronIcon />
        </span>
      </button>

      <button
        aria-label={`Preview ${sample.metadata.name}`}
        className={classes.previewButton}
        onClick={handlePreview}
        type="button"
      >
        {isPlaybackActive ? <StopIcon /> : <PlayIcon />}
        {isPlaybackActive ? 'Stop' : 'Preview'}
      </button>
    </article>
  );
}

/**
 * Creates stable decorative bars from metadata. No sample data is accessed.
 *
 * @param {SampleContainer} sample
 * @param {number} index
 */
function createWaveformBars(sample, index) {
  const source = `${sample.id}:${sample.metadata.name}:${sample.metadata.slotNumber}`;
  let seed = index + 17;
  for (
    let characterIndex = 0;
    characterIndex < source.length;
    characterIndex += 1
  ) {
    seed = (seed * 31 + source.charCodeAt(characterIndex)) >>> 0;
  }

  return Array.from({ length: 32 }, (_, barIndex) => {
    const wave =
      Math.abs(Math.sin((barIndex + seed % 13) * 0.71)) * 52 +
      Math.abs(Math.cos((barIndex + seed % 7) * 0.29)) * 24;
    return Math.round(18 + Math.min(76, wave));
  });
}

function CheckIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="m3.5 8.2 2.7 2.7 6.3-6.3" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <rect height="7" rx="1" width="10" x="3" y="7" />
      <path d="M5.5 7V5.25a2.5 2.5 0 0 1 5 0V7" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 16 16">
      <path d="m6 3.5 4.5 4.5L6 12.5" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M4.5 2.8v10.4L13 8z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 16">
      <path d="M3.5 3.5h9v9h-9z" />
    </svg>
  );
}

export default React.memo(LibrarySampleCard);
export { LibrarySampleCard };
