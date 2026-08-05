-- Reference data: Status/StatusGroups per entity type, Role, and seed Users.
--
-- Design note: each entity-context gets its own Status row (e.g. "Active" for
-- Equipment is a different status_id than "Active" for Rentals) so that an
-- entity's status_id FK always resolves to a value valid for that entity,
-- without joining through status_groups just to filter. status_groups then
-- records which group (entity type) each status belongs to and its display
-- order_no for dropdowns/status pipelines in the UI.

-- Group 1: Equipment statuses
INSERT INTO status (name) VALUES ('Active'), ('Idle'), ('In Maintenance'), ('Overdue'); -- 1..4
INSERT INTO status_groups (status_id, order_no, is_active) VALUES
  (1, 1, TRUE), (2, 2, TRUE), (3, 3, TRUE), (4, 4, TRUE);

-- Group 2: Rental statuses
INSERT INTO status (name) VALUES ('Active'), ('Completed'), ('Overdue'), ('Extended'); -- 5..8
INSERT INTO status_groups (status_id, order_no, is_active) VALUES
  (5, 1, TRUE), (6, 2, TRUE), (7, 3, TRUE), (8, 4, TRUE);

-- Group 3: Alert statuses
INSERT INTO status (name) VALUES ('Open'), ('Acknowledged'), ('Resolved'); -- 9..11
INSERT INTO status_groups (status_id, order_no, is_active) VALUES
  (9, 1, TRUE), (10, 2, TRUE), (11, 3, TRUE);

-- Group 4: User statuses
INSERT INTO status (name) VALUES ('Active'), ('Suspended'); -- 12..13
INSERT INTO status_groups (status_id, order_no, is_active) VALUES
  (12, 1, TRUE), (13, 2, TRUE);

-- Group 5: Site statuses
INSERT INTO status (name) VALUES ('Active'), ('Inactive'); -- 14..15
INSERT INTO status_groups (status_id, order_no, is_active) VALUES
  (14, 1, TRUE), (15, 2, TRUE);

-- Roles (fixed five personas)
INSERT INTO role (name) VALUES
  ('System Admin'),        -- 1
  ('Site Manager'),        -- 2
  ('Rental Operator'),     -- 3
  ('Company Management'),  -- 4
  ('Maintenance Team');    -- 5

-- Seed users, one per role. Password for all seed accounts is "Password123!"
-- (bcrypt hash below) — change in any non-local environment.
INSERT INTO users (username, password, first_name, last_name, email, phone, status_id, role_id, is_active) VALUES
  ('admin',      '$2b$10$c9r3K8SWtcuBrsYUHMzy/uM3Du3ZmxkUhJf6Aw673ojWrlKUH0AYi', 'Alex',   'Admin',     'admin@catrental.test',     '555-0100', 12, 1, TRUE),
  ('sitemgr',    '$2b$10$c9r3K8SWtcuBrsYUHMzy/uM3Du3ZmxkUhJf6Aw673ojWrlKUH0AYi', 'Sam',    'Sitemgr',   'sitemgr@catrental.test',   '555-0101', 12, 2, TRUE),
  ('operator',   '$2b$10$c9r3K8SWtcuBrsYUHMzy/uM3Du3ZmxkUhJf6Aw673ojWrlKUH0AYi', 'Ryan',   'Operator',  'operator@catrental.test',  '555-0102', 12, 3, TRUE),
  ('management', '$2b$10$c9r3K8SWtcuBrsYUHMzy/uM3Du3ZmxkUhJf6Aw673ojWrlKUH0AYi', 'Casey',  'Mgmt',      'management@catrental.test','555-0103', 12, 4, TRUE),
  ('maintenance','$2b$10$c9r3K8SWtcuBrsYUHMzy/uM3Du3ZmxkUhJf6Aw673ojWrlKUH0AYi', 'Morgan', 'Maint',     'maintenance@catrental.test','555-0104', 12, 5, TRUE);
