ALTER TABLE decision.decision_events
ADD CONSTRAINT confidence_range
CHECK (confidence BETWEEN 1 AND 10);

ALTER TABLE goal.goal_versions
ADD CONSTRAINT priority_check
CHECK (priority BETWEEN 1 AND 10);

ALTER TABLE decision.decision_events
ADD CONSTRAINT event_type_check
CHECK(
event_type IN ('CREATED','REVISITED','POSTPONED','DECIDED')
);

