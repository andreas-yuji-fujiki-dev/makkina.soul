export interface CigarrosPlan {
  start: string | null;
  counts: Record<number, number>;
}

export interface CigarrosDayCell {
  day: number;
  limit: number;
  value: number;
  hasValue: boolean;
  isToday: boolean;
  isFuture: boolean;
}
