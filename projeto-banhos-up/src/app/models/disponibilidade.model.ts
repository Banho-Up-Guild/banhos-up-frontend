export interface DiaDisponibilidade {
  dayOfWeek: number;
  dayName: string;
  closed: boolean;
  openingTime: string | null;
  closingTime: string | null;
  breakStart: string | null;
  breakEnd: string | null;
}

export interface DisponibilidadeCalendarioResponse {
  date: string;
  hours: string[];
}