import type { Load } from "../../../types";
import type { ProtectionInput } from "./input";
import {
  getLoadCurrent,
  getLoadVoltage,
} from "../electrical";

export function loadToProtectionInput(
  load: Load
): ProtectionInput {
  return {
    loadId: String(load.id),
    loadName: load.projectCode,

    loadType: load.loadType,

    powerKw: load.powerKw,
    voltageV: getLoadVoltage(load),

    phaseType: load.phaseType,

    currentA: getLoadCurrent(load),

    cosPhi: load.cosPhi,

    loadCharacter: load.loadCharacter,

    startingMethod:
      load.startingMethod as ProtectionInput["startingMethod"],

    cableSectionMm2: undefined,
    cableCurrentCapacityA: undefined,
    prospectiveShortCircuitKa: undefined,
  };
}