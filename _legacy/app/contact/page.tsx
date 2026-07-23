'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('sending');
    setError('');
    const form = new FormData(e.currentTarget);
    // honeypot — real users never fill this hidden field
    if (form.get('company_website')) { setStatus('ok'); return; }

    try {
      const res = await fetch('/api/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'),
          email: form.get('email'),
          company: form.get('company'),
          message: form.get('message')
        })
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || 'Something went wrong. Please try again.');
      }
      setStatus('ok');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  if (status === 'ok') {
    return (
      <div className="wrap band" style={{ maxWidth: 560 }}>
        <h1 style={{ marginBottom: 12 }}>Thanks — we&rsquo;ll be in touch.</h1>
        <p className="lede">Usually within one business day.</p>
      </div>
    );
  }

  return (
    <div className="wrap band" style={{ maxWidth: 560 }}>
      <h1 style={{ marginBottom: 12 }}>Talk to us.</h1>
      <p className="lede" style={{ marginBottom: 28 }}>Thirty minutes on your own estate — what we&rsquo;d find, what we&rsquo;d block.</p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 14 }}>
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off"
               style={{ position: 'absolute', left: '-9999px' }} aria-hidden="true" />
        <input required name="name" placeholder="Name" className="btn-line"
               style={{ padding: '11px 14px', borderRadius: 10, border: '1px solid var(--line-2)', background: '#fff' }} />
        <input required type="email" name="email" placeholder="Work email"
               style={{ padding: '11px 14px', borderRadius: 10, border: '1px solid var(--line-2)', background: '#fff' }} />
        <input name="company" placeholder="Company"
               style={{ padding: '11px 14px', borderRadius: 10, border: '1px solid var(--line-2)', background: '#fff' }} />
        <textarea name="message" placeholder="What would you like to cover?" rows={4}
                  style={{ padding: '11px 14px', borderRadius: 10, border: '1px solid var(--line-2)', background: '#fff', fontFamily: 'inherit' }} />
        <button className="btn btn-solid" disabled={status === 'sending'} type="submit">
          {status === 'sending' ? 'Sending…' : 'Request a demo'} <span className="arw" aria-hidden="true">→</span>
        </button>
        {status === 'error' && <p style={{ color: 'var(--signal)', fontSize: 13.5 }}>{error}</p>}
      </form>
    </div>
  );
}
