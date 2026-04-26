"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllDecisions, getAllGoals } from "../../lib/api";
import { getUser } from "../../utils/auth";
import PageWrapper from "../components/PageWrapper";
import Image from "next/image";
import statcard from "../../public/statcard.svg";
import recent from "../../public/recents.svg";
import recentflip from "../../public/recentsflipped.svg";

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

  const activeGoals = goals.filter((g) => !g.is_abandoned);
  const recentDecisions = decisions.slice(0, 3);
  const recentActions = goals.filter((g) => g.last_action_date).slice(0, 3);

  const stats = [
    {
      label: "Total Decisions",
      value: decisions.length,
      gradient: "from-[#6E2391] to-[#3A224A]",
      sub: "tracked so far",
    },
    {
      label: "Active Goals",
      value: activeGoals.length,
      gradient: "from-[#239165] to-[#3A224A]",
      sub: "in progress",
    },
    {
      label: "Total Actions",
      value: goals.reduce((sum, g) => sum + Number(g.action_count || 0), 0),
      gradient: "from-[#C47D19] to-[#3A224A]",
      sub: "logged toward goals",
    },
    {
      label: "Goals with Activity",
      value: goals.filter((g) => g.last_action_date).length,
      gradient: "from-[#912360] to-[#3A224A]",
      sub: "recently active",
    },
  ];

  return (
    <PageWrapper>
      {/* Stat cards */}
      <div className="grid grid-cols-4 max-w-[1700px] mx-auto items-center justify-center mb-8 mt-15">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative w-full h-[210px] flex justify-center items-center text-center`}
          >
            <div
              className={`absolute inset-0 z-0 bg-linear-to-b ${stat.gradient}`}
              style={{
                maskImage: `url(${statcard.src})`,
                WebkitMaskImage: `url(${statcard.src})`,
                maskRepeat: "no-repeat",
                maskPosition: "center",
                maskSize: "100% 100%",
              }}
            />
            <div className="max-w-[150px] text-left mt-5 mr-10">
              <p
                className={`bg-linear-to-b ${stat.gradient} bg-clip-text text-transparent font-hand text-[51px] tracking-wide leading-none`}
              >
                {stat.label}
              </p>
            </div>

            <div className="text-right mt-5.5">
              <p
                className={`font-hand text-[118px] bg-linear-to-b ${stat.gradient} bg-clip-text text-transparent leading-[0.9]`}
              >
                {stat.value}
              </p>
            </div>
            {/* <p className="text-white/60 text-xs">{stat.sub}</p> */}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 max-w-[1580px] mx-auto gap-6 mt-15">
        {/* Recent Decisions */}
        <div className="relative h-auto min-h-[450px] flex flex-col group">
          <div className="absolute inset-0 z-0">
            <Image
              src={recent}
              alt="background"
              fill
              className="object-fill"
              priority
            />
          </div>

          <div className="relative z-10 flex flex-col p-15">
            <div className="flex justify-between items-baseline">
              <h2 className="text-[52px] text-black font-hand leading-none mt-2 ml-5 mb-4">
                Recent Decisions
              </h2>
              {/* <a
                href="/decisions"
                className="text-[20px] text-black font-hand leading-none hover:text-blue-500"
              >
                View all →
              </a> */}
            </div>
            {recentDecisions.length === 0 ? (
              <p className="text-[30px] font-hand text-black leading-none ml-6">No decisions yet</p>
            ) : (
              <div className="flex flex-col gap-3 w-[614px] mx-auto">
                {recentDecisions.map((d) => (
                  <div
                    key={d.decision_id}
                    className="flex items-start gap-3 p-2 border-4 border-black rounded-[20px]"
                  >
                    <div className="w-2 h-2 rounded-full bg-black mt-3 ml-2 shrink-0" />
                    <div>
                      <p className="text-[30px] font-hand text-black leading-none tracking-wider mb-0.2">
                        {d.title.length > 60 ? `${d.title.slice(0, 60)}...` : d.title}
                      </p>
                      <p className="text-xs text-black mb-1 mt-0.5 leading-none">
                        {d.category || "Uncategorized"} · {d.event_count} events
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Goal Activity */}
        <div className="relative h-auto min-h-[450px] flex flex-col group">
          <div className="absolute inset-0 z-0">
            <Image
              src={recentflip}
              alt="background"
              fill
              className="object-fill"
              priority
            />
          </div>
          <div className="relative z-10 flex flex-col p-15">
            <div className="flex justify-between items-baseline">
              <h2 className="text-[52px] text-black font-hand leading-none mt-2 ml-5 mb-4">
                Recent Goal Activity
              </h2>
              {/* <a
              href="/goals"
              className="text-xs text-emerald-400 hover:text-emerald-300"
            >
              View all →
            </a> */}
            </div>
            {recentActions.length === 0 ? (
              <p className="text-[30px] font-hand text-black leading-none ml-6">No goal activity yet</p>
            ) : (
              <div className="flex flex-col gap-3 w-[614px] mx-auto">
                {recentActions.map((g) => (
                  <div
                    key={g.goal_id}
                    className="flex items-start gap-3 p-2 border-4 border-black rounded-[20px]"
                  >
                    <div className="w-2 h-2 rounded-full bg-black mt-3 ml-2 shrink-0" />
                    <div>
                      <p className="text-[30px] font-hand text-black leading-none tracking-wider mb-0.2">
                        {g.title.length > 60 ? `${g.title.slice(0, 60)}...` : g.title}
                      </p>
                      <p className="text-xs text-black mb-1 leading-none">
                        Last action:{" "}
                        {new Date(g.last_action_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
