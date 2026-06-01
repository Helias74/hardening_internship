CREATE TABLE IF NOT EXISTS sessions (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    started_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    ended_at    TIMESTAMP,
    active      BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    etu_id      VARCHAR(100) NOT NULL UNIQUE,
    username    VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    token       VARCHAR(64) UNIQUE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vulnerabilities (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    category    VARCHAR(50)  NOT NULL,
    check_fn    VARCHAR(100) NOT NULL,
    max_score   INTEGER      NOT NULL DEFAULT 1,
    coefficient NUMERIC(4,2) NOT NULL DEFAULT 1.0,
    description TEXT
);

CREATE TABLE IF NOT EXISTS enrollments (
    id              SERIAL PRIMARY KEY,
    session_id      INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    user_id         INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    container_ip    VARCHAR(45),
    enrolled_at     TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

CREATE TABLE IF NOT EXISTS attack_results (
    id              SERIAL PRIMARY KEY,
    enrollment_id   INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    vuln_id         INTEGER NOT NULL REFERENCES vulnerabilities(id) ON DELETE CASCADE,
    passed          BOOLEAN NOT NULL DEFAULT FALSE,
    last_checked_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(enrollment_id, vuln_id)
);

CREATE TABLE IF NOT EXISTS score_snapshots (
    id              SERIAL PRIMARY KEY,
    enrollment_id   INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    score           INTEGER NOT NULL DEFAULT 0,
    max_score       INTEGER NOT NULL DEFAULT 0,
    snapshot_at     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_enrollments_session
    ON enrollments(session_id);

CREATE INDEX IF NOT EXISTS idx_attack_results_enrollment
    ON attack_results(enrollment_id);

CREATE INDEX IF NOT EXISTS idx_score_snapshots_enrollment
    ON score_snapshots(enrollment_id, snapshot_at);