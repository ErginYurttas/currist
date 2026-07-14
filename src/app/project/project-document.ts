import type { Load, Panel, Structure } from "../types";

export const CURRENT_PROJECT_SCHEMA_VERSION = 1 as const;

export type CurristProjectDocument = {
  schemaVersion: typeof CURRENT_PROJECT_SCHEMA_VERSION;

  documentId: string;
  createdAt: number;
  updatedAt: number;

  projectCountry: string;
  buildingType: string;

  structures: Structure[];
  panels: Panel[];
  loads: Load[];
};

export type CurristProjectData = Pick<
  CurristProjectDocument,
  | "projectCountry"
  | "buildingType"
  | "structures"
  | "panels"
  | "loads"
>;

export function createProjectDocument(
  projectData: CurristProjectData,
  existingMetadata?: Pick<
    CurristProjectDocument,
    "documentId" | "createdAt"
  >
): CurristProjectDocument {
  const now = Date.now();

  return {
    schemaVersion: CURRENT_PROJECT_SCHEMA_VERSION,

    documentId:
      existingMetadata?.documentId ?? crypto.randomUUID(),

    createdAt:
      existingMetadata?.createdAt ?? now,

    updatedAt: now,

    projectCountry: projectData.projectCountry,
    buildingType: projectData.buildingType,

    structures: projectData.structures,
    panels: projectData.panels,
    loads: projectData.loads,
  };
}

export function isCurristProjectDocument(
  value: unknown
): value is CurristProjectDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CurristProjectDocument>;

  return (
    candidate.schemaVersion === CURRENT_PROJECT_SCHEMA_VERSION &&
    typeof candidate.documentId === "string" &&
    typeof candidate.createdAt === "number" &&
    typeof candidate.updatedAt === "number" &&
    typeof candidate.projectCountry === "string" &&
    typeof candidate.buildingType === "string" &&
    Array.isArray(candidate.structures) &&
    Array.isArray(candidate.panels) &&
    Array.isArray(candidate.loads)
  );
}