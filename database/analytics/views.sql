CREATE VIEW analytics.decision_timeline_summary AS
SELECT
    decision_id,
    MIN(event_time) FILTER (WHERE event_type = 'CREATED') AS created_at,
    MAX(event_time) FILTER (WHERE event_type = 'DECIDED') AS decided_at,
    MAX(event_time) FILTER (WHERE event_type = 'DECIDED')
      - MIN(event_time) FILTER (WHERE event_type = 'CREATED')
      AS decision_delay
FROM decision.decision_events
GROUP BY decision_id;

CREATE VIEW analytics.decision_overthinking_metrics AS
SELECT
    decision_id,
    COUNT(*) FILTER (WHERE event_type = 'REVISITED') AS revisit_count,
    COUNT(*) FILTER (WHERE event_type = 'POSTPONED') AS postpone_count,
    COUNT(*) AS total_events
FROM decision.decision_events
GROUP BY decision_id;

CREATE VIEW analytics.active_vs_decided_decisions AS
SELECT
    d.decision_id,
    CASE
        WHEN EXISTS (
            SELECT 1
            FROM decision.decision_events e
            WHERE e.decision_id = d.decision_id
              AND e.event_type = 'DECIDED'
        )
        THEN 'DECIDED'
        ELSE 'ACTIVE'
    END AS status
FROM decision.decisions d;

CREATE VIEW analytics.decision_delay_vs_regret AS
SELECT
    t.decision_id,
    t.decision_delay,
    r.regret_score,
    r.satisfaction_score
FROM analytics.decision_timeline_summary t
JOIN decision.decision_reviews r
  ON t.decision_id = r.decision_id;

CREATE VIEW analytics.goal_current_state AS
SELECT
    goal_id,
    title,
    priority,
    valid_from
FROM goal.goal_versions
WHERE valid_to IS NULL;

CREATE VIEW analytics.goal_drift_metrics AS
SELECT
    g.goal_id,
    COUNT(v.goal_version_id) AS version_count,
    MIN(v.priority) FILTER (
        WHERE v.valid_from = (
            SELECT MIN(v2.valid_from)
            FROM goal.goal_versions v2
            WHERE v2.goal_id = g.goal_id
        )
    ) AS initial_priority,
    MAX(v.priority) FILTER (WHERE v.valid_to IS NULL) AS current_priority,
    MAX(v.priority) FILTER (WHERE v.valid_to IS NULL)
      - MIN(v.priority) FILTER (
            WHERE v.valid_from = (
                SELECT MIN(v2.valid_from)
                FROM goal.goal_versions v2
                WHERE v2.goal_id = g.goal_id
            )
        ) AS priority_change
FROM goal.goals g
JOIN goal.goal_versions v
  ON g.goal_id = v.goal_id
GROUP BY g.goal_id;

CREATE VIEW analytics.goal_drift_metrics AS
SELECT
    g.goal_id,
    COUNT(v.goal_versions_id) AS version_count,
    MIN(v.priority) FILTER (
        WHERE v.valid_from = (
            SELECT MIN(v2.valid_from)
            FROM goal.goal_versions v2
            WHERE v2.goal_id = g.goal_id
        )
    ) AS initial_priority,
    MAX(v.priority) FILTER (WHERE v.valid_to IS NULL) AS current_priority,
    MAX(v.priority) FILTER (WHERE v.valid_to IS NULL)
      - MIN(v.priority) FILTER (
            WHERE v.valid_from = (
                SELECT MIN(v2.valid_from)
                FROM goal.goal_versions v2
                WHERE v2.goal_id = g.goal_id
            )
        ) AS priority_change
FROM goal.goals g
JOIN goal.goal_versions v
  ON g.goal_id = v.goal_id
GROUP BY g.goal_id;

CREATE VIEW analytics.goal_engagement_metrics AS
SELECT
    goal_id,
    COUNT(*) AS action_count,
    MAX(action_date) AS last_action_date
FROM goal.goal_actions
GROUP BY goal_id;

CREATE VIEW analytics.user_behavior_summary AS
SELECT
    u.user_id,
    AVG(t.decision_delay) AS avg_decision_delay,
    COUNT(DISTINCT d.decision_id) AS decision_count,
    COUNT(DISTINCT g.goal_id) FILTER (WHERE gm.priority_change < 0) AS drifting_goals
FROM auth.users u
LEFT JOIN decision.decisions d
  ON u.user_id = d.user_id
LEFT JOIN analytics.decision_timeline_summary t
  ON d.decision_id = t.decision_id
LEFT JOIN goal.goals g
  ON u.user_id = g.user_id
LEFT JOIN analytics.goal_drift_metrics gm
  ON g.goal_id = gm.goal_id
GROUP BY u.user_id;