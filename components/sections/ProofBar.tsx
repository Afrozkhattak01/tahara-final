'use client';

import { useLanguage } from '../LanguageProvider';
import { SHOW_PROOF_BAR, CUSTOMER_SLOTS, CUSTOMERS } from '@/content/misc';

export function ProofBar() {
  const { t } = useLanguage();
  if (!SHOW_PROOF_BAR) return null;
  return (
    <div className="proof r">
      <p className="label">{t('proof.label')}</p>
      <div className="proof-row">
        {CUSTOMERS.length
          ? CUSTOMERS.map(([name, file], i) => (
              <img key={name} className="proof-logo" src={'/logos/customers/' + file}
                   alt={name} loading="lazy" style={{ ['--i' as any]: i }} />
            ))
          : Array.from({ length: CUSTOMER_SLOTS }, (_, i) => (
              <div key={i} className="proof-slot" style={{ ['--i' as any]: i }}>Logo</div>
            ))}
      </div>
    </div>
  );
}
