-- Migration: 0004_onboarding_wizard
-- Adds onboarding_completed flag to parents table

ALTER TABLE parents ADD COLUMN onboarding_completed INTEGER NOT NULL DEFAULT 0;
