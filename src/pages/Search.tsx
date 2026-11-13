import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/layout';
import { Icon, Reveal } from '../components/ui';
import { storeCategories } from '../content/store';
import { trackSearch } from '../lib/analytics';
import { paths } from '../lib/brand';
import { search } from '../lib/search';
import { useSeo } from '../lib/seo';
import { useCatalogue } from '../state/store';
import { CatalogueStatus, GridSkeleton } from './Shop';

const SUGGESTED = ['cookies', 'millet snacks', 'multigrain flour', 'dosa mix', 'muesli', 'gluten free'];

/** Search results across the whole catalogue (§8), with images, prices and Quick Add. */
export default function SearchPage() {
  const { items, status } = useCatalogue();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [draft, setDraft] = useState(q);
  useEffect(() => setDraft(q), [q]);
  const results = useMemo(() => (q.trim() ? search(items, q) : []), [items, q]);
  useSeo({ title: q ? `“${q}” · Search · Torte Living` : 'Search · Torte Living', noindex: true });
  useEffect(() => { if (q.trim() && status === 'ready') trackSearch(q.trim(), results.length); }, [q, status]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = (e: FormEvent) => { e.preventDefault(); setParams(draft.trim() ? { q: draft.trim() } : {}); };

  return (
    <div className="wrap search-page">
      <header className="page-head page-head--narrow">
        <h1 className="display display--lg">{q ? <>Results for “{q}”</> : 'Search'}</h1>
        <form className="search-page__form" role="search" onSubmit={submit}>
          <label className="sr-only" htmlFor="search-q">Search the shop</label>
          <input id="search-q" type="search" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Search cookies, snacks, atta…" enterKeyHint="search" autoFocus={!q} />
          <button className="btn btn--dark" type="submit"><Icon name="search" size={18} /> Search</button>
        </form>
      </header>

      <section aria-live="polite" aria-label="Search results">
        {status === 'loading' && <GridSkeleton n={4} />}
        {status === 'error' && <CatalogueStatus />}
        {status === 'ready' && q && (results.length ? (
          <>
            <p className="shop__count">{results.length} {results.length === 1 ? 'product' : 'products'}</p>
            <div className="grid">{results.map((i, n) => <Reveal key={i.code} delay={(n % 4) * 50}><ProductCard code={i.code} /></Reveal>)}</div>
          </>
        ) : (
          <div className="soon">
            <p className="eyebrow">No matches</p>
            <p className="soon__text">We couldn’t find anything for “{q}”. Try a simpler word, or browse a category.</p>
          </div>
        ))}
        {(!q || (status === 'ready' && !results.length)) && (
          <div className="search-page__help">
            <p className="eyebrow">Try</p>
            <ul className="chips">{SUGGESTED.map((s) => <li key={s}><Link className="chip" to={paths.search(s)}>{s}</Link></li>)}</ul>
            <p className="eyebrow">Or browse</p>
            <ul className="chips">{storeCategories.map((c) => <li key={c.slug}><Link className="chip" to={paths.category(c)}>{c.title}</Link></li>)}</ul>
          </div>
        )}
      </section>
    </div>
  );
}
