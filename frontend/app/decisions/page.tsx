'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllDecisions, createDecision, addDecisionEvent, addDecisionReview } from '../../lib/api';
import { getUser } from '../../utils/auth';
import PageWrapper from '../components/PageWrapper';

export default function DecisionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [tab, setTab] = useState<'create' | 'event' | 'review'>('create');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [eventType, setEventType] = useState('revisit');
  const [confidence, setConfidence] = useState('');
  const [outcome, setOutcome] = useState('');
  const [regret, setRegret] = useState('');
  const [satisfaction, setSatisfaction] = useState('');
  const [wouldRepeat, setWouldRepeat] = useState('true');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const u = getUser();
    if (!u) { router.push('/'); return; }
    setUser(u);
    loadDecisions(u.user_id);
  }, []);

  const loadDecisions = async (uid: number) => {
    const data = await getAllDecisions(uid);
    setDecisions(data.decisions || []);
  };

  const notify = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleCreate = async () => {
    if (!title) return;
    await createDecision(user.user_id, title, category);
    setTitle(''); setCategory('');
    notify('Decision created');
    loadDecisions(user.user_id);
  };

  const handleEvent = async () => {
    if (!selectedId) return;
    await addDecisionEvent(Number(selectedId), eventType, Number(confidence), outcome);
    notify('Event logged');
    loadDecisions(user.user_id);
    setConfidence(''); setOutcome('');
  };

  const handleReview = async () => {
    if (!selectedId) return;
    await addDecisionReview(Number(selectedId), Number(regret), Number(satisfaction), wouldRepeat === 'true');
    notify('Review submitted');
    setRegret(''); setSatisfaction('');
  };

  const inputClass = "w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:border-indigo-500";
  const tabs = ['create', 'event', 'review'] as const;

  return (
    <PageWrapper>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Decisions</h1>
        <p className="text-gray-400 mt-1">Track, revisit and reflect on your decisions</p>
      </div>

      <div className="grid grid-cols-5 gap-6">
        {/* Left — form panel */}
        <div className="col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">

          {/* Tabs */}
          <div className="flex gap-1 bg-gray-900 rounded-lg p-1 mb-6">
            {tabs.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                  tab === t
                    ? 'bg-linear-to-r from-indigo-600 to-purple-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'create' ? 'New' : t === 'event' ? 'Log Event' : 'Review'}
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
              <input placeholder="Decision title" value={title} onChange={e => setTitle(e.target.value)} className={inputClass} />
              <input placeholder="Category (optional)" value={category} onChange={e => setCategory(e.target.value)} className={inputClass} />
              <button onClick={handleCreate} className="w-full py-2.5 rounded-lg bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Create Decision
              </button>
            </div>
          )}

          {tab === 'event' && (
            <div className="flex flex-col gap-3">
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={inputClass}>
                <option value="">Select a decision</option>
                {decisions.map(d => <option key={d.decision_id} value={d.decision_id}>{d.title}</option>)}
              </select>
              <select value={eventType} onChange={e => setEventType(e.target.value)} className={inputClass}>
                <option value="REVISITED">Revisit</option>
                <option value="POSTPONED">Postpone</option>
                <option value="DECIDED">Decide</option>
              </select>
              <input placeholder="Confidence (0-10)" value={confidence} onChange={e => setConfidence(e.target.value)} className={inputClass} />
              <input placeholder="Outcome (optional)" value={outcome} onChange={e => setOutcome(e.target.value)} className={inputClass} />
              <button onClick={handleEvent} className="w-full py-2.5 rounded-lg bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Log Event
              </button>
            </div>
          )}

          {tab === 'review' && (
            <div className="flex flex-col gap-3">
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)} className={inputClass}>
                <option value="">Select a decision</option>
                {decisions.map(d => <option key={d.decision_id} value={d.decision_id}>{d.title}</option>)}
              </select>
              <input placeholder="Regret score (1-10)" value={regret} onChange={e => setRegret(e.target.value)} className={inputClass} />
              <input placeholder="Satisfaction score (1-10)" value={satisfaction} onChange={e => setSatisfaction(e.target.value)} className={inputClass} />
              <select value={wouldRepeat} onChange={e => setWouldRepeat(e.target.value)} className={inputClass}>
                <option value="true">Would repeat</option>
                <option value="false">Would not repeat</option>
              </select>
              <button onClick={handleReview} className="w-full py-2.5 rounded-lg bg-linear-to-r from-indigo-600 to-purple-600 text-white text-sm font-medium hover:opacity-90 transition-opacity">
                Submit Review
              </button>
            </div>
          )}
        </div>

        {/* Right — decisions list */}
        <div className="col-span-3 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h2 className="text-white font-semibold mb-4">All Decisions</h2>
          {decisions.length === 0 ? (
            <p className="text-gray-500 text-sm">No decisions yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {decisions.map(d => (
                <div key={d.decision_id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-xl border border-gray-600/50 hover:border-indigo-500/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                      {d.title[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{d.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{d.category || 'Uncategorized'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-400 font-medium">{d.event_count} events</p>
                    <p className="text-xs text-gray-500 mt-0.5">{new Date(d.created_at).toLocaleDateString()}</p>
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