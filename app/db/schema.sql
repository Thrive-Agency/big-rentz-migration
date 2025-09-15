-- Schema for Records, Import Errors, and Skipped Orders

CREATE TABLE IF NOT EXISTS records (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    imported BOOLEAN DEFAULT FALSE,
    imported_id INTEGER,
    processing_started TIMESTAMP,
    processing_complete TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_records_imported ON records(imported);
CREATE INDEX IF NOT EXISTS idx_records_processing_started ON records(processing_started);

CREATE TABLE IF NOT EXISTS import_errors (
    id SERIAL PRIMARY KEY,
    record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
    error_messages JSONB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved BOOLEAN DEFAULT FALSE,
    imported BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_import_errors_record_id ON import_errors(record_id);
CREATE INDEX IF NOT EXISTS idx_import_errors_resolved ON import_errors(resolved);

CREATE TABLE IF NOT EXISTS skipped_orders (
    id SERIAL PRIMARY KEY,
    record_id INTEGER REFERENCES records(id) ON DELETE CASCADE,
    skip_reason TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_skipped_orders_record_id ON skipped_orders(record_id);
