'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getDecisionAnalytics, getGoalAnalytics } from '../../lib/api';
import { getUser } from '../../utils/auth';
import Navbar from '../components/Navbar';

export default function AnalyticsPage() {
  const router = useRouter();
  const [decisionData, setDecisionData] = useState<any>(null);
  const [goalData, setGoalData] = useState<any>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/'); return; }
    getDecisionAnalytics(u.user_id).then(setDecisionData);
    getGoalAnalytics(u.user_id).then(setGoalData);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <Navbar />
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics</h1>

        <div className="grid grid-cols-1 gap-6">

          <Section title="Decision Timeline">
            <Table rows={decisionData?.timeline} />
          </Section>

          <Section title="Overthinking Metrics">
            <Table rows={decisionData?.overthinking} />
          </Section>

          <Section title="Goal Drift">
            <Table rows={goalData?.drift} />
          </Section>

          <Section title="Goal Engagement">
            <Table rows={goalData?.engagement} />
          </Section>

        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded shadow p-6">
      <h2 className="font-semibold text-gray-700 mb-4">{title}</h2>
      {children}
    </div>
  );
}

function Table({ rows }: { rows: any[] | undefined }) {
  if (!rows) return <p className="text-sm text-gray-400">Loading...</p>;
  if (rows.length === 0) return <p className="text-sm text-gray-400">No data yet</p>;

  const columns = Object.keys(rows[0]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            {columns.map(col => (
              <th key={col} className="text-left py-2 pr-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {col.replace(/_/g, ' ')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
              {columns.map(col => (
                <td key={col} className="py-2 pr-4 text-gray-700">
                  {formatValue(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatValue(val: any): string {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'string' && val.includes('T') && val.includes('Z')) {
    return new Date(val).toLocaleDateString();
  }
  return String(val);
}