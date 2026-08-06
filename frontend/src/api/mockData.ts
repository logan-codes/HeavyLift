import type {
  EquipmentSummary,
  EquipmentDetail,
  AlertDto,
  AlertSummary,
  Site,
  Customer,
  Operator,
  AppUser,
  RentalDto,
} from './types';

export const MOCK_EQUIPMENT: EquipmentSummary[] = [
  {
    equipmentId: 101,
    name: 'Excavator 320 Next Gen',
    health: 94,
    fuelType: 'Diesel',
    statusName: 'Active',
    lastMaintenanceOn: '2025-07-15',
    latitude: 39.7392,
    longitude: -104.9903,
    fuelGauge: 82,
    operatorName: 'John Doe',
  },
  {
    equipmentId: 102,
    name: 'Bulldozer D6 XE',
    health: 88,
    fuelType: 'Diesel',
    statusName: 'Active',
    lastMaintenanceOn: '2025-06-20',
    latitude: 39.7500,
    longitude: -104.9800,
    fuelGauge: 65,
    operatorName: 'Jane Smith',
  },
  {
    equipmentId: 103,
    name: 'Grader 140 GC',
    health: 72,
    fuelType: 'Diesel',
    statusName: 'Idle',
    lastMaintenanceOn: '2025-05-10',
    latitude: 39.7250,
    longitude: -105.0100,
    fuelGauge: 45,
    operatorName: 'Alex Rivera',
  },
  {
    equipmentId: 104,
    name: 'Roller CB2.7',
    health: 48,
    fuelType: 'Diesel',
    statusName: 'In Maintenance',
    lastMaintenanceOn: '2025-07-28',
    latitude: 39.7600,
    longitude: -104.9600,
    fuelGauge: 30,
    operatorName: 'Chris Evans',
  },
  {
    equipmentId: 105,
    name: 'Generator C15 ACERT',
    health: 96,
    fuelType: 'Diesel',
    statusName: 'Active',
    lastMaintenanceOn: '2025-07-01',
    latitude: 39.7100,
    longitude: -104.9700,
    fuelGauge: 90,
    operatorName: 'Taylor Morgan',
  },
  {
    equipmentId: 106,
    name: 'Light Tower PL200',
    health: 35,
    fuelType: 'Diesel',
    statusName: 'Overdue',
    lastMaintenanceOn: '2025-03-12',
    latitude: 39.7400,
    longitude: -105.0200,
    fuelGauge: 15,
    operatorName: 'Jordan Casey',
  },
];

export const MOCK_SITES: Site[] = [
  {
    siteId: 1,
    name: 'Harbor Expansion Project',
    address: '100 Port Ave, Denver CO',
    latitude: 39.7392,
    longitude: -104.9903,
    statusId: 14,
    statusName: 'Active',
    isActive: true,
  },
  {
    siteId: 2,
    name: 'Northgate Quarry',
    address: '500 Quarry Rd, Golden CO',
    latitude: 39.7500,
    longitude: -104.9800,
    statusId: 14,
    statusName: 'Active',
    isActive: true,
  },
  {
    siteId: 3,
    name: 'Redstone Mine',
    address: '12 Redstone Way, Boulder CO',
    latitude: 39.7250,
    longitude: -105.0100,
    statusId: 14,
    statusName: 'Active',
    isActive: true,
  },
];

export const MOCK_ALERTS: AlertDto[] = [
  {
    alertId: 1,
    equipmentId: 104,
    equipmentName: 'Roller CB2.7',
    rentalId: 201,
    siteId: 1,
    siteName: 'Harbor Expansion Project',
    alertType: 'Health Critical',
    statusId: 9,
    statusName: 'Open',
    message: 'Equipment health dropped below threshold (48%)',
    isActive: true,
    createdOn: '2025-08-01T10:00:00Z',
    editedOn: '2025-08-01T10:00:00Z',
  },
  {
    alertId: 2,
    equipmentId: 106,
    equipmentName: 'Light Tower PL200',
    rentalId: 202,
    siteId: 2,
    siteName: 'Northgate Quarry',
    alertType: 'Geofence Breach',
    statusId: 9,
    statusName: 'Open',
    message: 'Equipment moved outside assigned geofence boundary',
    isActive: true,
    createdOn: '2025-08-02T14:30:00Z',
    editedOn: '2025-08-02T14:30:00Z',
  },
  {
    alertId: 3,
    equipmentId: 103,
    equipmentName: 'Grader 140 GC',
    rentalId: 203,
    siteId: 3,
    siteName: 'Redstone Mine',
    alertType: 'Overdue Rental',
    statusId: 9,
    statusName: 'Open',
    message: 'Rental duration exceeded expected return date by 3 days',
    isActive: true,
    createdOn: '2025-08-03T08:15:00Z',
    editedOn: '2025-08-03T08:15:00Z',
  },
];

export const MOCK_ALERT_SUMMARY: AlertSummary = {
  totalOpen: 3,
  openByType: {
    'Health Critical': 1,
    'Geofence Breach': 1,
    'Overdue Rental': 1,
  },
};

export const MOCK_CUSTOMERS: Customer[] = [
  { customerId: 1, name: 'Apex Construction', contactPerson: 'Dave Miller', phone: '555-0199', email: 'dave@apex.test', address: '123 Main St', isActive: true },
  { customerId: 2, name: 'Summit Earthworks', contactPerson: 'Sarah Connor', phone: '555-0188', email: 'sarah@summit.test', address: '456 Hill Rd', isActive: true },
];

export const MOCK_OPERATORS: Operator[] = [
  { operatorId: 1, operatorName: 'John Doe', phone: '555-0111', licenseNumber: 'CAT-9921', licenseValidity: '2027-12-31', isActive: true },
  { operatorId: 2, operatorName: 'Jane Smith', phone: '555-0122', licenseNumber: 'CAT-8842', licenseValidity: '2026-10-15', isActive: true },
];

export const MOCK_USERS: AppUser[] = [
  { userId: 1, username: 'admin', firstName: 'Alex', lastName: 'Admin', email: 'admin@catrental.test', phone: '555-0100', roleName: 'System Admin', statusName: 'Active', isActive: true },
  { userId: 2, username: 'sitemgr', firstName: 'Sam', lastName: 'Sitemgr', email: 'sitemgr@catrental.test', phone: '555-0101', roleName: 'Site Manager', statusName: 'Active', isActive: true },
];

export const MOCK_RENTALS: RentalDto[] = [
  {
    rentalId: 201,
    equipmentId: 101,
    equipmentName: 'Excavator 320 Next Gen',
    customerId: 1,
    customerName: 'Apex Construction',
    siteId: 1,
    siteName: 'Harbor Expansion Project',
    dueOn: '2025-08-15',
    rentStatus: 'Active',
    statusId: 5,
    statusName: 'Active',
    rentalDays: 14,
    isActive: true,
    createdOn: '2025-08-01',
    editedOn: '2025-08-01',
  },
];

export function getMockFallback<T>(path: string): T {
  const p = path.toLowerCase();
  if (p.includes('/api/equipment/') && p.split('/').length > 3) {
    const eq = MOCK_EQUIPMENT[0];
    const detail: EquipmentDetail = {
      equipment: eq,
      currentRental: MOCK_RENTALS[0],
      openAlerts: [MOCK_ALERTS[0]],
      recentHistory: [
        { recordedAt: '2025-08-05T10:00:00Z', latitude: eq.latitude, longitude: eq.longitude, statusName: eq.statusName, fuelGauge: eq.fuelGauge, health: eq.health, operatorName: eq.operatorName },
        { recordedAt: '2025-08-05T09:00:00Z', latitude: eq.latitude! - 0.001, longitude: eq.longitude! - 0.001, statusName: eq.statusName, fuelGauge: eq.fuelGauge! + 2, health: eq.health! + 1, operatorName: eq.operatorName },
      ],
    };
    return detail as unknown as T;
  }
  if (p.includes('/api/equipment')) {
    return MOCK_EQUIPMENT as unknown as T;
  }
  if (p.includes('/api/sites')) {
    return MOCK_SITES as unknown as T;
  }
  if (p.includes('/api/alerts/summary')) {
    return MOCK_ALERT_SUMMARY as unknown as T;
  }
  if (p.includes('/api/alerts/open-count')) {
    return { openCount: MOCK_ALERTS.length } as unknown as T;
  }
  if (p.includes('/api/alerts')) {
    return MOCK_ALERTS as unknown as T;
  }
  if (p.includes('/api/customers')) {
    return MOCK_CUSTOMERS as unknown as T;
  }
  if (p.includes('/api/operators')) {
    return MOCK_OPERATORS as unknown as T;
  }
  if (p.includes('/api/users')) {
    return MOCK_USERS as unknown as T;
  }
  if (p.includes('/api/rentals')) {
    return MOCK_RENTALS as unknown as T;
  }
  if (p.includes('/api/ai/utilization')) {
    return { available: true, data: { equipmentId: 101, windowDays: 30, sampleCount: 120, activeHours: 140, idleHours: 25, otherHours: 15, utilizationPct: 82.5, underUsed: false }, error: null } as unknown as T;
  }
  if (p.includes('/api/ai/anomalies')) {
    return { available: true, data: { equipmentId: 101, sampleCount: 120, anomalies: [{ recordedAt: '2025-08-04T12:00:00Z', anomalyType: 'Fuel Spike', detail: 'Rapid fuel gauge change', severity: 'medium' }] }, error: null } as unknown as T;
  }
  if (p.includes('/api/ai/forecast') || p.includes('/api/ai/demand-forecast')) {
    return { available: true, data: { siteId: 1, weeksHistory: 12, weeksAhead: 4, categories: [{ category: 'Excavator', history: [{ weekStart: '2025-07-01', count: 5 }], forecast: [{ weekStart: '2025-08-10', count: 6 }] }] }, error: null } as unknown as T;
  }
  if (p.includes('/api/ai/predict-return')) {
    return { available: true, data: { rentalId: 201, customerId: 1, customerName: 'Apex Construction', dueOn: '2025-08-15', probabilityOverrun: 0.15, riskLevel: 'low', sampleSize: 20, basedOn: 'history' }, error: null } as unknown as T;
  }
  return [] as unknown as T;
}
