CREATE TABLE auth.users (
    user_id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE decision.decisions (
    decision_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES auth.users(user_id),
    title TEXT NOT NULL,
	category TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE decision.decision_events (
    event_id SERIAL PRIMARY KEY,
	decision_id INT NOT NULL REFERENCES decision.decisions(decision_id),
    event_type TEXT CHECK (
		event_type IN ('CREATED', 'REVISITED', 'POSTPONED', 'DECIDED')
	),
	confidence INT CHECK (confidence BETWEEN 1 AND 10),
    event_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE decision.decision_reviews (
    review_id SERIAL PRIMARY KEY,
	decision_id INT REFERENCES decision.decisions(decision_id),
	regret_score INT CHECK (regret_score BETWEEN 1 AND 10),
	satisfaction_score INT CHECK (satisfaction_score BETWEEN 1 AND 10),
	would_repeat BOOLEAN,
    reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE goal.goals (
    goal_id SERIAL PRIMARY KEY,
	user_id INT NOT NULL REFERENCES auth.users(user_id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	is_abandoned BOOLEAN DEFAULT FALSE
);

CREATE TABLE goal.goal_versions (
    goal_versions_id SERIAL PRIMARY KEY,
	goal_id INT NOT NULL REFERENCES goal.goals(goal_id),
	title TEXT NOT NULL,
	priority INT CHECK (priority BETWEEN 1 AND 10),
	valid_from TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	valid_to TIMESTAMP
);

CREATE TABLE goal.goal_actions (
    action_id SERIAL PRIMARY KEY,
	goal_id INT NOT NULL REFERENCES goal.goals(goal_id),
	action_date DATE DEFAULT CURRENT_DATE,
	effort_level INT CHECK (effort_level BETWEEN 1 AND 5)
);

CREATE TABLE goal.goal_reviews (
    review_id SERIAL PRIMARY KEY,
	goal_id INT NOT NULL REFERENCES goal.goals(goal_id),
	clarity_score INT CHECK (clarity_score BETWEEN 1 AND 10),
	motivation_score INT CHECK (motivation_score BETWEEN 1 AND 10),
	reviewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
