export type AdjustableCurrentRangeRule = {
  minA: number;
  maxA: number;
};

export type FixedCurrentRatingRule = {
  ratedCurrentA: number;
};

export const GENERIC_MOTOR_PROTECTION_RANGES: AdjustableCurrentRangeRule[] = [
  { minA: 0.1, maxA: 0.16 },
  { minA: 0.16, maxA: 0.25 },
  { minA: 0.25, maxA: 0.4 },
  { minA: 0.4, maxA: 0.63 },
  { minA: 0.63, maxA: 1.0 },
  { minA: 1.0, maxA: 1.6 },
  { minA: 1.6, maxA: 2.5 },
  { minA: 2.5, maxA: 4.0 },
  { minA: 4.0, maxA: 6.3 },
  { minA: 6.3, maxA: 10.0 },
];