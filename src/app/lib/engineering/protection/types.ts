export type ProtectionComponentCategory =
  | "MCB"
  | "MCCB"
  | "MPCB"
  | "FUSE"
  | "CONTACTOR"
  | "OVERLOAD_RELAY"
  | "VFD"
  | "SOFT_STARTER";

export type GenericComponentRequirement = {
  id: string;

  category: ProtectionComponentCategory;

  quantity: number;

  sourceLoadId?: string;

  poles?: number;

  requiredCurrentA?: number;

  existingRatedCurrentA?: number;

calculatedRequiredCurrentA?: number;

recommendedRatedCurrentA?: number;

recommendedMinCurrentA?: number;
recommendedMaxCurrentA?: number;

  ratedCurrentA?: number;

  minCurrentA?: number;

  maxCurrentA?: number;

  breakingCapacityKa?: number;

  utilizationCategory?: "AC-1" | "AC-3" | "AC-4";

  powerKw?: number;

  voltageV?: number;
};