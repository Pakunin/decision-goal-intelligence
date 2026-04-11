CREATE TRIGGER decision_created_trigger
AFTER INSERT ON decision.decisions
FOR EACH ROW
EXECUTE FUNCTION create_decision_event();

CREATE TRIGGER goal_version_trigger
BEFORE INSERT ON goal.goal_versions
FOR EACH ROW
EXECUTE FUNCTION close_previous_goal_version();

CREATE TRIGGER decision_final_check
BEFORE INSERT ON decision.decision_events
FOR EACH ROW
EXECUTE FUNCTION prevent_multiple_decisions();