import type { TypicalCircuitTemplate } from "./types";
import { TYPICAL_CIRCUIT_TEMPLATES } from "./templates";

export type TypicalCircuitSelectionInput = Omit<
  TypicalCircuitTemplate,
  "code"
>;

export function findTypicalCircuit(
  input: TypicalCircuitSelectionInput
): TypicalCircuitTemplate | undefined {
  return TYPICAL_CIRCUIT_TEMPLATES.find(
    (template) =>
      template.damperMotorType === input.damperMotorType &&
      template.startingMethod === input.startingMethod &&
      template.frostThermostat === input.frostThermostat &&
      template.fire === input.fire &&
      template.maintenanceIsolator === input.maintenanceIsolator &&
      template.emergencyStop === input.emergencyStop &&
      template.doorSwitch === input.doorSwitch &&
      template.limitThermostat === input.limitThermostat
  );
}