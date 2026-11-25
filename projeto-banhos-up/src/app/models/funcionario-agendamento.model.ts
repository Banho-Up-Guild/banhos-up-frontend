import { StatusAgendamento } from './agendamento.model';

export interface AppointmentItem {
  petId: number;
  petName: string;
  species: string;
  offeringId: number;
  offeringName: string;
  offeringPrice: number;
}

export interface AppointmentManagement {
  id: number;
  dateTimeAppointment: string;
  status: StatusAgendamento;
  observation: string;
  totalPrice: number;
  employeeId: number;
  employeeName: string;
  customerName: string;
  customerEmail: string | null;
  items: AppointmentItem[];
}

export interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  status?: StatusAgendamento;
}