import{t as xo,e as He,d as yo,a as pn,b as wo,s as Io,w as Ao,m as Co}from"./index-Bgkxrh2U.js";const ko=700,En=150,So=4,Tn="ieum-sb-char-count",_o="ieum-sb-char-count-divider";function No(){let e=0,n=0,t=0;return{add(r,o,l,c){const i=r.length(o),u=Math.min(Math.max(l,0),i),C=Math.min(c,i);if(C<=u)return;const y=xo(He(r.text(o,i),u,C));e+=y.chars,n+=y.charsNoSpace,t+=1},tooLong:()=>!1,counts:()=>({chars:e,charsNoSpace:n,runs:t})}}function Eo(e){const n=t=>typeof t=="string"&&t.trim().length>0;return!e||!["total","selected","hint","hintSelected"].every(t=>n(e[t]))?null:{total:e.total,selected:e.selected,hint:e.hint,hintSelected:e.hintSelected,locale:typeof e.locale=="string"&&e.locale?e.locale:void 0}}const Mn=(e,n)=>e.replace(/\{(\w+)\}/g,(t,r)=>r in n?n[r]:t);function To(e,n,t){let r;try{r=new Intl.NumberFormat(e.locale).format}catch{r=c=>String(c)}const o=c=>r(Math.max(0,Math.round(Number(c)||0))),l={total:o(n.chars),totalNoSpace:o(n.charsNoSpace),selected:t?o(t.chars):"",selectedNoSpace:t?o(t.charsNoSpace):""};return{text:Mn(t?e.selected:e.total,l),title:Mn(t?e.hintSelected:e.hint,l)}}function Pn(e){const n=e?.getElementById?.(Tn);if(n)return n;const t=e?.getElementById?.("status-bar");if(!t)return null;const r=e.createElement("span");r.id=_o,r.className="stb-divider";const o=e.createElement("span");o.id=Tn,o.className="stb-item",o.setAttribute("role","status");const l=e.getElementById("sb-mode");return l&&l.parentNode===t?l.after(r,o):t.append(r,o),o}const Mo=2e3,Po=()=>{const e=globalThis.requestIdleCallback,n=globalThis.cancelIdleCallback;return typeof e!="function"||typeof n!="function"?null:{request:t=>e.call(globalThis,t,{timeout:Mo}),cancel:t=>n.call(globalThis,t)}};function Oo({readTotal:e,readSelection:n,render:t,now:r=()=>globalThis.performance?.now?.()??Date.now(),setTimer:o=(i,u)=>setTimeout(i,u),clearTimer:l=i=>clearTimeout(i),idle:c=Po()}){let i=null,u=null,C=!1,y=!1;const P=()=>{!C&&i&&t(i,u)},B=(N,R)=>{const L={timer:null,idle:null,cost:0},j=()=>{if(L.idle=null,C)return;const ue=r();let ne;y=!0;try{ne=N()}catch{ne=void 0}finally{y=!1}L.cost=Math.max(0,r()-ue),R(ne),P()},W=()=>{L.timer!==null&&l(L.timer),L.idle!==null&&c?.cancel(L.idle),L.timer=null,L.idle=null};return{schedule:ue=>{W(),L.timer=o(()=>{L.timer=null,c?L.idle=c.request(j):j()},Math.max(ue,L.cost*So))},cancel:W}},H=B(e,N=>{N&&(i=N)}),D=B(n,N=>{u=N??null});return{start(){C=!1,H.schedule(0),D.schedule(0)},documentChanged(){C||y||(H.schedule(ko),D.schedule(En))},selectionChanged(){C||y||D.schedule(En)},documentSwapped(){C||(H.schedule(0),D.schedule(0))},refresh:P,stop(){C=!0,H.cancel(),D.cancel()}}}const vo=1,On="ieum-dialog-theme",E="data-ieum-dialog-theme",Dt=`
/* ─────────────────────────────────────────────────────────────
   1. Tokens — light
   ───────────────────────────────────────────────────────────── */
:root[${E}] {
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
:root[${E}][data-theme-effective='dark'] {
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
:root[${E}] .modal-overlay {
  background: var(--ieum-dialog-overlay);
  padding: 20px;
  animation: ieum-dialog-veil-in 140ms ease-out both;
}

:root[${E}] .dialog-wrap {
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
:root[${E}] .dialog-title {
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

:root[${E}] .dialog-close {
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

:root[${E}] .dialog-close:hover {
  background: color-mix(in srgb, var(--ieum-dialog-ink) 8%, transparent);
  color: var(--ieum-dialog-ink);
}

/* ─────────────────────────────────────────────────────────────
   6. Body and footer
   ───────────────────────────────────────────────────────────── */
:root[${E}] .dialog-wrap .dialog-body {
  flex: 1 1 auto;
  padding: 18px 20px 16px;
  overscroll-behavior: contain;
}

/* The body scrolls inside the capped shell. Some dialogs keep a fixed body
   height (character shape) or scroll their own panels (object properties). */
:where(:root[${E}]) .dialog-body {
  min-height: 0;
  overflow: auto;
}

/* rhwp lays the footer out as a flex row and hides it while a PDF is being
   prepared, so this rule leaves display alone. */
:root[${E}] .dialog-wrap .dialog-footer {
  flex: 0 0 auto;
  padding: 13px 20px 15px;
  background: var(--ieum-dialog-surface-sunken);
  border-top: 1px solid var(--ieum-dialog-line-soft);
}

/* Dialogs that open with tabs put them on the top edge of the body. */
:root[${E}] .dialog-body > .dialog-tabs:first-child {
  margin: -18px -20px 14px;
}

/* The click-here (누름틀) dialog wraps its tab and form in .field-edit-body;
   let the form own the padding so the tab strip and fields line up with the
   title instead of being inset twice. */
:root[${E}] .dialog-body.field-edit-body,
:root[${E}] .dialog-body:has(> .field-edit-body) {
  padding: 0;
}

:root[${E}] .field-edit-body > .dialog-tabs:first-child {
  margin: 0;
}

/* ─────────────────────────────────────────────────────────────
   7. Buttons
   ───────────────────────────────────────────────────────────── */
:where(:root[${E}]) .dialog-btn {
  min-width: 74px;
  cursor: pointer;
}

:root[${E}] .dialog-btn {
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

:root[${E}] .dialog-btn:hover {
  background: color-mix(in srgb, var(--ieum-dialog-ink) 5%, var(--ieum-dialog-field-surface));
  border-color: var(--ieum-dialog-field-line);
}

:root[${E}] .dialog-btn:active {
  transform: translateY(1px);
}

:root[${E}] .dialog-btn-primary {
  background: var(--ieum-dialog-accent);
  border-color: var(--ieum-dialog-accent);
  color: var(--ieum-dialog-accent-ink);
  box-shadow: var(--ieum-dialog-primary-shadow);
}

:root[${E}] .dialog-btn-primary:hover {
  background: var(--ieum-dialog-accent-strong);
  border-color: var(--ieum-dialog-accent-strong);
}

:root[${E}] .dialog-btn:focus-visible,
:root[${E}] .dialog-close:focus-visible,
:root[${E}] .dialog-tab:focus-visible {
  outline: 2px solid var(--ieum-dialog-focus);
  outline-offset: 2px;
}

/* A filled button already has the accent; a second hard blue keyline reads as
   a rendering fault. Use the same soft halo language as the fields instead. */
:root[${E}] .dialog-btn-primary:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--ieum-dialog-focus) 40%, transparent);
  outline-offset: 1px;
}

:root[${E}] .dialog-btn:disabled,
:root[${E}] .dialog-btn:disabled:hover {
  background: var(--ieum-dialog-surface-sunken);
  border-color: var(--ieum-dialog-line-soft);
  color: var(--ieum-dialog-ink-disabled);
  box-shadow: none;
  transform: none;
}

/* With the pointer cursor above, this stays below the compare dialog's own
   wait cursor on its busy buttons. */
:where(:root[${E}]) .dialog-btn:disabled {
  cursor: not-allowed;
}

/* The small segmented controls some dialogs use for alignment/direction. */
:root[${E}] .dialog-btn-group button {
  min-width: 38px;
  height: 28px;
  border-color: var(--ieum-dialog-field-line);
  background: var(--ieum-dialog-field-surface);
  color: var(--ieum-dialog-ink);
  font-family: var(--ieum-dialog-font);
  font-size: 11px;
  cursor: pointer;
}

:root[${E}] .dialog-btn-group button:hover {
  background: var(--ieum-dialog-accent-soft);
}

/* A tonal selected state keeps the solid accent for the one committing
   action (the footer's primary button) and the dialog's blue edge. */
:root[${E}] .dialog-btn-group button.active {
  background: var(--ieum-dialog-accent-soft);
  border-color: var(--ieum-dialog-accent-line);
  color: var(--ieum-dialog-accent-strong);
  box-shadow: inset 0 0 0 1px var(--ieum-dialog-accent-line);
}

:root[${E}] .dialog-btn-group button:disabled,
:root[${E}] .dialog-btn-group button:disabled:hover,
:root[${E}] .dialog-btn-group button.active:disabled {
  background: var(--ieum-dialog-surface-sunken);
  border-color: var(--ieum-dialog-line-soft);
  color: var(--ieum-dialog-ink-disabled);
  box-shadow: none;
  cursor: not-allowed;
}

/* The tiny "apply to all" spinners inside the cell-properties dialog. */
:root[${E}] .tcp-all-spinner-btn {
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

:root[${E}] .tcp-all-spinner-btn:hover {
  background: var(--ieum-dialog-accent-soft);
  border-color: var(--ieum-dialog-accent-line);
  color: var(--ieum-dialog-ink);
}

/* Border/shading pickers in the same dialog: same hairline and accent as the
   rest of the system, so the tabs do not fall back to the old beveled look. */
:root[${E}] .tcp-line-type-grid {
  border-color: var(--ieum-dialog-line);
  border-radius: 5px;
  background: var(--ieum-dialog-field-surface);
}

:root[${E}] .tcp-line-type-item {
  border-radius: 3px;
}

:root[${E}] .tcp-line-type-item:hover {
  border-color: var(--ieum-dialog-accent-line);
  background: var(--ieum-dialog-accent-soft);
}

:root[${E}] .tcp-line-type-item.active {
  border-color: var(--ieum-dialog-accent);
  background: var(--ieum-dialog-accent-soft);
}

:root[${E}] .tcp-dir-btn,
:root[${E}] .tcp-diag-btn {
  border-color: var(--ieum-dialog-field-line);
  border-radius: var(--ieum-dialog-radius-control);
  background: var(--ieum-dialog-field-surface);
  color: var(--ieum-dialog-ink-muted);
}

:root[${E}] .tcp-dir-btn:hover,
:root[${E}] .tcp-diag-btn:hover {
  border-color: var(--ieum-dialog-accent-line);
  background: var(--ieum-dialog-accent-soft);
  color: var(--ieum-dialog-ink);
}

/* The chosen diagonal line. Restyling the button above would otherwise hide
   rhwp's own selected state. */
:root[${E}] .tcp-diag-btn.active {
  border-color: var(--ieum-dialog-accent);
  background: var(--ieum-dialog-accent-soft);
  color: var(--ieum-dialog-accent-strong);
}

:root[${E}] .tcp-diag-btn:disabled,
:root[${E}] .tcp-diag-btn:disabled:hover {
  border-color: var(--ieum-dialog-line-soft);
  background: var(--ieum-dialog-surface-sunken);
  color: var(--ieum-dialog-ink-disabled);
  cursor: not-allowed;
}

:root[${E}] .tcp-border-preview-svg,
:root[${E}] .tcp-bg-preview {
  border-color: var(--ieum-dialog-line);
  border-radius: 4px;
}

:root[${E}] .tcp-page-border-group {
  border-color: var(--ieum-dialog-line-soft);
  border-radius: 5px;
  background: var(--ieum-dialog-surface-sunken);
}

/* The cell dialog disables a whole row with .tcp-disabled (not the disabled
   attribute). Recolor its parts explicitly instead of fading the row: a
   half-transparent active chip still reads as "selected". */
:root[${E}] .tcp-disabled {
  opacity: 1;
}

:root[${E}] .tcp-disabled .dialog-label,
:root[${E}] .tcp-disabled .dialog-unit {
  color: var(--ieum-dialog-ink-disabled);
}

:root[${E}] .tcp-disabled .dialog-input,
:root[${E}] .tcp-disabled .dialog-select,
:root[${E}] .tcp-disabled .tcp-all-spinner-btn {
  background: var(--ieum-dialog-surface-sunken);
  border-color: var(--ieum-dialog-line-soft);
  color: var(--ieum-dialog-ink-disabled);
  box-shadow: none;
}

:root[${E}] .tcp-disabled .dialog-btn-group button,
:root[${E}] .tcp-disabled .dialog-btn-group button.active {
  background: var(--ieum-dialog-surface-sunken);
  border-color: var(--ieum-dialog-line-soft);
  color: var(--ieum-dialog-ink-disabled);
  box-shadow: none;
}

/* ─────────────────────────────────────────────────────────────
   8. Tabs — paper folder tabs with one blue rule
   ───────────────────────────────────────────────────────────── */
:root[${E}] .dialog-tabs {
  flex: 0 0 auto;
  display: flex;
  gap: 2px;
  padding: 6px 12px 0;
  background: var(--ieum-dialog-surface-sunken);
  border-bottom: 1px solid var(--ieum-dialog-line);
}

:root[${E}] .dialog-tab {
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

:root[${E}] .dialog-tab:hover {
  background: color-mix(in srgb, var(--ieum-dialog-accent) 8%, transparent);
  color: var(--ieum-dialog-ink);
}

:root[${E}] .dialog-tab.active {
  background: var(--ieum-dialog-surface);
  border-color: var(--ieum-dialog-line);
  border-bottom-color: var(--ieum-dialog-surface);
  color: var(--ieum-dialog-ink);
  font-weight: 600;
  box-shadow: inset 0 2px 0 var(--ieum-dialog-accent);
}

/* A one-tab strip is a label with no choice to make: the dialog title already
   says what it is. (The click-here dialog is the one that ships this way.) */
:root[${E}] .dialog-tabs:has(> .dialog-tab:only-child) {
  display: none;
}

/* The editor's older goto dialog uses a private copy of the same tab shape. */
:root[${E}] .goto-tab-bar {
  display: flex;
  gap: 2px;
  padding: 0 0 0 2px;
  border-bottom: 1px solid var(--ieum-dialog-line);
}

:root[${E}] .goto-tab-btn {
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

:root[${E}] .goto-tab-btn:hover {
  background: color-mix(in srgb, var(--ieum-dialog-accent) 8%, transparent);
  color: var(--ieum-dialog-ink);
}

:root[${E}] .goto-tab-btn.active {
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
:root[${E}] .dialog-section {
  padding: 12px 14px;
  border: 1px solid var(--ieum-dialog-line-soft);
  border-radius: 5px;
  background: var(--ieum-dialog-surface-sunken);
}

/* Page setup puts sections side by side with no bottom margin. */
:where(:root[${E}]) .dialog-section {
  margin-bottom: 12px;
}

:where(:root[${E}]) .dialog-section:last-child {
  margin-bottom: 0;
}

:root[${E}] .dialog-section-title {
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
:where(:root[${E}]) .dialog-row {
  gap: 10px;
  margin-bottom: 8px;
}

:where(:root[${E}]) .dialog-row:last-child {
  margin-bottom: 0;
}

:where(:root[${E}]) .dialog-label {
  min-width: 44px;
}

:root[${E}] .dialog-label {
  color: var(--ieum-dialog-ink-muted);
  font-size: 11px;
  font-weight: 500;
}

:root[${E}] .dialog-unit {
  color: var(--ieum-dialog-ink-hint);
  font-size: 11px;
}

/* ─────────────────────────────────────────────────────────────
   10. Fields
   ───────────────────────────────────────────────────────────── */
:root[${E}] :where(
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

:root[${E}] .dialog-input,
:root[${E}] .dialog-select,
:root[${E}] .dialog-text-input,
:root[${E}] .field-edit-input {
  height: 26px;
  padding: 0 8px;
}

:where(:root[${E}]) .dialog-input {
  width: 76px;
}

:root[${E}] .dialog-select {
  padding: 0 6px;
}

/* Number fields: rhwp sizes many of them inline to 40-60px, and a wider inset
   pushes "100" under the spinner. */
:root[${E}] .dialog-input {
  padding: 0 4px;
}

:where(:root[${E}]) .dialog-text-input {
  width: 140px;
}

:root[${E}] .field-edit-input {
  width: 100%;
}

:root[${E}] .field-edit-textarea {
  width: 100%;
  min-height: 92px;
  padding: 8px 10px;
  line-height: 1.55;
  resize: vertical;
}

:root[${E}] :where(
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
:root[${E}] :where(
    .dialog-input,
    .dialog-text-input,
    .field-edit-input,
    .field-edit-textarea,
    .formula-input
  ):read-only {
  background: var(--ieum-dialog-surface-sunken);
  color: var(--ieum-dialog-ink-muted);
}

:root[${E}] :where(
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
:root[${E}] .dialog-radio-group {
  gap: 6px 14px;
}

:root[${E}] .dialog-radio-group label,
:root[${E}] .dialog-checkbox,
:root[${E}] .field-edit-checkbox-row {
  gap: 6px;
  color: var(--ieum-dialog-ink);
  font-size: 12px;
  cursor: pointer;
}

:root[${E}] .dialog-radio-group input[type='radio'],
:root[${E}] .dialog-checkbox input[type='checkbox'],
:root[${E}] .field-edit-checkbox-row input[type='checkbox'] {
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: var(--ieum-dialog-accent);
}

/* Some in-house dialogs (for example the format-copy dialog) build their
   choice rows from bare labels; keep every box on the same accent. */
:root[${E}] .dialog-body input[type='radio'],
:root[${E}] .dialog-body input[type='checkbox'] {
  accent-color: var(--ieum-dialog-accent);
}

/* ─────────────────────────────────────────────────────────────
   12. Field (누름틀) and memo form
   ───────────────────────────────────────────────────────────── */
:root[${E}] .field-edit-body {
  display: flex;
  flex-direction: column;
}

:root[${E}] .field-edit-panel {
  gap: 8px;
  padding: 18px 20px 16px;
}

:root[${E}] .field-edit-label {
  margin-top: 2px;
  color: var(--ieum-dialog-ink-muted);
  font-size: 11px;
  font-weight: 500;
}

:root[${E}] .field-edit-checkbox-row {
  margin-top: 6px;
}

:root[${E}] .field-edit-error {
  color: var(--ieum-dialog-danger) !important;
  font-size: 11px !important;
}

/* ─────────────────────────────────────────────────────────────
   13. Scrollbars
   ───────────────────────────────────────────────────────────── */
:root[${E}] .dialog-body::-webkit-scrollbar,
:root[${E}] .dialog-tab-panel::-webkit-scrollbar,
:root[${E}] .tcp-panel-container::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

:root[${E}] .dialog-body::-webkit-scrollbar-thumb,
:root[${E}] .dialog-tab-panel::-webkit-scrollbar-thumb,
:root[${E}] .tcp-panel-container::-webkit-scrollbar-thumb {
  border: 3px solid transparent;
  border-radius: 999px;
  background-clip: padding-box;
  background-color: color-mix(in srgb, var(--ieum-dialog-ink) 24%, transparent);
}

:root[${E}] .dialog-body::-webkit-scrollbar-track,
:root[${E}] .dialog-tab-panel::-webkit-scrollbar-track,
:root[${E}] .tcp-panel-container::-webkit-scrollbar-track {
  background: transparent;
}

/* ─────────────────────────────────────────────────────────────
   14. Modeless find panel (the dialog's smaller sibling)
   ───────────────────────────────────────────────────────────── */
:root[${E}] .find-dialog {
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

:root[${E}] .find-dialog-title {
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

:root[${E}] .find-dialog-body {
  padding: 14px 16px 4px;
}

:root[${E}] .find-dialog-row {
  gap: 8px;
  margin-bottom: 9px;
}

:root[${E}] .find-dialog-label {
  width: 70px;
  color: var(--ieum-dialog-ink-muted);
  font-size: 11px;
}

:root[${E}] .find-dialog-input {
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

:root[${E}] .find-dialog-input:focus {
  border-color: var(--ieum-dialog-focus);
  outline: none;
  box-shadow:
    0 0 0 3px color-mix(in srgb, var(--ieum-dialog-focus) 18%, transparent),
    var(--ieum-dialog-field-shadow);
}

:root[${E}] .find-dialog-body input[type='checkbox'] {
  margin: 0;
  accent-color: var(--ieum-dialog-accent);
}

:root[${E}] .find-dialog-status {
  color: var(--ieum-dialog-ink-muted);
  font-size: 11px;
}

:root[${E}] .find-dialog-match-count {
  color: var(--ieum-dialog-ink-hint);
  font-size: 11px;
}

:root[${E}] .find-dialog-buttons {
  justify-content: flex-end;
  gap: 6px;
  padding: 4px 16px 12px;
}

:root[${E}] .find-dialog-buttons .dialog-btn {
  min-width: 64px;
}

/* ─────────────────────────────────────────────────────────────
   15. Narrow windows and reduced motion
   ───────────────────────────────────────────────────────────── */
/* rhwp turns dialogs into a bottom sheet below 768px (responsive.css). Follow
   the same breakpoint, or the sheet keeps the card's padding and corners. */
@media (max-width: 767px) {
  :root[${E}] .modal-overlay {
    padding: 0;
  }

  :root[${E}] .dialog-wrap {
    max-height: 90dvh;
    border-radius: 12px 12px 0 0;
  }

  :root[${E}] .dialog-title {
    min-height: 52px;
    padding-left: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  :root[${E}] .modal-overlay,
  :root[${E}] .dialog-wrap {
    animation: none;
  }

  :root[${E}] .dialog-btn {
    transition: none;
  }
}
`;function Ro(e=globalThis.document){const n=e?.documentElement;if(!e||!n)return!1;const t=e.getElementById(On);if(t)t.textContent!==Dt&&(t.textContent=Dt);else{const c=e.createElement("style");c.id=On,c.textContent=Dt,(e.head??n).appendChild(c)}const r=()=>{const c=n.getAttribute("data-theme-skin")==="oldschool";return c?n.removeAttribute(E):n.setAttribute(E,String(vo)),!c},o=r(),l=e.defaultView?.MutationObserver??globalThis.MutationObserver;if(!e.__ieumDialogThemeObserver&&typeof l=="function"){const c=new l(r);c.observe(n,{attributes:!0,attributeFilter:["data-theme-skin"]}),e.__ieumDialogThemeObserver=c}return o}const Lo="ieum-agent",$o=20,Bo=5e3,vn=2e4,Rn=500,Do=2e3,Gt=6e4,Ln=4e3,Ut=100,Ft=30,Go=24,Uo=20,Fo=200,$n=100,Bn=400,Ee=200,Ho=200,jo=100,Jo=2e3,Xo=.2,Dn=600,zo=300,Gn=400,Un=50,Fn=10,Hn=500,jn=50,We=100,Ko=10*1024*1024,rt=60,Wo=8,Jn=400,Vo="□☐▢❑◻",Xn="☑",mn="☑☒",Yr=40,Yo=new Set(["image","picture","shape","group","ole","textbox"]),zn="ext:ieum-reveal",qo="ieum:file-command",Zo="ieum:dirty-changed",Ht=[{command:"save",id:"ext:ieum-save",shortcut:"Ctrl+S"},{command:"saveAs",id:"ext:ieum-save-as",shortcut:"Ctrl+Shift+S"},{command:"pdf",id:"ext:ieum-export-pdf"},{command:"preview",id:"ext:ieum-preview"},{command:"print",id:"ext:ieum-print",shortcut:"Ctrl+P"}],mt="ext:ieum-selection",Kn="ext:ieum-count-characters",Wn="ext:ieum-easy-words",Qo="ieum:easy-words",ea="ieum:missing-fonts",Vn="ext:ieum-select-word",Yn="ext:ieum-select-paragraph",bt="ext:ieum-word-drag",jt="ext:ieum-mark-changes",ta=500,na=2e3;function ra(e,n){const t=JSON.parse(e.getPageInfo(n));return{svg:e.renderPageSvgWithProfile(n,"print"),width:t.width,height:t.height}}const oa="rgba(255, 193, 7, 0.24)",aa="rgba(214, 140, 0, 0.85)",la=4,qn=350,sa=new Set(["delete-paragraph","remove-table-lines","delete-note"]),ia="ieum:memo-removed",ca="ieum:memo-not-copied",Zn="ext:ieum-memo-list",Qn="ext:ieum-memo-selection",ua="ext:ieum-memo-insert",fa="ext:ieum-memo-set",ha="ext:ieum-memo-remove",Jt="ext:ieum-memo-anchors",da="ext:ieum-memo-lock",ga="ext:ieum-memo-unlock",bn=new Set(["body","tableCell","textBox"]),er=new Set(["memo-insert","memo-set","memo-remove"]),tr=1e5,pa=64,qr=80,nr=15,ma=3,ba="rgba(64, 132, 240, 0.16)",xa="rgba(28, 96, 214, 0.7)",ya="rgba(64, 132, 240, 0.32)",wa="rgba(18, 72, 176, 0.95)",Ia=2,Aa=250,Ca="ieum:hwp-memo-copied",rr=15e3,xn=5e3,ka=4e5,Sa=1e5,yn=3,_a=32,Na=3,Ea=5,tn=24,Ta=2e3,or=4,ar=200,lr=50,sr=500,Zr="범위 초과",v=e=>JSON.parse(e),be=/[\u0000-\u001f\u007f]/;function _(e,n){const t=new Error(n);return t.code=e,t}function ir(e){return e instanceof Error?e:_("ENGINE_ERROR",String(e))}function Re(e){if(Array.isArray(e.cellPath)&&e.cellPath.length>0)return e.cellPath.map(t=>({controlIndex:t.controlIndex,cellIndex:t.cellIndex,cellParaIndex:t.cellParaIndex}));const n=e.cellContext;return n?[{controlIndex:n.ctrlIdx,cellIndex:n.cellIdx,cellParaIndex:n.cellPara}]:null}function ot(e,n){const t=Re(e);return{sec:e.sec,para:e.para,...t?{path:t}:{},offset:e.charOffset??0,length:n}}function Ma(e){const n=e.location;if(!n)return null;const t=Array.isArray(n.path)?n.path:[];return t.some(r=>r.type!=="cell")?null:{sec:n.sectionIndex,para:n.paraIndex,...t.length>0?{path:t.map(r=>({controlIndex:r.controlIndex,cellIndex:r.cellIndex,cellParaIndex:r.paraIndex}))}:{},offset:e.startCharIdx??0,length:0}}function Qr(e){return!Array.isArray(e.path)||e.path.length===0?null:e.path.map(n=>({controlIndex:n.controlIndex,cellIndex:Number.isInteger(n.cellIndex)?n.cellIndex:0,cellParaIndex:Number.isInteger(n.cellParaIndex)?n.cellParaIndex:Number.isInteger(n.paraIndex)?n.paraIndex:0}))}function wn(e){if(!bn.has(e.place)||!Number.isInteger(e.sectionIndex)||!Number.isInteger(e.paraIndex))return null;const n=Qr(e);if(e.place!=="body"&&!n)return null;const t=Number.isInteger(e.startCharIdx)?e.startCharIdx:0,r=Number.isInteger(e.endCharIdx)?e.endCharIdx:t;return{sec:e.sectionIndex,para:e.paraIndex,...n?{path:n}:{},offset:t,length:Math.max(0,r-t)}}function Pa(e,n){const t=wn(n);if(!t)return[];const r=t.path;if(t.length>0){const l=v(r?e.getSelectionRectsInCellByPath(t.sec,t.para,JSON.stringify(r),r[r.length-1].cellParaIndex,t.offset,r[r.length-1].cellParaIndex,t.offset+t.length):e.getSelectionRects(t.sec,t.para,t.offset,t.para,t.offset+t.length));return Array.isArray(l)?l:[]}const o=v(r?e.getCursorRectByPath(t.sec,t.para,JSON.stringify(r),t.offset):e.getCursorRect(t.sec,t.para,t.offset));return!o||!Number.isFinite(o.pageIndex)?[]:[{pageIndex:o.pageIndex,x:o.x,y:o.y,width:0,height:o.height??0}]}function de(e){if(typeof e.getMemoList!="function")return[];const n=v(e.getMemoList());return Array.isArray(n)?n:[]}const xt=e=>v(e.getDocumentInfo()).encrypted===!0,Xt=e=>({id:e.id,index:e.index,author:typeof e.author=="string"?e.author:"",text:ee(String(e.text??"").replace(/\s+/g," ").trim(),Ee),place:e.place,page:Number.isInteger(e.page)?e.page:0});function zt(e){return de(e).map(n=>{let t;try{t=Pa(e,n)}catch{t=[]}const r=Number.isInteger(n.page)&&n.page>0?n.page:t.length>0?t[0].pageIndex+1:0;return{id:n.id,index:n.index,author:typeof n.author=="string"?n.author:"",date:n.date??null,text:typeof n.text=="string"?n.text:"",place:typeof n.place=="string"?n.place:"unknown",sectionIndex:Number.isInteger(n.sectionIndex)?n.sectionIndex:null,paraIndex:Number.isInteger(n.paraIndex)?n.paraIndex:null,startCharIdx:Number.isInteger(n.startCharIdx)?n.startCharIdx:null,endCharIdx:Number.isInteger(n.endCharIdx)?n.endCharIdx:null,path:Array.isArray(n.path)?n.path:null,page:r,editable:n.editable===!0,readOnlyReason:typeof n.readOnlyReason=="string"?n.readOnlyReason:null,anchor:wn(n),rects:t,preview:ee(String(n.text??"").replace(/\s+/g," ").trim(),qr)}})}const nn=e=>Array.isArray(e)&&e.length>0?JSON.stringify(e.map(n=>[n.controlIndex,Number.isInteger(n.cellIndex)?n.cellIndex:0,Number.isInteger(n.cellParaIndex)?n.cellParaIndex:Number.isInteger(n.paraIndex)?n.paraIndex:0])):"body",Oa=e=>`${e.sectionIndex}:${e.paraIndex}:${nn(e.path)}`;function cr(e,n,t,r){return e.some(o=>{if(!bn.has(o.place)||Oa(o)!==n)return!1;const l=o.startCharIdx,c=o.endCharIdx;return!Number.isInteger(l)||!Number.isInteger(c)?!1:t===r?l<t&&t<c||l===t&&c===r:l<r&&t<c})}const rn=e=>e.path?e.path[e.path.length-1].cellParaIndex:Number.isInteger(e.paraIndex)?e.paraIndex:e.para;function va(e){return String(e??"").replace(/[\u0000-\u001f\u007f/\\;]/g,"").trim().slice(0,pa)||"IeumOffice"}function Ra(e){if(!e||typeof e!="object")throw _("BAD_ARGUMENT","anchor must be an object");if(!bn.has(e.place))throw _("BAD_ARGUMENT","anchor.place must be body, tableCell or textBox");const{sectionIndex:n,paraIndex:t,startCharIdx:r,endCharIdx:o}=e;if(!Number.isInteger(n)||!Number.isInteger(t))throw _("BAD_ARGUMENT","the anchor paragraph must be a pair of integers");if(!Number.isInteger(r)||!Number.isInteger(o)||r<0||o<r)throw _("BAD_ARGUMENT","the anchor range must be a pair of character offsets");let l=null;if(e.place==="body"){if(e.path!==null&&e.path!==void 0)throw _("BAD_ARGUMENT","a body memo takes no path")}else{if(!Array.isArray(e.path)||e.path.length===0)throw _("BAD_ARGUMENT","a cell or text box memo needs a path");l=e.path.map(c=>{if(!c||!Number.isInteger(c.controlIndex)||!Number.isInteger(c.cellIndex)||!Number.isInteger(c.cellParaIndex))throw _("BAD_ARGUMENT","the anchor path steps must be integers");return{controlIndex:c.controlIndex,cellIndex:c.cellIndex,cellParaIndex:c.cellParaIndex}})}return{place:e.place,sectionIndex:n,paraIndex:t,startCharIdx:r,endCharIdx:o,path:l}}function La(e){const n=e instanceof Error?e.message:String(e);try{const t=JSON.parse(n);if(t&&t.ok===!1&&typeof t.code=="string")return t}catch{}return null}function ur(e,n){if(!e||!n)return!1;if(e.sec!==n.sec)return e.sec>n.sec;if(e.para!==n.para)return e.para>n.para;const t=e.path??[],r=n.path??[];for(let c=0;c<Math.max(t.length,r.length);c++){const i=t[c],u=r[c];if(!i||!u)return!!i;if(i.controlIndex!==u.controlIndex)return i.controlIndex>u.controlIndex;if((i.cellIndex??0)!==(u.cellIndex??0))return(i.cellIndex??0)>(u.cellIndex??0);if((i.cellParaIndex??0)!==(u.cellParaIndex??0))return(i.cellParaIndex??0)>(u.cellParaIndex??0)}const o=Number.isInteger(e.k)?e.k:rn(e),l=Number.isInteger(n.k)?n.k:rn(n);return o!==l?o>l:e.offset>=n.offset}function $a(e,n,t){return de(e).filter(r=>{const o=wn(r);if(!o)return!1;const l={...o,k:rn(o)};return ur(l,n)&&ur(t,l)}).length}function fr(e,n){try{globalThis.dispatchEvent?.(new CustomEvent(e,{detail:n}))}catch{}}function Ba(e,n){const t=e&&e.getInputHandler?e.getInputHandler():null,r=t?t.cursor:null;if(!r||!n||!Number.isInteger(n.sec)||!Number.isInteger(n.para))return!1;const o=Array.isArray(n.path)?n.path:[],l=Number.isInteger(n.offset)?n.offset:0,c=o.length>0?{sectionIndex:n.sec,paragraphIndex:n.para,charOffset:l,parentParaIndex:n.para,controlIndex:o[0].controlIndex,cellIndex:o[0].cellIndex,cellParaIndex:o[0].cellParaIndex,...o.length>1?{cellPath:o}:{}}:{sectionIndex:n.sec,paragraphIndex:n.para,charOffset:l};return r.clearSelection(),r.moveTo(c),Number.isInteger(n.length)&&n.length>0&&(r.setAnchor(),r.moveTo({...c,charOffset:l+n.length})),t.updateCaret&&t.updateCaret(),!0}function hr(e){const n=e&&e.getInputHandler?e.getInputHandler():null,t=n?n.cursor:null;if(!t)return null;if(t.isInCellSelectionMode&&t.isInCellSelectionMode()){const o=t.getSelectedCellRange?t.getSelectedCellRange():null,l=t.getCellTableContext?t.getCellTableContext():null;if(o&&l){const c=t.getExcludedCells?[...t.getExcludedCells()]:[];return{block:{table:l,range:o,excluded:c}}}}if(!t.hasSelection())return null;const r=t.getSelectionOrdered();return r?{start:r.start,end:r.end}:null}const eo=e=>e.map(n=>({controlIndex:n.controlIndex,cellIndex:Number.isInteger(n.cellIndex)?n.cellIndex:0,cellParaIndex:n.cellParaIndex}));function Ge(e){if(!e||!Number.isInteger(e.sectionIndex)||!Number.isInteger(e.charOffset))return null;const n=Array.isArray(e.cellPath)&&e.cellPath.length>0?e.cellPath:Number.isInteger(e.cellIndex)||e.isTextBox?[e]:null;if(!n)return{sec:e.sectionIndex,para:e.paragraphIndex,path:null,k:e.paragraphIndex,offset:e.charOffset};const t=eo(n);return t.some(r=>!Number.isInteger(r.controlIndex)||!Number.isInteger(r.cellParaIndex))?null:{sec:e.sectionIndex,para:Number.isInteger(e.parentParaIndex)?e.parentParaIndex:e.paragraphIndex,path:t,k:t[t.length-1].cellParaIndex,offset:e.charOffset,textBox:e.isTextBox===!0}}function Pt(e,n,t){return e.sec!==n.sec||e.para!==n.para||e.path.length!==n.path.length?!1:e.path.every((r,o)=>{const l=n.path[o],c=o===e.path.length-1;return r.controlIndex===l.controlIndex&&(c?!t||r.cellIndex===l.cellIndex:r.cellIndex===l.cellIndex&&r.cellParaIndex===l.cellParaIndex)})}function Da(){const e=[];let n=0;return{segments:e,add(t,r,o,l){const c=t.length(r),i=Math.min(Math.max(o,0),c),u=Math.min(l,c);u<=i||(n+=u-i,e.push({...t.place(r,u-i),offset:i,text:He(t.text(r,c),i,u)}))},tooLong:()=>e.length>xn||n>ka}}function Ot(e,n,t,r,o){const l=n[t],c=n.map((u,C)=>({child:u,at:C})).filter(({child:u})=>u.parent===t),i=o?ce(e,l):null;for(let u=0;u<l.cells;u++){if(i&&!o(i[u]))continue;const C=ae(e,l,u),y=C.count();for(let P=0;P<y;P++){r.add(C,P,0,1/0);for(const{child:B,at:H}of c){const D=B.path[B.path.length-2];D.cellIndex===u&&D.cellParaIndex===P&&Ot(e,n,H,r,null)}if(r.tooLong())return}}}function Ga(e,n,t,r,o){for(let l=t.sec;l<=r.sec;l++){const c=fe(e,{sec:l,para:0}),i=c.count()-1,u=l===t.sec?t.k:0,C=l===r.sec?Math.min(r.k,i):i;for(let y=u;y<=C;y++){const P=c.length(y),B=l===t.sec&&y===t.k?t.offset:0,H=l===r.sec&&y===r.k?r.offset:P;if(o.add(c,y,B,H),B<=0&&H>=P&&c.objectPositions(y).length>0){const D=n();D.forEach((N,R)=>{N.parent===null&&N.sec===l&&N.para===y&&Ot(e,D,R,o,null)})}if(o.tooLong())return}}}function dr(e,n,t){let r=null;const o=()=>r??=le(e).tables,l=(u,C,y)=>{const P=Fe(u,C,y);return o().findIndex(B=>Fe(B.sec,B.para,B.path)===P)},c=(u,C)=>y=>y.row<=u.endRow&&y.row+y.rowSpan-1>=u.startRow&&y.col<=u.endCol&&y.col+y.colSpan-1>=u.startCol&&!C.has(`${y.row},${y.col}`);let i=!1;if(n.block){const{table:u,range:C,excluded:y}=n.block,P=Array.isArray(u.cellPath)&&u.cellPath.length>0?eo(u.cellPath):[{controlIndex:u.ci,cellIndex:0,cellParaIndex:0}],B=l(u.sec,u.ppi,P);if(B<0)return{ok:!1,reason:"unsupported"};Ot(e,o(),B,t,c(C,new Set(y))),i=!0}else{const u=Ge(n.start),C=Ge(n.end);if(!u||!C)return{ok:!1,reason:"unsupported"};if(u.path&&C.path&&Pt(u,C,!0)){const y=fe(e,{sec:u.sec,para:u.para,cellPath:u.path});for(let P=u.k;P<=C.k;P++)t.add(y,P,P===u.k?u.offset:0,P===C.k?C.offset:1/0);i=!0}else if(u.path&&C.path&&Pt(u,C,!1)){const y=l(u.sec,u.para,u.path);if(y<0)return{ok:!1,reason:"unsupported"};const P=ce(e,o()[y]),B=P[u.path[u.path.length-1].cellIndex],H=P[C.path[C.path.length-1].cellIndex];if(!B||!H)return{ok:!1,reason:"unsupported"};const D={startRow:Math.min(B.row,H.row),endRow:Math.max(B.row+B.rowSpan-1,H.row+H.rowSpan-1),startCol:Math.min(B.col,H.col),endCol:Math.max(B.col+B.colSpan-1,H.col+H.colSpan-1)};Ot(e,o(),y,t,c(D,new Set)),i=!0}else Ga(e,o,u.path?{sec:u.sec,k:u.para,offset:0}:u,C.path?{sec:C.sec,k:C.para,offset:1/0}:C,t)}return{ok:!0,inTable:i}}function gr(e){return e.every((n,t)=>{if(t===0)return!0;const r=e[t-1];if(n.sec!==r.sec)return!1;const o=n.path??null,l=r.path??null;if(!o||!l)return!o&&!l&&n.para>r.para;const c={sec:n.sec,para:n.para,path:o},i={sec:r.sec,para:r.para,path:l};return Pt(c,i,!0)&&o[o.length-1].cellParaIndex>l[l.length-1].cellParaIndex})}const at=/[\p{L}\p{N}]/u;function on(e,n){const t=wo(e);let r=Math.min(n,t.length-1);if(r<0||(!at.test(t[r])&&r>0&&at.test(t[r-1])&&(r-=1),!at.test(t[r])))return null;let o=r,l=r+1;for(;o>0&&at.test(t[o-1]);)o-=1;for(;l<t.length&&at.test(t[l]);)l+=1;return{start:o,end:l}}const pr=e=>typeof e=="string"?v(e):e;function In(e,n){const t=e&&e.getInputHandler?e.getInputHandler():null,r=t?t.cursor:null;if(!r||!r.getPosition||["isInPictureObjectSelection","isInCellSelectionMode"].some(i=>typeof r[i]=="function"&&r[i]()))return null;if(typeof r.isInHeaderFooter=="function"&&r.isInHeaderFooter()){const i={sectionIdx:r.hfSectionIdx,isHeader:r.headerFooterMode==="header",applyTo:r.hfApplyTo},u=r.hfParaIdx,C=pr(e.wasm.getHeaderFooterParaInfo(i.sectionIdx,i.isHeader,i.applyTo,u));return{input:t,kind:"header",key:`hf:${i.sectionIdx}:${i.isHeader}:${i.applyTo}:${u}`,text:String(C?.text??""),offset:r.hfCharOffset,at:y=>({...i,paraIdx:u,charOffset:y}),select:(y,P)=>r.selectHeaderFooterRange(y.at(y.offset),P.at(P.offset),r.hfPreviewPage),forward:()=>{const y=r.getHeaderFooterSelectionOrdered?.();return!y||y.end.paraIdx===r.hfParaIdx&&y.end.charOffset===r.hfCharOffset}}}if(typeof r.isInFootnote=="function"&&r.isInFootnote()){const i=r.fnInnerParaIdx,u=pr(e.wasm.getFootnoteInfo(r.fnSectionIdx,r.fnParaIdx,r.fnControlIdx));return{input:t,kind:"footnote",key:`fn:${r.fnSectionIdx}:${r.fnParaIdx}:${r.fnControlIdx}:${i}`,text:String(u?.texts?.[i]??""),offset:r.fnCharOffset,at:C=>({fnParaIdx:i,charOffset:C}),select:(C,y)=>(r.clearSelection(),r.setFnCursorPosition(C.at(C.offset).fnParaIdx,C.offset),r.setFnAnchor(),r.setFnCursorPosition(y.at(y.offset).fnParaIdx,y.offset),!0),forward:()=>{const C=r.getFootnoteSelectionOrdered?.();return!C||C.end.fnParaIdx===r.fnInnerParaIdx&&C.end.charOffset===r.fnCharOffset}}}const l=r.getPosition(),c=Ge(l);return c?{input:t,kind:"body",key:an({...c,offset:0,length:0}),text:n(c),offset:c.offset,at:i=>({...l,charOffset:i}),select:(i,u)=>(r.clearSelection(),r.moveTo(i.at(i.offset)),r.setAnchor(),r.moveTo(u.at(u.offset)),!0),forward:()=>{const i=r.getSelectionOrdered?.();if(!i)return!0;const u=r.getPosition();return["sectionIndex","paragraphIndex","cellIndex","cellParaIndex","charOffset"].every(C=>i.end[C]===u[C])}}:null}function An(e,n,t){const r=e.select({...e,offset:n},{...e,offset:t});return r!==!1&&e.input.updateCaret&&e.input.updateCaret(),r!==!1}function Ua(e,n){const t=In(e,n);if(!t)return!1;const r=on(t.text,t.offset);return r?An(t,r.start,r.end):!1}function Fa(e,n){const t=In(e,n);return!t||t.text.length===0?!1:An(t,0,pn(t.text))}function Ha(e,n,t,r){const o=In(e,n);if(!o)return r==="start"?null:t;if(r==="start"){const C=on(o.text,o.offset);return C?{place:o,start:C.start,end:C.end,widened:!1}:null}if(!t||o.kind!==t.place.kind)return t;const l=o.key===t.place.key;if(l&&o.offset>=t.start&&o.offset<=t.end)return An(t.place,t.start,t.end),t;const c=l?o.offset>t.end:o.forward(),i=on(o.text,o.offset)??{start:o.offset,end:o.offset};return(c?t.place.select({...t.place,offset:t.start},{...o,offset:i.end}):t.place.select({...t.place,offset:t.end},{...o,offset:i.start}))!==!1&&o.input.updateCaret&&o.input.updateCaret(),{...t,widened:!0}}const an=e=>[e.sec,e.para,(e.path??[]).map(n=>`${n.controlIndex}.${n.cellIndex}.${n.cellParaIndex}`).join("/"),e.offset,e.length].join(":"),_t=(e,n)=>{const t=fe(e,{sec:n.sec,para:n.para,cellPath:n.path});return{box:t,k:t.index}};function mr(e){if(!(Array.isArray(e)&&e.length>0&&e.length<=xn&&e.every(t=>t&&Number.isInteger(t.sec)&&Number.isInteger(t.para)&&Number.isInteger(t.offset)&&Number.isInteger(t.length)&&t.offset>=0&&t.length>=0&&typeof t.text=="string")))throw _("BAD_ARGUMENT","the selection is not one this editor handed out")}function Kt(e,n){return n.every(t=>{try{const{box:r,k:o}=_t(e,t),l=r.text(o,r.length(o));return He(l,t.offset,t.offset+t.length)===t.text}catch{return!1}})}const me=e=>e.equationControl===void 0;function ja(e,n){const t=Math.max(0,n.charOffset-Ft),r=Re(n);if(r){const c=JSON.stringify(r),i=e.getCellParagraphLengthByPath(n.sec,n.para,c),u=Math.min(i-t,n.length+Ft*2);return u>0?e.getTextInCellByPath(n.sec,n.para,c,t,u):""}const o=e.getParagraphLength(n.sec,n.para),l=Math.min(o-t,n.length+Ft*2);return l>0?e.getTextRange(n.sec,n.para,t,l):""}function Ja(e,n){const t=fe(e,n),o=t.text(t.index,t.length(t.index)).slice(n.charOffset,n.charOffset+n.length);for(let l=t.index-1;l>=0&&l>=t.index-Uo;l--){const c=ge(t.text(l,t.length(l)));if(c&&!c.includes(ge(o)))return ee(c,Go)}return""}function Xa(e,n,t){const r={occurrence:t+1,inTable:!!n.cellContext};if(!me(n))return{...r,replaceable:!1};let o=r;try{o={...r,context:ja(e,n)};const l=Ja(e,n);l&&(o.before=l)}catch{}return o}function Ie(e,n){if(typeof n!="string"||n.length===0)throw _("BAD_ARGUMENT","find must be a non-empty string");return v(e.searchAllText(n,!0,!0))}function lt(e){if(typeof e!="string"||be.test(e))throw _("BAD_ARGUMENT","replacement must be one line of plain text")}function F(e,n){const t=v(e);if(t&&t.ok===!1)throw _("ENGINE_REFUSED",`the editor refused to ${n}`)}const Nt=8;function za(e){return Array.from(e).slice(0,Nt).join("")}function yt(e,n,t){const r=Re(n);if(!r){F(e.replaceText(n.sec,n.para,n.charOffset,n.length,t),"replace");return}const o=JSON.stringify(r);if(t.length===0){F(e.deleteTextInCellByPath(n.sec,n.para,o,n.charOffset,n.length),"delete");return}const l=r[r.length-1];if(r.length===1&&typeof e.replaceTextInCellDeferredPagination=="function"){let c=n.length;for(;c>Nt;){const y=c-Nt;F(e.replaceTextInCellDeferredPagination(n.sec,n.para,l.controlIndex,l.cellIndex,l.cellParaIndex,n.charOffset+y,Nt," "),"replace"),c=y+1}const i=za(t),u=Array.from(i).length,C=Array.from(t).length;F(e.replaceTextInCellDeferredPagination(n.sec,n.para,l.controlIndex,l.cellIndex,l.cellParaIndex,n.charOffset,c,i),"replace"),u<C&&F(e.insertTextInCellByPath(n.sec,n.para,o,n.charOffset+u,t.slice(i.length)),"insert");return}F(e.deleteTextInCellByPath(n.sec,n.para,o,n.charOffset,n.length),"delete"),F(e.insertTextInCellByPath(n.sec,n.para,o,n.charOffset,t),"insert")}function fe(e,n){const{sec:t,para:r}=n,o=Re(n);if(!o)return{index:r,inTable:!1,place:(i,u)=>({sec:t,para:i,offset:0,length:u}),count:()=>e.getParagraphCount(t),length:i=>e.getParagraphLength(t,i),text:(i,u)=>u>0?e.getTextRange(t,i,0,u):"",objectPositions:i=>Ka(e,t,i),split:(i,u)=>F(e.splitParagraph(t,i,u),"split the paragraph"),font:i=>vr(()=>e.getCharPropertiesAt(t,i,0)),addAfter:i=>F(e.insertParagraph(t,i+1),"add a paragraph"),insert:(i,u)=>F(e.insertText(t,i,0,u),"insert"),deleteText:(i,u)=>F(e.deleteText(t,i,0,u),"delete"),deleteRange:(i,u,C,y)=>F(e.deleteRange(t,i,u,C,y),"delete"),pasteHtml:(i,u)=>F(e.pasteHtml(t,i,0,u),"insert the table"),formatChars:(i,u,C,y)=>F(e.applyCharFormat(t,i,u,C,y),"format the text"),formatParagraph:(i,u)=>F(e.applyParaFormat(t,i,u),"format the paragraph"),applyStyle:(i,u)=>F(e.applyStyle(t,i,u),"apply the style"),setCharShape:(i,u,C,y)=>F(e.setCharShapeId(t,i,u,C,y),"apply the character style"),styleShape:i=>({style:v(e.getStyleAt(t,i)).id,paraShape:v(e.getParaPropertiesAt(t,i)).paraShapeId})};const l=o[o.length-1],c=i=>JSON.stringify([...o.slice(0,-1),{...l,cellParaIndex:i}]);return{index:l.cellParaIndex,inTable:!0,place:(i,u)=>({sec:t,para:r,path:v(c(i)),offset:0,length:u}),count:()=>e.getCellParagraphCountByPath(t,r,c(0)),length:i=>e.getCellParagraphLengthByPath(t,r,c(i)),text:(i,u)=>u>0?e.getTextInCellByPath(t,r,c(i),0,u):"",objectPositions:()=>[],font:i=>vr(()=>e.getCellCharPropertiesAtByPath(t,r,c(i),0)),split:(i,u)=>F(e.splitParagraphInCellByPath(t,r,c(i),u),"split the paragraph"),insert:(i,u)=>F(e.insertTextInCellByPath(t,r,c(i),0,u),"insert"),deleteText:(i,u)=>F(e.deleteTextInCellByPath(t,r,c(i),0,u),"delete"),deleteRange:(i,u,C,y)=>F(e.deleteRangeInCellByPath(t,r,c(i),i,u,C,y),"delete"),pasteHtml:(i,u)=>F(e.pasteHtmlInCellByPath(t,r,c(i),0,u),"insert the table"),formatChars:(i,u,C,y)=>F(e.applyCharFormatInCellByPath(t,r,c(i),u,C,y),"format the text"),formatParagraph:o.length===1?(i,u)=>F(e.applyParaFormatInCell(t,r,l.controlIndex,l.cellIndex,i,u),"format the paragraph"):null,applyStyle:o.length===1?(i,u)=>F(e.applyCellStyle(t,r,l.controlIndex,l.cellIndex,i,u),"apply the style"):null,setCharShape:(i,u,C,y)=>F(e.setCharShapeIdInCellByPath(t,r,c(i),u,C,y),"apply the character style"),styleShape:o.length===1?i=>({style:v(e.getCellStyleAt(t,r,l.controlIndex,l.cellIndex,i)).id,paraShape:v(e.getCellParaPropertiesAt(t,r,l.controlIndex,l.cellIndex,i)).paraShapeId}):null}}function X(e,n=null){const t=v(e.getFieldList()),r=t.filter(C=>C.fieldType!=="memo"),o=n?r.filter(C=>C.cellField!==!0&&!n.has(C.fieldId)):r,l=v(e.getControls()),c=l.filter(C=>C.ctrlId===""&&C.ctrlCh===0),i=new Set;let u=0;for(const C of t.filter(y=>y.fieldType==="memo")){const y=c.findIndex((P,B)=>!i.has(B)&&Number.isInteger(C.listId)&&P.list===C.listId&&P.para===C.paraInList);y<0||(i.add(y),u+=1)}return{controls:l.length-u,fields:JSON.stringify(o.map(C=>C.value??""))}}function Ka(e,n,t){const r=v(e.getControlTextPositions(n,t)),o=de(e).filter(l=>l.place==="body"&&l.sectionIndex===n&&l.paraIndex===t).map(l=>l.startCharIdx).filter(l=>Number.isInteger(l));return r.filter(l=>!o.includes(l))}const ln=/^#[0-9a-fA-F]{6}$/,br=["left","center","right","justify"],Wa=["bold","italic","underline","strikethrough"],xr=64,Va=7,Ya=200,qa={indent:{min:-100,max:100,key:"indent"},marginLeft:{min:0,max:300,key:"marginLeft"},marginRight:{min:0,max:300,key:"marginRight"},spacingBefore:{min:0,max:200,key:"spacingBefore"},spacingAfter:{min:0,max:200,key:"spacingAfter"}},yr=["number","bullet","none"],wr=7,Za="●",Ce=0,Pe=1,Qa="#style-name",el=400,Ir="ext:ieum-caret-state";function tl(e,n){const t=Array.from(e.options,o=>[Number(o.value),o.textContent]);if(JSON.stringify(t)===JSON.stringify(n.map(o=>[o.id,o.name])))return!1;const r=e.value;return e.replaceChildren(...n.map(o=>{const l=e.ownerDocument.createElement("option");return l.value=String(o.id),l.textContent=o.name,l})),n.some(o=>String(o.id)===r)?e.value=r:e.selectedIndex=-1,!0}const Ar=250,nl=/["\\]/;function it(e,n){if(!e||typeof e!="object"||Array.isArray(e))throw _("BAD_ARGUMENT","format must be an object");const t=y=>e[y]!==void 0&&e[y]!==null,r={};for(const y of Wa)if(t(y)){if(typeof e[y]!="boolean")throw _("BAD_ARGUMENT",`${y} must be true or false`);r[y]=e[y]}if(t("size")){if(typeof e.size!="number"||!(e.size>=or&&e.size<=ar))throw _("BAD_ARGUMENT",`size must be ${or} to ${ar} points`);r.fontSize=Math.round(e.size*100)}if(t("color")){if(typeof e.color!="string"||!ln.test(e.color))throw _("BAD_ARGUMENT","color must look like #RRGGBB");r.textColor=e.color.toLowerCase()}if(t("highlight")){const y=e.highlight==="none";if(!y&&(typeof e.highlight!="string"||!ln.test(e.highlight)))throw _("BAD_ARGUMENT",'highlight must look like #RRGGBB, or be "none"');r.shadeColor=y?"#ffffff":e.highlight.toLowerCase()}let o=null;if(t("font")){const y=typeof e.font=="string"?e.font.trim():"";if(!y||y.length>xr||be.test(y))throw _("BAD_ARGUMENT",`font must be a font name of 1 to ${xr} characters`);o=y}const l={};if(t("align")){if(!br.includes(e.align))throw _("BAD_ARGUMENT",`align must be one of ${br.join(", ")}`);l.alignment=e.align}if(t("lineSpacing")){const y=e.lineSpacing;if(typeof y!="number"||!(y>=lr&&y<=sr))throw _("BAD_ARGUMENT",`lineSpacing must be ${lr} to ${sr} percent`);l.lineSpacing=Math.round(y),l.lineSpacingType="Percent"}for(const[y,{min:P,max:B,key:H}]of Object.entries(qa)){if(!t(y))continue;const D=e[y];if(typeof D!="number"||!(D>=P&&D<=B))throw _("BAD_ARGUMENT",`${y} must be ${P} to ${B} points`);l[H]=Math.round(D*Ya)}if(t("list")){if(!yr.includes(e.list))throw _("BAD_ARGUMENT",`list must be one of ${yr.join(", ")}`);l.list={kind:e.list,level:0,bullet:Za}}if(t("listLevel")){if(!l.list||l.list.kind==="none")throw _("BAD_ARGUMENT",'listLevel goes with list "number" or "bullet"');const y=e.listLevel;if(!Number.isInteger(y)||y<1||y>wr)throw _("BAD_ARGUMENT",`listLevel must be a whole number from 1 to ${wr}`);l.list.level=y-1}if(t("bullet")){if(l.list?.kind!=="bullet")throw _("BAD_ARGUMENT",'bullet goes with list "bullet"');if(typeof e.bullet!="string"||[...e.bullet].length!==1||be.test(e.bullet)||e.bullet.trim()==="")throw _("BAD_ARGUMENT","bullet must be one visible character");l.list.bullet=e.bullet}let c=null;if(t("style")){const y=typeof e.style=="string"?e.style.trim():"";if(!y||be.test(y))throw _("BAD_ARGUMENT","style must be a style name");c=y}let i=null;if(t("charStyle")){const y=typeof e.charStyle=="string"?e.charStyle.trim():"";if(!y||be.test(y))throw _("BAD_ARGUMENT","charStyle must be a style name");i=y}const u=Object.keys(r).length>0||o!==null||i!==null,C=Object.keys(l).length>0||c!==null;if(C&&!n)throw _("BAD_ARGUMENT","align, lineSpacing, indents, margins, spacing, list and style belong to a whole paragraph");if(!u&&!C)throw _("BAD_ARGUMENT","format names nothing to change");return{chars:Object.keys(r).length>0||o!==null?r:null,font:o,paragraph:Object.keys(l).length>0?l:null,style:c,charStyle:i}}function Me(e,n,t){const r=n.toLowerCase();return v(e.getStyleList()).find(o=>(t===null||o.type===t)&&(String(o.name??"").toLowerCase()===r||String(o.englishName??"").toLowerCase()===r))??null}function to(e,n){return Me(e,n,Ce)?.id??null}const De=(e,n=Ce)=>({ok:!1,reason:"no_such_style",kind:n===null?"any":n===Pe?"character":"paragraph",styles:v(e.getStyleList()).filter(t=>n===null||t.type===n).map(t=>t.name)});function wt(e,n){return n.style&&to(e,n.style)===null?De(e):n.charStyle&&Me(e,n.charStyle,Pe)===null?De(e,Pe):null}function Wt(e,n,t){if(!n.styleShape)return null;const{style:r,paraShape:o}=n.styleShape(t),l=v(e.getStyleList()).find(c=>c.id===r);return l?l.paraShapeId!==o:!1}const rl=new Set(["#000000","#ffffff"]);function sn(e){const n=typeof e.textColor=="string"?e.textColor.toLowerCase():"",t=n!==""&&!rl.has(n),r=e.italic===!0;return!t&&!r?null:JSON.stringify({...t?{textColor:"#000000"}:{},...r?{italic:!1}:{}})}function ol(e,n,t,r,o){if(!Number.isInteger(o)||o<=0)return;const l=JSON.stringify(oe(n.path,t,r));let c;try{c=sn(v(e.getCellCharPropertiesAtByPath(n.sec,n.para,l,0)))}catch{return}c&&F(e.applyCharFormatInCellByPath(n.sec,n.para,l,0,o,c),"write the answer")}const ut=e=>`${e.fieldId}|${JSON.stringify(e.location??null)}|${e.startCharIdx??""}`;function Cr(e,n,t){const r=v(e.getFieldList()),o=r.findIndex(D=>ut(D)===n),l=r[o];if(!l)throw _("CHANGED","the document changed mid-call");const c=r.filter(D=>D.fieldId===l.fieldId).length;if(c<2){F(e.setFieldValue(l.fieldId,t),"fill the field");return}const i=()=>_("AMBIGUOUS_FIELD",`field ${o+1} shares its id with ${c-1} other field(s) and could not be filled on its own`),u=l.location,C=l.startCharIdx,y=l.endCharIdx,P=u&&Array.isArray(u.path)?u.path:[];if(!u||!Number.isInteger(C)||!Number.isInteger(y)||y<C)throw i();if(P.length>0){if(!P.every(N=>N.type==="cell"))throw i();const D=JSON.stringify(P.map(N=>({controlIndex:N.controlIndex,cellIndex:N.cellIndex,cellParaIndex:N.paraIndex})));y>C&&F(e.deleteTextInCellByPath(u.sectionIndex,u.paraIndex,D,C,y-C),"fill the field"),t&&F(e.insertTextInCellByPath(u.sectionIndex,u.paraIndex,D,C,t),"fill the field")}else y>C&&F(e.deleteText(u.sectionIndex,u.paraIndex,C,y-C),"fill the field"),t&&F(e.insertText(u.sectionIndex,u.paraIndex,C,t),"fill the field");const B=v(e.getFieldList());if(!(B.length===r.length&&B[o]?.value===t&&r.every((D,N)=>N===o||D.fieldId!==l.fieldId||B[N]?.value===D.value)))throw i()}function kr(e,n,t=null){if(!(t?t.size===0:!n))for(const r of v(e.getFieldList())){if(t?!t.has(ut(r)):!n.has(r.fieldId))continue;const o=r.startCharIdx,l=r.endCharIdx;if(!Number.isInteger(o)||!Number.isInteger(l)||l<=o)continue;const c=r.location??{},i=Array.isArray(c.path)?c.path:null;try{if(i){if(!i.every(P=>P.type==="cell"))continue;const u=i.map(P=>({controlIndex:P.controlIndex,cellIndex:P.cellIndex,cellParaIndex:P.paraIndex})),C=JSON.stringify(u),y=sn(v(e.getCellCharPropertiesAtByPath(c.sectionIndex,c.paraIndex,C,o)));y&&F(e.applyCharFormatInCellByPath(c.sectionIndex,c.paraIndex,C,o,l,y),"write the answer")}else{const u=sn(v(e.getCharPropertiesAt(c.sectionIndex,c.paraIndex,o)));u&&F(e.applyCharFormat(c.sectionIndex,c.paraIndex,o,l,u),"write the answer")}}catch{}}}function Ve(e,n){let t=null;if(n.chars){const l={...n.chars};if(n.font){const c=[];for(let i=0;i<Va;i++){const u=e.findOrCreateFontIdForLang(i,n.font);if(!Number.isInteger(u)||u<0)throw _("ENGINE","the font could not be set");c.push(u)}l.fontIds=c}t=JSON.stringify(l)}let r=null;if(n.style&&(r=to(e,n.style),r===null))throw _("CHANGED","the style is gone");let o=null;if(n.charStyle){const l=Me(e,n.charStyle,Pe);if(!l)throw _("CHANGED","the style is gone");o=l.charShapeId}return{chars:t,paragraph:n.paragraph?JSON.stringify(al(e,n.paragraph)):null,style:r,charShape:o}}function al(e,n){const{list:t,...r}=n;if(!t)return r;if(t.kind==="none")return{...r,headType:"None"};const o=t.kind==="number"?e.ensureDefaultNumbering():e.ensureDefaultBullet(t.bullet);if(!Number.isInteger(o)||o<=0)throw _("ENGINE","the list could not be set");return{...r,headType:t.kind==="number"?"Number":"Bullet",numberingId:o,paraLevel:t.level}}function Ne(e,n){const t=typeof e=="string"?e.trim():"";if(!t||t.length>Ar||nl.test(t)||be.test(t))throw _("BAD_ARGUMENT",`${n} must be 1 to ${Ar} characters, without quotes, backslashes or line breaks`);return t}function Sr(e,n){if(e==null)return null;if(typeof e!="object"||Array.isArray(e))throw _("BAD_ARGUMENT","format must be an object");if(Object.values(e).every(r=>r==null))return null;if(e.style!=null||e.charStyle!=null)throw _("BAD_ARGUMENT","a style is not made of other styles: pass its formatting");const t=it(e,!0);if(!n&&t.paragraph)throw _("BAD_ARGUMENT","a character style has character formatting only: align, lineSpacing, indents, margins and spacing belong to a paragraph style");return t}function _r(e,n,t){if(!t)return;const{chars:r,paragraph:o}=Ve(e,t);if(!e.updateStyleShapes(n,r??"{}",o??"{}"))throw _("ENGINE_REFUSED","the editor refused to change the style")}function It(e,n,t=null){const r=Me(e,n,null);return r!==null&&r.id!==t}const Ye=e=>Math.round(e*7.5)/10,vt=e=>Math.round(e*3.75)/10;function no(e,n){const{charProps:t,paraProps:r}=v(e.getStyleDetail(n.id)),o={font:t.fontFamily,size:t.fontSize/100,bold:t.bold===!0,italic:t.italic===!0,underline:t.underline===!0,strikethrough:t.strikethrough===!0,color:t.textColor};return n.type!==Ce?o:{...o,align:r.alignment,...r.lineSpacingType==="Percent"?{lineSpacing:r.lineSpacing}:{},indent:Ye(r.indent),marginLeft:Ye(r.marginLeft),marginRight:Ye(r.marginRight),spacingBefore:vt(r.spacingBefore),spacingAfter:vt(r.spacingAfter)}}const cn=e=>e.type===Pe?"character":"paragraph",ro=7200/25.4,Ue=e=>Math.round(e/ro*10)/10,Vt=e=>Math.round(e*ro),un={A3:[297,420],A4:[210,297],A5:[148,210],B4:[257,364],B5:[182,257],Letter:[215.9,279.4],Legal:[215.9,355.6]},fn={left:"marginLeft",right:"marginRight",top:"marginTop",bottom:"marginBottom",header:"marginHeader",footer:"marginFooter",gutter:"marginGutter"},Nr=50,Er=1e3,ll=200,Tr=20;function hn(e,n){const t=v(e.getPageDef(n)),r=Ue(t.width),o=Ue(t.height),l=Object.entries(un).find(([,[i,u]])=>Math.abs(i-r)<1&&Math.abs(u-o)<1)?.[0]??null,c={};for(const[i,u]of Object.entries(fn))c[i]=Ue(t[u]??0);return{...l?{paper:l}:{},width:r,height:o,orientation:t.landscape===!0?"landscape":"portrait",margins:c}}function sl(e){if(!e||typeof e!="object"||Array.isArray(e))throw _("BAD_ARGUMENT","the page setup must be an object");const n={},t=o=>e[o]!==void 0&&e[o]!==null,r=(o,l,c,i)=>{if(typeof o!="number"||!(o>=l&&o<=c))throw _("BAD_ARGUMENT",`${i} must be ${l} to ${c} millimetres`);return Vt(o)};if(t("paper")){const o=un[e.paper];if(!o)throw _("BAD_ARGUMENT",`paper must be one of ${Object.keys(un).join(", ")}`);if(t("width")||t("height"))throw _("BAD_ARGUMENT","give paper or width and height, not both");n.width=Vt(o[0]),n.height=Vt(o[1])}else if(t("width")||t("height")){if(!t("width")||!t("height"))throw _("BAD_ARGUMENT","width and height go together");n.width=r(e.width,Nr,Er,"width"),n.height=r(e.height,Nr,Er,"height")}if(t("orientation")){if(e.orientation!=="portrait"&&e.orientation!=="landscape")throw _("BAD_ARGUMENT","orientation must be portrait or landscape");n.landscape=e.orientation==="landscape"}if(t("margins")){if(typeof e.margins!="object"||Array.isArray(e.margins))throw _("BAD_ARGUMENT","margins must be an object");for(const[o,l]of Object.entries(e.margins)){if(l==null)continue;const c=fn[o];if(!c)throw _("BAD_ARGUMENT",`margins take ${Object.keys(fn).join(", ")}, not ${String(o)}`);n[c]=r(l,0,ll,`the ${o} margin`)}}if(Object.keys(n).length===0)throw _("BAD_ARGUMENT","the page setup names nothing to change");return n}function il(e,n){const t={...e,...n},r=t.landscape===!0,o=Ue(r?t.height:t.width),l=Ue(r?t.width:t.height),c=o-Ue(t.marginLeft+t.marginRight+(t.marginGutter??0)),i=l-Ue(t.marginTop+t.marginBottom+(t.marginHeader??0)+(t.marginFooter??0));return c>=Tr&&i>=Tr}const cl=["digit","circledDigit","upperRoman","lowerRoman","upperAlpha","lowerAlpha","circledUpperAlpha","circledLowerAlpha","hangulSyllable","circledHangulSyllable","hangulJamo","circledHangulJamo","hangulDigit","hanjaDigit","circledHanjaDigit","userChar"],ul={footnote:["continue","restartSection","restartPage"],endnote:["continue","restartSection"]},fl={footnote:["eachColumn","belowText","rightColumn"],endnote:["documentEnd","sectionEnd"]},Mr=9999;function ct(e,n,t){const r=n==="footnote"?e.getFootnoteShape:e.getEndnoteShape;if(typeof r!="function")return null;const o=v(r.call(e,t));return o.ok?{numberFormat:o.numberFormat,...o.numberFormat==="userChar"?{symbol:o.userChar}:{},prefix:o.prefixChar,suffix:o.suffixChar,superscript:o.numberCodeSuperscript===!0,startNumber:o.startNumber,numbering:o.numbering,placement:o.placement,separator:o.separatorEnabled===!0}:null}function hl(e,n){if(!kn.includes(e))throw _("BAD_ARGUMENT","kind must be footnote or endnote");if(!n||typeof n!="object"||Array.isArray(n))throw _("BAD_ARGUMENT","the settings must be an object");const t=c=>n[c]!==void 0&&n[c]!==null,r=(c,i)=>{if(!i.includes(n[c]))throw _("BAD_ARGUMENT",`${c} must be one of ${i.join(", ")}`);return n[c]},o=c=>{const i=n[c];if(typeof i!="string"||[...i].length>1||be.test(i))throw _("BAD_ARGUMENT",`${c} must be one character, or "" for none`);return i},l={};if(t("numberFormat")&&(l.numberFormat=r("numberFormat",cl)),t("symbol")){const c=o("symbol");if(c==="")throw _("BAD_ARGUMENT","symbol must be one character");l.userChar=c}if(l.numberFormat==="userChar"&&l.userChar===void 0)throw _("BAD_ARGUMENT","numberFormat userChar needs the symbol");if(t("prefix")&&(l.prefixChar=o("prefix")),t("suffix")&&(l.suffixChar=o("suffix")),t("superscript")){if(typeof n.superscript!="boolean")throw _("BAD_ARGUMENT","superscript must be true or false");l.numberCodeSuperscript=n.superscript}if(t("startNumber")){if(!Number.isInteger(n.startNumber)||n.startNumber<1||n.startNumber>Mr)throw _("BAD_ARGUMENT",`startNumber must be a whole number from 1 to ${Mr}`);l.startNumber=n.startNumber}if(t("numbering")&&(l.numbering=r("numbering",ul[e])),t("placement")&&(l.placement=r("placement",fl[e])),t("separator")){if(typeof n.separator!="boolean")throw _("BAD_ARGUMENT","separator must be true or false");l.separatorEnabled=n.separator}if(Object.keys(l).length===0)throw _("BAD_ARGUMENT","the settings name nothing to change");return l}const dl=14174;function gl(e,n,t,r){if(r.separatorEnabled!==!0)return r;const{separatorEnabled:o,...l}=r;return ct(e,n,t)?.separator?l:{...l,separatorLineType:1,separatorLineWidth:1,separatorLength:dl}}const pl=6e3,Et=40,ml=2,oo=60,bl=200;function xl(e){let n=2166136261;for(let t=0;t<e.length;t++)n^=e.charCodeAt(t),n=Math.imul(n,16777619)>>>0;return`L${n.toString(36).padStart(6,"0").slice(-6)}`}function yl(e,n,t,r){try{const o=v(e.getParaPropertiesAt(n,t)),l=v(e.getCharPropertiesAt(n,t,0)),c=v(e.getStyleAt(n,t)).id,i=o.headType==="Number"||o.headType==="Bullet"||o.headType==="Outline";return{style:r.get(c)??"",font:l.fontFamily,size:l.fontSize/100,bold:l.bold===!0,italic:l.italic===!0,underline:l.underline===!0,color:l.textColor,align:o.alignment,...o.lineSpacingType==="Percent"?{lineSpacing:o.lineSpacing}:{lineSpacingKind:o.lineSpacingType},indent:Ye(o.indent),marginLeft:Ye(o.marginLeft),marginRight:Ye(o.marginRight),spacingBefore:vt(o.spacingBefore),spacingAfter:vt(o.spacingAfter),...i?{list:o.headType==="Bullet"?"bullet":o.headType==="Outline"?"outline":"number",listLevel:(o.paraLevel??0)+1}:{}}}catch{return null}}function Rt(e){const n=new Map(v(e.getStyleList()).map(c=>[c.id,c.name])),t=new Map;let r=0,o=!1;for(let c=0;c<e.getSectionCount()&&!o;c++){const i=e.getParagraphCount(c);for(let u=0;u<i;u++){if(r>=pl){o=!0;break}let C;try{C=e.getParagraphLength(c,u)}catch{continue}const y=C>0?ge(Cn(e,c,u)):"";if(!y)continue;const P=yl(e,c,u,n);if(!P)continue;r+=1;const B=JSON.stringify(P);let H=t.get(B);H||(H={id:xl(B),look:P,places:[],samples:[],mixed:0},t.set(B,H)),H.places.push({sec:c,para:u,length:C}),H.samples.length<ml&&H.samples.push(ee(y,oo));try{v(e.getCharShapeRuns(c,u,0,C)).length>1&&(H.mixed+=1)}catch{}}}return{looks:[...t.values()].sort((c,i)=>i.places.length-c.places.length),counted:r,truncated:o}}function Pr(e){const n=e.getSectionCount(),t=[];for(let y=0;y<n;y++)t.push(hn(e,y));const r=t.every(y=>JSON.stringify(y)===JSON.stringify(t[0])),{looks:o,counted:l,truncated:c}=Rt(e),i=new Map;for(const y of o)y.look.style&&i.set(y.look.style,(i.get(y.look.style)??0)+y.places.length);const u=v(e.getStyleList()).filter(y=>i.has(y.name)||y.type===Pe).map(y=>({name:y.name,kind:cn(y),paragraphs:i.get(y.name)??0,look:no(e,y)})),C={};for(const y of kn){const P=ct(e,y,0);P&&(C[y]=P)}return{pageSetup:r?t[0]:t.map((y,P)=>({section:P+1,...y})),notes:C,styles:u,paragraphs:l,looks:o.slice(0,Et).map(y=>({id:y.id,paragraphs:y.places.length,...y.look,...y.mixed>0?{mixedFormatting:y.mixed}:{},samples:y.samples})),...o.length>Et?{otherLooks:o.length-Et}:{},...c?{truncated:!0}:{}}}function wl(e,n){const{looks:t,truncated:r}=Rt(e),o=[];for(const u of t)for(const C of u.places)o.push({...C,look:u.id});o.sort((u,C)=>u.sec-C.sec||u.para-C.para);const l=Number.isInteger(n)&&n>1?Math.min(n-1,o.length):0,c=o.slice(l,l+bl).map((u,C)=>({paragraph:l+C+1,look:u.look,text:ee(ge(Cn(e,u.sec,u.para)),oo)})),i=l+c.length;return{count:o.length,paragraphs:c,...i<o.length?{next:i+1}:{},...r?{truncated:!0}:{}}}function Il(e){const n=globalThis.atob(e),t=new Uint8Array(n.length);for(let r=0;r<n.length;r++)t[r]=n.charCodeAt(r);return t}function At(e){if(e!=="after"&&e!=="before"&&e!=="end")throw _("BAD_ARGUMENT",'where must be "after", "before" or "end"')}const Al=10*1024*1024;function Cl(e,n){const t=n==="png"||n==="jpg"||n==="gif"?n:null;if(typeof e!="string"||e===""||!t)throw _("BAD_ARGUMENT","the picture must be base64 PNG, JPEG or GIF bytes");let r;try{r=Uint8Array.from(atob(e),c=>c.charCodeAt(0))}catch{throw _("BAD_ARGUMENT","the picture is not base64")}if(r.byteLength===0||r.byteLength>Al)throw _("BAD_ARGUMENT","the picture is empty or too large");const o=(...c)=>c.every((i,u)=>r[u]===i);if(!(t==="png"?o(137,80,78,71):t==="jpg"?o(255,216):o(71,73,70,56)))throw _("BAD_ARGUMENT",`the bytes are not a ${t.toUpperCase()} picture`);return{bytes:r,extension:t}}function kl(e){if(!(Array.isArray(e)&&e.length>0&&e.length<=$n&&e.every(t=>typeof t=="string"&&!be.test(t))))throw _("BAD_ARGUMENT",`paragraphs must be 1 to ${$n} strings, each one line of plain text`)}function Sl(e){const n=Array.isArray(e)&&e.length>0&&e.every(r=>Array.isArray(r)&&r.length>0&&r.every(o=>typeof o=="string"&&!be.test(o))),t=n?Math.max(...e.map(r=>r.length)):0;if(!n||e.length*t>Bn)throw _("BAD_ARGUMENT",`rows must be a non-empty list of rows of one-line strings, at most ${Bn} cells`);return e.map(r=>[...r,...Array(t-r.length).fill("")])}const dn=e=>e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"),_l="border:0.4pt solid #000000;padding:1.41pt 5.1pt",ao="#e5e5e5",Nl=2.82,El=1.6,Or=10;function vr(e){try{const n=v(e()),t=typeof n.fontFamily=="string"?n.fontFamily.replace(/["';<>]/g,""):"",r=Number(n.fontSize)/100;return{family:t,points:r>0?r:Or}}catch{return{family:"",points:Or}}}function Tl(e,n,t,r){const o=Math.round((n.points*El+Nl)*10)/10,l=[n.family?`font-family:${n.family};mso-fareast-font-family:${n.family}`:"",`font-size:${n.points}pt`].filter(Boolean).join(";"),c=`${_l};height:${o}pt`,i=y=>`<td style="${c}"><span style="${l}">${dn(y)}</span></td>`,u=y=>`<th style="${c}${r?`;background-color:${ao}`:""}"><p style="text-align:center"><span style="${l};font-weight:bold">${dn(y)}</span></p></th>`;return`<table>${e.map((y,P)=>`<tr>${y.map(t&&P===0?u:i).join("")}</tr>`).join("")}</table>`}function Ml(e,n,t){const r=v(e.getControlTextPositions(n.sec,n.para)).length;for(let o=r-1;o>=0;o--){try{e.getTableDimensionsByPath(n.sec,n.para,JSON.stringify([{controlIndex:o,cellIndex:0,cellParaIndex:0}]))}catch{continue}const l=JSON.stringify({fillType:"solid",fillColor:ao,patternType:-1});for(let c=0;c<t;c++)F(e.setCellProperties(n.sec,n.para,o,c,l),"shade the header");return}}const Pl=/&#(\d+);|&#x([0-9a-fA-F]+);/g,Ol=e=>e.replace(Pl,(n,t,r)=>String.fromCodePoint(t?Number(t):parseInt(r,16))),ge=e=>e.replace(/\s+/g," ").trim();function vl(e){const n=Ol(v(e.getTextFileText())),t=n.split(/\r?\n/),r=new Map;t.forEach((N,R)=>{const L=ge(N);if(!L)return;const j=r.get(L);j?j.push(R):r.set(L,[R])});const o=new Set;for(const N of v(e.getFieldList())){const R=N.location;if(N.fieldType!=="clickhere"||N.cellField===!0||!R)continue;const j=(Array.isArray(R.path)?R.path:[])[0];o.add(j&&j.type==="cell"?`${R.sectionIndex}/${R.paraIndex}/${j.controlIndex}.${j.cellIndex}.${j.paraIndex}`:`${R.sectionIndex}/${R.paraIndex}`)}const l=new Map,c=new Map;let i=-1,u=Ta,C=null;const y=N=>{const R=r.get(N),L=l.get(N)??0;return!R||L>=R.length?!1:(l.set(N,L+1),i=Math.max(i,R[L]),!0)},P=N=>{const R=c.get(i);R?R.push(N):c.set(i,[N])},B=N=>{const R=ge(N);!R||y(R)||u>0&&(u-=1,C??=n.replace(/\s+/g,""),C.includes(R.replace(/\s+/g,"")))||P(N.trim())},H=e.getSectionCount();for(let N=0;N<H;N++){const R=e.getParagraphCount(N);for(let L=0;L<R;L++){const j=e.getParagraphLength(N,L);j>0&&!o.has(`${N}/${L}`)&&B(e.getTextRange(N,L,0,j));const W=v(e.getControlTextPositions(N,L)).length;for(let q=0;q<W;q++){let ue;try{ue=v(e.getTableDimensions(N,L,q))}catch{continue}const ne=[];for(let Q=0;Q<ue.cellCount;Q++){const se=e.getCellParagraphCount(N,L,q,Q);for(let ie=0;ie<se;ie++){if(o.has(`${N}/${L}/${q}.${Q}.${ie}`))continue;const he=e.getCellParagraphLength(N,L,q,Q,ie);he>0&&ne.push(e.getTextInCell(N,L,q,Q,ie,0,he))}}const Z=ne.some(Q=>{const se=r.get(ge(Q));return!!se&&(l.get(ge(Q))??0)<se.length});for(const Q of ne)Z?B(Q):ge(Q)&&P(Q.trim())}}}if(c.size===0)return t.join(`
`);const D=[...c.get(-1)??[]];return t.forEach((N,R)=>{D.push(N);const L=c.get(R);L&&D.push(...L)}),D.join(`
`)}function Rl(e){const n=[],t=e.getSectionCount();for(let o=0;o<t&&n.length<We;o++){const l=e.getParagraphCount(o);for(let c=0;c<l&&n.length<We;c++){let i;try{i=v(e.getControlTextPositions(o,c))}catch{continue}for(let u=0;u<i.length;u++){let C;try{C=e.getControlImageMime(o,c,"[]",u)}catch{continue}C.startsWith("image/")&&n.push(Rr(e,o,c,u,i[u],C))}}}if(n.length>=We)return n;const{tables:r}=le(e);return r.forEach((o,l)=>{if(!(n.length>=We))for(let c=0;c<o.cells;c++){let i;try{i=e.getCellParagraphCountByPath(o.sec,o.para,JSON.stringify(oe(o.path,c,0)))}catch{continue}for(let u=0;u<i&&n.length<We;u++){const C=oe(o.path,c,u);for(let y=0;y<Wo;y++){let P;try{P=e.getControlImageMime(o.sec,o.para,JSON.stringify(C),y)}catch{continue}P.startsWith("image/")&&n.push(Rr(e,o.sec,o.para,y,0,P,{table:l+1,cell:c,cellPath:C}))}}}}),n}function Rr(e,n,t,r,o,l,c=null){let i="";try{if(c){const C=JSON.stringify(c.cellPath),y=e.getCellParagraphLengthByPath(n,t,C);y>0&&(i=ee(ge(e.getTextInCellByPath(n,t,C,0,Math.min(y,rt*2))),rt*2))}else{const C=e.getParagraphLength(n,t),y=Math.max(0,o-rt),P=Math.min(C-y,rt*2);P>0&&(i=ee(ge(e.getTextRange(n,t,y,P)),rt*2))}}catch{}let u=null;try{const C=v(e.getPageOfPosition(n,t));if(C.ok&&Number.isInteger(C.page)){const y=v(e.getPageInfo(C.page));u=Number.isInteger(y.pageNumber)?y.pageNumber:C.page+1}}catch{}return{sec:n,para:t,control:r,offset:o,mime:l,near:i,page:u,table:c?c.table:null,cellPath:c?c.cellPath:null}}function Ll(e){let n="";for(let r=0;r<e.length;r+=32768)n+=String.fromCharCode.apply(null,e.subarray(r,r+32768));return btoa(n)}const oe=(e,n,t)=>[...e.slice(0,-1),{controlIndex:e[e.length-1].controlIndex,cellIndex:n,cellParaIndex:t}],Fe=(e,n,t)=>[e,n,...t.slice(0,-1).map(r=>`${r.controlIndex}.${r.cellIndex}.${r.cellParaIndex}`),t[t.length-1].controlIndex].join("/");function le(e){const n=[];let t=Sa;const r=(c,i,u)=>{try{return v(e.getTableDimensionsByPath(c,i,JSON.stringify(u)))}catch{return null}},o=(c,i,u,C,y,P)=>{const B=n.length;if(n.push({sec:c,para:i,path:u,rows:C.rowCount,cols:C.colCount,cells:C.cellCount,parent:y}),!(P>=Na))for(let H=0;H<C.cellCount&&t>0;H++){const D=e.getCellParagraphCountByPath(c,i,JSON.stringify(oe(u,H,0)));for(let N=0;N<D&&t>0;N++)for(let R=0;R<yn;R++){t-=1;const L=[...oe(u,H,N),{controlIndex:R,cellIndex:0,cellParaIndex:0}],j=r(c,i,L);j&&o(c,i,L,j,B,P+1)}}},l=e.getSectionCount();for(let c=0;c<l;c++){const i=e.getParagraphCount(c);for(let u=0;u<i;u++){const C=v(e.getControlTextPositions(c,u)).length;for(let y=0;y<C;y++){const P=[{controlIndex:y,cellIndex:0,cellParaIndex:0}],B=r(c,u,P);B&&o(c,u,P,B,null,1)}}}return{tables:n,partial:t<=0}}function $l(e,n){const t=new Map;let r;try{r=v(e.getPageTextLayout(n))}catch{return t}for(const o of Array.isArray(r?.runs)?r.runs:[]){const l=o.cellPath;if(!Array.isArray(l)||l.length===0||!(o.w>0)||!/\S/.test(o.displayText??o.text??""))continue;const c=l[l.length-1],i=[o.secIdx,o.parentParaIdx,...l.slice(0,-1).map(y=>`${y.controlIndex}.${y.cellIndex}.${y.cellParaIndex}`),c.controlIndex,c.cellIndex].join("/"),u={x:o.x,y:o.y,h:o.h,para:c.cellParaIndex,start:o.charStart,text:o.text},C=t.get(i);C?C.push(u):t.set(i,[u])}return t}function Bl(e,n){if(!Number.isInteger(e.start)||typeof e.text!="string")return!1;const t=n[e.para];return typeof t!="string"?!1:He(t,e.start,e.start+pn(e.text))===e.text}function Dl(e,n,t){const r=n.y+n.h,o=u=>Bl(u,t()),l=e.filter(u=>u.x>=n.x-1&&u.x<n.x+n.w),i=l.filter(u=>u.y+u.h-r>u.h*Xo).sort((u,C)=>C.y+C.h-(u.y+u.h)).find(o);return!i||!l.some(u=>u.y>=n.y-1&&u.y<r&&o(u))?null:i.y+i.h-r}function Gl(e,n,t){const{tables:r,partial:o}=le(e),l=Number.isInteger(n)&&n>=1?n-1:0,c=Number.isInteger(t)&&t>=1?t-1:0,i=Date.now(),u=new Map,C=D=>(u.has(D)||u.set(D,$l(e,D)),u.get(D)),y=D=>Math.round(D*25.4/96*10)/10,P=[];let B=0,H=null;for(let D=l;D<r.length&&!H;D++){const N=r[D];let R;try{R=v(e.getTableCellBboxesByPath(N.sec,N.para,JSON.stringify(N.path)))}catch{continue}if(!Array.isArray(R))continue;let L;try{L=ce(e,N)}catch{continue}const j=new Map(L.map(Z=>[`${Z.row}/${Z.col}`,Z.cell])),W=Fe(N.sec,N.para,N.path),q=new Map,ue=Z=>(q.has(Z)||q.set(Z,Te(ae(e,N,Z))),q.get(Z)),ne=new Map;for(const Z of R)D===l&&Z.row<c||(ne.has(Z.row)||ne.set(Z.row,[]),ne.get(Z.row).push(Z));for(const Z of[...ne.keys()].sort((Q,se)=>Q-se)){if(B>0&&(P.length>=jo||Date.now()-i>Jo)){H={table:D+1,row:Z+1};break}const Q=new Set,se=new Set;for(const ie of ne.get(Z)){const he=j.get(`${ie.row}/${ie.col}`);if(he===void 0||(se.has(he)||(se.add(he),B+=1),Q.has(he)))continue;const qe=Dl(C(ie.pageIndex).get(`${W}/${he}`)??[],ie,()=>ue(he));qe!==null&&(Q.add(he),P.push({table:D+1,row:ie.row+1,col:ie.col+1,page:ie.pageIndex+1,over:y(qe),text:ee(ue(he).join(" ").trim(),tn)}))}}}return{tables:r.length,from:{table:l+1,row:c+1},cells:P,measured:B,...H?{next:H}:{},...o?{partial:!0}:{}}}function Lr(e,n){const{tables:t}=le(e),r=Number.isInteger(n)?t[n-1]:void 0;return r?r.path.length>1?{refusal:{ok:!1,reason:"unsupported_place"}}:{table:r,grid:ce(e,r)}:{refusal:{ok:!1,reason:"no_such_table",count:t.length}}}function ce(e,n){const t=[];for(let r=0;r<n.cells;r++){const o=v(e.getCellInfoByPath(n.sec,n.para,JSON.stringify(oe(n.path,r,0))));t.push({cell:r,row:o.row,col:o.col,rowSpan:o.rowSpan||1,colSpan:o.colSpan||1})}return t}const ae=(e,n,t)=>fe(e,{sec:n.sec,para:n.para,cellPath:oe(n.path,t,0)}),Tt=e=>Vo.includes(e)||mn.includes(e);function $r(e){const n=new Map;for(const t of v(e.getBulletList()))Number.isInteger(t.id)&&typeof t.char=="string"&&n.set(t.id,t.char);return n}function lo(e,n,t,r){if(n.path.length>1)return[];const o=n.path[0].controlIndex,l=e.getCellParagraphCountByPath(n.sec,n.para,JSON.stringify(oe(n.path,t,0))),c=[];for(let i=0;i<l;i++){let u;try{u=v(e.getCellParaPropertiesAt(n.sec,n.para,o,t,i))}catch{continue}if(u.headType!=="Bullet")continue;const C=r.get(u.numberingId)??"";Tt(C)&&c.push({k:i,char:C,checked:mn.includes(C)})}return c}function Ul(e){const n=[];for(let t=0;t<e.length;t++){const r=[...e[t]];for(let o=0;o<r.length;o++){if(!Tt(r[o]))continue;let l=o+1;for(;l<r.length&&!Tt(r[l]);)l++;let c=r.slice(o+1,l).join("").trim();if(!c){let i=o-1;for(;i>=0&&!Tt(r[i]);)i--;c=r.slice(i+1,o).join("").trim()}n.push({kind:"text",k:t,offset:o,label:ee(c,Yr),checked:mn.includes(r[o])})}}return n}function Fl(e,n,t,r,o){return[...lo(e,n,t,o).map(c=>({kind:"bullet",k:c.k,label:ee((r[c.k]??"").trim(),Yr),checked:c.checked})),...Ul(r)]}function Hl(e,n){if(e.length===0)return{};const t=typeof n=="string"?n.trim():"";if(!t)return e.length===1?{box:e[0]}:{choices:e.map(l=>l.label).filter(Boolean)};const r=e.filter(l=>l.label===t);if(r.length===1)return{box:r[0]};const o=e.filter(l=>l.label!==""&&(l.label.includes(t)||t.includes(l.label)));return o.length===1?{box:o[0]}:{choices:e.map(l=>l.label).filter(Boolean)}}function Te(e){const n=[],t=e.count();for(let r=0;r<t;r++)n.push(e.text(r,e.length(r)));return n}function Cn(e,n,t){try{const r=e.getParagraphLength(n,t);return r<=0?"":so(e.getTextRange(n,t,0,r))}catch{return""}}function so(e){return String(e).replace(/[\u0000-\u001f]/g," ").replace(/\s+/g," ").trim()}function Br(e,n,t,r){const o=r(n,t);if(o)return o;for(let l=t-1;l>=0;l--){const c=r(n,l);if(c)return c}return""}function jl(e){const n=e&&Array.isArray(e.fontFamilies)?e.fontFamilies:[];return(typeof n[0]=="string"?n[0]:"").trim()}function Jl(e){const n=new Map,t=[],r=[],o=[],l=new Map;let c=!1,i=0,u=0;const C=(N,R)=>{const L=`${N}:${R}`;let j=l.get(L);return j===void 0&&(j=Cn(e,N,R),l.set(L,j)),j},y=(N,R)=>{const L=N&&N.charShapeId!=null?String(N.charShapeId):"",j=Array.isArray(N&&N.fontFamilies)?N.fontFamilies.filter(q=>typeof q=="string"&&q.trim()!==""):typeof(N&&N.fontFamily)=="string"&&N.fontFamily.trim()!==""?[N.fontFamily]:[];let W=n.get(L);W||(W={id:L,fonts:[...new Set(j)],uses:0},n.set(L,W)),W.uses+=1,W.first||(W.first=R)},P=(N,R,L)=>{for(const j of Array.isArray(N)?N:[]){if(i>=Gt){c=!0;return}i+=1;try{y(v(R(j.startOffset??0)),L)}catch{}}},B=e.getSectionCount();for(let N=0;N<B;N++){const R=e.getParagraphCount(N);for(let L=0;L<R;L++){if(t.length>=vn){c=!0;break}t.push({index:L,section:N,text:C(N,L)});let j;try{j=e.getParagraphLength(N,L)}catch{j=0}if(j<=0)continue;let W;try{W=v(e.getCharShapeRuns(N,L,0,j))}catch{W=[]}P(W,q=>e.getCharPropertiesAt(N,L,q),{section:N,para:L})}if(t.length>=vn)break}const H=le(e);H.partial&&(c=!0),H.tables.length>Rn&&(c=!0);for(const N of H.tables.slice(0,Rn)){const R=[];try{for(const j of ce(e,N)){if(R.length>=Do){c=!0;break}R.push({row:j.row,col:j.col,rowSpan:j.rowSpan,colSpan:j.colSpan})}}catch{}const L={index:r.length,anchor:{section:N.sec,para:N.para,path:N.path},rows:N.rows,cols:N.cols,titleAbove:N.parent===null?Br(e,N.sec,N.para,C):"",nested:N.parent!==null,cells:R};if(N.rows===1&&N.cols===1&&R[0])try{const j=oe(N.path,0,0),W=e.getCellParagraphLengthByPath(N.sec,N.para,JSON.stringify(j)),q=W>0?e.getTextInCellByPath(N.sec,N.para,JSON.stringify(j),0,W):"";R[0].text=so(q).slice(0,80)}catch{}r.push(L);for(let j=0;j<N.cells&&i<Gt&&u<Ln;j++){let W;try{W=e.getCellParagraphCountByPath(N.sec,N.para,JSON.stringify(oe(N.path,j,0)))}catch{continue}for(let q=0;q<W&&i<Gt;q++){if(u>=Ln){c=!0;break}u+=1;const ue=oe(N.path,j,q),ne=JSON.stringify(ue);let Z;try{Z=e.getCellParagraphLengthByPath(N.sec,N.para,ne)}catch{Z=0}if(Z<=0)continue;let Q;try{Q=v(e.getCharShapeRunsInCellByPath(N.sec,N.para,ne,0,Z))}catch{Q=[]}P(Q,se=>e.getCellCharPropertiesAtByPath(N.sec,N.para,ne,se),{section:N.sec,para:N.para,path:ue})}}}for(let N=0;N<e.getSectionCount();N++){const R=e.getParagraphCount(N);for(let L=0;L<R&&o.length<Ut;L++){let j;try{j=v(e.getControlTextPositions(N,L))}catch{j=[]}for(let W=0;W<j.length&&!(o.length>=Ut);W++){let q;try{q=e.getControlImageMime(N,L,"[]",W)}catch{continue}q.startsWith("image/")&&o.push({index:o.length,anchor:{section:N,para:L},titleAbove:Br(e,N,L,C)})}}}o.length>=Ut&&(c=!0);const D={charShapes:[...n.values()],paragraphs:t,tables:r,pictures:o};return c&&(D.truncated=!0),D}function io(e,n,t,r){const o=oe(n.path,t,r);return de(e).filter(l=>{if(l.place!=="tableCell")return!1;const c=Qr(l);return!!(c&&c.length===o.length&&c.every((i,u)=>i.controlIndex===o[u].controlIndex&&i.cellIndex===o[u].cellIndex&&i.cellParaIndex===o[u].cellParaIndex))}).length}function co(e,n,t,r,o){let l=0,c=0;const i=Math.min(_a,o+yn);for(let u=0;u<i;u++){const C=[...oe(n.path,t,r),{controlIndex:u,cellIndex:0,cellParaIndex:0}];try{e.getTableDimensionsByPath(n.sec,n.para,JSON.stringify(C)),l+=1,c+=1}catch(y){if(String(y).includes(Zr))break;l+=1}}return{controls:l,tables:c}}function Ct(e,n,t){const r=e.getCellParagraphCountByPath(n.sec,n.para,JSON.stringify(oe(n.path,t,0)));for(let o=0;o<r;o++){const l=io(e,n,t,o),{controls:c}=co(e,n,t,o,l);if(c>l)return!0}return!1}function Xl(e,n,t){const r=e.getCellParagraphCountByPath(n.sec,n.para,JSON.stringify(oe(n.path,t,0)));for(let o=0;o<r;o++){const l=io(e,n,t,o),{controls:c,tables:i}=co(e,n,t,o,l);if(c-i-l>0)return!0}return!1}function zl(e,n,t,r){const o=[...r,{controlIndex:0,cellIndex:0,cellParaIndex:0}];try{return e.getTableDimensionsByPath(n,t,JSON.stringify(o)),!0}catch(l){return!String(l).includes(Zr)}}function kt(e,n){const t=new Set;let r;try{r=v(e.getTableCellBboxesByPath(n.sec,n.para,JSON.stringify(n.path)))}catch{return t}const o=new Map;for(const l of r){if(!Number.isInteger(l.pageIndex))continue;const c=o.get(l.pageIndex);c?c.push(l):o.set(l.pageIndex,[l])}for(const[l,c]of o){let i;try{i=v(e.getPageControlLayout(l)).controls??[]}catch{continue}for(const u of i){if(!Yo.has(u.type)||u.wrap==="behindText")continue;const C=u.x+u.w/2,y=u.y+u.h/2,P=c.find(B=>C>=B.x&&C<=B.x+B.w&&y>=B.y&&y<=B.y+B.h);P&&t.add(P.cellIdx)}}return t}const ee=(e,n)=>pn(e)>n?`${He(e,0,n)}…`:e;function Mt(e){return v(e.getFieldList()).filter(n=>n.fieldType!=="memo"&&(n.cellField===!0||n.fieldType==="clickhere"))}function Yt(e){const n=new Map;return Mt(e).forEach((t,r)=>{if(t.cellField===!0)return;const o=t.location,l=o&&Array.isArray(o.path)?o.path:[];if(l.length===0||l.some(y=>y.type!=="cell"))return;const c=l.map(y=>({controlIndex:y.controlIndex,cellIndex:y.cellIndex,cellParaIndex:y.paraIndex})),i=`${Fe(o.sectionIndex,o.paraIndex,c)}:${c[c.length-1].cellIndex}`,u={number:r+1,key:ut(t),fieldId:t.fieldId,value:t.value??"",guide:t.guide??""},C=n.get(i);C?C.push(u):n.set(i,[u])}),n}const Kl=e=>e.value===""||e.value===e.guide;function Wl(e){if(!Array.isArray(e)||e.length===0||e.length>Gn)throw _("BAD_ARGUMENT",`cells must be a list of 1 to ${Gn} entries`);return e.map(n=>{const{row:t,col:r,text:o}=n??{};if(!Number.isInteger(t)||t<1||!Number.isInteger(r)||r<1)throw _("BAD_ARGUMENT","row and col count from 1 and are whole numbers");if(typeof o!="string")throw _("BAD_ARGUMENT","the text of a cell must be a string");const l=o.split(/\r?\n/);if(l.length>Un||l.some(c=>be.test(c)))throw _("BAD_ARGUMENT",`a cell takes plain text of at most ${Un} lines`);return{row:t,col:r,lines:l}})}function Vl(e){if(!Array.isArray(e)||e.length===0||e.length>Jn)throw _("BAD_ARGUMENT",`cells must be a list of 1 to ${Jn} entries`);return e.map(n=>{const{row:t,col:r,choice:o}=n??{};if(!Number.isInteger(t)||t<1||!Number.isInteger(r)||r<1)throw _("BAD_ARGUMENT","row and col count from 1 and are whole numbers");if(o!=null&&(typeof o!="string"||o.trim()===""||be.test(o)))throw _("BAD_ARGUMENT","choice must be one line of the words beside the box");return{row:t,col:r,choice:typeof o=="string"?o:null}})}function Dr(e,n,t){if(e!=="rows"&&e!=="columns")throw _("BAD_ARGUMENT",'what must be "rows" or "columns"');if(!Number.isInteger(n)||n<1)throw _("BAD_ARGUMENT","at counts from 1 and is a whole number");if(!Number.isInteger(t)||t<1||t>jn)throw _("BAD_ARGUMENT",`count must be between 1 and ${jn}`);return e==="rows"}function $e(e,n){return e.length===0?{reason:"not_found"}:n==null?e.length===1?{hit:e[0]}:{reason:"ambiguous"}:!Number.isInteger(n)||n<1||n>e.length?{reason:"no_such_occurrence"}:{hit:e[n-1]}}const Yl=200,ql=500,Gr=20,Zl=30,kn=["footnote","endnote"],Ql=new Set(["fn","en"]),es=2,ts=e=>JSON.parse(e.replace(/[\u0000-\u001f]/g,n=>`\\u${n.charCodeAt(0).toString(16).padStart(4,"0")}`));function st(e){const n=v(e.getControls()).filter(l=>Ql.has(l.ctrlId)),t=[];if(n.length===0)return{notes:t,elsewhere:0};const r=n.filter(l=>l.list===0),o=e.getSectionCount();for(let l=0;l<o;l++){const c=e.getParagraphCount(l);for(let i=0;i<c&&t.length<n.length;i++)v(e.getControlTextPositions(l,i)).forEach((C,y)=>{let P;try{P=ts(e.getFootnoteInfo(l,i,y))}catch{return}if(!P.ok)return;let B=null,H=es;try{const R=v(e.getNoteEditInfo(l,i,y));B=R.kind,Number.isInteger(R.charOffset)&&(H=R.charOffset)}catch{const R=r[t.length];R&&R.para===i&&R.controlIndex===y&&(B=R.ctrlId==="en"?"endnote":"footnote")}const D=Array.isArray(P.texts)?P.texts:[],N=P.numberSlot!==-1;N||(H=0),t.push({sec:l,para:i,control:y,offset:C,kind:B==="endnote"?"endnote":"footnote",number:P.number,prefix:H,numbered:N,lines:D.map((R,L)=>L===0?R.slice(H):R),plain:D.reduce((R,L)=>R+L.length,0)===P.totalTextLen})})}return{notes:t,elsewhere:Math.max(0,n.length-t.length)}}function ns(e,n){const t=Math.max(0,n.offset-Zl);return n.offset>t?e.getTextRange(n.sec,n.para,t,n.offset-t):""}function Ur(e){if(typeof e!="string"||e.trim()==="")throw _("BAD_ARGUMENT","the note text must be a non-empty string");const n=e.split(`
`);if(n.length>Gr)throw _("BAD_ARGUMENT",`a note takes at most ${Gr} paragraphs`);for(const t of n)if(be.test(t))throw _("BAD_ARGUMENT","the note text holds a control character");return n}function Fr(e,n,t,r){const{sec:o,para:l,control:c}=n;let i=t;r.forEach((u,C)=>{if(C>0){const y=C-1===0?i+1:i;F(e.splitParagraphInFootnote(o,l,c,C-1,y),"split the note"),i=0}u&&F(e.insertTextInFootnote(o,l,c,C,i,u),"write the note"),i+=u.length})}const qt=e=>({kind:e.kind,number:e.number}),Hr=100,jr=3,rs=120,uo=14,gn=45,os="border:none;padding:1.41pt 5.1pt",as=24,ls=40,ss=/^\s*(\d+)\s*$/,Jr=(e,n,t)=>{const r=e.getParagraphLength(n,t);return r>0?e.getTextRange(n,t,0,r):""};function Xr(e,n,t){const r=v(e.getPageOfPosition(n,t));if(!r.ok||!Number.isInteger(r.page))throw _("ENGINE","could not find the page of a heading");const o=v(e.getPageInfo(r.page));return Number.isInteger(o.pageNumber)?o.pageNumber:r.page+1}function is(e,n){const t=v(e.getPageDef(n)),r=(t.landscape?t.height:t.width)-t.marginLeft-t.marginRight;return Math.max(100,Math.round((r-(t.marginGutter??0))/100))}function cs(e){if(!Array.isArray(e)||e.length===0||e.length>Hr)throw _("BAD_ARGUMENT",`entries must list 1 to ${Hr} headings`);for(const n of e){if(!n||typeof n.find!="string"||n.find.length===0)throw _("BAD_ARGUMENT","each entry needs the text of its heading");if(!Number.isInteger(n.level)||n.level<1||n.level>jr)throw _("BAD_ARGUMENT",`each entry needs a level from 1 to ${jr}`)}}function us(e,n,t){const r=[n.family?`font-family:${n.family};mso-fareast-font-family:${n.family}`:"",`font-size:${n.points}pt`].filter(Boolean).join(";"),o=Math.max(50,t-gn),l=os,c=({text:i,level:u,page:C})=>`<tr><td style="${l};width:${o}pt"><p style="margin-left:${(u-1)*uo}pt"><span style="${r}">${dn(i)}</span></p></td><td style="${l};width:${gn}pt"><p style="text-align:right"><span style="${r}">${C}</span></p></td></tr>`;return`<table>${e.map(c).join("")}</table>`}const fs=e=>e.codePointAt(0)>11903?1:.55;function hs(e,n,t,r){const o=(r-gn-(n-1)*uo-as)/t.points;let l=0,c="";for(const i of e){if(l+=fs(i),l>o-1)return`${c.trimEnd()}…`;c+=i}return c}const Zt=(e,n,t)=>e.find(r=>r.row===n&&r.col===t);function zr(e,n,t,r){const o=ae(e,n,t),l=o.length(0);l>0&&o.deleteText(0,l),o.insert(0,r)}const fo=75,ds=2,gs=.5,ps=5e3,Kr=0,ms=1;function bs(e,n,t,r,o){const l=r.length===0?v(e.getControlTextPositions(n,t)).length:yn;let c=0;for(let i=0;i<l;i++){const u=[...r,{controlIndex:i,cellIndex:0,cellParaIndex:0}];let C=null;try{C=v(e.getTableDimensionsByPath(n,t,JSON.stringify(u)))}catch{}if(C&&c++===o)return{control:i,cells:C.cellCount}}return null}function xs(e,n){const{sec:t,para:r}=n;if(n.cells.length===0)return{length:e.getParagraphLength(t,r),text:i=>e.getTextRange(t,r,0,i),rect:i=>v(e.getCursorRect(t,r,i)),props:()=>v(e.getParaPropertiesAt(t,r))};let o=[];for(const i of n.cells){const u=bs(e,t,r,o,i.table);if(!u||i.cell>=u.cells)return null;o=[...o,{controlIndex:u.control,cellIndex:i.cell,cellParaIndex:0}];const C=e.getCellParagraphCountByPath(t,r,JSON.stringify(o));if(i.para>=C)return null;o[o.length-1].cellParaIndex=i.para}const l=JSON.stringify(o),c=o[o.length-1];return{length:e.getCellParagraphLengthByPath(t,r,l),text:i=>e.getTextInCellByPath(t,r,l,0,i),rect:i=>v(e.getCursorRectByPath(t,r,l,i)),props:()=>o.length===1?v(e.getCellParaPropertiesAt(t,r,c.controlIndex,c.cellIndex,c.cellParaIndex)):null}}function ys(e,n,t){if(!e)return{type:Kr,fill:0};const r=i=>(Number(i)||0)/ds/fo,o=r(e.indent),l=n-r(e.marginLeft)-Math.max(o,0),c=t-l;for(const i of e.tabStops??[])if(r(i.position)>c+gs)return{type:Number(i.type)||0,fill:Number(i.fill)||0};return e.tabAutoRight?{type:ms,fill:0}:{type:Kr,fill:0}}function ws(e,n){const t=xs(e,n);if(!t||t.length<=0)return null;const r=t.text(t.length),o=[];for(let B=r.indexOf("	");B>=0;B=r.indexOf("	",B+1))o.push(B);if(o.length!==n.tabs||n.tab>=o.length)return null;const l=o[n.tab],c=t.rect(l),i=t.rect(l+1);if(c.pageIndex!==i.pageIndex||Math.abs(c.y-i.y)>1)return null;const u=Math.round((i.x-c.x)*fo);if(!(u>0))return null;const C=t.rect(0),{type:y,fill:P}=ys(t.props(),C.x,c.x);return{width:u,type:y,fill:P}}function Wr(e,n){const t=Math.min(Math.max(0,Number.isInteger(e.offset)?e.offset:0),n),r=Number.isInteger(e.length)?e.length:0;return r>0?[t,Math.min(n,t+r)]:[0,n]}function Is(e,n){const{sec:t,para:r}=n;if(t>=e.getSectionCount())return[];const o=Array.isArray(n.path)&&n.path.length>0?n.path:null;if(!o){if(r>=e.getParagraphCount(t))return[];const[C,y]=Wr(n,e.getParagraphLength(t,r)),P=y>C?v(e.getSelectionRects(t,r,C,r,y)):[];if(P.length>0)return P;const B=[],H=v(e.getControlTextPositions(t,r)).length;for(let D=0;D<H;D++)try{B.push(v(e.getTableBBox(t,r,D)))}catch{}return B}const l=JSON.stringify(o),c=o[o.length-1].cellParaIndex,[i,u]=Wr(n,e.getCellParagraphLengthByPath(t,r,l));return u>i?v(e.getSelectionRectsInCellByPath(t,r,l,c,i,c,u)):[]}function Vr(e){const n=[],t=e.getSectionCount();for(let r=0;r<t;r++)n.push(e.getParagraphCount(r));return n}function As(e,n,t,r){return e.flatMap(o=>{const l=(t[o.sec]??0)-(n[o.sec]??0);return l===0||!r||r.sec!==o.sec?[o]:l>0?[o.para>=r.para?{...o,para:o.para+l}:o]:o.para<r.para?[o]:o.para<r.para-l?[]:[{...o,para:o.para+l}]})}const Cs=new Set(["input-handler-resumable-pagination"]);function Qt(e,n){let t=!1;const r=e.events.on("document-mutated",l=>{Cs.has(l)||(t=!0,queueMicrotask(()=>{t=!1}),n())}),o=e.events.on("document-changed",()=>{if(t){t=!1;return}n()});return()=>{for(const l of[r,o])try{typeof l=="function"&&l()}catch{}}}let je=null,Ae=null,Je=null,pe=null,ve=null,Xe=null,ze=null,St=null,Be=null,Ke=null;function en(e,n){const t=e.canvasMetricsActive?.()??!1;t&&e.selectCanvasMetrics(!1);try{return n()}finally{t&&e.selectCanvasMetrics(!0)}}const _s={id:Lo,apiVersion:1,deactivate(){je&&je(),je=null,Je&&Je(),Je=null,pe&&pe(),pe=null,ve&&ve(),ve=null,Xe&&Xe(),Xe=null,ze&&ze(),ze=null,St&&St(),St=null,Be&&clearTimeout(Be),Be=null,Ke&&clearTimeout(Ke),Ke=null},activate(e){Ro(),e.events.on("document-dirty-changed",a=>{globalThis.dispatchEvent?.(new CustomEvent(Zo,{detail:a?.dirty===!0}))});let n=0,t=!1,r=null,o=null,l=[],c=null,i=!1,u=null,C=null,y=0,P=!1;const B=`${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;let H=null,D=null;const N=({notify:a=!1}={})=>{let s;try{s=e.read(de)}catch{return null}if(!Array.isArray(s))return null;const h=c;if(c=s.map(Xt),a&&h&&h.length>0){const p=new Set(s.map(A=>A.id)),d=h.filter(A=>!p.has(A.id));d.length>0&&fr(ia,{kind:"memo-removed",count:d.length,memos:d})}return s},R=()=>{try{e.automation.execute(Jt)}catch{}Be&&clearTimeout(Be),Be=setTimeout(()=>{Be=null;try{e.automation.execute(Jt)}catch{}},qn)},L=a=>{const s=globalThis.document,h=s?s.querySelector("#scroll-content"):null;if(!h)return;if(!i){pe&&pe(),pe=null;return}if(!C||C.parentElement!==h){pe&&pe(),C=s.createElement("div"),C.className="ieum-memo-anchors",C.style.cssText=`position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:${ma};`,h.appendChild(C);const x=globalThis.ResizeObserver,w=x?new x(()=>R()):null;w&&w.observe(h);const b=s.querySelector("#scroll-container");let S=null;const I=()=>{S||(S=setTimeout(()=>{S=null,R()},100))};b&&b.addEventListener("scroll",I,{passive:!0});const k=C;pe=()=>{w&&w.disconnect(),b&&b.removeEventListener("scroll",I),S&&clearTimeout(S),k.remove(),C===k&&(C=null)}}C.replaceChildren();const p=a&&a.getInputHandler?a.getInputHandler():null,d=p?p.virtualScroll:null,A=a&&a.getViewportManager?a.getViewportManager():null;if(!d||!A)return;let f;try{f=e.read(zt)}catch{return}const g=A.getZoom(),m=h.clientWidth;for(const x of f){const w=u!==null&&x.id===u;for(const b of x.rects){const S=s.createElement("div"),I=b.width===0,k=d.getPageLeftResolved(b.pageIndex,m)+b.x*g,T=d.getPageOffset(b.pageIndex)+b.y*g;Object.assign(S.style,{position:"absolute",left:`${k.toFixed(2)}px`,top:`${T.toFixed(2)}px`,width:`${Math.max(I?Ia:b.width*g,1).toFixed(2)}px`,height:`${Math.max(b.height*g,2).toFixed(2)}px`,background:w?ya:ba,boxShadow:`inset 0 -${w?2:1}px 0 ${w?wa:xa}`,borderRadius:"2px"}),S.className=`ieum-memo-anchor${w?" selected":""}${I?" caret":""}`,C.appendChild(S)}}},j=()=>{c&&c.length>0?N({notify:!0}):Ke||(Ke=setTimeout(()=>{Ke=null,N({notify:!1}),R()},Aa)),R()};let W=null,q=null;const ue=a=>{const s=a&&a.getInputHandler?a.getInputHandler():null,h=s?s.cursor:null;if(!h)return{ok:!1,reason:"none"};try{if(h.isInHeaderFooter?.()||h.isInFootnote?.())return{ok:!1,reason:"unsupported_place"};if(h.isInPictureObjectSelection?.()||h.isInTableObjectSelection?.())return{ok:!1,reason:"unsupported_place"};if(h.isInCellSelectionMode?.())return{ok:!1,reason:"unsupported_place"}}catch{return{ok:!1,reason:"unsupported_place"}}let p;try{p=hr(a)}catch{return{ok:!1,reason:"unsupported_place"}}const d=p?p.start:h.getPosition?h.getPosition():null,A=p?p.end:d,f=Ge(d),g=Ge(A);if(!f||!g)return{ok:!1,reason:"unsupported_place"};if(f.sec!==g.sec)return{ok:!1,reason:"multi_paragraph"};if(f.path||g.path){if(!f.path||!g.path||!Pt(f,g,!0)||f.k!==g.k)return{ok:!1,reason:"multi_paragraph"}}else if(f.para!==g.para)return{ok:!1,reason:"multi_paragraph"};return e.read(m=>{try{if(xt(m))return{ok:!1,reason:"protected"};const x=f.path?f.textBox?"textBox":"tableCell":"body",w=fe(m,{sec:f.sec,para:f.para,cellPath:f.path}),b=w.length(f.k),S=Math.max(0,Math.min(f.offset,b)),I=Math.max(S,Math.min(g.offset,b)),k=f.path??null,T=`${f.sec}:${f.para}:${nn(k)}`;if(cr(de(m),T,S,I))return{ok:!1,reason:"overlap"};const M=w.text(f.k,b),O=S<I?He(M,S,I):He(M,Math.max(0,S-nr),Math.min(b,S+nr)),U={place:x,sectionIndex:f.sec,paraIndex:f.para,startCharIdx:S,endCharIdx:I,path:k};return{ok:!0,...U,preview:ee(O.replace(/\s+/g," ").trim(),qr),anchor:U}}catch{return{ok:!1,reason:"unsupported_place"}}})},ne=a=>{const s=La(a);if(!s)throw a;return{ok:!1,reason:s.code}},Z=a=>a.path?a.path[a.path.length-1].cellParaIndex:a.paraIndex,Q=(a,s,h)=>{try{return V(a,h,s)}catch(p){return ne(p)}},se=a=>{if(P=a===!0,P){const s=globalThis.document;if(s&&!ve){const h=d=>{P&&(d.preventDefault(),d.stopPropagation(),d.stopImmediatePropagation?.())},p=["keydown","beforeinput","paste","drop","pointerdown"];for(const d of p)s.addEventListener(d,h,!0);ve=()=>{for(const d of p)s.removeEventListener(d,h,!0)}}}else ve&&(ve(),ve=null);return{ok:!0,locked:P}},ie=()=>{ze&&ze();const a=globalThis.BroadcastChannel;if(a)try{const s=new a(Ca);s.onmessage=h=>{const p=h?.data;!p||p.kind!=="memo-copied"||p.source!==B&&(!Number.isInteger(p.count)||p.count<1||typeof p.at!="number"||!Number.isFinite(p.at)||Date.now()-p.at>rr||(!D||p.at>=D.at)&&(D={count:p.count,at:p.at,source:p.source}))},H=s,ze=()=>{try{s.close()}catch{}H===s&&(H=null)}}catch{}},he=()=>{try{Oe=null,e.automation.execute(mt);const a=Oe;if(!a){y=0,D=null;return}const s=Ge(a.start),h=Ge(a.end);if(y=s&&h?e.read(p=>$a(p,s,h)):0,y===0){D=null;return}if(H)try{H.postMessage({kind:"memo-copied",count:y,at:Date.now(),source:B})}catch{}}catch{y=0}},qe=()=>{const a=y;y=0;const s=a<1&&D&&Date.now()-D.at<=rr?D:null;D=null;const h=a>0?a:s?s.count:0;if(h<1)return;let p=0;try{p=e.read(d=>de(d).length)}catch{return}setTimeout(()=>{try{e.read(A=>de(A).length)-p<h&&fr(ca,{kind:"memo-not-copied",count:h}),N({notify:!1}),R()}catch{}},0)};{const a=globalThis.document;if(a){Xe&&Xe();const s=()=>he();for(const h of["copy","cut"])a.addEventListener(h,s,!0);a.addEventListener("paste",qe,!0),Xe=()=>{for(const h of["copy","cut"])a.removeEventListener(h,s,!0);a.removeEventListener("paste",qe,!0)},ie()}}Qt(e,()=>{r=null,o=null,t||(n+=1,l.length>0&&(l=[],dt()),j())});let ft=null;Qt(e,()=>{ft&&clearTimeout(ft),ft=setTimeout(()=>{ft=null;const a=globalThis.document?.querySelector(Qa);if(a)try{tl(a,e.read(s=>v(s.getStyleList())))&&e.automation.execute(Ir)}catch{}},el)});let xe=null,ht=null;const dt=()=>{try{e.automation.execute(jt)}catch{}ht&&clearTimeout(ht),ht=setTimeout(()=>{ht=null;try{e.automation.execute(jt)}catch{}},qn)},ho=a=>{const s=globalThis.document,h=s?s.querySelector("#scroll-content"):null;if(!h)return;if(!xe||xe.parentElement!==h){Je&&Je(),xe=s.createElement("div"),xe.className="ieum-change-marks",xe.style.cssText=`position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:${la};`,h.appendChild(xe);const x=globalThis.ResizeObserver,w=x?new x(()=>dt()):null;w&&w.observe(h);const b=xe;Je=()=>{w&&w.disconnect(),b.remove(),xe===b&&(xe=null)}}if(xe.replaceChildren(),l.length===0)return;const p=a&&a.getInputHandler?a.getInputHandler():null,d=p?p.virtualScroll:null,A=a&&a.getViewportManager?a.getViewportManager():null;if(!d||!A)return;const f=A.getZoom(),g=h.clientWidth,m=e.read(x=>l.flatMap(w=>{try{return Is(x,w)}catch{return[]}}));for(const x of m){const w=s.createElement("div"),b=d.getPageLeftResolved(x.pageIndex,g)+x.x*f,S=d.getPageOffset(x.pageIndex)+x.y*f;Object.assign(w.style,{position:"absolute",left:`${b.toFixed(2)}px`,top:`${S.toFixed(2)}px`,width:`${(x.width*f).toFixed(2)}px`,height:`${(x.height*f).toFixed(2)}px`,background:oa,boxShadow:`inset 0 -2px 0 ${aa}`,borderRadius:"2px"}),xe.appendChild(w)}};try{e.automation.registerCommand({id:jt,label:"Mark the changes",execute:a=>{try{ho(a)}catch{}}})}catch{}try{e.automation.registerCommand({id:Ir,label:"Show the caret state",execute:a=>{try{a.getInputHandler()?.emitCursorFormatState()}catch{}}})}catch{}const go=(a,s,h,p)=>{if(!s||s.ok===!1)return;const d=Array.isArray(s.marks)?s.marks:s.place?[s.place]:[];l=As(l,h,p,s.shiftAt??d[0]??s.place??null),sa.has(a)||(l=[...l,...d].slice(0,ta)),N({notify:!1}),R(),dt()};let Ze=!1;try{e.automation.registerCommand({id:zn,label:"Show a change",execute:(a,s)=>{try{Ze=Ba(a,s)}catch{Ze=!1}}})}catch{}let Oe=null,Sn=null;try{e.automation.registerCommand({id:mt,label:"Read the selection",execute:a=>{try{Oe=hr(a)}catch{Oe=null}}})}catch{}let gt=null;try{e.automation.registerCommand({id:Kn,label:"Count the characters",execute:a=>{try{const s=yo(a.wasm,{textOnly:!0});gt={chars:s.chars,charsNoSpace:s.charsNoSpace}}catch{gt=null}}})}catch{}const po=()=>{Oe=null,e.automation.execute(mt);const a=Oe;return a?e.read(s=>{const h=No();return dr(s,a,h).ok?h.counts():null}):null};let Lt=null,pt=null;const mo=()=>{const a=globalThis.document;if(!Pn(a))return!1;if(pt)return pt.refresh(),!0;const s=Oo({readTotal:()=>(gt=null,e.automation.execute(Kn),gt),readSelection:po,render:(f,g)=>{const m=Pn(a);if(!m||!Lt)return;const{text:x,title:w}=To(Lt,f,g);m.textContent!==x&&(m.textContent=x),m.title!==w&&(m.title=w)}});pt=s;const h=Qt(e,()=>s.documentChanged()),p=e.events.on("cursor-rect-updated",()=>s.selectionChanged()),d=e.events.on("document-swapped",()=>s.documentSwapped()),A=()=>s.selectionChanged();return a.addEventListener("keyup",A,!0),a.addEventListener("mouseup",A,!0),St=()=>{s.stop(),a.removeEventListener("keyup",A,!0),a.removeEventListener("mouseup",A,!0),h();for(const f of[p,d])try{f?.()}catch{}pt=null},s.start(),!0},$t=a=>e.read(s=>{const h=fe(s,{sec:a.sec,para:a.para,cellPath:a.path});return h.text(a.k,h.length(a.k))});try{e.automation.registerCommand({id:Vn,label:"Select the word",execute:a=>{try{Ua(a,$t)}catch{}}})}catch{}try{e.automation.registerCommand({id:Yn,label:"Select the paragraph",execute:a=>{try{Fa(a,$t)}catch{}}})}catch{}try{e.automation.registerCommand({id:bt,label:"Select by words while dragging",execute:(a,s)=>{try{const h=s&&s.phase==="start"?"start":"move";Ae=Ha(a,$t,Ae,h)}catch{}}})}catch{}try{e.automation.registerCommand({id:Zn,label:"List the memos",execute:()=>{W=e.read(zt)}})}catch{}try{e.automation.registerCommand({id:Qn,label:"Read the memo selection",execute:a=>{q=ue(a)}})}catch{}try{e.automation.registerCommand({id:Jt,label:"Draw the memo anchors",execute:a=>{try{L(a)}catch{}}})}catch{}try{e.automation.registerCommand({id:da,label:"Lock the editor for a memo",execute:()=>se(!0)})}catch{}try{e.automation.registerCommand({id:ga,label:"Unlock the editor after a memo",execute:()=>se(!1)})}catch{}const ye=globalThis.document;if(ye){const a=m=>{const x=m.target;return!!(x&&x.closest&&x.closest("#scroll-container"))},s=(m,x)=>{try{e.automation.execute(m,x)}catch{}};let h=0;const p=m=>{m.defaultPrevented||!a(m)||Ae&&Ae.widened||s(Vn)},d=m=>{Ae=null,!(m.button!==0||m.detail!==2)&&a(m)&&s(bt,{phase:"start"})},A=m=>{!Ae||(m.buttons&1)===0||h||(h=globalThis.requestAnimationFrame(()=>{h=0,Ae&&s(bt,{phase:"move"})}))},f=()=>{Ae&&setTimeout(()=>{Ae&&Ae.widened&&s(bt,{phase:"move"})},0)},g=m=>{m.button!==0||m.detail!==3||m.defaultPrevented||a(m)&&s(Yn)};je&&je(),ye.addEventListener("dblclick",p),ye.addEventListener("mousedown",d),ye.addEventListener("mousemove",A),ye.addEventListener("mouseup",f),ye.addEventListener("click",g),je=()=>{ye.removeEventListener("dblclick",p),ye.removeEventListener("mousedown",d),ye.removeEventListener("mousemove",A),ye.removeEventListener("mouseup",f),ye.removeEventListener("click",g),h&&globalThis.cancelAnimationFrame(h),Ae=null}}const G=a=>(...s)=>{try{return a(...s)}catch(h){throw ir(h)}},V=(a,s,h)=>{const p=h?.allowMemoRemoval===!0||h?.memoPolicy==="allow",d=Array.isArray(h?.approvedMemoIds)?new Set(h.approvedMemoIds):null;t=!0,r=null,o=null;try{let A;try{A=e.transaction(a,f=>{f.deferPagination();const g=f.doc(),m=Vr(g),x=er.has(a)||p?null:de(g),w=s(g);if(x&&x.length>0){const b=new Set(de(g).map(I=>I.id)),S=x.filter(I=>!b.has(I.id)&&!(d&&d.has(I.id)));if(S.length>0){const I=_("MEMO_REMOVAL_REQUIRES_APPROVAL","the change would remove memos of the document");throw I.memos=S,I}}return{result:w,before:m,after:Vr(g)}})}catch(f){if(f&&f.code==="MEMO_REMOVAL_REQUIRES_APPROVAL")return N({notify:!1}),R(),{ok:!1,reason:"memo_removal_requires_approval",count:f.memos.length,memos:f.memos.map(Xt)};throw f}if(go(a,A.result,A.before,A.after),er.has(a)&&(n+=1),A.result&&typeof A.result=="object"&&("marks"in A.result||"shiftAt"in A.result)){const{marks:f,shiftAt:g,...m}=A.result;return m}return A.result}finally{t=!1}},Le=(a,s)=>s.slice(0,$o).map((h,p)=>Xa(a,h,p)),_n=(a,s,h)=>{const p=a.objectPositions(a.index);if(s==="before")return p.length>0?{refusal:{ok:!1,reason:"has_objects",count:h}}:{box:a};const d=p.some(A=>A>=a.length(a.index));return{box:a,plain:d}},Qe=(a,s,h)=>{h?a.addAfter(s):a.split(s,a.length(s))},bo=(a,s,h)=>{const p=s.index;if(s.inTable||h||p+1>=s.count()||s.objectPositions(p+1).length>0)return!1;const{sec:d}=s.place(p,0);try{const A=v(a.getCharPropertiesAt(d,p,s.length(p))),f=v(a.getCharPropertiesAt(d,p+1,0)),g=m=>v(a.getParaPropertiesAt(d,m)).headType==="Outline";return A.fontSize>f.fontSize||A.fontSize===f.fontSize&&A.bold&&!f.bold||g(p)&&!g(p+1)}catch{return!1}},we=(a,s,h,p)=>{if(p==="end"){const g=a.getSectionCount()-1;return _n(fe(a,{sec:g,para:a.getParagraphCount(g)-1}),p,1)}const d=Ie(a,s),A=$e(d,h),f=A.hit?me(A.hit)?null:"unsupported_place":A.reason;return f?{refusal:{ok:!1,reason:f,count:d.length,...f==="ambiguous"?{matches:Le(a,d)}:{}}}:_n(fe(a,A.hit),p,d.length)},te=a=>{let s=!1;const h=(p,d)=>{if(!(p.controls===d.controls&&p.fields===d.fields))throw s=!0,_("HAS_OBJECTS","the change would remove an object of the document")};try{return a(h)}catch(p){if(s)return{ok:!1,reason:"has_objects",count:1};throw p}};try{N({notify:!1})}catch{}const Bt=()=>e.read(a=>(o??=Rl(a),o)),et={foreignChanges:()=>n,readText:G(()=>(r??=e.read(vl),r)),listPictures:G(()=>{const a=Bt();return{count:a.length,limited:a.length>=We,pictures:a.map((s,h)=>({picture:h+1,type:s.mime,page:s.page,near:s.near,table:s.table}))}}),readPicture:G(a=>{if(!Number.isInteger(a)||a<1)throw _("BAD_ARGUMENT","picture must be a positive integer from listPictures");const s=Bt()[a-1];return s?e.read(h=>{const p=h.getControlImageData(s.sec,s.para,JSON.stringify(s.cellPath??[]),s.control);return p.length>Ko?{ok:!1,reason:"too_large",bytes:p.length}:{ok:!0,mime:s.mime,base64:Ll(p)}}):{ok:!1,reason:"no_such_picture",count:Bt().length}}),documentProfile:G(()=>e.read(Jl)),findText:G(a=>e.read(s=>{const h=Ie(s,a);return{count:h.length,matches:Le(s,h)}})),replaceText:G((a,s,h,p)=>{lt(s);const d=e.read(A=>{const f=Ie(A,a),g=$e(f,h);if(g.hit&&me(g.hit))return null;const m=g.hit?"unsupported_place":g.reason;return{ok:!1,reason:m,count:f.length,...m==="ambiguous"?{matches:Le(A,f)}:{}}});return d||V("replace",A=>{const f=Ie(A,a),{hit:g}=$e(f,h);if(!g||!me(g))throw _("CHANGED","the document changed mid-call");return yt(A,g,s),{ok:!0,count:f.length,inTable:!!g.cellContext,place:ot(g,s.length)}},p)}),replaceAllText:G((a,s,h)=>(lt(s),e.read(d=>Ie(d,a).filter(me).length)===0?{ok:!1,reason:"not_found",count:0}:V("replace-all",d=>{const A=Ie(d,a).filter(me).reverse();for(const m of A)yt(d,m,s);const f=new Map,g=[...A].reverse().map(m=>{const x=JSON.stringify([m.sec,m.para,Re(m)]),w=f.get(x)??0;return f.set(x,w+s.length-m.length),ot({...m,charOffset:m.charOffset+w},s.length)});return{ok:!0,count:A.length,place:ot(A[A.length-1],s.length),marks:g}},h))),insertParagraphs:G((a,s,h,p,d)=>{At(h),kl(p);const A=e.read(f=>we(f,a,s,h).refusal??null);return A||te(f=>V("insert-paragraphs",g=>{const{box:m,plain:x}=we(g,a,s,h);if(!m)throw _("CHANGED","the document changed mid-call");const w=X(g),b=[...p];let S=m.index;if(h==="before"){m.split(S,0);const T=b.shift();T&&m.insert(S,T)}const I=h==="after"&&bo(g,m,x);for(const T of b)I&&S===m.index?m.split(S+1,0):Qe(m,S,x&&S===m.index),S+=1,T&&m.insert(S,T);f(w,X(g));const k=h==="before"?m.index:m.index+1;return{ok:!0,count:p.length,inTable:m.inTable,place:m.place(k,p[0].length),marks:p.map((T,M)=>m.place(k+M,T.length))}},d))}),deleteParagraph:G((a,s,h)=>{const p=Array.isArray(h?.protectTexts)?new Set(h.protectTexts.filter(A=>typeof A=="string").map(ge).filter(Boolean)):null,d=e.read(A=>{const{box:f,refusal:g}=we(A,a,s,"after");if(!f)return g;if(p){const x=f.text(f.index,f.length(f.index));if(p.has(ge(x)))return{ok:!1,reason:"protected",count:1,text:x.slice(0,Ee)}}return f.index>0&&f.count()>1&&f.objectPositions(f.index).length>0?{ok:!1,reason:"has_objects",count:1}:null});return d||te(A=>V("delete-paragraph",f=>{const{box:g}=we(f,a,s,"after");if(!g)throw _("CHANGED","the document changed mid-call");const m=X(f),x=g.index,w=g.length(x),b=g.text(x,Math.min(w,Ee)),S=x===0||g.count()===1;return S?g.deleteText(x,w):g.deleteRange(x-1,g.length(x-1),x,w),A(m,X(f)),{ok:!0,text:b,emptied:S,inTable:g.inTable,place:g.place(S?x:x-1,0),shiftAt:g.place(x,0)}},h))}),insertTable:G((a,s,h,p,d,A)=>{At(h);const f=Sl(p),g=e.read(m=>{const{box:x,refusal:w}=we(m,a,s,h);return x?x.inTable?{ok:!1,reason:"in_table",count:1}:null:w});return g||te(m=>V("insert-table",x=>{const{box:w,plain:b}=we(x,a,s,h);if(!w)throw _("CHANGED","the document changed mid-call");const S=X(x);let I=w.index;const k=w.font(I);h==="before"?w.split(I,0):(Qe(w,I,b),I+=1),w.pasteHtml(I,Tl(f,k,d===!0,w.inTable)),d===!0&&!w.inTable&&Ml(x,w.place(I,0),f[0].length);const T=X(x);return m(S,{...T,controls:Math.min(T.controls,S.controls)}),{ok:!0,rows:f.length,cols:f[0].length,inTable:w.inTable,place:w.place(I,0)}},A))}),insertPicture:G((a,s,h,p,d,A,f,g,m)=>{At(h);const x=Cl(p,g),w=Math.max(1,Math.round(Number(A)||1)),b=Math.max(1,Math.round(Number(f)||1));let S=Math.round(Math.min(Math.max(Number(d)||240,24),600)*200),I=Math.max(200,Math.round(S*b/w));const k=600*200;I>k&&(I=k,S=Math.max(1,Math.round(I*w/b)));const T=e.read(M=>{const{box:O,refusal:U}=we(M,a,s,h);return O?null:U});return T||te(M=>V("insert-picture",O=>{const{box:U,plain:$}=we(O,a,s,h);if(!U)throw _("CHANGED","the document changed mid-call");const K=X(O);let z=U.index;h==="before"?U.split(z,0):(Qe(U,z,$),z+=1);const Y=U.place(z,0);F(O.insertPictureEx(JSON.stringify({sectionIdx:Y.sec,paraIdx:Y.para,charOffset:0,...Y.path?{cellPath:JSON.stringify(Y.path)}:{},width:S,height:I,naturalWidthPx:w,naturalHeightPx:b,extension:x.extension}),x.bytes),"insert the picture");const re=X(O);return M(K,{...re,controls:Math.min(re.controls,K.controls)}),{ok:!0,inTable:U.inTable,place:U.place(z,0)}},m))}),replaceFont:G((a,s)=>{const h=typeof a=="string"?a.trim():"",p=typeof s=="string"?s.trim():"";if(h===""||p==="")throw _("BAD_ARGUMENT","both font names are needed");return h===p?{ok:!0,ranges:0,paragraphs:0}:V("replace-font",d=>{const A=Ve(d,{chars:{},font:p}).chars;let f=0,g=0,m=!1;const x=(b,S,I)=>{let k=!1;for(const T of Array.isArray(b)?b:[]){if(f>=Bo){m=!0;break}const M=T.startOffset??0,O=T.endOffset??0;if(O<=M)continue;let U;try{U=v(S(M))}catch{continue}jl(U)===h&&(I(M,O),f+=1,k=!0)}k&&(g+=1)};for(let b=0;b<d.getSectionCount();b++){const S=d.getParagraphCount(b);for(let I=0;I<S;I++){let k;try{k=d.getParagraphLength(b,I)}catch{k=0}if(k<=0)continue;let T;try{T=v(d.getCharShapeRuns(b,I,0,k))}catch{T=[]}x(T,M=>d.getCharPropertiesAt(b,I,M),(M,O)=>F(d.applyCharFormat(b,I,M,O,A),"change the font"))}}for(const b of le(d).tables)for(let S=0;S<b.cells;S++){let I;try{I=d.getCellParagraphCountByPath(b.sec,b.para,JSON.stringify(oe(b.path,S,0)))}catch{continue}for(let k=0;k<I;k++){const T=oe(b.path,S,k),M=JSON.stringify(T);let O;try{O=d.getCellParagraphLengthByPath(b.sec,b.para,M)}catch{O=0}if(O<=0)continue;let U;try{U=v(d.getCharShapeRunsInCellByPath(b.sec,b.para,M,0,O))}catch{U=[]}x(U,$=>d.getCellCharPropertiesAtByPath(b.sec,b.para,M,$),($,K)=>F(d.applyCharFormatInCellByPath(b.sec,b.para,M,$,K,A),"change the font"))}}const w={ok:!0,ranges:f,paragraphs:g};return m&&(w.truncated=!0),w})}),formatText:G((a,s,h,p,d)=>{const A=it(p,!1),f=m=>{const x=Ie(m,a);if(h===!0){const S=x.filter(me);return S.length>0?{hits:S}:{refusal:{ok:!1,reason:"not_found",count:0}}}const w=$e(x,s);if(w.hit&&me(w.hit))return{hits:[w.hit]};const b=w.hit?"unsupported_place":w.reason;return{refusal:{ok:!1,reason:b,count:x.length,...b==="ambiguous"?{matches:Le(m,x)}:{}}}},g=e.read(m=>f(m).refusal??wt(m,A));return g||te(m=>V("format-text",x=>{const{hits:w}=f(x);if(!w)throw _("CHANGED","the document changed mid-call");const b=X(x),{chars:S,charShape:I}=Ve(x,A);for(const k of w){const T=fe(x,k),M=k.charOffset+k.length;I!==null&&T.setCharShape(T.index,k.charOffset,M,I),S&&T.formatChars(T.index,k.charOffset,M,S)}return m(b,X(x)),{ok:!0,count:w.length,place:ot(w[0],w[0].length)}},d))}),formatParagraph:G((a,s,h,p)=>{const d=it(h,!0),A=g=>{const m=Ie(g,a),x=$e(m,s),w=I=>({refusal:{ok:!1,reason:I,count:m.length,...I==="ambiguous"?{matches:Le(g,m)}:{}}});if(!x.hit)return w(x.reason);if(!me(x.hit))return w("unsupported_place");const b=fe(g,x.hit);if(d.paragraph&&!b.formatParagraph||d.style&&!b.applyStyle)return w("unsupported_place");const S=wt(g,d);return S?{refusal:S}:{box:b}},f=e.read(g=>A(g).refusal??null);return f||te(g=>V("format-paragraph",m=>{const{box:x}=A(m);if(!x)throw _("CHANGED","the document changed mid-call");const w=X(m),b=x.length(x.index),{chars:S,paragraph:I,style:k,charShape:T}=Ve(m,d),M=k!==null&&Wt(m,x,x.index)===!0;return k!==null&&x.applyStyle(x.index,k),T!==null&&b>0&&x.setCharShape(x.index,0,b,T),I&&x.formatParagraph(x.index,I),S&&b>0&&x.formatChars(x.index,0,b,S),g(w,X(m)),{ok:!0,inTable:x.inTable,place:x.place(x.index,b),...M?{keptOwnLook:1}:{}}},p))}),checkLayout:G((a,s)=>e.read(h=>en(h,()=>Gl(h,a,s)))),listTables:G(()=>e.read(a=>{const{tables:s,partial:h}=le(a),p=A=>{if(A.parent!==null)return"";for(let f=A.para;f>=0&&f>A.para-4;f--){const g=a.getParagraphLength(A.sec,f);if(g>0)return ee(a.getTextRange(A.sec,f,0,g).trim(),tn*2)}return""},d=A=>{const f=[];for(let g=0;g<A.cells&&g<12;g++){const m=Te(ae(a,A,g)).join(" ").trim();if(m&&f.push(ee(m,tn)),f.length===Ea)break}return f};return{count:s.length,partial:h,tables:s.slice(0,Ho).map((A,f)=>({table:f+1,rows:A.rows,cols:A.cols,...A.parent===null?{}:{inTable:A.parent+1},near:p(A),preview:d(A)}))}})),readTable:G((a,s)=>e.read(h=>{const{tables:p}=le(h),d=Number.isInteger(a)?p[a-1]:void 0;if(!d)return{ok:!1,reason:"no_such_table",count:p.length};const A=Number.isInteger(s)&&s>1?s-1:0,f=ce(h,d).filter(I=>I.row>=A).sort((I,k)=>I.row-k.row||I.col-k.col);let g=f.length;if(f.length>Dn){const I=f[Dn].row;g=f.findIndex(k=>k.row===I),g===0&&(g=f.findIndex(k=>k.row!==I)),g<0&&(g=f.length)}const m=Yt(h),x=kt(h,d),w=d.path.length>1?new Map:$r(h),b=Fe(d.sec,d.para,d.path),S=f.slice(0,g).map(I=>{const k=m.get(`${b}:${I.cell}`),T=lo(h,d,I.cell,w).find(M=>!M.checked);return{row:I.row+1,col:I.col+1,...I.rowSpan>1?{rowSpan:I.rowSpan}:{},...I.colSpan>1?{colSpan:I.colSpan}:{},text:ee(Te(ae(h,d,I.cell)).join(`
`),zo),...k?{fields:k.map(M=>M.number)}:{},...T?{box:T.char}:{},...!k&&(x.has(I.cell)||Ct(h,d,I.cell))?{object:!0}:{}}});return{ok:!0,table:a,rows:d.rows,cols:d.cols,cells:S,...g<f.length?{nextRow:f[g].row+1}:{}}})),printPages:G(a=>e.read(s=>en(s,()=>{const h=s.pageCount(),p=Number.isInteger(a)&&a>0?Math.min(a,h):0,d=Date.now(),A=[];for(let f=p;f<h&&(A.push(ra(s,f)),!(Date.now()-d>na));f++);return{pageCount:h,from:p,pages:A}}))),previewPage:G(a=>e.read(s=>en(s,()=>{const h=s.pageCount();if(!Number.isInteger(a)||a<0||a>=h)throw _("BAD_ARGUMENT","page out of range");const p=JSON.parse(s.getPageInfo(a));return{pageCount:h,page:a,svg:s.renderPageSvgWithProfile(a,"print"),width:p.width,height:p.height,margins:{left:p.marginLeft,top:p.marginTop,right:p.marginRight,bottom:p.marginBottom}}}))),pageTarget:G(a=>e.read(s=>{const h=s.pageCount();if(!Number.isInteger(a)||a<0||a>=h)throw _("BAD_ARGUMENT","page out of range");const p=s.getSectionCount();for(let d=0;d<p;d++){const A=s.getParagraphCount(d);for(let f=0;f<A;f++){const g=v(s.getPageOfPosition(d,f));if(!(!g.ok||!Number.isInteger(g.page))){if(g.page>a)break;if(g.page===a)return{ok:!0,page:a,target:{kind:"body_paragraph",section:d,paragraph:f,charOffset:0,length:s.getParagraphLength(d,f)}}}}}return{ok:!1,reason:"no_paragraph"}})),listStyles:G(()=>e.read(a=>{const s=v(a.getStyleList()),h=p=>s.filter(d=>d.type===p).map(d=>d.name);return{paragraph:h(Ce),character:h(Pe)}})),readStyle:G(a=>{const s=Ne(a,"name");return e.read(h=>{const p=Me(h,s,null);if(!p)return De(h,null);const d=p.type===Ce?v(h.getStyleList()).find(A=>A.id===p.nextStyleId):null;return{ok:!0,name:p.name,englishName:p.englishName??"",kind:cn(p),...d?{nextStyle:d.name}:{},look:no(h,p)}})}),createStyle:G((a,s)=>{if(!a||typeof a!="object")throw _("BAD_ARGUMENT","spec must be an object");const h=Ne(a.name,"name"),p=a.englishName==null?"":Ne(a.englishName,"englishName"),d=a.kind??"paragraph";if(d!=="paragraph"&&d!=="character")throw _("BAD_ARGUMENT",'kind must be "paragraph" or "character"');const A=d==="character"?Pe:Ce;if(A===Pe&&a.nextStyle!=null)throw _("BAD_ARGUMENT","only a paragraph style has a next style");const f=a.basedOn==null?null:Ne(a.basedOn,"basedOn"),g=a.nextStyle==null?null:Ne(a.nextStyle,"nextStyle"),m=Sr(a.format,A===Ce),x=b=>{if(It(b,h)||p&&It(b,p))return{refusal:{ok:!1,reason:"style_exists"}};const S=f?Me(b,f,null):v(b.getStyleList())[0];if(!S)return{refusal:De(b,null)};const I=g?Me(b,g,Ce):null;return g&&!I?{refusal:De(b)}:{base:S,next:I}},w=e.read(b=>x(b).refusal??null);return w||V("create-style",b=>{const{base:S,next:I}=x(b);if(!S)throw _("CHANGED","the document changed mid-call");const k=b.createStyle(JSON.stringify({name:h,englishName:p,type:A,nextStyleId:0,baseParaShapeId:S.paraShapeId,baseCharShapeId:S.charShapeId}));if(!Number.isInteger(k)||k<0)throw _("ENGINE","the style could not be made");if(A===Ce&&!b.updateStyle(k,JSON.stringify({nextStyleId:I?I.id:k})))throw _("ENGINE_REFUSED","the editor refused to set the next style");return _r(b,k,m),{ok:!0,name:h,kind:d}},s)}),editStyle:G((a,s,h)=>{const p=Ne(a,"name");if(!s||typeof s!="object")throw _("BAD_ARGUMENT","spec must be an object");const d=s.name==null?null:Ne(s.name,"the new name"),A=s.englishName==null?null:Ne(s.englishName,"englishName"),f=s.nextStyle==null?null:Ne(s.nextStyle,"nextStyle"),g=x=>{const w=Me(x,p,null);if(!w)return{refusal:De(x,null)};const b=w.type===Ce;if(f&&!b)throw _("BAD_ARGUMENT","only a paragraph style has a next style");const S=Sr(s.format,b);if(!d&&A===null&&!f&&!S)throw _("BAD_ARGUMENT","name nothing to change: name, englishName, nextStyle or format");if(d&&It(x,d,w.id)||A&&It(x,A,w.id))return{refusal:{ok:!1,reason:"style_exists"}};const I=f?Me(x,f,Ce):null;return f&&!I?{refusal:De(x)}:{style:w,next:I,look:S}},m=e.read(x=>g(x).refusal??null);return m||V("edit-style",x=>{const{style:w,next:b,look:S}=g(x);if(!w)throw _("CHANGED","the document changed mid-call");const I={...d?{name:d}:{},...A!==null?{englishName:A}:{},...b?{nextStyleId:b.id}:{}};if(Object.keys(I).length>0&&!x.updateStyle(w.id,JSON.stringify(I)))throw _("ENGINE_REFUSED","the editor refused to change the style");return _r(x,w.id,S),{ok:!0,name:d??w.name,kind:cn(w)}},h)}),formatCells:G((a,s,h,p)=>{if(!Array.isArray(s)||s.length===0||s.length>Hn)throw _("BAD_ARGUMENT",`cells must be 1 to ${Hn} places`);for(const m of s)if(!m||!Number.isInteger(m.row)||!Number.isInteger(m.col))throw _("BAD_ARGUMENT","each cell needs a row and a col, counted from 1");const d=h==="none";if(!d&&(typeof h!="string"||!ln.test(h)))throw _("BAD_ARGUMENT",'background must look like #RRGGBB, or be "none"');const A=JSON.stringify(d?{fillType:"none"}:{fillType:"solid",fillColor:h.toLowerCase(),patternType:-1}),f=m=>{const{tables:x}=le(m),w=Number.isInteger(a)?x[a-1]:void 0;if(!w)return{refusal:{ok:!1,reason:"no_such_table",count:x.length}};if(w.path.length>1)return{refusal:{ok:!1,reason:"unsupported_place",count:x.length}};const b=ce(m,w),S=new Set,I=[];for(const k of s){const T=b.find(M=>k.row-1>=M.row&&k.row-1<M.row+M.rowSpan&&k.col-1>=M.col&&k.col-1<M.col+M.colSpan);T?S.add(T.cell):I.push({row:k.row,col:k.col})}return I.length>0?{refusal:{ok:!1,reason:"no_such_cell",cells:I,rows:w.rows,cols:w.cols}}:{table:w,targets:[...S]}},g=e.read(m=>f(m).refusal??null);return g||te(m=>V("format-cells",x=>{const{table:w,targets:b}=f(x);if(!b)throw _("CHANGED","the document changed mid-call");const S=X(x),I=w.path[0].controlIndex;for(const k of b)F(x.setCellProperties(w.sec,w.para,I,k,A),"colour the cell");return m(S,X(x)),{ok:!0,count:b.length,place:{sec:w.sec,para:w.para,offset:0,length:0}}},p))}),mergeCells:G((a,s,h,p)=>{const d=b=>b&&Number.isInteger(b.row)&&Number.isInteger(b.col)&&b.row>=1&&b.col>=1;if(!d(s)||!d(h))throw _("BAD_ARGUMENT","from and to need a row and a col, counted from 1");const A=Math.min(s.row,h.row)-1,f=Math.max(s.row,h.row)-1,g=Math.min(s.col,h.col)-1,m=Math.max(s.col,h.col)-1;if(A===f&&g===m)throw _("BAD_ARGUMENT","from and to name one cell: there is nothing to merge");const x=b=>{const S=Lr(b,a);if(S.refusal)return S;const{table:I,grid:k}=S;if(f>=I.rows||m>=I.cols)return{refusal:{ok:!1,reason:"no_such_cell",rows:I.rows,cols:I.cols}};const T=[],M=[];for(const $ of k){const K=$.row+$.rowSpan-1,z=$.col+$.colSpan-1;if(!($.row<=f&&K>=A&&$.col<=m&&z>=g))continue;$.row>=A&&K<=f&&$.col>=g&&z<=m?T.push($):M.push({row:$.row+1,col:$.col+1})}if(M.length>0)return{refusal:{ok:!1,reason:"crosses_merged",cells:M}};const O=I.path[0].controlIndex,U=T.filter($=>!($.row===A&&$.col===g)).filter($=>{const K=v(b.getCellProperties(I.sec,I.para,O,$.cell));return typeof K.fieldName=="string"&&K.fieldName!==""}).map($=>({row:$.row+1,col:$.col+1}));return U.length>0?{refusal:{ok:!1,reason:"named_cells",cells:U}}:{table:I,control:O,merged:T.length}},w=e.read(b=>x(b).refusal??null);return w||te(b=>V("merge-cells",S=>{const{table:I,control:k,merged:T}=x(S);if(!I)throw _("CHANGED","the document changed mid-call");const M=X(S);return F(S.mergeTableCells(I.sec,I.para,k,A,g,f,m),"merge the cells"),b(M,X(S)),{ok:!0,merged:T,place:{sec:I.sec,para:I.para,offset:0,length:0}}},p))}),splitCell:G((a,s,h,p,d,A)=>{if(!Number.isInteger(s)||!Number.isInteger(h)||s<1||h<1)throw _("BAD_ARGUMENT","row and col count from 1");const f=b=>b??1,g=f(p),m=f(d);for(const b of[g,m])if(!Number.isInteger(b)||b<1||b>Fn)throw _("BAD_ARGUMENT",`rows and cols must be 1 to ${Fn}`);const x=b=>{const S=Lr(b,a);if(S.refusal)return S;const{table:I,grid:k}=S,T=k.find(O=>s-1>=O.row&&s-1<O.row+O.rowSpan&&h-1>=O.col&&h-1<O.col+O.colSpan);if(!T)return{refusal:{ok:!1,reason:"no_such_cell",rows:I.rows,cols:I.cols}};if(Ct(b,I,T.cell)||kt(b,I).has(T.cell))return{refusal:{ok:!1,reason:"holds_object"}};const M=T.rowSpan>1||T.colSpan>1;return g===1&&m===1&&!M?{refusal:{ok:!1,reason:"not_merged"}}:{table:I,cell:T,unmerge:g===1&&m===1}},w=e.read(b=>x(b).refusal??null);return w||te(b=>V("split-cell",S=>{const{table:I,cell:k,unmerge:T}=x(S);if(!I)throw _("CHANGED","the document changed mid-call");const M=X(S),O=I.path[0].controlIndex,U=T?S.splitTableCell(I.sec,I.para,O,k.row,k.col):S.splitTableCellInto(I.sec,I.para,O,k.row,k.col,g,m,!0,!1);return F(U,"split the cell"),b(M,X(S)),{ok:!0,unmerged:T,place:{sec:I.sec,para:I.para,offset:0,length:0}}},A))}),fillCells:G((a,s,h,p)=>{const d=Wl(s),A=g=>{const{tables:m}=le(g),x=Number.isInteger(a)?m[a-1]:void 0;if(!x)return{refusal:{ok:!1,reason:"no_such_table",count:m.length}};const w=ce(g,x),b=Yt(g),S=kt(g,x),I=Fe(x.sec,x.para,x.path),k=[],T=[],M=[],O=[],U=[],$=new Set;for(const z of d){const Y={row:z.row,col:z.col},re=w.find(J=>z.row-1>=J.row&&z.row-1<J.row+J.rowSpan&&z.col-1>=J.col&&z.col-1<J.col+J.colSpan);if(!re){T.push(Y);continue}if($.has(re.cell))throw _("BAD_ARGUMENT",`two entries name the same cell (${z.row}.${z.col})`);$.add(re.cell);const Se=b.get(`${I}:${re.cell}`)??[];if(Se.length>1){O.push({...Y,fields:Se.map(J=>J.number)});continue}if(Se.length===1){const J=Se[0];!Kl(J)&&h!==!0?M.push({...Y,text:ee(J.value,Ee)}):k.push({...z,cell:re.cell,field:J});continue}if(S.has(re.cell)||Ct(g,x,re.cell)){U.push(Y);continue}const _e=Te(ae(g,x,re.cell));_e.join("").trim()!==""&&h!==!0?M.push({...Y,text:ee(_e.join(" ").trim(),Ee)}):k.push({...z,cell:re.cell,clear:_e.some(J=>J!=="")})}const K=(z,Y)=>({refusal:{ok:!1,reason:z,cells:Y,rows:x.rows,cols:x.cols}});return T.length>0?K("no_such_cell",T):O.length>0?K("has_fields",O):U.length>0?K("holds_object",U):M.length>0?K("occupied",M):{table:x,targets:k}},f=e.read(g=>A(g).refusal??null);return f||te(g=>V("fill-cells",m=>{const{table:x,targets:w}=A(m);if(!w)throw _("CHANGED","the document changed mid-call");const b=new Set(w.filter(k=>k.field).map(k=>k.field.fieldId)),S=X(m,b);for(const k of w){if(k.field){Cr(m,k.field.key,k.lines.join(" "));continue}const T=ae(m,x,k.cell);if(k.clear){const M=T.count()-1;M>0?T.deleteRange(0,0,M,T.length(M)):T.deleteText(0,T.length(0))}k.lines.forEach((M,O)=>{O>0&&O>=T.count()&&T.split(O-1,T.length(O-1)),M&&T.insert(O,M)}),k.lines.forEach((M,O)=>{M&&ol(m,x,k.cell,O,[...M].length)})}kr(m,null,new Set(w.filter(k=>k.field).map(k=>k.field.key))),g(S,X(m,b));const I=w[0];return{ok:!0,table:a,count:w.length,place:ae(m,x,I.cell).place(0,I.field?0:I.lines[0].length)}},p))}),checkBoxes:G((a,s,h)=>{const p=Vl(s),d=f=>{const{tables:g}=le(f),m=Number.isInteger(a)?g[a-1]:void 0;if(!m)return{refusal:{ok:!1,reason:"no_such_table",count:g.length}};const x=ce(f,m),w=$r(f),b=[],S=[],I=[],k=[],T=new Set;for(const O of p){const U={row:O.row,col:O.col},$=x.find(Y=>O.row-1>=Y.row&&O.row-1<Y.row+Y.rowSpan&&O.col-1>=Y.col&&O.col-1<Y.col+Y.colSpan);if(!$){S.push(U);continue}if(T.has($.cell))throw _("BAD_ARGUMENT",`two entries name the same cell (${O.row}.${O.col})`);T.add($.cell);const K=Te(ae(f,m,$.cell)),z=Hl(Fl(f,m,$.cell,K,w),O.choice);z.box?b.push({cell:$.cell,...z.box}):z.choices?k.push({...U,choices:z.choices}):I.push(U)}const M=(O,U)=>({refusal:{ok:!1,reason:O,cells:U,rows:m.rows,cols:m.cols}});return S.length>0?M("no_such_cell",S):k.length>0?M("ambiguous_box",k):I.length>0?M("no_box",I):{table:m,targets:b}},A=e.read(f=>d(f).refusal??null);return A||te(f=>V("check-boxes",g=>{const{table:m,targets:x}=d(g);if(!x)throw _("CHANGED","the document changed mid-call");const w=X(g);let b=null;for(const k of x)if(!k.checked)if(k.kind==="bullet"){if(b===null&&(b=g.ensureDefaultBullet(Xn)),!Number.isInteger(b)||b<1)throw _("ENGINE","the tick box could not be made");F(g.applyParaFormatInCell(m.sec,m.para,m.path[0].controlIndex,k.cell,k.k,JSON.stringify({headType:"Bullet",numberingId:b})),"tick the box")}else{const T=JSON.stringify(oe(m.path,k.cell,k.k));F(g.deleteTextInCellByPath(m.sec,m.para,T,k.offset,1),"tick the box"),F(g.insertTextInCellByPath(m.sec,m.para,T,k.offset,Xn),"tick the box")}f(w,X(g));const S=x[0],I=ae(g,m,S.cell);return{ok:!0,table:a,count:x.length,place:I.place(S.k,Math.min(1,I.length(S.k)))}},h))}),addTableLines:G((a,s,h,p,d,A)=>{const f=Dr(s,h,d);if(p!=="after"&&p!=="before")throw _("BAD_ARGUMENT",'where must be "after" or "before"');const g=x=>{const{tables:w}=le(x),b=Number.isInteger(a)?w[a-1]:void 0;if(!b)return{refusal:{ok:!1,reason:"no_such_table",count:w.length}};const S={rows:b.rows,cols:b.cols};return b.parent!==null?{refusal:{ok:!1,reason:"nested",...S}}:h>(f?b.rows:b.cols)?{refusal:{ok:!1,reason:"no_such_line",...S}}:{table:b}},m=e.read(x=>g(x).refusal??null);return m||te(x=>V("add-table-lines",w=>{const{table:b}=g(w);if(!b)throw _("CHANGED","the document changed mid-call");const S=X(w),{sec:I,para:k}=b,T=b.path[0].controlIndex,M=p==="after";for(let J=0;J<d;J++){const ke=M?h-1:h-1+J;F(f?w.insertTableRow(I,k,T,ke,M):w.insertTableColumn(I,k,T,ke,M),f?"add a row":"add a column")}const O=M?h:h-1,U=M?h-1:h-1+d,$={...b,cells:v(w.getTableDimensions(I,k,T)).cellCount},K=ce(w,$),z=J=>f?J.row:J.col,Y=J=>f?J.col:J.row,re=J=>v(w.getCellParaPropertiesAt(I,k,T,J.cell,0)).alignment;for(const J of K){if(z(J)<O||z(J)>=O+d)continue;const ke=K.find(nt=>z(nt)===U&&Y(nt)===Y(J));if(!ke)continue;const tt=re(ke);tt&&tt!==re(J)&&F(w.applyParaFormatInCell(I,k,T,J.cell,0,JSON.stringify({alignment:tt})),"format the new cell")}x(S,X(w));const Se=v(w.getTableDimensions(I,k,T)),_e=K.find(J=>z(J)===O);return{ok:!0,table:a,rows:Se.rowCount,cols:Se.colCount,first:O+1,count:d,..._e?{place:ae(w,$,_e.cell).place(0,0)}:{}}},A))}),removeTableLines:G((a,s,h,p,d)=>{const A=Dr(s,h,p),f=m=>{const{tables:x}=le(m),w=Number.isInteger(a)?x[a-1]:void 0;if(!w)return{refusal:{ok:!1,reason:"no_such_table",count:x.length}};const b={rows:w.rows,cols:w.cols};if(w.parent!==null)return{refusal:{ok:!1,reason:"nested",...b}};const S=A?w.rows:w.cols;if(h+p-1>S)return{refusal:{ok:!1,reason:"no_such_line",...b}};if(p>=S)return{refusal:{ok:!1,reason:"would_empty",...b}};const I=kt(m,w),k=ce(m,w).filter(M=>{const O=A?M.row:M.col;return O>=h-1&&O<h-1+p}),T=k.filter(M=>I.has(M.cell)||Ct(m,w,M.cell)).map(M=>({row:M.row+1,col:M.col+1}));return T.length>0?{refusal:{ok:!1,reason:"holds_object",cells:T,...b}}:{table:w,going:k}},g=e.read(m=>f(m).refusal??null);return g||te(m=>V("remove-table-lines",x=>{const{table:w,going:b}=f(x);if(!w)throw _("CHANGED","the document changed mid-call");const S=X(x,new Set),{sec:I,para:k}=w,T=w.path[0].controlIndex,M=ee(b.map($=>Te(ae(x,w,$.cell)).join(" ").trim()).filter(Boolean).join(" | "),Ee);for(let $=0;$<p;$++)F(A?x.deleteTableRow(I,k,T,h-1):x.deleteTableColumn(I,k,T,h-1),A?"remove the row":"remove the column");m(S,X(x,new Set));const O=v(x.getTableDimensions(I,k,T)),U={...w,cells:O.cellCount};return{ok:!0,table:a,rows:O.rowCount,cols:O.colCount,count:p,text:M,place:ae(x,U,0).place(0,0)}},d))}),deleteTable:G((a,s)=>{const h=d=>{const{tables:A}=le(d),f=Number.isInteger(a)?A[a-1]:void 0;if(!f)return{refusal:{ok:!1,reason:"no_such_table",count:A.length}};const g=new Set([a-1]);for(let I=a;I<A.length&&g.has(A[I].parent);I++)g.add(I);const m=[...g].map(I=>A[I]),x=ce(d,f),w=new Set;for(const I of m)for(const k of ce(d,I))Xl(d,I,k.cell)&&w.add(I===f?k.cell:I.path[f.path.length-1].cellIndex);if(w.size>0)return{refusal:{ok:!1,reason:"holds_object",cells:x.filter(k=>w.has(k.cell)).map(k=>({row:k.row+1,col:k.col+1}))}};const b=m.map(I=>`${Fe(I.sec,I.para,I.path)}:`),S=new Set;for(const[I,k]of Yt(d))if(b.some(T=>I.startsWith(T)))for(const T of k)S.add(T.fieldId);return{table:f,top:x,inner:m.length-1,going:S}},p=e.read(d=>h(d).refusal??null);return p||te(d=>V("delete-table",A=>{const{table:f,top:g,inner:m,going:x}=h(A);if(!f)throw _("CHANGED","the document changed mid-call");const w=X(A,x),b=ee(g.map(K=>Te(ae(A,f,K.cell)).join(" ").trim()).filter(Boolean).join(" | "),Ee),{sec:S,para:I,path:k}=f,T=k[k.length-1],M=k.slice(0,-1);F(M.length===0?A.deleteTableControl(S,I,T.controlIndex):A.deleteCellTableControlByPath(S,I,JSON.stringify(M),T.controlIndex),"remove the table");const O=fe(A,M.length===0?{sec:S,para:I}:{sec:S,para:I,cellPath:M}),U=O.index,$=O.length(U)===0&&(M.length===0?O.objectPositions(U).length===0:!zl(A,S,I,M));return U>0&&$&&O.deleteRange(U-1,O.length(U-1),U,0),d({...w,controls:w.controls-1-m},X(A,x)),{ok:!0,table:a,rows:f.rows,cols:f.cols,inner:m,text:b,place:O.place(U>0&&$?U-1:U,0)}},s))}),installFileMenu:G(a=>{for(const s of Ht)if(typeof a?.[s.command]!="string"||!a[s.command])throw _("BAD_ARGUMENT",`labels.${s.command} must be a non-empty string`);if(!e.automation.registerCommand||!e.automation.addMenuItem)return{ok:!1};for(const s of Ht)try{e.automation.registerCommand({id:s.id,label:a[s.command],...s.shortcut?{shortcutLabel:s.shortcut}:{},execute:()=>{globalThis.dispatchEvent?.(new CustomEvent(qo,{detail:s.command}))}})}catch{}try{for(const s of[...Ht].reverse())e.automation.addMenuItem({menuId:"file",commandId:s.id,position:"top"})}catch{return{ok:!1}}return{ok:!0}}),showCharCount:G(a=>{const s=Eo(a);if(!s)throw _("BAD_ARGUMENT","total, selected, hint and hintSelected must be non-empty strings");return Lt=s,{ok:mo()}}),installEasyWords:G(a=>{if(typeof a!="string"||!a.trim())throw _("BAD_ARGUMENT","label must be a non-empty string");if(!e.automation.registerCommand)return{ok:!1};try{e.automation.unregisterCommand?.(Wn)}catch{}try{e.automation.registerCommand({id:Wn,label:a,canExecute:s=>s?.hasDocument===!0&&(s.hasSelection===!0||s.inCellSelectionMode===!0),execute:()=>{let s;try{s=et.selection()}catch{return}if(!s?.ok)return;const h=s.segments.map(p=>p.text).join(`
`).trim();h&&globalThis.dispatchEvent?.(new CustomEvent(Qo,{detail:{text:h}}))}})}catch{return{ok:!1}}return{ok:!0}}),watchMissingFonts:G(a=>{if(typeof a?.tag!="string"||!a.tag.trim()||typeof a.hint!="string"||!a.hint.trim())throw _("BAD_ARGUMENT","tag and hint must be non-empty strings");return Io({tag:a.tag,hint:a.hint}),Ao().then(()=>{let s;try{s=e.read(p=>v(p.getDocumentInfo()).fontsUsed)}catch{return}const h=Co(Array.isArray(s)?s:[]);globalThis.dispatchEvent?.(new CustomEvent(ea,{detail:{fonts:h}}))}),{ok:!0}}),reveal:G(a=>{Ze=!1;try{e.automation.execute(zn,a)}catch{return{ok:!1}}return Ze&&(Sn=an(a)),{ok:Ze}}),selection:G(()=>{Oe=null;try{e.automation.execute(mt)}catch{return{ok:!1,reason:"none"}}const a=Oe;return a?e.read(s=>{const h=Da(),p=dr(s,a,h);if(!p.ok)return p;const{inTable:d}=p;return h.tooLong()?{ok:!1,reason:"too_long"}:h.segments.length===0?{ok:!1,reason:"none"}:{ok:!0,inTable:d,contiguous:gr(h.segments),own:h.segments.length===1&&an(h.segments[0])===Sn,segments:h.segments}}):{ok:!1,reason:"none"}}),replaceSelection:G((a,s,h)=>{if(mr(a),!Array.isArray(s)||s.length===0||s.length>xn)throw _("BAD_ARGUMENT","texts must be a list of one or more strings");return s.forEach(lt),s.length!==a.length&&!gr(a)?{ok:!1,reason:"count",count:a.length}:e.read(p=>Kt(p,a))?te(p=>V("replace-selection",d=>{if(!Kt(d,a))throw _("CHANGED","the document changed mid-call");const A=X(d),f=b=>({sec:b.sec,para:b.para,cellPath:b.path,charOffset:b.offset,length:b.length}),g=Math.min(a.length,s.length);for(let b=a.length-1;b>=g;b--){const S=a[b],{box:I,k}=_t(d,S);S.offset===0&&S.length===I.length(k)&&k>0&&I.objectPositions(k).length===0?I.deleteRange(k-1,I.length(k-1),k,I.length(k)):yt(d,f(S),"")}for(let b=0;b<g;b++)yt(d,f(a[b]),s[b]);const m=a.slice(0,g).map((b,S)=>({...b,length:s[S].length,text:s[S]}));if(s.length>a.length){const b=a[a.length-1],{box:S,k:I}=_t(d,b);let k=I,T=b.offset+s[g-1].length;for(let M=g;M<s.length;M++)S.split(k,T),k+=1,s[M]&&S.insert(k,s[M]),T=s[M].length,m.push({...S.place(k,s[M].length),text:s[M]})}p(A,X(d));const{text:x,...w}=m[0];return{ok:!0,segments:m,place:w}},h)):{ok:!1,reason:"changed"}}),formatSelection:G((a,s,h)=>{mr(a);const p=it(s,!0),d=f=>{if(!Kt(f,a))return{refusal:{ok:!1,reason:"changed"}};const g=a.map(x=>_t(f,x));if(g.some(({box:x})=>p.paragraph&&!x.formatParagraph||p.style&&!x.applyStyle))return{refusal:{ok:!1,reason:"unsupported_place"}};const m=wt(f,p);return m?{refusal:m}:{boxes:g}},A=e.read(f=>d(f).refusal??null);return A||te(f=>V("format-selection",g=>{const{boxes:m}=d(g);if(!m)throw _("CHANGED","the document changed mid-call");const x=X(g),{chars:w,paragraph:b,style:S,charShape:I}=Ve(g,p);let k=0;a.forEach((O,U)=>{const{box:$,k:K}=m[U],z=O.offset+O.length;S!==null&&(Wt(g,$,K)===!0&&(k+=1),$.applyStyle(K,S)),I!==null&&O.length>0&&$.setCharShape(K,O.offset,z,I),b&&$.formatParagraph(K,b),w&&O.length>0&&$.formatChars(K,O.offset,z,w)}),f(x,X(g));const{text:T,...M}=a[0];return{ok:!0,count:a.length,place:M,...k>0?{keptOwnLook:k}:{}}},h))}),listFields:G(()=>e.read(a=>Mt(a).map((s,h)=>({field:h+1,name:s.name??"",guide:s.guide??"",value:s.value??"",inCell:s.cellField===!0})))),fillField:G((a,s,h)=>{lt(s);const p=e.read(d=>Mt(d).length);return!Number.isInteger(a)||a<1||a>p?{ok:!1,reason:"no_such_field",count:p}:V("fill-field",d=>{const A=Mt(d)[a-1];if(!A)throw _("CHANGED","the document changed mid-call");Cr(d,ut(A),s),kr(d,null,new Set([ut(A)]));const f=Ma(A);return{ok:!0,name:A.name??"",...f?{place:f}:{}}},h)}),insertToc:G((a,s,h,p,d,A)=>{At(h),cs(d),p!=null&&lt(p);const f=typeof p=="string"&&p.trim()!=="",g=x=>d.map(w=>{const b=Ie(x,w.find),S=$e(b,w.occurrence??null),I=S.hit?!me(S.hit)||Re(S.hit)?"unsupported_place":null:S.reason;return{entry:w,hits:b,hit:I?null:S.hit,reason:I}}),m=e.read(x=>{const w=we(x,a,s,h);if(w.refusal)return w.refusal;if(w.box.inTable)return{ok:!1,reason:"in_table",count:1};const b=g(x).find(S=>S.reason);return b?{ok:!1,reason:"no_heading",heading:b.entry.find,why:b.reason,count:b.hits.length,...b.reason==="ambiguous"?{matches:Le(x,b.hits)}:{}}:null});return m||te(x=>V("insert-toc",w=>{const{box:b,plain:S}=we(w,a,s,h);if(!b||b.inTable)throw _("CHANGED","the document changed mid-call");const I=X(w),{sec:k}=b.place(b.index,0),T=g(w);if(T.some(J=>!J.hit))throw _("CHANGED","the document changed mid-call");const M=b.font(b.index),O=is(w,k),U=T.map(({entry:J,hit:ke})=>({text:hs(ee(Jr(w,ke.sec,ke.para).replace(/\s+/g," ").trim(),rs),J.level,M,O),level:J.level,page:0}));let $=b.index;h==="before"?b.split($,0):(Qe(b,$,S),$+=1);let K=$;f&&(b.insert($,p.trim()),Qe(b,$,!1),K=$+1),b.pasteHtml(K,us(U,M,O));const z=le(w).tables.find(J=>J.sec===k&&J.para===K&&J.path.length===1);if(!z)throw _("ENGINE","the table of contents could not be made");const Y=K-$+1,re=ce(w,z),Se=T.map(({hit:J},ke)=>{const tt=J.sec===k&&J.para>=$?J.para+Y:J.para,nt=Xr(w,J.sec,tt),Nn=Zt(re,ke,1);if(!Nn)throw _("ENGINE","the table of contents came out in another shape");return zr(w,z,Nn.cell,String(nt)),nt});f&&F(w.applyParaFormat(k,$,JSON.stringify({alignment:"center"})),"center the title");const _e=X(w);return x(I,{..._e,controls:Math.min(_e.controls,I.controls)}),{ok:!0,count:d.length,pages:Se,place:{sec:k,para:$,offset:0,length:f?p.trim().length:0}}},A))}),refreshToc:G((a,s,h)=>{const p=A=>{const f=we(A,a,s,"after");if(f.refusal)return{refusal:f.refusal};if(f.box.inTable)return{refusal:{ok:!1,reason:"in_table",count:1}};const{sec:g}=f.box.place(f.box.index,0),m=le(A).tables.find(x=>x.sec===g&&x.para===f.box.index+1&&x.path.length===1&&x.cols===2);return m?{table:m}:{refusal:{ok:!1,reason:"no_toc",count:0}}},d=e.read(A=>p(A).refusal??null);return d||te(A=>V("refresh-toc",f=>{const{table:g}=p(f);if(!g)throw _("CHANGED","the document changed mid-call");const m=X(f),x=ce(f,g);let w=0,b=0;const S=[];for(let I=0;I<g.rows;I++){const k=Zt(x,I,0),T=Zt(x,I,1);if(!k||!T)continue;const M=ss.exec(Te(ae(f,g,T.cell)).join(""));if(!M)continue;w+=1;const O=Te(ae(f,g,k.cell)).join(" ").trim(),U=O.replace(/…$/,"").slice(0,ls),$=U?Ie(f,U).filter(Y=>!Re(Y)&&me(Y)):[],K=$.find(Y=>Jr(f,Y.sec,Y.para).trim().startsWith(U))??$[0];if(!K){S.push(O);continue}const z=Xr(f,K.sec,K.para);z!==Number(M[1])&&(zr(f,g,T.cell,String(z)),b+=1)}return A(m,X(f)),{ok:!0,lines:w,changed:b,...S.length>0?{missing:S}:{},place:{sec:g.sec,para:g.para,offset:0,length:0}}},h))}),listNotes:G(()=>e.read(a=>{const{notes:s,elsewhere:h}=st(a);return{count:s.length,elsewhere:h,notes:s.slice(0,Yl).map((p,d)=>({note:d+1,...qt(p),after:ns(a,p),text:ee(p.lines.join(`
`),ql),...p.plain?{}:{objects:!0},...p.numbered?{}:{noAutoNumber:!0}}))}})),insertNote:G((a,s,h,p,d)=>{if(!kn.includes(a))throw _("BAD_ARGUMENT","kind must be footnote or endnote");const A=Ur(p),f=m=>{const x=Ie(m,s),w=$e(x,h),b=w.hit?!me(w.hit)||Re(w.hit)?"unsupported_place":null:w.reason;return{hits:x,hit:b?null:w.hit,reason:b}},g=e.read(m=>{const{hits:x,reason:w}=f(m);return w?{ok:!1,reason:w,count:x.length,...w==="ambiguous"?{matches:Le(m,x)}:{}}:null});return g||te(m=>V("insert-note",x=>{const{hit:w}=f(x);if(!w)throw _("CHANGED","the document changed mid-call");const b=X(x),S=w.charOffset+w.length,I=v(a==="endnote"?x.insertEndnote(w.sec,w.para,S):x.insertFootnote(w.sec,w.para,S));if(!I.ok||!Number.isInteger(I.controlIdx))throw _("ENGINE",`could not add the ${a}`);const k={sec:w.sec,para:I.paraIdx??w.para,control:I.controlIdx},T=v(x.getFootnoteInfo(k.sec,k.para,k.control)).totalTextLen;return Fr(x,k,T,A),m({...b,controls:b.controls+1},X(x)),{ok:!0,kind:a,number:I.footnoteNumber??I.endnoteNumber??null,place:ot(w,w.length)}},d))}),editNote:G((a,s,h)=>{const p=Ur(s),d=e.read(A=>{const{notes:f}=st(A),g=f[a-1];return!Number.isInteger(a)||!g?{ok:!1,reason:"no_such_note",count:f.length}:g.plain?null:{ok:!1,reason:"has_objects",count:1}});return d||te(A=>V("edit-note",f=>{const g=st(f).notes[a-1];if(!g||!g.plain)throw _("CHANGED","the document changed mid-call");const m=X(f);for(let w=g.lines.length-1;w>0;w--)F(f.mergeParagraphInFootnote(g.sec,g.para,g.control,w),"merge the note");const x=v(f.getFootnoteInfo(g.sec,g.para,g.control)).totalTextLen;return x>g.prefix&&F(f.deleteTextInFootnote(g.sec,g.para,g.control,0,g.prefix,x-g.prefix),"clear the note"),Fr(f,g,g.prefix,p),A(m,X(f)),{ok:!0,...qt(g),was:ee(g.lines.join(`
`),Ee),place:{sec:g.sec,para:g.para,offset:g.offset,length:0}}},h))}),deleteNote:G((a,s)=>{const h=e.read(p=>{const{notes:d}=st(p);return Number.isInteger(a)&&d[a-1]?null:{ok:!1,reason:"no_such_note",count:d.length}});return h||te(p=>V("delete-note",d=>{const A=st(d).notes[a-1];if(!A)throw _("CHANGED","the document changed mid-call");const f=X(d);return F(d.deleteFootnote(A.sec,A.para,A.control),"remove the note"),p({...f,controls:f.controls-1},X(d)),{ok:!0,...qt(A),text:ee(A.lines.join(`
`),Ee),place:{sec:A.sec,para:A.para,offset:A.offset,length:0}}},s))}),noteSettings:G(()=>e.read(a=>({sections:a.getSectionCount(),footnote:ct(a,"footnote",0),endnote:ct(a,"endnote",0)}))),setNoteSettings:G((a,s,h)=>{const p=hl(a,s),d=a==="footnote"?"applyFootnoteShape":"applyEndnoteShape";return e.read(f=>typeof f[d]=="function")?V("note-settings",f=>{const g=f.getSectionCount();for(let m=0;m<g;m++){const x=JSON.stringify(gl(f,a,m,p));F(f[d](m,x),`change the ${a} settings`)}return{ok:!0,kind:a,settings:ct(f,a,0)}},h):{ok:!1,reason:"unsupported"}}),pageSetup:G(()=>e.read(a=>{const s=[];for(let h=0;h<a.getSectionCount();h++)s.push(hn(a,h));return{sections:s}})),setPageSetup:G((a,s,h)=>{const p=sl(a),d=f=>{const g=f.getSectionCount();return s==null?Array.from({length:g},(m,x)=>x):Number.isInteger(s)&&s>=1&&s<=g?[s-1]:null},A=e.read(f=>{const g=d(f);if(!g)return{ok:!1,reason:"no_such_section",count:f.getSectionCount()};for(const m of g)if(!il(v(f.getPageDef(m)),p))return{ok:!1,reason:"no_text_area",section:m+1};return null});return A||V("page-setup",f=>{const g=d(f);if(!g)throw _("CHANGED","the document changed mid-call");for(const m of g)F(f.setPageDef(m,JSON.stringify(p)),"change the page setup");return{ok:!0,sections:g.length,pageSetup:hn(f,g[0])}},h)}),paragraphLooks:G(a=>e.read(s=>wl(s,a))),formatting:G(a=>e.read(s=>{if(a==null)return{ok:!0,...Pr(s)};if(typeof a!="string"||a==="")throw _("BAD_ARGUMENT","the document must come as base64");const h=s.constructor;let p;try{p=new h(Il(a))}catch(d){return{ok:!1,reason:"unreadable",message:ee(ir(d).message,200)}}try{const d=Pr(p);return{ok:!0,...d,looks:d.looks.map(({id:A,...f})=>f)}}finally{p.free?.()}})),formatLook:G((a,s,h)=>{const p=it(s,!0),d=f=>Rt(f).looks.find(g=>g.id===a)??null,A=e.read(f=>d(f)?wt(f,p):{ok:!1,reason:"no_such_look",looks:Rt(f).looks.slice(0,Et).map(m=>({id:m.id,paragraphs:m.places.length,sample:m.samples[0]}))});return A||te(f=>V("format-look",g=>{const m=d(g);if(!m)throw _("CHANGED","the document changed mid-call");const x=X(g),{chars:w,paragraph:b,style:S,charShape:I}=Ve(g,p);let k=0;const T=[];for(const{sec:M,para:O}of m.places){const U=fe(g,{sec:M,para:O,charOffset:0}),$=U.length(O);S!==null&&Wt(g,U,O)===!0&&(k+=1),S!==null&&U.applyStyle(O,S),I!==null&&$>0&&U.setCharShape(O,0,$,I),b&&U.formatParagraph(O,b),w&&$>0&&U.formatChars(O,0,$,w),T.push(U.place(O,$))}return f(x,X(g)),{ok:!0,paragraphs:m.places.length,place:T[0],marks:T,...k>0?{keptOwnLook:k}:{}}},h))}),listMemos:G(()=>{W=null;let a=!0;try{a=e.read(h=>typeof h.getMemoList=="function")!==!1}catch{}try{e.automation.execute(Zn)}catch{}const s=W??e.read(zt);return c=s.map(Xt),{count:s.length,memos:s,supported:a}}),memoSelection:G(()=>{q=null;try{e.automation.execute(Qn)}catch{return{ok:!1,reason:"none"}}return q??{ok:!1,reason:"none"}}),insertMemo:G((a,s,h,p)=>{const d=Ra(a);if(typeof h!="string")throw _("BAD_ARGUMENT","text must be a string");if(h.length>tr)return{ok:!1,reason:"memo_text_too_long"};const A=e.read(f=>{if(xt(f))return{ok:!1,reason:"protected"};if(fe(f,{sec:d.sectionIndex,para:d.paraIndex,cellPath:d.path}).length(Z(d))<d.endCharIdx)return{ok:!1,reason:"memo_invalid_range"};const m=`${d.sectionIndex}:${d.paraIndex}:${nn(d.path)}`;return cr(de(f),m,d.startCharIdx,d.endCharIdx)?{ok:!1,reason:"memo_overlap"}:null});return A||Q("memo-insert",p,f=>{const g=JSON.stringify({author:va(s),text:h}),m=v(d.path?f.insertMemoByPath(d.sectionIndex,d.paraIndex,JSON.stringify(d.path),d.startCharIdx,d.endCharIdx,g):f.insertMemo(d.sectionIndex,d.paraIndex,d.startCharIdx,d.endCharIdx,g));if(!m||m.ok!==!0)throw _("ENGINE_REFUSED","the editor refused to add the memo");return{ok:!0,id:m.id,index:m.index}})}),setMemo:G((a,s,h)=>{if(!Number.isInteger(a))return{ok:!1,reason:"memo_not_found"};if(typeof s!="string")throw _("BAD_ARGUMENT","text must be a string");if(s.length>tr)return{ok:!1,reason:"memo_text_too_long"};const p=e.read(d=>{if(xt(d))return{ok:!1,reason:"memo_read_only",why:"protected"};const A=de(d).find(f=>f.id===a);return A?A.editable!==!0?{ok:!1,reason:"memo_read_only",why:A.readOnlyReason??null}:null:{ok:!1,reason:"memo_not_found"}});return p||Q("memo-set",h,d=>(F(d.setMemoText(a,s),"change the memo"),{ok:!0}))}),removeMemo:G((a,s)=>{if(!Number.isInteger(a))return{ok:!1,reason:"memo_not_found"};const h=e.read(p=>{if(xt(p))return{ok:!1,reason:"memo_read_only",why:"protected"};const d=de(p).find(A=>A.id===a);return d?d.readOnlyReason==="protected"||d.readOnlyReason==="unsupported_place"?{ok:!1,reason:"memo_read_only",why:d.readOnlyReason}:null:{ok:!1,reason:"memo_not_found"}});return h||Q("memo-remove",s,p=>(F(p.removeMemo(a),"remove the memo"),{ok:!0}))}),showMemoAnchors:G(a=>(i=a===!0,!i&&pe&&(pe(),pe=null),R(),{ok:!0,shown:i})),selectMemo:G(a=>(u=Number.isInteger(a)?a:null,R(),{ok:!0,id:u})),setMemoLock:G(a=>se(a===!0)),clearMarks:G(()=>(l=[],dt(),{ok:!0})),measureTabs:G(a=>{if(!Array.isArray(a)||a.length>ps)throw _("BAD_ARGUMENT","spots must be a list of tab places");return e.read(s=>({tabs:a.map(h=>{try{return ws(s,h)}catch{return null}})}))}),undo:G((a,s)=>{if(!Number.isInteger(a)||a<1||a>Fo)throw _("BAD_ARGUMENT","steps must be a small positive integer");if(s!==n)return{ok:!1,reason:"changed",undone:0};let h=0;t=!0,r=null;try{for(let p=0;p<a;p++){const d=e.automation.execute("edit:undo");if(!d||d.ok!==!0)break;h+=1}}finally{t=!1}return N({notify:!1}),R(),{ok:h===a,undone:h}})};for(const[a,s,h]of[[ua,"Add a memo",p=>et.insertMemo(p?.anchor,p?.author,p?.text,p?.options)],[fa,"Change the memo",p=>et.setMemo(p?.id,p?.text,p?.options)],[ha,"Remove the memo",p=>et.removeMemo(p?.id,p?.options)]])try{e.automation.registerCommand({id:a,label:s,execute:(p,d)=>{try{h(d)}catch{}}})}catch{}return et}};export{Lo as AGENT_PLUGIN_ID,Zo as DIRTY_EVENT,Wn as EASY_WORDS_COMMAND,Qo as EASY_WORDS_EVENT,qo as FILE_COMMAND_EVENT,ca as MEMO_NOT_COPIED_EVENT,ia as MEMO_REMOVED_EVENT,ea as MISSING_FONTS_EVENT,_s as agentPlugin,tl as syncStyleList};
