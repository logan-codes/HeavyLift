import type {
  Role, Status, User, Customer, Site, Equipment, Operator,
  Rental, UsageRealtime, Alert,
  EquipmentWithDetails, DashboardKPIs, LiveEvent,
} from '../types/database'

// =============================================================================
// Status Lookup (centralized — used by all entities)
// =============================================================================
export const mockStatuses: Status[] = [
  { status_id: 1, name: 'Active' },
  { status_id: 2, name: 'Inactive' },
  { status_id: 3, name: 'Available' },
  { status_id: 4, name: 'Rented' },
  { status_id: 5, name: 'Maintenance' },
  { status_id: 6, name: 'Transit' },
  { status_id: 7, name: 'Decommissioned' },
  { status_id: 8, name: 'Completed' },
  { status_id: 9, name: 'Overdue' },
  { status_id: 10, name: 'Cancelled' },
  { status_id: 11, name: 'Reserved' },
  { status_id: 12, name: 'Critical' },
  { status_id: 13, name: 'Acknowledged' },
  { status_id: 14, name: 'Resolved' },
  { status_id: 15, name: 'Idle' },
  { status_id: 16, name: 'Running' },
  { status_id: 17, name: 'Offline' },
]

export function getStatusName(id: number): string {
  return mockStatuses.find(s => s.status_id === id)?.name ?? 'Unknown'
}

// =============================================================================
// Roles
// =============================================================================
export const mockRoles: Role[] = [
  { role_id: 1, name: 'Admin' },
  { role_id: 2, name: 'Manager' },
  { role_id: 3, name: 'Operator' },
  { role_id: 4, name: 'Customer' },
]

// =============================================================================
// Users
// =============================================================================
export const mockUsers: User[] = [
  { user_id: 1, username: 'jmorrison', password: 'hashed', first_name: 'James', last_name: 'Morrison', email: 'admin@caterpillar.com', phone: '+1-555-0101', last_login: '2026-08-05T08:00:00Z', role_id: 1, status_id: 1, is_active: true, created_at: '2024-01-15T10:00:00Z', edited_on: '2026-08-05T08:00:00Z' },
  { user_id: 2, username: 'schen', password: 'hashed', first_name: 'Sarah', last_name: 'Chen', email: 'sarah.chen@caterpillar.com', phone: '+1-555-0102', last_login: '2026-08-05T07:30:00Z', role_id: 2, status_id: 1, is_active: true, created_at: '2024-03-10T10:00:00Z', edited_on: '2026-08-05T07:30:00Z' },
  { user_id: 3, username: 'mrodriguez', password: 'hashed', first_name: 'Mike', last_name: 'Rodriguez', email: 'mike.r@caterpillar.com', phone: '+1-555-0103', last_login: '2026-08-05T06:00:00Z', role_id: 3, status_id: 1, is_active: true, created_at: '2024-06-01T10:00:00Z', edited_on: '2026-08-05T06:00:00Z' },
  { user_id: 4, username: 'ewatson', password: 'hashed', first_name: 'Emily', last_name: 'Watson', email: 'emily.w@caterpillar.com', phone: '+1-555-0104', last_login: '2026-08-04T16:00:00Z', role_id: 2, status_id: 1, is_active: true, created_at: '2024-07-20T10:00:00Z', edited_on: '2026-08-04T16:00:00Z' },
  { user_id: 5, username: 'dpark', password: 'hashed', first_name: 'David', last_name: 'Park', email: 'david.p@buildcorp.com', phone: '+1-555-0105', last_login: '2026-08-03T14:00:00Z', role_id: 4, status_id: 1, is_active: true, created_at: '2025-01-10T10:00:00Z', edited_on: '2026-08-03T14:00:00Z' },
]

// =============================================================================
// Customers
// =============================================================================
export const mockCustomers: Customer[] = [
  { customer_id: 1, name: 'BuildCorp Industries', contact: 'David Park', phone: '+1-555-1001', email: 'david@buildcorp.com', address: '1200 Construction Ave, Houston, TX' },
  { customer_id: 2, name: 'Metro Infrastructure LLC', contact: 'Lisa Chang', phone: '+1-555-1002', email: 'lisa@metroinfra.com', address: '340 Metro Blvd, Dallas, TX' },
  { customer_id: 3, name: 'Summit Mining Corp', contact: 'Robert Hayes', phone: '+1-555-1003', email: 'robert@summitmining.com', address: '800 Mountain Rd, Denver, CO' },
  { customer_id: 4, name: 'Pacific Developers', contact: 'Yuki Tanaka', phone: '+1-555-1004', email: 'yuki@pacificdev.com', address: '1500 Ocean Drive, San Francisco, CA' },
  { customer_id: 5, name: 'Highway Solutions Inc', contact: 'Mark Davis', phone: '+1-555-1005', email: 'mark@highwaysol.com', address: '600 Interstate St, Phoenix, AZ' },
  { customer_id: 6, name: 'GreenBuild Contractors', contact: 'Anna Kowalski', phone: '+1-555-1006', email: 'anna@greenbuild.com', address: '250 Eco Lane, Portland, OR' },
]

// =============================================================================
// Sites
// =============================================================================
export const mockSites: Site[] = [
  { site_id: 'S001', name: 'Downtown Tower Project', address: 'Houston, TX', latitude: 29.7604, longitude: -95.3698, status_id: 1 },
  { site_id: 'S002', name: 'Westside Mall Expansion', address: 'Houston, TX', latitude: 29.7355, longitude: -95.4176, status_id: 1 },
  { site_id: 'S003', name: 'Metro Line Extension', address: 'Dallas, TX', latitude: 32.7767, longitude: -96.7970, status_id: 1 },
  { site_id: 'S004', name: 'Bridge Reconstruction', address: 'Fort Worth, TX', latitude: 32.7555, longitude: -97.3308, status_id: 1 },
  { site_id: 'S005', name: 'Gold Ridge Mine', address: 'Denver, CO', latitude: 39.7392, longitude: -104.9903, status_id: 1 },
  { site_id: 'S006', name: 'Silver Creek Quarry', address: 'Boulder, CO', latitude: 40.0150, longitude: -105.2705, status_id: 1 },
  { site_id: 'S007', name: 'Bay Area Tech Campus', address: 'San Francisco, CA', latitude: 37.7749, longitude: -122.4194, status_id: 1 },
  { site_id: 'S008', name: 'I-10 Highway Widening', address: 'Phoenix, AZ', latitude: 33.4484, longitude: -112.0740, status_id: 1 },
  { site_id: 'S009', name: 'Airport Terminal B', address: 'Phoenix, AZ', latitude: 33.4373, longitude: -112.0078, status_id: 1 },
  { site_id: 'S010', name: 'Eco Park Development', address: 'Portland, OR', latitude: 45.5152, longitude: -122.6784, status_id: 8 },
]

// =============================================================================
// Equipment (30 units across 12 categories)
// =============================================================================
export const mockEquipment: Equipment[] = [
  { equipment_id: 'EQ-001', name: 'CAT 320F Excavator', health: 87, fuel_type: 'Diesel', status_id: 4, latitude: 29.7604, longitude: -95.3698, last_maintenance_on: '2026-07-15' },
  { equipment_id: 'EQ-002', name: 'Komatsu PC210 Excavator', health: 72, fuel_type: 'Diesel', status_id: 4, latitude: 32.7767, longitude: -96.7970, last_maintenance_on: '2026-06-20' },
  { equipment_id: 'EQ-003', name: 'CAT D6T Bulldozer', health: 58, fuel_type: 'Diesel', status_id: 4, latitude: 39.7392, longitude: -104.9903, last_maintenance_on: '2026-06-20' },
  { equipment_id: 'EQ-004', name: 'Volvo L120H Wheel Loader', health: 93, fuel_type: 'Diesel', status_id: 4, latitude: 29.7610, longitude: -95.3685, last_maintenance_on: '2026-07-28' },
  { equipment_id: 'EQ-005', name: 'CAT 745 Dump Truck', health: 81, fuel_type: 'Diesel', status_id: 4, latitude: 40.0150, longitude: -105.2705, last_maintenance_on: '2026-07-10' },
  { equipment_id: 'EQ-006', name: 'Hamm HD+ 110 Roller', health: 45, fuel_type: 'Diesel', status_id: 4, latitude: 33.4484, longitude: -112.0740, last_maintenance_on: '2026-06-01' },
  { equipment_id: 'EQ-007', name: 'Liebherr LTM 1100 Crane', health: 76, fuel_type: 'Diesel', status_id: 4, latitude: 37.7749, longitude: -122.4194, last_maintenance_on: '2026-07-30' },
  { equipment_id: 'EQ-008', name: 'Toyota 8FGU25 Forklift', health: 91, fuel_type: 'Gasoline', status_id: 4, latitude: 29.7355, longitude: -95.4176, last_maintenance_on: '2026-08-01' },
  { equipment_id: 'EQ-009', name: 'CAT C15 Generator', health: 84, fuel_type: 'Diesel', status_id: 4, latitude: 32.7780, longitude: -96.7960, last_maintenance_on: '2026-07-05' },
  { equipment_id: 'EQ-010', name: 'Atlas Copco XAS 188 Compressor', health: 89, fuel_type: 'Diesel', status_id: 4, latitude: 32.7555, longitude: -97.3308, last_maintenance_on: '2026-07-18' },
  { equipment_id: 'EQ-011', name: 'Kenworth T880 Water Tanker', health: 68, fuel_type: 'Diesel', status_id: 4, latitude: 39.7400, longitude: -104.9910, last_maintenance_on: '2026-07-25' },
  { equipment_id: 'EQ-012', name: 'Putzmeister BSF 36 Concrete Mixer', health: 90, fuel_type: 'Diesel', status_id: 4, latitude: 29.7612, longitude: -95.3692, last_maintenance_on: '2026-07-28' },
  { equipment_id: 'EQ-013', name: 'Wacker Neuson LTN 6L Light Tower', health: 95, fuel_type: 'Diesel', status_id: 4, latitude: 33.4373, longitude: -112.0078, last_maintenance_on: '2026-08-01' },
  { equipment_id: 'EQ-014', name: 'Hitachi ZX350LC Excavator', health: 79, fuel_type: 'Diesel', status_id: 3, latitude: 29.7500, longitude: -95.3600, last_maintenance_on: '2026-07-20' },
  { equipment_id: 'EQ-015', name: 'John Deere 850K Bulldozer', health: 32, fuel_type: 'Diesel', status_id: 5, latitude: 29.7500, longitude: -95.3600, last_maintenance_on: '2026-08-03' },
  { equipment_id: 'EQ-016', name: 'Komatsu WA380 Wheel Loader', health: 85, fuel_type: 'Diesel', status_id: 3, latitude: 29.7500, longitude: -95.3600, last_maintenance_on: '2026-07-15' },
  { equipment_id: 'EQ-017', name: 'Volvo A40G Dump Truck', health: 74, fuel_type: 'Diesel', status_id: 4, latitude: 40.0155, longitude: -105.2710, last_maintenance_on: '2026-06-20' },
  { equipment_id: 'EQ-018', name: 'BOMAG BW 213 Roller', health: 96, fuel_type: 'Diesel', status_id: 3, latitude: 29.7500, longitude: -95.3600, last_maintenance_on: '2026-08-01' },
  { equipment_id: 'EQ-019', name: 'Tadano GR-1000XL Crane', health: 71, fuel_type: 'Diesel', status_id: 4, latitude: 29.7360, longitude: -95.4180, last_maintenance_on: '2026-07-30' },
  { equipment_id: 'EQ-020', name: 'Hyster H80FT Forklift', health: 88, fuel_type: 'Gasoline', status_id: 6, latitude: 33.9000, longitude: -114.9700, last_maintenance_on: '2026-07-25' },
  { equipment_id: 'EQ-021', name: 'CAT 336 Next Gen Excavator', health: 82, fuel_type: 'Diesel', status_id: 4, latitude: 33.4490, longitude: -112.0750, last_maintenance_on: '2026-07-22' },
  { equipment_id: 'EQ-022', name: 'CAT D8T Bulldozer', health: 78, fuel_type: 'Diesel', status_id: 4, latitude: 39.7395, longitude: -104.9908, last_maintenance_on: '2026-06-10' },
  { equipment_id: 'EQ-023', name: 'Doosan DL550-5 Wheel Loader', health: 35, fuel_type: 'Diesel', status_id: 5, latitude: 29.7500, longitude: -95.3600, last_maintenance_on: '2026-08-01' },
  { equipment_id: 'EQ-024', name: 'Bell B45E Dump Truck', health: 77, fuel_type: 'Diesel', status_id: 4, latitude: 32.7770, longitude: -96.7975, last_maintenance_on: '2026-07-08' },
  { equipment_id: 'EQ-025', name: 'Cummins C500D5 Generator', health: 92, fuel_type: 'Diesel', status_id: 4, latitude: 37.7755, longitude: -122.4200, last_maintenance_on: '2026-07-30' },
  { equipment_id: 'EQ-026', name: 'Ingersoll Rand P185 Compressor', health: 86, fuel_type: 'Diesel', status_id: 4, latitude: 33.4380, longitude: -112.0085, last_maintenance_on: '2026-07-15' },
  { equipment_id: 'EQ-027', name: 'Schwing SP 500 Concrete Mixer', health: 94, fuel_type: 'Diesel', status_id: 3, latitude: 29.7500, longitude: -95.3600, last_maintenance_on: '2026-07-10' },
  { equipment_id: 'EQ-028', name: 'Terex TL 80AS Light Tower', health: 97, fuel_type: 'Diesel', status_id: 4, latitude: 32.7560, longitude: -97.3315, last_maintenance_on: '2026-08-01' },
  { equipment_id: 'EQ-029', name: 'Peterbilt 567 Water Tanker', health: 62, fuel_type: 'Diesel', status_id: 4, latitude: 33.4488, longitude: -112.0745, last_maintenance_on: '2026-07-05' },
  { equipment_id: 'EQ-030', name: 'Kobelco SK500LC Excavator', health: 0, fuel_type: 'Diesel', status_id: 7, latitude: 29.7500, longitude: -95.3600, last_maintenance_on: '2026-01-15' },
]

// =============================================================================
// Operators
// =============================================================================
export const mockOperators: Operator[] = [
  { operator_id: 'OP-001', operator_name: 'Carlos Mendez', phone: '+1-555-2001', license_no: 'OL-TX-44521', validity: '2028-03-15' },
  { operator_id: 'OP-002', operator_name: 'James Wilson', phone: '+1-555-2002', license_no: 'OL-TX-44522', validity: '2027-11-20' },
  { operator_id: 'OP-003', operator_name: 'Tony Nguyen', phone: '+1-555-2003', license_no: 'OL-CO-33201', validity: '2028-06-01' },
  { operator_id: 'OP-004', operator_name: 'Ahmad Hassan', phone: '+1-555-2004', license_no: 'OL-TX-44524', validity: '2027-09-10' },
  { operator_id: 'OP-005', operator_name: 'Maria Santos', phone: '+1-555-2005', license_no: 'OL-CA-55105', validity: '2028-01-25' },
  { operator_id: 'OP-006', operator_name: 'Derek Thompson', phone: '+1-555-2006', license_no: 'OL-AZ-66206', validity: '2027-12-15' },
  { operator_id: 'OP-007', operator_name: 'Raj Patel', phone: '+1-555-2007', license_no: 'OL-CO-33207', validity: '2028-05-10' },
  { operator_id: 'OP-008', operator_name: "Kevin O'Brien", phone: '+1-555-2008', license_no: 'OL-TX-44528', validity: '2027-08-20' },
  { operator_id: 'OP-009', operator_name: 'Luis Garcia', phone: '+1-555-2009', license_no: 'OL-AZ-66209', validity: '2028-04-05' },
  { operator_id: 'OP-010', operator_name: 'Chen Wei', phone: '+1-555-2010', license_no: 'OL-CA-55110', validity: '2027-10-30' },
]

// =============================================================================
// Rentals
// =============================================================================
export const mockRentals: Rental[] = [
  { rental_id: 'RNT-001', customer_id: 1, site_id: 'S001', equipment_id: 'EQ-001', due_on: '2026-09-01', rent_status: 'Active', status_id: 1, rental_days: 62 },
  { rental_id: 'RNT-002', customer_id: 2, site_id: 'S003', equipment_id: 'EQ-002', due_on: '2026-08-30', rent_status: 'Active', status_id: 1, rental_days: 46 },
  { rental_id: 'RNT-003', customer_id: 3, site_id: 'S005', equipment_id: 'EQ-003', due_on: '2026-08-01', rent_status: 'Overdue', status_id: 9, rental_days: 61 },
  { rental_id: 'RNT-004', customer_id: 1, site_id: 'S001', equipment_id: 'EQ-004', due_on: '2026-09-15', rent_status: 'Active', status_id: 1, rental_days: 57 },
  { rental_id: 'RNT-005', customer_id: 3, site_id: 'S006', equipment_id: 'EQ-005', due_on: '2026-10-10', rent_status: 'Active', status_id: 1, rental_days: 92 },
  { rental_id: 'RNT-006', customer_id: 5, site_id: 'S008', equipment_id: 'EQ-006', due_on: '2026-08-25', rent_status: 'Active', status_id: 1, rental_days: 31 },
  { rental_id: 'RNT-007', customer_id: 4, site_id: 'S007', equipment_id: 'EQ-007', due_on: '2026-09-15', rent_status: 'Active', status_id: 1, rental_days: 92 },
  { rental_id: 'RNT-008', customer_id: 1, site_id: 'S002', equipment_id: 'EQ-008', due_on: '2026-08-31', rent_status: 'Active', status_id: 1, rental_days: 30 },
  { rental_id: 'RNT-009', customer_id: 2, site_id: 'S003', equipment_id: 'EQ-009', due_on: '2026-09-05', rent_status: 'Active', status_id: 1, rental_days: 62 },
  { rental_id: 'RNT-010', customer_id: 2, site_id: 'S004', equipment_id: 'EQ-010', due_on: '2026-08-18', rent_status: 'Active', status_id: 1, rental_days: 31 },
  { rental_id: 'RNT-011', customer_id: 3, site_id: 'S005', equipment_id: 'EQ-011', due_on: '2026-09-30', rent_status: 'Active', status_id: 1, rental_days: 91 },
  { rental_id: 'RNT-012', customer_id: 1, site_id: 'S001', equipment_id: 'EQ-012', due_on: '2026-08-28', rent_status: 'Active', status_id: 1, rental_days: 31 },
  { rental_id: 'RNT-013', customer_id: 3, site_id: 'S006', equipment_id: 'EQ-017', due_on: '2026-08-20', rent_status: 'Active', status_id: 1, rental_days: 61 },
  { rental_id: 'RNT-014', customer_id: 1, site_id: 'S002', equipment_id: 'EQ-019', due_on: '2026-10-12', rent_status: 'Active', status_id: 1, rental_days: 92 },
  { rental_id: 'RNT-015', customer_id: 5, site_id: 'S008', equipment_id: 'EQ-021', due_on: '2026-09-22', rent_status: 'Active', status_id: 1, rental_days: 62 },
  { rental_id: 'RNT-016', customer_id: 3, site_id: 'S005', equipment_id: 'EQ-022', due_on: '2026-07-31', rent_status: 'Completed', status_id: 8, rental_days: 50 },
  { rental_id: 'RNT-017', customer_id: 2, site_id: 'S003', equipment_id: 'EQ-024', due_on: '2026-09-08', rent_status: 'Active', status_id: 1, rental_days: 62 },
  { rental_id: 'RNT-018', customer_id: 4, site_id: 'S007', equipment_id: 'EQ-025', due_on: '2026-08-30', rent_status: 'Active', status_id: 1, rental_days: 31 },
  { rental_id: 'RNT-019', customer_id: 5, site_id: 'S009', equipment_id: 'EQ-026', due_on: '2026-08-15', rent_status: 'Active', status_id: 1, rental_days: 31 },
  { rental_id: 'RNT-020', customer_id: 5, site_id: 'S009', equipment_id: 'EQ-013', due_on: '2026-09-20', rent_status: 'Active', status_id: 1, rental_days: 62 },
  { rental_id: 'RNT-021', customer_id: 2, site_id: 'S004', equipment_id: 'EQ-028', due_on: '2026-09-01', rent_status: 'Active', status_id: 1, rental_days: 31 },
  { rental_id: 'RNT-022', customer_id: 5, site_id: 'S008', equipment_id: 'EQ-029', due_on: '2026-08-05', rent_status: 'Active', status_id: 1, rental_days: 31 },
]

// =============================================================================
// UsageRealtime (live telemetry snapshot per equipment)
// =============================================================================
export const mockUsageRealtime: UsageRealtime[] = [
  { equipment_id: 'EQ-001', operator_id: 'OP-001', status_id: 16, latitude: 29.7604, longitude: -95.3698, fuel_gauge: 72.5 },
  { equipment_id: 'EQ-002', operator_id: 'OP-002', status_id: 15, latitude: 32.7767, longitude: -96.7970, fuel_gauge: 45.3 },
  { equipment_id: 'EQ-003', operator_id: 'OP-003', status_id: 16, latitude: 39.7392, longitude: -104.9903, fuel_gauge: 28.1 },
  { equipment_id: 'EQ-004', operator_id: 'OP-004', status_id: 15, latitude: 29.7610, longitude: -95.3685, fuel_gauge: 88.2 },
  { equipment_id: 'EQ-005', operator_id: 'OP-003', status_id: 16, latitude: 40.0150, longitude: -105.2705, fuel_gauge: 55.6 },
  { equipment_id: 'EQ-006', operator_id: 'OP-006', status_id: 16, latitude: 33.4484, longitude: -112.0740, fuel_gauge: 63.4 },
  { equipment_id: 'EQ-007', operator_id: 'OP-005', status_id: 15, latitude: 37.7749, longitude: -122.4194, fuel_gauge: 41.2 },
  { equipment_id: 'EQ-008', operator_id: 'OP-008', status_id: 16, latitude: 29.7355, longitude: -95.4176, fuel_gauge: 78.9 },
  { equipment_id: 'EQ-009', operator_id: 'OP-002', status_id: 16, latitude: 32.7780, longitude: -96.7960, fuel_gauge: 52.1 },
  { equipment_id: 'EQ-010', operator_id: 'OP-004', status_id: 16, latitude: 32.7555, longitude: -97.3308, fuel_gauge: 67.8 },
  { equipment_id: 'EQ-011', operator_id: 'OP-007', status_id: 16, latitude: 39.7400, longitude: -104.9910, fuel_gauge: 34.5 },
  { equipment_id: 'EQ-012', operator_id: 'OP-001', status_id: 15, latitude: 29.7612, longitude: -95.3692, fuel_gauge: 59.3 },
  { equipment_id: 'EQ-013', operator_id: 'OP-006', status_id: 16, latitude: 33.4373, longitude: -112.0078, fuel_gauge: 81.2 },
  { equipment_id: 'EQ-017', operator_id: 'OP-009', status_id: 16, latitude: 40.0155, longitude: -105.2710, fuel_gauge: 38.7 },
  { equipment_id: 'EQ-019', operator_id: 'OP-008', status_id: 15, latitude: 29.7360, longitude: -95.4180, fuel_gauge: 47.6 },
  { equipment_id: 'EQ-021', operator_id: 'OP-006', status_id: 16, latitude: 33.4490, longitude: -112.0750, fuel_gauge: 61.3 },
  { equipment_id: 'EQ-022', operator_id: 'OP-003', status_id: 16, latitude: 39.7395, longitude: -104.9908, fuel_gauge: 70.2 },
  { equipment_id: 'EQ-024', operator_id: 'OP-002', status_id: 16, latitude: 32.7770, longitude: -96.7975, fuel_gauge: 43.8 },
  { equipment_id: 'EQ-025', operator_id: 'OP-005', status_id: 16, latitude: 37.7755, longitude: -122.4200, fuel_gauge: 76.4 },
  { equipment_id: 'EQ-026', operator_id: 'OP-009', status_id: 16, latitude: 33.4380, longitude: -112.0085, fuel_gauge: 58.9 },
  { equipment_id: 'EQ-028', operator_id: 'OP-004', status_id: 16, latitude: 32.7560, longitude: -97.3315, fuel_gauge: 85.6 },
  { equipment_id: 'EQ-029', operator_id: 'OP-009', status_id: 16, latitude: 33.4488, longitude: -112.0745, fuel_gauge: 31.2 },
]

// =============================================================================
// Alerts
// =============================================================================
export const mockAlerts: Alert[] = [
  { alert_id: 1, equipment_id: 'EQ-003', rental_id: 'RNT-003', status_id: 12, alert_type: 'Fuel Low', message: 'Fuel level dropped below 30% — 28.1% remaining.' },
  { alert_id: 2, equipment_id: 'EQ-003', rental_id: 'RNT-003', status_id: 12, alert_type: 'Rental Expiring', message: 'Rental RNT-003 is overdue by 4 days.' },
  { alert_id: 3, equipment_id: 'EQ-007', rental_id: 'RNT-007', status_id: 1, alert_type: 'Idle Too Long', message: 'Equipment idle for 3.5 hours continuously.' },
  { alert_id: 4, equipment_id: 'EQ-011', rental_id: 'RNT-011', status_id: 1, alert_type: 'Fuel Low', message: 'Fuel level at 34.5%. Estimated empty in 3.2 hours.' },
  { alert_id: 5, equipment_id: 'EQ-019', rental_id: 'RNT-014', status_id: 1, alert_type: 'Idle Too Long', message: 'Crane idle for 4.2 hours.' },
  { alert_id: 6, equipment_id: 'EQ-029', rental_id: 'RNT-022', status_id: 13, alert_type: 'Fuel Low', message: 'Water tanker fuel at 31.2%.' },
  { alert_id: 7, equipment_id: 'EQ-006', rental_id: 'RNT-006', status_id: 12, alert_type: 'Overheating', message: 'Engine temperature exceeds safe threshold.' },
  { alert_id: 8, equipment_id: 'EQ-021', rental_id: 'RNT-015', status_id: 1, alert_type: 'Overheating', message: 'Operating temperature approaching critical in Phoenix heat.' },
  { alert_id: 9, equipment_id: 'EQ-015', rental_id: null, status_id: 12, alert_type: 'Maintenance Due', message: 'Engine overhaul in progress — estimated 5 more days.' },
  { alert_id: 10, equipment_id: 'EQ-023', rental_id: null, status_id: 1, alert_type: 'Maintenance Due', message: 'Transmission repair ongoing — parts ETA August 12.' },
  { alert_id: 11, equipment_id: 'EQ-002', rental_id: 'RNT-002', status_id: 1, alert_type: 'Maintenance Due', message: 'Brake inspection scheduled for August 12.' },
  { alert_id: 12, equipment_id: 'EQ-020', rental_id: null, status_id: 1, alert_type: 'Equipment Offline', message: 'GPS signal lost during transit.' },
  { alert_id: 13, equipment_id: 'EQ-017', rental_id: 'RNT-013', status_id: 12, alert_type: 'Unauthorized Movement', message: 'Movement detected outside geofenced area — 0.8 miles from boundary.' },
  { alert_id: 14, equipment_id: 'EQ-029', rental_id: 'RNT-022', status_id: 1, alert_type: 'Overheating', message: 'Coolant temperature 103.1°F in extreme Phoenix heat.' },
  { alert_id: 15, equipment_id: 'EQ-005', rental_id: 'RNT-005', status_id: 1, alert_type: 'Weather Warning', message: 'Thunderstorm advisory for Boulder, CO. Lightning risk.' },
]

// =============================================================================
// Helpers: derive type/manufacturer from equipment name
// =============================================================================
function deriveEquipmentType(name: string): string {
  const types = ['Excavator','Bulldozer','Wheel Loader','Dump Truck','Roller','Crane','Forklift','Generator','Compressor','Water Tanker','Concrete Mixer','Light Tower']
  return types.find(t => name.toLowerCase().includes(t.toLowerCase())) ?? 'Other'
}
function deriveManufacturer(name: string): string {
  const word = name.split(' ')[0]
  return word
}

// =============================================================================
// Computed: Equipment with joined details for UI
// =============================================================================
export function getEquipmentWithDetails(): EquipmentWithDetails[] {
  return mockEquipment.map(eq => {
    const activeRental = mockRentals.find(r => r.equipment_id === eq.equipment_id && (r.rent_status === 'Active' || r.rent_status === 'Overdue'))
    const site = activeRental ? mockSites.find(s => s.site_id === activeRental.site_id) : undefined
    const usage = mockUsageRealtime.find(u => u.equipment_id === eq.equipment_id)
    const operator = usage ? mockOperators.find(o => o.operator_id === usage.operator_id) : undefined
    const customer = activeRental ? mockCustomers.find(c => c.customer_id === activeRental.customer_id) : undefined
    const alertCount = mockAlerts.filter(a => a.equipment_id === eq.equipment_id && a.status_id !== 14).length

    let maintenanceStatus = 'Healthy'
    if (eq.status_id === 5) maintenanceStatus = 'Repair In Progress'
    else if (eq.health < 60) maintenanceStatus = 'Inspection Due'
    else if (eq.health < 80) maintenanceStatus = 'Maintenance Scheduled'

    return {
      ...eq,
      status_name: getStatusName(eq.status_id),
      current_site: site,
      active_rental: activeRental,
      current_operator: operator,
      current_customer: customer,
      usage_realtime: usage,
      active_alerts_count: alertCount,
      fuel_level: usage?.fuel_gauge ?? 0,
      ai_failure_risk: eq.health < 50 ? 60 + Math.random() * 30 : Math.random() * 20,
      demand_score: Math.round(2 + Math.random() * 5),
      maintenance_status: maintenanceStatus,
      equipment_type: deriveEquipmentType(eq.name),
      manufacturer: deriveManufacturer(eq.name),
      image_url: `/equipment/${deriveEquipmentType(eq.name).toLowerCase().replace(/\s+/g, '-')}.jpg`,
    }
  })
}

// =============================================================================
// Dashboard KPIs
// =============================================================================
export function getDashboardKPIs(): DashboardKPIs {
  const total = mockEquipment.filter(e => e.status_id !== 7).length
  const rented = mockEquipment.filter(e => e.status_id === 4).length
  const running = mockUsageRealtime.filter(u => u.status_id === 16).length
  const idle = mockUsageRealtime.filter(u => u.status_id === 15).length
  const critAlerts = mockAlerts.filter(a => a.status_id === 12).length
  const overdueRentals = mockRentals.filter(r => r.rent_status === 'Overdue').length

  return {
    total_equipment: total, running_equipment: running, idle_equipment: idle,
    utilization_percent: Math.round((rented / total) * 100),
    engine_hours_today: 187, fuel_consumption_today: 482,
    critical_alerts: critAlerts,
    maintenance_due: mockEquipment.filter(e => e.status_id === 5).length,
    unauthorized_movement: mockAlerts.filter(a => a.alert_type === 'Unauthorized Movement').length,
    overdue_rentals: overdueRentals,
    weather_warnings: mockAlerts.filter(a => a.alert_type === 'Weather Warning').length,
    predicted_demand: 27, expected_rentals: 19, anomaly_count: 8, failure_risk_score: 34,
    monthly_revenue: 487500, rental_revenue: 425000, equipment_roi: 23.4,
  }
}

// =============================================================================
// Live Event Generator
// =============================================================================
const eventTemplates: Array<{ type: LiveEvent['type']; severity: LiveEvent['severity']; template: (eq: Equipment) => string }> = [
  { type: 'gps_updated', severity: 'info', template: (eq) => `GPS position updated for ${eq.name}` },
  { type: 'fuel_warning', severity: 'warning', template: (eq) => `Fuel level alert on ${eq.name}` },
  { type: 'equipment_assigned', severity: 'success', template: (eq) => `${eq.name} assigned to new task` },
  { type: 'maintenance_scheduled', severity: 'info', template: (eq) => `Maintenance scheduled for ${eq.name}` },
  { type: 'anomaly_detected', severity: 'critical', template: (eq) => `AI anomaly detected on ${eq.name}` },
  { type: 'rental_completed', severity: 'success', template: (eq) => `Rental completed for ${eq.name}` },
  { type: 'alert_generated', severity: 'warning', template: (eq) => `New alert generated for ${eq.name}` },
  { type: 'check_in', severity: 'success', template: (eq) => `${eq.name} checked in at depot` },
  { type: 'check_out', severity: 'info', template: (eq) => `${eq.name} checked out to site` },
]

export function generateLiveEvent(): LiveEvent {
  const template = eventTemplates[Math.floor(Math.random() * eventTemplates.length)]
  const equipment = mockEquipment[Math.floor(Math.random() * mockEquipment.length)]
  return {
    id: Math.random().toString(36).substring(2, 9),
    type: template.type,
    equipment_id: equipment.equipment_id,
    equipment_name: equipment.name,
    message: template.template(equipment),
    timestamp: new Date().toISOString(),
    severity: template.severity,
  }
}

// =============================================================================
// Chart Data Generators
// =============================================================================
export function getUtilizationChartData() {
  return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({ name: d, utilization: Math.round(55 + Math.random() * 35), target: 80 }))
}
export function getRentalTrendData() {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'].map(m => ({ name: m, active: Math.round(12 + Math.random() * 10), completed: Math.round(5 + Math.random() * 8), new: Math.round(3 + Math.random() * 6) }))
}
export function getRevenueData() {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'].map(m => ({ name: m, revenue: Math.round(280000 + Math.random() * 220000), cost: Math.round(120000 + Math.random() * 80000) }))
}
export function getHealthDistributionData() {
  const eq = mockEquipment.filter(e => e.status_id !== 7)
  return [
    { name: 'Healthy', value: eq.filter(e => e.health >= 80).length, color: '#10B981' },
    { name: 'Warning', value: eq.filter(e => e.health >= 50 && e.health < 80).length, color: '#F59E0B' },
    { name: 'Critical', value: eq.filter(e => e.health > 0 && e.health < 50).length, color: '#EF4444' },
    { name: 'Offline', value: mockEquipment.filter(e => e.status_id === 7 || e.status_id === 5).length, color: '#6B7280' },
  ]
}
export function getFuelConsumptionData() {
  return ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => ({ name: d, diesel: Math.round(400 + Math.random() * 200), gasoline: Math.round(50 + Math.random() * 30) }))
}
export function getMaintenanceTrendData() {
  return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'].map(m => ({ name: m, completed: Math.round(3 + Math.random() * 5), scheduled: Math.round(2 + Math.random() * 4), unplanned: Math.round(Math.random() * 3) }))
}
