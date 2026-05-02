export interface ClinicalAppointment {
  id: number;
  patientId: number;
  patientFullName: string;
  specialistId: number;
  specialistFullName: string;
  specialistRole: string;
  scheduledAt: string;
  visitType: string;
  status: string;
  notes?: string;
  hasReport: boolean;
  createdAt: string;
}
