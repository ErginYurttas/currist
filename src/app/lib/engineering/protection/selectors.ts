import { GENERIC_MOTOR_PROTECTION_RANGES } from "./rules";

const STANDARD_CURRENT_RATINGS_A = [
  1,
  2,
  4,
  6,
  10,
  16,
  20,
  25,
  32,
  40,
  50,
  63,
  80,
  100,
  125,
  160,
  200,
  250,
  315,
  400,
  500,
  630,
  800,
  1000,
  1250,
  1600,
];

export function selectNextStandardCurrent(
  requiredCurrentA: number
): number | null {
  if (!Number.isFinite(requiredCurrentA) || requiredCurrentA <= 0) {
    return null;
  }

  return (
    STANDARD_CURRENT_RATINGS_A.find(
      (rating) => rating >= requiredCurrentA
    ) ?? null
  );
}

export type MotorProtectionSelection = {
  requiredCurrentA: number;
  suggestedRatedCurrentA: number | null;
  recommendedMinCurrentA: number | null;
  recommendedMaxCurrentA: number | null;
};

export function selectMotorProtection(
  requiredCurrentA: number
): MotorProtectionSelection {
  const selectedRange = selectCurrentRange(
    requiredCurrentA,
    GENERIC_MOTOR_PROTECTION_RANGES
  );

  return {
    requiredCurrentA,
    suggestedRatedCurrentA: null,
    recommendedMinCurrentA: selectedRange?.minA ?? null,
    recommendedMaxCurrentA: selectedRange?.maxA ?? null,
  };
}

export type ContactorSelection = {
  requiredCurrentA: number;
  utilizationCategory: "AC-1" | "AC-3" | "AC-4";
  suggestedRatedCurrentA: number | null;
};

export function selectContactor(
  requiredCurrentA: number,
  utilizationCategory: "AC-1" | "AC-3" | "AC-4" = "AC-3"
): ContactorSelection {
  return {
    requiredCurrentA,
    utilizationCategory,
    suggestedRatedCurrentA: null,
  };
}

export type OverloadSelection = {
  requiredCurrentA: number;
  suggestedMinAdjustmentA: number | null;
  suggestedMaxAdjustmentA: number | null;
};

export function selectOverloadRelay(
  requiredCurrentA: number
): OverloadSelection {
  return {
    requiredCurrentA,
    suggestedMinAdjustmentA: null,
    suggestedMaxAdjustmentA: null,
  };
}

export type CurrentRange = {
  minA: number;
  maxA: number;
};

export function selectCurrentRange(
  requiredCurrentA: number,
  ranges: CurrentRange[]
): CurrentRange | null {
  if (!Number.isFinite(requiredCurrentA) || requiredCurrentA <= 0) {
    return null;
  }

  return (
    ranges.find(
      (range) =>
        requiredCurrentA >= range.minA &&
        requiredCurrentA <= range.maxA
    ) ?? null
  );
}