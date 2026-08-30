export type ProtectionInput = {
  loadId: string;
  loadName: string;

  loadType:
    | "Pump"
    | "Fan"
    | "AHU"
    | "Manual"
    | "Other";

  powerKw: number;
  voltageV: number;

  phaseType: "1P" | "3P";

  currentA: number;

  cosPhi?: number;

  loadCharacter?: "Ohmic" | "Inductive" | "Capacitive";

  startingMethod?:
    | "DOL"
    | "Star-Delta"
    | "VFD"
    | "Soft Starter"
    | "Direct Connection"
    | "Other";

  ratedCurrentA?: number;

  cableSectionMm2?: number;

  cableCurrentCapacityA?: number;

  prospectiveShortCircuitKa?: number;
};