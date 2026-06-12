import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Button } from 'react-bootstrap';
import LibraryIcon from '@material-design-icons/svg/filled/library_music.svg';
import RecordIcon from '@material-design-icons/svg/filled/mic.svg';
import PluginIcon from '@material-design-icons/svg/filled/extension.svg';
import SettingsIcon from '@material-design-icons/svg/filled/settings.svg';
import AddIcon from '@material-design-icons/svg/filled/add_circle_outline.svg';
import TransferIcon from '@material-design-icons/svg/filled/sync_alt.svg';

import SampleDetail from './SampleDetail.js';
import SampleDetailReadonly from './SampleDetailReadonly.js';
import SampleRecord from './SampleRecord.js';
import SampleMenu from './SampleMenu.js';
import Footer from './Footer.js';
import PluginManager from './PluginManager.js';
import {
  getFactorySamples,
  SampleContainer,
  sampleContainerDateCompare,
  storeAudioSourceFile,
} from './store.js';
import { SampleCache } from './sampleCacheStore.js';
import { getSamplePeaksForAudioBuffer } from './utils/waveform.js';
import { getAudioBufferForAudioFileData } from './utils/audioData.js';
import { newSampleName } from './utils/words.js';
import { onTabUpdateEvent, sendTabUpdateEvent } from './utils/tabSync.js';
import { getPluginStatus, listPluginParams } from './pluginStore.js';
import { ThemeProvider } from './theme/index.js';
import {
  AppShell,
  CommandBar,
  Panel,
  SectionHeading,
  UtilityRail,
  WorkspaceNav,
} from './ui/shell/index.js';
import { LibraryGrid } from './ui/library/index.js';
import SampleBulkActions from './SampleBulkActions.js';

import classes from './App.module.scss';
import { getPlugin } from './utils/plugins.js';

const sessionStorageKey = 'focused_sample_id';

/** @typedef {import('./sampleCacheStore.js').CachedInfo} CachedInfo */

function AppContent() {
  const [userSamples, setUserSamples] = useState(
    /** @type {Map<string, SampleContainer>} */ (new Map())
  );
  const [userSampleCaches, setUserSampleCaches] = useState(
    /** @type {Map<string, SampleCache>} */ (new Map())
  );
  const [factorySamples, setFactorySamples] = useState(
    /** @type {Map<string, SampleContainer>} */ (new Map())
  );
  const [factorySampleCaches, setFactorySampleCaches] = useState(
    /** @type {Map<string, SampleCache>} */ (new Map())
  );
  const allSamples = useMemo(() => {
    return new Map([...userSamples, ...factorySamples]);
  }, [userSamples, factorySamples]);
  useEffect(() => {
    getFactorySamples()
      .then((factorySamples) => {
        setFactorySamples(
          new Map(
            [...factorySamples].map(([id, { sampleContainer }]) => [
              id,
              sampleContainer,
            ])
          )
        );
        setFactorySampleCaches(
          new Map(
            [...factorySamples].map(([id, { sampleContainer, cachedInfo }]) => [
              id,
              new SampleCache({ sampleContainer, cachedInfo }),
            ])
          )
        );
      })
      .catch(console.error);
  }, []);
  const restoredFocusedSampleId =
    typeof sessionStorage === 'undefined'
      ? null
      : sessionStorage.getItem(sessionStorageKey);
  const [focusedSampleId, setFocusedSampleId] = useState(
    /** @type {string | null} */ (
      restoredFocusedSampleId && typeof restoredFocusedSampleId === 'string'
        ? restoredFocusedSampleId
        : null
    )
  );
  const [workspace, setWorkspace] = useState(
    /** @type {'workbench' | 'library' | 'capture' | 'about'} */ (
      restoredFocusedSampleId ? 'workbench' : 'capture'
    )
  );
  const [librarySelection, setLibrarySelection] = useState(
    /** @type {Set<string>} */ (new Set())
  );
  const focusedSampleIdRef = useRef(focusedSampleId);
  focusedSampleIdRef.current = focusedSampleId;
  useEffect(() => {
    if (focusedSampleId) {
      sessionStorage.setItem(sessionStorageKey, focusedSampleId);
    } else {
      sessionStorage.removeItem(sessionStorageKey);
    }
  }, [focusedSampleId]);
  const [loadingSamples, setLoadingSamples] = useState(true);
  useEffect(() => {
    // TODO: error handling
    // fetch focused cache first before the rest, so we have that
    // info loaded as quickly as possible.
    let initialDataLoadPromise = Promise.resolve();
    if (focusedSampleIdRef.current) {
      const focusedSampleId = focusedSampleIdRef.current;
      initialDataLoadPromise = Promise.all([
        SampleContainer.getByIdsFromStorage([focusedSampleId]),
        SampleCache.getCachedInfoByIdsFromStorage([focusedSampleId]),
      ])
        .then(([[sampleContainer], [cachedInfo]]) => {
          setUserSampleCaches((sampleCaches) =>
            new Map(sampleCaches).set(
              sampleContainer.id,
              new SampleCache.Mutable({
                sampleContainer,
                cachedInfo,
              })
            )
          );
        })
        // don't let this block.
        // we know it will fail for factory samples
        .catch((err) => {});
    }
    // now load everything else
    initialDataLoadPromise
      .then(() => SampleContainer.getAllFromStorage())
      .then(async ({ sampleContainers: storedSamples, cachedInfos }) => {
        setUserSamples((samples) => {
          const newSamples = new Map([
            ...samples,
            ...storedSamples.map(
              (sample) =>
                /** @type {[string, SampleContainer]} */ ([sample.id, sample])
            ),
          ]);
          return new Map(
            [...newSamples].sort(([, a], [, b]) =>
              sampleContainerDateCompare(a, b)
            )
          );
        });
        const storedSampleCachedInfo =
          await SampleCache.getAllCachedInfoFromStore();
        // Create sample caches for any samples that are missing one
        const samplesWithoutCache = storedSamples.filter(
          (s) => !cachedInfos.has(s.id) && !storedSampleCachedInfo.has(s.id)
        );
        for (const sample of samplesWithoutCache) {
          SampleCache.importToStorage(sample).then((sampleCache) => {
            setUserSampleCaches((sampleCaches) =>
              new Map(sampleCaches).set(sample.id, sampleCache)
            );
          });
        }
        // And add the rest of the sample caches that we have already
        setUserSampleCaches((sampleCaches) => {
          return new Map([
            ...sampleCaches,
            ...storedSamples
              .filter(
                (s) => storedSampleCachedInfo.has(s.id) || cachedInfos.has(s.id)
              )
              .map((sampleContainer) => {
                const upgradedCachedInfo = cachedInfos.get(sampleContainer.id);
                if (upgradedCachedInfo) {
                  return /** @type {[string, SampleCache]} */ ([
                    sampleContainer.id,
                    new SampleCache.Mutable.Upgraded({
                      sampleContainer,
                      cachedInfo: upgradedCachedInfo,
                    }),
                  ]);
                }
                return /** @type {[string, SampleCache]} */ ([
                  sampleContainer.id,
                  new SampleCache.Mutable({
                    sampleContainer,
                    cachedInfo: /** @type {CachedInfo} */ (
                      storedSampleCachedInfo.get(sampleContainer.id)
                    ),
                  }),
                ]);
              }),
          ]);
        });
      })
      .finally(() => {
        setLoadingSamples(false);
      });
  }, []);

  /**
   * @type {(audioFileBuffer: Uint8Array, userFile?: File) => Promise<'saved' | 'silent'>}
   * */
  const handleRecordFinish = useCallback(async (audioFileBuffer, userFile) => {
    const audioBuffer = await getAudioBufferForAudioFileData(audioFileBuffer);
    /**
     * @type {[number, number]}
     */
    const trimFrames = [0, 0];
    const waveformPeaks = await getSamplePeaksForAudioBuffer(
      audioBuffer,
      trimFrames
    );
    if (
      [...waveformPeaks.positive, ...waveformPeaks.negative].every(
        (peak) => peak === 0
      )
    ) {
      return 'silent';
    }
    const sourceFileId = await storeAudioSourceFile(audioFileBuffer);
    /**
     * @type {string}
     */
    let name = '';
    let userFileExtension = '';
    if (userFile) {
      const lastDotIndex = userFile.name.lastIndexOf('.');
      if (lastDotIndex > 0) {
        name = userFile.name.slice(0, lastDotIndex);
        userFileExtension = userFile.name.slice(lastDotIndex);
      } else {
        name = userFile.name;
      }
    } else {
      name = newSampleName();
    }
    const sample = new SampleContainer.Mutable({
      name,
      sourceFileId,
      trim: { frames: trimFrames },
      userFileInfo: userFile && {
        type: userFile.type,
        ext: userFileExtension,
      },
    });
    await sample.persist();
    setUserSamples((samples) => new Map([[sample.id, sample], ...samples]));
    setFocusedSampleId(sample.id);
    setWorkspace('workbench');
    Promise.resolve().then(() =>
      sendTabUpdateEvent('sample', [sample.id], 'create')
    );
    const sampleCache = new SampleCache.Mutable({
      sampleContainer: sample,
      cachedInfo: {
        waveformPeaks,
        postPluginFrameCount: audioBuffer.length,
        duration: audioBuffer.duration,
        failedPluginIndex: -1,
      },
    });
    await sampleCache.persist();
    setUserSampleCaches((caches) =>
      new Map(caches).set(sample.id, sampleCache)
    );
    Promise.resolve().then(() =>
      sendTabUpdateEvent('cache', [sample.id], 'create')
    );
    return 'saved';
  }, []);

  const userSampleCachesRef = useRef(userSampleCaches);
  userSampleCachesRef.current = userSampleCaches;

  /**
   * @type {(id: string | string[], update: import('./store').SampleMetadataUpdateArg) => void}
   */
  const handleSampleUpdate = useCallback((id, updater) => {
    const ids = id instanceof Array ? id : [id];
    setUserSamples((samples) => {
      const sampleList = /** @type {SampleContainer[]} */ (
        ids
          .map((id) => {
            const s = samples.get(id);
            return (s && s instanceof SampleContainer.Mutable && s) || null;
          })
          .filter(Boolean)
      );
      if (!sampleList.length) return samples;

      /** @type {Promise<void>[]} */
      const persistPromises = [];
      const updatedSampleList = sampleList.map((sample) => {
        if (!(sample instanceof SampleContainer.Mutable)) {
          return sample;
        }
        let onPersisted = () => {};
        persistPromises.push(new Promise((resolve) => (onPersisted = resolve)));
        const updated = sample.update(updater, onPersisted);
        if (updated !== sample) {
          Promise.resolve().then(async () => {
            const sampleCache = userSampleCachesRef.current.get(sample.id);
            if (!(sampleCache && sampleCache instanceof SampleCache.Mutable))
              return;
            await Promise.all(persistPromises);
            const newSampleCache = await sampleCache.update(updated);
            if (newSampleCache === sampleCache) {
              return;
            }
            if (newSampleCache.sampleContainer !== updated) {
              setUserSamples((samples) => {
                const newSamples = new Map(samples);
                newSamples.delete(sample.id);
                return new Map([
                  [sample.id, newSampleCache.sampleContainer],
                  ...newSamples,
                ]);
              });
              sendTabUpdateEvent('sample', [sample.id], 'edit');
            }
            setUserSampleCaches((caches) =>
              new Map(caches).set(sample.id, newSampleCache)
            );
            sendTabUpdateEvent('cache', [sample.id], 'edit');
          });
        }
        return updated;
      });
      if (updatedSampleList.every((s, i) => sampleList[i] === s)) {
        return samples;
      }
      Promise.all(persistPromises).then(() => {
        sendTabUpdateEvent(
          'sample',
          updatedSampleList.map((s) => s.id),
          'edit'
        );
      });
      const newSamples = new Map(samples);
      for (const { id } of updatedSampleList) {
        newSamples.delete(id);
      }
      return new Map([
        ...updatedSampleList
          .slice()
          .sort(sampleContainerDateCompare)
          .map((s) => /** @type {[string, SampleContainer]} */ ([s.id, s])),
        ...newSamples,
      ]);
    });
  }, []);
  /**
   * @type {(
   *   bulkAddSamples: SampleContainer[],
   *   bulkAddSampleCaches: SampleCache[]
   * ) => void}
   */
  const handleSampleBulkAdd = useCallback(
    (bulkAddSamples, bulkAddSampleCaches) => {
      setUserSamples((samples) => {
        const newSamples = new Map([
          ...samples,
          ...bulkAddSamples.map(
            (s) => /** @type {[string, SampleContainer]} */ ([s.id, s])
          ),
        ]);
        return new Map(
          [...newSamples].sort(([, a], [, b]) =>
            sampleContainerDateCompare(a, b)
          )
        );
      });
      sendTabUpdateEvent(
        'sample',
        bulkAddSamples.map((s) => s.id),
        'create'
      );
      setUserSampleCaches((caches) => {
        return new Map([
          ...caches,
          ...bulkAddSampleCaches.map(
            (s) =>
              /** @type {[string, SampleCache]} */ ([s.sampleContainer.id, s])
          ),
        ]);
      });
      sendTabUpdateEvent(
        'cache',
        bulkAddSampleCaches.map((s) => s.sampleContainer.id),
        'create'
      );
      setWorkspace('library');
    },
    []
  );

  /**
   * This is limited to rare use cases replacing data that doesn't
   * need to change the sample modified date and doesn't need to
   * update the sample cache. For now the only use case is for
   * renaming a plugin.
   * @type {(samples: SampleContainer[]) => void}
   */
  const handleSampleBulkReplace = useCallback((samples) => {
    setUserSamples((samples) => {
      const newSamples = new Map(samples);
      for (const [id, sample] of samples) {
        if (newSamples.has(id)) {
          newSamples.set(id, sample);
        }
      }
      return newSamples;
    });
    sendTabUpdateEvent(
      'sample',
      samples.map((s) => s.id),
      'edit'
    );
  }, []);

  const allSamplesRef = useRef(allSamples);
  allSamplesRef.current = allSamples;
  const factorySampleCachesRef = useRef(factorySampleCaches);
  factorySampleCachesRef.current = factorySampleCaches;
  const handleSampleDuplicate = useCallback(
    /**
     * @param {string} id
     */
    (id) => {
      const sample = allSamplesRef.current.get(id);
      if (sample) {
        const newSample = sample.duplicate((id) => {
          sendTabUpdateEvent('sample', [id], 'create');
        });
        setUserSamples(
          (samples) => new Map([[newSample.id, newSample], ...samples])
        );
        const oldSampleCache =
          userSampleCachesRef.current.get(id) ||
          factorySampleCachesRef.current.get(id);
        if (oldSampleCache) {
          const newSampleCache = new SampleCache.Mutable({
            sampleContainer: newSample,
            cachedInfo: oldSampleCache.cachedInfo,
          });
          newSampleCache.persist().then(() => {
            sendTabUpdateEvent('cache', [newSample.id], 'create');
          });
          setUserSampleCaches((caches) =>
            new Map(caches).set(newSample.id, newSampleCache)
          );
        }
        setFocusedSampleId(newSample.id);
        setWorkspace('workbench');
      }
    },
    []
  );

  const userSamplesRef = useRef(userSamples);
  userSamplesRef.current = userSamples;
  const handleSampleDelete = useCallback(
    /**
     * @param {string | string[]} id
     * @param {boolean} [noPersist]
     */
    (id, noPersist) => {
      const ids = id instanceof Array ? id : [id];
      const userSamples = userSamplesRef.current;
      // if we are focused on the sample we are deleting, try to move the
      // focus to the next newer sample, or else the next sample after.
      if (
        focusedSampleIdRef.current &&
        ids.includes(focusedSampleIdRef.current)
      ) {
        const userSamplesList = [...userSamples.values()];
        const focusedSampleIndex = userSamplesList.findIndex(
          (s) => s.id === focusedSampleIdRef.current
        );
        const nextNewerAvailableSample = userSamplesList
          .slice(0, focusedSampleIndex)
          .reverse()
          .find((s) => !ids.includes(s.id));
        const nextFocusedSample = nextNewerAvailableSample
          ? nextNewerAvailableSample
          : // if there is no newer sample left then try to find the next after
            userSamplesList
              .slice(focusedSampleIndex + 1)
              .find((s) => !ids.includes(s.id));
        setFocusedSampleId(nextFocusedSample ? nextFocusedSample.id : null);
      }
      if (!noPersist) {
        Promise.all(
          ids.map(async (idToDelete) => {
            const sample = userSamples.get(idToDelete);
            if (sample && sample instanceof SampleContainer.Mutable) {
              await sample.remove();
            }
          })
        ).then(() => sendTabUpdateEvent('sample', ids, 'delete'));
        Promise.all(
          ids.map(async (idToDelete) => {
            const sampleCache = userSampleCachesRef.current.get(idToDelete);
            if (sampleCache && sampleCache instanceof SampleCache.Mutable) {
              await sampleCache.remove();
            }
          })
          // Maybe we don't really need to send this event because they will
          // already be deleted with the earlier event... but just for
          // consistency we'll keep it for now.
        ).then(() => sendTabUpdateEvent('cache', ids, 'delete'));
      }
      setUserSamples((samples) => {
        const newSamples = new Map(samples);
        for (const id of ids) {
          newSamples.delete(id);
        }
        return newSamples;
      });
      setUserSampleCaches((caches) => {
        const newCaches = new Map(caches);
        for (const id of ids) {
          newCaches.delete(id);
        }
        return newCaches;
      });
    },
    []
  );

  const [editCacheInvalidator, setEditCacheInvalidator] = useState(Symbol());

  const handleRegenerateSampleCache = useCallback(
    /** @param {string} sampleId */
    (sampleId) => {
      const sampleContainer = userSamplesRef.current.get(sampleId);
      if (!sampleContainer) return;
      setEditCacheInvalidator(Symbol());
      SampleCache.importToStorage(sampleContainer).then((sampleCache) => {
        setUserSampleCaches((sampleCaches) =>
          new Map(sampleCaches).set(sampleId, sampleCache)
        );
      });
    },
    []
  );

  useEffect(() => {
    return onTabUpdateEvent('sample', async (event) => {
      if (event.action === 'delete') {
        handleSampleDelete(event.ids, true);
      } else {
        const syncedSamples = await SampleContainer.getByIdsFromStorage(
          event.ids
        );
        setUserSamples((samples) => {
          const newSamples = new Map([
            ...samples,
            ...syncedSamples.map(
              (s) => /** @type {[string, SampleContainer]} */ ([s.id, s])
            ),
          ]);
          return new Map(
            [...newSamples].sort(([, a], [, b]) =>
              sampleContainerDateCompare(a, b)
            )
          );
        });
      }
    });
  }, [handleSampleDelete]);

  useEffect(() => {
    return onTabUpdateEvent('cache', async (event) => {
      if (event.action === 'delete') {
        setUserSampleCaches((caches) => {
          const newCaches = new Map(caches);
          for (const id of event.ids) {
            newCaches.delete(id);
          }
          return newCaches;
        });
      } else {
        const syncedCachedInfos =
          await SampleCache.getCachedInfoByIdsFromStorage(event.ids);
        // request animation frame to make sure userSamples ref is updated
        // with previous sample event
        requestAnimationFrame(() => {
          setUserSampleCaches((caches) => {
            const userSamples = userSamplesRef.current;
            if (!userSamples) return caches;
            return new Map([
              ...caches,
              ...syncedCachedInfos.map(
                (cachedInfo, i) =>
                  /** @type {[string, SampleCache]} */ ([
                    event.ids[i],
                    new SampleCache.Mutable({
                      cachedInfo,
                      // we assume the sample event was processed first
                      sampleContainer: /** @type {SampleContainer} */ (
                        userSamples.get(event.ids[i])
                      ),
                    }),
                  ])
              ),
            ]);
          });
        });
      }
    });
  }, []);

  const handleSampleSelect = useCallback(
    /**
     * @param {string | null} sampleId
     */
    (sampleId) => {
      setFocusedSampleId(sampleId);
      setWorkspace(sampleId ? 'workbench' : 'capture');
    },
    []
  );

  const handleNewSample = useCallback(() => {
    setFocusedSampleId(null);
    setWorkspace('capture');
    requestAnimationFrame(() => {
      document.getElementById('record-button')?.focus();
    });
  }, []);

  const sample = focusedSampleId ? allSamples.get(focusedSampleId) : null;
  const sampleCache =
    (sample &&
      (userSampleCaches.get(sample.id) ||
        factorySampleCaches.get(sample.id))) ||
    null;
  const allSampleCaches = useMemo(
    () => new Map([...userSampleCaches, ...factorySampleCaches]),
    [userSampleCaches, factorySampleCaches]
  );
  const userSampleIds = useMemo(
    () => new Set(userSamples.keys()),
    [userSamples]
  );
  useEffect(() => {
    setLibrarySelection(
      (selection) =>
        new Set([...selection].filter((sampleId) => allSamples.has(sampleId)))
    );
  }, [allSamples]);

  const [isPluginManagerOpen, setIsPluginManagerOpen] = useState(false);
  const openPluginManager = useCallback(() => setIsPluginManagerOpen(true), []);
  const closePluginManager = useCallback(
    () => setIsPluginManagerOpen(false),
    []
  );

  const [pluginParamsDefs, setPluginParamsDefs] = useState(
    /** @type {Awaited<ReturnType<typeof listPluginParams>>} */ (new Map())
  );
  const updatePluginParamsDefs = useCallback(async () => {
    const pluginParamDefs = await listPluginParams();
    setPluginParamsDefs(pluginParamDefs);
  }, []);
  useEffect(() => {
    updatePluginParamsDefs();
    return onTabUpdateEvent('plugin', updatePluginParamsDefs);
  }, [updatePluginParamsDefs]);

  const pluginNameList = useMemo(
    () => [...pluginParamsDefs.keys()],
    [pluginParamsDefs]
  );

  const [pluginStatusMap, setPluginStatusMap] = useState(
    /** @type {Map<string, import('./pluginStore').PluginStatus> | null} */ (
      null
    )
  );
  useEffect(() => {
    /** @type {typeof pluginStatusMap} */
    const newStatusMap = new Map();
    let cancelled = false;
    getPluginStatus(...pluginNameList).then((statuses) => {
      if (cancelled) return;
      pluginNameList.forEach((pluginName, i) => {
        newStatusMap.set(pluginName, statuses[i]);
      });
      setPluginStatusMap(newStatusMap);
    });
    const pluginErrorUnsubscribeCallbacks = pluginNameList.map((pluginName) =>
      getPlugin(pluginName).onPluginError(() =>
        setPluginStatusMap((pluginStatusMap) =>
          new Map(pluginStatusMap).set(pluginName, 'broken')
        )
      )
    );
    return () => {
      cancelled = true;
      for (const callback of pluginErrorUnsubscribeCallbacks) {
        callback();
      }
    };
  }, [pluginNameList]);

  const navigationItems = useMemo(
    () => [
      {
        id: 'samples',
        label: 'Samples',
        icon: <LibraryIcon />,
      },
      {
        id: 'record',
        label: 'Record',
        icon: <RecordIcon />,
      },
      {
        id: 'plugins',
        label: 'Plugins',
        icon: <PluginIcon />,
      },
      {
        id: 'transfer',
        label: 'Transfer',
        icon: <TransferIcon />,
        disabled: !sample,
      },
      {
        id: 'about',
        label: 'About',
        icon: <SettingsIcon />,
      },
    ],
    [sample]
  );

  const activeNavigationId =
    workspace === 'capture'
      ? 'record'
      : workspace === 'about'
      ? 'about'
      : 'samples';
  const handleNavigation = useCallback(
    (destination) => {
      if (destination === 'plugins') {
        openPluginManager();
        return;
      }
      if (destination === 'transfer') {
        setWorkspace('workbench');
        requestAnimationFrame(() => {
          document
            .querySelector('[aria-label="Transfer deck"]')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
        return;
      }
      setWorkspace(
        destination === 'record'
          ? 'capture'
          : destination === 'about'
          ? 'about'
          : 'workbench'
      );
    },
    [openPluginManager]
  );

  const workspaceLabel = {
    workbench: 'Sample preparation',
    library: 'All samples',
    capture: 'Record or import',
    about: 'About and help',
  }[workspace];

  const sampleEditor =
    !sample ? (
      <Panel className={classes.emptyWorkbench}>
        <SectionHeading
          eyebrow="Workbench"
          title="Choose a sample to prepare"
          description="Select a sample from the bank, browse the full library, or record and import a new sound."
        />
        <div className={classes.emptyActions}>
          <Button type="button" onClick={() => setWorkspace('library')}>
            Open library
          </Button>
          <Button
            type="button"
            variant="outline-secondary"
            onClick={handleNewSample}
          >
            Record or import
          </Button>
        </div>
      </Panel>
    ) : sample instanceof SampleContainer.Mutable ? (
      <SampleDetail
        sample={sample}
        sampleCache={sampleCache}
        pluginParamsDefs={pluginParamsDefs}
        pluginStatusMap={pluginStatusMap}
        isPluginManagerOpen={isPluginManagerOpen}
        editCacheInvalidator={editCacheInvalidator}
        onSampleUpdate={handleSampleUpdate}
        onSampleDuplicate={handleSampleDuplicate}
        onSampleDelete={handleSampleDelete}
        onOpenPluginManager={openPluginManager}
        onRecheckPlugins={updatePluginParamsDefs}
        onRegenerateSampleCache={handleRegenerateSampleCache}
      />
    ) : (
      <SampleDetailReadonly
        sample={sample}
        sampleCache={sampleCache}
        onSampleDuplicate={handleSampleDuplicate}
      />
    );

  return (
    <div className={classes.app}>
      <AppShell
        className={
          workspace === 'workbench'
            ? classes.consoleShellDense
            : classes.consoleShell
        }
        commandBar={
          <CommandBar
            brand={
              <button
                className={classes.brandMark}
                type="button"
                aria-label="Start a new sample"
                onClick={handleNewSample}
              >
                VS
              </button>
            }
            title="Volca Sampler"
            context={`Hardware utility console / ${workspaceLabel}`}
            status={
              <span className={classes.storageStatus}>
                <i aria-hidden="true" />
                Browser storage ready
                <b aria-hidden="true" />
                {allSamples.size} samples
              </span>
            }
            actions={
              <>
                <button
                  className={classes.commandButton}
                  type="button"
                  onClick={openPluginManager}
                >
                  <PluginIcon aria-hidden="true" />
                  <span>Plugins</span>
                </button>
                <button
                  className={classes.primaryCommand}
                  type="button"
                  onClick={handleNewSample}
                >
                  <AddIcon aria-hidden="true" />
                  <span>New sample</span>
                </button>
              </>
            }
          />
        }
        utilityRail={
          <UtilityRail
            items={navigationItems}
            activeId={activeNavigationId}
            onNavigate={handleNavigation}
          />
        }
        workspaceNav={
          <WorkspaceNav
            items={navigationItems}
            activeId={activeNavigationId}
            onNavigate={handleNavigation}
          />
        }
        mainLabel={workspaceLabel}
      >
        {workspace === 'workbench' && (
          <div className={classes.workbench}>
            <Panel
              className={classes.sampleBank}
              padding="compact"
              ariaLabel="Sample bank"
            >
              <div className={classes.bankHeading}>
                <div>
                  <span>Bank / Local</span>
                  <strong>Your samples</strong>
                </div>
                <button type="button" onClick={() => setWorkspace('library')}>
                  <LibraryIcon aria-hidden="true" />
                  <span>Full library</span>
                </button>
              </div>
              <SampleMenu
                loading={loadingSamples}
                focusedSampleId={focusedSampleId}
                userSamples={userSamples}
                factorySamples={factorySamples}
                userSampleCaches={userSampleCaches}
                factorySampleCaches={factorySampleCaches}
                onSampleSelect={handleSampleSelect}
                onSampleDelete={handleSampleDelete}
              />
            </Panel>
            <div className={classes.editorWorkspace}>{sampleEditor}</div>
          </div>
        )}

        {workspace === 'library' && (
          <LibraryGrid
            userSamples={userSamples}
            factorySamples={factorySamples}
            userSampleCaches={userSampleCaches}
            factorySampleCaches={factorySampleCaches}
            selectedSampleIds={librarySelection}
            focusedSampleId={focusedSampleId}
            onFocusSample={(selectedSample) => {
              setFocusedSampleId(selectedSample.id);
              setWorkspace('workbench');
            }}
            onSelectionChange={setLibrarySelection}
            renderBulkActions={({ samples: selectedSamples }) => (
              <SampleBulkActions
                samples={selectedSamples}
                userSampleIds={userSampleIds}
                sampleCaches={allSampleCaches}
                onDelete={handleSampleDelete}
                onClearSelection={() => setLibrarySelection(new Set())}
              />
            )}
          />
        )}

        {workspace === 'capture' && (
          <Panel className={classes.capturePanel}>
            <SectionHeading
              eyebrow="Input / Local"
              title="Record or import"
              description="Create a sample from your microphone, an audio file, or an existing Volca Sampler backup."
            />
            <SampleRecord
              userSamples={userSamples}
              onUpdatePluginList={updatePluginParamsDefs}
              onRegenerateSampleCache={handleRegenerateSampleCache}
              onBulkImport={handleSampleBulkAdd}
              onRecordFinish={handleRecordFinish}
            />
          </Panel>
        )}

        {workspace === 'about' && (
          <Panel className={classes.aboutPanel}>
            <SectionHeading
              eyebrow="System / Help"
              title="About Volca Sampler"
              description="Compatibility, offline use, licenses, and local-first storage information."
            />
            <Footer />
          </Panel>
        )}
      </AppShell>
      <PluginManager
        isOpen={isPluginManagerOpen}
        pluginList={pluginNameList}
        pluginStatusMap={pluginStatusMap}
        userSamples={userSamples}
        onUpdatePluginList={updatePluginParamsDefs}
        onSampleUpdate={handleSampleUpdate}
        onSampleBulkReplace={handleSampleBulkReplace}
        onRegenerateSampleCache={handleRegenerateSampleCache}
        onClose={closePluginManager}
      />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
