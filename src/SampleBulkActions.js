import React, { useMemo, useRef, useState } from 'react';
import { Button, Form, Modal, ProgressBar } from 'react-bootstrap';
import WarningIcon from '@material-design-icons/svg/filled/warning.svg';

import VolcaTransferControl from './VolcaTransferControl.js';
import { exportSampleContainersToZip } from './utils/zipExport.js';
import { downloadBlob } from './utils/download.js';

import classes from './SampleBulkActions.module.scss';

/**
 * @param {{
 *   samples: import('./store').SampleContainer[];
 *   userSampleIds: Set<string>;
 *   sampleCaches: Map<string, import('./sampleCacheStore.js').SampleCache>;
 *   onDelete: (ids: string[]) => void;
 *   onClearSelection: () => void;
 * }} props
 */
function SampleBulkActions({
  samples,
  userSampleIds,
  sampleCaches,
  onDelete,
  onClearSelection,
}) {
  const orderedSamples = useMemo(
    () =>
      samples
        .slice()
        .sort(
          (sampleA, sampleB) =>
            sampleA.metadata.slotNumber - sampleB.metadata.slotNumber
        ),
    [samples]
  );
  const userSamples = useMemo(
    () => orderedSamples.filter((sample) => userSampleIds.has(sample.id)),
    [orderedSamples, userSampleIds]
  );
  const cancelExportRef = useRef(() => {});
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [exportProgress, setExportProgress] = useState(
    /** @type {number | null} */ (null)
  );
  const [deleting, setDeleting] = useState(false);

  /** @param {boolean} includeSyro */
  const handleBackup = async (includeSyro) => {
    setShowExportConfirm(false);
    let cancelled = false;
    cancelExportRef.current = () => {
      cancelled = true;
      setExportProgress(null);
    };
    const zipFile = await exportSampleContainersToZip(
      userSamples,
      (progress) => {
        if (!cancelled) setExportProgress(progress);
      },
      includeSyro
    );
    if (cancelled) return;
    downloadBlob(zipFile, 'volcasampler.zip');
    setExportProgress(null);
  };

  return (
    <>
      <div className={classes.actions} aria-label="Selected sample actions">
        <VolcaTransferControl
          samples={orderedSamples}
          sampleCaches={sampleCaches}
          justTheButton
          showInfoBeforeTransfer
          button={
            <Button
              type="button"
              disabled={!orderedSamples.length}
              variant="primary"
            >
              Transfer
            </Button>
          }
        />
        <Button
          type="button"
          className={exportProgress === null ? undefined : classes.exporting}
          disabled={!userSamples.length}
          variant="outline-secondary"
          onClick={() => {
            if (exportProgress !== null) {
              cancelExportRef.current();
              return;
            }
            setShowExportConfirm(true);
          }}
        >
          <span>{exportProgress === null ? 'Backup' : 'Cancel backup'}</span>
          {exportProgress !== null && (
            <ProgressBar
              className={classes.progress}
              striped
              animated
              variant="primary"
              now={100 * exportProgress}
            />
          )}
        </Button>
        <Button
          type="button"
          disabled={!userSamples.length}
          variant="outline-danger"
          onClick={() => setDeleting(true)}
        >
          Delete
        </Button>
        <Button type="button" variant="link" onClick={onClearSelection}>
          Clear selection
        </Button>
      </div>

      <Modal
        onHide={() => setShowExportConfirm(false)}
        show={showExportConfirm}
        aria-labelledby="library-export-confirm-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title id="library-export-confirm-modal">
            Sample backup
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Your backup will contain the selected editable samples, including
            their settings and related plugins. You can optionally include
            Volca transfer audio.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="button"
            variant="light"
            onClick={() => handleBackup(false)}
          >
            Just the samples
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => handleBackup(true)}
          >
            Include transfer audio
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        onHide={() => setDeleting(false)}
        show={deleting}
        aria-labelledby="library-delete-modal"
      >
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            onDelete(userSamples.map((sample) => sample.id));
            onClearSelection();
            setDeleting(false);
          }}
        >
          <Modal.Header className={classes.deleteHeader} closeButton>
            <WarningIcon aria-hidden="true" />
            <Modal.Title id="library-delete-modal">
              Delete selected samples
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              Delete {userSamples.length} editable sample
              {userSamples.length === 1 ? '' : 's'}? This cannot be undone.
            </p>
            <ul>
              {userSamples.map((sample) => (
                <li key={sample.id}>
                  <strong>{sample.metadata.name}</strong> (slot{' '}
                  {sample.metadata.slotNumber})
                </li>
              ))}
            </ul>
          </Modal.Body>
          <Modal.Footer>
            <Button
              type="button"
              variant="light"
              onClick={() => setDeleting(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="danger">
              Delete
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
}

export default SampleBulkActions;
