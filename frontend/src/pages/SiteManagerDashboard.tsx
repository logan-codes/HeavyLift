import { useEffect, useState } from 'react';
import { api } from '../api/client';
import type { Site } from '../api/types';
import { EquipmentList } from './EquipmentList';
import { AlertsPage } from './AlertsPage';

const SELECTED_SITE_KEY = 'siteManagerSelectedSiteId';

export function SiteManagerDashboard() {
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<number | null>(() => {
    const saved = localStorage.getItem(SELECTED_SITE_KEY);
    return saved ? Number(saved) : null;
  });

  useEffect(() => {
    api.get<Site[]>('/api/sites').then((data) => {
      setSites(data);
      if (siteId == null && data.length > 0) {
        setSiteId(data[0].siteId);
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSiteChange = (id: number) => {
    setSiteId(id);
    localStorage.setItem(SELECTED_SITE_KEY, String(id));
  };

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Site Manager</h1>
          <p className="subtitle">
            Equipment currently at your site. The schema has no user&rarr;site
            assignment, so pick your site below.
          </p>
        </div>
        <label>
          Site
          <select value={siteId ?? ''} onChange={(e) => handleSiteChange(Number(e.target.value))}>
            {sites.map((s) => <option key={s.siteId} value={s.siteId}>{s.name}</option>)}
          </select>
        </label>
      </header>

      {siteId != null && (
        <>
          <div className="card">
            <h2>Overdue at this site</h2>
            <AlertsPage siteId={siteId} alertType="overdue" />
          </div>
          <div className="card">
            <h2>Equipment at this site</h2>
            <EquipmentList siteId={siteId} />
          </div>
        </>
      )}
    </div>
  );
}
