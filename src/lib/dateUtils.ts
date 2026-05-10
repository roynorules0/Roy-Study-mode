import { parse, format } from 'date-fns';

export function format12Hour(time24: string): string {
  try {
    // Expects HH:mm format
    const date = parse(time24, 'HH:mm', new Date());
    return format(date, 'hh:mm a');
  } catch (error) {
    return time24;
  }
}
