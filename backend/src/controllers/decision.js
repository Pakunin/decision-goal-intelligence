const pool = require("../config/db");

const createDecision = async (req, res) => {
  const { user_id, title, category } = req.body;

  if (!user_id || !title) {
    return res.status(400).json({ error: "user_id and title are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO decision.decisions (user_id, title, category) VALUES ($1, $2, $3) RETURNING *`,
      [user_id, title, category || null],
    );

    res
      .status(201)
      .json({ message: "Decision created", decision: result.rows[0] });
  } catch (err) {
    console.error("createDecision error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const getAllDecisions = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res
      .status(400)
      .json({ error: "user_id is required as a query parameter" });
  }

  try {
    const result = await pool.query(
      `SELECT
                d.decision_id,
                d.title,
                d.category,
                d.created_at,
                COUNT(de.event_id) AS event_count, 
                MAX(de.event_time) AS last_event_time
            FROM decision.decisions d
            LEFT JOIN decision.decision_events de ON d.decision_id = de.decision_id
            WHERE d.user_id = $1
            GROUP BY d.decision_id
            ORDER BY d.created_at DESC`,
      [user_id],
    );

    res.json({ decisions: result.rows });
  } catch (err) {
    console.error("getAllDecisions error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

const addEvent = async (req, res) => {
  const { decision_id, event_type, confidence, decision_outcome } = req.body;

  if (!decision_id || !event_type) {
    return res
      .status(400)
      .json({ error: "decision_id and event_type are required" });
  }

  const validEventTypes = ["REVISITED", "POSTPONED", "DECIDED"];
  if (!validEventTypes.includes(event_type)) {
    return res.status(400).json({
      error: `event_type must be one of: ${validEventTypes.join(", ")}`,
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO decision.decision_events
                (decision_id, event_type, confidence, decision_outcome)
            VALUES ($1, $2, $3, $4) RETURNING *`,
      [decision_id, event_type, confidence || null, decision_outcome || null],
    );

    res.status(201).json({ message: "Event logged", event: result.rows[0] });
  } catch (err) {
    console.error("addEvent error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};

const addReview = async (req, res) => {
  const { decision_id, regret_score, satisfaction_score, would_repeat } =
    req.body;

  if (!decision_id) {
    return res.status(400).json({ error: "decision_id is required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO decision.decision_reviews
                (decision_id, regret_score, satisfaction_score, would_repeat)
            VALUES ($1, $2, $3, $4) RETURNING *`,
      [
        decision_id,
        regret_score || null,
        satisfaction_score || null,
        would_repeat ?? null,
      ],
    );

    res.status(201).json({ message: "Review added", review: result.rows[0] });
  } catch (err) {
    console.error("addReview error:", err.message);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = { createDecision, getAllDecisions, addEvent, addReview };
