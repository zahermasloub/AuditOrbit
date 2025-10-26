CREATE TABLE IF NOT EXISTS risk_universe (
id UUID PRIMARY KEY,
owner_dept TEXT NOT NULL,
process TEXT NOT NULL,
risk_title TEXT NOT NULL,
key_controls TEXT,
inherent_impact SMALLINT CHECK (inherent_impact BETWEEN 1 AND 5) NOT NULL,
inherent_likelihood SMALLINT CHECK (inherent_likelihood BETWEEN 1 AND 5) NOT NULL,
velocity SMALLINT CHECK (velocity BETWEEN 1 AND 5) DEFAULT 3,
control_maturity SMALLINT CHECK (control_maturity BETWEEN 1 AND 5) DEFAULT 3,
sensitivity SMALLINT CHECK (sensitivity BETWEEN 1 AND 5) DEFAULT 3,
legal_requirement SMALLINT CHECK (legal_requirement BETWEEN 1 AND 5) DEFAULT 1,
notes TEXT,
created_at TIMESTAMPTZ DEFAULT now(),
updated_at TIMESTAMPTZ DEFAULT now()
);
CREATE TABLE IF NOT EXISTS risk_weights (
id UUID PRIMARY KEY,
impact_weight NUMERIC(5,2) DEFAULT 0.30,
likelihood_weight NUMERIC(5,2) DEFAULT 0.25,
velocity_weight NUMERIC(5,2) DEFAULT 0.10,
control_maturity_weight NUMERIC(5,2) DEFAULT 0.15,
sensitivity_weight NUMERIC(5,2) DEFAULT 0.10,
legal_requirement_weight NUMERIC(5,2) DEFAULT 0.10,
effective_from DATE NOT NULL,
effective_to DATE
);
CREATE TABLE IF NOT EXISTS annual_plan_items (
id UUID PRIMARY KEY,
annual_plan_id UUID REFERENCES annual_plans(id) ON DELETE CASCADE,
risk_universe_id UUID REFERENCES risk_universe(id),
tentative_month SMALLINT CHECK (tentative_month BETWEEN 1 AND 12),
est_hours INT CHECK (est_hours>=0) DEFAULT 0,
team_required JSONB,
priority SMALLINT,
status TEXT CHECK (status IN ('planned','deferred','cancelled')) DEFAULT 'planned'
);
CREATE TABLE IF NOT EXISTS annual_plan_approvals (
id UUID PRIMARY KEY,
annual_plan_id UUID REFERENCES annual_plans(id) ON DELETE CASCADE,
step TEXT CHECK (step IN ('manager','cae','committee')) NOT NULL,
decision TEXT CHECK (decision IN ('submitted','approved','rejected')) NOT NULL,
decided_by UUID REFERENCES users(id),
decided_at TIMESTAMPTZ,
notes TEXT
);
CREATE TABLE IF NOT EXISTS resource_allocations (
id UUID PRIMARY KEY,
annual_plan_item_id UUID REFERENCES annual_plan_items(id) ON DELETE CASCADE,
user_id UUID REFERENCES users(id),
role TEXT,
assigned_hours INT CHECK (assigned_hours>=0) DEFAULT 0,
month SMALLINT CHECK (month BETWEEN 1 AND 12)
);
CREATE INDEX IF NOT EXISTS idx_risk_universe_score ON risk_universe ((
  (inherent_impact*1.0) + (inherent_likelihood*1.0) + (velocity*0.8) + (sensitivity*0.8)
) DESC);

-- Ensure annual_plans table exists with all required statuses
CREATE TABLE IF NOT EXISTS annual_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  year INT NOT NULL,
  status TEXT CHECK (status IN ('draft','submitted','committee_approved','rejected','published')) DEFAULT 'draft',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add published status if table already exists
ALTER TABLE annual_plans
  DROP CONSTRAINT IF EXISTS annual_plans_status_check;

ALTER TABLE annual_plans
  ADD CONSTRAINT annual_plans_status_check
    CHECK (status IN ('draft','submitted','committee_approved','rejected','published'));
