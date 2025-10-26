CREATE TABLE IF NOT EXISTS rcm_risks (
id UUID PRIMARY KEY,
engagement_id UUID REFERENCES engagements(id) ON DELETE CASCADE,
title TEXT NOT NULL,
description TEXT,
coso_component TEXT,
likelihood SMALLINT CHECK (likelihood BETWEEN 1 AND 5) NOT NULL,
impact SMALLINT CHECK (impact BETWEEN 1 AND 5) NOT NULL
);
CREATE TABLE IF NOT EXISTS rcm_controls (
id UUID PRIMARY KEY,
risk_id UUID REFERENCES rcm_risks(id) ON DELETE CASCADE,
control_title TEXT NOT NULL,
control_type TEXT CHECK (control_type IN ('preventive','detective','corrective')),
owner TEXT
);
CREATE TABLE IF NOT EXISTS rcm_tests (
id UUID PRIMARY KEY,
control_id UUID REFERENCES rcm_controls(id) ON DELETE CASCADE,
procedure TEXT NOT NULL,
sample_method TEXT,
sample_size INT CHECK (sample_size >= 0),
criteria TEXT
);
ALTER TABLE engagements ADD COLUMN IF NOT EXISTS planning_signoff BOOLEAN DEFAULT false;
