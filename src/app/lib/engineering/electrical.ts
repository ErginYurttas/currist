import type { Load } from "../../types";

export const SINGLE_PHASE_VOLTAGE = 230;
export const THREE_PHASE_VOLTAGE = 400;
export const SQRT_3 = Math.sqrt(3);

export function getLoadVoltage(load: Load): number {
  return load.phaseType === "1P"
    ? SINGLE_PHASE_VOLTAGE
    : THREE_PHASE_VOLTAGE;
}

export function getLoadCurrent(load: Load): number {
  const totalPowerW = load.powerKw * load.quantity * 1000;
  const cosPhi =
    load.cosPhi && load.cosPhi > 0
      ? load.cosPhi
      : 1;

  if (load.phaseType === "1P") {
    return totalPowerW / (SINGLE_PHASE_VOLTAGE * cosPhi);
  }

  return totalPowerW / (
    SQRT_3 *
    THREE_PHASE_VOLTAGE *
    cosPhi
  );
}