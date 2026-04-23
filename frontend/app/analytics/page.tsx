'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDecisionAnalytics, getGoalAnalytics } from '../../lib/api';
import { getUser } from '../../utils/auth';
import { generateInsights, getBehaviorLabel, type Insight } from '../../lib/insights';
import PageWrapper from '../components/PageWrapper';

export default function AnalyticsPage() {
  const router = useRouter();
  const [decisionData, setDecisionData] = useState<any>(null);
  const [goalData, setGoalData] = useState<any>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/'); return; }
    getDecisionAnalytics(u.user_id).then(setDecisionData);
    getGoalAnalytics(u.user_id).then(setGoalData);
  }, []);

  const loading = !decisionData || !goalData;
  const insights = loading ? [] : generateInsights(decisionData, goalData);
  const label = loading ? null : getBehaviorLabel(decisionData, goalData);

  const topInsights = insights.slice(0, 3);
  const restInsights = insights.slice(3);

  const severityStyle = (s: Insight['severity']) => {
    if (s === 'positive') return 'border-emerald-500/40 bg-emerald-500/5';
    if (s === 'warning') return 'border-amber-500/40 bg-amber-500/5';
    return 'border-gray-600/40 bg-gray-700/20';
  };

  const severityBadge = (s: Insight['severity']) => {
    if (s === 'positive') return 'bg-emerald-500/20 text-emerald-400';
    if (s === 'warning') return 'bg-amber-500/20 text-amber-400';
    return 'bg-gray-600/20 text-gray-400';
  };

  const tooltip = {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#f9fafb',
    fontSize: '12px',
  };

  // chart data
  const overthinkingData = (decisionData?.overthinking || []).map((r: any) => ({
    label: `D-${r.decision_id}`,
    revisits: Number(r.revisit_count),
    postpones: Number(r.postpone_count),
  }));

  const engagementData = (goalData?.engagement || []).map((r: any) => ({
    label: `G-${r.goal_id}`,
    actions: Number(r.action_count),
  }));

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Your Insights</h1>
        <p className="text-gray-400 mt-1">What your data says about how you think and work</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Analyzing your data...</p>
        </div>
      ) : (
        <>
          {/* Behavior label card */}
          {label && (
            <div className={`bg-linear-to-r ${label.color} rounded-2xl p-6 mb-8 shadow-xl`}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">{label.icon}</span>
                <div>
                  <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-1">
                    Your behavior profile
                  </p>
                  <p className="text-white text-2xl font-bold">{label.label}</p>
                  <p className="text-white/80 text-sm mt-1">{label.description}</p>
                </div>
              </div>
            </div>
          )}

          {insights.length === 0 ? (
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-12 text-center">
              <p className="text-4xl mb-4">🌱</p>
              <p className="text-white font-semibold text-lg mb-2">Not enough data yet</p>
              <p className="text-gray-400 text-sm">
                Create some decisions and goals, log events and actions, then come back here.
              </p>
            </div>
          ) : (
            <>
              {/* Top 3 insights */}
              <div className="mb-3">
                <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-4">
                  Key insights
                </p>
                <div className="flex flex-col gap-4">
                  {topInsights.map(insight => (
                    <InsightCard
                      key={insight.id}
                      insight={insight}
                      expanded={expanded === insight.id}
                      onToggle={() => setExpanded(expanded === insight.id ? null : insight.id)}
                      severityStyle={severityStyle}
                      severityBadge={severityBadge}
                    />
                  ))}
                </div>
              </div>

              {/* Supporting insights */}
              {restInsights.length > 0 && (
                <div className="mt-8">
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-medium mb-4">
                    Supporting observations
                  </p>
                  <div className="flex flex-col gap-3">
                    {restInsights.map(insight => (
                      <InsightCard
                        key={insight.id}
                        insight={insight}
                        expanded={expanded === insight.id}
                        onToggle={() => setExpanded(expanded === insight.id ? null : insight.id)}
                        severityStyle={severityStyle}
                        severityBadge={severityBadge}
                        compact
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Charts toggle */}
              <div className="mt-10">
                <button
                  onClick={() => setShowCharts(v => !v)}
                  className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  <span>{showCharts ? '▲' : '▼'}</span>
                  {showCharts ? 'Hide' : 'Show'} supporting charts
                </button>

                {showCharts && (
                  <div className="mt-6 flex flex-col gap-6">
                    <MiniChart title="Revisits & Postpones per Decision" subtitle="Supporting: Overthinking insight">
                      {overthinkingData.length === 0 ? <ChartEmpty /> : (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={overthinkingData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={tooltip} />
                            <Bar dataKey="revisits" fill="#a78bfa" name="Revisits" radius={[4,4,0,0]} />
                            <Bar dataKey="postpones" fill="#7c3aed" name="Postpones" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </MiniChart>

                    <MiniChart title="Actions per Goal" subtitle="Supporting: Goal consistency insight">
                      {engagementData.length === 0 ? <ChartEmpty /> : (
                        <ResponsiveContainer width="100%" height={200}>
                          <BarChart data={engagementData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
                            <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                            <Tooltip contentStyle={tooltip} />
                            <Bar dataKey="actions" fill="#34d399" name="Actions" radius={[4,4,0,0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </MiniChart>
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
    </PageWrapper>
  );
}

function InsightCard({ insight, expanded, onToggle, severityStyle, severityBadge, compact = false }: {
  insight: Insight;
  expanded: boolean;
  onToggle: () => void;
  severityStyle: (s: Insight['severity']) => string;
  severityBadge: (s: Insight['severity']) => string;
  compact?: boolean;
}) {
  return (
    <div className={`rounded-xl border p-5 transition-all ${severityStyle(insight.severity)}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <span className={compact ? 'text-xl' : 'text-2xl'}>{insight.icon}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <p className={`text-white font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
                {insight.title}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${severityBadge(insight.severity)}`}>
                {insight.severity === 'positive' ? 'Good' : insight.severity === 'warning' ? 'Watch this' : 'Note'}
              </span>
            </div>
            <p className="text-gray-300 text-sm">{insight.observation}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className="text-xs text-gray-500 hover:text-gray-300 whitespace-nowrap transition-colors pt-1"
        >
          {expanded ? 'Less ↑' : 'What does this mean? ↓'}
        </button>
      </div>

      {expanded && (
        <div className="mt-4 ml-9 flex flex-col gap-3">
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">What this indicates</p>
            <p className="text-gray-300 text-sm">{insight.meaning}</p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4">
            <p className="text-xs text-indigo-400 uppercase tracking-wide font-medium mb-1">What to do</p>
            <p className="text-gray-300 text-sm">{insight.action}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function MiniChart({ title, subtitle, children }: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-5">
      <p className="text-white text-sm font-semibold">{title}</p>
      <p className="text-gray-500 text-xs mt-0.5 mb-4">{subtitle}</p>
      {children}
    </div>
  );
}

function ChartEmpty() {
  return <p className="text-gray-600 text-sm py-6 text-center">No data</p>;
}