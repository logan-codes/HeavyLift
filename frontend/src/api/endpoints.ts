import { mockApi } from './client'
import {
  mockEquipment, mockRentals, mockAlerts, mockOperators,
  mockCustomers, mockSites, mockUsageRealtime, mockStatuses,
  getEquipmentWithDetails, getDashboardKPIs,
  getUtilizationChartData, getRentalTrendData, getRevenueData,
  getHealthDistributionData, getFuelConsumptionData, getMaintenanceTrendData,
  getStatusName,
} from '../mocks/data'
import type {
  Equipment, Rental, Alert, Operator, Customer, Site,
  UsageRealtime, Status, EquipmentWithDetails, DashboardKPIs,
} from '../types/database'

export const dashboardApi = {
  getKPIs: () => mockApi<DashboardKPIs>(getDashboardKPIs()),
  getUtilizationChart: () => mockApi(getUtilizationChartData()),
  getRentalTrend: () => mockApi(getRentalTrendData()),
  getRevenue: () => mockApi(getRevenueData()),
  getHealthDistribution: () => mockApi(getHealthDistributionData()),
  getFuelConsumption: () => mockApi(getFuelConsumptionData()),
  getMaintenanceTrend: () => mockApi(getMaintenanceTrendData()),
}

export const equipmentApi = {
  getAll: () => mockApi<Equipment[]>(mockEquipment),
  getAllWithDetails: () => mockApi<EquipmentWithDetails[]>(getEquipmentWithDetails()),
  getById: (id: string) => mockApi<EquipmentWithDetails | undefined>(
    getEquipmentWithDetails().find(e => e.equipment_id === id)
  ),
  getAlerts: (equipmentId: string) => mockApi<Alert[]>(
    mockAlerts.filter(a => a.equipment_id === equipmentId)
  ),
}

export const usageApi = {
  getAll: () => mockApi<UsageRealtime[]>(mockUsageRealtime),
  getByEquipment: (equipmentId: string) => mockApi<UsageRealtime | undefined>(
    mockUsageRealtime.find(u => u.equipment_id === equipmentId)
  ),
}

export const alertsApi = {
  getAll: () => mockApi<Alert[]>(mockAlerts),
  getActive: () => mockApi<Alert[]>(mockAlerts.filter(a => a.status_id !== 14)),
  resolve: (alertId: number) => mockApi<Alert>({
    ...mockAlerts.find(a => a.alert_id === alertId)!,
    status_id: 14,
  }),
}

export const rentalsApi = {
  getAll: () => mockApi<Rental[]>(mockRentals),
  getById: (id: string) => mockApi<Rental | undefined>(mockRentals.find(r => r.rental_id === id)),
  checkIn: (rentalId: string) => mockApi<Rental>({
    ...mockRentals.find(r => r.rental_id === rentalId)!,
    rent_status: 'Completed', status_id: 8,
  }),
  checkOut: (data: Partial<Rental>) => mockApi<Rental>({
    rental_id: `RNT-${String(mockRentals.length + 1).padStart(3, '0')}`,
    equipment_id: data.equipment_id || '', customer_id: data.customer_id || 0,
    site_id: data.site_id || '', due_on: data.due_on || '',
    rent_status: 'Active', status_id: 1, rental_days: data.rental_days || 30,
  }),
}

export const operatorsApi = { getAll: () => mockApi<Operator[]>(mockOperators) }
export const customersApi = { getAll: () => mockApi<Customer[]>(mockCustomers) }
export const sitesApi = { getAll: () => mockApi<Site[]>(mockSites) }
export const statusApi = {
  getAll: () => mockApi<Status[]>(mockStatuses),
  getName: (id: number) => getStatusName(id),
}
