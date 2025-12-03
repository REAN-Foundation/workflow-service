-- Migration: Add RoutingPrompt column to schema table
-- Date: 2025-01-03
-- Description: Adds an optional RoutingPrompt text field to store schema routing characteristics
-- This migration can be run without downtime (non-breaking change)

-- For MySQL
-- Uncomment the following if using MySQL:
-- ALTER TABLE `schema`
-- ADD COLUMN `RoutingPrompt` TEXT NULL AFTER `ContextParams`;

-- For PostgreSQL
-- Uncomment the following if using PostgreSQL:
-- ALTER TABLE "schema"
-- ADD COLUMN "RoutingPrompt" TEXT NULL;

-- Rollback (if needed):
-- For MySQL:
-- ALTER TABLE `schema` DROP COLUMN `RoutingPrompt`;

-- For PostgreSQL:
-- ALTER TABLE "schema" DROP COLUMN "RoutingPrompt";

-- Verification Query (works for both MySQL and PostgreSQL):
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'schema' AND column_name = 'RoutingPrompt';
