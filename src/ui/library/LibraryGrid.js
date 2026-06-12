import React, { useCallback, useMemo, useState } from 'react';

import LibrarySampleCard from './LibrarySampleCard.js';
import classes from './LibraryGrid.module.css';

/** @typedef {import('../../store.js').SampleContainer} SampleContainer */
/** @typedef {'all' | 'user' | 'factory'} LibraryFilter */
/** @typedef {'user' | 'factory'} SampleType */

/**
 * @typedef {object} BulkActionContext
 * @property {Set<string>} ids
 * @property {SampleContainer[]} samples
 * @property {SampleContainer[]} userSamples
 * @property {SampleContainer[]} factorySamples
 */

/**
 * @typedef {object} LibraryGridProps
 * @property {Map<string, SampleContainer> | SampleContainer[]} userSamples
 * @property {Map<string, SampleContainer> | SampleContainer[]} factorySamples
 * @property {Map<string, import('../../sampleCacheStore.js').SampleCache>} [userSampleCaches]
 * @property {Map<string, import('../../sampleCacheStore.js').SampleCache>} [factorySampleCaches]
 * @property {Set<string> | string[]} selectedSampleIds
 * @property {string | null} focusedSampleId
 * @property {(sample: SampleContainer, type: SampleType) => void} onFocusSample
 * @property {(ids: Set<string>) => void} onSelectionChange
 * @property {(sample: SampleContainer, type: SampleType) => void} [onPreviewSample]
 * @property {(context: BulkActionContext) => void} [onBulkTransfer]
 * @property {(context: BulkActionContext) => void} [onBulkBackup]
 * @property {(context: BulkActionContext) => void} [onBulkDelete]
 * @property {(context: BulkActionContext) => React.ReactNode} [renderBulkActions]
 * @property {(context: {
 *   sample: SampleContainer;
 *   type: SampleType;
 *   selected: boolean;
 *   focused: boolean;
 * }) => React.ReactNode} [renderWaveform]
 * @property {string} [className]
 * @property {string} [ariaLabel]
 */

const FILTERS = /** @type {const} */ ([
  ['all', 'All'],
  ['user', 'Yours'],
  ['factory', 'Factory'],
]);

/**
 * @param {Map<string, SampleContainer> | SampleContainer[]} samples
 * @returns {SampleContainer[]}
 */
function toSampleArray(samples) {
  return Array.isArray(samples) ? samples : [...samples.values()];
}

/**
 * @param {string} query
 * @returns {string[]}
 */
function getSearchTerms(query) {
  return [
    ...new Set(
      query
        .trim()
        .toLocaleLowerCase()
        .split(/\s+/)
        .filter(Boolean)
    ),
  ];
}

/**
 * @param {SampleContainer} sample
 * @param {string[]} searchTerms
 */
function matchesSearch(sample, searchTerms) {
  if (!searchTerms.length) return true;

  const name = sample.metadata.name.toLocaleLowerCase();

  return searchTerms.every((term) => {
    const slotTerm = term.replace(/^s\.?/i, '');
    const matchesSlot =
      /^\d+$/.test(slotTerm) &&
      Number(slotTerm) === sample.metadata.slotNumber;
    return name.includes(term) || matchesSlot;
  });
}

/**
 * A controlled sample-library grid. It only presents sample metadata and never
 * requests, decodes, or plays audio itself.
 *
 * @param {LibraryGridProps} props
 */
function LibraryGrid({
  userSamples,
  factorySamples,
  userSampleCaches = new Map(),
  factorySampleCaches = new Map(),
  selectedSampleIds,
  focusedSampleId,
  onFocusSample,
  onSelectionChange,
  onPreviewSample,
  onBulkTransfer,
  onBulkBackup,
  onBulkDelete,
  renderBulkActions,
  renderWaveform,
  className = '',
  ariaLabel = 'Sample library',
}) {
  const [activeFilter, setActiveFilter] = useState(
    /** @type {LibraryFilter} */ ('all')
  );
  const [searchQuery, setSearchQuery] = useState('');

  const userSampleList = useMemo(
    () => toSampleArray(userSamples),
    [userSamples]
  );
  const factorySampleList = useMemo(
    () => toSampleArray(factorySamples),
    [factorySamples]
  );
  const selectedIds = useMemo(
    () =>
      selectedSampleIds instanceof Set
        ? selectedSampleIds
        : new Set(selectedSampleIds),
    [selectedSampleIds]
  );

  const allSamples = useMemo(
    () => [
      ...userSampleList.map((sample) => ({
        sample,
        type: /** @type {SampleType} */ ('user'),
      })),
      ...factorySampleList.map((sample) => ({
        sample,
        type: /** @type {SampleType} */ ('factory'),
      })),
    ],
    [factorySampleList, userSampleList]
  );

  const searchTerms = useMemo(
    () => getSearchTerms(searchQuery),
    [searchQuery]
  );
  const visibleSamples = useMemo(
    () =>
      allSamples.filter(
        ({ sample, type }) =>
          (activeFilter === 'all' || activeFilter === type) &&
          matchesSearch(sample, searchTerms)
      ),
    [activeFilter, allSamples, searchTerms]
  );

  const selectedContext = useMemo(() => {
    const selectedEntries = allSamples.filter(({ sample }) =>
      selectedIds.has(sample.id)
    );
    const selectedUsers = selectedEntries
      .filter(({ type }) => type === 'user')
      .map(({ sample }) => sample);
    const selectedFactory = selectedEntries
      .filter(({ type }) => type === 'factory')
      .map(({ sample }) => sample);

    return {
      ids: new Set(selectedEntries.map(({ sample }) => sample.id)),
      samples: selectedEntries.map(({ sample }) => sample),
      userSamples: selectedUsers,
      factorySamples: selectedFactory,
    };
  }, [allSamples, selectedIds]);

  const updateSelection = useCallback(
    /**
     * @param {string} sampleId
     * @param {boolean} selected
     */
    (sampleId, selected) => {
      const nextSelectedIds = new Set(selectedIds);
      if (selected) {
        nextSelectedIds.add(sampleId);
      } else {
        nextSelectedIds.delete(sampleId);
      }
      onSelectionChange(nextSelectedIds);
    },
    [onSelectionChange, selectedIds]
  );

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setActiveFilter('all');
  }, []);

  const selectedCount = selectedContext.samples.length;
  const selectedUserCount = selectedContext.userSamples.length;
  const selectedFactoryCount = selectedContext.factorySamples.length;
  const hasSearchOrFilter = Boolean(searchTerms.length) || activeFilter !== 'all';
  const rootClassName = [classes.library, className].filter(Boolean).join(' ');

  return (
    <section className={rootClassName} aria-label={ariaLabel}>
      <header className={classes.header}>
        <div>
          <p className={classes.eyebrow}>BANK / SAMPLE LIBRARY</p>
          <h2 className={classes.title}>Samples</h2>
        </div>
        <p className={classes.totalCount} aria-live="polite">
          {allSamples.length} {allSamples.length === 1 ? 'sample' : 'samples'}
        </p>
      </header>

      <div className={classes.toolbar}>
        <div
          aria-label="Filter samples"
          className={classes.filterGroup}
          role="group"
        >
          {FILTERS.map(([value, label]) => {
            const count =
              value === 'all'
                ? allSamples.length
                : value === 'user'
                ? userSampleList.length
                : factorySampleList.length;
            return (
              <button
                aria-pressed={activeFilter === value}
                className={classes.filterButton}
                key={value}
                onClick={() => setActiveFilter(value)}
                type="button"
              >
                <span>{label}</span>
                <span className={classes.filterCount}>{count}</span>
              </button>
            );
          })}
        </div>

        <label className={classes.search}>
          <span className={classes.visuallyHidden}>Search samples</span>
          <SearchIcon />
          <input
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search name or slot"
            type="search"
            value={searchQuery}
          />
        </label>
      </div>

      {visibleSamples.length ? (
        <>
          <p className={classes.resultsSummary} aria-live="polite">
            Showing {visibleSamples.length} of {allSamples.length}
          </p>
          <ul className={classes.grid}>
            {visibleSamples.map(({ sample, type }, index) => (
              <li key={`${type}:${sample.id}`}>
                <LibrarySampleCard
                  focused={focusedSampleId === sample.id}
                  index={index}
                  onFocus={() => onFocusSample(sample, type)}
                  onPreview={() => onPreviewSample?.(sample, type)}
                  onSelectionChange={(selected) =>
                    updateSelection(sample.id, selected)
                  }
                  renderWaveform={renderWaveform}
                  sample={sample}
                  sampleCache={
                    (type === 'user'
                      ? userSampleCaches.get(sample.id)
                      : factorySampleCaches.get(sample.id)) || null
                  }
                  selected={selectedIds.has(sample.id)}
                  type={type}
                />
              </li>
            ))}
          </ul>
        </>
      ) : (
        <div className={classes.emptyState}>
          <EmptyLibraryIcon />
          <h3>
            {allSamples.length
              ? 'No samples match these controls'
              : 'Your sample library is empty'}
          </h3>
          <p>
            {allSamples.length
              ? 'Try another name or slot number, or reset the active filter.'
              : 'Imported, recorded, and factory samples will appear here.'}
          </p>
          {hasSearchOrFilter && (
            <button
              className={classes.emptyAction}
              onClick={clearFilters}
              type="button"
            >
              Reset search and filters
            </button>
          )}
        </div>
      )}

      {selectedCount > 0 && (
        <div
          aria-label="Bulk sample actions"
          className={classes.bulkBar}
          role="region"
        >
          <div className={classes.selectionSummary} aria-live="polite">
            <strong>
              {selectedCount}{' '}
              {selectedCount === 1 ? 'sample' : 'samples'} selected
            </strong>
            <span>
              {selectedUserCount} yours
              {selectedFactoryCount > 0
                ? ` / ${selectedFactoryCount} factory read-only`
                : ''}
            </span>
          </div>

          <div className={classes.bulkActions}>
            {renderBulkActions ? (
              renderBulkActions(selectedContext)
            ) : (
              <>
                <button
                  className={classes.clearButton}
                  onClick={() => onSelectionChange(new Set())}
                  type="button"
                >
                  Clear
                </button>
                {onBulkBackup && (
                  <button
                    disabled={selectedUserCount === 0}
                    onClick={() => onBulkBackup(selectedContext)}
                    type="button"
                  >
                    Backup
                  </button>
                )}
                {onBulkDelete && (
                  <button
                    className={classes.dangerButton}
                    disabled={selectedUserCount === 0}
                    onClick={() => onBulkDelete(selectedContext)}
                    type="button"
                  >
                    Delete
                  </button>
                )}
                {onBulkTransfer && (
                  <button
                    className={classes.primaryButton}
                    onClick={() => onBulkTransfer(selectedContext)}
                    type="button"
                  >
                    Transfer
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      className={classes.searchIcon}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function EmptyLibraryIcon() {
  return (
    <svg
      aria-hidden="true"
      className={classes.emptyIcon}
      fill="none"
      viewBox="0 0 48 48"
    >
      <path d="M8 13.5h12l3 4H40v21H8z" />
      <path d="M8 22h32M16 29h16M16 34h10" />
    </svg>
  );
}

export default React.memo(LibraryGrid);
export { LibraryGrid };
