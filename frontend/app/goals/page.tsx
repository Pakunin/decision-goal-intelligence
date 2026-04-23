'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllGoals, createGoal, addGoalVersion, addGoalAction, addGoalReview } from '../../lib/api';
import { getUser } from '../../utils/auth';
import PageWrapper from '../components/PageWrapper';

export default function GoalsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [tab, setTab] = useState<'create' | 'edit' | 'action' | 'review'>('create');
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [effortLevel, setEffortLevel] = useState('');
  const [clarityScore, setClarityScore] = useState('');
  const [motivationScore, setMotivationScore] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/'); return; }
    setUser(u);
    loadGoals(u.user_id);
  }, []);

  const loadGoals = async (uid: number) => {
    const data = await getAllGoals(uid);
    setGoals(data.goals || []);
  };

  const notify = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCreate = async () => {
    if (!title) return;
    await createGoal(user.user_id, title, priority);
    setTitle(''); setPriority('');
    notify('Goal created');
    loadGoals(user.user_id);
  };

  const handleVersion = async () => {
    if (!selectedId || !editTitle) return;
    await addGoalVersion(Number(selectedId), editTitle, editPriority);
    notify('Goal updated');
    setEditTitle(''); setEditPriority('');
    loadGoals(user.user_id);
  };

  const handleAction = async () => {
    if (!selectedId) return;
    await addGoalAction(Number(selectedId), new Date().toISOString(), Number(effortLevel));
    notify('Action logged');
    setEffortLevel('');
  };

  const handleReview = async () => {
    if (!selectedId) return;
    await addGoalReview(Number(selectedId), Number(clarityScore), Number(motivationScore));
    notify('Review added');
    setClarityScore(''); setMotivationScore('');
  };

  const inputClass = "w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-emerald-500";
  const tabs = ['create', 'edit', 'action', 'review'] as const;

  const priorityColor = (p: string) => {
    if (p === '10') return 'text-rose-400';
    if (p === '5') return 'text-amber-400';
    return 'text-gray-400';
  };

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Goals</h1>
        <p className="text-gray-400 mt-1">Set, refine and work toward your long-term goals</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left — form panel */}
        <div className="col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <div className="flex gap-1 bg-gray-900 rounded-lg p-1 mb-6">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  tab === t
                    ? 'bg-linear-to-r from-emerald-600 to-teal-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'create' ? 'New' : t === 'edit' ? 'Edit' : t === 'action' ? 'Action' : 'Review'}
              </button>
            ))}
          </div>

          {message && (
            <div className="mb-4 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
              {message}
            </div>
          )}

          {tab === 'create' && (
            <div className="flex flex-col gap-3">
              <input placeholder="Goal title" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
              <select value={priority} onChange={e => setPriority(e.target.value)} className={inputClass}>
                <option value="">Priority (optional)</option>
                <option value="10">10</option>
                <option value="5">5</option>
                <option value="1">1</option>
              </select>
              <button onClick={handleCreate} className="w-full py-2.5 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Create Goal
              </button>
            </div>
          )}

          {tab === 'edit' && (
            <div className="flex flex-col gap-3">
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={inputClass}>
                <option value="">Select a goal</option>
                {goals.map(g => <option key={g.goal_id} value={g.goal_id}>{g.title}</option>)}
              </select>
              <input placeholder="New title" value={editTitle} onChange={e => setEditTitle(e.target.value)} className={inputClass} />
              <select value={editPriority} onChange={e => setEditPriority(e.target.value)} className={inputClass}>
                <option value="">Priority (optional)</option>
                <option value="10">10</option>
                <option value="5">5</option>
                <option value="1">1</option>
              </select>
              <button onClick={handleVersion} className="w-full py-2.5 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Save New Version
              </button>
            </div>
          )}

          {tab === 'action' && (
            <div className="flex flex-col gap-3">
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={inputClass}>
                <option value="">Select a goal</option>
                {goals.map(g => <option key={g.goal_id} value={g.goal_id}>{g.title}</option>)}
              </select>
              <input placeholder="Effort level (1-10)" value={effortLevel} onChange={e => setEffortLevel(e.target.value)} className={inputClass} />
              <button onClick={handleAction} className="w-full py-2.5 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Log Action
              </button>
            </div>
          )}

          {tab === 'review' && (
            <div className="flex flex-col gap-3">
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={inputClass}>
                <option value="">Select a goal</option>
                {goals.map(g => <option key={g.goal_id} value={g.goal_id}>{g.title}</option>)}
              </select>
              <input placeholder="Clarity score (1-10)" value={clarityScore} onChange={e => setClarityScore(e.target.value)} className={inputClass} />
              <input placeholder="Motivation score (1-10)" value={motivationScore} onChange={e => setMotivationScore(e.target.value)} className={inputClass} />
              <button onClick={handleReview} className="w-full py-2.5 rounded-lg bg-linear-to-r from-emerald-600 to-teal-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Submit Review
              </button>
            </div>
          )}
        </div>

        {/* Right — goals list */}
        <div className="col-span-3 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-white font-semibold mb-4">All Goals</h2>
          {goals.length === 0 ? (
            <p className="text-gray-500 text-sm">No goals yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {goals.map(g => (
                <div key={g.goal_id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 hover:border-emerald-500/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                      {g.title[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{g.title}</p>
                      <p className={`text-xs mt-0.5 ${priorityColor(g.priority)}`}>
                        {g.priority || 'no priority'} · {g.is_abandoned ? 'Abandoned' : 'Active'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-400 font-medium">{g.action_count} actions</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {g.last_action_date ? new Date(g.last_action_date).toLocaleDateString() : 'No activity'}
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