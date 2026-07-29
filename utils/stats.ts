import type { FlightLog, FlightStats } from '@/types/flight';
import { getArrivalDelayMinutes, getArrivalStatus, getDepartureDelayMinutes, getDepartureStatus } from './delay';

export function calculateFlightStats(logs: FlightLog[]): FlightStats {
  if (logs.length === 0) {
    return {
      totalLogs: 0,
      onTimeDeparturePct: 0,
      onTimeArrivalPct: 0,
      avgDepartureDelayMinutes: 0,
      avgArrivalDelayMinutes: 0,
      rtbCount: 0,
      rtaCount: 0,
      divertCount: 0,
    };
  }

  let onTimeDepartureCount = 0;
  let onTimeArrivalCount = 0;
  let rtbCount = 0;
  let rtaCount = 0;
  let divertCount = 0;

  const departureDelays: number[] = [];
  const arrivalDelays: number[] = [];

  for (const log of logs) {
    if (getDepartureStatus(log) === 'ON_TIME') onTimeDepartureCount++;
    if (getArrivalStatus(log) === 'ON_TIME') onTimeArrivalCount++;

    const depDelay = getDepartureDelayMinutes(log);
    if (depDelay !== null) departureDelays.push(depDelay);

    const arrDelay = getArrivalDelayMinutes(log);
    if (arrDelay !== null) arrivalDelays.push(arrDelay);

    if (log.status === 'RTB') rtbCount++;
    if (log.status === 'RTA') rtaCount++;
    if (log.status === 'DIVERT') divertCount++;
  }

  const average = (arr: number[]) =>
    arr.length === 0 ? 0 : Math.round(arr.reduce((sum, n) => sum + n, 0) / arr.length);

  return {
    totalLogs: logs.length,
    onTimeDeparturePct: Math.round((onTimeDepartureCount / logs.length) * 100),
    onTimeArrivalPct: Math.round((onTimeArrivalCount / logs.length) * 100),
    avgDepartureDelayMinutes: average(departureDelays),
    avgArrivalDelayMinutes: average(arrivalDelays),
    rtbCount,
    rtaCount,
    divertCount,
  };
}
