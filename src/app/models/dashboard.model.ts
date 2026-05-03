export type PeriodFilter = '1m' | '3m' | '6m' | '1y';

export interface DashboardKpi {
  revenueMonth: number;
  revenuePrevMonth: number;
  activePatients: number;
  newPatients: number;
  appointmentsMonth: number;
  cancellationRate: number;
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
