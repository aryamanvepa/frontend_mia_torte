import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsConfigured, getConsent, setConsent } from '../lib/analytics';

/**
 * Asks before any analytics load (GA4, Meta Pixel). Shows only when analytics IDs are configured
 * and the visitor hasn't chosen yet; "Cookie settings" in the footer reopens it.
 */
export function ConsentBanner() {
  const [open, setOpen] = useState(() => analyticsConfigured && getConsent() === null);
  useEffect(() => {
    const show = () => setOpen(analyticsConfigured);
    window.addEventListener('torte-consent-open', show);
    return () => window.removeEventListener('torte-consent-open', show);
  }, []);
  if (!open) return null;
  const choose = (v: 'granted' | 'denied') => { setConsent(v); setOpen(false); };
  return (
    <div className="consent-bar" role="dialog" aria-live="polite" aria-label="Cookie choices">
      <p>
        We’d like to use analytics cookies (Google Analytics, Meta) to understand how the shop is used and improve it.
        Nothing is set unless you agree. <Link to="/privacy">Privacy policy</Link>
      </p>
      <div className="consent-bar__btns">
        <button type="button" className="btn btn--line" onClick={() => choose('denied')}>No thanks</button>
        <button type="button" className="btn btn--dark" onClick={() => choose('granted')}>Accept</button>
      </div>
    </div>
  );
}
