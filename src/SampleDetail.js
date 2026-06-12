import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Container,
  Dropdown,
  DropdownButton,
  Form,
  Button,
  Modal,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import WarningIcon from '@material-design-icons/svg/filled/warning.svg';

import WaveformEdit from './WaveformEdit.js';
import VolcaTransferControl from './VolcaTransferControl.js';
import { SampleContainer } from './store.js';
import PluginsControl from './PluginsControl.js';
import QualityBitDepthControl from './QualityBitDepthControl.js';
import PitchControl from './PitchControl.js';
import { downloadBlob } from './utils/download.js';
import { formatDate } from './utils/datetime.js';

import classes from './SampleDetail.module.scss';

const SampleDetail = React.memo(
  /**
   * @param {{
   *   sample: import('./store').SampleContainer;
   *   sampleCache: import('./sampleCacheStore.js').SampleCache | null;
   *   pluginParamsDefs: Map<string, import('./utils/plugins').PluginParamsDef>;
   *   pluginStatusMap: Map<string, import('./pluginStore.js').PluginStatus> | null;
   *   isPluginManagerOpen: boolean;
   *   editCacheInvalidator: Symbol;
   *   onSampleUpdate: (id: string, update: import('./store').SampleMetadataUpdateArg) => void;
   *   onSampleDuplicate: (id: string) => void;
   *   onSampleDelete: (id: string | string[]) => void;
   *   onOpenPluginManager: () => void;
   *   onRecheckPlugins: () => void;
   *   onRegenerateSampleCache: (sampleId: string) => void;
   * }} props
   */
  function SampleDetail({
    sample,
    sampleCache,
    pluginParamsDefs,
    pluginStatusMap,
    isPluginManagerOpen,
    editCacheInvalidator,
    onSampleUpdate,
    onSampleDuplicate,
    onSampleDelete,
    onOpenPluginManager,
    onRecheckPlugins,
    onRegenerateSampleCache,
  }) {
    /**
     * @type {(update: number | ((slotNumber: number) => number)) => void}
     */
    const handleSlotNumberUpdate = useCallback(
      (update) => {
        onSampleUpdate(sample.id, ({ slotNumber }) => ({
          slotNumber:
            typeof update === 'function' ? update(slotNumber) : update,
        }));
      },
      [sample.id, onSampleUpdate]
    );
    const sampleCaches = useMemo(
      () =>
        sampleCache
          ? new Map().set(sampleCache.sampleContainer.id, sampleCache)
          : new Map(),
      [sampleCache]
    );
    return (
      <Container fluid className={classes.detailContainer}>
        <div className={classes.detailGrid}>
          <main className={classes.editorRegion}>
            <div className={classes.sampleEyebrow}>
              Active sample / S.
              {sample.metadata.slotNumber.toString().padStart(3, '0')}
            </div>
            <h2 className={classes.sampleName}>
              <OverlayTrigger
                delay={{ show: 400, hide: 0 }}
                placement="top-start"
                overlay={<Tooltip>{sample.metadata.name}</Tooltip>}
              >
                <span>{sample.metadata.name}</span>
              </OverlayTrigger>
              <SampleDetailActions
                sampleId={sample.id}
                name={sample.metadata.name}
                sourceFileId={sample.metadata.sourceFileId}
                userFileInfo={sample.metadata.userFileInfo}
                onSampleUpdate={onSampleUpdate}
                onSampleDuplicate={onSampleDuplicate}
                onSampleDelete={onSampleDelete}
              />
            </h2>
            <p className={classes.sampleDates}>
              <strong>Sampled:</strong>{' '}
              {formatDate(new Date(sample.metadata.dateSampled))}
              <span aria-hidden="true"> / </span>
              <strong>Updated:</strong>{' '}
              {formatDate(new Date(sample.metadata.dateModified))}
            </p>
            <section className={classes.editorPanel}>
              <div className={classes.editorPanelHeading}>
                <span>Waveform / processing</span>
                <strong>Prepare sample</strong>
              </div>
              <WaveformEdit
                sample={sample}
                sampleCache={sampleCache}
                editCacheInvalidator={editCacheInvalidator}
                onSampleUpdate={onSampleUpdate}
              />
              <div className={classes.processingGrid}>
                <article className={classes.processingModule}>
                  <span className={classes.moduleNumber}>01</span>
                  <PitchControl
                    sampleId={sample.id}
                    pitchAdjustment={sample.metadata.pitchAdjustment}
                    onSampleUpdate={onSampleUpdate}
                  />
                </article>
                <article className={classes.processingModule}>
                  <span className={classes.moduleNumber}>02</span>
                  <QualityBitDepthControl
                    sampleId={sample.id}
                    qualityBitDepth={sample.metadata.qualityBitDepth}
                    onSampleUpdate={onSampleUpdate}
                  />
                </article>
                <article className={classes.processingModule}>
                  <span className={classes.moduleNumber}>03</span>
                  <PluginsControl
                    sampleId={sample.id}
                    sampleCache={sampleCache}
                    plugins={sample.metadata.plugins}
                    pluginParamsDefs={pluginParamsDefs}
                    pluginStatusMap={pluginStatusMap}
                    isPluginManagerOpen={isPluginManagerOpen}
                    onSampleUpdate={onSampleUpdate}
                    onOpenPluginManager={onOpenPluginManager}
                    onRecheckPlugins={onRecheckPlugins}
                    onRegenerateSampleCache={onRegenerateSampleCache}
                  />
                </article>
              </div>
            </section>
          </main>
          <aside className={classes.transferRegion} aria-label="Transfer deck">
            <div className={classes.transferHeading}>
              <div>
                <div className={classes.transferEyebrow}>Output / SYRO</div>
                <h3 className={classes.regionHeading}>Transfer deck</h3>
              </div>
              <span className={classes.readyStatus}>Ready</span>
            </div>
            <VolcaTransferControl
              samples={sample}
              sampleCaches={sampleCaches}
              onSlotNumberUpdate={handleSlotNumberUpdate}
            />
            <div className={classes.preflight}>
              <strong>Pre-flight</strong>
              <ol>
                <li>Connect headphone out to SYNC IN</li>
                <li>Set a clean output volume near maximum</li>
                <li>Close audio enhancement software</li>
              </ol>
            </div>
            <p className={classes.localNote}>
              <strong>Nothing is uploaded.</strong>
              Audio is encoded locally in this browser.
            </p>
          </aside>
        </div>
      </Container>
    );
  }
);

const SampleDetailActions = React.memo(
  /**
   * @param {{
   *   sampleId: string;
   *   name: string;
   *   sourceFileId: string;
   *   userFileInfo: { type: string; ext: string } | null;
   *   onSampleUpdate: (id: string, update: import('./store').SampleMetadataUpdateArg) => void;
   *   onSampleDuplicate: (id: string) => void;
   *   onSampleDelete: (id: string | string[]) => void;
   * }} props
   */
  ({
    sampleId,
    name,
    sourceFileId,
    userFileInfo,
    onSampleUpdate,
    onSampleDuplicate,
    onSampleDelete,
  }) => {
    const [deleting, setDeleting] = useState(false);
    /** @type {React.RefObject<HTMLInputElement>} */
    const renameInputRef = useRef(null);
    const [editedName, setEditedName] = useState(name);
    const [renaming, setRenaming] = useState(false);
    useEffect(() => {
      if (renaming) {
        setEditedName(name);
        if (renameInputRef.current) {
          renameInputRef.current.select();
        }
      }
    }, [renaming, name]);
    const newNameTrimmed = editedName.trim();
    /** @type {React.FormEventHandler} */
    const handleRename = useCallback(
      (e) => {
        e.preventDefault();
        if (newNameTrimmed) {
          onSampleUpdate(sampleId, { name: newNameTrimmed });
          setRenaming(false);
        }
      },
      [newNameTrimmed, sampleId, onSampleUpdate]
    );
    const handleDuplicate = useCallback(
      () => onSampleDuplicate(sampleId),
      [sampleId, onSampleDuplicate]
    );
    const downloadSourceFile = useCallback(async () => {
      const data = await SampleContainer.getSourceFileData(sourceFileId);
      const blob = new Blob([data], {
        type: userFileInfo ? userFileInfo.type : 'audio/x-wav',
      });
      downloadBlob(blob, `${name}${userFileInfo ? userFileInfo.ext : '.wav'}`);
    }, [name, sourceFileId, userFileInfo]);
    /** @type {React.FormEventHandler} */
    const handleDelete = useCallback(
      (e) => {
        e.preventDefault();
        onSampleDelete(sampleId);
        setDeleting(false);
      },
      [sampleId, onSampleDelete]
    );
    return (
      <>
        <DropdownButton
          className={classes.optionsButton}
          variant="secondary"
          align="end"
          title="Actions"
        >
          <Dropdown.Item onClick={() => setRenaming(true)}>
            Rename
          </Dropdown.Item>
          <Dropdown.Item onClick={handleDuplicate}>Duplicate</Dropdown.Item>
          <Dropdown.Item onClick={downloadSourceFile}>
            Download source audio
          </Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={() => setDeleting(true)}>
            Delete
          </Dropdown.Item>
        </DropdownButton>
        <div className={classes.actionButtons}>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={() => setRenaming(true)}
          >
            Rename
          </Button>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={handleDuplicate}
          >
            Duplicate
          </Button>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={downloadSourceFile}
          >
            Download source audio
          </Button>
          <Button
            type="button"
            variant="outline-primary"
            onClick={() => setDeleting(true)}
          >
            Delete
          </Button>
        </div>
        <Modal
          onHide={() => setRenaming(false)}
          show={renaming}
          aria-labelledby="rename-modal"
        >
          <Form onSubmit={handleRename}>
            <Modal.Header>
              <Modal.Title id="rename-modal">Renaming sample</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Choose a new name for the sample <strong>{name}</strong>:
              </p>
              <Form.Control
                ref={renameInputRef}
                defaultValue={name}
                onChange={(e) => setEditedName(e.target.value)}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                variant="light"
                onClick={() => setRenaming(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!newNameTrimmed}
              >
                Rename
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
        <Modal
          onHide={() => setDeleting(false)}
          show={deleting}
          aria-labelledby="delete-modal"
        >
          <Form onSubmit={handleDelete}>
            <Modal.Header className={classes.deleteModalHeader}>
              <WarningIcon />
              <Modal.Title id="delete-modal">Deleting sample</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>
                Are you sure you want to delete <strong>{name}</strong>? This
                can't be undone.
              </p>
            </Modal.Body>
            <Modal.Footer>
              <Button
                type="button"
                variant="light"
                onClick={() => setDeleting(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Delete
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </>
    );
  }
);

export default SampleDetail;
