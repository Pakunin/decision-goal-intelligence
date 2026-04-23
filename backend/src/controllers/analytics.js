// const pool = require('../config/db');

// const getDecisionSummary = async (req, res) => {
//     const { user_id } = req.query;

//     if (!user_id) {
//         return res.status(400).json({ error: 'user_id is required' });
//     }

//     try{
//         const userDecisions = await pool.query(
//             `SELECT decision_id FROM decision.decisions WHERE user_id = $1`, [user_id]
//         );

//         const decisionIds = userDecisions.rows.map(r => r.decision_id);

//         if (decisionIds.length === 0){
//             return res.json({ timeline: [], overthinking: [] });
//         }

//         const timeline = await pool.query(
//             `SELECT * FROM analytics.decision_timeline_summary WHERE decision_id = ANY($1::int[])`, [decisionIds]
//         );

//         const overthinking = await pool.query(
//             `SELECT * FROM analytics.decision_overthinking_metrics WHERE decision_id = ANY($1::int[])`, [decisionIds]
//         );

//         res.json({
//             timeline: timeline.rows,
//             overthinking: overthinking.rows
//         })

//     } catch(err){
//         console.error('getDecisionSummary error:', err.message);
//     }
// };

// const getGoalSummary = async (req, res) => {
//     const { user_id } = req.query;

//     if (!user_id) {
//         return res.status(400).json({ error: 'user_id is required' });
//     }

//     try { 
//         const userGoals = await pool.query(
//             `SELECT goal_id from goal.goals WHERE user_id = $1`, [user_id]
//         );

//         const goalIds = userGoals.rows.map(r => r.goal_id);

//         if (goalIds.length === 0) {
//             return res.json({ drift: [], engagement: [] });
//         }

//         const drift = await pool.query(
//             `SELECT * FROM analytics.goal_drift_metrics WHERE goal_id = ANY($1::int[])`, [goalIds]
//         );

//         const engagement = await pool.query(
//             `SELECT * FROM analytics.goal_engagement_metrics WHERE goal_id = ANY($1::int[])`, [goalIds]
//         );

//         res.json({
//             drift: drift.rows,
//             engagement: engagement.rows
//         });

//     } catch (err) {
//         console.error('getGoalDecisions error:', err.message);
//     }
// };

// module.exports = { getDecisionSummary, getGoalSummary };

const pool = require('../config/db');

const getDecisionSummary = async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  try {
    const userDecisions = await pool.query(
      `SELECT decision_id FROM decision.decisions WHERE user_id = $1`,
      [user_id]
    );
    const decisionIds = userDecisions.rows.map(r => r.decision_id);

    if (decisionIds.length === 0) {
      return res.json({ timeline: [], overthinking: [], delayVsRegret: [], activeVsDecided: [], behaviorSummary: null });
    }

    const [timeline, overthinking, delayVsRegret, activeVsDecided, behaviorSummary] = await Promise.all([
      pool.query(`SELECT * FROM analytics.decision_timeline_summary WHERE decision_id = ANY($1::int[])`, [decisionIds]),
      pool.query(`SELECT * FROM analytics.decision_overthinking_metrics WHERE decision_id = ANY($1::int[])`, [decisionIds]),
      pool.query(`SELECT * FROM analytics.decision_delay_vs_regret WHERE decision_id = ANY($1::int[])`, [decisionIds]),
      pool.query(`SELECT * FROM analytics.active_vs_decided_decisions WHERE decision_id = ANY($1::int[])`, [decisionIds]),
      pool.query(`SELECT * FROM analytics.user_behavior_summary WHERE user_id = $1`, [user_id]),
    ]);

    res.json({
      timeline: timeline.rows,
      overthinking: overthinking.rows,
      delayVsRegret: delayVsRegret.rows,
      activeVsDecided: activeVsDecided.rows,
      behaviorSummary: behaviorSummary.rows[0] || null,
    });

  } catch (err) {
    console.error('getDecisionSummary error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getGoalSummary = async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });

  try {
    const userGoals = await pool.query(
      `SELECT goal_id FROM goal.goals WHERE user_id = $1`,
      [user_id]
    );
    const goalIds = userGoals.rows.map(r => r.goal_id);

    if (goalIds.length === 0) {
      return res.json({ drift: [], engagement: [], currentState: [] });
    }

    const [drift, engagement, currentState] = await Promise.all([
      pool.query(`SELECT * FROM analytics.goal_drift_metrics WHERE goal_id = ANY($1::int[])`, [goalIds]),
      pool.query(`SELECT * FROM analytics.goal_engagement_metrics WHERE goal_id = ANY($1::int[])`, [goalIds]),
      pool.query(`SELECT * FROM analytics.goal_current_state WHERE goal_id = ANY($1::int[])`, [goalIds]),
    ]);

    res.json({
      drift: drift.rows,
      engagement: engagement.rows,
      currentState: currentState.rows,
    });

  } catch (err) {
    console.error('getGoalSummary error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getDecisionSummary, getGoalSummary };