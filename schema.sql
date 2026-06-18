-- ─────────────────────────────────────────────────────────────────────────────
-- Nexis — Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Entries: the core knowledge units
CREATE TABLE IF NOT EXISTS entries (
    id          BIGSERIAL PRIMARY KEY,
    title       TEXT NOT NULL,
    content     TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Contexts: named categories/tags
CREATE TABLE IF NOT EXISTS contexts (
    id          BIGSERIAL PRIMARY KEY,
    name        TEXT NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Entry ↔ Context (many-to-many)
CREATE TABLE IF NOT EXISTS entry_contexts (
    id          BIGSERIAL PRIMARY KEY,
    entry_id    BIGINT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    context_id  BIGINT NOT NULL REFERENCES contexts(id) ON DELETE CASCADE,
    UNIQUE(entry_id, context_id)
);

-- Relations between entries
CREATE TABLE IF NOT EXISTS entry_relations (
    id               BIGSERIAL PRIMARY KEY,
    source_entry_id  BIGINT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    target_entry_id  BIGINT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    relation_type    TEXT NOT NULL DEFAULT 'related',
    UNIQUE(source_entry_id, target_entry_id, relation_type)
);

-- Version history snapshots
CREATE TABLE IF NOT EXISTS entry_versions (
    id             BIGSERIAL PRIMARY KEY,
    entry_id       BIGINT NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
    title          TEXT NOT NULL,
    content        TEXT NOT NULL,
    version_number INT NOT NULL,
    created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Indexes for performance
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_entry_contexts_entry    ON entry_contexts(entry_id);
CREATE INDEX IF NOT EXISTS idx_entry_contexts_context  ON entry_contexts(context_id);
CREATE INDEX IF NOT EXISTS idx_relations_source        ON entry_relations(source_entry_id);
CREATE INDEX IF NOT EXISTS idx_relations_target        ON entry_relations(target_entry_id);
CREATE INDEX IF NOT EXISTS idx_versions_entry          ON entry_versions(entry_id);
CREATE INDEX IF NOT EXISTS idx_entries_updated         ON entries(updated_at DESC);

-- ─────────────────────────────────────────────────────────────────────────────
-- Row Level Security — enable public read/write via anon key
-- Adjust these policies to add auth if you add Supabase Auth later.
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE entries         ENABLE ROW LEVEL SECURITY;
ALTER TABLE contexts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_contexts  ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_relations ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_versions  ENABLE ROW LEVEL SECURITY;

-- Allow all operations for now (open access via anon key)
CREATE POLICY "allow_all_entries"         ON entries         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_contexts"        ON contexts        FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_entry_contexts"  ON entry_contexts  FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_relations"       ON entry_relations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_versions"        ON entry_versions  FOR ALL USING (true) WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- Auto-update updated_at on entries
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER entries_updated_at
    BEFORE UPDATE ON entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();
