// =====================================================================
// DESIGN PANEL — the playground's floating "Design" button and side panel
// (a bottom sheet on phones). Every control changes a design token live.
// Playground build only (VITE_PLAYGROUND=1); never in the production bundle.
// =====================================================================
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  BODY_FONTS, HEADING_FONTS, PALETTES, PRODUCTION, contrastChecks, diff, normalise, surfaceColours, warmthMatrix,
  type Design,
} from './design';
import { applyDesign, loadPresets, loadSide, saveDesign, savePresets, saveSide, shareUrl, type Presets, type Slot } from './runtime';

type Set = <K extends keyof Design>(k: K, v: Design[K]) => void;
const same = (a: Design, b: Design) => JSON.stringify(diff(a)) === JSON.stringify(diff(b));

async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); return true; } catch { /* fall back below */ }
  try {
    const t = document.createElement('textarea');
    t.value = text; t.setAttribute('readonly', ''); t.style.position = 'fixed'; t.style.opacity = '0';
    document.body.appendChild(t); t.select();
    const ok = document.execCommand('copy');
    t.remove();
    return ok;
  } catch { return false; }
}

// ---------------------------------------------------------------- controls
function Changed({ k, d, set }: { k: keyof Design | (keyof Design)[]; d: Design; set: Set }) {
  const keys = ([] as (keyof Design)[]).concat(k);
  if (keys.every((x) => d[x] === PRODUCTION[x])) return null;
  return (
    <button type="button" className="pg-undo" onClick={() => keys.forEach((x) => set(x, PRODUCTION[x]))} aria-label="Back to today’s value" title="Back to today’s value">↺</button>
  );
}

function Range({ label, k, d, set, min, max, step, fmt }: {
  label: string; k: keyof Design; d: Design; set: Set; min: number; max: number; step: number; fmt: (n: number) => string;
}) {
  const id = useId();
  const v = d[k] as number;
  return (
    <div className="pg-row">
      <label htmlFor={id}>{label}</label>
      <output htmlFor={id}>{fmt(v)}</output>
      <Changed k={k} d={d} set={set} />
      <input id={id} type="range" min={min} max={max} step={step} value={v} aria-valuetext={fmt(v)}
        onChange={(e) => set(k, Number(e.target.value) as never)} />
    </div>
  );
}

function Choice<T extends string | number>({ label, k, d, set, options }: {
  label: string; k: keyof Design; d: Design; set: Set; options: [T, string][];
}) {
  const name = useId();
  return (
    <fieldset className="pg-choice">
      <legend>{label}<Changed k={k} d={d} set={set} /></legend>
      <div className="pg-seg">
        {options.map(([val, text]) => (
          <label key={String(val)} className={d[k] === val ? 'is-on' : ''}>
            <input type="radio" name={name} checked={d[k] === val} onChange={() => set(k, val as never)} />
            <span>{text}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Select({ label, k, d, set, options }: { label: string; k: keyof Design; d: Design; set: Set; options: [string, string][] }) {
  const id = useId();
  return (
    <div className="pg-row pg-row--select">
      <label htmlFor={id}>{label}</label>
      <Changed k={k} d={d} set={set} />
      <select id={id} value={d[k] as string} onChange={(e) => set(k, e.target.value as never)}>
        {options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </div>
  );
}

function Colour({ label, k, d, set }: { label: string; k: keyof Design; d: Design; set: Set }) {
  const id = useId();
  const v = d[k] as string;
  const [text, setText] = useState(v);
  useEffect(() => setText(v), [v]);
  return (
    <div className="pg-row pg-row--colour">
      <label htmlFor={id}>{label}</label>
      <Changed k={k} d={d} set={set} />
      <span className="pg-colour">
        <input id={id} type="color" value={v} onChange={(e) => set(k, e.target.value as never)} />
        <input type="text" aria-label={`${label}, hex value`} value={text} maxLength={7} spellCheck={false}
          onChange={(e) => { setText(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) set(k, e.target.value.toLowerCase() as never); }} />
      </span>
    </div>
  );
}

function Toggle({ label, k, d, set }: { label: string; k: keyof Design; d: Design; set: Set }) {
  const id = useId();
  return (
    <div className="pg-row pg-row--toggle">
      <input id={id} type="checkbox" checked={d[k] as boolean} onChange={(e) => set(k, e.target.checked as never)} />
      <label htmlFor={id}>{label}</label>
      <Changed k={k} d={d} set={set} />
    </div>
  );
}

function Group({ title, keys, d, children, badge }: { title: string; keys: (keyof Design)[]; d: Design; children: ReactNode; badge?: ReactNode }) {
  const n = keys.filter((k) => d[k] !== PRODUCTION[k]).length;
  return (
    <details className="pg-group">
      <summary>
        <span>{title}</span>
        {badge}
        {n > 0 && <span className="pg-count" aria-label={`${n} changed`}>{n}</span>}
      </summary>
      <div className="pg-group__body">{children}</div>
    </details>
  );
}

// ---------------------------------------------------------------- panel
const px = (n: number) => `${n}px`;
const pct = (n: number) => `${Math.round(n)}%`;
const x2 = (n: number) => n.toFixed(2);
const DENSITY: [number, string][] = [[0.75, 'Compact'], [1, 'Comfortable (today)'], [1.3, 'Airy']];

export function Panel({ initial }: { initial: Design }) {
  const [d, setD] = useState<Design>(initial);
  const [open, setOpen] = useState(false);
  const [side, setSide] = useState<'left' | 'right'>(loadSide);
  const [presets, setPresets] = useState<Presets>(loadPresets);
  const [status, setStatus] = useState('');
  const [manual, setManual] = useState<{ label: string; text: string } | null>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const wasOpen = useRef(false);

  useEffect(() => { applyDesign(d); saveDesign(d); }, [d]);
  useEffect(() => {
    if (open) titleRef.current?.focus();
    else if (wasOpen.current) toggleRef.current?.focus();
    wasOpen.current = open;
  }, [open]);
  useEffect(() => { if (!status) return; const t = setTimeout(() => setStatus(''), 4000); return () => clearTimeout(t); }, [status]);

  const set: Set = (k, v) => setD((cur) => normalise({ ...cur, [k]: v }));
  const setMany = (patch: Partial<Design>) => setD((cur) => normalise({ ...cur, ...patch }));
  const checks = contrastChecks(d);
  const failing = checks.filter((c) => !c.ok);
  const changed = Object.keys(diff(d)).length;

  const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
  const copyOut = async (label: string, text: string, done: string) => {
    if (await copy(text)) { setManual(null); setStatus(done); return; }
    setManual({ label, text });
    setStatus('Couldn’t reach the clipboard. The text is selected below.');
    setTimeout(() => (document.getElementById('pg-manual') as HTMLTextAreaElement | null)?.focus(), 0);
  };
  const saveSlot = (s: Slot) => { const p = { ...presets, [s]: d }; setPresets(p); savePresets(p); setStatus(`Saved to preset ${s}.`); };
  const showSlot = (s: Slot) => { const p = presets[s]; if (p) { setD(p); setStatus(`Showing preset ${s}.`); } };
  const w = warmthMatrix(d.photoWarmth);

  return (
    <>
      <svg className="pg-svg" aria-hidden="true" focusable="false" width="0" height="0">
        <filter id="lv-warmth" colorInterpolationFilters="sRGB">
          <feColorMatrix type="matrix" values={`${w[0][0]} 0 0 0 0  0 ${w[1][1]} 0 0 0  0 0 ${w[2][2]} 0 0  0 0 0 1 0`} />
        </filter>
      </svg>

      {!open && (
        <button ref={toggleRef} type="button" className={`pg-toggle pg-toggle--${side}`} aria-expanded={false} aria-controls="pg-panel" onClick={() => setOpen(true)}>
          <span aria-hidden="true" className="pg-toggle__dot" data-changed={changed > 0 || undefined} />Design
          <span className="sr-only">: open the design panel{changed ? ` (${changed} settings changed)` : ''}</span>
        </button>
      )}

      <section id="pg-panel" className={`pg-panel pg-panel--${side}`} role="dialog" aria-modal="false" aria-labelledby="pg-title" hidden={!open} onKeyDown={onKey}>
        <header className="pg-head">
          <div>
            <h2 id="pg-title" ref={titleRef} tabIndex={-1}>Design playground</h2>
            <p>Changes show live on this copy of the shop. Playground — ordering is off.</p>
          </div>
          <button type="button" className="pg-icon" onClick={() => { const s = side === 'right' ? 'left' : 'right'; setSide(s); saveSide(s); }}
            aria-label={`Move panel to the ${side === 'right' ? 'left' : 'right'}`} title="Move panel to the other side">⇆</button>
          <button type="button" className="pg-icon" onClick={() => setOpen(false)} aria-label="Close design panel (Escape)" title="Close (Esc)">✕</button>
        </header>

        <div className="pg-tools">
          <div className="pg-actions">
            <button type="button" onClick={() => { setD({ ...PRODUCTION }); setStatus('Back to the live (production) look.'); }} disabled={!changed}>Reset to production</button>
            <button type="button" onClick={() => copyOut('Settings (JSON)', JSON.stringify(d, null, 2), 'Settings copied as JSON.')}>Copy settings</button>
            <button type="button" onClick={() => copyOut('Share link', shareUrl(d), 'Share link copied. It reproduces this look.')}>Share link</button>
          </div>
          <div className="pg-presets" role="group" aria-label="Presets to compare">
            {(['A', 'B', 'C'] as Slot[]).map((s) => {
              const p = presets[s];
              const active = !!p && same(p, d);
              return (
                <div key={s} className={`pg-slot ${active ? 'is-on' : ''}`}>
                  <button type="button" className="pg-slot__show" disabled={!p} onClick={() => showSlot(s)} aria-pressed={active}
                    aria-label={p ? `Show preset ${s}` : `Preset ${s} is empty`}>{s}</button>
                  <button type="button" className="pg-slot__save" onClick={() => saveSlot(s)} aria-label={`Save current settings to preset ${s}`}>Save</button>
                </div>
              );
            })}
          </div>
          {manual && (
            <div className="pg-manual">
              <label htmlFor="pg-manual">{manual.label}: the clipboard is blocked here, so select and copy it</label>
              <textarea id="pg-manual" readOnly value={manual.text} rows={manual.text.length > 120 ? 6 : 2} onFocus={(e) => e.currentTarget.select()} />
              <button type="button" onClick={() => setManual(null)}>Done</button>
            </div>
          )}
          <p className="pg-status" role="status" aria-live="polite">{status || (changed ? `${changed} setting${changed > 1 ? 's' : ''} differ from production.` : 'Showing the live look.')}</p>
        </div>

        <div className="pg-body">
          <Group title="Typography" d={d} keys={['headingFont', 'bodyFont', 'baseSize', 'headingRatio', 'lineHeight', 'headingTracking', 'headingWeight']}>
            <Select label="Heading font" k="headingFont" d={d} set={set} options={Object.entries(HEADING_FONTS).map(([k, f]) => [k, f.label])} />
            <Select label="Body font" k="bodyFont" d={d} set={set} options={Object.entries(BODY_FONTS).map(([k, f]) => [k, f.label])} />
            <Range label="Base size" k="baseSize" d={d} set={set} min={13} max={20} step={0.5} fmt={px} />
            <Range label="Heading scale ratio" k="headingRatio" d={d} set={set} min={0.8} max={1.3} step={0.01} fmt={(n) => `×${x2(n)}`} />
            <Range label="Line height" k="lineHeight" d={d} set={set} min={1.2} max={2.1} step={0.05} fmt={x2} />
            <Range label="Heading letter-spacing" k="headingTracking" d={d} set={set} min={-0.06} max={0.08} step={0.005} fmt={(n) => `${n.toFixed(3)} em`} />
            <Range label="Heading weight" k="headingWeight" d={d} set={set} min={250} max={800} step={10} fmt={String} />
          </Group>

          <Group title="Font sizes" d={d} keys={['sizeH1', 'sizeH2', 'sizeBody', 'sizeSmall', 'sizePrice']}>
            <p className="pg-hint">Percent of today’s size at every screen width.</p>
            <Range label="H1 (page titles)" k="sizeH1" d={d} set={set} min={60} max={160} step={1} fmt={pct} />
            <Range label="H2 (section titles)" k="sizeH2" d={d} set={set} min={60} max={160} step={1} fmt={pct} />
            <Range label="Body" k="sizeBody" d={d} set={set} min={60} max={160} step={1} fmt={pct} />
            <Range label="Small (labels, pack sizes)" k="sizeSmall" d={d} set={set} min={60} max={160} step={1} fmt={pct} />
            <Range label="Price" k="sizePrice" d={d} set={set} min={60} max={160} step={1} fmt={pct} />
          </Group>

          <Group title="Pictures" d={d} keys={['picRadius', 'picBorderWidth', 'picBorderColor', 'picShadow', 'picFrame', 'photoBrightness', 'photoWarmth', 'photoSaturation', 'photoContrast']}>
            <Range label="Corner radius" k="picRadius" d={d} set={set} min={0} max={40} step={1} fmt={px} />
            <Range label="Border width" k="picBorderWidth" d={d} set={set} min={0} max={12} step={1} fmt={px} />
            <Colour label="Border colour" k="picBorderColor" d={d} set={set} />
            <Choice label="Shadow" k="picShadow" d={d} set={set} options={[['today', 'Today'], ['none', 'None'], ['soft', 'Soft'], ['lifted', 'Lifted']]} />
            <Choice label="Frame" k="picFrame" d={d} set={set} options={[['none', 'None'], ['line', 'Thin line'], ['polaroid', 'Polaroid'], ['arch', 'Arched top']]} />
            <p className="pg-sub">Photo treatment <Changed k={['photoBrightness', 'photoWarmth', 'photoSaturation', 'photoContrast']} d={d} set={set} /></p>
            <Range label="Brightness" k="photoBrightness" d={d} set={set} min={0.7} max={1.4} step={0.01} fmt={(n) => pct(n * 100)} />
            <Range label="Warmth" k="photoWarmth" d={d} set={set} min={-1} max={1} step={0.05} fmt={(n) => (n === 0 ? 'as shot' : `${n > 0 ? 'warmer' : 'cooler'} ${Math.round(Math.abs(n) * 100)}`)} />
            <Range label="Saturation" k="photoSaturation" d={d} set={set} min={0.5} max={1.8} step={0.01} fmt={(n) => pct(n * 100)} />
            <Range label="Contrast" k="photoContrast" d={d} set={set} min={0.7} max={1.4} step={0.01} fmt={(n) => pct(n * 100)} />
          </Group>

          <Group title="Colour" d={d} keys={['accent', 'accent2', 'surface', 'surfaceCustom', 'text']}
            badge={failing.length > 0 && <span className="pg-warn-badge">{failing.length} below AA</span>}>
            <div className="pg-palettes" role="group" aria-label="Brand palettes">
              {Object.entries(PALETTES).map(([k, p]) => {
                const bg = surfaceColours({ ...d, surface: p.surface, surfaceCustom: p.surfaceCustom ?? d.surfaceCustom }).bg;
                return (
                  <button key={k} type="button" className="pg-palette" onClick={() => setMany({ accent: p.accent, accent2: p.accent2, surface: p.surface, text: p.text, ...(p.surfaceCustom ? { surfaceCustom: p.surfaceCustom } : {}) })}>
                    <span className="pg-swatches" aria-hidden="true">
                      {[bg, p.accent, p.accent2, p.text].map((c, i) => <span key={i} style={{ background: c }} />)}
                    </span>
                    {p.label}
                  </button>
                );
              })}
            </div>
            <Colour label="Accent (buttons, links, badges)" k="accent" d={d} set={set} />
            <Colour label="Secondary accent (labels, highlights)" k="accent2" d={d} set={set} />
            <Choice label="Page background" k="surface" d={d} set={set} options={[['cream', 'Cream'], ['white', 'White'], ['sand', 'Warm sand'], ['custom', 'Custom']]} />
            {d.surface === 'custom' && <Colour label="Custom background" k="surfaceCustom" d={d} set={set} />}
            <Colour label="Text colour" k="text" d={d} set={set} />
            <div className="pg-contrast">
              <p className="pg-sub">Contrast (WCAG AA)</p>
              <ul>
                {checks.map((c) => (
                  <li key={c.label} className={c.ok ? 'is-ok' : 'is-bad'}>
                    <span aria-hidden="true">{c.ok ? '✓' : '⚠'}</span>
                    <span>{c.label}</span>
                    <strong>{c.ratio.toFixed(2)}:1{c.ok ? '' : ` (needs ${c.min}:1)`}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </Group>

          <Group title="Density & spacing" d={d} keys={['density', 'measure']}>
            <fieldset className="pg-choice">
              <legend>Density<Changed k="density" d={d} set={set} /></legend>
              <div className="pg-seg">
                {DENSITY.map(([v, t]) => (
                  <label key={v} className={d.density === v ? 'is-on' : ''}>
                    <input type="radio" name="pg-density" checked={d.density === v} onChange={() => set('density', v)} />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Range label="Custom spacing" k="density" d={d} set={set} min={0.5} max={1.8} step={0.05} fmt={(n) => `×${x2(n)}`} />
            <Range label="Line length" k="measure" d={d} set={set} min={0.7} max={1.4} step={0.05} fmt={(n) => `×${x2(n)}`} />
          </Group>

          <Group title="Shape & buttons" d={d} keys={['radiusButtons', 'radiusCards', 'radiusInputs', 'buttonStyle', 'buttonSize']}>
            <Choice label="Buttons" k="radiusButtons" d={d} set={set} options={[['sharp', 'Sharp'], ['soft', 'Soft'], ['pill', 'Pill (today)']]} />
            <Choice label="Cards & panels" k="radiusCards" d={d} set={set} options={[['sharp', 'Sharp'], ['soft', 'Soft (today)'], ['round', 'Round']]} />
            <Choice label="Inputs" k="radiusInputs" d={d} set={set} options={[['sharp', 'Sharp'], ['soft', 'Soft (today)'], ['pill', 'Pill']]} />
            <Choice label="Main button style" k="buttonStyle" d={d} set={set} options={[['filled', 'Filled (today)'], ['outline', 'Outline'], ['text', 'Underlined text']]} />
            <Range label="Button size" k="buttonSize" d={d} set={set} min={0.8} max={1.3} step={0.02} fmt={(n) => `×${x2(n)}`} />
          </Group>

          <Group title="Product cards & grid" d={d} keys={['colsDesktop', 'colsMobile', 'cardAspect', 'cardDescription', 'cardSizePicker', 'priceEmphasis']}>
            <Choice label="Columns on desktop" k="colsDesktop" d={d} set={set} options={[[2, '2'], [3, '3'], [4, '4 (today)']]} />
            <Choice label="Columns on phones" k="colsMobile" d={d} set={set} options={[[1, '1'], [2, '2 (today)']]} />
            <Choice label="Photo shape" k="cardAspect" d={d} set={set} options={[['4:5', '4:5 (today)'], ['1:1', 'Square'], ['3:2', '3:2']]} />
            <Toggle label="Show the short description" k="cardDescription" d={d} set={set} />
            <Toggle label="Show the pack-size picker" k="cardSizePicker" d={d} set={set} />
            <Choice label="Price emphasis" k="priceEmphasis" d={d} set={set} options={[['quiet', 'Quiet'], ['today', 'Today'], ['bold', 'Bold'], ['accent', 'Bold + accent']]} />
          </Group>
        </div>
      </section>
    </>
  );
}
