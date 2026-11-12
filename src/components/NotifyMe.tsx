// =====================================================================
// NOTIFY ME — "email me once when this pack is available".
// Shown on sold-out and coming-soon pack sizes. Calls storefront_notify_me
// with the publishable key; the website can never read the list back
// (staff see it in the ops app: More → Back-in-stock alerts).
// Consent is an explicit checkbox, unticked by default; without it the
// database rejects the request.
// =====================================================================
import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { notifyMe } from '../lib/api';
import { Icon, Spinner } from './ui';

const MESSAGES: Record<string, string> = {
  consent_required: 'Please tick the box so we can email you.',
  invalid_email: 'That email address doesn’t look quite right. Please check it.',
  unknown_product: 'This product is no longer listed, so we can’t set up an alert for it.',
  try_later: 'We’ve had a lot of requests from here just now. Please try again in a little while.',
};
const FALLBACK = 'We couldn’t save that just now. Please try again in a moment.';

export function NotifyMe({ code, what, pack, soon }: { code: string; what: string; pack: string; soon: boolean }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError(MESSAGES.invalid_email); return; }
    if (!consent) { setError(MESSAGES.consent_required); return; }
    setState('sending');
    const res = await notifyMe({ sku: code, email, name, consent });
    if (res.ok) { setState('done'); return; }
    setState('idle');
    setError(MESSAGES[res.error] ?? FALLBACK);
  };

  if (state === 'done') {
    return (
      <div className="notify notify--done" role="status">
        <Icon name="check" size={20} />
        <p><strong>Thank you{name.trim() ? `, ${name.trim()}` : ''}.</strong> We’ll email you once, when the {pack} is available.</p>
      </div>
    );
  }

  return (
    <form className="notify" onSubmit={submit} noValidate aria-labelledby={`${id}-h`}>
      <p className="notify__h" id={`${id}-h`}>
        <Icon name="mail" size={18} /> {soon ? 'Tell me when it’s available' : 'Tell me when it’s back'}
      </p>
      <p className="notify__sub">For the {pack}. One email, nothing else.</p>
      <div className="notify__fields">
        <label className="notify__field">
          <span className="sr-only">Email address</span>
          <input type="email" inputMode="email" autoComplete="email" placeholder="Email address" required
            value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={error === MESSAGES.invalid_email || undefined} />
        </label>
        <label className="notify__field notify__field--name">
          <span className="sr-only">First name (optional)</span>
          <input type="text" autoComplete="given-name" placeholder="First name (optional)" maxLength={60}
            value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      </div>
      <label className="notify__consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
        <span>
          Email me once when this is available. We’ll use your email only for this.{' '}
          <Link to="/privacy">Privacy policy</Link>
        </span>
      </label>
      {error && <p className="notify__error" role="alert">{error}</p>}
      <button className="btn btn--dark notify__btn" disabled={state === 'sending'} aria-label={`Notify me about ${what}`}>
        {state === 'sending' ? <><Spinner /> Saving…</> : 'Notify me'}
      </button>
    </form>
  );
}
