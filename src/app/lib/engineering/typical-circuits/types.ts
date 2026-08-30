export type TypicalCircuitTemplate = {
  code: string;

  damperMotorType:
    | "No Damper"
    | "Proportional"
    | "On/Off - 1"
    | "On/Off - 2";

  startingMethod:
    | "DOL"
    | "Soft Starter"
    | "EC - 1 Fan"
    | "EC - 2 Fan"
    | "VFD"
    | "VFD + Bypass";

  frostThermostat: boolean;
  fire: boolean;
  maintenanceIsolator: boolean;
  emergencyStop: boolean;
  doorSwitch: boolean;
  limitThermostat: boolean;
};