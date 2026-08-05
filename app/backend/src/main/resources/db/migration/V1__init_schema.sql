-- Smart Rental Tracking System — core schema
-- Matches the spec field-for-field. usage_history is the one addition (append-only
-- log; usage_realtime stays a live-snapshot table with no time series of its own).

CREATE TABLE status (
    status_id   SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL
);

CREATE TABLE status_groups (
    group_id    SERIAL PRIMARY KEY,
    status_id   INT NOT NULL REFERENCES status(status_id),
    order_no    INT NOT NULL,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_on  TIMESTAMP NOT NULL DEFAULT now(),
    edited_on   TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_status_groups_status_id ON status_groups(status_id);

CREATE TABLE role (
    role_id     SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL
);

CREATE TABLE users (
    user_id     SERIAL PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    first_name  VARCHAR(100),
    last_name   VARCHAR(100),
    email       VARCHAR(150),
    phone       VARCHAR(20),
    last_login  TIMESTAMP,
    status_id   INT REFERENCES status(status_id),
    role_id     INT REFERENCES role(role_id),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP NOT NULL DEFAULT now(),
    edited_on   TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_status_id ON users(status_id);

CREATE TABLE customer (
    customer_id     SERIAL PRIMARY KEY,
    name            VARCHAR(150),
    contact_person  VARCHAR(150),
    phone           VARCHAR(20),
    email           VARCHAR(150),
    address         TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMP NOT NULL DEFAULT now(),
    edited_on       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE site (
    site_id     SERIAL PRIMARY KEY,
    name        VARCHAR(150),
    address     TEXT,
    latitude    DECIMAL(10,7),
    longitude   DECIMAL(10,7),
    status_id   INT REFERENCES status(status_id),
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_on  TIMESTAMP NOT NULL DEFAULT now(),
    edited_on   TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_site_status_id ON site(status_id);

CREATE TABLE equipment (
    equipment_id        SERIAL PRIMARY KEY,
    name                VARCHAR(150),
    health              DECIMAL(5,2),
    fuel_type           VARCHAR(50),
    status_id           INT REFERENCES status(status_id),
    last_maintenance_on DATE,
    latitude            DECIMAL(10,7),
    longitude           DECIMAL(10,7),
    is_active           BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMP NOT NULL DEFAULT now(),
    edited_on           TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_equipment_status_id ON equipment(status_id);

CREATE TABLE operator (
    operator_id     SERIAL PRIMARY KEY,
    operator_name   VARCHAR(150),
    phone           VARCHAR(20),
    license_number  VARCHAR(100),
    license_validity DATE,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_on      TIMESTAMP NOT NULL DEFAULT now(),
    edited_on       TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE rentals (
    rental_id       SERIAL PRIMARY KEY,
    customer_id     INT REFERENCES customer(customer_id),
    site_id         INT REFERENCES site(site_id),
    equipment_id    INT REFERENCES equipment(equipment_id),
    due_on          DATE,
    rent_status     VARCHAR(50),
    status_id       INT REFERENCES status(status_id),
    rental_days     INT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_on      TIMESTAMP NOT NULL DEFAULT now(),
    edited_on       TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_rentals_customer_id ON rentals(customer_id);
CREATE INDEX idx_rentals_site_id ON rentals(site_id);
CREATE INDEX idx_rentals_equipment_id ON rentals(equipment_id);
CREATE INDEX idx_rentals_status_id ON rentals(status_id);
CREATE INDEX idx_rentals_due_on ON rentals(due_on);

-- Live snapshot: one row per equipment, overwritten on every telemetry event.
CREATE TABLE usage_realtime (
    equipment_id    INT PRIMARY KEY REFERENCES equipment(equipment_id),
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    operator_id     INT REFERENCES operator(operator_id),
    status_id       INT REFERENCES status(status_id),
    fuel_gauge      DECIMAL(5,2)
);

CREATE TABLE alerts (
    alert_id        SERIAL PRIMARY KEY,
    equipment_id    INT REFERENCES equipment(equipment_id),
    rental_id       INT REFERENCES rentals(rental_id),
    alert_type      VARCHAR(100),
    status_id       INT REFERENCES status(status_id),
    message         TEXT,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_on      TIMESTAMP NOT NULL DEFAULT now(),
    edited_on       TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_alerts_equipment_id ON alerts(equipment_id);
CREATE INDEX idx_alerts_rental_id ON alerts(rental_id);
CREATE INDEX idx_alerts_status_id ON alerts(status_id);

-- Added table (not in the original dbdiagram schema): append-only telemetry log.
-- usage_realtime has no time series, so forecasting/anomaly detection reads this instead.
CREATE TABLE usage_history (
    history_id      BIGSERIAL PRIMARY KEY,
    equipment_id    INT NOT NULL REFERENCES equipment(equipment_id),
    recorded_at     TIMESTAMP NOT NULL DEFAULT now(),
    latitude        DECIMAL(10,7),
    longitude       DECIMAL(10,7),
    operator_id     INT REFERENCES operator(operator_id),
    status_id       INT REFERENCES status(status_id),
    fuel_gauge      DECIMAL(5,2)
);
CREATE INDEX idx_usage_history_equipment_recorded ON usage_history(equipment_id, recorded_at);
