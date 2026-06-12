# Volca Sampler UI/UX Discovery

These files are static design previews. They do not import production feature
components, read or write IndexedDB, process audio, initialize plugins, or call
the SYRO transfer code.

## Current App UX Audit

### Structure

- `App.js` is the stateful application shell. There is no client router.
- Desktop uses a fixed 330px sample sidebar and a flexible detail area.
- Mobile replaces the two-column layout with three bottom-navigation pages:
  List, Sample, and About.
- The empty/focused-null state is the acquisition screen in `SampleRecord.js`.
- A selected user sample opens `SampleDetail.js`; a factory sample opens the
  read-only variant and must be duplicated before editing.
- `SampleMenu.js` combines search, user/factory collections, multi-select,
  transfer, backup, and delete.
- `SampleDetail.js` presents plugins, quality, pitch, waveform editing, slot
  assignment, and transfer as one long vertical page.
- Plugins, restore, destructive actions, erase slots, and transfer are largely
  modal workflows.

### Record or Import Flow

1. Open New sample or clear the focused sample.
2. Record from an input device, import an audio/video file, or restore a backup.
3. Recording can configure device and mono/stereo input. Imported audio is
   decoded locally and rejected if unsupported or longer than 65 seconds.
4. Silent audio is rejected. Successful audio is stored in IndexedDB, cached,
   added to the library, and focused in the editor.

### Edit and Preprocess Flow

1. Select a user sample from the library.
2. Optionally rename, duplicate, download the source, or delete.
3. Configure plugin chain, quality/bit depth, pitch, and normalization.
4. Trim the plugin-processed waveform with custom pointer, touch, or keyboard
   controls.
5. Preview or download the Volca-target WAV. Changes persist automatically and
   regenerate cached output data.

### Transfer Flow

1. Choose a destination slot from 0-199. The original Volca only accepts 0-99.
2. Wait for local SYRO generation and review sample length, memory, and transfer
   duration.
3. For bulk transfer, resolve duplicate slots, broken plugins, empty selection,
   or the 110-sample limit.
4. Confirm cable routing and output volume.
5. Play the generated SYRO stream, show total and per-item progress, and keep the
   transfer modal blocking accidental navigation.
6. Interpret Volca hardware messages after playback. Slot erase is a parallel
   SYRO flow.

### Main UX Problems

- Information architecture follows implementation ownership, not the musician's
  sequence of source, prepare, assign, and transfer.
- The most important confidence state, "ready to transfer," is assembled late
  across multiple controls and modals.
- The editor is a long vertical stack with weak hierarchy between routine and
  advanced processing.
- Bulk transfer, backup, and delete are hidden behind Select multiple.
- Mobile List/Sample/About navigation describes containers, not tasks or state.
- Recording, cache regeneration, plugin failure, SYRO generation, cable setup,
  and hardware result states do not share a consistent status language.
- The custom slot and waveform controls are expressive but need clearer
  instructions, larger touch targets, and stronger accessible names.
- Some sample-row interactions use non-semantic containers, radios, and
  non-tabbable play buttons. This makes keyboard and screen-reader behavior
  harder to understand.
- Transfer errors use red text heavily and should pair color with persistent
  icons, summaries, and recovery actions.
- The playful display typography, red Bootstrap primary color, hardware
  ornament, and generic Bootstrap controls do not form one coherent visual
  system.
- Fixed dimensions, nested scrolling, and hardcoded sidebar/header offsets make
  responsive behavior brittle.
- Long instructional and management modals carry too much content for small
  screens.

## Existing Functionality to Preserve

- Microphone/input recording and device/channel selection.
- Audio/video file import, local decode, duration validation, and silence check.
- Backup restore with sample/plugin conflict handling and progress.
- User and factory sample collections, search, audition, selection, and factory
  duplication.
- Rename, duplicate, source download, target WAV download, and delete.
- Trimming, normalization, pitch, quality/bit depth, compression, and plugins.
- Plugin install, examples, rename, replace, retry, source download, ordering,
  bypass, parameters, failure state, and removal.
- Single and bulk transfer, slot validation, estimates, progress, cancellation,
  completion guidance, and Volca Sample 2 slots.
- Slot erase, backup with optional transfer audio, and multi-tab synchronization.
- IndexedDB/local-first storage, static/offline build, and browser-only audio
  processing. No server upload path may be introduced.

## Design and Technical Constraints

- React 19, Vite 8, JavaScript plus JSDoc, and a static deployment model.
- React Bootstrap and custom Bootstrap SCSS provide current primitives.
- Styling mixes global CSS, Bootstrap variable overrides, and CSS Modules.
- Icons mix Material Design SVGs, custom SVGs, and one text/emoji status.
- Audio work depends on Web Audio, MediaRecorder/worklets, canvas waveforms,
  workers, WebAssembly SYRO bindings, and physical headphone output.
- Data uses multiple localforage/IndexedDB stores and cache regeneration can be
  asynchronous or fail at a plugin boundary.
- Plugins execute custom JavaScript in an iframe context and have deployment
  origin constraints.
- The static build uses relative paths and supports a downloadable offline ZIP.
- Production has no router, so preview routing is a small pathname gate in the
  entry point.

## Option A: Hardware Utility Console

- Thesis: minimize movement and keep technical state visible.
- Scenario: an experienced producer preparing several sounds quickly at a desk.
- IA: Samples, Record, Plugins, Transfer, About; selected sample remains the
  center of the workspace.
- Layout: narrow task rail, sample bank, waveform/modules, persistent transfer
  deck.
- Key UI: dense sample rows, waveform editor, four processing modules, hardware
  slot display, estimates, pre-flight checklist, transfer action.
- Interaction: direct manipulation with minimal page changes; immediate
  selection updates; advanced controls stay visible.
- Responsive: desktop is four columns; tablet moves the transfer deck below;
  mobile stacks bank, editor, modules, and deck under a compact task strip.
- Visual direction: near-black surfaces, amber action color, red slot display,
  condensed labels, monospaced values, low radii, controlled grid texture.
- Accessibility: persistent labels, non-color status pills, visible focus,
  reduced motion, and 44px targets in production.
- Libraries: no new component library required for the concept; Lucide is a
  reasonable future replacement for mixed icon sources.
- Pros: fastest expert workflow, strong hardware identity, excellent transfer
  visibility, efficient use of wide screens.
- Cons: highest density, steeper first-use learning curve, mobile becomes long,
  dark-only treatment needs a carefully designed light counterpart.
- Complexity: high.
- Functionality risk: high if implemented as a large shell rewrite; custom audio
  controls must not be re-created during layout work.
- Preservation: every current capability maps to a rail destination, module,
  library action, or transfer-deck state.
- Volca fit: it looks and behaves like companion software for a physical sampler.

## Option B: Sample Workflow Studio

- Thesis: make completion state and next action explicit without hiding advanced
  preprocessing.
- Scenario: a musician who transfers occasionally and wants confidence that the
  sound, slot, cable, and output are correct.
- IA: Source, Prepare, Assign, Transfer, with Library and Plugins as supporting
  destinations.
- Layout: stepper, session rail, focused task card, readiness summary.
- Key UI: source choices, large trim editor, grouped processing cards,
  destination summary, readiness checklist, forward/back actions.
- Interaction: progressive disclosure with direct access to completed steps;
  automatic saving remains visible.
- Responsive: the task card comes first, recent samples second, and readiness
  third; the four-step indicator stays compact and tappable.
- Visual direction: warm off-white surfaces, violet editor actions, teal success,
  restrained coral warnings, serif display type, generous spacing.
- Accessibility: linear reading order, explicit step names, persistent helper
  text, status text plus icons, visible focus, and predictable back behavior.
- Libraries: retain React Bootstrap initially; consider React Aria only for
  future replacement of high-risk Dialog, Tabs, Menu, and Slider behavior.
- Pros: clearest mental model, best transfer confidence, easiest onboarding,
  strongest mobile story.
- Cons: can feel slower to experts, step boundaries must not prevent cross-step
  editing, advanced plugin states need careful placement.
- Complexity: medium.
- Functionality risk: medium; the main risk is accidentally gating operations
  that are currently available in any order.
- Preservation: steps reorganize existing controls and states but do not require
  validation rules or processing changes.
- Volca fit: the physical transfer is unusual and failure-prone, so explicit
  preparation and cable stages earn their space.

## Option C: Library + Performance Prep

- Thesis: make the existing collection, audition, bulk selection, backup, and
  transfer capabilities the primary workspace.
- Scenario: a producer comparing sounds and preparing a small kit or sample pack.
- IA: Library, Capture, Plugins, Backups, with a persistent transfer set.
- Layout: filterable sample grid/list, selected-sample inspector, bottom transfer
  tray.
- Key UI: waveform cards, status filters, factory-library entry, quick prep,
  inspector preview, transfer-set tray.
- Interaction: browse and audition first, inspect one sample, add existing
  selections to the transfer set, then review.
- Responsive: grid becomes single-row cards, inspector follows the library, and
  the transfer tray collapses to count plus primary action.
- Visual direction: charcoal studio surfaces, mint action/state color, colorful
  waveform tiles, medium density, larger artwork than Option A.
- Accessibility: list-view alternative, labeled filters, persistent selected
  state, keyboard-operable tray, text labels for readiness, and no color-only
  meaning.
- Libraries: the local design-system layer is sufficient; a virtualized list
  should be considered only if real collections prove slow.
- Pros: best sample discovery, strongest bulk workflow, backup/restore has a
  natural home, visually engaging without looking like SaaS.
- Cons: single-sample editing is secondary, the persistent tray consumes mobile
  space, "kit" language must not imply new saved-kit functionality.
- Complexity: medium-high.
- Functionality risk: medium; transfer-set UI must remain a view over current
  selection rather than a new data model.
- Preservation: the tray represents existing multi-select transfer and the
  inspector exposes existing sample settings.
- Volca fit: limited hardware slots make auditioning and deliberate slot
  preparation central to real use.

## Recommendation

Use Option B as the version-one structure. The current app's largest risk is not
missing capability; it is uncertainty around what is ready, what will be sent,
and what the hardware will do next. Borrow Option A's persistent transfer
summary, compact numeric presentation, and processing-module density. Borrow
Option C's stronger library browsing, factory separation, and explicit bulk
transfer tray when multi-select is active.

Do not adopt a full component library during the first redesign pass. Keep React
Bootstrap for behavioral stability, add semantic CSS tokens, and create a small
local primitive layer for Button, IconButton, Panel, Status, Field, Dialog
layout, Progress, and EmptyState. Introduce `lucide-react` only if the team wants
to replace the current mixed icon language; it is tree-shakeable and does not
affect local-first behavior. Evaluate React Aria Components later for complex
accessible controls, not as a wholesale rewrite.

## Proposed Implementation Phases

1. Freeze behavior with flow checklists and focused UI regression tests.
2. Add color, type, spacing, focus, motion, elevation, and status tokens.
3. Build local primitives over existing React Bootstrap behavior.
4. Replace the app shell and responsive navigation without moving feature logic.
5. Redesign record/import/restore state communication.
6. Group the sample editor into source, processing, waveform, and output sections.
7. Redesign transfer review, cable setup, progress, completion, and erase flows.
8. Improve library, multi-select, backup, restore, factory, and plugin surfaces.
9. Complete keyboard, screen-reader, contrast, reduced-motion, and touch QA.
10. Validate offline build, IndexedDB migration behavior, plugins, and SYRO audio
    against the untouched production implementation.

## Questions Before Implementation

1. Is the primary target desktop/laptop, tablet, or phone?
2. Should the first production theme be light, dark, or system-aware?
3. Are most users expected to have the original Volca Sample, Sample 2, or both?
4. Is the preferred baseline Option B, or should expert density outweigh guided
   transfer confidence?
