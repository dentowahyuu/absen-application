-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Employees
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    department TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Master face embeddings (InsightFace buffalo_l -> 512-dim)
CREATE TABLE IF NOT EXISTS user_faces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    face_embedding vector(512) NOT NULL,
    photo_url TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Note: no ANN index (ivfflat/hnsw) on face_embedding on purpose. Those are
-- approximate indexes that need a sizeable, well-distributed dataset to build
-- useful clusters -- with only a few dozen/hundred employees, an untrained
-- index can miss the correct match entirely. Exact brute-force `<=>` search
-- is both correct and fast enough at this scale.

CREATE INDEX IF NOT EXISTS user_faces_user_id_idx ON user_faces(user_id);

-- Office locations used to geofence attendance (GPS-based, checked at clock-in/out)
CREATE TABLE IF NOT EXISTS offices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    radius_meters INTEGER NOT NULL DEFAULT 30,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Attendance logs
CREATE TABLE IF NOT EXISTS attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ,
    clock_out TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'present',
    similarity DOUBLE PRECISION,
    photo_url TEXT,
    office_id UUID REFERENCES offices(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS attendance_logs_user_id_idx ON attendance_logs(user_id);
CREATE INDEX IF NOT EXISTS attendance_logs_created_at_idx ON attendance_logs(created_at);

-- Admin dashboard accounts (separate from employees/attendance)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
