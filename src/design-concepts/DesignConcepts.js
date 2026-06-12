import React, { useMemo, useState } from 'react';

const samples = [
  {
    id: 'kick',
    name: 'Basement Kick',
    slot: 12,
    duration: '0.84',
    size: '36 KB',
    tone: 'warm',
    status: 'ready',
    updated: '2 min ago',
  },
  {
    id: 'clap',
    name: 'Tape Clap',
    slot: 18,
    duration: '1.12',
    size: '48 KB',
    tone: 'bright',
    status: 'ready',
    updated: '8 min ago',
  },
  {
    id: 'vox',
    name: 'Vox Fragment 03',
    slot: 42,
    duration: '2.48',
    size: '104 KB',
    tone: 'violet',
    status: 'review',
    updated: '12 min ago',
  },
  {
    id: 'hat',
    name: 'Dust Hat',
    slot: 31,
    duration: '0.36',
    size: '17 KB',
    tone: 'cyan',
    status: 'ready',
    updated: 'Yesterday',
  },
  {
    id: 'chord',
    name: 'Minor Ninth Stab',
    slot: 67,
    duration: '3.06',
    size: '126 KB',
    tone: 'green',
    status: 'plugin',
    updated: 'Yesterday',
  },
  {
    id: 'perc',
    name: 'Metal Perc',
    slot: 24,
    duration: '0.72',
    size: '31 KB',
    tone: 'orange',
    status: 'ready',
    updated: 'Jun 8',
  },
];

const conceptLinks = [
  ['hardware-console', 'A', 'Hardware Console'],
  ['workflow-studio', 'B', 'Workflow Studio'],
  ['library-prep', 'C', 'Library + Prep'],
];

function Icon({ name, size = 18 }) {
  const paths = {
    back: <path d="m15 18-6-6 6-6" />,
    chevron: <path d="m9 18 6-6-6-6" />,
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
      </>
    ),
    folder: (
      <path d="M3 6h6l2 2h10v11H3Z" />
    ),
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6" />
        <path d="M12 7h.01" />
      </>
    ),
    library: (
      <>
        <path d="M4 4h5v16H4Z" />
        <path d="M10 4h4v16h-4Z" />
        <path d="m15 5 4-1 3 15-4 1Z" />
      </>
    ),
    menu: (
      <>
        <path d="M4 7h16" />
        <path d="M4 12h16" />
        <path d="M4 17h16" />
      </>
    ),
    mic: (
      <>
        <rect x="9" y="3" width="6" height="11" rx="3" />
        <path d="M5 11a7 7 0 0 0 14 0" />
        <path d="M12 18v3" />
      </>
    ),
    more: (
      <>
        <circle cx="5" cy="12" r="1" />
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
      </>
    ),
    play: <path d="m8 5 11 7-11 7Z" />,
    plugin: (
      <>
        <path d="M8 3v4" />
        <path d="M16 3v4" />
        <path d="M6 7h12v5a6 6 0 0 1-12 0Z" />
        <path d="M12 18v3" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    record: <circle cx="12" cy="12" r="7" fill="currentColor" stroke="none" />,
    search: (
      <>
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path d="m16 16 5 5" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />
      </>
    ),
    spark: (
      <path d="m12 2 1.6 6.4L20 10l-6.4 1.6L12 18l-1.6-6.4L4 10l6.4-1.6Z" />
    ),
    transfer: (
      <>
        <path d="M4 7h13" />
        <path d="m14 4 3 3-3 3" />
        <path d="M20 17H7" />
        <path d="m10 14-3 3 3 3" />
      </>
    ),
    upload: (
      <>
        <path d="M12 21V9" />
        <path d="m7 14 5-5 5 5" />
        <path d="M5 3h14" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      className="dc-icon"
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">
        {paths[name]}
      </g>
    </svg>
  );
}

function Waveform({ seed = 0, compact = false }) {
  const bars = useMemo(
    () =>
      Array.from({ length: compact ? 30 : 64 }, (_, index) => {
        const value =
          Math.abs(
            Math.sin((index + seed * 3) * 0.62) * 0.64 +
              Math.cos((index + seed) * 0.19) * 0.28
          ) + 0.08;
        return Math.min(1, value);
      }),
    [compact, seed]
  );

  return (
    <div className={`dc-waveform ${compact ? 'is-compact' : ''}`} aria-hidden="true">
      {bars.map((height, index) => (
        <i key={index} style={{ '--bar-height': `${Math.round(height * 100)}%` }} />
      ))}
    </div>
  );
}

function PreviewBar({ active }) {
  return (
    <div className="dc-preview-bar">
      <div className="dc-preview-label">
        <span>Design preview</span>
        <strong>Static UI only</strong>
      </div>
      <nav aria-label="Design concepts">
        {conceptLinks.map(([slug, letter, label]) => (
          <a
            className={active === slug ? 'is-active' : ''}
            href={`/design-concepts/${slug}`}
            key={slug}
          >
            <span>{letter}</span>
            {label}
          </a>
        ))}
      </nav>
      <a className="dc-return-link" href="/">
        <Icon name="back" size={16} />
        Current app
      </a>
    </div>
  );
}

function StatusPill({ status, children }) {
  return <span className={`dc-status dc-status-${status}`}>{children}</span>;
}

function HardwareSampleRow({ sample, selected, onSelect, index }) {
  return (
    <button
      className={`hc-sample-row ${selected ? 'is-selected' : ''}`}
      onClick={() => onSelect(sample.id)}
      type="button"
    >
      <span className="hc-row-play" aria-label={`Preview ${sample.name}`}>
        <Icon name="play" size={14} />
      </span>
      <span className="hc-row-main">
        <span className="hc-row-name">{sample.name}</span>
        <Waveform compact seed={index + 1} />
      </span>
      <span className="hc-row-meta">
        <strong>{String(sample.slot).padStart(3, '0')}</strong>
        <small>{sample.duration}s</small>
      </span>
    </button>
  );
}

export function HardwareConsole() {
  const [selectedId, setSelectedId] = useState('vox');
  const selectedSample = samples.find(({ id }) => id === selectedId) || samples[0];

  return (
    <div className="dc-page hc-page">
      <PreviewBar active="hardware-console" />
      <header className="hc-header">
        <div className="hc-brand">
          <span className="hc-brand-mark">VS</span>
          <span>
            <strong>VOLCA SAMPLER</strong>
            <small>HARDWARE UTILITY CONSOLE / CONCEPT A</small>
          </span>
        </div>
        <div className="hc-device-state">
          <span className="hc-live-dot" />
          Browser storage ready
          <span className="hc-divider" />
          6 samples
        </div>
        <div className="hc-header-actions">
          <button type="button"><Icon name="plugin" /> Plugins</button>
          <button type="button"><Icon name="download" /> Backup</button>
          <button className="is-primary" type="button"><Icon name="plus" /> New sample</button>
        </div>
      </header>

      <main className="hc-workspace">
        <aside className="hc-rail" aria-label="Utility navigation">
          <button className="is-active" type="button"><Icon name="library" /><span>Samples</span></button>
          <button type="button"><Icon name="mic" /><span>Record</span></button>
          <button type="button"><Icon name="plugin" /><span>Plugins</span></button>
          <button type="button"><Icon name="transfer" /><span>Transfer</span></button>
          <button type="button"><Icon name="settings" /><span>About</span></button>
        </aside>

        <section className="hc-library">
          <div className="hc-panel-heading">
            <span>
              <small>BANK / LOCAL</small>
              <strong>Your samples</strong>
            </span>
            <button aria-label="More library actions" type="button"><Icon name="more" /></button>
          </div>
          <label className="hc-search">
            <Icon name="search" />
            <input aria-label="Search samples" placeholder="Search name or slot" />
            <kbd>/</kbd>
          </label>
          <div className="hc-library-tabs">
            <button className="is-active" type="button">Local <span>06</span></button>
            <button type="button">Factory <span>100</span></button>
          </div>
          <div className="hc-sample-list">
            {samples.map((sample, index) => (
              <HardwareSampleRow
                index={index}
                key={sample.id}
                onSelect={setSelectedId}
                sample={sample}
                selected={sample.id === selectedId}
              />
            ))}
          </div>
          <div className="hc-bulk-bar">
            <button type="button">Select multiple</button>
            <span>4.2 MB local</span>
          </div>
        </section>

        <section className="hc-editor">
          <div className="hc-editor-title">
            <div>
              <small>ACTIVE SAMPLE / S.{String(selectedSample.slot).padStart(3, '0')}</small>
              <h1>{selectedSample.name}</h1>
            </div>
            <div className="hc-editor-actions">
              <button aria-label="Rename sample" type="button"><Icon name="edit" /></button>
              <button aria-label="More sample actions" type="button"><Icon name="more" /></button>
            </div>
          </div>

          <div className="hc-wave-panel">
            <div className="hc-wave-toolbar">
              <button className="hc-round-play" type="button"><Icon name="play" /></button>
              <span><strong>00:00.000</strong><small>/ 00:02.480</small></span>
              <div className="hc-wave-legend">
                <span><i className="trimmed" /> Trimmed</span>
                <span><i className="kept" /> Kept</span>
              </div>
              <button type="button"><Icon name="download" /> WAV</button>
            </div>
            <div className="hc-large-wave">
              <Waveform seed={3} />
              <span className="hc-trim-shade left" />
              <span className="hc-trim-shade right" />
              <span className="hc-trim-handle left">0.18</span>
              <span className="hc-trim-handle right">2.48</span>
              <span className="hc-playhead" />
            </div>
            <div className="hc-wave-footer">
              <span>SOURCE 48 kHz / STEREO</span>
              <span>OUTPUT 31.25 kHz / MONO</span>
              <button type="button">Select all</button>
            </div>
          </div>

          <div className="hc-control-grid">
            <article className="hc-module">
              <div className="hc-module-title"><span>01</span><strong>Gain + normalize</strong><StatusPill status="on">ON</StatusPill></div>
              <div className="hc-knob-row">
                <div className="hc-knob"><i /><strong>-1.2</strong><small>dB</small></div>
                <div className="hc-module-copy"><strong>Peak normalization</strong><span>Selection only</span></div>
              </div>
            </article>
            <article className="hc-module">
              <div className="hc-module-title"><span>02</span><strong>Pitch</strong><StatusPill status="off">BYPASS</StatusPill></div>
              <div className="hc-slider-control">
                <span>-12</span><i><b /></i><span>+12</span>
                <strong>0.00 st</strong>
              </div>
            </article>
            <article className="hc-module">
              <div className="hc-module-title"><span>03</span><strong>Quality</strong><StatusPill status="on">READY</StatusPill></div>
              <div className="hc-segment-control">
                <button type="button">8 bit</button>
                <button className="is-active" type="button">12 bit</button>
                <button type="button">16 bit</button>
              </div>
              <p>Compression enabled / Volca optimized</p>
            </article>
            <article className="hc-module">
              <div className="hc-module-title"><span>04</span><strong>Plugins</strong><StatusPill status="warn">1 ACTIVE</StatusPill></div>
              <div className="hc-plugin-line"><Icon name="plugin" /><span><strong>soft-clip.js</strong><small>Drive 18%</small></span><button type="button">Tune</button></div>
            </article>
          </div>
        </section>

        <aside className="hc-transfer">
          <div className="hc-panel-heading">
            <span><small>OUTPUT / SYRO</small><strong>Transfer deck</strong></span>
            <StatusPill status="on">READY</StatusPill>
          </div>
          <div className="hc-slot-display">
            <small>DESTINATION SLOT</small>
            <div><button type="button">-</button><strong>{String(selectedSample.slot).padStart(3, '0')}</strong><button type="button">+</button></div>
            <span>Volca Sample 2 range: 000-199</span>
          </div>
          <div className="hc-meter-card">
            <div><span>Sample length</span><strong>{selectedSample.duration}s</strong></div>
            <div><span>Memory</span><strong>{selectedSample.size}</strong></div>
            <div><span>Transfer time</span><strong>00:08</strong></div>
            <div className="hc-memory-meter"><i><b /></i><span>2.8 MB of 4 MB kit estimate</span></div>
          </div>
          <div className="hc-checklist">
            <strong>Pre-flight</strong>
            <p><span>1</span><b>Connect headphone out to SYNC IN</b></p>
            <p><span>2</span><b>Set clean output volume near maximum</b></p>
            <p><span>3</span><b>Close audio enhancement software</b></p>
          </div>
          <button className="hc-transfer-button" type="button">
            <Icon name="transfer" size={21} />
            <span><strong>Transfer sample</strong><small>Encoded locally in browser</small></span>
          </button>
          <button className="hc-clear-button" type="button">Clear slots on Volca</button>
          <div className="hc-safety-note"><Icon name="info" /><p><strong>Nothing is uploaded.</strong><br />Audio processing and transfer stay on this device.</p></div>
        </aside>
      </main>
    </div>
  );
}

const workflowSteps = [
  { id: 1, label: 'Source', detail: 'Record or import' },
  { id: 2, label: 'Prepare', detail: 'Trim and process' },
  { id: 3, label: 'Assign', detail: 'Choose a slot' },
  { id: 4, label: 'Transfer', detail: 'Send to Volca' },
];

export function WorkflowStudio() {
  const [step, setStep] = useState(2);
  const [selectedId, setSelectedId] = useState('vox');
  const selectedSample = samples.find(({ id }) => id === selectedId) || samples[0];

  return (
    <div className="dc-page ws-page">
      <PreviewBar active="workflow-studio" />
      <header className="ws-header">
        <a className="ws-brand" href="/design-concepts/workflow-studio">
          <span>V</span>
          <strong>Volca Sampler</strong>
        </a>
        <nav>
          <button className="is-active" type="button">Make a sample</button>
          <button type="button">Sample library</button>
          <button type="button">Plugins</button>
        </nav>
        <div>
          <span className="ws-local-state"><i /> Saved locally</span>
          <button className="ws-icon-button" aria-label="Application settings" type="button"><Icon name="settings" /></button>
        </div>
      </header>

      <main className="ws-main">
        <section className="ws-intro">
          <div>
            <StatusPill status="info">CONCEPT B / GUIDED WORKFLOW</StatusPill>
            <h1>Prepare one sound with confidence.</h1>
            <p>Every existing tool stays available, but the path from source to Volca is explicit and reversible.</p>
          </div>
          <button className="ws-secondary-button" type="button"><Icon name="library" /> Open full library</button>
        </section>

        <ol className="ws-stepper">
          {workflowSteps.map((item) => (
            <li className={step === item.id ? 'is-active' : step > item.id ? 'is-complete' : ''} key={item.id}>
              <button onClick={() => setStep(item.id)} type="button">
                <span>{step > item.id ? 'OK' : item.id}</span>
                <strong>{item.label}</strong>
                <small>{item.detail}</small>
              </button>
            </li>
          ))}
        </ol>

        <div className="ws-workspace">
          <aside className="ws-session-panel">
            <div className="ws-panel-title">
              <span><small>Current session</small><strong>6 recent samples</strong></span>
              <button aria-label="Add sample" type="button"><Icon name="plus" /></button>
            </div>
            <label className="ws-search">
              <Icon name="search" />
              <input aria-label="Filter session samples" placeholder="Filter samples" />
            </label>
            <div className="ws-session-list">
              {samples.slice(0, 5).map((sample, index) => (
                <button
                  className={sample.id === selectedId ? 'is-selected' : ''}
                  key={sample.id}
                  onClick={() => setSelectedId(sample.id)}
                  type="button"
                >
                  <span className={`ws-sample-art tone-${sample.tone}`}><Waveform compact seed={index + 2} /></span>
                  <span><strong>{sample.name}</strong><small>{sample.duration}s / Slot {sample.slot}</small></span>
                  <Icon name="chevron" size={16} />
                </button>
              ))}
            </div>
            <button className="ws-library-link" type="button">View all samples <Icon name="chevron" size={15} /></button>
          </aside>

          <section className="ws-editor-card">
            <div className="ws-card-heading">
              <div>
                <small>STEP {step} OF 4</small>
                <h2>{step === 1 ? 'Choose a source' : step === 2 ? 'Shape the sample' : step === 3 ? 'Assign a Volca slot' : 'Review and transfer'}</h2>
              </div>
              <button type="button"><Icon name="more" /></button>
            </div>

            {step === 1 ? (
              <div className="ws-source-options">
                <button className="is-primary" type="button"><Icon name="mic" size={25} /><span><strong>Record audio</strong><small>Use a connected input</small></span></button>
                <button type="button"><Icon name="upload" size={25} /><span><strong>Import audio file</strong><small>WAV, MP3, OGG or video</small></span></button>
                <button type="button"><Icon name="folder" size={25} /><span><strong>Restore backup</strong><small>Choose a Volca Sampler ZIP</small></span></button>
              </div>
            ) : (
              <>
                <div className="ws-sample-heading">
                  <button className="ws-play" type="button"><Icon name="play" size={20} /></button>
                  <span><strong>{selectedSample.name}</strong><small>Imported audio / Updated {selectedSample.updated}</small></span>
                  <button className="ws-text-button" type="button"><Icon name="edit" size={16} /> Rename</button>
                </div>
                <div className="ws-wave-card">
                  <div className="ws-wave-time"><strong>00:00.18</strong><span>Selected: 2.30 seconds</span><strong>00:02.48</strong></div>
                  <div className="ws-wave-area">
                    <Waveform seed={4} />
                    <i className="ws-mask left" />
                    <i className="ws-mask right" />
                    <button className="ws-handle left" aria-label="Start trim point" type="button" />
                    <button className="ws-handle right" aria-label="End trim point" type="button" />
                  </div>
                  <div className="ws-wave-actions">
                    <span><Icon name="info" size={15} /> Drag the handles to keep the sound you want.</span>
                    <button type="button">Select all audio</button>
                  </div>
                </div>
                <div className="ws-process-grid">
                  <article>
                    <div><span className="ws-control-icon"><Icon name="spark" /></span><span><strong>Normalize</strong><small>Raise level without clipping</small></span><button className="ws-toggle is-on" aria-label="Normalize enabled" type="button"><i /></button></div>
                    <select aria-label="Normalize mode" defaultValue="selection"><option value="selection">Selected audio only</option><option>Full source</option></select>
                  </article>
                  <article>
                    <div><span className="ws-control-icon"><Icon name="settings" /></span><span><strong>Pitch</strong><small>Playback speed adjustment</small></span><strong>0 st</strong></div>
                    <input aria-label="Pitch adjustment" max="12" min="-12" type="range" defaultValue="0" />
                  </article>
                  <article>
                    <div><span className="ws-control-icon"><Icon name="download" /></span><span><strong>Output quality</strong><small>Balance detail and memory</small></span></div>
                    <div className="ws-chip-group"><button type="button">8-bit</button><button className="is-active" type="button">12-bit</button><button type="button">16-bit</button></div>
                  </article>
                  <article>
                    <div><span className="ws-control-icon"><Icon name="plugin" /></span><span><strong>Plugins</strong><small>1 processor active</small></span><button type="button">Manage</button></div>
                    <p><StatusPill status="on">soft-clip.js</StatusPill> Drive 18%</p>
                  </article>
                </div>
              </>
            )}
            <div className="ws-card-footer">
              <button disabled={step === 1} onClick={() => setStep(Math.max(1, step - 1))} type="button"><Icon name="back" /> Back</button>
              <span>Changes are saved automatically in this browser.</span>
              <button className="is-primary" onClick={() => setStep(Math.min(4, step + 1))} type="button">
                {step === 4 ? 'Start transfer' : 'Continue'} <Icon name="chevron" />
              </button>
            </div>
          </section>

          <aside className="ws-readiness">
            <div className="ws-ready-title">
              <span className="ws-ready-ring">3/4</span>
              <span><small>Sample readiness</small><strong>Almost ready</strong></span>
            </div>
            <div className="ws-readiness-list">
              <div className="is-done"><span>OK</span><p><strong>Source added</strong><small>{selectedSample.name}</small></p></div>
              <div className="is-done"><span>OK</span><p><strong>Audio prepared</strong><small>2.30s / 12-bit / normalized</small></p></div>
              <div className="is-current"><span>3</span><p><strong>Slot assigned</strong><small>Destination S.{String(selectedSample.slot).padStart(3, '0')}</small></p></div>
              <div><span>4</span><p><strong>Transfer</strong><small>Cable check and SYRO audio</small></p></div>
            </div>
            <div className="ws-slot-card">
              <small>DESTINATION</small>
              <div><span>S.</span><strong>{String(selectedSample.slot).padStart(3, '0')}</strong><button type="button">Change</button></div>
              <p>No slot conflict in the current transfer set.</p>
            </div>
            <div className="ws-output-summary">
              <div><span>Output</span><strong>31.25 kHz mono</strong></div>
              <div><span>Memory</span><strong>{selectedSample.size}</strong></div>
              <div><span>Transfer</span><strong>~8 seconds</strong></div>
            </div>
            <div className="ws-local-note"><Icon name="info" /><p><strong>Local-first by design.</strong><br />This preview represents browser-only processing. No files are uploaded.</p></div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function LibraryCard({ sample, selected, onSelect, index }) {
  return (
    <button
      className={`lp-sample-card ${selected ? 'is-selected' : ''}`}
      onClick={() => onSelect(sample.id)}
      type="button"
    >
      <span className={`lp-card-art tone-${sample.tone}`}>
        <Waveform seed={index + 1} />
        <span className="lp-card-play"><Icon name="play" /></span>
        <StatusPill status={sample.status === 'ready' ? 'on' : sample.status === 'review' ? 'warn' : 'info'}>
          {sample.status === 'ready' ? 'Ready' : sample.status === 'review' ? 'Review' : 'Plugin'}
        </StatusPill>
      </span>
      <span className="lp-card-body">
        <span><strong>{sample.name}</strong><small>{sample.duration}s / {sample.size}</small></span>
        <span className="lp-card-slot">S.{String(sample.slot).padStart(3, '0')}</span>
      </span>
    </button>
  );
}

export function LibraryPrep() {
  const [selectedId, setSelectedId] = useState('chord');
  const [view, setView] = useState('grid');
  const selectedSample = samples.find(({ id }) => id === selectedId) || samples[0];

  return (
    <div className="dc-page lp-page">
      <PreviewBar active="library-prep" />
      <header className="lp-header">
        <a className="lp-brand" href="/design-concepts/library-prep">
          <span className="lp-brand-disc"><i /></span>
          <span><strong>VOLCA SAMPLER</strong><small>LIBRARY + PERFORMANCE PREP</small></span>
        </a>
        <nav>
          <button className="is-active" type="button"><Icon name="library" /> Library</button>
          <button type="button"><Icon name="mic" /> Capture</button>
          <button type="button"><Icon name="plugin" /> Plugins</button>
          <button type="button"><Icon name="download" /> Backups</button>
        </nav>
        <button className="lp-new-button" type="button"><Icon name="plus" /> Add sample</button>
      </header>

      <main className="lp-main">
        <section className="lp-library-head">
          <div>
            <StatusPill status="info">CONCEPT C / LIBRARY FIRST</StatusPill>
            <h1>Your sample library</h1>
            <p>Audition, compare, prepare, and build a transfer set from the samples already stored in this browser.</p>
          </div>
          <div className="lp-summary">
            <span><strong>106</strong><small>Total sounds</small></span>
            <span><strong>6</strong><small>Your samples</small></span>
            <span><strong>3</strong><small>Transfer ready</small></span>
          </div>
        </section>

        <section className="lp-toolbar">
          <label className="lp-search"><Icon name="search" /><input aria-label="Search library" placeholder="Search samples or slot numbers" /></label>
          <div className="lp-filter-chips">
            <button className="is-active" type="button">All samples <span>106</span></button>
            <button type="button">Yours <span>6</span></button>
            <button type="button">Factory <span>100</span></button>
            <button type="button">Needs review <span>2</span></button>
          </div>
          <div className="lp-view-switch">
            <button className={view === 'grid' ? 'is-active' : ''} aria-label="Grid view" onClick={() => setView('grid')} type="button"><Icon name="grid" /></button>
            <button className={view === 'list' ? 'is-active' : ''} aria-label="List view" onClick={() => setView('list')} type="button"><Icon name="menu" /></button>
          </div>
        </section>

        <div className="lp-workspace">
          <section className="lp-browser">
            <div className="lp-browser-heading">
              <span><strong>Your samples</strong><small>Sorted by recently updated</small></span>
              <button type="button">Select multiple</button>
            </div>
            <div className={`lp-sample-${view}`}>
              {samples.map((sample, index) => (
                <LibraryCard
                  index={index}
                  key={sample.id}
                  onSelect={setSelectedId}
                  sample={sample}
                  selected={sample.id === selectedId}
                />
              ))}
            </div>
            <div className="lp-factory-banner">
              <span className="lp-factory-art"><Waveform compact seed={8} /></span>
              <span><strong>100 factory samples are also available</strong><small>Browse original Volca sounds and duplicate any sample to edit it.</small></span>
              <button type="button">Browse factory library <Icon name="chevron" /></button>
            </div>
          </section>

          <aside className="lp-inspector">
            <div className="lp-inspector-head">
              <span><small>SELECTED SAMPLE</small><strong>{selectedSample.name}</strong></span>
              <button aria-label="More sample actions" type="button"><Icon name="more" /></button>
            </div>
            <div className={`lp-inspector-wave tone-${selectedSample.tone}`}>
              <Waveform seed={5} />
              <button className="lp-inspector-play" type="button"><Icon name="play" size={22} /></button>
              <span className="lp-inspector-time">00:00 / 00:{selectedSample.duration}</span>
            </div>
            <div className="lp-inspector-meta">
              <div><span>Slot</span><strong>S.{String(selectedSample.slot).padStart(3, '0')}</strong></div>
              <div><span>Length</span><strong>{selectedSample.duration}s</strong></div>
              <div><span>Memory</span><strong>{selectedSample.size}</strong></div>
            </div>
            <button className="lp-edit-button" type="button"><Icon name="edit" /> Open sample editor</button>

            <div className="lp-quick-prep">
              <div className="lp-section-title"><span><small>QUICK PREP</small><strong>Transfer settings</strong></span><StatusPill status="warn">Review</StatusPill></div>
              <label><span>Destination slot</span><span className="lp-slot-input"><button type="button">-</button><strong>{String(selectedSample.slot).padStart(3, '0')}</strong><button type="button">+</button></span></label>
              <label><span>Normalization</span><select defaultValue="selection"><option value="selection">Selected audio</option><option>Off</option><option>Full source</option></select></label>
              <label><span>Quality</span><select defaultValue="12"><option value="12">12-bit balanced</option><option>8-bit compact</option><option>16-bit highest</option></select></label>
              <div className="lp-plugin-status"><Icon name="plugin" /><span><strong>1 plugin active</strong><small>soft-clip.js / working</small></span><button type="button">Edit</button></div>
            </div>
            <button className="lp-add-to-set" type="button"><Icon name="plus" /> Add to transfer set</button>
          </aside>
        </div>
      </main>

      <section className="lp-transfer-tray">
        <div className="lp-tray-label"><span className="lp-tray-count">3</span><span><strong>Transfer set</strong><small>3 samples / 3 unique slots</small></span></div>
        <div className="lp-tray-samples">
          {samples.slice(0, 3).map((sample, index) => (
            <span key={sample.id}>
              <span className={`lp-tray-art tone-${sample.tone}`}><Waveform compact seed={index} /></span>
              <span><strong>{sample.name}</strong><small>S.{String(sample.slot).padStart(3, '0')}</small></span>
              <button aria-label={`Remove ${sample.name}`} type="button"><Icon name="close" size={14} /></button>
            </span>
          ))}
        </div>
        <div className="lp-tray-stats">
          <span><small>Memory</small><strong>188 KB</strong></span>
          <span><small>Transfer</small><strong>~24 sec</strong></span>
        </div>
        <button className="lp-transfer-button" type="button"><Icon name="transfer" /><span><strong>Review transfer</strong><small>Check cable and start</small></span></button>
      </section>
    </div>
  );
}
