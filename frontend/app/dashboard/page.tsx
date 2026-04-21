"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllDecisions, getAllGoals } from "../../lib/api";
import { getUser, clearUser } from "../../utils/auth";
import Navbar from "../components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [goals, setGoals] = useState<any[]>([]);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/");
      return;
    }
    setUser(u);

    getAllDecisions(u.user_id).then((d) => setDecisions(d.decisions || []));
    getAllGoals(u.user_id).then((g) => setGoals(g.goals || []));
  }, []);

  const handleLogout = () => {
    clearUser();
    router.push("/");
  };

  const activeGoals = goals.filter((g) => !g.is_abandoned);
  const recentDecisions = decisions.slice(0, 3);
  const recentGoalActions = goals.filter((g) => g.last_action_date).slice(0, 3);

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-4 mt-10 mb-8">
          {[
            { label: "Decisions", href: "/decisions" },
            { label: "Goals", href: "/goals" },
            { label: "Analytics", href: "/analytics" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="bg-white border px-4 py-2 rounded text-sm hover:bg-blue-50 text-blue-600"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded shadow p-6">
            <p className="text-sm text-gray-500">Total Decisions</p>
            <p className="text-3xl font-bold text-gray-800">
              {decisions.length}
            </p>
          </div>
          <div className="bg-white rounded shadow p-6">
            <p className="text-sm text-gray-500">Active Goals</p>
            <p className="text-3xl font-bold text-gray-800">
              {activeGoals.length}
            </p>
          </div>
        </div>

        {/* Recent Decisions */}
        <div className="bg-white rounded shadow p-6 mb-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent Decisions
          </h2>
          {recentDecisions.length === 0 ? (
            <p className="text-sm text-gray-400">No decisions yet</p>
          ) : (
            recentDecisions.map((d) => (
              <div key={d.decision_id} className="border-b py-2 last:border-0">
                <p className="text-sm font-medium text-gray-700">{d.title}</p>
                <p className="text-xs text-gray-400">
                  {d.category} · {d.event_count} events
                </p>
              </div>
            ))
          )}
        </div>

        {/* Recent Goal Activity */}
        <div className="bg-white rounded shadow p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Recent Goal Activity
          </h2>
          {recentGoalActions.length === 0 ? (
            <p className="text-sm text-gray-400">No goal activity yet</p>
          ) : (
            recentGoalActions.map((g) => (
              <div key={g.goal_id} className="border-b py-2 last:border-0">
                <p className="text-sm font-medium text-gray-700">{g.title}</p>
                <p className="text-xs text-gray-400">
                  Last action:{" "}
                  {new Date(g.last_action_date).toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
