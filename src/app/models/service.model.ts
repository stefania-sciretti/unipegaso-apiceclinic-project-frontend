export interface ServiceResponse {
  id: number;
  service: string;
  price: number;
  specialistId: number;
  areaId: number;
  areaName: string;
}

export interface ServiceRequest {
  service: string;
  price: number;
  specialistId: number;
}
