export type StructureType = "project" | "building" | "block" | "floor" | "room";
export type SortMode = "alphabetical" | "created";
export type LoadType = "Pump" | "Fan" | "AHU" | "Manual";
export type PhaseType = "1P" | "3P";
export type PhaseLine = "R" | "S" | "T";
export type LoadCharacter = "Ohmic" | "Inductive" | "Capacitive";
export type PanelType =   | "MCC" | "SMDB"  | "DB"  | "LP"  | "UPS DB"  | "Packaged Panel";
export type PanelPhaseType = "1P" | "3P";

export type PanelAnalyzer = {
  id: number;
  name: string;
  connectedLoadIds: number[];
};

export type Panel = {
  id: number;
  name: string;
  panelType: PanelType;
  phaseType: PanelPhaseType;
  structureId: number;
  description?: string;
  environment?: "Indoor" | "Outdoor";
  supplyPanelId?: number;
  ipRating?: string;
  createdAt: number;
  analyzers?: PanelAnalyzer[];
};

export type ManualLoadType =
  | "Socket Outlet"
  | "Lighting Circuit"
  | "UPS Outlet"
  | "Kitchen Outlet"
  | "Spare Load"
  | "Other";

export type Structure = {
  id: number;
  name: string;
  type: StructureType;
  parentId: number | null;
  createdAt: number;
  optionalName?: string;
};

export type CatalogItem = {
  loadType: Exclude<LoadType, "Manual">;
  brand: string;
  series: string;
  model: string;
  powerKw: number;
  phaseType: PhaseType;
  loadCharacter: LoadCharacter;
};

export type Load = {
  id: number;
  projectCode: string;
  description: string;
  loadType: LoadType;
  manualLoadType?: ManualLoadType;
  brand: string;
  series: string;
  model: string;
  powerKw: number;
  quantity: number;
  phaseType: PhaseType;
  phaseLine?: PhaseLine;
  roomId: number;
  connectedPanelId?: number;
  createdAt: number;
  updatedAt?: number;
  loadCharacter?: LoadCharacter;
  cosPhi?: number;
  cableLengthM?: number;
  note?: string;
};