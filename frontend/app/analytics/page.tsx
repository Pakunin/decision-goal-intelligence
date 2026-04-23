// 'use client';

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import {
//   LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
// } from 'recharts';
// import { getDecisionAnalytics, getGoalAnalytics } from '../../lib/api';
// import { getUser } from '../../utils/auth';
// import PageWrapper from '../components/PageWrapper';

// export default function AnalyticsPage() {
//   const router = useRouter();
//   const [decisionData, setDecisionData] = useState<any>(null);
//   const [goalData, setGoalData] = useState<any>(null);

//   useEffect(() => {
//     const u = getUser();
//     if (!u) { router.push('/'); return; }
//     getDecisionAnalytics(u.user_id).then(setDecisionData);
//     getGoalAnalytics(u.user_id).then(setGoalData);
//   }, []);

//   // Shape timeline data for line chart
//   const timelineData = decisionData?.timeline?.map((row: any) => ({
//     ...row,
//     date: row.created_at ? new Date(row.created_at).toLocaleDateString() : 'Unknown',
//   })) || [];

//   // Shape overthinking data for bar chart
//   const overthinkingData = decisionData?.overthinking?.map((row: any) => ({
//     ...row,
//     label: `D-${row.decision_id}`,
//   })) || [];

//   // Shape goal engagement for line chart
//   const engagementData = goalData?.engagement?.map((row: any) => ({
//     ...row,
//     label: `G-${row.goal_id}`,
//   })) || [];

//   // Shape goal drift for timeline display
//   const driftData = goalData?.drift?.map((row: any) => ({
//     ...row,
//     label: `G-${row.goal_id}`,
//   })) || [];

//   // Regret vs satisfaction scatter
//   const scatterData = decisionData?.timeline?.map((row: any) => ({
//     regret: row.regret_score,
//     satisfaction: row.satisfaction_score,
//     name: row.title || `D-${row.decision_id}`,
//   })).filter((r: any) => r.regret && r.satisfaction) || [];

//   const tooltipStyle = {
//     backgroundColor: '#1f2937',
//     border: '1px solid #374151',
//     borderRadius: '8px',
//     color: '#f9fafb',
//   };

//   return (
//     <PageWrapper>
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-white">Analytics</h1>
//         <p className="text-gray-400 mt-1">Behavioral patterns across your decisions and goals</p>
//       </div>

//       <div className="flex flex-col gap-6">

//         {/* Decision delay over time */}
//         <ChartCard title="Decision Timeline" subtitle="Events logged per decision over time" color="indigo">
//           {timelineData.length === 0 ? <Empty /> : (
//             <ResponsiveContainer width="100%" height={250}>
//               <LineChart data={timelineData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                 <XAxis dataKey="date" stroke="#6b7280" tick={{ fontSize: 11 }} />
//                 <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Legend />
//                 <Line type="monotone" dataKey="event_count" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8' }} name="Events" />
//               </LineChart>
//             </ResponsiveContainer>
//           )}
//         </ChartCard>

//         {/* Revisit counts per decision */}
//         <ChartCard title="Overthinking Metrics" subtitle="Revisit and postpone counts per decision" color="purple">
//           {overthinkingData.length === 0 ? <Empty /> : (
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={overthinkingData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                 <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
//                 <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Legend />
//                 <Bar dataKey="revisit_count" fill="#a78bfa" name="Revisits" radius={[4, 4, 0, 0]} />
//                 <Bar dataKey="postpone_count" fill="#7c3aed" name="Postpones" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </ChartCard>

//         {/* Confidence levels */}
//         <ChartCard title="Confidence Levels" subtitle="Average confidence at decision time" color="amber">
//           {overthinkingData.length === 0 ? <Empty /> : (
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={overthinkingData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                 <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
//                 <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} domain={[0, 100]} />
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Bar dataKey="avg_confidence" fill="#fbbf24" name="Avg Confidence" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </ChartCard>

//         {/* Regret vs Satisfaction scatter */}
//         <ChartCard title="Regret vs Satisfaction" subtitle="How decisions felt in retrospect" color="rose">
//           {scatterData.length === 0 ? <Empty /> : (
//             <ResponsiveContainer width="100%" height={250}>
//               <ScatterChart>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                 <XAxis dataKey="regret" name="Regret" stroke="#6b7280" tick={{ fontSize: 11 }} label={{ value: 'Regret', position: 'insideBottom', offset: -5, fill: '#6b7280' }} />
//                 <YAxis dataKey="satisfaction" name="Satisfaction" stroke="#6b7280" tick={{ fontSize: 11 }} label={{ value: 'Satisfaction', angle: -90, position: 'insideLeft', fill: '#6b7280' }} />
//                 <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: '3 3' }} />
//                 <Scatter data={scatterData} fill="#fb7185" />
//               </ScatterChart>
//             </ResponsiveContainer>
//           )}
//         </ChartCard>

//         {/* Goal engagement over time */}
//         <ChartCard title="Goal Engagement" subtitle="Action count and effort per goal" color="emerald">
//           {engagementData.length === 0 ? <Empty /> : (
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={engagementData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                 <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
//                 <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Legend />
//                 <Bar dataKey="total_actions" fill="#34d399" name="Total Actions" radius={[4, 4, 0, 0]} />
//                 <Bar dataKey="avg_effort" fill="#059669" name="Avg Effort" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </ChartCard>

//         {/* Goal drift timeline */}
//         <ChartCard title="Goal Drift" subtitle="How many times goals were revised" color="teal">
//           {driftData.length === 0 ? <Empty /> : (
//             <ResponsiveContainer width="100%" height={250}>
//               <BarChart data={driftData}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
//                 <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
//                 <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
//                 <Tooltip contentStyle={tooltipStyle} />
//                 <Bar dataKey="version_count" fill="#2dd4bf" name="Versions" radius={[4, 4, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           )}
//         </ChartCard>

//       </div>
//     </PageWrapper>
//   );
// }

// function ChartCard({ title, subtitle, color, children }: {
//   title: string;
//   subtitle: string;
//   color: string;
//   children: React.ReactNode;
// }) {
//   const accent: Record<string, string> = {
//     indigo: 'from-indigo-500 to-indigo-600',
//     purple: 'from-purple-500 to-purple-600',
//     amber: 'from-amber-500 to-amber-600',
//     rose: 'from-rose-500 to-rose-600',
//     emerald: 'from-emerald-500 to-emerald-600',
//     teal: 'from-teal-500 to-teal-600',
//   };

//   return (
//     <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
//       <div className="flex items-center gap-3 mb-5">
//         <div className={`w-1 h-8 rounded-full bg-linear-to-b ${accent[color]}`} />
//         <div>
//           <h2 className="text-white font-semibold">{title}</h2>
//           <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>
//         </div>
//       </div>
//       {children}
//     </div>
//   );
// }

// function Empty() {
//   return <p className="text-gray-500 text-sm py-8 text-center">No data yet — add some decisions and goals first</p>;
// }

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend, PieChart, Pie, Cell
} from 'recharts';
import { getDecisionAnalytics, getGoalAnalytics } from '../../lib/api';
import { getUser } from '../../utils/auth';
import PageWrapper from '../components/PageWrapper';

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

  const tooltip = {
    backgroundColor: '#1f2937',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#f9fafb',
    fontSize: '12px',
  };

  // --- Shape data for each chart ---

  // 1. Decision delay line chart
  const timelineData = (decisionData?.timeline || []).map((r: any) => ({
    label: `D-${r.decision_id}`,
    delay_days: r.decision_delay,
    decided_at: r.decided_at ? new Date(r.decided_at).toLocaleDateString() : null,
  }));

  // 2. Overthinking bar chart
  const overthinkingData = (decisionData?.overthinking || []).map((r: any) => ({
    label: `D-${r.decision_id}`,
    revisits: r.revisit_count,
    postpones: r.postpone_count,
    total: r.total_events,
  }));

  // 3. Delay vs regret scatter
  const scatterData = (decisionData?.delayVsRegret || []).map((r: any) => ({
    delay: Number(r.decision_delay),
    regret: Number(r.regret_score),
    satisfaction: Number(r.satisfaction_score),
    name: `D-${r.decision_id}`,
  }));

  // 4. Active vs decided pie chart
  const pieRaw = decisionData?.activeVsDecided || [];
  const activeCount = pieRaw.filter((r: any) => r.status !== 'decided').length;
  const decidedCount = pieRaw.filter((r: any) => r.status === 'decided').length;
  const pieData = [
    { name: 'Active', value: activeCount },
    { name: 'Decided', value: decidedCount },
  ];

  // 5. Goal engagement bar chart
  const engagementData = (goalData?.engagement || []).map((r: any) => ({
    label: `G-${r.goal_id}`,
    actions: Number(r.action_count),
    last_active: r.last_action_date ? new Date(r.last_action_date).toLocaleDateString() : 'Never',
  }));

  // 6. Goal drift bar chart
  const driftData = (goalData?.drift || []).map((r: any) => ({
    label: `G-${r.goal_id}`,
    versions: Number(r.version_count),
    priority_changed: r.priority_change ? 1 : 0,
    initial: r.initial_priority,
    current: r.current_priority,
  }));

  // Summary stats from user_behavior_summary
  const summary = decisionData?.behaviorSummary;

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 mt-1">Behavioral patterns across your decisions and goals</p>
      </div>

      {/* Summary stat cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Total Decisions"
            value={summary.decision_count}
            gradient="from-indigo-500 to-purple-600"
          />
          <StatCard
            label="Avg Decision Delay"
            value={`${Number(summary.avg_decision_delay).toFixed(1)} days`}
            gradient="from-amber-500 to-orange-600"
          />
          <StatCard
            label="Drifting Goals"
            value={summary.drifting_goals}
            gradient="from-rose-500 to-pink-600"
          />
        </div>
      )}

      <div className="flex flex-col gap-6">

        {/* Decision delay over time */}
        <ChartCard
          title="Decision Delay"
          subtitle="How many days each decision took before being decided"
          color="indigo"
        >
          {timelineData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} unit=" days" />
                <Tooltip contentStyle={tooltip} />
                <Bar dataKey="delay_days" fill="#818cf8" name="Delay (days)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Overthinking — revisits and postpones */}
        <ChartCard
          title="Overthinking Metrics"
          subtitle="Revisit and postpone counts per decision"
          color="purple"
        >
          {overthinkingData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={overthinkingData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={tooltip} />
                <Legend />
                <Bar dataKey="revisits" fill="#a78bfa" name="Revisits" radius={[4, 4, 0, 0]} />
                <Bar dataKey="postpones" fill="#7c3aed" name="Postpones" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Delay vs Regret scatter */}
        <ChartCard
          title="Delay vs Regret"
          subtitle="Does taking longer lead to more or less regret?"
          color="rose"
        >
          {scatterData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={280}>
              <ScatterChart margin={{ top: 10, right: 30, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="delay"
                  name="Delay"
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Decision Delay (days)', position: 'insideBottom', offset: -15, fill: '#6b7280', fontSize: 11 }}
                />
                <YAxis
                  dataKey="regret"
                  name="Regret"
                  stroke="#6b7280"
                  tick={{ fontSize: 11 }}
                  label={{ value: 'Regret Score', angle: -90, position: 'insideLeft', fill: '#6b7280', fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={tooltip}
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={tooltip} className="px-3 py-2">
                        <p className="text-white text-xs font-medium">{d.name}</p>
                        <p className="text-gray-300 text-xs">Delay: {d.delay} days</p>
                        <p className="text-gray-300 text-xs">Regret: {d.regret}</p>
                        <p className="text-gray-300 text-xs">Satisfaction: {d.satisfaction}</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData} fill="#fb7185" />
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Active vs Decided pie */}
        <ChartCard
          title="Active vs Decided"
          subtitle="Breakdown of open vs resolved decisions"
          color="amber"
        >
          {pieRaw.length === 0 ? <Empty /> : (
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#818cf8" />
                    <Cell fill="#34d399" />
                  </Pie>
                  <Tooltip contentStyle={tooltip} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-indigo-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{activeCount} Active</p>
                    <p className="text-gray-400 text-xs">Still in progress</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div>
                    <p className="text-white text-sm font-medium">{decidedCount} Decided</p>
                    <p className="text-gray-400 text-xs">Resolved decisions</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ChartCard>

        {/* Goal engagement */}
        <ChartCard
          title="Goal Engagement"
          subtitle="Total actions logged per goal"
          color="emerald"
        >
          {engagementData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={tooltip}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={tooltip} className="px-3 py-2">
                        <p className="text-white text-xs font-medium">{d.label}</p>
                        <p className="text-gray-300 text-xs">Actions: {d.actions}</p>
                        <p className="text-gray-300 text-xs">Last active: {d.last_active}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="actions" fill="#34d399" name="Actions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Goal drift */}
        <ChartCard
          title="Goal Drift"
          subtitle="How many times each goal has been revised"
          color="teal"
        >
          {driftData.length === 0 ? <Empty /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={driftData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={tooltip}
                  content={({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div style={tooltip} className="px-3 py-2">
                        <p className="text-white text-xs font-medium">{d.label}</p>
                        <p className="text-gray-300 text-xs">Versions: {d.versions}</p>
                        <p className="text-gray-300 text-xs">Priority: {d.initial} → {d.current}</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="versions" fill="#2dd4bf" name="Versions" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>
    </PageWrapper>
  );
}

function StatCard({ label, value, gradient }: { label: string; value: any; gradient: string }) {
  return (
    <div className={`bg-linear-to-br ${gradient} rounded-xl p-5 shadow-lg`}>
      <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function ChartCard({ title, subtitle, color, children }: {
  title: string;
  subtitle: string;
  color: string;
  children: React.ReactNode;
}) {
  const accents: Record<string, string> = {
    indigo: 'from-indigo-500 to-indigo-600',
    purple: 'from-purple-500 to-purple-600',
    amber: 'from-amber-500 to-amber-600',
    rose: 'from-rose-500 to-rose-600',
    emerald: 'from-emerald-500 to-emerald-600',
    teal: 'from-teal-500 to-teal-600',
  };

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-1 h-8 rounded-full bg-linear-to-b ${accents[color]}`} />
        <div>
          <h2 className="text-white font-semibold">{title}</h2>
          <p className="text-gray-400 text-xs mt-0.5">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function Empty() {
  return (
    <p className="text-gray-500 text-sm py-10 text-center">
      No data yet — add decisions and goals first
    </p>
  );
}