import React, { useEffect, useMemo, useState } from 'react';
import { Container, Button, Alert } from 'react-bootstrap';

import WaveformReadonly from './WaveformReadonly.js';
import VolcaTransferControl from './VolcaTransferControl.js';
import { SampleContainer } from './store.js';
import { formatDate } from './utils/datetime.js';

import classes from './SampleDetail.module.scss';

/**
 * @param {import('./store').SampleContainer} readonlySample
 */
function useSampleWithTemporalSlotNumber(readonlySample) {
  const readonlySlotNumber = readonlySample.metadata.slotNumber;
  const [slotNumber, setSlotNumber] = useState(readonlySlotNumber);
  useEffect(() => {
    setSlotNumber(readonlySlotNumber);
  }, [readonlySlotNumber]);
  const sample = useMemo(
    () =>
      readonlySample &&
      new SampleContainer({
        id: readonlySample.id,
        ...readonlySample.metadata,
        slotNumber,
      }),
    [readonlySample, slotNumber]
  );
  return { sample, setSlotNumber };
}

/**
 * @param {{
 *   sample: import('./store').SampleContainer;
 *   sampleCache: import('./sampleCacheStore.js').SampleCache | null;
 *   onSampleDuplicate: (id: string) => void;
 * }} props
 */
function SampleDetailReadonly({
  sample: readonlySample,
  sampleCache,
  onSampleDuplicate,
}) {
  const { sample, setSlotNumber } =
    useSampleWithTemporalSlotNumber(readonlySample);
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
            Factory sample / S.
            {sample.metadata.slotNumber.toString().padStart(3, '0')}
          </div>
          <h2 className={classes.sampleName}>{sample.metadata.name}</h2>
          <p className={classes.sampleDates}>
            <strong>Sampled:</strong>{' '}
            {formatDate(new Date(sample.metadata.dateSampled))}
          </p>
          <Alert variant="secondary">
            <Alert.Heading>This is a factory sample.</Alert.Heading>
            <p>
              If you want to trim the audio, adjust quality, change the pitch or
              use plugins before transferring to the volca sample,{' '}
              <span className={classes.buttonLink}>
                <Button
                  variant="link"
                  onClick={() => onSampleDuplicate(sample.id)}
                >
                  make a duplicate
                </Button>
                .
              </span>
            </p>
          </Alert>
          <section className={classes.editorPanel}>
            <h3 className={classes.regionHeading}>Preview sample</h3>
            <WaveformReadonly sample={sample} sampleCache={sampleCache} />
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
            onSlotNumberUpdate={setSlotNumber}
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

export default SampleDetailReadonly;
