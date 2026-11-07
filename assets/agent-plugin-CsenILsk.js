import{t as bo,e as Ve,d as xo,a as Wr,b as yo,s as wo,w as Io,m as Ao}from"./index-CfEyt8VD.js";const Co=700,kn=150,ko=4,Sn="ieum-sb-char-count",So="ieum-sb-char-count-divider";function _o(){let e=0,n=0,t=0;return{add(r,o,l,c){const i=r.length(o),h=Math.min(Math.max(l,0),i),C=Math.min(c,i);if(C<=h)return;const w=bo(Ve(r.text(o,i),h,C));e+=w.chars,n+=w.charsNoSpace,t+=1},tooLong:()=>!1,counts:()=>({chars:e,charsNoSpace:n,runs:t})}}function No(e){const n=t=>typeof t=="string"&&t.trim().length>0;return!e||!["total","selected","hint","hintSelected"].every(t=>n(e[t]))?null:{total:e.total,selected:e.selected,hint:e.hint,hintSelected:e.hintSelected,locale:typeof e.locale=="string"&&e.locale?e.locale:void 0}}const _n=(e,n)=>e.replace(/\{(\w+)\}/g,(t,r)=>r in n?n[r]:t);function Eo(e,n,t){let r;try{r=new Intl.NumberFormat(e.locale).format}catch{r=c=>String(c)}const o=c=>r(Math.max(0,Math.round(Number(c)||0))),l={total:o(n.chars),totalNoSpace:o(n.charsNoSpace),selected:t?o(t.chars):"",selectedNoSpace:t?o(t.charsNoSpace):""};return{text:_n(t?e.selected:e.total,l),title:_n(t?e.hintSelected:e.hint,l)}}function Nn(e){const n=e?.getElementById?.(Sn);if(n)return n;const t=e?.getElementById?.("status-bar");if(!t)return null;const r=e.createElement("span");r.id=So,r.className="stb-divider";const o=e.createElement("span");o.id=Sn,o.className="stb-item",o.setAttribute("role","status");const l=e.getElementById("sb-mode");return l&&l.parentNode===t?l.after(r,o):t.append(r,o),o}const To=2e3,Mo=()=>{const e=globalThis.requestIdleCallback,n=globalThis.cancelIdleCallback;return typeof e!="function"||typeof n!="function"?null:{request:t=>e.call(globalThis,t,{timeout:To}),cancel:t=>n.call(globalThis,t)}};function Po({readTotal:e,readSelection:n,render:t,now:r=()=>globalThis.performance?.now?.()??Date.now(),setTimer:o=(i,h)=>setTimeout(i,h),clearTimer:l=i=>clearTimeout(i),idle:c=Mo()}){let i=null,h=null,C=!1,w=!1;const v=()=>{!C&&i&&t(i,h)},B=(E,R)=>{const $={timer:null,idle:null,cost:0},j=()=>{if($.idle=null,C)return;const de=r();let se;w=!0;try{se=E()}catch{se=void 0}finally{w=!1}$.cost=Math.max(0,r()-de),R(se),v()},Y=()=>{$.timer!==null&&l($.timer),$.idle!==null&&c?.cancel($.idle),$.timer=null,$.idle=null};return{schedule:de=>{Y(),$.timer=o(()=>{$.timer=null,c?$.idle=c.request(j):j()},Math.max(de,$.cost*ko))},cancel:Y}},H=B(e,E=>{E&&(i=E)}),F=B(n,E=>{h=E??null});return{start(){C=!1,H.schedule(0),F.schedule(0)},documentChanged(){C||w||(H.schedule(Co),F.schedule(kn))},selectionChanged(){C||w||F.schedule(kn)},documentSwapped(){C||(H.schedule(0),F.schedule(0))},refresh:v,stop(){C=!0,H.cancel(),F.cancel()}}}const Oo=1,En="ieum-dialog-theme",N="data-ieum-dialog-theme",$t=`
/* ─────────────────────────────────────────────────────────────
   1. Tokens — light
   ───────────────────────────────────────────────────────────── */
:root[${N}] {
  --ieum-dialog-font: 'Malgun Gothic', '맑은 고딕', 'Apple SD Gothic Neo',
    'Noto Sans KR', 'Segoe UI', sans-serif;

  /* surfaces: warm paper in light mode, slate in dark mode */
  --ieum-dialog-surface: #fdfdfb;
  --ieum-dialog-surface-sunken: #f5f6f8;
  --ieum-dialog-title-surface: #f1f4f8;
  --ieum-dialog-field-surface: #ffffff;

  /* ink */
  --ieum-dialog-ink: #24292f;
  --ieum-dialog-ink-muted: #667085;
  --ieum-dialog-ink-hint: #6f7889;
  --ieum-dialog-ink-disabled: #98a1af;
  --ieum-dialog-title-ink: #1f2937;

  /* lines */
  --ieum-dialog-line: #d8dee7;
  --ieum-dialog-line-soft: #e7ebf0;
  --ieum-dialog-field-line: #c7cfda;

  /* one accent: Hancom-blue, softened */
  --ieum-dialog-accent: #2f6fd0;
  --ieum-dialog-accent-strong: #245bb0;
  --ieum-dialog-accent-soft: #eaf1fc;
  --ieum-dialog-accent-line: #b9cdf0;
  --ieum-dialog-accent-ink: #ffffff;
  --ieum-dialog-focus: #2f6fd0;
  --ieum-dialog-danger: #b42318;

  /* shape and depth */
  --ieum-dialog-radius: 8px;
  --ieum-dialog-radius-control: 4px;
  --ieum-dialog-shadow-color: rgba(20, 30, 48, 0.24);
  --ieum-dialog-shadow-soft: rgba(20, 30, 48, 0.12);
  --ieum-dialog-shadow: 0 24px 64px var(--ieum-dialog-shadow-color),
    0 3px 10px var(--ieum-dialog-shadow-soft);
  --ieum-dialog-overlay: rgba(16, 24, 40, 0.34);
  --ieum-dialog-control-shadow: 0 1px 1px rgba(20, 30, 48, 0.04);
  --ieum-dialog-primary-shadow-color: rgba(20, 30, 48, 0.18);
  --ieum-dialog-primary-highlight: rgba(255, 255, 255, 0.18);
  --ieum-dialog-primary-shadow: 0 1px 2px var(--ieum-dialog-primary-shadow-color),
    inset 0 1px 0 var(--ieum-dialog-primary-highlight);
  --ieum-dialog-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
  --ieum-dialog-field-shadow: inset 0 1px 2px rgba(20, 30, 48, 0.06);
}

/* ─────────────────────────────────────────────────────────────
   2. Tokens — dark (the host sets data-theme-effective)
   ───────────────────────────────────────────────────────────── */
:root[${N}][data-theme-effective='dark'] {
  --ieum-dialog-surface: #2a2f36;
  --ieum-dialog-surface-sunken: #242930;
  --ieum-dialog-title-surface: #323841;
  --ieum-dialog-field-surface: #22272e;

  --ieum-dialog-ink: #e7ebf1;
  --ieum-dialog-ink-muted: #aeb8c6;
  --ieum-dialog-ink-hint: #a6b0be;
  --ieum-dialog-ink-disabled: #7f8997;
  --ieum-dialog-title-ink: #eef2f7;

  --ieum-dialog-line: #454d58;
  --ieum-dialog-line-soft: #39414b;
  --ieum-dialog-field-line: #525c6a;

  --ieum-dialog-accent: #7aa7f0;
  --ieum-dialog-accent-strong: #b7d0ff;
  --ieum-dialog-accent-soft: #2a3b55;
  --ieum-dialog-accent-line: #3f5a80;
  --ieum-dialog-accent-ink: #111a2b;
  --ieum-dialog-focus: #8bb8ff;
  --ieum-dialog-danger: #ff9a8f;

  --ieum-dialog-shadow-color: rgba(0, 0, 0, 0.55);
  --ieum-dialog-shadow-soft: rgba(0, 0, 0, 0.4);
  --ieum-dialog-shadow: 0 28px 80px var(--ieum-dialog-shadow-color),
    0 2px 8px var(--ieum-dialog-shadow-soft);
  --ieum-dialog-overlay: rgba(0, 0, 0, 0.52);
  --ieum-dialog-control-shadow: 0 1px 1px rgba(0, 0, 0, 0.22);
  --ieum-dialog-primary-shadow-color: rgba(0, 0, 0, 0.35);
  --ieum-dialog-primary-highlight: rgba(255, 255, 255, 0.3);
  --ieum-dialog-primary-shadow: 0 1px 3px var(--ieum-dialog-primary-shadow-color),
    inset 0 1px 0 var(--ieum-dialog-primary-highlight);
  --ieum-dialog-field-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.28);
}

/* ─────────────────────────────────────────────────────────────
   3. Motion
   ───────────────────────────────────────────────────────────── */
@keyframes ieum-dialog-veil-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes ieum-dialog-in {
  from { opacity: 0; transform: translateY(8px) scale(0.985); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ─────────────────────────────────────────────────────────────
   4. The modal shell
   ───────────────────────────────────────────────────────────── */
:root[${N}] .modal-overlay {
  background: var(--ieum-dialog-overlay);
  padding: 20px;
  animation: ieum-dialog-veil-in 140ms ease-out both;
}

:root[${N}] .dialog-wrap {
  display: flex;
  flex-direction: column;
  max-height: calc(100dvh - 40px);
  overflow: hidden;
  background: var(--ieum-dialog-surface);
  border: 1px solid var(--ieum-dialog-line);
  border-radius: var(--ieum-dialog-radius);
  box-shadow: var(--ieum-dialog-shadow);
  color: var(--ieum-dialog-ink);
  font-family: var(--ieum-dialog-font);
  font-size: 12px;
  line-height: 1.45;
  color-scheme: inherit;
  animation: ieum-dialog-in 180ms var(--ieum-dialog-ease) both;
}

/* ─────────────────────────────────────────────────────────────
   5. Title bar and close button
   ───────────────────────────────────────────────────────────── */
:root[${N}] .dialog-title {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 46px;
  padding: 0 10px 0 20px;
  background: var(--ieum-dialog-title-surface);
  border-bottom: 1px solid var(--ieum-dialog-line);
  color: var(--ieum-dialog-title-ink);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: move;
  user-select: none;
}

:root[${N}] .dialog-close {
  flex: 0 0 auto;
  margin-left: auto;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 0;
  border-radius: var(--ieum-dialog-radius-control);
  background: transparent;
  color: var(--ieum-dialog-ink-muted);
  font-family: var(--ieum-dialog-font);
  font-size: 17px;
  line-height: 1;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease;
}

:root[${N}] .dialog-close:hover {
  background: color-mix(in srgb, var(--ieum-dialog-ink) 8%, transparent);
  color: var(--ieum-dialog-ink);
}

/* ─────────────────────────────────────────────────────────────
   6. Body and footer
   ───────────────────────────────────────────────────────────── */
:root[${N}] .dialog-wrap .dialog-body {
  flex: 1 1 auto;
  padding: 18px 20px 16px;
  overscroll-behavior: contain;
}

/* The body scrolls inside the capped shell. Some dialogs keep a fixed body
   height (character shape) or scroll their own panels (object properties). */
:where(:root[${N}]) .dialog-body {
  min-height: 0;
  overflow: auto;
}

/* rhwp lays the footer out as a flex row and hides it while a PDF is being
   prepared, so this rule leaves display alone. */
:root[${N}] .dialog-wrap .dialog-footer {
  flex: 0 0 auto;
  padding: 13px 20px 15px;
  background: var(--ieum-dialog-surface-sunken);
  border-top: 1px solid var(--ieum-dialog-line-soft);
}

/* Dialogs that open with tabs put them on the top edge of the body. */
:root[${N}] .dialog-body > .dialog-tabs:first-child {
  margin: -18px -20px 14px;
}

/* The click-here (누름틀) dialog wraps its tab and form in .field-edit-body;
   let the form own the padding so the tab strip and fields line up with the
   title instead of being inset twice. */
:root[${N}] .dialog-body.field-edit-body,
:root[${N}] .dialog-body:has(> .field-edit-body) {
  padding: 0;
}

:root[${N}] .field-edit-body > .dialog-tabs:first-child {
  margin: 0;
}

/* ─────────────────────────────────────────────────────────────
   7. Buttons
   ───────────────────────────────────────────────────────────── */
:where(:root[${N}]) .dialog-btn {
  min-width: 74px;
  cursor: pointer;
}

:root[${N}] .dialog-btn {
  height: 30px;
  padding: 0 16px;
  border: 1px solid var(--ieum-dialog-field-line);
  border-radius: var(--ieum-dialog-radius-control);
  background: var(--ieum-dialog-field-surface);
  color: var(--ieum-dialog-ink);
  font-family: var(--ieum-dialog-font);
  font-size: 12px;
  font-weight: 500;
  line-height: 1;
  box-shadow: var(--ieum-dialog-control-shadow);
  transition:
    background-color 120ms ease,
    border-color 120ms ease,
    box-shadow 120ms ease,
    transform 80ms ease;
}

:root[${N}] .dialog-btn:hover {
  background: color-mix(in srgb, var(--ieum-dialog-ink) 5%, var(--ieum-dialog-field-surface));
  border-color: var(--ieum-dialog-field-line);
}

:root[${N}] .dialog-btn:active {
  transform: translateY(1px);
}

:root[${N}] .dialog-btn-primary {
  background: var(--ieum-dialog-accent);
  border-color: var(--ieum-dialog-accent);
  color: var(--ieum-dialog-accent-ink);
  box-shadow: var(--ieum-dialog-primary-shadow);
}

:root[${N}] .dialog-btn-primary:hover {
  background: var(--ieum-dialog-accent-strong);
  border-color: var(--ieum-dialog-accent-strong);
}

:root[${N}] .dialog-btn:focus-visible,
:root[${N}] .dialog-close:focus-visible,
:root[${N}] .dialog-tab:focus-visible {
  outline: 2px solid var(--ieum-dialog-focus);
  outline-offset: 2px;
}

/* A filled button already has the accent; a second hard blue keyline reads as
   a rendering fault. Use the same soft halo language as the fields instead. */
:root[${N}] .dialog-btn-primary:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--ieum-dialog-focus) 40%, transparent);
  outline-offset: 1px;
}

:root[${N}] .dialog-btn:disabled,
:root[${N}] .dialog-btn:disabled:hover {
  background: var(--ieum-dialog-surface-sunken);
  border-color: var(--ieum-dialog-line-soft);
  color: var(--ieum-dialog-ink-disabled);
  box-shadow: none;
  transform: none;
}

/* With the pointer cursor above, this stays below the compare dialog's own
   wait cursor on its busy buttons. */
:where(:root[${N}]) .dialog-btn:disabled {
  cursor: not-allowed;
}

/* The small segmented controls some dialogs use for alignment/direction. */
:root[${N}] .dialog-btn-group button {
  min-width: 38px;
  height: 28px;
  border-color: var(--ieum-dialog-field-line);
  background: var(--ieum-dialog-field-surface);
  color: var(--ieum-dialog-ink);
  font-family: var(--ieum-dialog-font);
  font-size: 11px;
  cursor: pointer;
}

:root[${N}] .dialog-btn-group button:hover {
  background: var(--ieum-dialog-accent-soft);
}

/* A tonal selected state keeps the solid accent for the one committing
   action (the footer's primary button) and the dialog's blue edge. */
:root[${N}] .dialog-btn-group button.active {
  background: var(--ieum-dialog-accent-soft);
  border-color: var(--ieum-dialog-accent-line);
  color: var(--ieum-dialog-accent-strong);
  box-shadow: inset 0 0 0 1px var(--ieum-dialog-accent-line);
}

:root[${N}] .dialog-btn-group button:disabled,
:root[${N}] .dialog-btn-group button:disabled:hover,
:root[${N}] .dialog-btn-group button.active:disabled {
  background: var(--ieum-dialog-surface-sunken);
  border-color: var(--ieum-dialog-line-soft);
  color: var(--ieum-dialog-ink-disabled);
  box-shadow: none;
  cursor: not-allowed;
}

/* The tiny "apply to all" spinners inside the cell-properties dialog. */
:root[${N}] .tcp-all-spinner-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--ieum-dialog-field-line);
  border-radius: var(--ieum-dialog-radius-control);
  background: var(--ieum-dialog-field-surface);
  color: var(--ieum-dialog-ink-muted);
  font-size: 9px;
  line-height: 22px;
}

:root[${N}] .tcp-all-spinner-btn:hover {
  background: var(--ieum-dialog-accent-soft);
  border-color: var(--ieum-dialog-accent-line);
  color: var(--ieum-dialog-ink);
}

/* Border/shading pickers in the same dialog: same hairline and accent as the
   rest of the system, so the tabs do not fall back to the old beveled look. */
:root[${N}] .tcp-line-type-grid {
  border-color: var(--ieum-dialog-line);
  border-radius: 5px;
  background: var(--ieum-dialog-field-surface);
}

:root[${N}] .tcp-line-type-item {
  border-radius: 3px;
}

:root[${N}] .tcp-line-type-item:hover {
  border-color: var(--ieum-dialog-accent-line);
  background: var(--ieum-dialog-accent-soft);
}

:root[${N}] .tcp-line-type-item.active {
  border-color: var(--ieum-dialog-accent);
  background: var(--ieum-dialog-accent-soft);
}

:root[${N}] .tcp-dir-btn,
:root[${N}] .tcp-diag-btn {
  border-color: var(--ieum-dialog-field-line);
  border-radius: var(--ieum-dialog-radius-control);
  background: var(--ieum-dialog-field-surface);
  color: var(--ieum-dialog-ink-muted);
}

:root[${N}] .tcp-dir-btn:hover,
:root[${N}] .tcp-diag-btn:hover {
  border-color: var(--ieum-dialog-accent-line);
  background: var(--ieum-dialog-accent-soft);
  color: var(--ieum-dialog-ink);
}

/* The chosen diagonal line. Restyling the button above would otherwise hide
   rhwp's own selected state. */
:root[${N}] .tcp-diag-btn.active {
  border-color: var(--ieum-dialog-accent);
  background: var(--ieum-dialog-accent-soft);
  color: var(--ieum-dialog-accent-strong);
}

:root[${N}] .tcp-diag-btn:disabled,
:root[${N}] .tcp-diag-btn:disabled:hover {
  border-color: var(--ieum-dialog-line-soft);
  background: var(--ieum-dialog-surface-sunken);
  color: var(--ieum-dialog-ink-disabled);
  cursor: not-allowed;
}

:root[${N}] .tcp-border-preview-svg,
:root[${N}] .tcp-bg-preview {
  border-color: var(--ieum-dialog-line);
  border-radius: 4px;
}

:root[${N}] .tcp-page-border-group {
  border-color: var(--ieum-dialog-line-soft);
  border-radius: 5px;
  background: var(--ieum-dialog-surface-sunken);
}

/* The cell dialog disables a whole row with .tcp-disabled (not the disabled
   attribute). Recolor its parts explicitly instead of fading the row: a
   half-transparent active chip still reads as "selected". */
:root[${N}] .tcp-disabled {
  opacity: 1;
}

:root[${N}] .tcp-disabled .dialog-label,
:root[${N}] .tcp-disabled .dialog-unit {
  color: var(--ieum-dialog-ink-disabled);
}

:root[${N}] .tcp-disabled .dialog-input,
:root[${N}] .tcp-disabled .dialog-select,
:root[${N}] .tcp-disabled .tcp-all-spinner-btn {
  background: var(--ieum-dialog-surface-sunken);
  border-color: var(--ieum-dialog-line-soft);
  color: var(--ieum-dialog-ink-disabled);
  box-shadow: none;
}

:root[${N}] .tcp-disabled .dialog-btn-group button,
:root[${N}] .tcp-disabled .dialog-btn-group button.active {
  background: var(--ieum-dialog-surface-sunken);
  border-color: var(--ieum-dialog-line-soft);
  color: var(--ieum-dialog-ink-disabled);
  box-shadow: none;
}

/* ─────────────────────────────────────────────────────────────
   8. Tabs — paper folder tabs with one blue rule
   ───────────────────────────────────────────────────────────── */
:root[${N}] .dialog-tabs {
  flex: 0 0 auto;
  display: flex;
  gap: 2px;
  padding: 6px 12px 0;
  background: var(--ieum-dialog-surface-sunken);
  border-bottom: 1px solid var(--ieum-dialog-line);
}

:root[${N}] .dialog-tab {
  position: relative;
  margin-bottom: -1px;
  padding: 7px 15px 8px;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 5px 5px 0 0;
  background: transparent;
  color: var(--ieum-dialog-ink-muted);
  font-family: var(--ieum-dialog-font);
  font-size: 12px;
  font-weight: 500;
  line-height: 1.3;
  cursor: pointer;
  transition:
    background-color 120ms ease,
    color 120ms ease,
    border-color 120ms ease;
}

:root[${N}] .dialog-tab:hover {
  background: color-mix(in srgb, var(--ieum-dialog-accent) 8%, transparent);
  color: var(--ieum-dialog-ink);
}

:root[${N}] .dialog-tab.active {
  background: var(--ieum-dialog-surface);
  border-color: var(--ieum-dialog-line);
  border-bottom-color: var(--ieum-dialog-surface);
  color: var(--ieum-dialog-ink);
  font-weight: 600;
  box-shadow: inset 0 2px 0 var(--ieum-dialog-accent);
}

/* A one-tab strip is a label with no choice to make: the dialog title already
   says what it is. (The click-here dialog is the one that ships this way.) */
:root[${N}] .dialog-tabs:has(> .dialog-tab:only-child) {
  display: none;
}

/* The editor's older goto dialog uses a private copy of the same tab shape. */
:root[${N}] .goto-tab-bar {
  display: flex;
  gap: 2px;
  padding: 0 0 0 2px;
  border-bottom: 1px solid var(--ieum-dialog-line);
}

:root[${N}] .goto-tab-btn {
  margin-bottom: -1px;
  padding: 7px 15px 8px;
  border: 1px solid transparent;
  border-bottom: none;
  border-radius: 5px 5px 0 0;
  background: transparent;
  color: var(--ieum-dialog-ink-muted);
  font-family: var(--ieum-dialog-font);
  font-size: 12px;
  cursor: pointer;
}

:root[${N}] .goto-tab-btn:hover {
  background: color-mix(in srgb, var(--ieum-dialog-accent) 8%, transparent);
  color: var(--ieum-dialog-ink);
}

:root[${N}] .goto-tab-btn.active {
  background: var(--ieum-dialog-surface);
  border-color: var(--ieum-dialog-line);
  border-bottom-color: var(--ieum-dialog-surface);
  color: var(--ieum-dialog-ink);
  font-weight: 600;
  box-shadow: inset 0 2px 0 var(--ieum-dialog-accent);
}

/* ─────────────────────────────────────────────────────────────
   9. Sections, rows and labels
   ───────────────────────────────────────────────────────────── */
:root[${N}] .dialog-section {
  padding: 12px 14px;
  border: 1px solid var(--ieum-dialog-line-soft);
  border-radius: 5px;
  background: var(--ieum-dialog-surface-sunken);
}

/* Page setup puts sections side by side with no bottom margin. */
:where(:root[${N}]) .dialog-section {
  margin-bottom: 12px;
}

:where(:root[${N}]) .dialog-section:last-child {
  margin-bottom: 0;
}

:root[${N}] .dialog-section-title {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 10px;
  color: var(--ieum-dialog-ink-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

/* Spacing and label widths are layout: several dialogs line their labels up
   with a wider min-width of their own (object, equation, paragraph spacing). */
:where(:root[${N}]) .dialog-row {
  gap: 10px;
  margin-bottom: 8px;
}

:where(:root[${N}]) .dialog-row:last-child {
  margin-bottom: 0;
}

:where(:root[${N}]) .dialog-label {
  min-width: 44px;
}

:root[${N}] .dialog-label {
  color: var(--ieum-dialog-ink-muted);
  font-size: 11px;
  font-weight: 500;
}

:root[${N}] .dialog-unit {
  color: var(--ieum-dialog-ink-hint);
  font-size: 11px;
}

/* ─────────────────────────────────────────────────────────────
   10. Fields
   ───────────────────────────────────────────────────────────── */
:root[${N}] :where(
    .dialog-input,
    .dialog-select,
    .dialog-text-input,
    .field-edit-input,
    .field-edit-textarea,
    .formula-input,
    .formula-select
  ) {
  border: 1px solid var(--ieum-dialog-field-line);
  border-radius: var(--ieum-dialog-radius-control);
  background: var(--ieum-dialog-field-surface);
  color: var(--ieum-dialog-ink);
  font-family: var(--ieum-dialog-font);
  font-size: 12px;
  box-shadow: var(--ieum-dialog-field-shadow);
}

:root[${N}] .dialog-input,
:root[${N}] .dialog-select,
:root[${N}] .dialog-text-input,
:root[${N}] .field-edit-input {
  height: 26px;
  padding: 0 8px;
}

:where(:root[${N}]) .dialog-input {
  width: 76px;
}

:root[${N}] .dialog-select {
  padding: 0 6px;
}

/* Number fields: rhwp sizes many of them inline to 40-60px, and a wider inset
   pushes "100" under the spinner. */
:root[${N}] .dialog-input {
  padding: 0 4px;
}

:where(:root[${N}]) .dialog-text-input {
  width: 140px;
}

:root[${N}] .field-edit-input {
  width: 100%;
}

:root[${N}] .field-edit-textarea {
  width: 100%;
  min-height: 92px;
  padding: 8px 10px;
  line-height: 1.55;
  resize: vertical;
}

:root[${N}] :where(
    .dialog-input,
    .dialog-select,
    .dialog-text-input,
    .field-edit-input,
    .field-edit-textarea,
    .formula-input,
    .formula-select
  ):focus {
  border-color: var(--ieum-dialog-focus);
  outline: none;
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--ieum-dialog-focus) 18%, transparent),
    var(--ieum-dialog-field-shadow);
}

/* Not .dialog-select: a <select> always matches :read-only, which would grey
   out every drop-down. */
:root[${N}] :where(
    .dialog-input,
    .dialog-text-input,
    .field-edit-input,
    .field-edit-textarea,
    .formula-input
  ):read-only {
  background: var(--ieum-dialog-surface-sunken);
  color: var(--ieum-dialog-ink-muted);
}

:root[${N}] :where(
    .dialog-input,
    .dialog-select,
    .dialog-text-input,
    .field-edit-input,
    .field-edit-textarea,
    .formula-input,
    .formula-select
  ):disabled {
  background: var(--ieum-dialog-surface-sunken);
  border-color: var(--ieum-dialog-line-soft);
  color: var(--ieum-dialog-ink-disabled);
  cursor: not-allowed;
}

/* ─────────────────────────────────────────────────────────────
   11. Choice controls
   ───────────────────────────────────────────────────────────── */
:root[${N}] .dialog-radio-group {
  gap: 6px 14px;
}

:root[${N}] .dialog-radio-group label,
:root[${N}] .dialog-checkbox,
:root[${N}] .field-edit-checkbox-row {
  gap: 6px;
  color: var(--ieum-dialog-ink);
  font-size: 12px;
  cursor: pointer;
}

:root[${N}] .dialog-radio-group input[type='radio'],
:root[${N}] .dialog-checkbox input[type='checkbox'],
:root[${N}] .field-edit-checkbox-row input[type='checkbox'] {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: var(--ieum-dialog-accent);
}

/* Some in-house dialogs (for example the format-copy dialog) build their
   choice rows from bare labels; keep every box on the same accent. */
:root[${N}] .dialog-body input[type='radio'],
:root[${N}] .dialog-body input[type='checkbox'] {
  accent-color: var(--ieum-dialog-accent);
}

/* ─────────────────────────────────────────────────────────────
   12. Field (누름틀) and memo form
   ───────────────────────────────────────────────────────────── */
:root[${N}] .field-edit-body {
  display: flex;
  flex-direction: column;
}

:root[${N}] .field-edit-panel {
  gap: 8px;
  padding: 18px 20px 16px;
}

:root[${N}] .field-edit-label {
  margin-top: 2px;
  color: var(--ieum-dialog-ink-muted);
  font-size: 11px;
  font-weight: 500;
}

:root[${N}] .field-edit-checkbox-row {
  margin-top: 6px;
}

:root[${N}] .field-edit-error {
  color: var(--ieum-dialog-danger) !important;
  font-size: 11px !important;
}

/* ─────────────────────────────────────────────────────────────
   13. Scrollbars
   ───────────────────────────────────────────────────────────── */
:root[${N}] .dialog-body::-webkit-scrollbar,
:root[${N}] .dialog-tab-panel::-webkit-scrollbar,
:root[${N}] .tcp-panel-container::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

:root[${N}] .dialog-body::-webkit-scrollbar-thumb,
:root[${N}] .dialog-tab-panel::-webkit-scrollbar-thumb,
:root[${N}] .tcp-panel-container::-webkit-scrollbar-thumb {
  border: 3px solid transparent;
  border-radius: 999px;
  background-clip: padding-box;
  background-color: color-mix(in srgb, var(--ieum-dialog-ink) 24%, transparent);
}

:root[${N}] .dialog-body::-webkit-scrollbar-track,
:root[${N}] .dialog-tab-panel::-webkit-scrollbar-track,
:root[${N}] .tcp-panel-container::-webkit-scrollbar-track {
  background: transparent;
}

/* ─────────────────────────────────────────────────────────────
   14. Modeless find panel (the dialog's smaller sibling)
   ───────────────────────────────────────────────────────────── */
:root[${N}] .find-dialog {
  position: fixed;
  overflow: hidden;
  background: var(--ieum-dialog-surface);
  border: 1px solid var(--ieum-dialog-line);
  border-radius: var(--ieum-dialog-radius);
  box-shadow: var(--ieum-dialog-shadow);
  color: var(--ieum-dialog-ink);
  font-family: var(--ieum-dialog-font);
  font-size: 12px;
}

:root[${N}] .find-dialog-title {
  display: flex;
  align-items: center;
  gap: 9px;
  min-height: 42px;
  padding: 0 10px 0 16px;
  background: var(--ieum-dialog-title-surface);
  border-bottom: 1px solid var(--ieum-dialog-line);
  color: var(--ieum-dialog-title-ink);
  font-size: 13px;
  font-weight: 600;
  cursor: move;
  user-select: none;
}

:root[${N}] .find-dialog-body {
  padding: 14px 16px 4px;
}

:root[${N}] .find-dialog-row {
  gap: 8px;
  margin-bottom: 9px;
}

:root[${N}] .find-dialog-label {
  width: 70px;
  color: var(--ieum-dialog-ink-muted);
  font-size: 11px;
}

:root[${N}] .find-dialog-input {
  height: 26px;
  padding: 0 8px;
  border: 1px solid var(--ieum-dialog-field-line);
  border-radius: var(--ieum-dialog-radius-control);
  background: var(--ieum-dialog-field-surface);
  color: var(--ieum-dialog-ink);
  font-family: var(--ieum-dialog-font);
  font-size: 12px;
  box-shadow: var(--ieum-dialog-field-shadow);
}

:root[${N}] .find-dialog-input:focus {
  border-color: var(--ieum-dialog-focus);
  outline: none;
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--ieum-dialog-focus) 18%, transparent),
    var(--ieum-dialog-field-shadow);
}

:root[${N}] .find-dialog-body input[type='checkbox'] {
  margin: 0;
  accent-color: var(--ieum-dialog-accent);
}

:root[${N}] .find-dialog-status {
  color: var(--ieum-dialog-ink-muted);
  font-size: 11px;
}

:root[${N}] .find-dialog-match-count {
  color: var(--ieum-dialog-ink-hint);
  font-size: 11px;
}

:root[${N}] .find-dialog-buttons {
  justify-content: flex-end;
  gap: 6px;
  padding: 4px 16px 12px;
}

:root[${N}] .find-dialog-buttons .dialog-btn {
  min-width: 64px;
}

/* ─────────────────────────────────────────────────────────────
   15. Narrow windows and reduced motion
   ───────────────────────────────────────────────────────────── */
/* rhwp turns dialogs into a bottom sheet below 768px (responsive.css). Follow
   the same breakpoint, or the sheet keeps the card's padding and corners. */
@media (max-width: 767px) {
  :root[${N}] .modal-overlay {
    padding: 0;
  }

  :root[${N}] .dialog-wrap {
    max-height: 90dvh;
    border-radius: 12px 12px 0 0;
  }

  :root[${N}] .dialog-title {
    min-height: 52px;
    padding-left: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root[${N}] .modal-overlay,
  :root[${N}] .dialog-wrap {
    animation: none;
  }

  :root[${N}] .dialog-btn {
    transition: none;
  }
}
`;function vo(e=globalThis.document){const n=e?.documentElement;if(!e||!n)return!1;const t=e.getElementById(En);if(t)t.textContent!==$t&&(t.textContent=$t);else{const c=e.createElement("style");c.id=En,c.textContent=$t,(e.head??n).appendChild(c)}const r=()=>{const c=n.getAttribute("data-theme-skin")==="oldschool";return c?n.removeAttribute(N):n.setAttribute(N,String(Oo)),!c},o=r(),l=e.defaultView?.MutationObserver??globalThis.MutationObserver;if(!e.__ieumDialogThemeObserver&&typeof l=="function"){const c=new l(r);c.observe(n,{attributes:!0,attributeFilter:["data-theme-skin"]}),e.__ieumDialogThemeObserver=c}return o}const Ro="ieum-agent",Lo=20,$o=5e3,Tn=2e4,Mn=500,Bo=2e3,Bt=6e4,Pn=4e3,Dt=100,Gt=30,Do=24,Go=20,Uo=200,On=100,vn=400,Se=200,Fo=200,Rn=600,Ho=300,Ln=400,$n=50,Bn=10,Dn=500,Gn=50,Xe=100,jo=10*1024*1024,tt=60,Jo=8,Un=400,Xo="□☐▢❑◻",Fn="☑",hn="☑☒",Vr=40,zo=new Set(["image","picture","shape","group","ole","textbox"]),Hn="ext:ieum-reveal",Ko="ieum:file-command",Wo="ieum:dirty-changed",Ut=[{command:"save",id:"ext:ieum-save",shortcut:"Ctrl+S"},{command:"saveAs",id:"ext:ieum-save-as",shortcut:"Ctrl+Shift+S"},{command:"pdf",id:"ext:ieum-export-pdf"},{command:"preview",id:"ext:ieum-preview"},{command:"print",id:"ext:ieum-print",shortcut:"Ctrl+P"}],pt="ext:ieum-selection",jn="ext:ieum-count-characters",Jn="ext:ieum-easy-words",Vo="ieum:easy-words",Yo="ieum:missing-fonts",Xn="ext:ieum-select-word",zn="ext:ieum-select-paragraph",mt="ext:ieum-word-drag",Ft="ext:ieum-mark-changes",qo=500,Zo=2e3;function Qo(e,n){const t=JSON.parse(e.getPageInfo(n));return{svg:e.renderPageSvgWithProfile(n,"print"),width:t.width,height:t.height}}const ea="rgba(255, 193, 7, 0.24)",ta="rgba(214, 140, 0, 0.85)",na=4,Kn=350,ra=new Set(["delete-paragraph","remove-table-lines","delete-note"]),oa="ieum:memo-removed",aa="ieum:memo-not-copied",Wn="ext:ieum-memo-list",Vn="ext:ieum-memo-selection",la="ext:ieum-memo-insert",sa="ext:ieum-memo-set",ia="ext:ieum-memo-remove",Ht="ext:ieum-memo-anchors",ca="ext:ieum-memo-lock",ua="ext:ieum-memo-unlock",dn=new Set(["body","tableCell","textBox"]),Yn=new Set(["memo-insert","memo-set","memo-remove"]),qn=1e5,fa=64,Yr=80,Zn=15,ha=3,da="rgba(64, 132, 240, 0.16)",ga="rgba(28, 96, 214, 0.7)",pa="rgba(64, 132, 240, 0.32)",ma="rgba(18, 72, 176, 0.95)",ba=2,xa=250,ya="ieum:hwp-memo-copied",Qn=15e3,gn=5e3,wa=4e5,Ia=1e5,pn=3,Aa=32,Ca=3,ka=5,er=24,Sa=2e3,tr=4,nr=200,rr=50,or=500,qr="범위 초과",O=e=>JSON.parse(e),he=/[\u0000-\u001f\u007f]/;function _(e,n){const t=new Error(n);return t.code=e,t}function ar(e){return e instanceof Error?e:_("ENGINE_ERROR",String(e))}function Oe(e){if(Array.isArray(e.cellPath)&&e.cellPath.length>0)return e.cellPath.map(t=>({controlIndex:t.controlIndex,cellIndex:t.cellIndex,cellParaIndex:t.cellParaIndex}));const n=e.cellContext;return n?[{controlIndex:n.ctrlIdx,cellIndex:n.cellIdx,cellParaIndex:n.cellPara}]:null}function nt(e,n){const t=Oe(e);return{sec:e.sec,para:e.para,...t?{path:t}:{},offset:e.charOffset??0,length:n}}function _a(e){const n=e.location;if(!n)return null;const t=Array.isArray(n.path)?n.path:[];return t.some(r=>r.type!=="cell")?null:{sec:n.sectionIndex,para:n.paraIndex,...t.length>0?{path:t.map(r=>({controlIndex:r.controlIndex,cellIndex:r.cellIndex,cellParaIndex:r.paraIndex}))}:{},offset:e.startCharIdx??0,length:0}}function Zr(e){return!Array.isArray(e.path)||e.path.length===0?null:e.path.map(n=>({controlIndex:n.controlIndex,cellIndex:Number.isInteger(n.cellIndex)?n.cellIndex:0,cellParaIndex:Number.isInteger(n.cellParaIndex)?n.cellParaIndex:Number.isInteger(n.paraIndex)?n.paraIndex:0}))}function mn(e){if(!dn.has(e.place)||!Number.isInteger(e.sectionIndex)||!Number.isInteger(e.paraIndex))return null;const n=Zr(e);if(e.place!=="body"&&!n)return null;const t=Number.isInteger(e.startCharIdx)?e.startCharIdx:0,r=Number.isInteger(e.endCharIdx)?e.endCharIdx:t;return{sec:e.sectionIndex,para:e.paraIndex,...n?{path:n}:{},offset:t,length:Math.max(0,r-t)}}function Na(e,n){const t=mn(n);if(!t)return[];const r=t.path;if(t.length>0){const l=O(r?e.getSelectionRectsInCellByPath(t.sec,t.para,JSON.stringify(r),r[r.length-1].cellParaIndex,t.offset,r[r.length-1].cellParaIndex,t.offset+t.length):e.getSelectionRects(t.sec,t.para,t.offset,t.para,t.offset+t.length));return Array.isArray(l)?l:[]}const o=O(r?e.getCursorRectByPath(t.sec,t.para,JSON.stringify(r),t.offset):e.getCursorRect(t.sec,t.para,t.offset));return!o||!Number.isFinite(o.pageIndex)?[]:[{pageIndex:o.pageIndex,x:o.x,y:o.y,width:0,height:o.height??0}]}function ie(e){if(typeof e.getMemoList!="function")return[];const n=O(e.getMemoList());return Array.isArray(n)?n:[]}const bt=e=>O(e.getDocumentInfo()).encrypted===!0,jt=e=>({id:e.id,index:e.index,author:typeof e.author=="string"?e.author:"",text:ee(String(e.text??"").replace(/\s+/g," ").trim(),Se),place:e.place,page:Number.isInteger(e.page)?e.page:0});function Jt(e){return ie(e).map(n=>{let t;try{t=Na(e,n)}catch{t=[]}const r=Number.isInteger(n.page)&&n.page>0?n.page:t.length>0?t[0].pageIndex+1:0;return{id:n.id,index:n.index,author:typeof n.author=="string"?n.author:"",date:n.date??null,text:typeof n.text=="string"?n.text:"",place:typeof n.place=="string"?n.place:"unknown",sectionIndex:Number.isInteger(n.sectionIndex)?n.sectionIndex:null,paraIndex:Number.isInteger(n.paraIndex)?n.paraIndex:null,startCharIdx:Number.isInteger(n.startCharIdx)?n.startCharIdx:null,endCharIdx:Number.isInteger(n.endCharIdx)?n.endCharIdx:null,path:Array.isArray(n.path)?n.path:null,page:r,editable:n.editable===!0,readOnlyReason:typeof n.readOnlyReason=="string"?n.readOnlyReason:null,anchor:mn(n),rects:t,preview:ee(String(n.text??"").replace(/\s+/g," ").trim(),Yr)}})}const Zt=e=>Array.isArray(e)&&e.length>0?JSON.stringify(e.map(n=>[n.controlIndex,Number.isInteger(n.cellIndex)?n.cellIndex:0,Number.isInteger(n.cellParaIndex)?n.cellParaIndex:Number.isInteger(n.paraIndex)?n.paraIndex:0])):"body",Ea=e=>`${e.sectionIndex}:${e.paraIndex}:${Zt(e.path)}`;function lr(e,n,t,r){return e.some(o=>{if(!dn.has(o.place)||Ea(o)!==n)return!1;const l=o.startCharIdx,c=o.endCharIdx;return!Number.isInteger(l)||!Number.isInteger(c)?!1:t===r?l<t&&t<c||l===t&&c===r:l<r&&t<c})}const Qt=e=>e.path?e.path[e.path.length-1].cellParaIndex:Number.isInteger(e.paraIndex)?e.paraIndex:e.para;function Ta(e){return String(e??"").replace(/[\u0000-\u001f\u007f/\\;]/g,"").trim().slice(0,fa)||"IeumOffice"}function Ma(e){if(!e||typeof e!="object")throw _("BAD_ARGUMENT","anchor must be an object");if(!dn.has(e.place))throw _("BAD_ARGUMENT","anchor.place must be body, tableCell or textBox");const{sectionIndex:n,paraIndex:t,startCharIdx:r,endCharIdx:o}=e;if(!Number.isInteger(n)||!Number.isInteger(t))throw _("BAD_ARGUMENT","the anchor paragraph must be a pair of integers");if(!Number.isInteger(r)||!Number.isInteger(o)||r<0||o<r)throw _("BAD_ARGUMENT","the anchor range must be a pair of character offsets");let l=null;if(e.place==="body"){if(e.path!==null&&e.path!==void 0)throw _("BAD_ARGUMENT","a body memo takes no path")}else{if(!Array.isArray(e.path)||e.path.length===0)throw _("BAD_ARGUMENT","a cell or text box memo needs a path");l=e.path.map(c=>{if(!c||!Number.isInteger(c.controlIndex)||!Number.isInteger(c.cellIndex)||!Number.isInteger(c.cellParaIndex))throw _("BAD_ARGUMENT","the anchor path steps must be integers");return{controlIndex:c.controlIndex,cellIndex:c.cellIndex,cellParaIndex:c.cellParaIndex}})}return{place:e.place,sectionIndex:n,paraIndex:t,startCharIdx:r,endCharIdx:o,path:l}}function Pa(e){const n=e instanceof Error?e.message:String(e);try{const t=JSON.parse(n);if(t&&t.ok===!1&&typeof t.code=="string")return t}catch{}return null}function sr(e,n){if(!e||!n)return!1;if(e.sec!==n.sec)return e.sec>n.sec;if(e.para!==n.para)return e.para>n.para;const t=e.path??[],r=n.path??[];for(let c=0;c<Math.max(t.length,r.length);c++){const i=t[c],h=r[c];if(!i||!h)return!!i;if(i.controlIndex!==h.controlIndex)return i.controlIndex>h.controlIndex;if((i.cellIndex??0)!==(h.cellIndex??0))return(i.cellIndex??0)>(h.cellIndex??0);if((i.cellParaIndex??0)!==(h.cellParaIndex??0))return(i.cellParaIndex??0)>(h.cellParaIndex??0)}const o=Number.isInteger(e.k)?e.k:Qt(e),l=Number.isInteger(n.k)?n.k:Qt(n);return o!==l?o>l:e.offset>=n.offset}function Oa(e,n,t){return ie(e).filter(r=>{const o=mn(r);if(!o)return!1;const l={...o,k:Qt(o)};return sr(l,n)&&sr(t,l)}).length}function ir(e,n){try{globalThis.dispatchEvent?.(new CustomEvent(e,{detail:n}))}catch{}}function va(e,n){const t=e&&e.getInputHandler?e.getInputHandler():null,r=t?t.cursor:null;if(!r||!n||!Number.isInteger(n.sec)||!Number.isInteger(n.para))return!1;const o=Array.isArray(n.path)?n.path:[],l=Number.isInteger(n.offset)?n.offset:0,c=o.length>0?{sectionIndex:n.sec,paragraphIndex:n.para,charOffset:l,parentParaIndex:n.para,controlIndex:o[0].controlIndex,cellIndex:o[0].cellIndex,cellParaIndex:o[0].cellParaIndex,...o.length>1?{cellPath:o}:{}}:{sectionIndex:n.sec,paragraphIndex:n.para,charOffset:l};return r.clearSelection(),r.moveTo(c),Number.isInteger(n.length)&&n.length>0&&(r.setAnchor(),r.moveTo({...c,charOffset:l+n.length})),t.updateCaret&&t.updateCaret(),!0}function cr(e){const n=e&&e.getInputHandler?e.getInputHandler():null,t=n?n.cursor:null;if(!t)return null;if(t.isInCellSelectionMode&&t.isInCellSelectionMode()){const o=t.getSelectedCellRange?t.getSelectedCellRange():null,l=t.getCellTableContext?t.getCellTableContext():null;if(o&&l){const c=t.getExcludedCells?[...t.getExcludedCells()]:[];return{block:{table:l,range:o,excluded:c}}}}if(!t.hasSelection())return null;const r=t.getSelectionOrdered();return r?{start:r.start,end:r.end}:null}const Qr=e=>e.map(n=>({controlIndex:n.controlIndex,cellIndex:Number.isInteger(n.cellIndex)?n.cellIndex:0,cellParaIndex:n.cellParaIndex}));function De(e){if(!e||!Number.isInteger(e.sectionIndex)||!Number.isInteger(e.charOffset))return null;const n=Array.isArray(e.cellPath)&&e.cellPath.length>0?e.cellPath:Number.isInteger(e.cellIndex)||e.isTextBox?[e]:null;if(!n)return{sec:e.sectionIndex,para:e.paragraphIndex,path:null,k:e.paragraphIndex,offset:e.charOffset};const t=Qr(n);return t.some(r=>!Number.isInteger(r.controlIndex)||!Number.isInteger(r.cellParaIndex))?null:{sec:e.sectionIndex,para:Number.isInteger(e.parentParaIndex)?e.parentParaIndex:e.paragraphIndex,path:t,k:t[t.length-1].cellParaIndex,offset:e.charOffset,textBox:e.isTextBox===!0}}function Mt(e,n,t){return e.sec!==n.sec||e.para!==n.para||e.path.length!==n.path.length?!1:e.path.every((r,o)=>{const l=n.path[o],c=o===e.path.length-1;return r.controlIndex===l.controlIndex&&(c?!t||r.cellIndex===l.cellIndex:r.cellIndex===l.cellIndex&&r.cellParaIndex===l.cellParaIndex)})}function Ra(){const e=[];let n=0;return{segments:e,add(t,r,o,l){const c=t.length(r),i=Math.min(Math.max(o,0),c),h=Math.min(l,c);h<=i||(n+=h-i,e.push({...t.place(r,h-i),offset:i,text:Ve(t.text(r,c),i,h)}))},tooLong:()=>e.length>gn||n>wa}}function Pt(e,n,t,r,o){const l=n[t],c=n.map((h,C)=>({child:h,at:C})).filter(({child:h})=>h.parent===t),i=o?ae(e,l):null;for(let h=0;h<l.cells;h++){if(i&&!o(i[h]))continue;const C=re(e,l,h),w=C.count();for(let v=0;v<w;v++){r.add(C,v,0,1/0);for(const{child:B,at:H}of c){const F=B.path[B.path.length-2];F.cellIndex===h&&F.cellParaIndex===v&&Pt(e,n,H,r,null)}if(r.tooLong())return}}}function La(e,n,t,r,o){for(let l=t.sec;l<=r.sec;l++){const c=le(e,{sec:l,para:0}),i=c.count()-1,h=l===t.sec?t.k:0,C=l===r.sec?Math.min(r.k,i):i;for(let w=h;w<=C;w++){const v=c.length(w),B=l===t.sec&&w===t.k?t.offset:0,H=l===r.sec&&w===r.k?r.offset:v;if(o.add(c,w,B,H),B<=0&&H>=v&&c.objectPositions(w).length>0){const F=n();F.forEach((E,R)=>{E.parent===null&&E.sec===l&&E.para===w&&Pt(e,F,R,o,null)})}if(o.tooLong())return}}}function ur(e,n,t){let r=null;const o=()=>r??=oe(e).tables,l=(h,C,w)=>{const v=We(h,C,w);return o().findIndex(B=>We(B.sec,B.para,B.path)===v)},c=(h,C)=>w=>w.row<=h.endRow&&w.row+w.rowSpan-1>=h.startRow&&w.col<=h.endCol&&w.col+w.colSpan-1>=h.startCol&&!C.has(`${w.row},${w.col}`);let i=!1;if(n.block){const{table:h,range:C,excluded:w}=n.block,v=Array.isArray(h.cellPath)&&h.cellPath.length>0?Qr(h.cellPath):[{controlIndex:h.ci,cellIndex:0,cellParaIndex:0}],B=l(h.sec,h.ppi,v);if(B<0)return{ok:!1,reason:"unsupported"};Pt(e,o(),B,t,c(C,new Set(w))),i=!0}else{const h=De(n.start),C=De(n.end);if(!h||!C)return{ok:!1,reason:"unsupported"};if(h.path&&C.path&&Mt(h,C,!0)){const w=le(e,{sec:h.sec,para:h.para,cellPath:h.path});for(let v=h.k;v<=C.k;v++)t.add(w,v,v===h.k?h.offset:0,v===C.k?C.offset:1/0);i=!0}else if(h.path&&C.path&&Mt(h,C,!1)){const w=l(h.sec,h.para,h.path);if(w<0)return{ok:!1,reason:"unsupported"};const v=ae(e,o()[w]),B=v[h.path[h.path.length-1].cellIndex],H=v[C.path[C.path.length-1].cellIndex];if(!B||!H)return{ok:!1,reason:"unsupported"};const F={startRow:Math.min(B.row,H.row),endRow:Math.max(B.row+B.rowSpan-1,H.row+H.rowSpan-1),startCol:Math.min(B.col,H.col),endCol:Math.max(B.col+B.colSpan-1,H.col+H.colSpan-1)};Pt(e,o(),w,t,c(F,new Set)),i=!0}else La(e,o,h.path?{sec:h.sec,k:h.para,offset:0}:h,C.path?{sec:C.sec,k:C.para,offset:1/0}:C,t)}return{ok:!0,inTable:i}}function fr(e){return e.every((n,t)=>{if(t===0)return!0;const r=e[t-1];if(n.sec!==r.sec)return!1;const o=n.path??null,l=r.path??null;if(!o||!l)return!o&&!l&&n.para>r.para;const c={sec:n.sec,para:n.para,path:o},i={sec:r.sec,para:r.para,path:l};return Mt(c,i,!0)&&o[o.length-1].cellParaIndex>l[l.length-1].cellParaIndex})}const rt=/[\p{L}\p{N}]/u;function en(e,n){const t=yo(e);let r=Math.min(n,t.length-1);if(r<0||(!rt.test(t[r])&&r>0&&rt.test(t[r-1])&&(r-=1),!rt.test(t[r])))return null;let o=r,l=r+1;for(;o>0&&rt.test(t[o-1]);)o-=1;for(;l<t.length&&rt.test(t[l]);)l+=1;return{start:o,end:l}}const hr=e=>typeof e=="string"?O(e):e;function bn(e,n){const t=e&&e.getInputHandler?e.getInputHandler():null,r=t?t.cursor:null;if(!r||!r.getPosition||["isInPictureObjectSelection","isInCellSelectionMode"].some(i=>typeof r[i]=="function"&&r[i]()))return null;if(typeof r.isInHeaderFooter=="function"&&r.isInHeaderFooter()){const i={sectionIdx:r.hfSectionIdx,isHeader:r.headerFooterMode==="header",applyTo:r.hfApplyTo},h=r.hfParaIdx,C=hr(e.wasm.getHeaderFooterParaInfo(i.sectionIdx,i.isHeader,i.applyTo,h));return{input:t,kind:"header",key:`hf:${i.sectionIdx}:${i.isHeader}:${i.applyTo}:${h}`,text:String(C?.text??""),offset:r.hfCharOffset,at:w=>({...i,paraIdx:h,charOffset:w}),select:(w,v)=>r.selectHeaderFooterRange(w.at(w.offset),v.at(v.offset),r.hfPreviewPage),forward:()=>{const w=r.getHeaderFooterSelectionOrdered?.();return!w||w.end.paraIdx===r.hfParaIdx&&w.end.charOffset===r.hfCharOffset}}}if(typeof r.isInFootnote=="function"&&r.isInFootnote()){const i=r.fnInnerParaIdx,h=hr(e.wasm.getFootnoteInfo(r.fnSectionIdx,r.fnParaIdx,r.fnControlIdx));return{input:t,kind:"footnote",key:`fn:${r.fnSectionIdx}:${r.fnParaIdx}:${r.fnControlIdx}:${i}`,text:String(h?.texts?.[i]??""),offset:r.fnCharOffset,at:C=>({fnParaIdx:i,charOffset:C}),select:(C,w)=>(r.clearSelection(),r.setFnCursorPosition(C.at(C.offset).fnParaIdx,C.offset),r.setFnAnchor(),r.setFnCursorPosition(w.at(w.offset).fnParaIdx,w.offset),!0),forward:()=>{const C=r.getFootnoteSelectionOrdered?.();return!C||C.end.fnParaIdx===r.fnInnerParaIdx&&C.end.charOffset===r.fnCharOffset}}}const l=r.getPosition(),c=De(l);return c?{input:t,kind:"body",key:tn({...c,offset:0,length:0}),text:n(c),offset:c.offset,at:i=>({...l,charOffset:i}),select:(i,h)=>(r.clearSelection(),r.moveTo(i.at(i.offset)),r.setAnchor(),r.moveTo(h.at(h.offset)),!0),forward:()=>{const i=r.getSelectionOrdered?.();if(!i)return!0;const h=r.getPosition();return["sectionIndex","paragraphIndex","cellIndex","cellParaIndex","charOffset"].every(C=>i.end[C]===h[C])}}:null}function xn(e,n,t){const r=e.select({...e,offset:n},{...e,offset:t});return r!==!1&&e.input.updateCaret&&e.input.updateCaret(),r!==!1}function $a(e,n){const t=bn(e,n);if(!t)return!1;const r=en(t.text,t.offset);return r?xn(t,r.start,r.end):!1}function Ba(e,n){const t=bn(e,n);return!t||t.text.length===0?!1:xn(t,0,Wr(t.text))}function Da(e,n,t,r){const o=bn(e,n);if(!o)return r==="start"?null:t;if(r==="start"){const C=en(o.text,o.offset);return C?{place:o,start:C.start,end:C.end,widened:!1}:null}if(!t||o.kind!==t.place.kind)return t;const l=o.key===t.place.key;if(l&&o.offset>=t.start&&o.offset<=t.end)return xn(t.place,t.start,t.end),t;const c=l?o.offset>t.end:o.forward(),i=en(o.text,o.offset)??{start:o.offset,end:o.offset};return(c?t.place.select({...t.place,offset:t.start},{...o,offset:i.end}):t.place.select({...t.place,offset:t.end},{...o,offset:i.start}))!==!1&&o.input.updateCaret&&o.input.updateCaret(),{...t,widened:!0}}const tn=e=>[e.sec,e.para,(e.path??[]).map(n=>`${n.controlIndex}.${n.cellIndex}.${n.cellParaIndex}`).join("/"),e.offset,e.length].join(":"),St=(e,n)=>{const t=le(e,{sec:n.sec,para:n.para,cellPath:n.path});return{box:t,k:t.index}};function dr(e){if(!(Array.isArray(e)&&e.length>0&&e.length<=gn&&e.every(t=>t&&Number.isInteger(t.sec)&&Number.isInteger(t.para)&&Number.isInteger(t.offset)&&Number.isInteger(t.length)&&t.offset>=0&&t.length>=0&&typeof t.text=="string")))throw _("BAD_ARGUMENT","the selection is not one this editor handed out")}function Xt(e,n){return n.every(t=>{try{const{box:r,k:o}=St(e,t),l=r.text(o,r.length(o));return Ve(l,t.offset,t.offset+t.length)===t.text}catch{return!1}})}const ue=e=>e.equationControl===void 0;function Ga(e,n){const t=Math.max(0,n.charOffset-Gt),r=Oe(n);if(r){const c=JSON.stringify(r),i=e.getCellParagraphLengthByPath(n.sec,n.para,c),h=Math.min(i-t,n.length+Gt*2);return h>0?e.getTextInCellByPath(n.sec,n.para,c,t,h):""}const o=e.getParagraphLength(n.sec,n.para),l=Math.min(o-t,n.length+Gt*2);return l>0?e.getTextRange(n.sec,n.para,t,l):""}function Ua(e,n){const t=le(e,n),o=t.text(t.index,t.length(t.index)).slice(n.charOffset,n.charOffset+n.length);for(let l=t.index-1;l>=0&&l>=t.index-Go;l--){const c=fe(t.text(l,t.length(l)));if(c&&!c.includes(fe(o)))return ee(c,Do)}return""}function Fa(e,n,t){const r={occurrence:t+1,inTable:!!n.cellContext};if(!ue(n))return{...r,replaceable:!1};let o=r;try{o={...r,context:Ga(e,n)};const l=Ua(e,n);l&&(o.before=l)}catch{}return o}function be(e,n){if(typeof n!="string"||n.length===0)throw _("BAD_ARGUMENT","find must be a non-empty string");return O(e.searchAllText(n,!0,!0))}function ot(e){if(typeof e!="string"||he.test(e))throw _("BAD_ARGUMENT","replacement must be one line of plain text")}function U(e,n){const t=O(e);if(t&&t.ok===!1)throw _("ENGINE_REFUSED",`the editor refused to ${n}`)}const _t=8;function Ha(e){return Array.from(e).slice(0,_t).join("")}function xt(e,n,t){const r=Oe(n);if(!r){U(e.replaceText(n.sec,n.para,n.charOffset,n.length,t),"replace");return}const o=JSON.stringify(r);if(t.length===0){U(e.deleteTextInCellByPath(n.sec,n.para,o,n.charOffset,n.length),"delete");return}const l=r[r.length-1];if(r.length===1&&typeof e.replaceTextInCellDeferredPagination=="function"){let c=n.length;for(;c>_t;){const w=c-_t;U(e.replaceTextInCellDeferredPagination(n.sec,n.para,l.controlIndex,l.cellIndex,l.cellParaIndex,n.charOffset+w,_t," "),"replace"),c=w+1}const i=Ha(t),h=Array.from(i).length,C=Array.from(t).length;U(e.replaceTextInCellDeferredPagination(n.sec,n.para,l.controlIndex,l.cellIndex,l.cellParaIndex,n.charOffset,c,i),"replace"),h<C&&U(e.insertTextInCellByPath(n.sec,n.para,o,n.charOffset+h,t.slice(i.length)),"insert");return}U(e.deleteTextInCellByPath(n.sec,n.para,o,n.charOffset,n.length),"delete"),U(e.insertTextInCellByPath(n.sec,n.para,o,n.charOffset,t),"insert")}function le(e,n){const{sec:t,para:r}=n,o=Oe(n);if(!o)return{index:r,inTable:!1,place:(i,h)=>({sec:t,para:i,offset:0,length:h}),count:()=>e.getParagraphCount(t),length:i=>e.getParagraphLength(t,i),text:(i,h)=>h>0?e.getTextRange(t,i,0,h):"",objectPositions:i=>ja(e,t,i),split:(i,h)=>U(e.splitParagraph(t,i,h),"split the paragraph"),font:i=>Mr(()=>e.getCharPropertiesAt(t,i,0)),addAfter:i=>U(e.insertParagraph(t,i+1),"add a paragraph"),insert:(i,h)=>U(e.insertText(t,i,0,h),"insert"),deleteText:(i,h)=>U(e.deleteText(t,i,0,h),"delete"),deleteRange:(i,h,C,w)=>U(e.deleteRange(t,i,h,C,w),"delete"),pasteHtml:(i,h)=>U(e.pasteHtml(t,i,0,h),"insert the table"),formatChars:(i,h,C,w)=>U(e.applyCharFormat(t,i,h,C,w),"format the text"),formatParagraph:(i,h)=>U(e.applyParaFormat(t,i,h),"format the paragraph"),applyStyle:(i,h)=>U(e.applyStyle(t,i,h),"apply the style"),setCharShape:(i,h,C,w)=>U(e.setCharShapeId(t,i,h,C,w),"apply the character style"),styleShape:i=>({style:O(e.getStyleAt(t,i)).id,paraShape:O(e.getParaPropertiesAt(t,i)).paraShapeId})};const l=o[o.length-1],c=i=>JSON.stringify([...o.slice(0,-1),{...l,cellParaIndex:i}]);return{index:l.cellParaIndex,inTable:!0,place:(i,h)=>({sec:t,para:r,path:O(c(i)),offset:0,length:h}),count:()=>e.getCellParagraphCountByPath(t,r,c(0)),length:i=>e.getCellParagraphLengthByPath(t,r,c(i)),text:(i,h)=>h>0?e.getTextInCellByPath(t,r,c(i),0,h):"",objectPositions:()=>[],font:i=>Mr(()=>e.getCellCharPropertiesAtByPath(t,r,c(i),0)),split:(i,h)=>U(e.splitParagraphInCellByPath(t,r,c(i),h),"split the paragraph"),insert:(i,h)=>U(e.insertTextInCellByPath(t,r,c(i),0,h),"insert"),deleteText:(i,h)=>U(e.deleteTextInCellByPath(t,r,c(i),0,h),"delete"),deleteRange:(i,h,C,w)=>U(e.deleteRangeInCellByPath(t,r,c(i),i,h,C,w),"delete"),pasteHtml:(i,h)=>U(e.pasteHtmlInCellByPath(t,r,c(i),0,h),"insert the table"),formatChars:(i,h,C,w)=>U(e.applyCharFormatInCellByPath(t,r,c(i),h,C,w),"format the text"),formatParagraph:o.length===1?(i,h)=>U(e.applyParaFormatInCell(t,r,l.controlIndex,l.cellIndex,i,h),"format the paragraph"):null,applyStyle:o.length===1?(i,h)=>U(e.applyCellStyle(t,r,l.controlIndex,l.cellIndex,i,h),"apply the style"):null,setCharShape:(i,h,C,w)=>U(e.setCharShapeIdInCellByPath(t,r,c(i),h,C,w),"apply the character style"),styleShape:o.length===1?i=>({style:O(e.getCellStyleAt(t,r,l.controlIndex,l.cellIndex,i)).id,paraShape:O(e.getCellParaPropertiesAt(t,r,l.controlIndex,l.cellIndex,i)).paraShapeId}):null}}function X(e,n=null){const t=O(e.getFieldList()),r=t.filter(C=>C.fieldType!=="memo"),o=n?r.filter(C=>C.cellField!==!0&&!n.has(C.fieldId)):r,l=O(e.getControls()),c=l.filter(C=>C.ctrlId===""&&C.ctrlCh===0),i=new Set;let h=0;for(const C of t.filter(w=>w.fieldType==="memo")){const w=c.findIndex((v,B)=>!i.has(B)&&Number.isInteger(C.listId)&&v.list===C.listId&&v.para===C.paraInList);w<0||(i.add(w),h+=1)}return{controls:l.length-h,fields:JSON.stringify(o.map(C=>C.value??""))}}function ja(e,n,t){const r=O(e.getControlTextPositions(n,t)),o=ie(e).filter(l=>l.place==="body"&&l.sectionIndex===n&&l.paraIndex===t).map(l=>l.startCharIdx).filter(l=>Number.isInteger(l));return r.filter(l=>!o.includes(l))}const nn=/^#[0-9a-fA-F]{6}$/,gr=["left","center","right","justify"],Ja=["bold","italic","underline","strikethrough"],pr=64,Xa=7,za=200,Ka={indent:{min:-100,max:100,key:"indent"},marginLeft:{min:0,max:300,key:"marginLeft"},marginRight:{min:0,max:300,key:"marginRight"},spacingBefore:{min:0,max:200,key:"spacingBefore"},spacingAfter:{min:0,max:200,key:"spacingAfter"}},mr=["number","bullet","none"],br=7,Wa="●",ye=0,Ne=1,Va="#style-name",Ya=400,xr="ext:ieum-caret-state";function qa(e,n){const t=Array.from(e.options,o=>[Number(o.value),o.textContent]);if(JSON.stringify(t)===JSON.stringify(n.map(o=>[o.id,o.name])))return!1;const r=e.value;return e.replaceChildren(...n.map(o=>{const l=e.ownerDocument.createElement("option");return l.value=String(o.id),l.textContent=o.name,l})),n.some(o=>String(o.id)===r)?e.value=r:e.selectedIndex=-1,!0}const yr=250,Za=/["\\]/;function lt(e,n){if(!e||typeof e!="object"||Array.isArray(e))throw _("BAD_ARGUMENT","format must be an object");const t=w=>e[w]!==void 0&&e[w]!==null,r={};for(const w of Ja)if(t(w)){if(typeof e[w]!="boolean")throw _("BAD_ARGUMENT",`${w} must be true or false`);r[w]=e[w]}if(t("size")){if(typeof e.size!="number"||!(e.size>=tr&&e.size<=nr))throw _("BAD_ARGUMENT",`size must be ${tr} to ${nr} points`);r.fontSize=Math.round(e.size*100)}if(t("color")){if(typeof e.color!="string"||!nn.test(e.color))throw _("BAD_ARGUMENT","color must look like #RRGGBB");r.textColor=e.color.toLowerCase()}if(t("highlight")){const w=e.highlight==="none";if(!w&&(typeof e.highlight!="string"||!nn.test(e.highlight)))throw _("BAD_ARGUMENT",'highlight must look like #RRGGBB, or be "none"');r.shadeColor=w?"#ffffff":e.highlight.toLowerCase()}let o=null;if(t("font")){const w=typeof e.font=="string"?e.font.trim():"";if(!w||w.length>pr||he.test(w))throw _("BAD_ARGUMENT",`font must be a font name of 1 to ${pr} characters`);o=w}const l={};if(t("align")){if(!gr.includes(e.align))throw _("BAD_ARGUMENT",`align must be one of ${gr.join(", ")}`);l.alignment=e.align}if(t("lineSpacing")){const w=e.lineSpacing;if(typeof w!="number"||!(w>=rr&&w<=or))throw _("BAD_ARGUMENT",`lineSpacing must be ${rr} to ${or} percent`);l.lineSpacing=Math.round(w),l.lineSpacingType="Percent"}for(const[w,{min:v,max:B,key:H}]of Object.entries(Ka)){if(!t(w))continue;const F=e[w];if(typeof F!="number"||!(F>=v&&F<=B))throw _("BAD_ARGUMENT",`${w} must be ${v} to ${B} points`);l[H]=Math.round(F*za)}if(t("list")){if(!mr.includes(e.list))throw _("BAD_ARGUMENT",`list must be one of ${mr.join(", ")}`);l.list={kind:e.list,level:0,bullet:Wa}}if(t("listLevel")){if(!l.list||l.list.kind==="none")throw _("BAD_ARGUMENT",'listLevel goes with list "number" or "bullet"');const w=e.listLevel;if(!Number.isInteger(w)||w<1||w>br)throw _("BAD_ARGUMENT",`listLevel must be a whole number from 1 to ${br}`);l.list.level=w-1}if(t("bullet")){if(l.list?.kind!=="bullet")throw _("BAD_ARGUMENT",'bullet goes with list "bullet"');if(typeof e.bullet!="string"||[...e.bullet].length!==1||he.test(e.bullet)||e.bullet.trim()==="")throw _("BAD_ARGUMENT","bullet must be one visible character");l.list.bullet=e.bullet}let c=null;if(t("style")){const w=typeof e.style=="string"?e.style.trim():"";if(!w||he.test(w))throw _("BAD_ARGUMENT","style must be a style name");c=w}let i=null;if(t("charStyle")){const w=typeof e.charStyle=="string"?e.charStyle.trim():"";if(!w||he.test(w))throw _("BAD_ARGUMENT","charStyle must be a style name");i=w}const h=Object.keys(r).length>0||o!==null||i!==null,C=Object.keys(l).length>0||c!==null;if(C&&!n)throw _("BAD_ARGUMENT","align, lineSpacing, indents, margins, spacing, list and style belong to a whole paragraph");if(!h&&!C)throw _("BAD_ARGUMENT","format names nothing to change");return{chars:Object.keys(r).length>0||o!==null?r:null,font:o,paragraph:Object.keys(l).length>0?l:null,style:c,charStyle:i}}function _e(e,n,t){const r=n.toLowerCase();return O(e.getStyleList()).find(o=>(t===null||o.type===t)&&(String(o.name??"").toLowerCase()===r||String(o.englishName??"").toLowerCase()===r))??null}function eo(e,n){return _e(e,n,ye)?.id??null}const Be=(e,n=ye)=>({ok:!1,reason:"no_such_style",kind:n===null?"any":n===Ne?"character":"paragraph",styles:O(e.getStyleList()).filter(t=>n===null||t.type===n).map(t=>t.name)});function yt(e,n){return n.style&&eo(e,n.style)===null?Be(e):n.charStyle&&_e(e,n.charStyle,Ne)===null?Be(e,Ne):null}function zt(e,n,t){if(!n.styleShape)return null;const{style:r,paraShape:o}=n.styleShape(t),l=O(e.getStyleList()).find(c=>c.id===r);return l?l.paraShapeId!==o:!1}const Qa=new Set(["#000000","#ffffff"]);function rn(e){const n=typeof e.textColor=="string"?e.textColor.toLowerCase():"",t=n!==""&&!Qa.has(n),r=e.italic===!0;return!t&&!r?null:JSON.stringify({...t?{textColor:"#000000"}:{},...r?{italic:!1}:{}})}function el(e,n,t,r,o){if(!Number.isInteger(o)||o<=0)return;const l=JSON.stringify(ne(n.path,t,r));let c;try{c=rn(O(e.getCellCharPropertiesAtByPath(n.sec,n.para,l,0)))}catch{return}c&&U(e.applyCharFormatInCellByPath(n.sec,n.para,l,0,o,c),"write the answer")}const it=e=>`${e.fieldId}|${JSON.stringify(e.location??null)}|${e.startCharIdx??""}`;function wr(e,n,t){const r=O(e.getFieldList()),o=r.findIndex(F=>it(F)===n),l=r[o];if(!l)throw _("CHANGED","the document changed mid-call");const c=r.filter(F=>F.fieldId===l.fieldId).length;if(c<2){U(e.setFieldValue(l.fieldId,t),"fill the field");return}const i=()=>_("AMBIGUOUS_FIELD",`field ${o+1} shares its id with ${c-1} other field(s) and could not be filled on its own`),h=l.location,C=l.startCharIdx,w=l.endCharIdx,v=h&&Array.isArray(h.path)?h.path:[];if(!h||!Number.isInteger(C)||!Number.isInteger(w)||w<C)throw i();if(v.length>0){if(!v.every(E=>E.type==="cell"))throw i();const F=JSON.stringify(v.map(E=>({controlIndex:E.controlIndex,cellIndex:E.cellIndex,cellParaIndex:E.paraIndex})));w>C&&U(e.deleteTextInCellByPath(h.sectionIndex,h.paraIndex,F,C,w-C),"fill the field"),t&&U(e.insertTextInCellByPath(h.sectionIndex,h.paraIndex,F,C,t),"fill the field")}else w>C&&U(e.deleteText(h.sectionIndex,h.paraIndex,C,w-C),"fill the field"),t&&U(e.insertText(h.sectionIndex,h.paraIndex,C,t),"fill the field");const B=O(e.getFieldList());if(!(B.length===r.length&&B[o]?.value===t&&r.every((F,E)=>E===o||F.fieldId!==l.fieldId||B[E]?.value===F.value)))throw i()}function Ir(e,n,t=null){if(!(t?t.size===0:!n))for(const r of O(e.getFieldList())){if(t?!t.has(it(r)):!n.has(r.fieldId))continue;const o=r.startCharIdx,l=r.endCharIdx;if(!Number.isInteger(o)||!Number.isInteger(l)||l<=o)continue;const c=r.location??{},i=Array.isArray(c.path)?c.path:null;try{if(i){if(!i.every(v=>v.type==="cell"))continue;const h=i.map(v=>({controlIndex:v.controlIndex,cellIndex:v.cellIndex,cellParaIndex:v.paraIndex})),C=JSON.stringify(h),w=rn(O(e.getCellCharPropertiesAtByPath(c.sectionIndex,c.paraIndex,C,o)));w&&U(e.applyCharFormatInCellByPath(c.sectionIndex,c.paraIndex,C,o,l,w),"write the answer")}else{const h=rn(O(e.getCharPropertiesAt(c.sectionIndex,c.paraIndex,o)));h&&U(e.applyCharFormat(c.sectionIndex,c.paraIndex,o,l,h),"write the answer")}}catch{}}}function ze(e,n){let t=null;if(n.chars){const l={...n.chars};if(n.font){const c=[];for(let i=0;i<Xa;i++){const h=e.findOrCreateFontIdForLang(i,n.font);if(!Number.isInteger(h)||h<0)throw _("ENGINE","the font could not be set");c.push(h)}l.fontIds=c}t=JSON.stringify(l)}let r=null;if(n.style&&(r=eo(e,n.style),r===null))throw _("CHANGED","the style is gone");let o=null;if(n.charStyle){const l=_e(e,n.charStyle,Ne);if(!l)throw _("CHANGED","the style is gone");o=l.charShapeId}return{chars:t,paragraph:n.paragraph?JSON.stringify(tl(e,n.paragraph)):null,style:r,charShape:o}}function tl(e,n){const{list:t,...r}=n;if(!t)return r;if(t.kind==="none")return{...r,headType:"None"};const o=t.kind==="number"?e.ensureDefaultNumbering():e.ensureDefaultBullet(t.bullet);if(!Number.isInteger(o)||o<=0)throw _("ENGINE","the list could not be set");return{...r,headType:t.kind==="number"?"Number":"Bullet",numberingId:o,paraLevel:t.level}}function ke(e,n){const t=typeof e=="string"?e.trim():"";if(!t||t.length>yr||Za.test(t)||he.test(t))throw _("BAD_ARGUMENT",`${n} must be 1 to ${yr} characters, without quotes, backslashes or line breaks`);return t}function Ar(e,n){if(e==null)return null;if(typeof e!="object"||Array.isArray(e))throw _("BAD_ARGUMENT","format must be an object");if(Object.values(e).every(r=>r==null))return null;if(e.style!=null||e.charStyle!=null)throw _("BAD_ARGUMENT","a style is not made of other styles: pass its formatting");const t=lt(e,!0);if(!n&&t.paragraph)throw _("BAD_ARGUMENT","a character style has character formatting only: align, lineSpacing, indents, margins and spacing belong to a paragraph style");return t}function Cr(e,n,t){if(!t)return;const{chars:r,paragraph:o}=ze(e,t);if(!e.updateStyleShapes(n,r??"{}",o??"{}"))throw _("ENGINE_REFUSED","the editor refused to change the style")}function wt(e,n,t=null){const r=_e(e,n,null);return r!==null&&r.id!==t}const Ke=e=>Math.round(e*7.5)/10,Ot=e=>Math.round(e*3.75)/10;function to(e,n){const{charProps:t,paraProps:r}=O(e.getStyleDetail(n.id)),o={font:t.fontFamily,size:t.fontSize/100,bold:t.bold===!0,italic:t.italic===!0,underline:t.underline===!0,strikethrough:t.strikethrough===!0,color:t.textColor};return n.type!==ye?o:{...o,align:r.alignment,...r.lineSpacingType==="Percent"?{lineSpacing:r.lineSpacing}:{},indent:Ke(r.indent),marginLeft:Ke(r.marginLeft),marginRight:Ke(r.marginRight),spacingBefore:Ot(r.spacingBefore),spacingAfter:Ot(r.spacingAfter)}}const on=e=>e.type===Ne?"character":"paragraph",no=7200/25.4,Ge=e=>Math.round(e/no*10)/10,Kt=e=>Math.round(e*no),an={A3:[297,420],A4:[210,297],A5:[148,210],B4:[257,364],B5:[182,257],Letter:[215.9,279.4],Legal:[215.9,355.6]},ln={left:"marginLeft",right:"marginRight",top:"marginTop",bottom:"marginBottom",header:"marginHeader",footer:"marginFooter",gutter:"marginGutter"},kr=50,Sr=1e3,nl=200,_r=20;function sn(e,n){const t=O(e.getPageDef(n)),r=Ge(t.width),o=Ge(t.height),l=Object.entries(an).find(([,[i,h]])=>Math.abs(i-r)<1&&Math.abs(h-o)<1)?.[0]??null,c={};for(const[i,h]of Object.entries(ln))c[i]=Ge(t[h]??0);return{...l?{paper:l}:{},width:r,height:o,orientation:t.landscape===!0?"landscape":"portrait",margins:c}}function rl(e){if(!e||typeof e!="object"||Array.isArray(e))throw _("BAD_ARGUMENT","the page setup must be an object");const n={},t=o=>e[o]!==void 0&&e[o]!==null,r=(o,l,c,i)=>{if(typeof o!="number"||!(o>=l&&o<=c))throw _("BAD_ARGUMENT",`${i} must be ${l} to ${c} millimetres`);return Kt(o)};if(t("paper")){const o=an[e.paper];if(!o)throw _("BAD_ARGUMENT",`paper must be one of ${Object.keys(an).join(", ")}`);if(t("width")||t("height"))throw _("BAD_ARGUMENT","give paper or width and height, not both");n.width=Kt(o[0]),n.height=Kt(o[1])}else if(t("width")||t("height")){if(!t("width")||!t("height"))throw _("BAD_ARGUMENT","width and height go together");n.width=r(e.width,kr,Sr,"width"),n.height=r(e.height,kr,Sr,"height")}if(t("orientation")){if(e.orientation!=="portrait"&&e.orientation!=="landscape")throw _("BAD_ARGUMENT","orientation must be portrait or landscape");n.landscape=e.orientation==="landscape"}if(t("margins")){if(typeof e.margins!="object"||Array.isArray(e.margins))throw _("BAD_ARGUMENT","margins must be an object");for(const[o,l]of Object.entries(e.margins)){if(l==null)continue;const c=ln[o];if(!c)throw _("BAD_ARGUMENT",`margins take ${Object.keys(ln).join(", ")}, not ${String(o)}`);n[c]=r(l,0,nl,`the ${o} margin`)}}if(Object.keys(n).length===0)throw _("BAD_ARGUMENT","the page setup names nothing to change");return n}function ol(e,n){const t={...e,...n},r=t.landscape===!0,o=Ge(r?t.height:t.width),l=Ge(r?t.width:t.height),c=o-Ge(t.marginLeft+t.marginRight+(t.marginGutter??0)),i=l-Ge(t.marginTop+t.marginBottom+(t.marginHeader??0)+(t.marginFooter??0));return c>=_r&&i>=_r}const al=["digit","circledDigit","upperRoman","lowerRoman","upperAlpha","lowerAlpha","circledUpperAlpha","circledLowerAlpha","hangulSyllable","circledHangulSyllable","hangulJamo","circledHangulJamo","hangulDigit","hanjaDigit","circledHanjaDigit","userChar"],ll={footnote:["continue","restartSection","restartPage"],endnote:["continue","restartSection"]},sl={footnote:["eachColumn","belowText","rightColumn"],endnote:["documentEnd","sectionEnd"]},Nr=9999;function st(e,n,t){const r=n==="footnote"?e.getFootnoteShape:e.getEndnoteShape;if(typeof r!="function")return null;const o=O(r.call(e,t));return o.ok?{numberFormat:o.numberFormat,...o.numberFormat==="userChar"?{symbol:o.userChar}:{},prefix:o.prefixChar,suffix:o.suffixChar,superscript:o.numberCodeSuperscript===!0,startNumber:o.startNumber,numbering:o.numbering,placement:o.placement,separator:o.separatorEnabled===!0}:null}function il(e,n){if(!yn.includes(e))throw _("BAD_ARGUMENT","kind must be footnote or endnote");if(!n||typeof n!="object"||Array.isArray(n))throw _("BAD_ARGUMENT","the settings must be an object");const t=c=>n[c]!==void 0&&n[c]!==null,r=(c,i)=>{if(!i.includes(n[c]))throw _("BAD_ARGUMENT",`${c} must be one of ${i.join(", ")}`);return n[c]},o=c=>{const i=n[c];if(typeof i!="string"||[...i].length>1||he.test(i))throw _("BAD_ARGUMENT",`${c} must be one character, or "" for none`);return i},l={};if(t("numberFormat")&&(l.numberFormat=r("numberFormat",al)),t("symbol")){const c=o("symbol");if(c==="")throw _("BAD_ARGUMENT","symbol must be one character");l.userChar=c}if(l.numberFormat==="userChar"&&l.userChar===void 0)throw _("BAD_ARGUMENT","numberFormat userChar needs the symbol");if(t("prefix")&&(l.prefixChar=o("prefix")),t("suffix")&&(l.suffixChar=o("suffix")),t("superscript")){if(typeof n.superscript!="boolean")throw _("BAD_ARGUMENT","superscript must be true or false");l.numberCodeSuperscript=n.superscript}if(t("startNumber")){if(!Number.isInteger(n.startNumber)||n.startNumber<1||n.startNumber>Nr)throw _("BAD_ARGUMENT",`startNumber must be a whole number from 1 to ${Nr}`);l.startNumber=n.startNumber}if(t("numbering")&&(l.numbering=r("numbering",ll[e])),t("placement")&&(l.placement=r("placement",sl[e])),t("separator")){if(typeof n.separator!="boolean")throw _("BAD_ARGUMENT","separator must be true or false");l.separatorEnabled=n.separator}if(Object.keys(l).length===0)throw _("BAD_ARGUMENT","the settings name nothing to change");return l}const cl=14174;function ul(e,n,t,r){if(r.separatorEnabled!==!0)return r;const{separatorEnabled:o,...l}=r;return st(e,n,t)?.separator?l:{...l,separatorLineType:1,separatorLineWidth:1,separatorLength:cl}}const fl=6e3,Nt=40,hl=2,dl=60;function gl(e){let n=2166136261;for(let t=0;t<e.length;t++)n^=e.charCodeAt(t),n=Math.imul(n,16777619)>>>0;return`L${n.toString(36).padStart(6,"0").slice(-6)}`}function pl(e,n,t,r){try{const o=O(e.getParaPropertiesAt(n,t)),l=O(e.getCharPropertiesAt(n,t,0)),c=O(e.getStyleAt(n,t)).id,i=o.headType==="Number"||o.headType==="Bullet"||o.headType==="Outline";return{style:r.get(c)??"",font:l.fontFamily,size:l.fontSize/100,bold:l.bold===!0,italic:l.italic===!0,underline:l.underline===!0,color:l.textColor,align:o.alignment,...o.lineSpacingType==="Percent"?{lineSpacing:o.lineSpacing}:{lineSpacingKind:o.lineSpacingType},indent:Ke(o.indent),marginLeft:Ke(o.marginLeft),marginRight:Ke(o.marginRight),spacingBefore:Ot(o.spacingBefore),spacingAfter:Ot(o.spacingAfter),...i?{list:o.headType==="Bullet"?"bullet":o.headType==="Outline"?"outline":"number",listLevel:(o.paraLevel??0)+1}:{}}}catch{return null}}function cn(e){const n=new Map(O(e.getStyleList()).map(c=>[c.id,c.name])),t=new Map;let r=0,o=!1;for(let c=0;c<e.getSectionCount()&&!o;c++){const i=e.getParagraphCount(c);for(let h=0;h<i;h++){if(r>=fl){o=!0;break}let C;try{C=e.getParagraphLength(c,h)}catch{continue}const w=C>0?fe(ao(e,c,h)):"";if(!w)continue;const v=pl(e,c,h,n);if(!v)continue;r+=1;const B=JSON.stringify(v);let H=t.get(B);H||(H={id:gl(B),look:v,places:[],samples:[],mixed:0},t.set(B,H)),H.places.push({sec:c,para:h,length:C}),H.samples.length<hl&&H.samples.push(ee(w,dl));try{O(e.getCharShapeRuns(c,h,0,C)).length>1&&(H.mixed+=1)}catch{}}}return{looks:[...t.values()].sort((c,i)=>i.places.length-c.places.length),counted:r,truncated:o}}function Er(e){const n=e.getSectionCount(),t=[];for(let w=0;w<n;w++)t.push(sn(e,w));const r=t.every(w=>JSON.stringify(w)===JSON.stringify(t[0])),{looks:o,counted:l,truncated:c}=cn(e),i=new Map;for(const w of o)w.look.style&&i.set(w.look.style,(i.get(w.look.style)??0)+w.places.length);const h=O(e.getStyleList()).filter(w=>i.has(w.name)||w.type===Ne).map(w=>({name:w.name,kind:on(w),paragraphs:i.get(w.name)??0,look:to(e,w)})),C={};for(const w of yn){const v=st(e,w,0);v&&(C[w]=v)}return{pageSetup:r?t[0]:t.map((w,v)=>({section:v+1,...w})),notes:C,styles:h,paragraphs:l,looks:o.slice(0,Nt).map(w=>({id:w.id,paragraphs:w.places.length,...w.look,...w.mixed>0?{mixedFormatting:w.mixed}:{},samples:w.samples})),...o.length>Nt?{otherLooks:o.length-Nt}:{},...c?{truncated:!0}:{}}}function ml(e){const n=globalThis.atob(e),t=new Uint8Array(n.length);for(let r=0;r<n.length;r++)t[r]=n.charCodeAt(r);return t}function It(e){if(e!=="after"&&e!=="before"&&e!=="end")throw _("BAD_ARGUMENT",'where must be "after", "before" or "end"')}const bl=10*1024*1024;function xl(e,n){const t=n==="png"||n==="jpg"||n==="gif"?n:null;if(typeof e!="string"||e===""||!t)throw _("BAD_ARGUMENT","the picture must be base64 PNG, JPEG or GIF bytes");let r;try{r=Uint8Array.from(atob(e),c=>c.charCodeAt(0))}catch{throw _("BAD_ARGUMENT","the picture is not base64")}if(r.byteLength===0||r.byteLength>bl)throw _("BAD_ARGUMENT","the picture is empty or too large");const o=(...c)=>c.every((i,h)=>r[h]===i);if(!(t==="png"?o(137,80,78,71):t==="jpg"?o(255,216):o(71,73,70,56)))throw _("BAD_ARGUMENT",`the bytes are not a ${t.toUpperCase()} picture`);return{bytes:r,extension:t}}function yl(e){if(!(Array.isArray(e)&&e.length>0&&e.length<=On&&e.every(t=>typeof t=="string"&&!he.test(t))))throw _("BAD_ARGUMENT",`paragraphs must be 1 to ${On} strings, each one line of plain text`)}function wl(e){const n=Array.isArray(e)&&e.length>0&&e.every(r=>Array.isArray(r)&&r.length>0&&r.every(o=>typeof o=="string"&&!he.test(o))),t=n?Math.max(...e.map(r=>r.length)):0;if(!n||e.length*t>vn)throw _("BAD_ARGUMENT",`rows must be a non-empty list of rows of one-line strings, at most ${vn} cells`);return e.map(r=>[...r,...Array(t-r.length).fill("")])}const un=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),Il="border:0.4pt solid #000000;padding:1.41pt 5.1pt",ro="#e5e5e5",Al=2.82,Cl=1.6,Tr=10;function Mr(e){try{const n=O(e()),t=typeof n.fontFamily=="string"?n.fontFamily.replace(/["';<>]/g,""):"",r=Number(n.fontSize)/100;return{family:t,points:r>0?r:Tr}}catch{return{family:"",points:Tr}}}function kl(e,n,t,r){const o=Math.round((n.points*Cl+Al)*10)/10,l=[n.family?`font-family:${n.family};mso-fareast-font-family:${n.family}`:"",`font-size:${n.points}pt`].filter(Boolean).join(";"),c=`${Il};height:${o}pt`,i=w=>`<td style="${c}"><span style="${l}">${un(w)}</span></td>`,h=w=>`<th style="${c}${r?`;background-color:${ro}`:""}"><p style="text-align:center"><span style="${l};font-weight:bold">${un(w)}</span></p></th>`;return`<table>${e.map((w,v)=>`<tr>${w.map(t&&v===0?h:i).join("")}</tr>`).join("")}</table>`}function Sl(e,n,t){const r=O(e.getControlTextPositions(n.sec,n.para)).length;for(let o=r-1;o>=0;o--){try{e.getTableDimensionsByPath(n.sec,n.para,JSON.stringify([{controlIndex:o,cellIndex:0,cellParaIndex:0}]))}catch{continue}const l=JSON.stringify({fillType:"solid",fillColor:ro,patternType:-1});for(let c=0;c<t;c++)U(e.setCellProperties(n.sec,n.para,o,c,l),"shade the header");return}}const _l=/&#(\d+);|&#x([0-9a-fA-F]+);/g,Nl=e=>e.replace(_l,(n,t,r)=>String.fromCodePoint(t?Number(t):parseInt(r,16))),fe=e=>e.replace(/\s+/g," ").trim();function El(e){const n=Nl(O(e.getTextFileText())),t=n.split(/\r?\n/),r=new Map;t.forEach((E,R)=>{const $=fe(E);if(!$)return;const j=r.get($);j?j.push(R):r.set($,[R])});const o=new Set;for(const E of O(e.getFieldList())){const R=E.location;if(E.fieldType!=="clickhere"||E.cellField===!0||!R)continue;const j=(Array.isArray(R.path)?R.path:[])[0];o.add(j&&j.type==="cell"?`${R.sectionIndex}/${R.paraIndex}/${j.controlIndex}.${j.cellIndex}.${j.paraIndex}`:`${R.sectionIndex}/${R.paraIndex}`)}const l=new Map,c=new Map;let i=-1,h=Sa,C=null;const w=E=>{const R=r.get(E),$=l.get(E)??0;return!R||$>=R.length?!1:(l.set(E,$+1),i=Math.max(i,R[$]),!0)},v=E=>{const R=c.get(i);R?R.push(E):c.set(i,[E])},B=E=>{const R=fe(E);!R||w(R)||h>0&&(h-=1,C??=n.replace(/\s+/g,""),C.includes(R.replace(/\s+/g,"")))||v(E.trim())},H=e.getSectionCount();for(let E=0;E<H;E++){const R=e.getParagraphCount(E);for(let $=0;$<R;$++){const j=e.getParagraphLength(E,$);j>0&&!o.has(`${E}/${$}`)&&B(e.getTextRange(E,$,0,j));const Y=O(e.getControlTextPositions(E,$)).length;for(let q=0;q<Y;q++){let de;try{de=O(e.getTableDimensions(E,$,q))}catch{continue}const se=[];for(let Q=0;Q<de.cellCount;Q++){const we=e.getCellParagraphCount(E,$,q,Q);for(let ve=0;ve<we;ve++){if(o.has(`${E}/${$}/${q}.${Q}.${ve}`))continue;const ct=e.getCellParagraphLength(E,$,q,Q,ve);ct>0&&se.push(e.getTextInCell(E,$,q,Q,ve,0,ct))}}const Ee=se.some(Q=>{const we=r.get(fe(Q));return!!we&&(l.get(fe(Q))??0)<we.length});for(const Q of se)Ee?B(Q):fe(Q)&&v(Q.trim())}}}if(c.size===0)return t.join(`
`);const F=[...c.get(-1)??[]];return t.forEach((E,R)=>{F.push(E);const $=c.get(R);$&&F.push(...$)}),F.join(`
`)}function Tl(e){const n=[],t=e.getSectionCount();for(let o=0;o<t&&n.length<Xe;o++){const l=e.getParagraphCount(o);for(let c=0;c<l&&n.length<Xe;c++){let i;try{i=O(e.getControlTextPositions(o,c))}catch{continue}for(let h=0;h<i.length;h++){let C;try{C=e.getControlImageMime(o,c,"[]",h)}catch{continue}C.startsWith("image/")&&n.push(Pr(e,o,c,h,i[h],C))}}}if(n.length>=Xe)return n;const{tables:r}=oe(e);return r.forEach((o,l)=>{if(!(n.length>=Xe))for(let c=0;c<o.cells;c++){let i;try{i=e.getCellParagraphCountByPath(o.sec,o.para,JSON.stringify(ne(o.path,c,0)))}catch{continue}for(let h=0;h<i&&n.length<Xe;h++){const C=ne(o.path,c,h);for(let w=0;w<Jo;w++){let v;try{v=e.getControlImageMime(o.sec,o.para,JSON.stringify(C),w)}catch{continue}v.startsWith("image/")&&n.push(Pr(e,o.sec,o.para,w,0,v,{table:l+1,cell:c,cellPath:C}))}}}}),n}function Pr(e,n,t,r,o,l,c=null){let i="";try{if(c){const C=JSON.stringify(c.cellPath),w=e.getCellParagraphLengthByPath(n,t,C);w>0&&(i=ee(fe(e.getTextInCellByPath(n,t,C,0,Math.min(w,tt*2))),tt*2))}else{const C=e.getParagraphLength(n,t),w=Math.max(0,o-tt),v=Math.min(C-w,tt*2);v>0&&(i=ee(fe(e.getTextRange(n,t,w,v)),tt*2))}}catch{}let h=null;try{const C=O(e.getPageOfPosition(n,t));if(C.ok&&Number.isInteger(C.page)){const w=O(e.getPageInfo(C.page));h=Number.isInteger(w.pageNumber)?w.pageNumber:C.page+1}}catch{}return{sec:n,para:t,control:r,offset:o,mime:l,near:i,page:h,table:c?c.table:null,cellPath:c?c.cellPath:null}}function Ml(e){let n="";for(let r=0;r<e.length;r+=32768)n+=String.fromCharCode.apply(null,e.subarray(r,r+32768));return btoa(n)}const ne=(e,n,t)=>[...e.slice(0,-1),{controlIndex:e[e.length-1].controlIndex,cellIndex:n,cellParaIndex:t}],We=(e,n,t)=>[e,n,...t.slice(0,-1).map(r=>`${r.controlIndex}.${r.cellIndex}.${r.cellParaIndex}`),t[t.length-1].controlIndex].join("/");function oe(e){const n=[];let t=Ia;const r=(c,i,h)=>{try{return O(e.getTableDimensionsByPath(c,i,JSON.stringify(h)))}catch{return null}},o=(c,i,h,C,w,v)=>{const B=n.length;if(n.push({sec:c,para:i,path:h,rows:C.rowCount,cols:C.colCount,cells:C.cellCount,parent:w}),!(v>=Ca))for(let H=0;H<C.cellCount&&t>0;H++){const F=e.getCellParagraphCountByPath(c,i,JSON.stringify(ne(h,H,0)));for(let E=0;E<F&&t>0;E++)for(let R=0;R<pn;R++){t-=1;const $=[...ne(h,H,E),{controlIndex:R,cellIndex:0,cellParaIndex:0}],j=r(c,i,$);j&&o(c,i,$,j,B,v+1)}}},l=e.getSectionCount();for(let c=0;c<l;c++){const i=e.getParagraphCount(c);for(let h=0;h<i;h++){const C=O(e.getControlTextPositions(c,h)).length;for(let w=0;w<C;w++){const v=[{controlIndex:w,cellIndex:0,cellParaIndex:0}],B=r(c,h,v);B&&o(c,h,v,B,null,1)}}}return{tables:n,partial:t<=0}}function Or(e,n){const{tables:t}=oe(e),r=Number.isInteger(n)?t[n-1]:void 0;return r?r.path.length>1?{refusal:{ok:!1,reason:"unsupported_place"}}:{table:r,grid:ae(e,r)}:{refusal:{ok:!1,reason:"no_such_table",count:t.length}}}function ae(e,n){const t=[];for(let r=0;r<n.cells;r++){const o=O(e.getCellInfoByPath(n.sec,n.para,JSON.stringify(ne(n.path,r,0))));t.push({cell:r,row:o.row,col:o.col,rowSpan:o.rowSpan||1,colSpan:o.colSpan||1})}return t}const re=(e,n,t)=>le(e,{sec:n.sec,para:n.para,cellPath:ne(n.path,t,0)}),Et=e=>Xo.includes(e)||hn.includes(e);function vr(e){const n=new Map;for(const t of O(e.getBulletList()))Number.isInteger(t.id)&&typeof t.char=="string"&&n.set(t.id,t.char);return n}function oo(e,n,t,r){if(n.path.length>1)return[];const o=n.path[0].controlIndex,l=e.getCellParagraphCountByPath(n.sec,n.para,JSON.stringify(ne(n.path,t,0))),c=[];for(let i=0;i<l;i++){let h;try{h=O(e.getCellParaPropertiesAt(n.sec,n.para,o,t,i))}catch{continue}if(h.headType!=="Bullet")continue;const C=r.get(h.numberingId)??"";Et(C)&&c.push({k:i,char:C,checked:hn.includes(C)})}return c}function Pl(e){const n=[];for(let t=0;t<e.length;t++){const r=[...e[t]];for(let o=0;o<r.length;o++){if(!Et(r[o]))continue;let l=o+1;for(;l<r.length&&!Et(r[l]);)l++;let c=r.slice(o+1,l).join("").trim();if(!c){let i=o-1;for(;i>=0&&!Et(r[i]);)i--;c=r.slice(i+1,o).join("").trim()}n.push({kind:"text",k:t,offset:o,label:ee(c,Vr),checked:hn.includes(r[o])})}}return n}function Ol(e,n,t,r,o){return[...oo(e,n,t,o).map(c=>({kind:"bullet",k:c.k,label:ee((r[c.k]??"").trim(),Vr),checked:c.checked})),...Pl(r)]}function vl(e,n){if(e.length===0)return{};const t=typeof n=="string"?n.trim():"";if(!t)return e.length===1?{box:e[0]}:{choices:e.map(l=>l.label).filter(Boolean)};const r=e.filter(l=>l.label===t);if(r.length===1)return{box:r[0]};const o=e.filter(l=>l.label!==""&&(l.label.includes(t)||t.includes(l.label)));return o.length===1?{box:o[0]}:{choices:e.map(l=>l.label).filter(Boolean)}}function Me(e){const n=[],t=e.count();for(let r=0;r<t;r++)n.push(e.text(r,e.length(r)));return n}function ao(e,n,t){try{const r=e.getParagraphLength(n,t);return r<=0?"":lo(e.getTextRange(n,t,0,r))}catch{return""}}function lo(e){return String(e).replace(/[\u0000-\u001f]/g," ").replace(/\s+/g," ").trim()}function Rr(e,n,t,r){const o=r(n,t);if(o)return o;for(let l=t-1;l>=0;l--){const c=r(n,l);if(c)return c}return""}function Rl(e){const n=e&&Array.isArray(e.fontFamilies)?e.fontFamilies:[];return(typeof n[0]=="string"?n[0]:"").trim()}function Ll(e){const n=new Map,t=[],r=[],o=[],l=new Map;let c=!1,i=0,h=0;const C=(E,R)=>{const $=`${E}:${R}`;let j=l.get($);return j===void 0&&(j=ao(e,E,R),l.set($,j)),j},w=(E,R)=>{const $=E&&E.charShapeId!=null?String(E.charShapeId):"",j=Array.isArray(E&&E.fontFamilies)?E.fontFamilies.filter(q=>typeof q=="string"&&q.trim()!==""):typeof(E&&E.fontFamily)=="string"&&E.fontFamily.trim()!==""?[E.fontFamily]:[];let Y=n.get($);Y||(Y={id:$,fonts:[...new Set(j)],uses:0},n.set($,Y)),Y.uses+=1,Y.first||(Y.first=R)},v=(E,R,$)=>{for(const j of Array.isArray(E)?E:[]){if(i>=Bt){c=!0;return}i+=1;try{w(O(R(j.startOffset??0)),$)}catch{}}},B=e.getSectionCount();for(let E=0;E<B;E++){const R=e.getParagraphCount(E);for(let $=0;$<R;$++){if(t.length>=Tn){c=!0;break}t.push({index:$,section:E,text:C(E,$)});let j;try{j=e.getParagraphLength(E,$)}catch{j=0}if(j<=0)continue;let Y;try{Y=O(e.getCharShapeRuns(E,$,0,j))}catch{Y=[]}v(Y,q=>e.getCharPropertiesAt(E,$,q),{section:E,para:$})}if(t.length>=Tn)break}const H=oe(e);H.partial&&(c=!0),H.tables.length>Mn&&(c=!0);for(const E of H.tables.slice(0,Mn)){const R=[];try{for(const j of ae(e,E)){if(R.length>=Bo){c=!0;break}R.push({row:j.row,col:j.col,rowSpan:j.rowSpan,colSpan:j.colSpan})}}catch{}const $={index:r.length,anchor:{section:E.sec,para:E.para,path:E.path},rows:E.rows,cols:E.cols,titleAbove:E.parent===null?Rr(e,E.sec,E.para,C):"",nested:E.parent!==null,cells:R};if(E.rows===1&&E.cols===1&&R[0])try{const j=ne(E.path,0,0),Y=e.getCellParagraphLengthByPath(E.sec,E.para,JSON.stringify(j)),q=Y>0?e.getTextInCellByPath(E.sec,E.para,JSON.stringify(j),0,Y):"";R[0].text=lo(q).slice(0,80)}catch{}r.push($);for(let j=0;j<E.cells&&i<Bt&&h<Pn;j++){let Y;try{Y=e.getCellParagraphCountByPath(E.sec,E.para,JSON.stringify(ne(E.path,j,0)))}catch{continue}for(let q=0;q<Y&&i<Bt;q++){if(h>=Pn){c=!0;break}h+=1;const de=ne(E.path,j,q),se=JSON.stringify(de);let Ee;try{Ee=e.getCellParagraphLengthByPath(E.sec,E.para,se)}catch{Ee=0}if(Ee<=0)continue;let Q;try{Q=O(e.getCharShapeRunsInCellByPath(E.sec,E.para,se,0,Ee))}catch{Q=[]}v(Q,we=>e.getCellCharPropertiesAtByPath(E.sec,E.para,se,we),{section:E.sec,para:E.para,path:de})}}}for(let E=0;E<e.getSectionCount();E++){const R=e.getParagraphCount(E);for(let $=0;$<R&&o.length<Dt;$++){let j;try{j=O(e.getControlTextPositions(E,$))}catch{j=[]}for(let Y=0;Y<j.length&&!(o.length>=Dt);Y++){let q;try{q=e.getControlImageMime(E,$,"[]",Y)}catch{continue}q.startsWith("image/")&&o.push({index:o.length,anchor:{section:E,para:$},titleAbove:Rr(e,E,$,C)})}}}o.length>=Dt&&(c=!0);const F={charShapes:[...n.values()],paragraphs:t,tables:r,pictures:o};return c&&(F.truncated=!0),F}function so(e,n,t,r){const o=ne(n.path,t,r);return ie(e).filter(l=>{if(l.place!=="tableCell")return!1;const c=Zr(l);return!!(c&&c.length===o.length&&c.every((i,h)=>i.controlIndex===o[h].controlIndex&&i.cellIndex===o[h].cellIndex&&i.cellParaIndex===o[h].cellParaIndex))}).length}function io(e,n,t,r,o){let l=0,c=0;const i=Math.min(Aa,o+pn);for(let h=0;h<i;h++){const C=[...ne(n.path,t,r),{controlIndex:h,cellIndex:0,cellParaIndex:0}];try{e.getTableDimensionsByPath(n.sec,n.para,JSON.stringify(C)),l+=1,c+=1}catch(w){if(String(w).includes(qr))break;l+=1}}return{controls:l,tables:c}}function At(e,n,t){const r=e.getCellParagraphCountByPath(n.sec,n.para,JSON.stringify(ne(n.path,t,0)));for(let o=0;o<r;o++){const l=so(e,n,t,o),{controls:c}=io(e,n,t,o,l);if(c>l)return!0}return!1}function $l(e,n,t){const r=e.getCellParagraphCountByPath(n.sec,n.para,JSON.stringify(ne(n.path,t,0)));for(let o=0;o<r;o++){const l=so(e,n,t,o),{controls:c,tables:i}=io(e,n,t,o,l);if(c-i-l>0)return!0}return!1}function Bl(e,n,t,r){const o=[...r,{controlIndex:0,cellIndex:0,cellParaIndex:0}];try{return e.getTableDimensionsByPath(n,t,JSON.stringify(o)),!0}catch(l){return!String(l).includes(qr)}}function Ct(e,n){const t=new Set;let r;try{r=O(e.getTableCellBboxesByPath(n.sec,n.para,JSON.stringify(n.path)))}catch{return t}const o=new Map;for(const l of r){if(!Number.isInteger(l.pageIndex))continue;const c=o.get(l.pageIndex);c?c.push(l):o.set(l.pageIndex,[l])}for(const[l,c]of o){let i;try{i=O(e.getPageControlLayout(l)).controls??[]}catch{continue}for(const h of i){if(!zo.has(h.type)||h.wrap==="behindText")continue;const C=h.x+h.w/2,w=h.y+h.h/2,v=c.find(B=>C>=B.x&&C<=B.x+B.w&&w>=B.y&&w<=B.y+B.h);v&&t.add(v.cellIdx)}}return t}const ee=(e,n)=>Wr(e)>n?`${Ve(e,0,n)}…`:e;function Tt(e){return O(e.getFieldList()).filter(n=>n.fieldType!=="memo"&&(n.cellField===!0||n.fieldType==="clickhere"))}function Wt(e){const n=new Map;return Tt(e).forEach((t,r)=>{if(t.cellField===!0)return;const o=t.location,l=o&&Array.isArray(o.path)?o.path:[];if(l.length===0||l.some(w=>w.type!=="cell"))return;const c=l.map(w=>({controlIndex:w.controlIndex,cellIndex:w.cellIndex,cellParaIndex:w.paraIndex})),i=`${We(o.sectionIndex,o.paraIndex,c)}:${c[c.length-1].cellIndex}`,h={number:r+1,key:it(t),fieldId:t.fieldId,value:t.value??"",guide:t.guide??""},C=n.get(i);C?C.push(h):n.set(i,[h])}),n}const Dl=e=>e.value===""||e.value===e.guide;function Gl(e){if(!Array.isArray(e)||e.length===0||e.length>Ln)throw _("BAD_ARGUMENT",`cells must be a list of 1 to ${Ln} entries`);return e.map(n=>{const{row:t,col:r,text:o}=n??{};if(!Number.isInteger(t)||t<1||!Number.isInteger(r)||r<1)throw _("BAD_ARGUMENT","row and col count from 1 and are whole numbers");if(typeof o!="string")throw _("BAD_ARGUMENT","the text of a cell must be a string");const l=o.split(/\r?\n/);if(l.length>$n||l.some(c=>he.test(c)))throw _("BAD_ARGUMENT",`a cell takes plain text of at most ${$n} lines`);return{row:t,col:r,lines:l}})}function Ul(e){if(!Array.isArray(e)||e.length===0||e.length>Un)throw _("BAD_ARGUMENT",`cells must be a list of 1 to ${Un} entries`);return e.map(n=>{const{row:t,col:r,choice:o}=n??{};if(!Number.isInteger(t)||t<1||!Number.isInteger(r)||r<1)throw _("BAD_ARGUMENT","row and col count from 1 and are whole numbers");if(o!=null&&(typeof o!="string"||o.trim()===""||he.test(o)))throw _("BAD_ARGUMENT","choice must be one line of the words beside the box");return{row:t,col:r,choice:typeof o=="string"?o:null}})}function Lr(e,n,t){if(e!=="rows"&&e!=="columns")throw _("BAD_ARGUMENT",'what must be "rows" or "columns"');if(!Number.isInteger(n)||n<1)throw _("BAD_ARGUMENT","at counts from 1 and is a whole number");if(!Number.isInteger(t)||t<1||t>Gn)throw _("BAD_ARGUMENT",`count must be between 1 and ${Gn}`);return e==="rows"}function Le(e,n){return e.length===0?{reason:"not_found"}:n==null?e.length===1?{hit:e[0]}:{reason:"ambiguous"}:!Number.isInteger(n)||n<1||n>e.length?{reason:"no_such_occurrence"}:{hit:e[n-1]}}const Fl=200,Hl=500,$r=20,jl=30,yn=["footnote","endnote"],Jl=new Set(["fn","en"]),Xl=2,zl=e=>JSON.parse(e.replace(/[\u0000-\u001f]/g,n=>`\\u${n.charCodeAt(0).toString(16).padStart(4,"0")}`));function at(e){const n=O(e.getControls()).filter(l=>Jl.has(l.ctrlId)),t=[];if(n.length===0)return{notes:t,elsewhere:0};const r=n.filter(l=>l.list===0),o=e.getSectionCount();for(let l=0;l<o;l++){const c=e.getParagraphCount(l);for(let i=0;i<c&&t.length<n.length;i++)O(e.getControlTextPositions(l,i)).forEach((C,w)=>{let v;try{v=zl(e.getFootnoteInfo(l,i,w))}catch{return}if(!v.ok)return;let B=null,H=Xl;try{const R=O(e.getNoteEditInfo(l,i,w));B=R.kind,Number.isInteger(R.charOffset)&&(H=R.charOffset)}catch{const R=r[t.length];R&&R.para===i&&R.controlIndex===w&&(B=R.ctrlId==="en"?"endnote":"footnote")}const F=Array.isArray(v.texts)?v.texts:[],E=v.numberSlot!==-1;E||(H=0),t.push({sec:l,para:i,control:w,offset:C,kind:B==="endnote"?"endnote":"footnote",number:v.number,prefix:H,numbered:E,lines:F.map((R,$)=>$===0?R.slice(H):R),plain:F.reduce((R,$)=>R+$.length,0)===v.totalTextLen})})}return{notes:t,elsewhere:Math.max(0,n.length-t.length)}}function Kl(e,n){const t=Math.max(0,n.offset-jl);return n.offset>t?e.getTextRange(n.sec,n.para,t,n.offset-t):""}function Br(e){if(typeof e!="string"||e.trim()==="")throw _("BAD_ARGUMENT","the note text must be a non-empty string");const n=e.split(`
`);if(n.length>$r)throw _("BAD_ARGUMENT",`a note takes at most ${$r} paragraphs`);for(const t of n)if(he.test(t))throw _("BAD_ARGUMENT","the note text holds a control character");return n}function Dr(e,n,t,r){const{sec:o,para:l,control:c}=n;let i=t;r.forEach((h,C)=>{if(C>0){const w=C-1===0?i+1:i;U(e.splitParagraphInFootnote(o,l,c,C-1,w),"split the note"),i=0}h&&U(e.insertTextInFootnote(o,l,c,C,i,h),"write the note"),i+=h.length})}const Vt=e=>({kind:e.kind,number:e.number}),Gr=100,Ur=3,Wl=120,co=14,fn=45,Vl="border:none;padding:1.41pt 5.1pt",Yl=24,ql=40,Zl=/^\s*(\d+)\s*$/,Fr=(e,n,t)=>{const r=e.getParagraphLength(n,t);return r>0?e.getTextRange(n,t,0,r):""};function Hr(e,n,t){const r=O(e.getPageOfPosition(n,t));if(!r.ok||!Number.isInteger(r.page))throw _("ENGINE","could not find the page of a heading");const o=O(e.getPageInfo(r.page));return Number.isInteger(o.pageNumber)?o.pageNumber:r.page+1}function Ql(e,n){const t=O(e.getPageDef(n)),r=(t.landscape?t.height:t.width)-t.marginLeft-t.marginRight;return Math.max(100,Math.round((r-(t.marginGutter??0))/100))}function es(e){if(!Array.isArray(e)||e.length===0||e.length>Gr)throw _("BAD_ARGUMENT",`entries must list 1 to ${Gr} headings`);for(const n of e){if(!n||typeof n.find!="string"||n.find.length===0)throw _("BAD_ARGUMENT","each entry needs the text of its heading");if(!Number.isInteger(n.level)||n.level<1||n.level>Ur)throw _("BAD_ARGUMENT",`each entry needs a level from 1 to ${Ur}`)}}function ts(e,n,t){const r=[n.family?`font-family:${n.family};mso-fareast-font-family:${n.family}`:"",`font-size:${n.points}pt`].filter(Boolean).join(";"),o=Math.max(50,t-fn),l=Vl,c=({text:i,level:h,page:C})=>`<tr><td style="${l};width:${o}pt"><p style="margin-left:${(h-1)*co}pt"><span style="${r}">${un(i)}</span></p></td><td style="${l};width:${fn}pt"><p style="text-align:right"><span style="${r}">${C}</span></p></td></tr>`;return`<table>${e.map(c).join("")}</table>`}const ns=e=>e.codePointAt(0)>11903?1:.55;function rs(e,n,t,r){const o=(r-fn-(n-1)*co-Yl)/t.points;let l=0,c="";for(const i of e){if(l+=ns(i),l>o-1)return`${c.trimEnd()}…`;c+=i}return c}const Yt=(e,n,t)=>e.find(r=>r.row===n&&r.col===t);function jr(e,n,t,r){const o=re(e,n,t),l=o.length(0);l>0&&o.deleteText(0,l),o.insert(0,r)}const uo=75,os=2,as=.5,ls=5e3,Jr=0,ss=1;function is(e,n,t,r,o){const l=r.length===0?O(e.getControlTextPositions(n,t)).length:pn;let c=0;for(let i=0;i<l;i++){const h=[...r,{controlIndex:i,cellIndex:0,cellParaIndex:0}];let C=null;try{C=O(e.getTableDimensionsByPath(n,t,JSON.stringify(h)))}catch{}if(C&&c++===o)return{control:i,cells:C.cellCount}}return null}function cs(e,n){const{sec:t,para:r}=n;if(n.cells.length===0)return{length:e.getParagraphLength(t,r),text:i=>e.getTextRange(t,r,0,i),rect:i=>O(e.getCursorRect(t,r,i)),props:()=>O(e.getParaPropertiesAt(t,r))};let o=[];for(const i of n.cells){const h=is(e,t,r,o,i.table);if(!h||i.cell>=h.cells)return null;o=[...o,{controlIndex:h.control,cellIndex:i.cell,cellParaIndex:0}];const C=e.getCellParagraphCountByPath(t,r,JSON.stringify(o));if(i.para>=C)return null;o[o.length-1].cellParaIndex=i.para}const l=JSON.stringify(o),c=o[o.length-1];return{length:e.getCellParagraphLengthByPath(t,r,l),text:i=>e.getTextInCellByPath(t,r,l,0,i),rect:i=>O(e.getCursorRectByPath(t,r,l,i)),props:()=>o.length===1?O(e.getCellParaPropertiesAt(t,r,c.controlIndex,c.cellIndex,c.cellParaIndex)):null}}function us(e,n,t){if(!e)return{type:Jr,fill:0};const r=i=>(Number(i)||0)/os/uo,o=r(e.indent),l=n-r(e.marginLeft)-Math.max(o,0),c=t-l;for(const i of e.tabStops??[])if(r(i.position)>c+as)return{type:Number(i.type)||0,fill:Number(i.fill)||0};return e.tabAutoRight?{type:ss,fill:0}:{type:Jr,fill:0}}function fs(e,n){const t=cs(e,n);if(!t||t.length<=0)return null;const r=t.text(t.length),o=[];for(let B=r.indexOf("	");B>=0;B=r.indexOf("	",B+1))o.push(B);if(o.length!==n.tabs||n.tab>=o.length)return null;const l=o[n.tab],c=t.rect(l),i=t.rect(l+1);if(c.pageIndex!==i.pageIndex||Math.abs(c.y-i.y)>1)return null;const h=Math.round((i.x-c.x)*uo);if(!(h>0))return null;const C=t.rect(0),{type:w,fill:v}=us(t.props(),C.x,c.x);return{width:h,type:w,fill:v}}function Xr(e,n){const t=Math.min(Math.max(0,Number.isInteger(e.offset)?e.offset:0),n),r=Number.isInteger(e.length)?e.length:0;return r>0?[t,Math.min(n,t+r)]:[0,n]}function hs(e,n){const{sec:t,para:r}=n;if(t>=e.getSectionCount())return[];const o=Array.isArray(n.path)&&n.path.length>0?n.path:null;if(!o){if(r>=e.getParagraphCount(t))return[];const[C,w]=Xr(n,e.getParagraphLength(t,r)),v=w>C?O(e.getSelectionRects(t,r,C,r,w)):[];if(v.length>0)return v;const B=[],H=O(e.getControlTextPositions(t,r)).length;for(let F=0;F<H;F++)try{B.push(O(e.getTableBBox(t,r,F)))}catch{}return B}const l=JSON.stringify(o),c=o[o.length-1].cellParaIndex,[i,h]=Xr(n,e.getCellParagraphLengthByPath(t,r,l));return h>i?O(e.getSelectionRectsInCellByPath(t,r,l,c,i,c,h)):[]}function zr(e){const n=[],t=e.getSectionCount();for(let r=0;r<t;r++)n.push(e.getParagraphCount(r));return n}function ds(e,n,t,r){return e.flatMap(o=>{const l=(t[o.sec]??0)-(n[o.sec]??0);return l===0||!r||r.sec!==o.sec?[o]:l>0?[o.para>=r.para?{...o,para:o.para+l}:o]:o.para<r.para?[o]:o.para<r.para-l?[]:[{...o,para:o.para+l}]})}const gs=new Set(["input-handler-resumable-pagination"]);function qt(e,n){let t=!1;const r=e.events.on("document-mutated",l=>{gs.has(l)||(t=!0,queueMicrotask(()=>{t=!1}),n())}),o=e.events.on("document-changed",()=>{if(t){t=!1;return}n()});return()=>{for(const l of[r,o])try{typeof l=="function"&&l()}catch{}}}let Ue=null,xe=null,Fe=null,ce=null,Pe=null,He=null,je=null,kt=null,$e=null,Je=null;function Kr(e,n){const t=e.canvasMetricsActive?.()??!1;t&&e.selectCanvasMetrics(!1);try{return n()}finally{t&&e.selectCanvasMetrics(!0)}}const bs={id:Ro,apiVersion:1,deactivate(){Ue&&Ue(),Ue=null,Fe&&Fe(),Fe=null,ce&&ce(),ce=null,Pe&&Pe(),Pe=null,He&&He(),He=null,je&&je(),je=null,kt&&kt(),kt=null,$e&&clearTimeout($e),$e=null,Je&&clearTimeout(Je),Je=null},activate(e){vo(),e.events.on("document-dirty-changed",a=>{globalThis.dispatchEvent?.(new CustomEvent(Wo,{detail:a?.dirty===!0}))});let n=0,t=!1,r=null,o=null,l=[],c=null,i=!1,h=null,C=null,w=0,v=!1;const B=`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;let H=null,F=null;const E=({notify:a=!1}={})=>{let s;try{s=e.read(ie)}catch{return null}if(!Array.isArray(s))return null;const f=c;if(c=s.map(jt),a&&f&&f.length>0){const p=new Set(s.map(A=>A.id)),d=f.filter(A=>!p.has(A.id));d.length>0&&ir(oa,{kind:"memo-removed",count:d.length,memos:d})}return s},R=()=>{try{e.automation.execute(Ht)}catch{}$e&&clearTimeout($e),$e=setTimeout(()=>{$e=null;try{e.automation.execute(Ht)}catch{}},Kn)},$=a=>{const s=globalThis.document,f=s?s.querySelector("#scroll-content"):null;if(!f)return;if(!i){ce&&ce(),ce=null;return}if(!C||C.parentElement!==f){ce&&ce(),C=s.createElement("div"),C.className="ieum-memo-anchors",C.style.cssText=`position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:${ha};`,f.appendChild(C);const x=globalThis.ResizeObserver,y=x?new x(()=>R()):null;y&&y.observe(f);const b=s.querySelector("#scroll-container");let S=null;const I=()=>{S||(S=setTimeout(()=>{S=null,R()},100))};b&&b.addEventListener("scroll",I,{passive:!0});const k=C;ce=()=>{y&&y.disconnect(),b&&b.removeEventListener("scroll",I),S&&clearTimeout(S),k.remove(),C===k&&(C=null)}}C.replaceChildren();const p=a&&a.getInputHandler?a.getInputHandler():null,d=p?p.virtualScroll:null,A=a&&a.getViewportManager?a.getViewportManager():null;if(!d||!A)return;let u;try{u=e.read(Jt)}catch{return}const g=A.getZoom(),m=f.clientWidth;for(const x of u){const y=h!==null&&x.id===h;for(const b of x.rects){const S=s.createElement("div"),I=b.width===0,k=d.getPageLeftResolved(b.pageIndex,m)+b.x*g,T=d.getPageOffset(b.pageIndex)+b.y*g;Object.assign(S.style,{position:"absolute",left:`${k.toFixed(2)}px`,top:`${T.toFixed(2)}px`,width:`${Math.max(I?ba:b.width*g,1).toFixed(2)}px`,height:`${Math.max(b.height*g,2).toFixed(2)}px`,background:y?pa:da,boxShadow:`inset 0 -${y?2:1}px 0 ${y?ma:ga}`,borderRadius:"2px"}),S.className=`ieum-memo-anchor${y?" selected":""}${I?" caret":""}`,C.appendChild(S)}}},j=()=>{c&&c.length>0?E({notify:!0}):Je||(Je=setTimeout(()=>{Je=null,E({notify:!1}),R()},xa)),R()};let Y=null,q=null;const de=a=>{const s=a&&a.getInputHandler?a.getInputHandler():null,f=s?s.cursor:null;if(!f)return{ok:!1,reason:"none"};try{if(f.isInHeaderFooter?.()||f.isInFootnote?.())return{ok:!1,reason:"unsupported_place"};if(f.isInPictureObjectSelection?.()||f.isInTableObjectSelection?.())return{ok:!1,reason:"unsupported_place"};if(f.isInCellSelectionMode?.())return{ok:!1,reason:"unsupported_place"}}catch{return{ok:!1,reason:"unsupported_place"}}let p;try{p=cr(a)}catch{return{ok:!1,reason:"unsupported_place"}}const d=p?p.start:f.getPosition?f.getPosition():null,A=p?p.end:d,u=De(d),g=De(A);if(!u||!g)return{ok:!1,reason:"unsupported_place"};if(u.sec!==g.sec)return{ok:!1,reason:"multi_paragraph"};if(u.path||g.path){if(!u.path||!g.path||!Mt(u,g,!0)||u.k!==g.k)return{ok:!1,reason:"multi_paragraph"}}else if(u.para!==g.para)return{ok:!1,reason:"multi_paragraph"};return e.read(m=>{try{if(bt(m))return{ok:!1,reason:"protected"};const x=u.path?u.textBox?"textBox":"tableCell":"body",y=le(m,{sec:u.sec,para:u.para,cellPath:u.path}),b=y.length(u.k),S=Math.max(0,Math.min(u.offset,b)),I=Math.max(S,Math.min(g.offset,b)),k=u.path??null,T=`${u.sec}:${u.para}:${Zt(k)}`;if(lr(ie(m),T,S,I))return{ok:!1,reason:"overlap"};const M=y.text(u.k,b),P=S<I?Ve(M,S,I):Ve(M,Math.max(0,S-Zn),Math.min(b,S+Zn)),G={place:x,sectionIndex:u.sec,paraIndex:u.para,startCharIdx:S,endCharIdx:I,path:k};return{ok:!0,...G,preview:ee(P.replace(/\s+/g," ").trim(),Yr),anchor:G}}catch{return{ok:!1,reason:"unsupported_place"}}})},se=a=>{const s=Pa(a);if(!s)throw a;return{ok:!1,reason:s.code}},Ee=a=>a.path?a.path[a.path.length-1].cellParaIndex:a.paraIndex,Q=(a,s,f)=>{try{return W(a,f,s)}catch(p){return se(p)}},we=a=>{if(v=a===!0,v){const s=globalThis.document;if(s&&!Pe){const f=d=>{v&&(d.preventDefault(),d.stopPropagation(),d.stopImmediatePropagation?.())},p=["keydown","beforeinput","paste","drop","pointerdown"];for(const d of p)s.addEventListener(d,f,!0);Pe=()=>{for(const d of p)s.removeEventListener(d,f,!0)}}}else Pe&&(Pe(),Pe=null);return{ok:!0,locked:v}},ve=()=>{je&&je();const a=globalThis.BroadcastChannel;if(a)try{const s=new a(ya);s.onmessage=f=>{const p=f?.data;!p||p.kind!=="memo-copied"||p.source!==B&&(!Number.isInteger(p.count)||p.count<1||typeof p.at!="number"||!Number.isFinite(p.at)||Date.now()-p.at>Qn||(!F||p.at>=F.at)&&(F={count:p.count,at:p.at,source:p.source}))},H=s,je=()=>{try{s.close()}catch{}H===s&&(H=null)}}catch{}},ct=()=>{try{Te=null,e.automation.execute(pt);const a=Te;if(!a){w=0,F=null;return}const s=De(a.start),f=De(a.end);if(w=s&&f?e.read(p=>Oa(p,s,f)):0,w===0){F=null;return}if(H)try{H.postMessage({kind:"memo-copied",count:w,at:Date.now(),source:B})}catch{}}catch{w=0}},wn=()=>{const a=w;w=0;const s=a<1&&F&&Date.now()-F.at<=Qn?F:null;F=null;const f=a>0?a:s?s.count:0;if(f<1)return;let p=0;try{p=e.read(d=>ie(d).length)}catch{return}setTimeout(()=>{try{e.read(A=>ie(A).length)-p<f&&ir(aa,{kind:"memo-not-copied",count:f}),E({notify:!1}),R()}catch{}},0)};{const a=globalThis.document;if(a){He&&He();const s=()=>ct();for(const f of["copy","cut"])a.addEventListener(f,s,!0);a.addEventListener("paste",wn,!0),He=()=>{for(const f of["copy","cut"])a.removeEventListener(f,s,!0);a.removeEventListener("paste",wn,!0)},ve()}}qt(e,()=>{r=null,o=null,t||(n+=1,l.length>0&&(l=[],ht()),j())});let ut=null;qt(e,()=>{ut&&clearTimeout(ut),ut=setTimeout(()=>{ut=null;const a=globalThis.document?.querySelector(Va);if(a)try{qa(a,e.read(s=>O(s.getStyleList())))&&e.automation.execute(xr)}catch{}},Ya)});let ge=null,ft=null;const ht=()=>{try{e.automation.execute(Ft)}catch{}ft&&clearTimeout(ft),ft=setTimeout(()=>{ft=null;try{e.automation.execute(Ft)}catch{}},Kn)},fo=a=>{const s=globalThis.document,f=s?s.querySelector("#scroll-content"):null;if(!f)return;if(!ge||ge.parentElement!==f){Fe&&Fe(),ge=s.createElement("div"),ge.className="ieum-change-marks",ge.style.cssText=`position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:${na};`,f.appendChild(ge);const x=globalThis.ResizeObserver,y=x?new x(()=>ht()):null;y&&y.observe(f);const b=ge;Fe=()=>{y&&y.disconnect(),b.remove(),ge===b&&(ge=null)}}if(ge.replaceChildren(),l.length===0)return;const p=a&&a.getInputHandler?a.getInputHandler():null,d=p?p.virtualScroll:null,A=a&&a.getViewportManager?a.getViewportManager():null;if(!d||!A)return;const u=A.getZoom(),g=f.clientWidth,m=e.read(x=>l.flatMap(y=>{try{return hs(x,y)}catch{return[]}}));for(const x of m){const y=s.createElement("div"),b=d.getPageLeftResolved(x.pageIndex,g)+x.x*u,S=d.getPageOffset(x.pageIndex)+x.y*u;Object.assign(y.style,{position:"absolute",left:`${b.toFixed(2)}px`,top:`${S.toFixed(2)}px`,width:`${(x.width*u).toFixed(2)}px`,height:`${(x.height*u).toFixed(2)}px`,background:ea,boxShadow:`inset 0 -2px 0 ${ta}`,borderRadius:"2px"}),ge.appendChild(y)}};try{e.automation.registerCommand({id:Ft,label:"Mark the changes",execute:a=>{try{fo(a)}catch{}}})}catch{}try{e.automation.registerCommand({id:xr,label:"Show the caret state",execute:a=>{try{a.getInputHandler()?.emitCursorFormatState()}catch{}}})}catch{}const ho=(a,s,f,p)=>{if(!s||s.ok===!1)return;const d=Array.isArray(s.marks)?s.marks:s.place?[s.place]:[];l=ds(l,f,p,s.shiftAt??d[0]??s.place??null),ra.has(a)||(l=[...l,...d].slice(0,qo)),E({notify:!1}),R(),ht()};let Ye=!1;try{e.automation.registerCommand({id:Hn,label:"Show a change",execute:(a,s)=>{try{Ye=va(a,s)}catch{Ye=!1}}})}catch{}let Te=null,In=null;try{e.automation.registerCommand({id:pt,label:"Read the selection",execute:a=>{try{Te=cr(a)}catch{Te=null}}})}catch{}let dt=null;try{e.automation.registerCommand({id:jn,label:"Count the characters",execute:a=>{try{const s=xo(a.wasm,{textOnly:!0});dt={chars:s.chars,charsNoSpace:s.charsNoSpace}}catch{dt=null}}})}catch{}const go=()=>{Te=null,e.automation.execute(pt);const a=Te;return a?e.read(s=>{const f=_o();return ur(s,a,f).ok?f.counts():null}):null};let vt=null,gt=null;const po=()=>{const a=globalThis.document;if(!Nn(a))return!1;if(gt)return gt.refresh(),!0;const s=Po({readTotal:()=>(dt=null,e.automation.execute(jn),dt),readSelection:go,render:(u,g)=>{const m=Nn(a);if(!m||!vt)return;const{text:x,title:y}=Eo(vt,u,g);m.textContent!==x&&(m.textContent=x),m.title!==y&&(m.title=y)}});gt=s;const f=qt(e,()=>s.documentChanged()),p=e.events.on("cursor-rect-updated",()=>s.selectionChanged()),d=e.events.on("document-swapped",()=>s.documentSwapped()),A=()=>s.selectionChanged();return a.addEventListener("keyup",A,!0),a.addEventListener("mouseup",A,!0),kt=()=>{s.stop(),a.removeEventListener("keyup",A,!0),a.removeEventListener("mouseup",A,!0),f();for(const u of[p,d])try{u?.()}catch{}gt=null},s.start(),!0},Rt=a=>e.read(s=>{const f=le(s,{sec:a.sec,para:a.para,cellPath:a.path});return f.text(a.k,f.length(a.k))});try{e.automation.registerCommand({id:Xn,label:"Select the word",execute:a=>{try{$a(a,Rt)}catch{}}})}catch{}try{e.automation.registerCommand({id:zn,label:"Select the paragraph",execute:a=>{try{Ba(a,Rt)}catch{}}})}catch{}try{e.automation.registerCommand({id:mt,label:"Select by words while dragging",execute:(a,s)=>{try{const f=s&&s.phase==="start"?"start":"move";xe=Da(a,Rt,xe,f)}catch{}}})}catch{}try{e.automation.registerCommand({id:Wn,label:"List the memos",execute:()=>{Y=e.read(Jt)}})}catch{}try{e.automation.registerCommand({id:Vn,label:"Read the memo selection",execute:a=>{q=de(a)}})}catch{}try{e.automation.registerCommand({id:Ht,label:"Draw the memo anchors",execute:a=>{try{$(a)}catch{}}})}catch{}try{e.automation.registerCommand({id:ca,label:"Lock the editor for a memo",execute:()=>we(!0)})}catch{}try{e.automation.registerCommand({id:ua,label:"Unlock the editor after a memo",execute:()=>we(!1)})}catch{}const pe=globalThis.document;if(pe){const a=m=>{const x=m.target;return!!(x&&x.closest&&x.closest("#scroll-container"))},s=(m,x)=>{try{e.automation.execute(m,x)}catch{}};let f=0;const p=m=>{m.defaultPrevented||!a(m)||xe&&xe.widened||s(Xn)},d=m=>{xe=null,!(m.button!==0||m.detail!==2)&&a(m)&&s(mt,{phase:"start"})},A=m=>{!xe||(m.buttons&1)===0||f||(f=globalThis.requestAnimationFrame(()=>{f=0,xe&&s(mt,{phase:"move"})}))},u=()=>{xe&&setTimeout(()=>{xe&&xe.widened&&s(mt,{phase:"move"})},0)},g=m=>{m.button!==0||m.detail!==3||m.defaultPrevented||a(m)&&s(zn)};Ue&&Ue(),pe.addEventListener("dblclick",p),pe.addEventListener("mousedown",d),pe.addEventListener("mousemove",A),pe.addEventListener("mouseup",u),pe.addEventListener("click",g),Ue=()=>{pe.removeEventListener("dblclick",p),pe.removeEventListener("mousedown",d),pe.removeEventListener("mousemove",A),pe.removeEventListener("mouseup",u),pe.removeEventListener("click",g),f&&globalThis.cancelAnimationFrame(f),xe=null}}const D=a=>(...s)=>{try{return a(...s)}catch(f){throw ar(f)}},W=(a,s,f)=>{const p=f?.allowMemoRemoval===!0||f?.memoPolicy==="allow",d=Array.isArray(f?.approvedMemoIds)?new Set(f.approvedMemoIds):null;t=!0,r=null,o=null;try{let A;try{A=e.transaction(a,u=>{u.deferPagination();const g=u.doc(),m=zr(g),x=Yn.has(a)||p?null:ie(g),y=s(g);if(x&&x.length>0){const b=new Set(ie(g).map(I=>I.id)),S=x.filter(I=>!b.has(I.id)&&!(d&&d.has(I.id)));if(S.length>0){const I=_("MEMO_REMOVAL_REQUIRES_APPROVAL","the change would remove memos of the document");throw I.memos=S,I}}return{result:y,before:m,after:zr(g)}})}catch(u){if(u&&u.code==="MEMO_REMOVAL_REQUIRES_APPROVAL")return E({notify:!1}),R(),{ok:!1,reason:"memo_removal_requires_approval",count:u.memos.length,memos:u.memos.map(jt)};throw u}if(ho(a,A.result,A.before,A.after),Yn.has(a)&&(n+=1),A.result&&typeof A.result=="object"&&("marks"in A.result||"shiftAt"in A.result)){const{marks:u,shiftAt:g,...m}=A.result;return m}return A.result}finally{t=!1}},Re=(a,s)=>s.slice(0,Lo).map((f,p)=>Fa(a,f,p)),An=(a,s,f)=>{const p=a.objectPositions(a.index);if(s==="before")return p.length>0?{refusal:{ok:!1,reason:"has_objects",count:f}}:{box:a};const d=p.some(A=>A>=a.length(a.index));return{box:a,plain:d}},qe=(a,s,f)=>{f?a.addAfter(s):a.split(s,a.length(s))},mo=(a,s,f)=>{const p=s.index;if(s.inTable||f||p+1>=s.count()||s.objectPositions(p+1).length>0)return!1;const{sec:d}=s.place(p,0);try{const A=O(a.getCharPropertiesAt(d,p,s.length(p))),u=O(a.getCharPropertiesAt(d,p+1,0)),g=m=>O(a.getParaPropertiesAt(d,m)).headType==="Outline";return A.fontSize>u.fontSize||A.fontSize===u.fontSize&&A.bold&&!u.bold||g(p)&&!g(p+1)}catch{return!1}},me=(a,s,f,p)=>{if(p==="end"){const g=a.getSectionCount()-1;return An(le(a,{sec:g,para:a.getParagraphCount(g)-1}),p,1)}const d=be(a,s),A=Le(d,f),u=A.hit?ue(A.hit)?null:"unsupported_place":A.reason;return u?{refusal:{ok:!1,reason:u,count:d.length,...u==="ambiguous"?{matches:Re(a,d)}:{}}}:An(le(a,A.hit),p,d.length)},Z=a=>{let s=!1;const f=(p,d)=>{if(!(p.controls===d.controls&&p.fields===d.fields))throw s=!0,_("HAS_OBJECTS","the change would remove an object of the document")};try{return a(f)}catch(p){if(s)return{ok:!1,reason:"has_objects",count:1};throw p}};try{E({notify:!1})}catch{}const Lt=()=>e.read(a=>(o??=Tl(a),o)),Ze={foreignChanges:()=>n,readText:D(()=>(r??=e.read(El),r)),listPictures:D(()=>{const a=Lt();return{count:a.length,limited:a.length>=Xe,pictures:a.map((s,f)=>({picture:f+1,type:s.mime,page:s.page,near:s.near,table:s.table}))}}),readPicture:D(a=>{if(!Number.isInteger(a)||a<1)throw _("BAD_ARGUMENT","picture must be a positive integer from listPictures");const s=Lt()[a-1];return s?e.read(f=>{const p=f.getControlImageData(s.sec,s.para,JSON.stringify(s.cellPath??[]),s.control);return p.length>jo?{ok:!1,reason:"too_large",bytes:p.length}:{ok:!0,mime:s.mime,base64:Ml(p)}}):{ok:!1,reason:"no_such_picture",count:Lt().length}}),documentProfile:D(()=>e.read(Ll)),findText:D(a=>e.read(s=>{const f=be(s,a);return{count:f.length,matches:Re(s,f)}})),replaceText:D((a,s,f,p)=>{ot(s);const d=e.read(A=>{const u=be(A,a),g=Le(u,f);if(g.hit&&ue(g.hit))return null;const m=g.hit?"unsupported_place":g.reason;return{ok:!1,reason:m,count:u.length,...m==="ambiguous"?{matches:Re(A,u)}:{}}});return d||W("replace",A=>{const u=be(A,a),{hit:g}=Le(u,f);if(!g||!ue(g))throw _("CHANGED","the document changed mid-call");return xt(A,g,s),{ok:!0,count:u.length,inTable:!!g.cellContext,place:nt(g,s.length)}},p)}),replaceAllText:D((a,s,f)=>(ot(s),e.read(d=>be(d,a).filter(ue).length)===0?{ok:!1,reason:"not_found",count:0}:W("replace-all",d=>{const A=be(d,a).filter(ue).reverse();for(const m of A)xt(d,m,s);const u=new Map,g=[...A].reverse().map(m=>{const x=JSON.stringify([m.sec,m.para,Oe(m)]),y=u.get(x)??0;return u.set(x,y+s.length-m.length),nt({...m,charOffset:m.charOffset+y},s.length)});return{ok:!0,count:A.length,place:nt(A[A.length-1],s.length),marks:g}},f))),insertParagraphs:D((a,s,f,p,d)=>{It(f),yl(p);const A=e.read(u=>me(u,a,s,f).refusal??null);return A||Z(u=>W("insert-paragraphs",g=>{const{box:m,plain:x}=me(g,a,s,f);if(!m)throw _("CHANGED","the document changed mid-call");const y=X(g),b=[...p];let S=m.index;if(f==="before"){m.split(S,0);const T=b.shift();T&&m.insert(S,T)}const I=f==="after"&&mo(g,m,x);for(const T of b)I&&S===m.index?m.split(S+1,0):qe(m,S,x&&S===m.index),S+=1,T&&m.insert(S,T);u(y,X(g));const k=f==="before"?m.index:m.index+1;return{ok:!0,count:p.length,inTable:m.inTable,place:m.place(k,p[0].length),marks:p.map((T,M)=>m.place(k+M,T.length))}},d))}),deleteParagraph:D((a,s,f)=>{const p=Array.isArray(f?.protectTexts)?new Set(f.protectTexts.filter(A=>typeof A=="string").map(fe).filter(Boolean)):null,d=e.read(A=>{const{box:u,refusal:g}=me(A,a,s,"after");if(!u)return g;if(p){const x=u.text(u.index,u.length(u.index));if(p.has(fe(x)))return{ok:!1,reason:"protected",count:1,text:x.slice(0,Se)}}return u.index>0&&u.count()>1&&u.objectPositions(u.index).length>0?{ok:!1,reason:"has_objects",count:1}:null});return d||Z(A=>W("delete-paragraph",u=>{const{box:g}=me(u,a,s,"after");if(!g)throw _("CHANGED","the document changed mid-call");const m=X(u),x=g.index,y=g.length(x),b=g.text(x,Math.min(y,Se)),S=x===0||g.count()===1;return S?g.deleteText(x,y):g.deleteRange(x-1,g.length(x-1),x,y),A(m,X(u)),{ok:!0,text:b,emptied:S,inTable:g.inTable,place:g.place(S?x:x-1,0),shiftAt:g.place(x,0)}},f))}),insertTable:D((a,s,f,p,d,A)=>{It(f);const u=wl(p),g=e.read(m=>{const{box:x,refusal:y}=me(m,a,s,f);return x?x.inTable?{ok:!1,reason:"in_table",count:1}:null:y});return g||Z(m=>W("insert-table",x=>{const{box:y,plain:b}=me(x,a,s,f);if(!y)throw _("CHANGED","the document changed mid-call");const S=X(x);let I=y.index;const k=y.font(I);f==="before"?y.split(I,0):(qe(y,I,b),I+=1),y.pasteHtml(I,kl(u,k,d===!0,y.inTable)),d===!0&&!y.inTable&&Sl(x,y.place(I,0),u[0].length);const T=X(x);return m(S,{...T,controls:Math.min(T.controls,S.controls)}),{ok:!0,rows:u.length,cols:u[0].length,inTable:y.inTable,place:y.place(I,0)}},A))}),insertPicture:D((a,s,f,p,d,A,u,g,m)=>{It(f);const x=xl(p,g),y=Math.max(1,Math.round(Number(A)||1)),b=Math.max(1,Math.round(Number(u)||1));let S=Math.round(Math.min(Math.max(Number(d)||240,24),600)*200),I=Math.max(200,Math.round(S*b/y));const k=600*200;I>k&&(I=k,S=Math.max(1,Math.round(I*y/b)));const T=e.read(M=>{const{box:P,refusal:G}=me(M,a,s,f);return P?null:G});return T||Z(M=>W("insert-picture",P=>{const{box:G,plain:L}=me(P,a,s,f);if(!G)throw _("CHANGED","the document changed mid-call");const K=X(P);let z=G.index;f==="before"?G.split(z,0):(qe(G,z,L),z+=1);const V=G.place(z,0);U(P.insertPictureEx(JSON.stringify({sectionIdx:V.sec,paraIdx:V.para,charOffset:0,...V.path?{cellPath:JSON.stringify(V.path)}:{},width:S,height:I,naturalWidthPx:y,naturalHeightPx:b,extension:x.extension}),x.bytes),"insert the picture");const te=X(P);return M(K,{...te,controls:Math.min(te.controls,K.controls)}),{ok:!0,inTable:G.inTable,place:G.place(z,0)}},m))}),replaceFont:D((a,s)=>{const f=typeof a=="string"?a.trim():"",p=typeof s=="string"?s.trim():"";if(f===""||p==="")throw _("BAD_ARGUMENT","both font names are needed");return f===p?{ok:!0,ranges:0,paragraphs:0}:W("replace-font",d=>{const A=ze(d,{chars:{},font:p}).chars;let u=0,g=0,m=!1;const x=(b,S,I)=>{let k=!1;for(const T of Array.isArray(b)?b:[]){if(u>=$o){m=!0;break}const M=T.startOffset??0,P=T.endOffset??0;if(P<=M)continue;let G;try{G=O(S(M))}catch{continue}Rl(G)===f&&(I(M,P),u+=1,k=!0)}k&&(g+=1)};for(let b=0;b<d.getSectionCount();b++){const S=d.getParagraphCount(b);for(let I=0;I<S;I++){let k;try{k=d.getParagraphLength(b,I)}catch{k=0}if(k<=0)continue;let T;try{T=O(d.getCharShapeRuns(b,I,0,k))}catch{T=[]}x(T,M=>d.getCharPropertiesAt(b,I,M),(M,P)=>U(d.applyCharFormat(b,I,M,P,A),"change the font"))}}for(const b of oe(d).tables)for(let S=0;S<b.cells;S++){let I;try{I=d.getCellParagraphCountByPath(b.sec,b.para,JSON.stringify(ne(b.path,S,0)))}catch{continue}for(let k=0;k<I;k++){const T=ne(b.path,S,k),M=JSON.stringify(T);let P;try{P=d.getCellParagraphLengthByPath(b.sec,b.para,M)}catch{P=0}if(P<=0)continue;let G;try{G=O(d.getCharShapeRunsInCellByPath(b.sec,b.para,M,0,P))}catch{G=[]}x(G,L=>d.getCellCharPropertiesAtByPath(b.sec,b.para,M,L),(L,K)=>U(d.applyCharFormatInCellByPath(b.sec,b.para,M,L,K,A),"change the font"))}}const y={ok:!0,ranges:u,paragraphs:g};return m&&(y.truncated=!0),y})}),formatText:D((a,s,f,p,d)=>{const A=lt(p,!1),u=m=>{const x=be(m,a);if(f===!0){const S=x.filter(ue);return S.length>0?{hits:S}:{refusal:{ok:!1,reason:"not_found",count:0}}}const y=Le(x,s);if(y.hit&&ue(y.hit))return{hits:[y.hit]};const b=y.hit?"unsupported_place":y.reason;return{refusal:{ok:!1,reason:b,count:x.length,...b==="ambiguous"?{matches:Re(m,x)}:{}}}},g=e.read(m=>u(m).refusal??yt(m,A));return g||Z(m=>W("format-text",x=>{const{hits:y}=u(x);if(!y)throw _("CHANGED","the document changed mid-call");const b=X(x),{chars:S,charShape:I}=ze(x,A);for(const k of y){const T=le(x,k),M=k.charOffset+k.length;I!==null&&T.setCharShape(T.index,k.charOffset,M,I),S&&T.formatChars(T.index,k.charOffset,M,S)}return m(b,X(x)),{ok:!0,count:y.length,place:nt(y[0],y[0].length)}},d))}),formatParagraph:D((a,s,f,p)=>{const d=lt(f,!0),A=g=>{const m=be(g,a),x=Le(m,s),y=I=>({refusal:{ok:!1,reason:I,count:m.length,...I==="ambiguous"?{matches:Re(g,m)}:{}}});if(!x.hit)return y(x.reason);if(!ue(x.hit))return y("unsupported_place");const b=le(g,x.hit);if(d.paragraph&&!b.formatParagraph||d.style&&!b.applyStyle)return y("unsupported_place");const S=yt(g,d);return S?{refusal:S}:{box:b}},u=e.read(g=>A(g).refusal??null);return u||Z(g=>W("format-paragraph",m=>{const{box:x}=A(m);if(!x)throw _("CHANGED","the document changed mid-call");const y=X(m),b=x.length(x.index),{chars:S,paragraph:I,style:k,charShape:T}=ze(m,d),M=k!==null&&zt(m,x,x.index)===!0;return k!==null&&x.applyStyle(x.index,k),T!==null&&b>0&&x.setCharShape(x.index,0,b,T),I&&x.formatParagraph(x.index,I),S&&b>0&&x.formatChars(x.index,0,b,S),g(y,X(m)),{ok:!0,inTable:x.inTable,place:x.place(x.index,b),...M?{keptOwnLook:1}:{}}},p))}),listTables:D(()=>e.read(a=>{const{tables:s,partial:f}=oe(a),p=A=>{if(A.parent!==null)return"";for(let u=A.para;u>=0&&u>A.para-4;u--){const g=a.getParagraphLength(A.sec,u);if(g>0)return ee(a.getTextRange(A.sec,u,0,g).trim(),er*2)}return""},d=A=>{const u=[];for(let g=0;g<A.cells&&g<12;g++){const m=Me(re(a,A,g)).join(" ").trim();if(m&&u.push(ee(m,er)),u.length===ka)break}return u};return{count:s.length,partial:f,tables:s.slice(0,Fo).map((A,u)=>({table:u+1,rows:A.rows,cols:A.cols,...A.parent===null?{}:{inTable:A.parent+1},near:p(A),preview:d(A)}))}})),readTable:D((a,s)=>e.read(f=>{const{tables:p}=oe(f),d=Number.isInteger(a)?p[a-1]:void 0;if(!d)return{ok:!1,reason:"no_such_table",count:p.length};const A=Number.isInteger(s)&&s>1?s-1:0,u=ae(f,d).filter(I=>I.row>=A).sort((I,k)=>I.row-k.row||I.col-k.col);let g=u.length;if(u.length>Rn){const I=u[Rn].row;g=u.findIndex(k=>k.row===I),g===0&&(g=u.findIndex(k=>k.row!==I)),g<0&&(g=u.length)}const m=Wt(f),x=Ct(f,d),y=d.path.length>1?new Map:vr(f),b=We(d.sec,d.para,d.path),S=u.slice(0,g).map(I=>{const k=m.get(`${b}:${I.cell}`),T=oo(f,d,I.cell,y).find(M=>!M.checked);return{row:I.row+1,col:I.col+1,...I.rowSpan>1?{rowSpan:I.rowSpan}:{},...I.colSpan>1?{colSpan:I.colSpan}:{},text:ee(Me(re(f,d,I.cell)).join(`
`),Ho),...k?{fields:k.map(M=>M.number)}:{},...T?{box:T.char}:{},...!k&&(x.has(I.cell)||At(f,d,I.cell))?{object:!0}:{}}});return{ok:!0,table:a,rows:d.rows,cols:d.cols,cells:S,...g<u.length?{nextRow:u[g].row+1}:{}}})),printPages:D(a=>e.read(s=>Kr(s,()=>{const f=s.pageCount(),p=Number.isInteger(a)&&a>0?Math.min(a,f):0,d=Date.now(),A=[];for(let u=p;u<f&&(A.push(Qo(s,u)),!(Date.now()-d>Zo));u++);return{pageCount:f,from:p,pages:A}}))),previewPage:D(a=>e.read(s=>Kr(s,()=>{const f=s.pageCount();if(!Number.isInteger(a)||a<0||a>=f)throw _("BAD_ARGUMENT","page out of range");const p=JSON.parse(s.getPageInfo(a));return{pageCount:f,page:a,svg:s.renderPageSvgWithProfile(a,"print"),width:p.width,height:p.height,margins:{left:p.marginLeft,top:p.marginTop,right:p.marginRight,bottom:p.marginBottom}}}))),pageTarget:D(a=>e.read(s=>{const f=s.pageCount();if(!Number.isInteger(a)||a<0||a>=f)throw _("BAD_ARGUMENT","page out of range");const p=s.getSectionCount();for(let d=0;d<p;d++){const A=s.getParagraphCount(d);for(let u=0;u<A;u++){const g=O(s.getPageOfPosition(d,u));if(!(!g.ok||!Number.isInteger(g.page))){if(g.page>a)break;if(g.page===a)return{ok:!0,page:a,target:{kind:"body_paragraph",section:d,paragraph:u,charOffset:0,length:s.getParagraphLength(d,u)}}}}}return{ok:!1,reason:"no_paragraph"}})),listStyles:D(()=>e.read(a=>{const s=O(a.getStyleList()),f=p=>s.filter(d=>d.type===p).map(d=>d.name);return{paragraph:f(ye),character:f(Ne)}})),readStyle:D(a=>{const s=ke(a,"name");return e.read(f=>{const p=_e(f,s,null);if(!p)return Be(f,null);const d=p.type===ye?O(f.getStyleList()).find(A=>A.id===p.nextStyleId):null;return{ok:!0,name:p.name,englishName:p.englishName??"",kind:on(p),...d?{nextStyle:d.name}:{},look:to(f,p)}})}),createStyle:D((a,s)=>{if(!a||typeof a!="object")throw _("BAD_ARGUMENT","spec must be an object");const f=ke(a.name,"name"),p=a.englishName==null?"":ke(a.englishName,"englishName"),d=a.kind??"paragraph";if(d!=="paragraph"&&d!=="character")throw _("BAD_ARGUMENT",'kind must be "paragraph" or "character"');const A=d==="character"?Ne:ye;if(A===Ne&&a.nextStyle!=null)throw _("BAD_ARGUMENT","only a paragraph style has a next style");const u=a.basedOn==null?null:ke(a.basedOn,"basedOn"),g=a.nextStyle==null?null:ke(a.nextStyle,"nextStyle"),m=Ar(a.format,A===ye),x=b=>{if(wt(b,f)||p&&wt(b,p))return{refusal:{ok:!1,reason:"style_exists"}};const S=u?_e(b,u,null):O(b.getStyleList())[0];if(!S)return{refusal:Be(b,null)};const I=g?_e(b,g,ye):null;return g&&!I?{refusal:Be(b)}:{base:S,next:I}},y=e.read(b=>x(b).refusal??null);return y||W("create-style",b=>{const{base:S,next:I}=x(b);if(!S)throw _("CHANGED","the document changed mid-call");const k=b.createStyle(JSON.stringify({name:f,englishName:p,type:A,nextStyleId:0,baseParaShapeId:S.paraShapeId,baseCharShapeId:S.charShapeId}));if(!Number.isInteger(k)||k<0)throw _("ENGINE","the style could not be made");if(A===ye&&!b.updateStyle(k,JSON.stringify({nextStyleId:I?I.id:k})))throw _("ENGINE_REFUSED","the editor refused to set the next style");return Cr(b,k,m),{ok:!0,name:f,kind:d}},s)}),editStyle:D((a,s,f)=>{const p=ke(a,"name");if(!s||typeof s!="object")throw _("BAD_ARGUMENT","spec must be an object");const d=s.name==null?null:ke(s.name,"the new name"),A=s.englishName==null?null:ke(s.englishName,"englishName"),u=s.nextStyle==null?null:ke(s.nextStyle,"nextStyle"),g=x=>{const y=_e(x,p,null);if(!y)return{refusal:Be(x,null)};const b=y.type===ye;if(u&&!b)throw _("BAD_ARGUMENT","only a paragraph style has a next style");const S=Ar(s.format,b);if(!d&&A===null&&!u&&!S)throw _("BAD_ARGUMENT","name nothing to change: name, englishName, nextStyle or format");if(d&&wt(x,d,y.id)||A&&wt(x,A,y.id))return{refusal:{ok:!1,reason:"style_exists"}};const I=u?_e(x,u,ye):null;return u&&!I?{refusal:Be(x)}:{style:y,next:I,look:S}},m=e.read(x=>g(x).refusal??null);return m||W("edit-style",x=>{const{style:y,next:b,look:S}=g(x);if(!y)throw _("CHANGED","the document changed mid-call");const I={...d?{name:d}:{},...A!==null?{englishName:A}:{},...b?{nextStyleId:b.id}:{}};if(Object.keys(I).length>0&&!x.updateStyle(y.id,JSON.stringify(I)))throw _("ENGINE_REFUSED","the editor refused to change the style");return Cr(x,y.id,S),{ok:!0,name:d??y.name,kind:on(y)}},f)}),formatCells:D((a,s,f,p)=>{if(!Array.isArray(s)||s.length===0||s.length>Dn)throw _("BAD_ARGUMENT",`cells must be 1 to ${Dn} places`);for(const m of s)if(!m||!Number.isInteger(m.row)||!Number.isInteger(m.col))throw _("BAD_ARGUMENT","each cell needs a row and a col, counted from 1");const d=f==="none";if(!d&&(typeof f!="string"||!nn.test(f)))throw _("BAD_ARGUMENT",'background must look like #RRGGBB, or be "none"');const A=JSON.stringify(d?{fillType:"none"}:{fillType:"solid",fillColor:f.toLowerCase(),patternType:-1}),u=m=>{const{tables:x}=oe(m),y=Number.isInteger(a)?x[a-1]:void 0;if(!y)return{refusal:{ok:!1,reason:"no_such_table",count:x.length}};if(y.path.length>1)return{refusal:{ok:!1,reason:"unsupported_place",count:x.length}};const b=ae(m,y),S=new Set,I=[];for(const k of s){const T=b.find(M=>k.row-1>=M.row&&k.row-1<M.row+M.rowSpan&&k.col-1>=M.col&&k.col-1<M.col+M.colSpan);T?S.add(T.cell):I.push({row:k.row,col:k.col})}return I.length>0?{refusal:{ok:!1,reason:"no_such_cell",cells:I,rows:y.rows,cols:y.cols}}:{table:y,targets:[...S]}},g=e.read(m=>u(m).refusal??null);return g||Z(m=>W("format-cells",x=>{const{table:y,targets:b}=u(x);if(!b)throw _("CHANGED","the document changed mid-call");const S=X(x),I=y.path[0].controlIndex;for(const k of b)U(x.setCellProperties(y.sec,y.para,I,k,A),"colour the cell");return m(S,X(x)),{ok:!0,count:b.length,place:{sec:y.sec,para:y.para,offset:0,length:0}}},p))}),mergeCells:D((a,s,f,p)=>{const d=b=>b&&Number.isInteger(b.row)&&Number.isInteger(b.col)&&b.row>=1&&b.col>=1;if(!d(s)||!d(f))throw _("BAD_ARGUMENT","from and to need a row and a col, counted from 1");const A=Math.min(s.row,f.row)-1,u=Math.max(s.row,f.row)-1,g=Math.min(s.col,f.col)-1,m=Math.max(s.col,f.col)-1;if(A===u&&g===m)throw _("BAD_ARGUMENT","from and to name one cell: there is nothing to merge");const x=b=>{const S=Or(b,a);if(S.refusal)return S;const{table:I,grid:k}=S;if(u>=I.rows||m>=I.cols)return{refusal:{ok:!1,reason:"no_such_cell",rows:I.rows,cols:I.cols}};const T=[],M=[];for(const L of k){const K=L.row+L.rowSpan-1,z=L.col+L.colSpan-1;if(!(L.row<=u&&K>=A&&L.col<=m&&z>=g))continue;L.row>=A&&K<=u&&L.col>=g&&z<=m?T.push(L):M.push({row:L.row+1,col:L.col+1})}if(M.length>0)return{refusal:{ok:!1,reason:"crosses_merged",cells:M}};const P=I.path[0].controlIndex,G=T.filter(L=>!(L.row===A&&L.col===g)).filter(L=>{const K=O(b.getCellProperties(I.sec,I.para,P,L.cell));return typeof K.fieldName=="string"&&K.fieldName!==""}).map(L=>({row:L.row+1,col:L.col+1}));return G.length>0?{refusal:{ok:!1,reason:"named_cells",cells:G}}:{table:I,control:P,merged:T.length}},y=e.read(b=>x(b).refusal??null);return y||Z(b=>W("merge-cells",S=>{const{table:I,control:k,merged:T}=x(S);if(!I)throw _("CHANGED","the document changed mid-call");const M=X(S);return U(S.mergeTableCells(I.sec,I.para,k,A,g,u,m),"merge the cells"),b(M,X(S)),{ok:!0,merged:T,place:{sec:I.sec,para:I.para,offset:0,length:0}}},p))}),splitCell:D((a,s,f,p,d,A)=>{if(!Number.isInteger(s)||!Number.isInteger(f)||s<1||f<1)throw _("BAD_ARGUMENT","row and col count from 1");const u=b=>b??1,g=u(p),m=u(d);for(const b of[g,m])if(!Number.isInteger(b)||b<1||b>Bn)throw _("BAD_ARGUMENT",`rows and cols must be 1 to ${Bn}`);const x=b=>{const S=Or(b,a);if(S.refusal)return S;const{table:I,grid:k}=S,T=k.find(P=>s-1>=P.row&&s-1<P.row+P.rowSpan&&f-1>=P.col&&f-1<P.col+P.colSpan);if(!T)return{refusal:{ok:!1,reason:"no_such_cell",rows:I.rows,cols:I.cols}};if(At(b,I,T.cell)||Ct(b,I).has(T.cell))return{refusal:{ok:!1,reason:"holds_object"}};const M=T.rowSpan>1||T.colSpan>1;return g===1&&m===1&&!M?{refusal:{ok:!1,reason:"not_merged"}}:{table:I,cell:T,unmerge:g===1&&m===1}},y=e.read(b=>x(b).refusal??null);return y||Z(b=>W("split-cell",S=>{const{table:I,cell:k,unmerge:T}=x(S);if(!I)throw _("CHANGED","the document changed mid-call");const M=X(S),P=I.path[0].controlIndex,G=T?S.splitTableCell(I.sec,I.para,P,k.row,k.col):S.splitTableCellInto(I.sec,I.para,P,k.row,k.col,g,m,!0,!1);return U(G,"split the cell"),b(M,X(S)),{ok:!0,unmerged:T,place:{sec:I.sec,para:I.para,offset:0,length:0}}},A))}),fillCells:D((a,s,f,p)=>{const d=Gl(s),A=g=>{const{tables:m}=oe(g),x=Number.isInteger(a)?m[a-1]:void 0;if(!x)return{refusal:{ok:!1,reason:"no_such_table",count:m.length}};const y=ae(g,x),b=Wt(g),S=Ct(g,x),I=We(x.sec,x.para,x.path),k=[],T=[],M=[],P=[],G=[],L=new Set;for(const z of d){const V={row:z.row,col:z.col},te=y.find(J=>z.row-1>=J.row&&z.row-1<J.row+J.rowSpan&&z.col-1>=J.col&&z.col-1<J.col+J.colSpan);if(!te){T.push(V);continue}if(L.has(te.cell))throw _("BAD_ARGUMENT",`two entries name the same cell (${z.row}.${z.col})`);L.add(te.cell);const Ae=b.get(`${I}:${te.cell}`)??[];if(Ae.length>1){P.push({...V,fields:Ae.map(J=>J.number)});continue}if(Ae.length===1){const J=Ae[0];!Dl(J)&&f!==!0?M.push({...V,text:ee(J.value,Se)}):k.push({...z,cell:te.cell,field:J});continue}if(S.has(te.cell)||At(g,x,te.cell)){G.push(V);continue}const Ce=Me(re(g,x,te.cell));Ce.join("").trim()!==""&&f!==!0?M.push({...V,text:ee(Ce.join(" ").trim(),Se)}):k.push({...z,cell:te.cell,clear:Ce.some(J=>J!=="")})}const K=(z,V)=>({refusal:{ok:!1,reason:z,cells:V,rows:x.rows,cols:x.cols}});return T.length>0?K("no_such_cell",T):P.length>0?K("has_fields",P):G.length>0?K("holds_object",G):M.length>0?K("occupied",M):{table:x,targets:k}},u=e.read(g=>A(g).refusal??null);return u||Z(g=>W("fill-cells",m=>{const{table:x,targets:y}=A(m);if(!y)throw _("CHANGED","the document changed mid-call");const b=new Set(y.filter(k=>k.field).map(k=>k.field.fieldId)),S=X(m,b);for(const k of y){if(k.field){wr(m,k.field.key,k.lines.join(" "));continue}const T=re(m,x,k.cell);if(k.clear){const M=T.count()-1;M>0?T.deleteRange(0,0,M,T.length(M)):T.deleteText(0,T.length(0))}k.lines.forEach((M,P)=>{P>0&&P>=T.count()&&T.split(P-1,T.length(P-1)),M&&T.insert(P,M)}),k.lines.forEach((M,P)=>{M&&el(m,x,k.cell,P,[...M].length)})}Ir(m,null,new Set(y.filter(k=>k.field).map(k=>k.field.key))),g(S,X(m,b));const I=y[0];return{ok:!0,table:a,count:y.length,place:re(m,x,I.cell).place(0,I.field?0:I.lines[0].length)}},p))}),checkBoxes:D((a,s,f)=>{const p=Ul(s),d=u=>{const{tables:g}=oe(u),m=Number.isInteger(a)?g[a-1]:void 0;if(!m)return{refusal:{ok:!1,reason:"no_such_table",count:g.length}};const x=ae(u,m),y=vr(u),b=[],S=[],I=[],k=[],T=new Set;for(const P of p){const G={row:P.row,col:P.col},L=x.find(V=>P.row-1>=V.row&&P.row-1<V.row+V.rowSpan&&P.col-1>=V.col&&P.col-1<V.col+V.colSpan);if(!L){S.push(G);continue}if(T.has(L.cell))throw _("BAD_ARGUMENT",`two entries name the same cell (${P.row}.${P.col})`);T.add(L.cell);const K=Me(re(u,m,L.cell)),z=vl(Ol(u,m,L.cell,K,y),P.choice);z.box?b.push({cell:L.cell,...z.box}):z.choices?k.push({...G,choices:z.choices}):I.push(G)}const M=(P,G)=>({refusal:{ok:!1,reason:P,cells:G,rows:m.rows,cols:m.cols}});return S.length>0?M("no_such_cell",S):k.length>0?M("ambiguous_box",k):I.length>0?M("no_box",I):{table:m,targets:b}},A=e.read(u=>d(u).refusal??null);return A||Z(u=>W("check-boxes",g=>{const{table:m,targets:x}=d(g);if(!x)throw _("CHANGED","the document changed mid-call");const y=X(g);let b=null;for(const k of x)if(!k.checked)if(k.kind==="bullet"){if(b===null&&(b=g.ensureDefaultBullet(Fn)),!Number.isInteger(b)||b<1)throw _("ENGINE","the tick box could not be made");U(g.applyParaFormatInCell(m.sec,m.para,m.path[0].controlIndex,k.cell,k.k,JSON.stringify({headType:"Bullet",numberingId:b})),"tick the box")}else{const T=JSON.stringify(ne(m.path,k.cell,k.k));U(g.deleteTextInCellByPath(m.sec,m.para,T,k.offset,1),"tick the box"),U(g.insertTextInCellByPath(m.sec,m.para,T,k.offset,Fn),"tick the box")}u(y,X(g));const S=x[0],I=re(g,m,S.cell);return{ok:!0,table:a,count:x.length,place:I.place(S.k,Math.min(1,I.length(S.k)))}},f))}),addTableLines:D((a,s,f,p,d,A)=>{const u=Lr(s,f,d);if(p!=="after"&&p!=="before")throw _("BAD_ARGUMENT",'where must be "after" or "before"');const g=x=>{const{tables:y}=oe(x),b=Number.isInteger(a)?y[a-1]:void 0;if(!b)return{refusal:{ok:!1,reason:"no_such_table",count:y.length}};const S={rows:b.rows,cols:b.cols};return b.parent!==null?{refusal:{ok:!1,reason:"nested",...S}}:f>(u?b.rows:b.cols)?{refusal:{ok:!1,reason:"no_such_line",...S}}:{table:b}},m=e.read(x=>g(x).refusal??null);return m||Z(x=>W("add-table-lines",y=>{const{table:b}=g(y);if(!b)throw _("CHANGED","the document changed mid-call");const S=X(y),{sec:I,para:k}=b,T=b.path[0].controlIndex,M=p==="after";for(let J=0;J<d;J++){const Ie=M?f-1:f-1+J;U(u?y.insertTableRow(I,k,T,Ie,M):y.insertTableColumn(I,k,T,Ie,M),u?"add a row":"add a column")}const P=M?f:f-1,G=M?f-1:f-1+d,L={...b,cells:O(y.getTableDimensions(I,k,T)).cellCount},K=ae(y,L),z=J=>u?J.row:J.col,V=J=>u?J.col:J.row,te=J=>O(y.getCellParaPropertiesAt(I,k,T,J.cell,0)).alignment;for(const J of K){if(z(J)<P||z(J)>=P+d)continue;const Ie=K.find(et=>z(et)===G&&V(et)===V(J));if(!Ie)continue;const Qe=te(Ie);Qe&&Qe!==te(J)&&U(y.applyParaFormatInCell(I,k,T,J.cell,0,JSON.stringify({alignment:Qe})),"format the new cell")}x(S,X(y));const Ae=O(y.getTableDimensions(I,k,T)),Ce=K.find(J=>z(J)===P);return{ok:!0,table:a,rows:Ae.rowCount,cols:Ae.colCount,first:P+1,count:d,...Ce?{place:re(y,L,Ce.cell).place(0,0)}:{}}},A))}),removeTableLines:D((a,s,f,p,d)=>{const A=Lr(s,f,p),u=m=>{const{tables:x}=oe(m),y=Number.isInteger(a)?x[a-1]:void 0;if(!y)return{refusal:{ok:!1,reason:"no_such_table",count:x.length}};const b={rows:y.rows,cols:y.cols};if(y.parent!==null)return{refusal:{ok:!1,reason:"nested",...b}};const S=A?y.rows:y.cols;if(f+p-1>S)return{refusal:{ok:!1,reason:"no_such_line",...b}};if(p>=S)return{refusal:{ok:!1,reason:"would_empty",...b}};const I=Ct(m,y),k=ae(m,y).filter(M=>{const P=A?M.row:M.col;return P>=f-1&&P<f-1+p}),T=k.filter(M=>I.has(M.cell)||At(m,y,M.cell)).map(M=>({row:M.row+1,col:M.col+1}));return T.length>0?{refusal:{ok:!1,reason:"holds_object",cells:T,...b}}:{table:y,going:k}},g=e.read(m=>u(m).refusal??null);return g||Z(m=>W("remove-table-lines",x=>{const{table:y,going:b}=u(x);if(!y)throw _("CHANGED","the document changed mid-call");const S=X(x,new Set),{sec:I,para:k}=y,T=y.path[0].controlIndex,M=ee(b.map(L=>Me(re(x,y,L.cell)).join(" ").trim()).filter(Boolean).join(" | "),Se);for(let L=0;L<p;L++)U(A?x.deleteTableRow(I,k,T,f-1):x.deleteTableColumn(I,k,T,f-1),A?"remove the row":"remove the column");m(S,X(x,new Set));const P=O(x.getTableDimensions(I,k,T)),G={...y,cells:P.cellCount};return{ok:!0,table:a,rows:P.rowCount,cols:P.colCount,count:p,text:M,place:re(x,G,0).place(0,0)}},d))}),deleteTable:D((a,s)=>{const f=d=>{const{tables:A}=oe(d),u=Number.isInteger(a)?A[a-1]:void 0;if(!u)return{refusal:{ok:!1,reason:"no_such_table",count:A.length}};const g=new Set([a-1]);for(let I=a;I<A.length&&g.has(A[I].parent);I++)g.add(I);const m=[...g].map(I=>A[I]),x=ae(d,u),y=new Set;for(const I of m)for(const k of ae(d,I))$l(d,I,k.cell)&&y.add(I===u?k.cell:I.path[u.path.length-1].cellIndex);if(y.size>0)return{refusal:{ok:!1,reason:"holds_object",cells:x.filter(k=>y.has(k.cell)).map(k=>({row:k.row+1,col:k.col+1}))}};const b=m.map(I=>`${We(I.sec,I.para,I.path)}:`),S=new Set;for(const[I,k]of Wt(d))if(b.some(T=>I.startsWith(T)))for(const T of k)S.add(T.fieldId);return{table:u,top:x,inner:m.length-1,going:S}},p=e.read(d=>f(d).refusal??null);return p||Z(d=>W("delete-table",A=>{const{table:u,top:g,inner:m,going:x}=f(A);if(!u)throw _("CHANGED","the document changed mid-call");const y=X(A,x),b=ee(g.map(K=>Me(re(A,u,K.cell)).join(" ").trim()).filter(Boolean).join(" | "),Se),{sec:S,para:I,path:k}=u,T=k[k.length-1],M=k.slice(0,-1);U(M.length===0?A.deleteTableControl(S,I,T.controlIndex):A.deleteCellTableControlByPath(S,I,JSON.stringify(M),T.controlIndex),"remove the table");const P=le(A,M.length===0?{sec:S,para:I}:{sec:S,para:I,cellPath:M}),G=P.index,L=P.length(G)===0&&(M.length===0?P.objectPositions(G).length===0:!Bl(A,S,I,M));return G>0&&L&&P.deleteRange(G-1,P.length(G-1),G,0),d({...y,controls:y.controls-1-m},X(A,x)),{ok:!0,table:a,rows:u.rows,cols:u.cols,inner:m,text:b,place:P.place(G>0&&L?G-1:G,0)}},s))}),installFileMenu:D(a=>{for(const s of Ut)if(typeof a?.[s.command]!="string"||!a[s.command])throw _("BAD_ARGUMENT",`labels.${s.command} must be a non-empty string`);if(!e.automation.registerCommand||!e.automation.addMenuItem)return{ok:!1};for(const s of Ut)try{e.automation.registerCommand({id:s.id,label:a[s.command],...s.shortcut?{shortcutLabel:s.shortcut}:{},execute:()=>{globalThis.dispatchEvent?.(new CustomEvent(Ko,{detail:s.command}))}})}catch{}try{for(const s of[...Ut].reverse())e.automation.addMenuItem({menuId:"file",commandId:s.id,position:"top"})}catch{return{ok:!1}}return{ok:!0}}),showCharCount:D(a=>{const s=No(a);if(!s)throw _("BAD_ARGUMENT","total, selected, hint and hintSelected must be non-empty strings");return vt=s,{ok:po()}}),installEasyWords:D(a=>{if(typeof a!="string"||!a.trim())throw _("BAD_ARGUMENT","label must be a non-empty string");if(!e.automation.registerCommand)return{ok:!1};try{e.automation.unregisterCommand?.(Jn)}catch{}try{e.automation.registerCommand({id:Jn,label:a,canExecute:s=>s?.hasDocument===!0&&(s.hasSelection===!0||s.inCellSelectionMode===!0),execute:()=>{let s;try{s=Ze.selection()}catch{return}if(!s?.ok)return;const f=s.segments.map(p=>p.text).join(`
`).trim();f&&globalThis.dispatchEvent?.(new CustomEvent(Vo,{detail:{text:f}}))}})}catch{return{ok:!1}}return{ok:!0}}),watchMissingFonts:D(a=>{if(typeof a?.tag!="string"||!a.tag.trim()||typeof a.hint!="string"||!a.hint.trim())throw _("BAD_ARGUMENT","tag and hint must be non-empty strings");return wo({tag:a.tag,hint:a.hint}),Io().then(()=>{let s;try{s=e.read(p=>O(p.getDocumentInfo()).fontsUsed)}catch{return}const f=Ao(Array.isArray(s)?s:[]);globalThis.dispatchEvent?.(new CustomEvent(Yo,{detail:{fonts:f}}))}),{ok:!0}}),reveal:D(a=>{Ye=!1;try{e.automation.execute(Hn,a)}catch{return{ok:!1}}return Ye&&(In=tn(a)),{ok:Ye}}),selection:D(()=>{Te=null;try{e.automation.execute(pt)}catch{return{ok:!1,reason:"none"}}const a=Te;return a?e.read(s=>{const f=Ra(),p=ur(s,a,f);if(!p.ok)return p;const{inTable:d}=p;return f.tooLong()?{ok:!1,reason:"too_long"}:f.segments.length===0?{ok:!1,reason:"none"}:{ok:!0,inTable:d,contiguous:fr(f.segments),own:f.segments.length===1&&tn(f.segments[0])===In,segments:f.segments}}):{ok:!1,reason:"none"}}),replaceSelection:D((a,s,f)=>{if(dr(a),!Array.isArray(s)||s.length===0||s.length>gn)throw _("BAD_ARGUMENT","texts must be a list of one or more strings");return s.forEach(ot),s.length!==a.length&&!fr(a)?{ok:!1,reason:"count",count:a.length}:e.read(p=>Xt(p,a))?Z(p=>W("replace-selection",d=>{if(!Xt(d,a))throw _("CHANGED","the document changed mid-call");const A=X(d),u=b=>({sec:b.sec,para:b.para,cellPath:b.path,charOffset:b.offset,length:b.length}),g=Math.min(a.length,s.length);for(let b=a.length-1;b>=g;b--){const S=a[b],{box:I,k}=St(d,S);S.offset===0&&S.length===I.length(k)&&k>0&&I.objectPositions(k).length===0?I.deleteRange(k-1,I.length(k-1),k,I.length(k)):xt(d,u(S),"")}for(let b=0;b<g;b++)xt(d,u(a[b]),s[b]);const m=a.slice(0,g).map((b,S)=>({...b,length:s[S].length,text:s[S]}));if(s.length>a.length){const b=a[a.length-1],{box:S,k:I}=St(d,b);let k=I,T=b.offset+s[g-1].length;for(let M=g;M<s.length;M++)S.split(k,T),k+=1,s[M]&&S.insert(k,s[M]),T=s[M].length,m.push({...S.place(k,s[M].length),text:s[M]})}p(A,X(d));const{text:x,...y}=m[0];return{ok:!0,segments:m,place:y}},f)):{ok:!1,reason:"changed"}}),formatSelection:D((a,s,f)=>{dr(a);const p=lt(s,!0),d=u=>{if(!Xt(u,a))return{refusal:{ok:!1,reason:"changed"}};const g=a.map(x=>St(u,x));if(g.some(({box:x})=>p.paragraph&&!x.formatParagraph||p.style&&!x.applyStyle))return{refusal:{ok:!1,reason:"unsupported_place"}};const m=yt(u,p);return m?{refusal:m}:{boxes:g}},A=e.read(u=>d(u).refusal??null);return A||Z(u=>W("format-selection",g=>{const{boxes:m}=d(g);if(!m)throw _("CHANGED","the document changed mid-call");const x=X(g),{chars:y,paragraph:b,style:S,charShape:I}=ze(g,p);let k=0;a.forEach((P,G)=>{const{box:L,k:K}=m[G],z=P.offset+P.length;S!==null&&(zt(g,L,K)===!0&&(k+=1),L.applyStyle(K,S)),I!==null&&P.length>0&&L.setCharShape(K,P.offset,z,I),b&&L.formatParagraph(K,b),y&&P.length>0&&L.formatChars(K,P.offset,z,y)}),u(x,X(g));const{text:T,...M}=a[0];return{ok:!0,count:a.length,place:M,...k>0?{keptOwnLook:k}:{}}},f))}),listFields:D(()=>e.read(a=>Tt(a).map((s,f)=>({field:f+1,name:s.name??"",guide:s.guide??"",value:s.value??"",inCell:s.cellField===!0})))),fillField:D((a,s,f)=>{ot(s);const p=e.read(d=>Tt(d).length);return!Number.isInteger(a)||a<1||a>p?{ok:!1,reason:"no_such_field",count:p}:W("fill-field",d=>{const A=Tt(d)[a-1];if(!A)throw _("CHANGED","the document changed mid-call");wr(d,it(A),s),Ir(d,null,new Set([it(A)]));const u=_a(A);return{ok:!0,name:A.name??"",...u?{place:u}:{}}},f)}),insertToc:D((a,s,f,p,d,A)=>{It(f),es(d),p!=null&&ot(p);const u=typeof p=="string"&&p.trim()!=="",g=x=>d.map(y=>{const b=be(x,y.find),S=Le(b,y.occurrence??null),I=S.hit?!ue(S.hit)||Oe(S.hit)?"unsupported_place":null:S.reason;return{entry:y,hits:b,hit:I?null:S.hit,reason:I}}),m=e.read(x=>{const y=me(x,a,s,f);if(y.refusal)return y.refusal;if(y.box.inTable)return{ok:!1,reason:"in_table",count:1};const b=g(x).find(S=>S.reason);return b?{ok:!1,reason:"no_heading",heading:b.entry.find,why:b.reason,count:b.hits.length,...b.reason==="ambiguous"?{matches:Re(x,b.hits)}:{}}:null});return m||Z(x=>W("insert-toc",y=>{const{box:b,plain:S}=me(y,a,s,f);if(!b||b.inTable)throw _("CHANGED","the document changed mid-call");const I=X(y),{sec:k}=b.place(b.index,0),T=g(y);if(T.some(J=>!J.hit))throw _("CHANGED","the document changed mid-call");const M=b.font(b.index),P=Ql(y,k),G=T.map(({entry:J,hit:Ie})=>({text:rs(ee(Fr(y,Ie.sec,Ie.para).replace(/\s+/g," ").trim(),Wl),J.level,M,P),level:J.level,page:0}));let L=b.index;f==="before"?b.split(L,0):(qe(b,L,S),L+=1);let K=L;u&&(b.insert(L,p.trim()),qe(b,L,!1),K=L+1),b.pasteHtml(K,ts(G,M,P));const z=oe(y).tables.find(J=>J.sec===k&&J.para===K&&J.path.length===1);if(!z)throw _("ENGINE","the table of contents could not be made");const V=K-L+1,te=ae(y,z),Ae=T.map(({hit:J},Ie)=>{const Qe=J.sec===k&&J.para>=L?J.para+V:J.para,et=Hr(y,J.sec,Qe),Cn=Yt(te,Ie,1);if(!Cn)throw _("ENGINE","the table of contents came out in another shape");return jr(y,z,Cn.cell,String(et)),et});u&&U(y.applyParaFormat(k,L,JSON.stringify({alignment:"center"})),"center the title");const Ce=X(y);return x(I,{...Ce,controls:Math.min(Ce.controls,I.controls)}),{ok:!0,count:d.length,pages:Ae,place:{sec:k,para:L,offset:0,length:u?p.trim().length:0}}},A))}),refreshToc:D((a,s,f)=>{const p=A=>{const u=me(A,a,s,"after");if(u.refusal)return{refusal:u.refusal};if(u.box.inTable)return{refusal:{ok:!1,reason:"in_table",count:1}};const{sec:g}=u.box.place(u.box.index,0),m=oe(A).tables.find(x=>x.sec===g&&x.para===u.box.index+1&&x.path.length===1&&x.cols===2);return m?{table:m}:{refusal:{ok:!1,reason:"no_toc",count:0}}},d=e.read(A=>p(A).refusal??null);return d||Z(A=>W("refresh-toc",u=>{const{table:g}=p(u);if(!g)throw _("CHANGED","the document changed mid-call");const m=X(u),x=ae(u,g);let y=0,b=0;const S=[];for(let I=0;I<g.rows;I++){const k=Yt(x,I,0),T=Yt(x,I,1);if(!k||!T)continue;const M=Zl.exec(Me(re(u,g,T.cell)).join(""));if(!M)continue;y+=1;const P=Me(re(u,g,k.cell)).join(" ").trim(),G=P.replace(/…$/,"").slice(0,ql),L=G?be(u,G).filter(V=>!Oe(V)&&ue(V)):[],K=L.find(V=>Fr(u,V.sec,V.para).trim().startsWith(G))??L[0];if(!K){S.push(P);continue}const z=Hr(u,K.sec,K.para);z!==Number(M[1])&&(jr(u,g,T.cell,String(z)),b+=1)}return A(m,X(u)),{ok:!0,lines:y,changed:b,...S.length>0?{missing:S}:{},place:{sec:g.sec,para:g.para,offset:0,length:0}}},f))}),listNotes:D(()=>e.read(a=>{const{notes:s,elsewhere:f}=at(a);return{count:s.length,elsewhere:f,notes:s.slice(0,Fl).map((p,d)=>({note:d+1,...Vt(p),after:Kl(a,p),text:ee(p.lines.join(`
`),Hl),...p.plain?{}:{objects:!0},...p.numbered?{}:{noAutoNumber:!0}}))}})),insertNote:D((a,s,f,p,d)=>{if(!yn.includes(a))throw _("BAD_ARGUMENT","kind must be footnote or endnote");const A=Br(p),u=m=>{const x=be(m,s),y=Le(x,f),b=y.hit?!ue(y.hit)||Oe(y.hit)?"unsupported_place":null:y.reason;return{hits:x,hit:b?null:y.hit,reason:b}},g=e.read(m=>{const{hits:x,reason:y}=u(m);return y?{ok:!1,reason:y,count:x.length,...y==="ambiguous"?{matches:Re(m,x)}:{}}:null});return g||Z(m=>W("insert-note",x=>{const{hit:y}=u(x);if(!y)throw _("CHANGED","the document changed mid-call");const b=X(x),S=y.charOffset+y.length,I=O(a==="endnote"?x.insertEndnote(y.sec,y.para,S):x.insertFootnote(y.sec,y.para,S));if(!I.ok||!Number.isInteger(I.controlIdx))throw _("ENGINE",`could not add the ${a}`);const k={sec:y.sec,para:I.paraIdx??y.para,control:I.controlIdx},T=O(x.getFootnoteInfo(k.sec,k.para,k.control)).totalTextLen;return Dr(x,k,T,A),m({...b,controls:b.controls+1},X(x)),{ok:!0,kind:a,number:I.footnoteNumber??I.endnoteNumber??null,place:nt(y,y.length)}},d))}),editNote:D((a,s,f)=>{const p=Br(s),d=e.read(A=>{const{notes:u}=at(A),g=u[a-1];return!Number.isInteger(a)||!g?{ok:!1,reason:"no_such_note",count:u.length}:g.plain?null:{ok:!1,reason:"has_objects",count:1}});return d||Z(A=>W("edit-note",u=>{const g=at(u).notes[a-1];if(!g||!g.plain)throw _("CHANGED","the document changed mid-call");const m=X(u);for(let y=g.lines.length-1;y>0;y--)U(u.mergeParagraphInFootnote(g.sec,g.para,g.control,y),"merge the note");const x=O(u.getFootnoteInfo(g.sec,g.para,g.control)).totalTextLen;return x>g.prefix&&U(u.deleteTextInFootnote(g.sec,g.para,g.control,0,g.prefix,x-g.prefix),"clear the note"),Dr(u,g,g.prefix,p),A(m,X(u)),{ok:!0,...Vt(g),was:ee(g.lines.join(`
`),Se),place:{sec:g.sec,para:g.para,offset:g.offset,length:0}}},f))}),deleteNote:D((a,s)=>{const f=e.read(p=>{const{notes:d}=at(p);return Number.isInteger(a)&&d[a-1]?null:{ok:!1,reason:"no_such_note",count:d.length}});return f||Z(p=>W("delete-note",d=>{const A=at(d).notes[a-1];if(!A)throw _("CHANGED","the document changed mid-call");const u=X(d);return U(d.deleteFootnote(A.sec,A.para,A.control),"remove the note"),p({...u,controls:u.controls-1},X(d)),{ok:!0,...Vt(A),text:ee(A.lines.join(`
`),Se),place:{sec:A.sec,para:A.para,offset:A.offset,length:0}}},s))}),noteSettings:D(()=>e.read(a=>({sections:a.getSectionCount(),footnote:st(a,"footnote",0),endnote:st(a,"endnote",0)}))),setNoteSettings:D((a,s,f)=>{const p=il(a,s),d=a==="footnote"?"applyFootnoteShape":"applyEndnoteShape";return e.read(u=>typeof u[d]=="function")?W("note-settings",u=>{const g=u.getSectionCount();for(let m=0;m<g;m++){const x=JSON.stringify(ul(u,a,m,p));U(u[d](m,x),`change the ${a} settings`)}return{ok:!0,kind:a,settings:st(u,a,0)}},f):{ok:!1,reason:"unsupported"}}),pageSetup:D(()=>e.read(a=>{const s=[];for(let f=0;f<a.getSectionCount();f++)s.push(sn(a,f));return{sections:s}})),setPageSetup:D((a,s,f)=>{const p=rl(a),d=u=>{const g=u.getSectionCount();return s==null?Array.from({length:g},(m,x)=>x):Number.isInteger(s)&&s>=1&&s<=g?[s-1]:null},A=e.read(u=>{const g=d(u);if(!g)return{ok:!1,reason:"no_such_section",count:u.getSectionCount()};for(const m of g)if(!ol(O(u.getPageDef(m)),p))return{ok:!1,reason:"no_text_area",section:m+1};return null});return A||W("page-setup",u=>{const g=d(u);if(!g)throw _("CHANGED","the document changed mid-call");for(const m of g)U(u.setPageDef(m,JSON.stringify(p)),"change the page setup");return{ok:!0,sections:g.length,pageSetup:sn(u,g[0])}},f)}),formatting:D(a=>e.read(s=>{if(a==null)return{ok:!0,...Er(s)};if(typeof a!="string"||a==="")throw _("BAD_ARGUMENT","the document must come as base64");const f=s.constructor;let p;try{p=new f(ml(a))}catch(d){return{ok:!1,reason:"unreadable",message:ee(ar(d).message,200)}}try{const d=Er(p);return{ok:!0,...d,looks:d.looks.map(({id:A,...u})=>u)}}finally{p.free?.()}})),formatLook:D((a,s,f)=>{const p=lt(s,!0),d=u=>cn(u).looks.find(g=>g.id===a)??null,A=e.read(u=>d(u)?yt(u,p):{ok:!1,reason:"no_such_look",looks:cn(u).looks.slice(0,Nt).map(m=>({id:m.id,paragraphs:m.places.length,sample:m.samples[0]}))});return A||Z(u=>W("format-look",g=>{const m=d(g);if(!m)throw _("CHANGED","the document changed mid-call");const x=X(g),{chars:y,paragraph:b,style:S,charShape:I}=ze(g,p);let k=0;const T=[];for(const{sec:M,para:P}of m.places){const G=le(g,{sec:M,para:P,charOffset:0}),L=G.length(P);S!==null&&zt(g,G,P)===!0&&(k+=1),S!==null&&G.applyStyle(P,S),I!==null&&L>0&&G.setCharShape(P,0,L,I),b&&G.formatParagraph(P,b),y&&L>0&&G.formatChars(P,0,L,y),T.push(G.place(P,L))}return u(x,X(g)),{ok:!0,paragraphs:m.places.length,place:T[0],marks:T,...k>0?{keptOwnLook:k}:{}}},f))}),listMemos:D(()=>{Y=null;let a=!0;try{a=e.read(f=>typeof f.getMemoList=="function")!==!1}catch{}try{e.automation.execute(Wn)}catch{}const s=Y??e.read(Jt);return c=s.map(jt),{count:s.length,memos:s,supported:a}}),memoSelection:D(()=>{q=null;try{e.automation.execute(Vn)}catch{return{ok:!1,reason:"none"}}return q??{ok:!1,reason:"none"}}),insertMemo:D((a,s,f,p)=>{const d=Ma(a);if(typeof f!="string")throw _("BAD_ARGUMENT","text must be a string");if(f.length>qn)return{ok:!1,reason:"memo_text_too_long"};const A=e.read(u=>{if(bt(u))return{ok:!1,reason:"protected"};if(le(u,{sec:d.sectionIndex,para:d.paraIndex,cellPath:d.path}).length(Ee(d))<d.endCharIdx)return{ok:!1,reason:"memo_invalid_range"};const m=`${d.sectionIndex}:${d.paraIndex}:${Zt(d.path)}`;return lr(ie(u),m,d.startCharIdx,d.endCharIdx)?{ok:!1,reason:"memo_overlap"}:null});return A||Q("memo-insert",p,u=>{const g=JSON.stringify({author:Ta(s),text:f}),m=O(d.path?u.insertMemoByPath(d.sectionIndex,d.paraIndex,JSON.stringify(d.path),d.startCharIdx,d.endCharIdx,g):u.insertMemo(d.sectionIndex,d.paraIndex,d.startCharIdx,d.endCharIdx,g));if(!m||m.ok!==!0)throw _("ENGINE_REFUSED","the editor refused to add the memo");return{ok:!0,id:m.id,index:m.index}})}),setMemo:D((a,s,f)=>{if(!Number.isInteger(a))return{ok:!1,reason:"memo_not_found"};if(typeof s!="string")throw _("BAD_ARGUMENT","text must be a string");if(s.length>qn)return{ok:!1,reason:"memo_text_too_long"};const p=e.read(d=>{if(bt(d))return{ok:!1,reason:"memo_read_only",why:"protected"};const A=ie(d).find(u=>u.id===a);return A?A.editable!==!0?{ok:!1,reason:"memo_read_only",why:A.readOnlyReason??null}:null:{ok:!1,reason:"memo_not_found"}});return p||Q("memo-set",f,d=>(U(d.setMemoText(a,s),"change the memo"),{ok:!0}))}),removeMemo:D((a,s)=>{if(!Number.isInteger(a))return{ok:!1,reason:"memo_not_found"};const f=e.read(p=>{if(bt(p))return{ok:!1,reason:"memo_read_only",why:"protected"};const d=ie(p).find(A=>A.id===a);return d?d.readOnlyReason==="protected"||d.readOnlyReason==="unsupported_place"?{ok:!1,reason:"memo_read_only",why:d.readOnlyReason}:null:{ok:!1,reason:"memo_not_found"}});return f||Q("memo-remove",s,p=>(U(p.removeMemo(a),"remove the memo"),{ok:!0}))}),showMemoAnchors:D(a=>(i=a===!0,!i&&ce&&(ce(),ce=null),R(),{ok:!0,shown:i})),selectMemo:D(a=>(h=Number.isInteger(a)?a:null,R(),{ok:!0,id:h})),setMemoLock:D(a=>we(a===!0)),clearMarks:D(()=>(l=[],ht(),{ok:!0})),measureTabs:D(a=>{if(!Array.isArray(a)||a.length>ls)throw _("BAD_ARGUMENT","spots must be a list of tab places");return e.read(s=>({tabs:a.map(f=>{try{return fs(s,f)}catch{return null}})}))}),undo:D((a,s)=>{if(!Number.isInteger(a)||a<1||a>Uo)throw _("BAD_ARGUMENT","steps must be a small positive integer");if(s!==n)return{ok:!1,reason:"changed",undone:0};let f=0;t=!0,r=null;try{for(let p=0;p<a;p++){const d=e.automation.execute("edit:undo");if(!d||d.ok!==!0)break;f+=1}}finally{t=!1}return E({notify:!1}),R(),{ok:f===a,undone:f}})};for(const[a,s,f]of[[la,"Add a memo",p=>Ze.insertMemo(p?.anchor,p?.author,p?.text,p?.options)],[sa,"Change the memo",p=>Ze.setMemo(p?.id,p?.text,p?.options)],[ia,"Remove the memo",p=>Ze.removeMemo(p?.id,p?.options)]])try{e.automation.registerCommand({id:a,label:s,execute:(p,d)=>{try{f(d)}catch{}}})}catch{}return Ze}};export{Ro as AGENT_PLUGIN_ID,Wo as DIRTY_EVENT,Jn as EASY_WORDS_COMMAND,Vo as EASY_WORDS_EVENT,Ko as FILE_COMMAND_EVENT,aa as MEMO_NOT_COPIED_EVENT,oa as MEMO_REMOVED_EVENT,Yo as MISSING_FONTS_EVENT,bs as agentPlugin,qa as syncStyleList};
