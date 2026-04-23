export type Severity = 'positive' | 'warning' | 'neutral';
export type Category = 'decisions' | 'goals' | 'patterns' | 'completion';

export interface Insight {
  id: string;
  category: Category;
  priority: 1 | 2 | 3;
  icon: string;
  title: string;
  observation: string;
  meaning: string;
  action: string;
  severity: Severity;
}

export interface BehaviorLabel {
  label: string;
  description: string;
  icon: string;
  color: string;
}

export function generateInsights(decisionData: any, goalData: any): Insight[] {
  const insights: Insight[] = [];

  const timeline = decisionData?.timeline || [];
  const overthinking = decisionData?.overthinking || [];
  const delayVsRegret = decisionData?.delayVsRegret || [];
  const activeVsDecided = decisionData?.activeVsDecided || [];
  const summary = decisionData?.behaviorSummary;
  const engagement = goalData?.engagement || [];
  const drift = goalData?.drift || [];

  // ─── Decision delay ───────────────────────────────────────

  const avgDelay = summary?.avg_decision_delay
    ? Number(summary.avg_decision_delay)
    : avg(timeline.map((r: any) => Number(r.decision_delay)).filter(Boolean));

  if (avgDelay > 7) {
    insights.push({
      id: 'slow_decider',
      category: 'decisions',
      priority: 1,
      icon: '⏳',
      title: 'You take a long time to decide',
      observation: `On average, your decisions take ${avgDelay.toFixed(0)} days before you commit.`,
      meaning: 'Long delays often mean uncertainty, fear of being wrong, or waiting for perfect information.',
      action: 'Try setting a personal deadline when you create a decision. Even an imperfect decision made on time beats a perfect one made too late.',
      severity: 'warning',
    });
  } else if (avgDelay > 0 && avgDelay <= 2) {
    insights.push({
      id: 'fast_decider',
      category: 'decisions',
      priority: 2,
      icon: '⚡',
      title: 'You decide quickly',
      observation: `Your decisions are typically made within ${avgDelay.toFixed(1)} days.`,
      meaning: 'Fast decisions show confidence and decisiveness — but can sometimes mean important things are being rushed.',
      action: 'For high-stakes decisions, give yourself at least a day to sleep on it before committing.',
      severity: 'positive',
    });
  }

  // ─── Revisits & overthinking ──────────────────────────────

  const avgRevisits = avg(overthinking.map((r: any) => Number(r.revisit_count)));
  const avgPostpones = avg(overthinking.map((r: any) => Number(r.postpone_count)));

  if (avgRevisits > 2) {
    insights.push({
      id: 'overthinker',
      category: 'decisions',
      priority: 1,
      icon: '🔁',
      title: 'You revisit decisions often',
      observation: `On average, you go back to a decision ${avgRevisits.toFixed(1)} times before resolving it.`,
      meaning: 'Frequent revisits can be a sign of overthinking, indecisiveness, or changing circumstances.',
      action: 'When you revisit a decision, ask yourself: "Has anything actually changed?" If not, trust your earlier thinking.',
      severity: 'warning',
    });
  }

  if (avgPostpones > avgRevisits && avgPostpones > 1) {
    insights.push({
      id: 'avoider',
      category: 'decisions',
      priority: 1,
      icon: '🚫',
      title: 'You tend to postpone more than revisit',
      observation: `You postpone decisions more often than you actively revisit them (${avgPostpones.toFixed(1)} postpones vs ${avgRevisits.toFixed(1)} revisits on average).`,
      meaning: 'Postponing without revisiting usually means avoidance rather than deliberation.',
      action: 'Next time you postpone, set a specific date to come back to it — and stick to it.',
      severity: 'warning',
    });
  }

  // ─── Regret & satisfaction ────────────────────────────────

  const avgRegret = avg(delayVsRegret.map((r: any) => Number(r.regret_score)).filter(Boolean));
  const avgSatisfaction = avg(delayVsRegret.map((r: any) => Number(r.satisfaction_score)).filter(Boolean));

  if (avgRegret > 6) {
    insights.push({
      id: 'high_regret',
      category: 'patterns',
      priority: 1,
      icon: '😟',
      title: 'You often regret your decisions',
      observation: `Your average regret score is ${avgRegret.toFixed(1)} out of 10.`,
      meaning: 'High regret can mean decisions are being made with low information, under pressure, or against your own values.',
      action: 'Before deciding, write down your top two reasons for the choice. This makes your reasoning visible and easier to stand behind.',
      severity: 'warning',
    });
  } else if (avgSatisfaction > 7 && avgRegret < 4 && delayVsRegret.length > 0) {
    insights.push({
      id: 'confident_decider',
      category: 'patterns',
      priority: 2,
      icon: '✅',
      title: 'Your decisions generally feel right afterward',
      observation: `Your average satisfaction is ${avgSatisfaction.toFixed(1)}/10 with a low regret score of ${avgRegret.toFixed(1)}/10.`,
      meaning: 'You have good alignment between how you decide and what you value.',
      action: 'Keep doing what you\'re doing. Consider noting what made these decisions feel good so you can repeat it.',
      severity: 'positive',
    });
  }

  // ─── Completion patterns ──────────────────────────────────

  const total = activeVsDecided.length;
  const decided = activeVsDecided.filter((r: any) => r.status === 'decided').length;
  const active = total - decided;

  if (total > 0) {
    const decisionRate = decided / total;

    if (decisionRate > 0.7) {
      insights.push({
        id: 'high_completion',
        category: 'completion',
        priority: 2,
        icon: '🎯',
        title: 'You follow through on your decisions',
        observation: `${decided} out of ${total} decisions have been resolved (${Math.round(decisionRate * 100)}%).`,
        meaning: 'A high resolution rate means you\'re not letting things hang in limbo.',
        action: 'Great habit. Make sure your resolved decisions also have reviews attached so you can learn from them.',
        severity: 'positive',
      });
    } else if (active > decided && total >= 3) {
      insights.push({
        id: 'low_completion',
        category: 'completion',
        priority: 1,
        icon: '⚠️',
        title: 'Most of your decisions are still unresolved',
        observation: `${active} out of ${total} decisions are still open (${Math.round((active / total) * 100)}% unresolved).`,
        meaning: 'A large backlog of open decisions creates mental load and decision fatigue.',
        action: 'Pick your oldest open decision and commit to resolving it this week. Even a "not doing this" is a resolution.',
        severity: 'warning',
      });
    }
  }

  // ─── Goal consistency ─────────────────────────────────────

  const goalsWithNoAction = engagement.filter((r: any) => Number(r.action_count) === 0);
  const avgActions = avg(engagement.map((r: any) => Number(r.action_count)));

  if (goalsWithNoAction.length > 0) {
    insights.push({
      id: 'inactive_goals',
      category: 'goals',
      priority: 1,
      icon: '💤',
      title: `${goalsWithNoAction.length} goal${goalsWithNoAction.length > 1 ? 's have' : ' has'} no progress logged`,
      observation: `You have goals with zero actions recorded.`,
      meaning: 'A goal without actions is just a wish. No logged activity means either you\'re not working on it, or not tracking your work.',
      action: 'Log even a small action on each inactive goal. Progress, however small, keeps goals alive.',
      severity: 'warning',
    });
  }

  if (avgActions > 5 && engagement.length > 0) {
    insights.push({
      id: 'active_executor',
      category: 'goals',
      priority: 2,
      icon: '💪',
      title: 'You actively work on your goals',
      observation: `On average, you log ${avgActions.toFixed(1)} actions per goal.`,
      meaning: 'Consistent action logging shows real engagement, not just goal-setting.',
      action: 'Keep this up. Consider adding reviews periodically to reflect on whether the effort is going in the right direction.',
      severity: 'positive',
    });
  }

  // ─── Goal drift ───────────────────────────────────────────

  const driftingGoals = drift.filter((r: any) => Number(r.version_count) > 1);
  const highlyRevised = drift.filter((r: any) => Number(r.version_count) > 3);

  if (highlyRevised.length > 0) {
    insights.push({
      id: 'heavy_drifter',
      category: 'goals',
      priority: 1,
      icon: '🌊',
      title: `${highlyRevised.length} goal${highlyRevised.length > 1 ? 's have' : ' has'} been revised many times`,
      observation: `Some goals have gone through more than 3 revisions.`,
      meaning: 'Heavy revision can mean unclear direction, changing priorities, or lack of initial clarity.',
      action: 'Before setting a new goal, write one sentence describing exactly what success looks like. Vague goals drift.',
      severity: 'warning',
    });
  } else if (driftingGoals.length > 1) {
    insights.push({
      id: 'drifter',
      category: 'goals',
      priority: 2,
      icon: '🔄',
      title: 'Some of your goals keep changing',
      observation: `${driftingGoals.length} goals have been revised at least once.`,
      meaning: 'Some revision is healthy — it means you\'re reflecting. Too much means the goal wasn\'t clear to begin with.',
      action: 'Ask yourself: are you refining the goal or avoiding committing to it?',
      severity: 'neutral',
    });
  }

  // Sort by priority
  return insights.sort((a, b) => a.priority - b.priority);
}

export function getBehaviorLabel(decisionData: any, goalData: any): BehaviorLabel {
  const overthinking = decisionData?.overthinking || [];
  const delayVsRegret = decisionData?.delayVsRegret || [];
  const summary = decisionData?.behaviorSummary;
  const drift = goalData?.drift || [];
  const engagement = goalData?.engagement || [];

  const avgDelay = summary?.avg_decision_delay ? Number(summary.avg_decision_delay) : 0;
  const avgRevisits = avg(overthinking.map((r: any) => Number(r.revisit_count)));
  const avgPostpones = avg(overthinking.map((r: any) => Number(r.postpone_count)));
  const avgSatisfaction = avg(delayVsRegret.map((r: any) => Number(r.satisfaction_score)).filter(Boolean));
  const avgRegret = avg(delayVsRegret.map((r: any) => Number(r.regret_score)).filter(Boolean));
  const driftingGoals = Number(summary?.drifting_goals || 0);
  const avgActions = avg(engagement.map((r: any) => Number(r.action_count)));

  if (avgRevisits > 2 || avgPostpones > 2) {
    return {
      label: 'Overthinker',
      description: 'You tend to revisit and delay decisions more than average.',
      icon: '🔁',
      color: 'from-amber-500 to-orange-500',
    };
  }
  if (avgDelay <= 2 && avgDelay > 0) {
    return {
      label: 'Fast Decider',
      description: 'You commit to decisions quickly and move on.',
      icon: '⚡',
      color: 'from-indigo-500 to-blue-500',
    };
  }
  if (avgDelay > 7) {
    return {
      label: 'Slow Deliberator',
      description: 'You take your time before committing — sometimes too much.',
      icon: '⏳',
      color: 'from-purple-500 to-violet-600',
    };
  }
  if (avgSatisfaction > 7 && avgRegret < 4) {
    return {
      label: 'Confident Planner',
      description: 'Your decisions tend to align with your values and feel right afterward.',
      icon: '🎯',
      color: 'from-emerald-500 to-teal-500',
    };
  }
  if (driftingGoals > 1 || drift.some((r: any) => Number(r.version_count) > 3)) {
    return {
      label: 'Drifter',
      description: 'Your goals shift frequently — clarity might be the missing piece.',
      icon: '🌊',
      color: 'from-rose-500 to-pink-500',
    };
  }
  if (avgActions > 5) {
    return {
      label: 'Consistent Executor',
      description: 'You show up for your goals regularly. Action is your strength.',
      icon: '💪',
      color: 'from-green-500 to-emerald-600',
    };
  }

  return {
    label: 'Building Habits',
    description: 'You\'re getting started. Keep logging — patterns will emerge.',
    icon: '🌱',
    color: 'from-gray-500 to-gray-600',
  };
}

// Helper
function avg(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}