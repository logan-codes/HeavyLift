package com.catrental.constants;

/** status_id values from V2__seed_reference_data.sql. Kept in one place to avoid magic numbers. */
public final class StatusConstants {

    private StatusConstants() {
    }

    // Group 1: Equipment
    public static final int EQUIPMENT_ACTIVE = 1;
    public static final int EQUIPMENT_IDLE = 2;
    public static final int EQUIPMENT_IN_MAINTENANCE = 3;
    public static final int EQUIPMENT_OVERDUE = 4;

    // Group 2: Rentals
    public static final int RENTAL_ACTIVE = 5;
    public static final int RENTAL_COMPLETED = 6;
    public static final int RENTAL_OVERDUE = 7;
    public static final int RENTAL_EXTENDED = 8;

    // Group 3: Alerts
    public static final int ALERT_OPEN = 9;
    public static final int ALERT_ACKNOWLEDGED = 10;
    public static final int ALERT_RESOLVED = 11;

    // Group 4: Users
    public static final int USER_ACTIVE = 12;
    public static final int USER_SUSPENDED = 13;

    // Group 5: Sites
    public static final int SITE_ACTIVE = 14;
    public static final int SITE_INACTIVE = 15;
}
