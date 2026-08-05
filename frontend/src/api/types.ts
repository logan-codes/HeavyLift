export interface EquipmentSummary {
  equipmentId: number;
  name: string;
  health: number | null;
  fuelType: string | null;
  statusName: string | null;
  lastMaintenanceOn: string | null;
  latitude: number | null;
  longitude: number | null;
  fuelGauge: number | null;
  operatorName: string | null;
}

export interface RentalDto {
  rentalId: number;
  equipmentId: number;
  equipmentName: string;
  customerId: number;
  customerName: string;
  siteId: number;
  siteName: string;
  dueOn: string;
  rentStatus: string;
  statusId: number;
  statusName: string;
  rentalDays: number;
  isActive: boolean;
  createdOn: string;
  editedOn: string;
}

export interface AlertDto {
  alertId: number;
  equipmentId: number | null;
  equipmentName: string | null;
  rentalId: number | null;
  siteId: number | null;
  siteName: string | null;
  alertType: string;
  statusId: number | null;
  statusName: string | null;
  message: string | null;
  isActive: boolean;
  createdOn: string;
  editedOn: string;
}

export interface AlertSummary {
  totalOpen: number;
  openByType: Record<string, number>;
}

export interface UsageHistoryPoint {
  recordedAt: string;
  latitude: number | null;
  longitude: number | null;
  statusName: string | null;
  fuelGauge: number | null;
  health: number | null;
  operatorName: string | null;
}

export interface EquipmentDetail {
  equipment: EquipmentSummary;
  currentRental: RentalDto | null;
  openAlerts: AlertDto[];
  recentHistory: UsageHistoryPoint[];
}

export interface Site {
  siteId: number;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  statusId: number | null;
  statusName: string | null;
  isActive: boolean;
}

export interface Customer {
  customerId: number;
  name: string;
  contactPerson: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
}

export interface Operator {
  operatorId: number;
  operatorName: string;
  phone: string | null;
  licenseNumber: string | null;
  licenseValidity: string | null;
  isActive: boolean;
}

export interface AppUser {
  userId: number;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  roleName: string | null;
  statusName: string | null;
  isActive: boolean;
}

export interface AiResult<T> {
  available: boolean;
  data: T | null;
  error: string | null;
}

export interface UtilizationResponse {
  equipmentId: number;
  windowDays: number;
  sampleCount: number;
  activeHours: number;
  idleHours: number;
  otherHours: number;
  utilizationPct: number | null;
  underUsed: boolean | null;
}

export interface AnomalyItem {
  recordedAt: string;
  anomalyType: string;
  detail: string;
  severity: string;
}

export interface AnomalyResponse {
  equipmentId: number;
  sampleCount: number;
  anomalies: AnomalyItem[];
}

export interface WeekCount {
  weekStart: string;
  count: number;
}

export interface CategoryForecast {
  category: string;
  history: WeekCount[];
  forecast: WeekCount[];
}

export interface ForecastResponse {
  siteId: number | null;
  weeksHistory: number;
  weeksAhead: number;
  categories: CategoryForecast[];
}

export interface PredictReturnResponse {
  rentalId: number;
  customerId: number;
  customerName: string;
  dueOn: string;
  probabilityOverrun: number;
  riskLevel: string;
  sampleSize: number;
  basedOn: string;
}
