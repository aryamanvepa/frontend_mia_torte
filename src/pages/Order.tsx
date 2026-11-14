import { useEffect, useState, type FormEvent } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { Icon, Spinner } from '../components/ui';
import { site } from '../content/site';
import { requestCancellation, trackOrder, type OrderStatus } from '../lib/api';
import { rupees } from '../lib/format';
import { LAST_ORDER_KEY } from '../lib/keys';
import { useSeo } from '../lib/seo';

interface LastOrder {
  code: string; status: string | null; stock_reserved: boolean; total: number; test?: boolean;
  lines: { name: string; qty: number }[]; name: string; phone: string | null;
}

// ---------------------------------------------------------------- confirmation
export function OrderConfirmed() {
  const { code = '' } = useParams();
  const [copied, setCopied] = useState(false);
  let last: LastOrder | null = null;
  try {
    const raw = JSON.parse(sessionStorage.getItem(LAST_ORDER_KEY) || 'null');
    if (raw?.code === code) last = raw;
  } catch { /* ignore */ }
  useSeo({ title: `Order ${code} · ${site.name}`, noindex: true });
  useEffect(() => { window.scrollTo(0, 0); }, [code]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* ignore */ }
  };

  return (
    <div className="confirm wrap">
      <div className="confirm__card">
        <div className="confirm__seal" aria-hidden="true"><Icon name="check" size={34} /></div>
        <p className="eyebrow">Order received</p>
        <h1 className="display display--lg">Thank you{last?.name ? `, ${last.name}` : ''}.</h1>
        <p className="lede">Your order is confirmed and is now with our kitchen to pack.</p>

        <div className="confirm__code">
          <span className="confirm__code-label">Your order number</span>
          <span className="confirm__code-value">{code}</span>
          <button className="linkbtn" onClick={copy} aria-live="polite"><Icon name="copy" size={16} /> {copied ? 'Copied' : 'Copy'}</button>
        </div>

        {last?.test && (
          <p className="banner banner--info"><strong>Test order.</strong> Follow it through in the ops app: Orders → Process → pack, dispatch and record the cash on delivery.</p>
        )}
        {last && !last.test && !last.stock_reserved && (
          <p className="banner banner--info">One of your items ran short just as you ordered. We will call you to confirm before dispatch.</p>
        )}

        {last && (
          <div className="confirm__summary">
            <ul>{last.lines.map((l) => <li key={l.name}><span>{l.name}</span><span>× {l.qty}</span></li>)}</ul>
            <p className="confirm__total"><span>To pay on delivery</span><strong>{rupees(last.total)}</strong></p>
          </div>
        )}

        <ol className="steps">
          <li><strong>Packed by hand</strong><span>We pack your order fresh, usually within 1–2 working days.</span></li>
          <li><strong>On its way</strong><span>Our delivery partner will contact you on your mobile number.</span></li>
          <li><strong>Pay on delivery</strong><span>Pay {last ? rupees(last.total) : 'the order total'} when it arrives.</span></li>
        </ol>

        <div className="confirm__cta">
          <Link to={`/track?code=${encodeURIComponent(code)}`} className="btn btn--dark">Track this order</Link>
          <Link to="/" className="btn btn--line">Continue shopping</Link>
        </div>
        <p className="confirm__note">Keep your order number handy. You can track it any time with the phone number you used.</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- tracking
const STEPS = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'packed', label: 'Packed' },
  { key: 'dispatched', label: 'On its way' },
  { key: 'delivered', label: 'Delivered' },
];
const RANK: Record<string, number> = { pending_payment: -1, confirmed: 0, packing: 0, packed: 1, dispatched: 2, delivered: 3, delivery_failed: 2 };
const MESSAGE: Record<string, string> = {
  pending_payment: 'We are waiting for payment confirmation.',
  confirmed: 'Your order is confirmed and waiting to be packed.',
  packing: 'Your order is being packed right now.',
  packed: 'Packed and ready. It will be handed to our delivery partner soon.',
  dispatched: 'On its way to you. Our delivery partner will call before arriving.',
  delivered: 'Delivered. We hope you enjoy every bite.',
  delivery_failed: 'We could not deliver your order. We will contact you to arrange another attempt.',
  cancelled: 'This order has been cancelled.',
};

export function Track() {
  const [params] = useSearchParams();
  const [code, setCode] = useState(params.get('code') ?? '');
  const [phone, setPhone] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem(LAST_ORDER_KEY) || 'null')?.phone ?? ''; } catch { return ''; }
  });
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [result, setResult] = useState<OrderStatus | null>(null);
  useSeo({ title: `Track your order · ${site.name}`, description: 'Check the status of your Mia Torte or Nutri Sampoorn order with your order number and phone number.', noindex: true });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setState('loading');
    try {
      setResult(await trackOrder(code, phone));
      setState('done');
    } catch {
      setState('error');
    }
  }
  const rank = result?.status ? RANK[result.status] ?? -1 : -1;

  return (
    <div className="track wrap">
      <header className="page-head page-head--narrow">
        <p className="eyebrow">Order tracking</p>
        <h1 className="display display--lg">Where is my order?</h1>
        <p className="lede">Enter your order number (it starts with ORD) and the mobile number you ordered with.</p>
      </header>
      <form className="track__form" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="t-code">Order number</label>
          <input id="t-code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="ORD-2026-000123" required autoComplete="off" autoCapitalize="characters" spellCheck={false} />
        </div>
        <div className="field">
          <label htmlFor="t-phone">Mobile number</label>
          <input id="t-phone" type="tel" inputMode="numeric" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="98xxxxxxxx" required autoComplete="tel-national" />
        </div>
        <button className="btn btn--dark" disabled={state === 'loading'}>{state === 'loading' ? <><Spinner /> Checking…</> : 'Track order'}</button>
      </form>

      <div aria-live="polite">
        {state === 'error' && <p className="banner banner--error">We could not check right now. Please try again in a moment.</p>}
        {state === 'done' && result && !result.found && (
          <p className="banner banner--warn">We could not find an order with those details. Check the order number and use the same mobile number you ordered with.</p>
        )}
        {state === 'done' && result?.found && (
          <section className="track__result" aria-label={`Order ${result.code}`}>
            <div className="track__top">
              <div>
                <p className="eyebrow">Order {result.code}</p>
                <p className="track__msg">{MESSAGE[result.status ?? ''] ?? result.status}</p>
              </div>
              {result.placed_on && <p className="track__date">Placed {new Date(result.placed_on + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
            </div>
            {result.status !== 'cancelled' && (
              <ol className="timeline">
                {STEPS.map((s, i) => (
                  <li key={s.key} className={`${i <= rank ? 'is-done' : ''} ${i === rank ? 'is-current' : ''}`} aria-current={i === rank ? 'step' : undefined}>
                    <span className="timeline__dot" aria-hidden="true">{i <= rank && <Icon name="check" size={14} />}</span>
                    <span className="timeline__label">{s.label}</span>
                  </li>
                ))}
              </ol>
            )}
            <ul className="track__items">
              {result.items?.map((i) => <li key={i.sku_code}><span>{i.name}</span><span>× {Number(i.qty)}</span></li>)}
            </ul>
            {(result.total != null || result.payment_status) && (
              <p className="track__pay">
                {result.total != null && <>Total {rupees(Number(result.total))}</>}
                {result.payment_status && <> · {result.payment_method === 'online' ? 'Paid online' : 'Pay on delivery'}{result.payment_status === 'paid' ? ' · paid' : ''}</>}
              </p>
            )}
            {result.shipment && (result.shipment.carrier || result.shipment.tracking_url) && (
              <div className="track__ship">
                <Icon name="truck" size={18} />
                <span>{result.shipment.carrier ? `With ${result.shipment.carrier}` : 'Shipped'}{result.shipment.booking_ref ? ` · ref ${result.shipment.booking_ref}` : ''}</span>
                {result.shipment.tracking_url && <a href={result.shipment.tracking_url} target="_blank" rel="noopener" className="btn btn--line">Track delivery</a>}
              </div>
            )}
            {result.refund && <p className="banner banner--info">Refund {result.refund.status}: {rupees(Number(result.refund.amount))}.</p>}
            {result.status !== 'cancelled' && result.status !== 'delivered' && <CancelRequest code={result.code!} phone={phone} status={result} />}
            {result.status === 'delivered' && <p className="track__help">Something not right? <Link to="/contact">Contact us</Link> about a return or refund.</p>}
          </section>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- cancellation request (§10)
function CancelRequest({ code, phone, status }: { code: string; phone: string; status: OrderStatus }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'cancelled' | 'requested' | 'error'>(status.cancel_requested ? 'requested' : 'idle');
  const [msg, setMsg] = useState('');
  const MESSAGES: Record<string, string> = {
    not_found: 'We couldn’t find that order.',
    already_cancelled: 'This order is already cancelled.',
    delivered: 'This order has been delivered. Please contact us about a return.',
    unavailable: 'Online cancellation isn’t available yet. Please contact us and we’ll cancel it for you.',
    try_later: 'We couldn’t send that just now. Please try again in a moment.',
  };
  async function submit(e: FormEvent) {
    e.preventDefault();
    setState('sending');
    const r = await requestCancellation(code, phone, reason);
    if (r.ok) { setState(r.result); return; }
    setState('error'); setMsg(MESSAGES[r.error] ?? MESSAGES.try_later);
  }
  if (state === 'cancelled') return <p className="banner banner--info" role="status">Your order has been cancelled. If you paid online, the refund will follow.</p>;
  if (state === 'requested') return <p className="banner banner--info" role="status">We’ve received your cancellation request and will confirm shortly.</p>;
  if (!open) return <button type="button" className="linkbtn track__cancel" onClick={() => setOpen(true)}>Request cancellation</button>;
  return (
    <form className="track__cancel-form" onSubmit={submit}>
      <p>{status.cancellable === false ? 'This order is already packed, so we’ll review your request.' : 'Orders that aren’t packed yet are cancelled straight away.'}</p>
      <div className="field">
        <label htmlFor="cancel-reason">Reason <span className="field__opt">(optional)</span></label>
        <input id="cancel-reason" value={reason} maxLength={200} onChange={(e) => setReason(e.target.value)} />
      </div>
      {state === 'error' && <p className="banner banner--error" role="alert">{msg} {msg.includes('contact') && <Link to="/contact">Contact us</Link>}</p>}
      <div className="track__cancel-btns">
        <button className="btn btn--dark" disabled={state === 'sending'}>{state === 'sending' ? <><Spinner /> Sending…</> : 'Cancel this order'}</button>
        <button type="button" className="btn btn--ghost" onClick={() => setOpen(false)}>Keep my order</button>
      </div>
    </form>
  );
}
