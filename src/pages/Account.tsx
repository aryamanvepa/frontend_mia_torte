import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Icon, Spinner } from '../components/ui';
import { trackAuth } from '../lib/analytics';
import { myOrders, myProfile, sendCode, signOut, useSession, verifyCode, type MyOrder, type MyProfile } from '../lib/auth';
import { rupees } from '../lib/format';
import { useSeo } from '../lib/seo';

const STATUS: Record<string, string> = {
  placed: 'Received', confirmed: 'Confirmed', processing: 'Being prepared', packed: 'Packed', dispatched: 'On its way',
  delivered: 'Delivered', cancelled: 'Cancelled', delivery_failed: 'Delivery attempt failed',
};

/** Customer account (§4, §10): sign in with an emailed code; see orders, track them, ask to cancel. Guest checkout stays the default. */
export default function Account() {
  const { session, ready } = useSession();
  useSeo({ title: 'Your account · Torte Living', noindex: true });
  return (
    <div className="wrap account">
      <header className="page-head page-head--narrow">
        <p className="eyebrow">Your account</p>
        <h1 className="display display--lg">{session ? 'Welcome back.' : 'Sign in'}</h1>
        {!session && <p className="lede">We’ll email you a 6-digit code: no password needed. You can always check out as a guest.</p>}
      </header>
      {!ready ? <p><Spinner /> Loading…</p> : session ? <SignedIn email={session.user.email ?? ''} /> : <SignIn />}
    </div>
  );
}

function SignIn() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function onEmail(e: FormEvent) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(email.trim())) { setMsg('Enter a valid email address.'); return; }
    setBusy(true); setMsg(null);
    const r = await sendCode(email);
    setBusy(false);
    if (r.ok) setStep('code'); else setMsg(r.message);
  }
  async function onCode(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setMsg(null);
    const r = await verifyCode(email, code);
    setBusy(false);
    if (r.ok) trackAuth('login'); else setMsg(r.message);
  }

  return (
    <div className="account__card">
      {step === 'email' ? (
        <form onSubmit={onEmail} noValidate>
          <div className="field">
            <label htmlFor="acc-email">Email address</label>
            <input id="acc-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <button className="btn btn--dark btn--block" disabled={busy}>{busy ? <><Spinner /> Sending…</> : 'Email me a code'}</button>
        </form>
      ) : (
        <form onSubmit={onCode} noValidate>
          <p>We’ve sent a code to <strong>{email}</strong>. It can take a minute to arrive.</p>
          <div className="field">
            <label htmlFor="acc-code">6-digit code</label>
            <input id="acc-code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required />
          </div>
          <button className="btn btn--dark btn--block" disabled={busy || code.length < 6}>{busy ? <><Spinner /> Checking…</> : 'Sign in'}</button>
          <button type="button" className="linkbtn" onClick={() => { setStep('email'); setCode(''); setMsg(null); }}>Use a different email</button>
        </form>
      )}
      {msg && <p className="banner banner--error" role="alert">{msg}</p>}
      <p className="account__note">By signing in you agree to our <Link to="/terms">terms</Link> and <Link to="/privacy">privacy policy</Link>.</p>
    </div>
  );
}

function SignedIn({ email }: { email: string }) {
  const [orders, setOrders] = useState<MyOrder[] | null>(null);
  const [profile, setProfile] = useState<MyProfile | null>(null);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    myOrders().then((r) => { if (r.ok) setOrders(r.data ?? []); else { setOrders([]); setPending(r.missing); } });
    myProfile().then((r) => { if (r.ok) setProfile(r.data); });
  }, []);

  return (
    <div className="account__grid">
      <section className="account__card" aria-labelledby="acc-details">
        <h2 id="acc-details" className="contact__h">Your details</h2>
        <p><Icon name="mail" size={16} /> {email}</p>
        {profile?.full_name && <p>{profile.full_name}</p>}
        {profile?.phone && <p><Icon name="phone" size={16} /> {profile.phone}</p>}
        {profile?.city && <p>{[profile.city, profile.state, profile.pincode].filter(Boolean).join(', ')}</p>}
        <p className="account__note">Checkout fills these in for you.</p>
        <button className="btn btn--line" onClick={() => signOut()}>Sign out</button>
      </section>

      <section aria-labelledby="acc-orders">
        <h2 id="acc-orders" className="display display--sm">Your orders</h2>
        {orders === null && <p><Spinner /> Loading your orders…</p>}
        {pending && <p className="banner banner--info">Order history is being connected. Meanwhile you can track any order with its number and your mobile number. <Link to="/track">Track an order</Link></p>}
        {orders && !pending && orders.length === 0 && (
          <p>No orders yet with {email}. Orders placed with this email address appear here. <Link to="/shop">Start shopping</Link></p>
        )}
        {orders && orders.length > 0 && (
          <ul className="orders">
            {orders.map((o) => (
              <li key={o.code} className="orders__row">
                <div>
                  <p className="orders__code">{o.code}</p>
                  <p className="orders__meta">{new Date(o.placed_on).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {STATUS[o.status] ?? o.status} · {rupees(Number(o.total))}</p>
                  <p className="orders__items">{o.items.map((i) => `${i.name} × ${i.qty}`).join(', ')}</p>
                </div>
                <div className="orders__actions">
                  {o.tracking_url && <a href={o.tracking_url} target="_blank" rel="noopener" className="btn btn--line">Track delivery</a>}
                  <Link to={`/track?code=${encodeURIComponent(o.code)}`} className="arrow-link">Details <Icon name="arrow" size={16} /></Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
