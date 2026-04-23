'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllDecisions, getAllGoals } from '../../lib/api';
import { getUser } from '../../utils/auth';
import PageWrapper from '../components/PageWrapper';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/'); return; }
    setUser(u);
    getAllDecisions(u.user_id).then(d => setDecisions(d.decisions || []));
    getAllGoals(u.user_id).then(g => setGoals(g.goals || []));
  }, []);

  const activeGoals = goals.filter(g => !g.is_abandoned);
  const recentDecisions = decisions.slice(0, 4);
  const recentActions = goals.filter(g => g.last_action_date).slice(0, 4);

  const stats = [
    {
      label: 'Total Decisions',
      value: decisions.length,
      gradient: 'from-indigo-500 to-purple-600',
      sub: 'tracked so far'
    },
    {
      label: 'Active Goals',
      value: activeGoals.length,
      gradient: 'from-emerald-500 to-teal-600',
      sub: 'in progress'
    },
    {
      label: 'Total Actions',
      value: goals.reduce((sum, g) => sum + Number(g.action_count || 0), 0),
      gradient: 'from-amber-500 to-orange-600',
      sub: 'logged toward goals'
    },
    {
      label: 'Goals with Activity',
      value: goals.filter(g => g.last_action_date).length,
      gradient: 'from-rose-500 to-pink-600',
      sub: 'recently active'
    },
  ];

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, {user?.email}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(stat => (
          <div
            key={stat.label}
            className={`bg-linear-to-br ${stat.gradient} rounded-xl p-5 shadow-lg`}
          >
            <p className="text-white/70 text-xs font-medium uppercase tracking-wide mb-1">
              {stat.label}
            </p>
            <p className="text-4xl font-bold text-white mb-1">{stat.value}</p>
            <p className="text-white/60 text-xs">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Decisions */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">Recent Decisions</h2>
            <a href="/decisions" className="text-xs text-indigo-400 hover:text-indigo-300">
              View all →
            </a>
          </div>
          {recentDecisions.length === 0 ? (
            <p className="text-gray-500 text-sm">No decisions yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentDecisions.map(d => (
                <div key={d.decision_id} className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">{d.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {d.category || 'Uncategorized'} · {d.event_count} events
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Goal Activity */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-white font-semibold">Recent Goal Activity</h2>
            <a href="/goals" className="text-xs text-emerald-400 hover:text-emerald-300">
              View all →
            </a>
          </div>
          {recentActions.length === 0 ? (
            <p className="text-gray-500 text-sm">No goal activity yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {recentActions.map(g => (
                <div key={g.goal_id} className="flex items-start gap-3 p-3 bg-gray-700/50 rounded-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">{g.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Last action: {new Date(g.last_action_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}