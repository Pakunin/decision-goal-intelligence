'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllDecisions, createDecision, addDecisionEvent, addDecisionReview } from '../../lib/api';
import { getUser } from '../../utils/auth';
import Navbar from '../components/Navbar';

export default function DecisionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
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

  const handleCreate = async () => {
    if (!title) return;
    await createDecision(user.user_id, title, category);
    setTitle(''); setCategory('');
    setMessage('Decision created');
    loadDecisions(user.user_id);
  };

  const handleEvent = async () => {
    if (!selectedId) return;
    await addDecisionEvent(Number(selectedId), eventType, Number(confidence), outcome);
    setMessage('Event logged');
    setConfidence(''); setOutcome('');
  };

  const handleReview = async () => {
    if (!selectedId) return;
    await addDecisionReview(Number(selectedId), Number(regret), Number(satisfaction), wouldRepeat === 'true');
    setMessage('Review added');
    setRegret(''); setSatisfaction('');
  };

  return (
    <main className="min-h-screen bg-gray-50 p-8">
        <Navbar/>
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Decisions</h1>
          <a href="/dashboard" className="text-sm text-blue-600 hover:underline">← Dashboard</a>
        </div>

        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}

        {/* Create Decision */}
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Create Decision</h2>
          <input
            placeholder="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2 text-sm"
          />
          <input
            placeholder="Category (optional)"
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-3 text-sm"
          />
          <button
            onClick={handleCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Create
          </button>
        </div>

        {/* Add Event */}
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Log Event</h2>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2 text-sm"
          >
            <option value="">Select a decision</option>
            {decisions.map(d => (
              <option key={d.decision_id} value={d.decision_id}>{d.title}</option>
            ))}
          </select>
          <select
            value={eventType}
            onChange={e => setEventType(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2 text-sm"
          >
            <option value="revisit">Revisit</option>
            <option value="postpone">Postpone</option>
            <option value="decide">Decide</option>
          </select>
          <input
            placeholder="Confidence (0-100)"
            value={confidence}
            onChange={e => setConfidence(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2 text-sm"
          />
          <input
            placeholder="Outcome (optional)"
            value={outcome}
            onChange={e => setOutcome(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-3 text-sm"
          />
          <button
            onClick={handleEvent}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Log Event
          </button>
        </div>

        {/* Add Review */}
        <div className="bg-white rounded shadow p-6 mb-6">
          <h2 className="font-semibold text-gray-700 mb-3">Add Review</h2>
          <select
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2 text-sm"
          >
            <option value="">Select a decision</option>
            {decisions.map(d => (
              <option key={d.decision_id} value={d.decision_id}>{d.title}</option>
            ))}
          </select>
          <input
            placeholder="Regret score (1-10)"
            value={regret}
            onChange={e => setRegret(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2 text-sm"
          />
          <input
            placeholder="Satisfaction score (1-10)"
            value={satisfaction}
            onChange={e => setSatisfaction(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-2 text-sm"
          />
          <select
            value={wouldRepeat}
            onChange={e => setWouldRepeat(e.target.value)}
            className="w-full border px-3 py-2 rounded mb-3 text-sm"
          >
            <option value="true">Would repeat</option>
            <option value="false">Would not repeat</option>
          </select>
          <button
            onClick={handleReview}
            className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
          >
            Submit Review
          </button>
        </div>

        {/* Decision List */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="font-semibold text-gray-700 mb-3">All Decisions</h2>
          {decisions.length === 0 ? (
            <p className="text-sm text-gray-400">No decisions yet</p>
          ) : (
            decisions.map(d => (
              <div key={d.decision_id} className="border-b py-3 last:border-0">
                <p className="text-sm font-medium text-gray-700">{d.title}</p>
                <p className="text-xs text-gray-400">
                  {d.category} · {d.event_count} events · Created {new Date(d.created_at).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}