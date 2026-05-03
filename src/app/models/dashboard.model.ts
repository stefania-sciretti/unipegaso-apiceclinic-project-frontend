export type PeriodFilter = '1m' | '3m' | '6m' | '1y';

export interface DashboardKpi {
  revenueMonth: number;
  /** null when no prior billing period exists */
  revenuePrevMonth: number | null;
  activePatients: number;
  newPatients: number;
  appointmentsMonth: number;
  /** Percentage 0–100 */
  cancellationRate: number;
  /** Percentage 0–100 */
  agendaOccupancy: number;
}

export interface RevenueByMonth {
  month: string;
  total: number;
}

export interface AppointmentsByMonth {
  month: string;
  booked: number;
  completed: number;
  cancelled: number;
}

export interface RevenueByService {
  service: string;
  total: number;
}

export interface DashboardStats {
  kpi: DashboardKpi;
  revenueByMonth: RevenueByMonth[];
  appointmentsByMonth: AppointmentsByMonth[];
  revenueByService: RevenueByService[];
}
