// =============================================================================
// Smart Rental Equipment Intelligence Platform
// Database Schema Types — mirrors the ER diagram exactly
// =============================================================================

// ─── Core Lookup Tables ──────────────────────────────────────────────────────

export interface Role {
  role_id: number;
  name: string; // Admin, Manager, Operator, Customer
}

export interface Status {
  status_id: number;
  name: string;
}

export interface StatusGroup {
  group_id: number;
  group_name: string;
  status_ids: number[];
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
  user_id: number;
  username: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  last_login: string;
  role_id: number;
  status_id: number;
  is_active: boolean;
  created_at: string;
  edited_on: string;
}

// ─── Equipment ───────────────────────────────────────────────────────────────

export interface Equipment {
  equipment_id: string;
  name: string;
  health: number;            // 0–100
  fuel_type: string;         // Diesel | Electric | Hybrid | Gasoline
  status_id: number;
  latitude: number;
  longitude: number;
  last_maintenance_on: string;
}

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  customer_id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
}

// ─── Site ────────────────────────────────────────────────────────────────────

export interface Site {
  site_id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  status_id: number;
}

// ─── Operator ────────────────────────────────────────────────────────────────

export interface Operator {
  operator_id: string;
  operator_name: string;
  phone: string;
  license_no: string;
  validity: string;          // license validity date
}

// ─── Rentals ─────────────────────────────────────────────────────────────────

export interface Rental {
  rental_id: string;
  customer_id: number;
  site_id: string;
  equipment_id: string;
  due_on: string;
  rent_status: string;       // Active | Completed | Overdue | Cancelled | Reserved
  status_id: number;
  rental_days: number;
}

// ─── UsageRealtime ───────────────────────────────────────────────────────────

export interface UsageRealtime {
  equipment_id: string;
  operator_id: string;
  status_id: number;
  latitude: number;
  longitude: number;
  fuel_gauge: number;        // 0–100%
}

// ─── Alerts ──────────────────────────────────────────────────────────────────

export interface Alert {
  alert_id: number;
  rental_id: string | null;
  equipment_id: string;
  status_id: number;
  alert_type: string;
  message: string;
}

// =============================================================================
// Extended Frontend Types (computed / joined for UI display)
// =============================================================================

export interface EquipmentWithDetails extends Equipment {
  status_name?: string;
  current_site?: Site;
  active_rental?: Rental;
  current_operator?: Operator;
  current_customer?: Customer;
  usage_realtime?: UsageRealtime;
  active_alerts_count?: number;
  fuel_level?: number;
  ai_failure_risk?: number;
  demand_score?: number;
  maintenance_status?: string;
  equipment_type?: string;     // derived from name
  manufacturer?: string;       // derived from name
  image_url?: string;
}

export interface DashboardKPIs {
  total_equipment: number;
  running_equipment: number;
  idle_equipment: number;
  utilization_percent: number;
  engine_hours_today: number;
  fuel_consumption_today: number;
  critical_alerts: number;
  maintenance_due: number;
  unauthorized_movement: number;
  overdue_rentals: number;
  weather_warnings: number;
  predicted_demand: number;
  expected_rentals: number;
  anomaly_count: number;
  failure_risk_score: number;
  monthly_revenue: number;
  rental_revenue: number;
  equipment_roi: number;
}

export interface LiveEvent {
  id: string;
  type: 'equipment_assigned' | 'gps_updated' | 'maintenance_scheduled' | 'fuel_warning' | 'anomaly_detected' | 'rental_completed' | 'alert_generated' | 'check_in' | 'check_out';
  equipment_id: string;
  equipment_name: string;
  message: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'critical' | 'success';
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface AIInsightMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  reasoning?: string;
  related_equipment?: string[];
  suggested_actions?: string[];
  chart_data?: ChartDataPoint[];
  timestamp: string;
}

export interface ReportConfig {
  type: 'daily' | 'weekly' | 'monthly';
  category: 'equipment' | 'rental' | 'maintenance' | 'forecast' | 'revenue';
  format: 'pdf' | 'excel' | 'csv';
  date_range: { start: string; end: string };
}

export interface AuthUser {
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  status: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me: boolean;
}
