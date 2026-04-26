"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getAllDecisions,
  createDecision,
  addDecisionEvent,
  addDecisionReview,
} from "../../lib/api";
import { getUser } from "../../utils/auth";
import PageWrapper from "../components/PageWrapper";
import Image from "next/image";
import decision from "../../public/dgmenusvg.svg";
import dbutton from "../../public/dgbutton.svg";
import dgcard from "../../public/dgcard.svg";

export default function DecisionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [decisions, setDecisions] = useState<any[]>([]);
  const [tab, setTab] = useState<"create" | "event" | "review">("create");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [eventType, setEventType] = useState("revisit");
  const [confidence, setConfidence] = useState("");
  const [outcome, setOutcome] = useState("");
  const [regret, setRegret] = useState("");
  const [satisfaction, setSatisfaction] = useState("");
  const [wouldRepeat, setWouldRepeat] = useState("true");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.push("/");
      return;
    }
    setUser(u);
    loadDecisions(u.user_id);
  }, []);

  const loadDecisions = async (uid: number) => {
    const data = await getAllDecisions(uid);
    setDecisions(data.decisions || []);
  };

  const notify = (msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), 3000);
  };

  const handleCreate = async () => {
    if (!title) return;
    await createDecision(user.user_id, title, category);
    setTitle("");
    setCategory("");
    notify("Decision created");
    loadDecisions(user.user_id);
  };

  const handleEvent = async () => {
    if (!selectedId) return;
    await addDecisionEvent(
      Number(selectedId),
      eventType,
      Number(confidence),
      outcome,
    );
    notify("Event logged");
    loadDecisions(user.user_id);
    setConfidence("");
    setOutcome("");
  };

  const handleReview = async () => {
    if (!selectedId) return;
    await addDecisionReview(
      Number(selectedId),
      Number(regret),
      Number(satisfaction),
      wouldRepeat === "true",
    );
    notify("Review submitted");
    setRegret("");
    setSatisfaction("");
  };

  const inputClass =
    "w-[739px] border-4 border-black font-medium font-hand tracking-widest text-black placeholder-black px-5 py-2 rounded-[30px] text-[22px] leading-none focus:outline-none focus:border-indigo-500";
  const tabs = ["create", "event", "review"] as const;

  const tabGradients = {
    create: "from-[#FAB7B7] to-[#C48F8F]", // Pinkish
    event: "from-[#FAB7F3] to-[#938FC4]", // Bluish
    review: "from-[#CEFAB7] to-[#8FC4BE]", // Greenish
  };

  return (
    <PageWrapper>
      <div className="mb-8 mt-5 ml-5">
        <h1 className="text-[52px] tracking-wide leading-none font-hand text-black">
          Decisions
        </h1>
        <p className="text-[26px] tracking-wider leading-none font-hand text-[#6e6e6e] mt-1">
          Track, revisit and reflect on your decisions
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
                    : t === "event"
                      ? "Log Event"
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
                  placeholder="Decision title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Category (optional)"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={inputClass}
                />
                <button
                  onClick={handleCreate}
                  className="flex items-center justify-center relative w-[150px] h-[80px] mb-10 cursor-pointer transition-all duration-300 hover:scale-110"
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
                    Create Decision
                  </span>
                </button>
              </div>
            )}

            {tab === "event" && (
              <div className="flex flex-col gap-3 items-center">
                <select
                  value={selectedId}
                  onChange={(e) => setSelectedId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select a decision</option>
                  {decisions.map((d) => (
                    <option key={d.decision_id} value={d.decision_id}>
                      {d.title}
                    </option>
                  ))}
                </select>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className={inputClass}
                >
                  <option value="REVISITED">Revisit</option>
                  <option value="POSTPONED">Postpone</option>
                  <option value="DECIDED">Decide</option>
                </select>
                <input
                  placeholder="Confidence (0-10)"
                  value={confidence}
                  onChange={(e) => setConfidence(e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Outcome (optional)"
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  className={inputClass}
                />
                <button
                  onClick={handleEvent}
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
                    Log Event
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
                  <option value="">Select a decision</option>
                  {decisions.map((d) => (
                    <option key={d.decision_id} value={d.decision_id}>
                      {d.title}
                    </option>
                  ))}
                </select>
                <input
                  placeholder="Regret score (1-10)"
                  value={regret}
                  onChange={(e) => setRegret(e.target.value)}
                  className={inputClass}
                />
                <input
                  placeholder="Satisfaction score (1-10)"
                  value={satisfaction}
                  onChange={(e) => setSatisfaction(e.target.value)}
                  className={inputClass}
                />
                <select
                  value={wouldRepeat}
                  onChange={(e) => setWouldRepeat(e.target.value)}
                  className={inputClass}
                >
                  <option value="true">Would repeat</option>
                  <option value="false">Would not repeat</option>
                </select>

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
          {/* Tabs */}
        </div>

        {/* Right — decisions list */}
        <div className="col-span-2 p-6">
          <h2 className="text-black font-hand text-[30px] mb-2 ml-2">All Decisions</h2>
          {decisions.length === 0 ? (
            <p className="text-gray-500 text-sm">No decisions yet</p>
          ) : (
            <div className="flex flex-col gap-3">
              {decisions.map((d) => (
                <div
                  key={d.decision_id}
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
                      {d.title[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-[25px] text-black font-hand tracking-widest">
                        {d.title.length > 40 ? `${d.title.slice(0, 40)}...` : d.title}
                      </p>
                      <p className="text-xs text-gray-400 -mt-2">
                        {d.category || "Uncategorized"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-indigo-400 pr-2 font-medium">
                      {d.event_count} events
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 pr-2">
                      {new Date(d.created_at).toLocaleDateString()}
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
