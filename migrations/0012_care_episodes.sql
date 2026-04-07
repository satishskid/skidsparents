-- Care Continuity Engine — Episode Tracking
-- Every parent observation creates a care episode that tracks its full lifecycle:
-- observation → routing → parent guidance → ped alert → resolution → follow-up
-- This is the "twin record" — one row, two lenses (parent vs doctor).

CREATE TABLE IF NOT EXISTS care_episodes (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  child_id TEXT NOT NULL REFERENCES children(id) ON DELETE CASCADE,
  parent_id TEXT NOT NULL REFERENCES parents(id),
  doctor_id TEXT,  -- assigned pediatrician (nullable — auto-detected or manual)

  -- What the parent said
  observation_text TEXT NOT NULL,
  observation_structured TEXT DEFAULT '{}',  -- JSON: domains, keywords, structured answers

  -- Care pathway routing (system recommends, parent confirms)
  pathway TEXT NOT NULL DEFAULT '1_observe',  -- 1_observe, 2_ped_initiated, 3_econsult, 4_tele, 5_inperson
  status TEXT NOT NULL DEFAULT 'open',        -- open, awaiting_ped, ped_reviewing, resolved, escalated

  -- What the parent saw (stored for doctor's reference)
  parent_summary_shown TEXT,     -- the warm, conversational summary
  parent_guidance_shown TEXT,    -- home activities, watch-list, next steps

  -- Pediatrician alert & response
  ped_alert_level TEXT DEFAULT 'none',  -- none, info, review, urgent, emergency
  ped_response_text TEXT,               -- doctor's text response (e-consult)
  ped_response_at TEXT,                 -- when doctor responded

  -- Linked booking (if tele/in-person pathway)
  linked_order_id TEXT REFERENCES service_orders(id),

  -- Escalation chain
  escalated_from_episode_id TEXT REFERENCES care_episodes(id),

  -- Full projection snapshot (replay + audit)
  projection_snapshot TEXT DEFAULT '{}',  -- JSON: full ProjectionResult

  -- Follow-up loop
  follow_up_at TEXT,       -- when to check in with parent
  follow_up_sent INTEGER DEFAULT 0,  -- 0/1: has follow-up been sent

  -- Resolution
  resolved_at TEXT,
  resolution_note TEXT,
  resolved_by TEXT,  -- 'parent', 'doctor', 'system', 'escalated'

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_care_episodes_child ON care_episodes(child_id);
CREATE INDEX IF NOT EXISTS idx_care_episodes_parent ON care_episodes(parent_id);
CREATE INDEX IF NOT EXISTS idx_care_episodes_doctor ON care_episodes(doctor_id);
CREATE INDEX IF NOT EXISTS idx_care_episodes_status ON care_episodes(status);
CREATE INDEX IF NOT EXISTS idx_care_episodes_pathway ON care_episodes(pathway);
CREATE INDEX IF NOT EXISTS idx_care_episodes_alert ON care_episodes(ped_alert_level);
CREATE INDEX IF NOT EXISTS idx_care_episodes_followup ON care_episodes(follow_up_at, follow_up_sent);
CREATE INDEX IF NOT EXISTS idx_care_episodes_created ON care_episodes(created_at);
