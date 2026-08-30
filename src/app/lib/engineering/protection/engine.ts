import type { ProtectionInput } from "./input";
import type { GenericComponentRequirement } from "./types";
import {
  selectMotorProtection,
  selectContactor,
  selectOverloadRelay,
} from "./selectors";

export function buildProtectionRequirements(
  input: ProtectionInput
): GenericComponentRequirement[] {
  const requirements: GenericComponentRequirement[] = [];

  if (input.startingMethod === "DOL") {
    const motorCurrent =
  input.ratedCurrentA ?? input.currentA;

const motorProtection =
  selectMotorProtection(motorCurrent);
  const contactorSelection =
  selectContactor(motorCurrent, "AC-3");
  const overloadSelection =
  selectOverloadRelay(motorCurrent);
    requirements.push(
      {
        id: `${input.loadId}-protection`,
        category: "MPCB",
        quantity: 1,
        sourceLoadId: input.loadId,
        poles: input.phaseType === "3P" ? 3 : 2,
        requiredCurrentA: motorProtection.requiredCurrentA,
        calculatedRequiredCurrentA: motorProtection.requiredCurrentA,
        recommendedMinCurrentA:
  motorProtection.recommendedMinCurrentA ?? undefined,

recommendedMaxCurrentA:
  motorProtection.recommendedMaxCurrentA ?? undefined,
        voltageV: input.voltageV,
      },
      {
        id: `${input.loadId}-contactor`,
        category: "CONTACTOR",
        quantity: 1,
        sourceLoadId: input.loadId,
        utilizationCategory: contactorSelection.utilizationCategory,
        requiredCurrentA: contactorSelection.requiredCurrentA,
        calculatedRequiredCurrentA: contactorSelection.requiredCurrentA,
        voltageV: input.voltageV,
      },
      {
  id: `${input.loadId}-overload`,
  category: "OVERLOAD_RELAY",
  quantity: 1,
  sourceLoadId: input.loadId,
  requiredCurrentA: overloadSelection.requiredCurrentA,
  calculatedRequiredCurrentA: overloadSelection.requiredCurrentA,
}
    );
  }

  return requirements;
}
