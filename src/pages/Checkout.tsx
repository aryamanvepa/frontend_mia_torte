import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon, Spinner, Stepper } from '../components/ui';
import { ProductThumb } from '../components/layout';
import { site } from '../content/site';
import { getQuote, placeOrder, type Problem, type Quote } from '../lib/api';
import { packFull, rupees, titleOf, uuid } from '../lib/format';
import { INDIAN_STATES } from '../lib/states';
import { useBag, useCart, useCatalogue } from '../state/store';

type Fields = 'name' | 'phone' | 'email' | 'address1' | 'address2' | 'city' | 'state' | 'pincode' | 'notes';
type Form = Record<Fields, string> & { marketing: boolean; website: string };
const EMPTY: Form = { name: '', phone: '', email: '', address1: '', address2: '', city: '', state: '', pincode: '', notes: '', marketing: false, website: '' };
const FORM_KEY = 'mia-torte-checkout-form';
const ATTEMPT_KEY = 'mia-torte-checkout-attempt';
import { LAST_ORDER_KEY } from '../lib/keys';

// Mirrors the Edge Function's checks so shoppers get instant feedback (the server re-checks everything).
function normalisePhone(raw: string) {
  let d = raw.replace(/[\s\-().]/g, '').replace(/^\+/, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}
function validate(f: Form): Partial<Record<Fields, string>> {
  const e: Partial<Record<Fields, string>> = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your full name';
  if (!normalisePhone(f.phone)) e.phone = 'Enter a 10-digit Indian mobile number';
  if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(f.email.trim())) e.email = 'Enter a valid email address';
  if (f.address1.trim().length < 5) e.address1 = 'Enter your house/flat number and street';
  if (f.city.trim().length < 2) e.city = 'Enter your city';
  if (!f.state) e.state = 'Choose your state';
  if (!/^[1-9]\d{5}$/.test(f.pincode.trim())) e.pincode = 'Enter a 6-digit PIN code';
  if (f.notes.length > 300) e.notes = 'Keep delivery notes under 300 characters';
  return e;
}
const SERVER_FIELD: Record<string, Fields> = {
  'customer.name': 'name', 'customer.phone': 'phone', 'customer.email': 'email', 'address.address1': 'address1',
  'address.address2': 'address2', 'address.city': 'city', 'address.state': 'state', 'address.pincode': 'pincode', notes: 'notes',
};

export default function Checkout() {
  const { lines, setQty, remove, clear } = useCart();
  const { rows } = useBag();
  const { reload, status: catStatus } = useCatalogue();
  const navigate = useNavigate();

  const [form, setForm] = useState<Form>(() => {
    try { return { ...EMPTY, ...JSON.parse(sessionStorage.getItem(FORM_KEY) || '{}'), website: '' }; } catch { return EMPTY; }
  });
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoteState, setQuoteState] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [problems, setProblems] = useState<Problem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState<{ tone: 'warn' | 'error' | 'info'; text: string } | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [quoteNonce, setQuoteNonce] = useState(0);
  const bannerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { document.title = `Checkout · ${site.name}`; }, []);
  useEffect(() => {
    const { website: _w, ...keep } = form; // never persist the honeypot
    try { sessionStorage.setItem(FORM_KEY, JSON.stringify(keep)); } catch { /* ignore */ }
  }, [form]);

  // Server quote: re-price and re-check stock whenever the bag changes.
  const lineKey = JSON.stringify(lines);
  useEffect(() => {
    if (!lines.length) { setQuote(null); setQuoteState('idle'); return; }
    let live = true;
    setQuoteState('loading');
    const t = setTimeout(async () => {
      const q = await getQuote(lines.map((l) => ({ sku_code: l.code, qty: l.qty })));
      if (!live) return;
      if (q.ok) { setQuote(q); setProblems(q.problems); setQuoteState('ready'); }
      else setQuoteState('error');
    }, 250);
    return () => { live = false; clearTimeout(t); };
  }, [lineKey, quoteNonce]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { if (banner) bannerRef.current?.focus(); }, [banner]);

  const problemFor = (code: string) => problems.find((p) => p.sku_code === code);
  const blocked = problems.length > 0 || quoteState !== 'ready';
  const update = (k: keyof Form, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k as Fields]) setErrors((e) => ({ ...e, [k]: undefined }));
  };
  const freeGap = quote && quote.shipping > 0 ? quote.shipping_rule.free_above + 1 - quote.subtotal : 0;

  const payload = useMemo(() => ({
    lines: lines.map((l) => ({ sku_code: l.code, qty: l.qty })),
    customer: { name: form.name.trim(), phone: form.phone, email: form.email.trim(), marketing_consent: form.marketing },
    address: { address1: form.address1.trim(), address2: form.address2.trim(), city: form.city.trim(), state: form.state, pincode: form.pincode.trim() },
    notes: form.notes.trim(),
    expected_total: quote?.total ?? 0,
  }), [lines, form, quote]);

  // One id per distinct order attempt: a retry of the same details reuses it (no duplicate order);
  // any change to bag, details or total starts a new attempt.
  function attemptKey() {
    const fp = JSON.stringify(payload);
    try {
      const saved = JSON.parse(sessionStorage.getItem(ATTEMPT_KEY) || 'null');
      if (saved?.fp === fp) return saved.key as string;
      const key = uuid();
      sessionStorage.setItem(ATTEMPT_KEY, JSON.stringify({ fp, key }));
      return key;
    } catch { return uuid(); }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const v = validate(form);
    setErrors(v);
    if (Object.keys(v).length) {
      setBanner(null);
      const first = Object.keys(v)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    if (blocked || !quote) return;
    setSubmitting(true);
    setBanner(null);
    const res = await placeOrder({ ...payload, idempotency_key: attemptKey(), website: form.website });
    setSubmitting(false);

    if (res.ok) {
      const summary = {
        code: res.order_code, status: res.status, stock_reserved: res.stock_reserved !== false,
        total: res.total ?? quote.total, lines: quote.lines.map((l) => ({ name: l.name, qty: l.qty })),
        name: form.name.trim().split(' ')[0], phone: normalisePhone(form.phone),
      };
      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(summary));
        sessionStorage.removeItem(ATTEMPT_KEY);
        sessionStorage.removeItem(FORM_KEY);
      } catch { /* ignore */ }
      clear();
      reload();
      navigate(`/order/${encodeURIComponent(res.order_code)}`, { replace: true });
      return;
    }
    switch (res.error) {
      case 'sold_out':
        setProblems('problems' in res ? res.problems : []);
        setBanner({ tone: 'warn', text: 'Some items sold out while you were checking out. Please review the items marked below.' });
        reload();
        break;
      case 'price_changed':
        if ('total' in res) setQuote((q) => (q ? { ...q, lines: res.lines, subtotal: res.subtotal, shipping: res.shipping, total: res.total } : q));
        setBanner({ tone: 'info', text: `Prices have just been updated. Your new total is ${'total' in res ? rupees(res.total) : ''}. Please review and place your order again.` });
        reload();
        break;
      case 'invalid': {
        const fe: Partial<Record<Fields, string>> = {};
        if ('fields' in res) for (const [k, m] of Object.entries(res.fields)) if (SERVER_FIELD[k]) fe[SERVER_FIELD[k]] = m;
        setErrors(fe);
        setBanner({ tone: 'error', text: Object.keys(fe).length ? 'Please check the highlighted details.' : 'Something about this order could not be accepted. Please refresh the page and try again.' });
        break;
      }
      case 'too_many_orders':
        setBanner({ tone: 'error', text: 'We have received several orders from this phone number today. Please contact us to place another.' });
        break;
      case 'network':
        setBanner({ tone: 'error', text: 'We could not reach the shop. Check your connection and press “Place order” again. You will not be charged twice or receive a duplicate order.' });
        break;
      default:
        setBanner({ tone: 'error', text: ('message' in res && res.message) || 'Something went wrong on our side. Please press “Place order” again. It is safe to retry.' });
    }
  }

  if (!lines.length) {
    return (
      <div className="wrap section checkout-empty">
        <h1 className="display display--md">Your bag is empty</h1>
        <p>Add something lovely and come back.</p>
        <Link to="/" className="btn btn--dark">Browse the shops</Link>
      </div>
    );
  }

  const field = (k: Fields, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, hint?: string) => (
    <div className={`field ${errors[k] ? 'has-error' : ''} ${props.className ?? ''}`}>
      <label htmlFor={`f-${k}`}>{label}{props.required === false && <span className="field__opt"> (optional)</span>}</label>
      <input id={`f-${k}`} name={k} value={form[k]} onChange={(e) => update(k, e.target.value)}
        aria-invalid={Boolean(errors[k])} aria-describedby={errors[k] ? `e-${k}` : hint ? `h-${k}` : undefined} {...props} className={undefined} required={props.required !== false} />
      {hint && !errors[k] && <p className="field__hint" id={`h-${k}`}>{hint}</p>}
      {errors[k] && <p className="field__error" id={`e-${k}`}>{errors[k]}</p>}
    </div>
  );

  const summary = (
    <div className="summary">
      <ul className="summary__lines">
        {rows.map((r) => {
          const p = problemFor(r.code);
          const ql = quote?.lines.find((l) => l.sku_code === r.code);
          return (
            <li key={r.code} className={`sline ${p ? 'sline--problem' : ''}`}>
              <div className="sline__img"><ProductThumb code={r.code} item={r.item} sizes="64px" /><span className="sline__qty" aria-hidden="true">{r.qty}</span></div>
              <div className="sline__body">
                <p className="sline__name">{r.item ? titleOf(r.item) : ql?.name ?? r.code}</p>
                <p className="sline__meta">{r.item ? packFull(r.item) : ''} · Qty {r.qty}</p>
                {p && (
                  <div className="sline__warn" role="status">
                    {p.reason === 'insufficient' ? `Only ${p.available} left.` : p.reason === 'sold_out' ? 'Sold out.' : 'No longer available.'}
                    <div className="sline__fix">
                      {p.available > 0 && <button type="button" className="linkbtn" onClick={() => setQty(r.code, p.available)}>Change to {p.available}</button>}
                      <button type="button" className="linkbtn" onClick={() => remove(r.code)}>Remove</button>
                    </div>
                  </div>
                )}
                {!p && r.item && r.max > 0 && (
                  <Stepper size="sm" value={Math.min(r.qty, r.max)} max={r.max} label={titleOf(r.item)} onChange={(n) => setQty(r.code, n)} />
                )}
              </div>
              <p className="sline__price">{ql ? rupees(ql.line_total) : ''}</p>
            </li>
          );
        })}
      </ul>
      <dl className="totals" aria-live="polite">
        <div><dt>Subtotal</dt><dd>{quote ? rupees(quote.subtotal) : '—'}</dd></div>
        <div><dt>Delivery</dt><dd>{quote ? (quote.shipping ? rupees(quote.shipping) : 'Free') : '—'}</dd></div>
        {freeGap > 0 && <p className="totals__free">Add {rupees(Math.ceil(freeGap))} more for free delivery.</p>}
        <div className="totals__grand"><dt>Total <span>incl. GST</span></dt><dd>{quoteState === 'loading' ? <Spinner /> : quote ? rupees(quote.total) : '—'}</dd></div>
      </dl>
      {quoteState === 'error' && <p className="field__error" role="alert">Could not confirm prices. <button type="button" className="linkbtn" onClick={() => setQuoteNonce((n) => n + 1)}>Retry</button></p>}
    </div>
  );

  return (
    <div className="checkout wrap">
      <header className="checkout__head">
        <Link to="/" className="back-link"><Icon name="back" size={18} /> Continue shopping</Link>
        <h1 className="display display--md">Checkout</h1>
      </header>

      <div className="checkout__mobile-summary">
        <button type="button" className="summary-toggle" aria-expanded={summaryOpen} aria-controls="mobile-summary" onClick={() => setSummaryOpen((o) => !o)}>
          <span><Icon name="bag" size={18} /> {summaryOpen ? 'Hide' : 'Show'} order summary</span>
          <strong>{quote ? rupees(quote.total) : '—'}</strong>
        </button>
        <div id="mobile-summary" hidden={!summaryOpen}>{summary}</div>
      </div>

      <div className="checkout__grid">
        <form ref={formRef} className="checkout__form" onSubmit={onSubmit} noValidate>
          {banner && <div ref={bannerRef} tabIndex={-1} className={`banner banner--${banner.tone}`} role="alert">{banner.text}</div>}

          <fieldset className="fs">
            <legend className="fs__legend"><span className="fs__no">1</span> Contact</legend>
            {field('name', 'Full name', { autoComplete: 'name', maxLength: 80 })}
            <div className="row-2">
              <div className={`field ${errors.phone ? 'has-error' : ''}`}>
                <label htmlFor="f-phone">Mobile number</label>
                <div className="phone-input">
                  <span aria-hidden="true">+91</span>
                  <input id="f-phone" name="phone" type="tel" inputMode="numeric" autoComplete="tel-national" maxLength={14}
                    value={form.phone} onChange={(e) => update('phone', e.target.value)} required
                    aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? 'e-phone' : 'h-phone'} />
                </div>
                {errors.phone ? <p className="field__error" id="e-phone">{errors.phone}</p> : <p className="field__hint" id="h-phone">For delivery updates and to track your order.</p>}
              </div>
              {field('email', 'Email', { type: 'email', autoComplete: 'email', inputMode: 'email', maxLength: 120 })}
            </div>
          </fieldset>

          <fieldset className="fs">
            <legend className="fs__legend"><span className="fs__no">2</span> Delivery address</legend>
            {field('address1', 'House / flat, street', { autoComplete: 'address-line1', maxLength: 200 })}
            {field('address2', 'Area, landmark', { autoComplete: 'address-line2', maxLength: 200, required: false })}
            <div className="row-3">
              {field('city', 'City', { autoComplete: 'address-level2', maxLength: 60 })}
              <div className={`field ${errors.state ? 'has-error' : ''}`}>
                <label htmlFor="f-state">State</label>
                <select id="f-state" name="state" value={form.state} onChange={(e) => update('state', e.target.value)} autoComplete="address-level1" required
                  aria-invalid={Boolean(errors.state)} aria-describedby={errors.state ? 'e-state' : undefined}>
                  <option value="">Choose…</option>
                  {INDIAN_STATES.map((s) => <option key={s}>{s}</option>)}
                </select>
                {errors.state && <p className="field__error" id="e-state">{errors.state}</p>}
              </div>
              {field('pincode', 'PIN code', { inputMode: 'numeric', autoComplete: 'postal-code', maxLength: 6, pattern: '[0-9]*' })}
            </div>
            <div className={`field ${errors.notes ? 'has-error' : ''}`}>
              <label htmlFor="f-notes">Delivery notes <span className="field__opt">(optional)</span></label>
              <textarea id="f-notes" name="notes" rows={2} maxLength={300} value={form.notes} onChange={(e) => update('notes', e.target.value)}
                placeholder="Gate code, landmark, best time to call" />
              {errors.notes && <p className="field__error">{errors.notes}</p>}
            </div>
            {/* Honeypot: hidden from people and screen readers; bots tend to fill it. */}
            <div className="hp" aria-hidden="true">
              <label htmlFor="f-website">Website</label>
              <input id="f-website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update('website', e.target.value)} />
            </div>
          </fieldset>

          <fieldset className="fs">
            <legend className="fs__legend"><span className="fs__no">3</span> Payment</legend>
            <div className="cod">
              <span className="cod__radio" aria-hidden="true"><span /></span>
              <div>
                <p className="cod__title">Pay on delivery</p>
                <p className="cod__text">{site.codNote}</p>
              </div>
              <Icon name="hand" size={28} className="cod__icon" />
            </div>
            <p className="field__hint">Online payment (UPI / cards) is coming soon.</p>
          </fieldset>

          <label className="consent">
            <input type="checkbox" name="marketing" checked={form.marketing} onChange={(e) => update('marketing', e.target.checked)} />
            <span>Send me news of new bakes and offers by email. Optional: you can unsubscribe at any time.</span>
          </label>

          <div className="place">
            <button type="submit" className="btn btn--dark btn--block btn--lg" disabled={submitting || blocked} aria-busy={submitting}>
              {submitting ? <><Spinner /> Placing your order…</> : <>Place order{quote ? ` · ${rupees(quote.total)}` : ''}</>}
            </button>
            {problems.length > 0 && <p className="field__error">Please update the items marked in your order summary.</p>}
            <p className="place__terms">By placing this order you agree to our <Link to="/terms">terms of sale</Link> and <Link to="/privacy">privacy policy</Link>.</p>
            {catStatus === 'error' && <p className="field__hint">Live stock could not be refreshed. Your order will still be checked before it is placed.</p>}
          </div>
        </form>

        <aside className="checkout__aside" aria-label="Order summary">
          <h2 className="checkout__aside-h">Order summary</h2>
          {summary}
          <p className="aside__note"><Icon name="info" size={16} /> Prices and stock are confirmed by our system when you place the order.</p>
        </aside>
      </div>
    </div>
  );
}
