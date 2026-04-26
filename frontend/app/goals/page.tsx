"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllGoals,
  createGoal,
  addGoalVersion,
  addGoalAction,
  addGoalReview,
} from "../../lib/api";
import { getUser } from "../../utils/auth";
import PageWrapper from "../components/PageWrapper";
import Image from "next/image";
import decision from "../../public/dgmenusvg.svg";
import dbutton from "../../public/dgbutton.svg";
import dgcard from "../../public/dgcard.svg";

export default function GoalsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [tab, setTab] = useState<"create" | "edit" | "action" | "review">(
    "create",
  );
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [effortLevel, setEffortLevel] = useState("");
  const [clarityScore, setClarityScore] = useState("");
  const [motivationScore, setMotivationScore] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/");
      return;
    }
    setUser(u);
    loadGoals(u.user_id);
  }, []);

  const loadGoals = async (uid: number) => {
    const data = await getAllGoals(uid);
    setGoals(data.goals || []);
  };

  const notify = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCreate = async () => {
    if (!title) return;
    await createGoal(user.user_id, title, priority);
    setTitle("");
    setPriority("");
    notify("Goal created");
    loadGoals(user.user_id);
  };

  const handleVersion = async () => {
    if (!selectedId || !editTitle) return;
    await addGoalVersion(Number(selectedId), editTitle, editPriority);
    notify("Goal updated");
    setEditTitle("");
    setEditPriority("");
    loadGoals(user.user_id);
  };

  const handleAction = async () => {
    if (!selectedId) return;
    await addGoalAction(
      Number(selectedId),
      new Date().toISOString(),
      Number(effortLevel),
    );
    notify("Action logged");
    setEffortLevel("");
  };

  const handleReview = async () => {
    if (!selectedId) return;
    await addGoalReview(
      Number(selectedId),
      Number(clarityScore),
      Number(motivationScore),
    );
    notify("Review added");
    setClarityScore("");
    setMotivationScore("");
  };

  const inputClass =
    "w-[739px] border-4 border-black font-medium font-hand tracking-widest text-black placeholder-black px-5 py-2 rounded-[30px] text-[22px] leading-none focus:outline-none focus:border-indigo-500";
  const tabs = ["create", "edit", "action", "review"] as const;

  const tabGradients = {
    create: "from-[#B7FAF7] to-[#94C984]", // Pinkish
    edit: "from-[#FFACAD] to-[#D0C0F8]",
    action: "from-[#AEAFFF] to-[#D4F6FF]", // Bluish
    review: "from-[#F8FAB7] to-[#D78D44]", // Greenish
  };
  const priorityColor = (p: string) => {
    if (p === "10") return "text-rose-400";
    if (p === "5") return "text-amber-400";
    return "text-gray-400";
  };

  return (
    <PageWrapper>
      <div className="mb-8 mt-5 ml-5">
        <h1 className="text-[52px] tracking-wide leading-none font-hand text-black">
          Goals
        </h1>
        <p className="text-[26px] tracking-wider leading-none font-hand text-[#6e6e6e] mt-1">
          Set, refine and work toward your long-term goals
        </p>
      </div>

      <div className="grid grid-cols-5 max-w-[1500px] mx-auto items-start gap-6">
        {/* Left — form panel */}
        <div className="col-span-3 relative h-auto min-h-[550px] flex flex-col group justify-start border-gray-700 pt-1">
          <div className="absolute inset-0 z-0">
            <Image
              src={decision}
              alt="background"
              fill
              className="object-fill"
              priority
            />
          </div>

          <div className="relative z-10 flex flex-col pt-24 px-16 pb-5">
            <div className="flex gap-1 w-[85%] mx-auto  rounded-xl p-1.5 mb-8 ">
              {tabs.map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-1 h-[45px] py-1.5 border-4 border-black rounded-[7px] leading-none font-hand font-medium text-[30px] tracking-wider cursor-pointer ${
                    tab === t
                      ? `bg-linear-to-b ${tabGradients[t as keyof typeof tabGradients]} text-black`
                      : "text-black"
                  }`}
                >
                  {t === "create"
                    ? "New"
                    : t === "edit"
                      ? "Edit"
                      : t === "action"
                        ? "Action"
                        : "Review"}
                </button>
              ))}
            </div>

            {message && (
              <div className="mb-4 px-3 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">
                {message}
              </div>
            )}

            {tab === "create" && (
              <div className="flex flex-col gap-3 items-center">
                <input
                  placeholder="Goal title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Priority (optional)</option>
                  <option value="10">10</option>
                  <option value="5">5</option>
                  <option value="1">1</option>
                </select>
                <button
                  onClick={handleCreate}
                  className="flex items-center justify-center relative w-[150px] h-[70px] mb-10 cursor-pointer transition-all duration-300 hover:scale-110"
                >
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={dbutton}
                      alt="login"
                      fill
                      className="object-fill "
                      priority
                    />
                  </div>
                  <span className="relative text-black font-hand text-[30px] z-10 leading-none ransition-all duration-300">
                    Create Goal
                  </span>
                </button>
              </div>
            )}

            {tab === "edit" && (
              <div className="flex flex-col gap-3 items-center">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a goal</option>
                  {goals.map((g) => (
                    <option key={g.goal_id} value={g.goal_id}>
                      {g.title}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="New title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={inputClass}
                />
                <select
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Priority (optional)</option>
                  <option value="10">10</option>
                  <option value="5">5</option>
                  <option value="1">1</option>
                </select>
                <button
                  onClick={handleVersion}
                  className="flex items-center justify-center relative w-[150px] h-[70px] mb-10 cursor-pointer transition-all duration-300 hover:scale-110"
                >
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={dbutton}
                      alt="login"
                      fill
                      className="object-fill "
                      priority
                    />
                  </div>
                  <span className="relative text-black font-hand text-[30px] z-10 leading-none ransition-all duration-300">
                    Save New Version
                  </span>
                </button>
              </div>
            )}

            {tab === "action" && (
              <div className="flex flex-col gap-3 items-center">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a goal</option>
                  {goals.map((g) => (
                    <option key={g.goal_id} value={g.goal_id}>
                      {g.title}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Effort level (1-10)"
                  value={effortLevel}
                  onChange={(e) => setEffortLevel(e.target.value)}
                  className={inputClass}
                />
                <button
                  onClick={handleAction}
                  className="flex items-center justify-center relative w-[150px] h-[70px] mb-10 cursor-pointer transition-all duration-300 hover:scale-110"
                >
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={dbutton}
                      alt="login"
                      fill
                      className="object-fill "
                      priority
                    />
                  </div>
                  <span className="relative text-black font-hand text-[30px] z-10 leading-none ransition-all duration-300">
                    Log Action
                  </span>
                </button>
              </div>
            )}

            {tab === "review" && (
              <div className="flex flex-col gap-3 items-center">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a goal</option>
                  {goals.map((g) => (
                    <option key={g.goal_id} value={g.goal_id}>
                      {g.title}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Clarity score (1-10)"
                  value={clarityScore}
                  onChange={(e) => setClarityScore(e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Motivation score (1-10)"
                  value={motivationScore}
                  onChange={(e) => setMotivationScore(e.target.value)}
                  className={inputClass}
                />
                <button
                  onClick={handleReview}
                  className="flex items-center justify-center relative w-[150px] h-[70px] mb-10 cursor-pointer transition-all duration-300 hover:scale-110"
                >
                  <div className="absolute inset-0 z-0">
                    <Image
                      src={dbutton}
                      alt="login"
                      fill
                      className="object-fill "
                      priority
                    />
                  </div>
                  <span className="relative text-black font-hand text-[30px] z-10 leading-none ransition-all duration-300">
                    Submit Review
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right — goals list */}
        <div className="col-span-2 p-6">
          <h2 className="text-black font-hand text-[30px] mb-2 ml-2">All Goals</h2>
          {goals.length === 0 ? (
            <p className="text-gray-500 text-sm">No goals yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {goals.map((g) => (
                <div
                  key={g.goal_id}
                  className="relative flex min-w-[540px] mx-auto min-h-[90px] my-auto items-center justify-between p-4 z-10"
                >
                  <Image
                    src={dgcard}
                    alt="login"
                    fill
                    className="object-fill absolute" 
                    priority
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[200px] border-4 border-black flex items-center justify-center text-black text-xs font-bold">
                      {g.title[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[25px] text-black font-hand tracking-widest">
                        {g.title}
                      </p>
                      <p
                        className={`text-xs -mt-1 ${priorityColor(g.priority)}`}
                      >
                        {g.priority || "no priority"} ·{" "}
                        {g.is_abandoned ? "Abandoned" : "Active"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-emerald-400 font-medium pr-2">
                      {g.action_count} actions
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 pr-2">
                      {g.last_action_date
                        ? new Date(g.last_action_date).toLocaleDateString()
                        : "No activity"}
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
