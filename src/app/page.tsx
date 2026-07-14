"use client";
import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { useEffect, useMemo, useState } from "react";
import { catalog } from "./data/catalog";
import {
  createProjectDocument,
  type CurristProjectDocument,
} from "./project/project-document";
import {
  
  saveProjectToLocalStorage,
} from "./project/project-storage";

import {
  StructureType,
  SortMode,
  LoadType,
  PhaseType,
  PhaseLine,
  LoadCharacter,
  PanelType,
  PanelPhaseType,
  Panel,
  PanelAnalyzer,
  ManualLoadType,
  CableType,
  Structure,
  CatalogItem,
  Load,
} from "./types";






const manualLoadTypes: ManualLoadType[] = [
  "Socket Outlet",
  "Lighting Circuit",
  "UPS Outlet",
  "Kitchen Outlet",
  "Spare Load",
  "Other",
];

const cosPhiOptions = ["0.75", "0.80", "0.85", "0.90", "0.95", "1.00"];

const cableTypeOptions: CableType[] = [
  "NYY",
  "N2XH",
  "NHXMH",
  "Flexible",
  "Other",
];

const countryOptions = [
  "Australia",
  "Austria",
  "Belgium",
  "Canada",
  "China",
  "Denmark",
  "Finland",
  "France",
  "Germany",
  "India",
  "Ireland",
  "Italy",
  "Japan",
  "Kuwait",
  "Netherlands",
  "Norway",
  "Poland",
  "Qatar",
  "Saudi Arabia",
  "Singapore",
  "South Korea",
  "Spain",
  "Sweden",
  "Switzerland",
  "Turkey",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Other",
];

const buildingTypeOptions = [
  "Hospital",
  "Shopping Mall",
  "Office",
  "Hotel",
  "Airport",
  "Factory",
  "Data Center",
  "School",
  "University",
  "Residential",
  "Other",
];

const countryFlags: Record<string, string> = {
  Australia: "🇦🇺",
  Austria: "🇦🇹",
  Belgium: "🇧🇪",
  Canada: "🇨🇦",
  China: "🇨🇳",
  Denmark: "🇩🇰",
  Finland: "🇫🇮",
  France: "🇫🇷",
  Germany: "🇩🇪",
  India: "🇮🇳",
  Ireland: "🇮🇪",
  Italy: "🇮🇹",
  Japan: "🇯🇵",
  Kuwait: "🇰🇼",
  Netherlands: "🇳🇱",
  Norway: "🇳🇴",
  Poland: "🇵🇱",
  Qatar: "🇶🇦",
  "Saudi Arabia": "🇸🇦",
  Singapore: "🇸🇬",
  "South Korea": "🇰🇷",
  Spain: "🇪🇸",
  Sweden: "🇸🇪",
  Switzerland: "🇨🇭",
  Turkey: "🇹🇷",
  "United Arab Emirates": "🇦🇪",
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
  Other: "🌍",
};

const buildingTypeIcons: Record<string, string> = {
  Hospital: "🏥",
  "Shopping Mall": "🛍️",
  Office: "🏢",
  Hotel: "🏨",
  Airport: "✈️",
  Factory: "🏭",
  "Data Center": "🖥️",
  School: "🏫",
  University: "🎓",
  Residential: "🏠",
  Other: "🏗️",
};


const fieldStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #334155",
  background: "#0f172a",
  color: "white",
  minHeight: 38,
};

const buttonStyle: React.CSSProperties = {
  background: "#38bdf8",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
  color: "#0f172a",
  fontWeight: "bold",
  minHeight: 38,
};

const summaryCardStyle: React.CSSProperties = {
  background: "#111827",
  border: "1px solid #334155",
  borderRadius: 12,
  padding: 14,
  minHeight: 92,
};

function formatNumber(value: number, digits = 2) {
  return value.toFixed(digits);
}

export default function Home() {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [projectDocumentId, setProjectDocumentId] = useState<string | null>(null);
  const [projectCreatedAt, setProjectCreatedAt] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [optionalName, setOptionalName] = useState("");
  const [projectCountry, setProjectCountry] = useState("");
  const [buildingType, setBuildingType] = useState("");
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [type, setType] = useState<StructureType>("project");
  const [sortMode, setSortMode] = useState<SortMode>("alphabetical");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<number[]>([]);
  const [selectedLoadDetail, setSelectedLoadDetail] = useState<Load | null>(null);
  const [selectedPanelDetail, setSelectedPanelDetail] = useState<Panel | null>(null);
  const [welcomeOpen, setWelcomeOpen] = useState(true);
  const [helpOpen, setHelpOpen] = useState(false);
  const [importModeOpen, setImportModeOpen] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);
  const [canRestoreEntireProject, setCanRestoreEntireProject] = useState(false);

  const [panelLocationOpen, setPanelLocationOpen] = useState(false);

  const [importProjectName, setImportProjectName] = useState("");
  const [importBuildingName, setImportBuildingName] = useState("");
  const [importBlockName, setImportBlockName] = useState("");
  const [importFloorName, setImportFloorName] = useState("");
  const [importRoomName, setImportRoomName] = useState("");
  const [importRoomOptionalName, setImportRoomOptionalName] = useState("");
  const [importCountry, setImportCountry] = useState("");
  const [importBuildingType, setImportBuildingType] = useState("");
  

  const [projectCode, setProjectCode] = useState("");
  const [description, setDescription] = useState("");
  const [loadNote, setLoadNote] = useState("");
  const [loadType, setLoadType] = useState<LoadType | "">("");
  const [manualLoadType, setManualLoadType] = useState<"" | ManualLoadType>("");
  const [brand, setBrand] = useState("");
  const [series, setSeries] = useState("");
  const [model, setModel] = useState("");
  const [loadPowerKw, setLoadPowerKw] = useState("");
  const [loadQuantity, setLoadQuantity] = useState("1");
  const [phaseType, setPhaseType] = useState<"" | PhaseType>("");
  const [phaseLine, setPhaseLine] = useState<"" | PhaseLine>("");
  const [loadCharacter, setLoadCharacter] = useState<"" | LoadCharacter>("");
  const [cosPhi, setCosPhi] = useState("");
  const [cableLengthM, setCableLengthM] = useState("");
  const [cableType, setCableType] = useState<"" | CableType>("");
  const [startingMethod, setStartingMethod] = useState("");
  const [panelName, setPanelName] = useState("");
  const [panelType, setPanelType] = useState<PanelType>("DB");
  const [panelPhaseType, setPanelPhaseType] = useState<PanelPhaseType>("3P");
  const [panelDescription, setPanelDescription] = useState("");
  const [panelEnvironment, setPanelEnvironment] = useState<"Indoor" | "Outdoor">( "Indoor");
  const [panelIpRating, setPanelIpRating] = useState("IP31");
  const [panelSupplyPanelId, setPanelSupplyPanelId] = useState("");
  const [panelSupplyPhaseLine, setPanelSupplyPhaseLine] = useState<"" | PhaseLine>("");
  const [panelCableLengthM, setPanelCableLengthM] = useState("");
  const [panelCableType, setPanelCableType] = useState<"" | CableType>("");
  const buildCurrentProjectDocument = (): CurristProjectDocument => {
  return createProjectDocument(
    {
      projectCountry,
      buildingType,
      structures,
      panels,
      loads,
    },
    projectDocumentId && projectCreatedAt
      ? {
          documentId: projectDocumentId,
          createdAt: projectCreatedAt,
        }
      : undefined
  );
};

const applyProjectDocument = (
  document: CurristProjectDocument
) => {
  setProjectDocumentId(document.documentId);
  setProjectCreatedAt(document.createdAt);

  setProjectCountry(document.projectCountry);
  setBuildingType(document.buildingType);

  setStructures(document.structures);
  setPanels(document.panels);
  setLoads(document.loads);

  setSelectedParent(null);
  setSelectedLoadDetail(null);
  setSelectedPanelDetail(null);
  setEditingId(null);
};

const saveCurrentProject = () => {
  const project = buildCurrentProjectDocument();

  saveProjectToLocalStorage(project);

  setProjectDocumentId(project.documentId);
  setProjectCreatedAt(project.createdAt);

  console.log("Project saved.", project);
};

useEffect(() => {
  // İlk yüklemede boş state'i kaydetme.
  if (
    structures.length === 0 &&
    panels.length === 0 &&
    loads.length === 0
  ) {
    return;
  }

  saveCurrentProject();
}, [
  structures,
  panels,
  loads,
  projectCountry,
  buildingType,
]);

  const getAvailableIpRatings = () => {if (panelEnvironment === "Outdoor") {return ["IP54", "IP65", "IP66"];
  }

  return ["IP31", "IP42", "IP54"];
};
useEffect(() => {
  if (panelType === "Packaged Panel") return;

  const availableIpRatings = getAvailableIpRatings();

  if (!availableIpRatings.includes(panelIpRating)) {
    setPanelIpRating(availableIpRatings[0]);
  }
}, [panelEnvironment, panelIpRating, panelType]);
  const [connectedPanelId, setConnectedPanelId] = useState("");
  const [editingLoadId, setEditingLoadId] = useState<number | null>(null);
  const [isCopyDraft, setIsCopyDraft] = useState(false);
  const [editingPanelId, setEditingPanelId] = useState<number | null>(null);
  const [copyPanelSource, setCopyPanelSource] = useState<Panel | null>(null);
  const [copyPanelName, setCopyPanelName] = useState("");
  const [copyLoadProjectCodes, setCopyLoadProjectCodes] = useState<Record<number, string>>({});
  const [expandedPanels, setExpandedPanels] = useState<Record<number, boolean>>({});
  
  const [analyzerName, setAnalyzerName] = useState("");
  const [selectedAnalyzerPanelId, setSelectedAnalyzerPanelId] = useState<number | null>(null);

  const selectedNode = useMemo(
    () => structures.find((s) => s.id === selectedParent),
    [structures, selectedParent]
  );

  const isCatalogLoad =
  loadType === "Pump" || loadType === "Fan" || loadType === "AHU";

const isManualLoad = loadType === "Manual";

const canAddLoad = selectedNode?.type === "room";

const canAddPanel =
  selectedNode?.type === "project" ||
  selectedNode?.type === "building" ||
  selectedNode?.type === "block" ||
  selectedNode?.type === "floor" ||
  selectedNode?.type === "room";

const isPackagedPanel = panelType === "Packaged Panel";

  const getAllowedChildTypes = (): StructureType[] => {
  if (!selectedNode) return ["project"];

  if (selectedNode.type === "project") return ["building"];
  if (selectedNode.type === "building") return ["block", "floor"];
  if (selectedNode.type === "block") return ["floor"];
  if (selectedNode.type === "floor") return ["room"];

  return [];
};

  const sortStructures = (items: Structure[]) => {
    const sorted = [...items];

    if (sortMode === "alphabetical") {
      sorted.sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          numeric: true,
          sensitivity: "base",
        })
      );
    } else {
      sorted.sort((a, b) => a.createdAt - b.createdAt);
    }

    return sorted;
  };

  const getChildren = (parentId: number | null) => {
    const children = structures.filter((s) => s.parentId === parentId);
    return sortStructures(children);
  };

  const hasChildren = (id: number) => {
    return structures.some((item) => item.parentId === id);
  };

  const isCollapsed = (id: number) => {
    return collapsedIds.includes(id);
  };

  const toggleCollapse = (id: number) => {
    setCollapsedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectNode = (item: Structure) => {
  setSelectedParent(item.id);
  setEditingId(null);
  setName("");

  if (item.type === "project") {
    setType("building");
  } else if (item.type === "building") {
    setType("block");
  } else if (item.type === "block") {
    setType("floor");
  } else if (item.type === "floor") {
    setType("room");
  }
};

    const handleSelectRoot = () => {
    setSelectedParent(null);
    setType("project");
    setEditingId(null);
    setName("");
  };

  const handleAddOrUpdate = () => {
  if (!name.trim()) return;

  if (editingId !== null) {
    setStructures((prev) =>
      prev.map((item) =>
        item.id === editingId
          ? {
              ...item,
              name: name.trim(),
              optionalName:
                item.type === "floor" || item.type === "room"
                  ? optionalName.trim() || undefined
                  : item.optionalName,
            }
          : item
      )
    );

    setEditingId(null);
    setName("");
    setOptionalName("");
    return;
  }

  const allowedTypes = getAllowedChildTypes();
  if (!allowedTypes.includes(type)) return;

  const now = Date.now();

  const newItem: Structure = {
    id: now,
    name: name.trim(),
    type,
    parentId: selectedParent,
    createdAt: now,
    optionalName:
      type === "floor" || type === "room"
        ? optionalName.trim() || undefined
        : undefined,
  };

  

  setStructures((prev) => [...prev, newItem]);
  setName("");
  setOptionalName("");

  if (selectedParent !== null) {
    setCollapsedIds((prev) => prev.filter((id) => id !== selectedParent));
  }

  
};

  const handleEditSelected = () => {
    if (!selectedNode) return;

    setEditingId(selectedNode.id);
    setName(selectedNode.name);
    setOptionalName(selectedNode.optionalName || "");
    setType(selectedNode.type);
  };

  const collectDescendantIds = (id: number): number[] => {
    const children = structures.filter((s) => s.parentId === id);
    let ids = [id];

    for (const child of children) {
      ids = [...ids, ...collectDescendantIds(child.id)];
    }

    return ids;
  };

  const handleDeleteSelected = () => {
    if (!selectedNode) return;

    const idsToDelete = collectDescendantIds(selectedNode.id);

    const confirmed = window.confirm(
      `"${selectedNode.name}" ve altındaki tüm öğeler silinecek. Emin misin?`
    );

    if (!confirmed) return;

    setStructures((prev) => prev.filter((s) => !idsToDelete.includes(s.id)));
    setCollapsedIds((prev) => prev.filter((id) => !idsToDelete.includes(id)));
    setLoads((prev) => prev.filter((load) => !idsToDelete.includes(load.roomId)));

    setSelectedParent(null);
    setType("project");

    if (editingId !== null && idsToDelete.includes(editingId)) {
      setEditingId(null);
      setName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");

    if (!selectedNode) {
    setType("project");
    return;
    }

    setType(selectedNode.type);
  };

  const getInputPlaceholder = () => {
    if (editingId !== null) return `Edit ${type} name`;
    if (type === "floor") return "Add floor number";
    if (type === "room") return "Add room number";
    return `Add ${type} name`;
  };

  const getActionButtonLabel = () => {
    if (editingId !== null) return "Update";
    if (type === "project") return "Add Project";
    if (type === "building") return "Add Building";
    if (type === "block") return "Add Block";
    if (type === "floor") return "Add Floor";
    return "Add Room";
  };

  const availableBrands = useMemo(() => {
    if (!isCatalogLoad) return [];

    return Array.from(
      new Set(
        catalog
          .filter((item) => item.loadType === loadType)
          .map((item) => item.brand)
      )
    );
  }, [loadType, isCatalogLoad]);

  const availableSeries = useMemo(() => {
    if (!isCatalogLoad) return [];

    return Array.from(
      new Set(
        catalog
          .filter(
            (item) => item.loadType === loadType && item.brand === brand
          )
          .map((item) => item.series)
      )
    );
  }, [loadType, brand, isCatalogLoad]);

  const availableModels = useMemo(() => {
    if (!isCatalogLoad) return [];

    return catalog.filter(
      (item) =>
        item.loadType === loadType &&
        item.brand === brand &&
        item.series === series
    );
  }, [loadType, brand, series, isCatalogLoad]);

  const availablePanelsForSelectedNode = useMemo(() => {
  return [...panels].sort((a, b) =>
    a.name.localeCompare(b.name, undefined, {
      numeric: true,
      sensitivity: "base",
    })
  );
}, [panels]);

  

  useEffect(() => {
  if (editingLoadId !== null || isCopyDraft) return;

  setBrand("");
  setSeries("");
  setModel("");
  setLoadPowerKw("");
  setManualLoadType("");
  setLoadCharacter("");
  setCosPhi("");

  if (!isManualLoad) {
    setPhaseType("");
    setPhaseLine("");
  }
}, [loadType, isManualLoad, editingLoadId, isCopyDraft]);

  useEffect(() => {
  if (editingLoadId !== null || isCopyDraft) return;

  setSeries("");
  setModel("");
  setLoadPowerKw("");
}, [brand, editingLoadId, isCopyDraft]);


  useEffect(() => {
  if (editingLoadId !== null || isCopyDraft) return;

  setModel("");
  setLoadPowerKw("");
}, [series, editingLoadId, isCopyDraft]);


  useEffect(() => {

    if (editingLoadId !== null || isCopyDraft) return;
    const selectedCatalogItem = catalog.find(
      
      (item) =>
        item.loadType === loadType &&
        item.brand === brand &&
        item.series === series &&
        item.model === model
    );

    if (!selectedCatalogItem) {
      setLoadPowerKw("");

      if (!isManualLoad) {
        setPhaseType("");
        setPhaseLine("");
      }

      return;
    }

    setLoadPowerKw(String(selectedCatalogItem.powerKw));
    setPhaseType(selectedCatalogItem.phaseType as PhaseType);
    setLoadCharacter(selectedCatalogItem.loadCharacter as LoadCharacter);
    setCosPhi("0.85");

    if (selectedCatalogItem.phaseType === "3P") {
      setPhaseLine("");
    }
  }, [loadType, brand, series, model, isManualLoad, editingLoadId, isCopyDraft]);

  useEffect(() => {
  if (panelType === "Packaged Panel") {
    setPanelEnvironment("Indoor");
    setPanelIpRating("");
  }
}, [panelType]);

const handleAddPanel = () => {
  if (!selectedNode) return;
  if (!panelName.trim()) return;
  const parsedPanelCableLength =
  panelCableLengthM.trim() === "" ? undefined : Number(panelCableLengthM);

if (
  parsedPanelCableLength !== undefined &&
  (Number.isNaN(parsedPanelCableLength) || parsedPanelCableLength < 0)
) {
  window.alert("Panel cable length must be a valid positive number.");
  return;
}
  if (editingPanelId !== null) {
  setPanels((prev) =>
    prev.map((panel) =>
      panel.id === editingPanelId
        ? {
            ...panel,
            name: panelName.trim(),
            panelType,
            phaseType: panelPhaseType,
            structureId: selectedNode.id,
            description: panelDescription.trim() || undefined,
            environment: isPackagedPanel ? undefined : panelEnvironment,
            ipRating: isPackagedPanel ? undefined : panelIpRating,
            supplyPanelId:
            panelSupplyPanelId.trim() === "" ? undefined : Number(panelSupplyPanelId),
            supplyPhaseLine:
            isPackagedPanel && panelPhaseType === "1P" && panelSupplyPhaseLine
            ? panelSupplyPhaseLine
            : undefined,
            cableLengthM: isPackagedPanel ? parsedPanelCableLength : undefined,
            cableType: isPackagedPanel ? panelCableType || undefined : undefined,
          }
        : panel
    )
  );

  setEditingPanelId(null);

  setPanelName("");
  setPanelType("DB");
  setPanelPhaseType("3P");
  setPanelDescription("");
  setPanelEnvironment("Indoor");
  setPanelSupplyPanelId("");
  setPanelSupplyPhaseLine("");
  setPanelCableLengthM("");
  setPanelCableType("");
  setPanelIpRating("IP31");

  return;
}

  const now = Date.now();

  const newPanel: Panel = {
  id: now,
  name: panelName.trim(),
  panelType,
  phaseType: panelPhaseType,
  structureId: selectedNode.id,
  description: panelDescription.trim() || undefined,
  environment: isPackagedPanel ? undefined : panelEnvironment,
  ipRating: isPackagedPanel ? undefined : panelIpRating,
  supplyPanelId:
    panelSupplyPanelId.trim() === "" ? undefined : Number(panelSupplyPanelId),
  supplyPhaseLine:
    isPackagedPanel && panelPhaseType === "1P" && panelSupplyPhaseLine
      ? panelSupplyPhaseLine
      : undefined,
  cableLengthM: isPackagedPanel ? parsedPanelCableLength : undefined,
  cableType: isPackagedPanel ? panelCableType || undefined : undefined,
  createdAt: now,
};



  setPanels((prev) => [...prev, newPanel]);

  setPanelName("");
  setPanelType("DB");
  setPanelPhaseType("3P");
  setPanelDescription("");
  setPanelEnvironment("Indoor");
  setPanelSupplyPanelId("");
  setPanelSupplyPhaseLine("");
  setPanelCableLengthM("");
  setPanelCableType("");
  setPanelIpRating("IP31");
};

const handleDeletePanel = (panelId: number) => {
  const hasConnectedLoads = loads.some(
    (load) => load.connectedPanelId === panelId
  );

  if (hasConnectedLoads) {
    const confirmedWithLoads = window.confirm(
      "This panel has connected loads. If you delete it, these loads will be unassigned. Continue?"
    );

    if (!confirmedWithLoads) return;

    setLoads((prev) =>
      prev.map((load) =>
        load.connectedPanelId === panelId
          ? { ...load, connectedPanelId: undefined, updatedAt: Date.now() }
          : load
      )
    );
  } else {
    const confirmed = window.confirm(
      "This panel will be deleted. Are you sure?"
    );

    if (!confirmed) return;
  }

  setPanels((prev) =>
    prev.filter((panel) => panel.id !== panelId)
  );
};

  const handleAddLoad = () => {
  if (!selectedNode || selectedNode.type !== "room") return;
  if (!loadType) return;
  if (!projectCode.trim()) return;
  if (!description.trim()) return;
  if (!loadCharacter) return;

  if (isCatalogLoad && !brand) return;
  if (isCatalogLoad && !series) return;
  if (isCatalogLoad && !model) return;
  if (isManualLoad && !manualLoadType) return;
  if (isManualLoad && !phaseType) return;
  if (phaseType !== "1P" && phaseType !== "3P") return;
  if (phaseType === "1P" && !phaseLine) return;

  const selectedConnectedPanel =
  connectedPanelId.trim() === ""
    ? undefined
    : panels.find((panel) => panel.id === Number(connectedPanelId));

if (
  selectedConnectedPanel?.panelType === "Packaged Panel" &&
  selectedConnectedPanel.phaseType === "1P" &&
  phaseType === "3P"
) {
  window.alert("3P load cannot be connected to a 1P packaged panel.");
  return;
}

    const normalizedProjectCode = projectCode.trim().toLowerCase();
    const projectCodeExists = loads.some(
    (load) =>
    load.projectCode.trim().toLowerCase() === normalizedProjectCode &&
    load.id !== editingLoadId
);

    if (projectCodeExists) {
    window.alert("Project Code must be unique.");
    return;
    }


    const powerKw = Number(loadPowerKw);
    const quantity = Number(loadQuantity);
    const parsedCosPhi = cosPhi.trim() === "" ? undefined : Number(cosPhi);
    const parsedCableLength =
      cableLengthM.trim() === "" ? undefined : Number(cableLengthM);

    if (Number.isNaN(powerKw) || powerKw <= 0) return;
    if (Number.isNaN(quantity) || quantity <= 0) return;

    if (parsedCosPhi !== undefined) {
      if (Number.isNaN(parsedCosPhi) || parsedCosPhi <= 0 || parsedCosPhi > 1) {
        return;
      }
    }

    if (parsedCableLength !== undefined) {
      if (Number.isNaN(parsedCableLength) || parsedCableLength < 0) {
        return;
      }
    }

    const normalizedPhaseLine: PhaseLine | undefined =
  phaseType === "1P" && phaseLine !== "" ? phaseLine : undefined;

    if (editingLoadId !== null) {
    setLoads((prev) =>
    prev.map((load) =>
      load.id === editingLoadId
        ? {
            ...load,
            projectCode: projectCode.trim(),
            description: description.trim(),
            note: loadNote.trim() || undefined,
            loadType,
            manualLoadType:
              isManualLoad && manualLoadType ? manualLoadType : undefined,
            brand: isCatalogLoad ? brand : "",
            series: isCatalogLoad ? series : "",
            model: isCatalogLoad ? model : "",
            powerKw,
            quantity,
            phaseType,
            phaseLine: normalizedPhaseLine,
            roomId: selectedNode.id,
            connectedPanelId:
              connectedPanelId.trim() === ""
                ? undefined
                : Number(connectedPanelId),
            loadCharacter: loadCharacter || undefined,
            cosPhi: parsedCosPhi,
            cableLengthM: parsedCableLength,
            cableType: cableType || undefined,
            startingMethod: startingMethod || undefined,
            updatedAt: Date.now(),
          }
        : load
    )
  );

  setEditingLoadId(null);
  setProjectCode("");
  setDescription("");
  setLoadNote("");
  setLoadPowerKw("");
  setLoadQuantity("1");
  setBrand("");
  setSeries("");
  setModel("");
  setLoadType("");
  setManualLoadType("");
  setPhaseType("");
  setPhaseLine("");
  setLoadCharacter("");
  setCosPhi("");
  setCableLengthM("");
  setConnectedPanelId("");
  setIsCopyDraft(false);

  return;
}

    const now = Date.now();

    

    const newLoad: Load = {
      id: now,
      projectCode: projectCode.trim(),
      description: description.trim(),
      note: loadNote.trim() || undefined,
      loadType,
      manualLoadType: isManualLoad && manualLoadType ? manualLoadType : undefined,
      brand: isCatalogLoad ? brand : "",
      series: isCatalogLoad ? series : "",
      model: isCatalogLoad ? model : "",
      powerKw,
      quantity,
      phaseType,
      phaseLine: normalizedPhaseLine,
      roomId: selectedNode.id,
      connectedPanelId:
        connectedPanelId.trim() === "" ? undefined : Number(connectedPanelId),
      createdAt: now,
      updatedAt: now,
      loadCharacter: loadCharacter || undefined,
      cosPhi: parsedCosPhi,
      cableLengthM: parsedCableLength,
      cableType: cableType || undefined,
      startingMethod: startingMethod || undefined,
      
    };

    setLoads((prev) => [...prev, newLoad]);

    setProjectCode("");
    setDescription("");
    setLoadNote("");
    setLoadPowerKw("");
    setLoadQuantity("1");
    setBrand("");
    setSeries("");
    setModel("");
    setLoadType("");
    setManualLoadType("");
    setPhaseType("");
    setPhaseLine("");
    setLoadCharacter("");
    setCosPhi("");
    setCableLengthM("");
    setConnectedPanelId("");
    setIsCopyDraft(false);
  };

  const handleChangeLoadPanel = (loadId: number, newPanelId: string) => {
  const selectedLoad = loads.find((load) => load.id === loadId);

  if (!selectedLoad) return;

  if (newPanelId.trim() !== "") {
    const selectedPanel = panels.find(
      (panel) => panel.id === Number(newPanelId)
    );

    if (!selectedPanel) return;

    if (selectedPanel.phaseType === "1P" && selectedLoad.phaseType === "3P") {
      return;
    }
  }

  setLoads((prev) =>
    prev.map((load) =>
      load.id === loadId
        ? {
            ...load,
            connectedPanelId:
              newPanelId.trim() === "" ? undefined : Number(newPanelId),
          }
        : load
    )
  );
};

const handleDeleteLoad = (loadId: number) => {
  const confirmed = window.confirm(
    "This load will be deleted. Are you sure?"
  );

  if (!confirmed) return;

  setLoads((prev) =>
    prev.filter((load) => load.id !== loadId)
  );
  };

const handleStartEditLoad = (load: Load) => {
  setSelectedParent(load.roomId);
  setEditingLoadId(load.id);

  setProjectCode(load.projectCode);
  setDescription(load.description);
  setLoadNote(load.note || "");
  setLoadType(load.loadType);
  setManualLoadType(load.manualLoadType || "");
  setBrand(load.brand);
  setSeries(load.series);
  setModel(load.model);
  setLoadPowerKw(String(load.powerKw));
  setLoadQuantity(String(load.quantity));
  setPhaseType(load.phaseType);
  setPhaseLine(load.phaseLine || "");
  setLoadCharacter(load.loadCharacter || "");
  setCosPhi(load.cosPhi !== undefined ? String(load.cosPhi) : "");
  setCableLengthM(
    load.cableLengthM !== undefined ? String(load.cableLengthM) : ""
  );
  setCableType(load.cableType || "");
  setStartingMethod(load.startingMethod || "");
  setConnectedPanelId(
    load.connectedPanelId !== undefined ? String(load.connectedPanelId) : ""
  );
};

const handleCopyLoad = (load: Load) => {
  setSelectedParent(load.roomId);
  setEditingLoadId(null);
  setIsCopyDraft(true);

  setProjectCode(load.projectCode);
  setDescription(load.description);
  setLoadNote(load.note || "");
  setLoadType(load.loadType);
  setManualLoadType(load.manualLoadType || "");
  setLoadPowerKw(String(load.powerKw));
  setLoadQuantity(String(load.quantity));
  setPhaseType(load.phaseType);
  setPhaseLine(load.phaseLine || "");
  setLoadCharacter(load.loadCharacter || "");
  setCosPhi(load.cosPhi !== undefined ? String(load.cosPhi) : "");
  setCableLengthM(
  load.cableLengthM !== undefined ? String(load.cableLengthM) : ""
);
setCableType(load.cableType || "");
setStartingMethod(load.startingMethod || "");
  setConnectedPanelId(
    load.connectedPanelId !== undefined ? String(load.connectedPanelId) : ""
  );

  setTimeout(() => {
    setBrand(load.brand);
    setSeries(load.series);
    setModel(load.model);
  }, 0);
};

const togglePanelExpand = (panelId: number) => {
  setExpandedPanels((prev) => ({
    ...prev,
    [panelId]: !(prev[panelId] ?? true),
  }));
};

const handleAddAnalyzerToPanel = (panelId: number) => {
  if (!analyzerName.trim()) return;

  const now = Date.now();

  const newAnalyzer: PanelAnalyzer = {
    id: now,
    name: analyzerName.trim(),
    connectedLoadIds: [],
  };

  setPanels((prev) =>
    prev.map((panel) =>
      panel.id === panelId
        ? {
            ...panel,
            analyzers: [...(panel.analyzers || []), newAnalyzer],
          }
        : panel
    )
  );

  setAnalyzerName("");
  setSelectedAnalyzerPanelId(null);
};

const handleDeleteAnalyzer = (panelId: number, analyzerId: number) => {
  setPanels((prev) =>
    prev.map((panel) =>
      panel.id === panelId
        ? {
            ...panel,
            analyzers: (panel.analyzers || []).filter(
              (analyzer) => analyzer.id !== analyzerId
            ),
          }
        : panel
    )
  );
};

const handleToggleAnalyzerLoad = (
  panelId: number,
  analyzerId: number,
  loadId: number
) => {
  setPanels((prev) =>
    prev.map((panel) => {
      if (panel.id !== panelId) return panel;

      const analyzers = panel.analyzers || [];

      const selectedInCurrentAnalyzer =
        analyzers
          .find((analyzer) => analyzer.id === analyzerId)
          ?.connectedLoadIds.includes(loadId) || false;

      return {
        ...panel,
        analyzers: analyzers.map((analyzer) => {
          if (analyzer.id === analyzerId) {
            return {
              ...analyzer,
              connectedLoadIds: selectedInCurrentAnalyzer
                ? analyzer.connectedLoadIds.filter((id) => id !== loadId)
                : [...analyzer.connectedLoadIds, loadId],
            };
          }

          return {
            ...analyzer,
            connectedLoadIds: analyzer.connectedLoadIds.filter(
              (id) => id !== loadId
            ),
          };
        }),
      };
    })
  );
};

const getPanelsByNode = (nodeId: number) => {
  return panels
    .filter((panel) => panel.structureId === nodeId)
    .filter(
      (panel) =>
        !(
          panel.panelType === "Packaged Panel" &&
          panel.supplyPanelId !== undefined
        )
    )
    .sort((a, b) =>
      a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
};

  const getLoadsByRoom = (roomId: number) => {
    const roomLoads = loads.filter((load) => load.roomId === roomId);

    return [...roomLoads].sort((a, b) =>
      a.projectCode.localeCompare(b.projectCode, undefined, {
        numeric: true,
        sensitivity: "base",
      })
    );
  };

  const summary = useMemo(() => {
  const totalInstalledPowerKw = loads.reduce(
    (sum, load) => sum + load.powerKw * load.quantity,
    0
  );

  const onePhaseLoads = loads.filter((load) => load.phaseType === "1P");
  const threePhaseLoads = loads.filter((load) => load.phaseType === "3P");

  const ohmicCount = loads.filter((load) => load.loadCharacter === "Ohmic").length;
  const inductiveCount = loads.filter(
    (load) => load.loadCharacter === "Inductive"
  ).length;
  const capacitiveCount = loads.filter(
    (load) => load.loadCharacter === "Capacitive"
  ).length;

  const ohmicPowerKw = loads
    .filter((load) => load.loadCharacter === "Ohmic")
    .reduce((sum, load) => sum + load.powerKw * load.quantity, 0);

  const inductivePowerKw = loads
    .filter((load) => load.loadCharacter === "Inductive")
    .reduce((sum, load) => sum + load.powerKw * load.quantity, 0);

  const capacitivePowerKw = loads
    .filter((load) => load.loadCharacter === "Capacitive")
    .reduce((sum, load) => sum + load.powerKw * load.quantity, 0);

  const phaseLoadsKw = {
    R: 0,
    S: 0,
    T: 0,
  };

  loads.forEach((load) => {
  const connectedPanel = panels.find(
    (panel) => panel.id === load.connectedPanelId
  );

  const p = load.powerKw * load.quantity;

  if (connectedPanel?.panelType === "Packaged Panel") {
    if (connectedPanel.phaseType === "3P") {
      phaseLoadsKw.R += p / 3;
      phaseLoadsKw.S += p / 3;
      phaseLoadsKw.T += p / 3;
      return;
    }

    if (
      connectedPanel.phaseType === "1P" &&
      connectedPanel.supplyPhaseLine
    ) {
      phaseLoadsKw[connectedPanel.supplyPhaseLine] += p;
      return;
    }
  }

  if (load.phaseType === "1P" && load.phaseLine) {
    phaseLoadsKw[load.phaseLine] += p;
    return;
  }

  if (load.phaseType === "3P") {
    phaseLoadsKw.R += p / 3;
    phaseLoadsKw.S += p / 3;
    phaseLoadsKw.T += p / 3;
  }
});

  const totalSinglePhasePowerKw =
    phaseLoadsKw.R + phaseLoadsKw.S + phaseLoadsKw.T;

    const projectLoadCount =
  loads.filter((load) => {
    const connectedPanel = panels.find(
      (panel) => panel.id === load.connectedPanelId
    );

    return connectedPanel?.panelType !== "Packaged Panel";
  }).length +
  panels.filter(
    (panel) => panel.panelType === "Packaged Panel"
  ).length;

  const estimatedCurrentA = loads.reduce((sum, load) => {
    const totalPowerW = load.powerKw * load.quantity * 1000;
    const cosValue = load.cosPhi && load.cosPhi > 0 ? load.cosPhi : 1;

    if (load.phaseType === "1P") {
      return sum + totalPowerW / (230 * cosValue);
    }

    return sum + totalPowerW / (1.732 * 400 * cosValue);
  }, 0);

  let totalP = 0;
  let totalQ = 0;
  let totalS = 0;
  let weightedCosNumerator = 0;
  let weightedCosDenominator = 0;

  loads.forEach((load) => {
    const p = load.powerKw * load.quantity;
    const cosValue = load.cosPhi && load.cosPhi > 0 ? load.cosPhi : 1;
    const s = p / cosValue;
    const qBase = Math.sqrt(Math.max(s * s - p * p, 0));

    let signedQ = qBase;

    if (load.loadCharacter === "Capacitive") {
      signedQ = -qBase;
    } else if (load.loadCharacter === "Ohmic") {
      signedQ = 0;
    }

    totalP += p;
    totalQ += signedQ;
    totalS += s;

    weightedCosNumerator += p * cosValue;
    weightedCosDenominator += p;
  });

  

  const averageCosPhi =
    weightedCosDenominator > 0
      ? weightedCosNumerator / weightedCosDenominator
      : 1;

  return {
    totalInstalledPowerKw,
    estimatedCurrentA,
    onePhaseCount: onePhaseLoads.length,
    threePhaseCount: threePhaseLoads.length,
    ohmicCount,
    inductiveCount,
    capacitiveCount,
    ohmicPowerKw,
    inductivePowerKw,
    capacitivePowerKw,
    phaseLoadsKw,
    totalSinglePhasePowerKw,
    totalLoadCount: projectLoadCount,
    totalP,
    totalQ,
    totalS,
    averageCosPhi,
  };
}, [loads, panels]);


const panelSummaries = useMemo(() => {
  return panels.map(panel => {
    const panelLoads = loads.filter(
      (load) => load.connectedPanelId === panel.id
    );

    const childPackagedPanels = panels.filter(
  (item) =>
    item.panelType === "Packaged Panel" &&
    item.supplyPanelId === panel.id
);

const childPackagedPanelLoads = childPackagedPanels.flatMap((childPanel) =>
  loads.filter((load) => load.connectedPanelId === childPanel.id)
);

const allPanelLoads = [...panelLoads, ...childPackagedPanelLoads];

    const totalKw = allPanelLoads.reduce(
      (sum, load) => sum + load.powerKw * load.quantity,
      0
    );

    const totalCurrent = allPanelLoads.reduce((sum, load) => {
      const totalPowerW = load.powerKw * load.quantity * 1000;
      const cosValue = load.cosPhi && load.cosPhi > 0 ? load.cosPhi : 1;

      if (load.phaseType === "1P") {
        return sum + totalPowerW / (230 * cosValue);
      }

      return sum + totalPowerW / (1.732 * 400 * cosValue);
    }, 0);

    let weightedCosNumerator = 0;
let weightedCosDenominator = 0;

allPanelLoads.forEach((load) => {
  const p = load.powerKw * load.quantity;
  const cosValue = load.cosPhi && load.cosPhi > 0 ? load.cosPhi : 1;

  weightedCosNumerator += p * cosValue;
  weightedCosDenominator += p;
});

const averageCosPhi =
  weightedCosDenominator > 0
    ? weightedCosNumerator / weightedCosDenominator
    : 1;

let panelP = 0;
let panelQ = 0;
let panelS = 0;

let panelR = 0;
let panelSPhase = 0;
let panelT = 0;

allPanelLoads.forEach((load) => {
  const p = load.powerKw * load.quantity;

  if (load.phaseType === "1P") {
  if (load.phaseLine === "R") panelR += p;
  if (load.phaseLine === "S") panelSPhase += p;
  if (load.phaseLine === "T") panelT += p;
}

if (load.phaseType === "3P") {
  panelR += p / 3;
  panelSPhase += p / 3;
  panelT += p / 3;
}

  const cosValue = load.cosPhi && load.cosPhi > 0 ? load.cosPhi : 1;
  const s = p / cosValue;
  const qBase = Math.sqrt(Math.max(s * s - p * p, 0));

  let signedQ = qBase;

  if (load.loadCharacter === "Capacitive") {
    signedQ = -qBase;
  } else if (load.loadCharacter === "Ohmic") {
    signedQ = 0;
  }

  panelP += p;
  panelQ += signedQ;
  panelS += s;
});


    return {
  panelId: panel.id,
  name: panel.name,
  panelType: panel.panelType,
  totalKw,
  totalCurrent,
  averageCosPhi,
  panelP,
  panelQ,
  panelS,
  panelR,
  panelSPhase,
  panelT,
  loadCount: panelLoads.length + childPackagedPanels.length,
};


  });
}, [panels, loads]);

  const phaseSegments = useMemo(() => {
    const total = summary.totalSinglePhasePowerKw;

    if (total <= 0) {
      return [
        { label: "R", value: 33.33 },
        { label: "S", value: 33.33 },
        { label: "T", value: 33.34 },
      ];
    }

    return [
      { label: "R", value: (summary.phaseLoadsKw.R / total) * 100 },
      { label: "S", value: (summary.phaseLoadsKw.S / total) * 100 },
      { label: "T", value: (summary.phaseLoadsKw.T / total) * 100 },
    ];
  }, [summary]);

  const phaseDonutBackground = `conic-gradient(
    #38bdf8 0% ${phaseSegments[0].value}%,
    #22c55e ${phaseSegments[0].value}% ${phaseSegments[0].value + phaseSegments[1].value}%,
    #f59e0b ${phaseSegments[0].value + phaseSegments[1].value}% 100%
  )`;

const getVoltage = (load: Load) => {
  return load.phaseType === "1P" ? 230 : 380;
};

const getCurrent = (load: Load) => {
  const totalPowerW = load.powerKw * load.quantity * 1000;
  const cosValue = load.cosPhi && load.cosPhi > 0 ? load.cosPhi : 1;

  if (load.phaseType === "1P") {
    return totalPowerW / (230 * cosValue);
  }

  return totalPowerW / (1.732 * 400 * cosValue);
};

const getCalculatedCableSection = (
  currentA: number,
  lengthM: number,
  phaseType: PhaseType
) => {
  const sections = [
    1.5, 2.5, 4, 6, 10, 16,
    25, 35, 50, 70, 95,
    120, 150, 185, 240,
  ];

  const voltage = phaseType === "1P" ? 230 : 400;
  const maxVoltageDropPercent = 3;
  const copperResistivity = 0.0175;

  for (const section of sections) {
    const voltageDrop =
      phaseType === "1P"
        ? (2 * currentA * lengthM * copperResistivity) / section
        : (1.732 * currentA * lengthM * copperResistivity) / section;

    const voltageDropPercent = (voltageDrop / voltage) * 100;

    if (voltageDropPercent <= maxVoltageDropPercent) {
      return section;
    }
  }

  return 240;
};


const getEquipmentType = (load: Load) => {
  if (
    load.loadType === "Manual" &&
    load.manualLoadType
  ) {
    return `Manual - ${load.manualLoadType}`;
  }

  return load.loadType;
};

const readInternalTable = (
  sheet: XLSX.WorkSheet,
  markerName: string
): Record<string, unknown>[] => {
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    header: 1,
    defval: "",
  }) as unknown as unknown[][];

  const markerRowIndex = rows.findIndex(
    (row) => row[0] === markerName
  );

  if (markerRowIndex === -1) return [];

  const headerRow = rows[markerRowIndex + 1] as string[];
  const dataRows = rows.slice(markerRowIndex + 2);

  const nextMarkerIndex = dataRows.findIndex(
    (row) => typeof row[0] === "string" && row[0].startsWith("[")
  );

  const tableRows =
    nextMarkerIndex === -1 ? dataRows : dataRows.slice(0, nextMarkerIndex);

  return tableRows
    .filter((row) => row.some((cell) => cell !== ""))
    .map((row) => {
      const item: Record<string, unknown> = {};

      headerRow.forEach((header, index) => {
        if (!header) return;
        item[header] = row[index] ?? "";
      });

      return item;
    });
};

const parseStructures = (
  rows: Record<string, unknown>[]
): Structure[] => {
  return rows.map((row) => ({
    id: Number(row.ID),
    parentId:
      row.ParentID === "" ? null : Number(row.ParentID),
    type: row.Type as StructureType,
    name: String(row.Name),
    optionalName:
      row.OptionalName === ""
        ? undefined
        : String(row.OptionalName),
    createdAt: Date.now(),
  }));
};

const parsePanels = (
  rows: Record<string, unknown>[]
): Panel[] => {
  return rows.map((row) => ({
    id: Number(row.ID),
    structureId: Number(row.StructureID),
    name: String(row.Name),
    panelType: row.PanelType as PanelType,
    phaseType: row.PhaseType as PanelPhaseType,
    description: String(row.Description || ""),
    environment:
      row.Environment === ""
        ? undefined
        : (row.Environment as "Indoor" | "Outdoor"),
    ipRating:
      row.IpRating === ""
        ? undefined
        : String(row.IpRating),
    supplyPanelId:
      row.SupplyPanelID === ""
        ? undefined
        : Number(row.SupplyPanelID),
    supplyPhaseLine:
      row.SupplyPhaseLine === ""
        ? undefined
        : (row.SupplyPhaseLine as PhaseLine),
    cableLengthM:
      row.CableLengthM === ""
        ? undefined
        : Number(row.CableLengthM),
    cableType:
      row.CableType === ""
        ? undefined
        : (row.CableType as CableType),
    createdAt: Number(row.CreatedAt),
    analyzers: [],
  }));
};

const parseLoads = (
  rows: Record<string, unknown>[]
): Load[] => {
  return rows.map((row) => ({
    id: Number(row.ID),
    connectedPanelId:
      row.ConnectedPanelID === ""
        ? undefined
        : Number(row.ConnectedPanelID),
    roomId: Number(row.RoomID),
    projectCode: String(row.ProjectCode),
    description: String(row.Description),
    loadType: row.LoadType as LoadType,
    manualLoadType:
      row.ManualLoadType === ""
        ? undefined
        : (row.ManualLoadType as ManualLoadType),
    powerKw: Number(row.PowerKw),
    quantity: Number(row.Quantity),
    phaseType: row.PhaseType as PhaseType,
    phaseLine:
      row.PhaseLine === ""
        ? undefined
        : (row.PhaseLine as PhaseLine),
    cosPhi:
      row.CosPhi === ""
        ? undefined
        : Number(row.CosPhi),
    loadCharacter:
      row.LoadCharacter === ""
        ? undefined
        : (row.LoadCharacter as LoadCharacter),
    startingMethod:
      row.StartingMethod === ""
        ? undefined
        : String(row.StartingMethod),
    cableLengthM:
      row.CableLengthM === ""
        ? undefined
        : Number(row.CableLengthM),
    cableType:
      row.CableType === ""
        ? undefined
        : (row.CableType as CableType),
    brand: String(row.Brand || ""),
    series: String(row.Series || ""),
    model: String(row.Model || ""),
    note:
      row.Note === ""
        ? undefined
        : String(row.Note),
    createdAt: Number(row.CreatedAt),
    updatedAt:
      row.UpdatedAt === ""
        ? undefined
        : Number(row.UpdatedAt),
  }));
};

const parseAnalyzers = (
  rows: Record<string, unknown>[],
  panels: Panel[]
): Panel[] => {
  const updatedPanels = [...panels];

  rows.forEach((row) => {
    const panelId = Number(row.PanelID);

    const panel = updatedPanels.find((p) => p.id === panelId);

    if (!panel) return;

    if (!panel.analyzers) {
      panel.analyzers = [];
    }

    panel.analyzers.push({
      id: Number(row.AnalyzerID),
      name: String(row.AnalyzerName),
      connectedLoadIds: String(row.ConnectedLoadIDs)
        .split(",")
        .filter(Boolean)
        .map(Number),
    });
  });

  return updatedPanels;
};

const handleImportFileSelection = async (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const file = event.target.files?.[0];

  if (!file) return;

  try {
    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      type: "array",
    });

    const internalSheet = workbook.Sheets["__currist_internal__"];

    if (!internalSheet) {
      window.alert("This file is not a valid Currist export file.");
      return;
    }

    const marker = internalSheet["A1"]?.v;

    if (marker !== "CURRIST_INTERNAL") {
      window.alert("Invalid Currist internal data.");
      return;
    }

    const projectMetaData = readInternalTable(
      internalSheet,
      "[PROJECT_META]"
    );

    const structuresData = readInternalTable(
      internalSheet,
      "[STRUCTURES]"
    );

    const panelsData = readInternalTable(
      internalSheet,
      "[PANELS]"
    );

    const loadsData = readInternalTable(
      internalSheet,
      "[LOADS]"
    );

    const canRestore =
      projectMetaData.length > 0 &&
      structuresData.length > 0 &&
      panelsData.length > 0 &&
      loadsData.length > 0;

    setPendingImportFile(file);
    setCanRestoreEntireProject(canRestore);
    setImportModeOpen(true);
  } catch (error) {
    console.error(error);
    window.alert("Import file could not be read.");
  } finally {
    event.target.value = "";
  }
};

  const preparePanelImport = async (file: File) => {
  try {
    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      type: "array",
    });

    const internalSheet = workbook.Sheets["__currist_internal__"];
    const reportSheet = workbook.Sheets["Panel Report"];

    if (!internalSheet || !reportSheet) {
      window.alert("This file does not contain valid panel import data.");
      return;
    }

    const projectMetaData = readInternalTable(
      internalSheet,
      "[PROJECT_META]"
    );

    const structuresData = readInternalTable(
      internalSheet,
      "[STRUCTURES]"
    );

    const panelsData = readInternalTable(
      internalSheet,
      "[PANELS]"
    );

    const sourcePanelName = String(reportSheet["A1"]?.v || "");

    const sourcePanel = panelsData.find(
      (row) => String(row.Name) === sourcePanelName
    );

    if (!sourcePanel) {
      window.alert("The exported panel could not be identified.");
      return;
    }

    const sourceStructureId = Number(sourcePanel.StructureID);

    const sourceStructures = parseStructures(structuresData);

    const selectedLocation = sourceStructures.find(
      (item) => item.id === sourceStructureId
    );

    const locationChain: Structure[] = [];

    let currentLocation = selectedLocation;

    while (currentLocation) {
      locationChain.unshift(currentLocation);

      currentLocation = sourceStructures.find(
        (item) => item.id === currentLocation?.parentId
      );
    }

    const projectNode = locationChain.find(
      (item) => item.type === "project"
    );

    const buildingNode = locationChain.find(
      (item) => item.type === "building"
    );

    const blockNode = locationChain.find(
      (item) => item.type === "block"
    );

    const floorNode = locationChain.find(
      (item) => item.type === "floor"
    );

    const roomNode = locationChain.find(
      (item) => item.type === "room"
    );

    setImportProjectName(projectNode?.name || "");
    setImportBuildingName(buildingNode?.name || "");
    setImportBlockName(blockNode?.name || "");
    setImportFloorName(floorNode?.name || "");
    setImportRoomName(roomNode?.name || "");
    setImportRoomOptionalName(roomNode?.optionalName || "");

    setImportCountry(
      String(projectMetaData[0]?.ProjectCountry || "")
    );

    setImportBuildingType(
      String(projectMetaData[0]?.BuildingType || "")
    );

    setImportModeOpen(false);
    setPanelLocationOpen(true);
  } catch (error) {
    console.error(error);
    window.alert("Panel import data could not be prepared.");
  }
};

  const createPanelImportLocation = () => {
  const projectName = importProjectName.trim();
  const buildingName = importBuildingName.trim();
  const blockName = importBlockName.trim();
  const floorName = importFloorName.trim();
  const roomName = importRoomName.trim();
  const roomOptionalName = importRoomOptionalName.trim();

  if (!projectName || !buildingName || !floorName || !roomName) {
    window.alert(
      "Project, Building, Floor and Room fields are required."
    );

    return null;
  }

  const nextStructures = [...structures];

  let nextId = Date.now();

  const createId = () => {
    nextId += 1;
    return nextId;
  };

  const namesMatch = (first: string, second: string) =>
    first.trim().toLowerCase() === second.trim().toLowerCase();

  let projectNode = nextStructures.find(
    (item) =>
      item.type === "project" &&
      item.parentId === null &&
      namesMatch(item.name, projectName)
  );

  if (!projectNode) {
    projectNode = {
      id: createId(),
      name: projectName,
      type: "project",
      parentId: null,
      createdAt: Date.now(),
    };

    nextStructures.push(projectNode);
  }

  let buildingNode = nextStructures.find(
    (item) =>
      item.type === "building" &&
      item.parentId === projectNode.id &&
      namesMatch(item.name, buildingName)
  );

  if (!buildingNode) {
    buildingNode = {
      id: createId(),
      name: buildingName,
      type: "building",
      parentId: projectNode.id,
      createdAt: Date.now(),
    };

    nextStructures.push(buildingNode);
  }

  let floorParentId = buildingNode.id;

  if (blockName) {
    let blockNode = nextStructures.find(
      (item) =>
        item.type === "block" &&
        item.parentId === buildingNode.id &&
        namesMatch(item.name, blockName)
    );

    if (!blockNode) {
      blockNode = {
        id: createId(),
        name: blockName,
        type: "block",
        parentId: buildingNode.id,
        createdAt: Date.now(),
      };

      nextStructures.push(blockNode);
    }

    floorParentId = blockNode.id;
  }

  let floorNode = nextStructures.find(
    (item) =>
      item.type === "floor" &&
      item.parentId === floorParentId &&
      namesMatch(item.name, floorName)
  );

  if (!floorNode) {
    floorNode = {
      id: createId(),
      name: floorName,
      type: "floor",
      parentId: floorParentId,
      createdAt: Date.now(),
    };

    nextStructures.push(floorNode);
  }

  let roomNode = nextStructures.find(
    (item) =>
      item.type === "room" &&
      item.parentId === floorNode.id &&
      namesMatch(item.name, roomName)
  );

  if (!roomNode) {
    roomNode = {
      id: createId(),
      name: roomName,
      optionalName: roomOptionalName || undefined,
      type: "room",
      parentId: floorNode.id,
      createdAt: Date.now(),
    };

    nextStructures.push(roomNode);
  }

  return {
    nextStructures,
    roomId: roomNode.id,
  };
};

  const performPanelImport = async (file: File) => {
  try {
    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      type: "array",
    });

    const internalSheet = workbook.Sheets["__currist_internal__"];
    const reportSheet = workbook.Sheets["Panel Report"];

    if (!internalSheet || !reportSheet) {
      window.alert("This file does not contain valid panel import data.");
      return;
    }

    const structuresData = readInternalTable(
      internalSheet,
      "[STRUCTURES]"
    );

    const panelsData = readInternalTable(
      internalSheet,
      "[PANELS]"
    );

    const loadsData = readInternalTable(
      internalSheet,
      "[LOADS]"
    );

    const analyzersData = readInternalTable(
      internalSheet,
      "[ANALYZERS]"
    );

    const locationResult = createPanelImportLocation();

    if (!locationResult) return;

    console.log("PANEL IMPORT LOCATION", locationResult);

    const sourcePanelName = String(reportSheet["A1"]?.v || "");

    const sourcePanelRow = panelsData.find(
    (row) => String(row.Name) === sourcePanelName
    );

    if (!sourcePanelRow) {
    window.alert("The exported panel could not be identified.");
    return;
  }

  const sourcePackagedPanelRows = panelsData.filter(
  (row) =>
    row.PanelType === "Packaged Panel" &&
    Number(row.SupplyPanelID) === Number(sourcePanelRow.ID)
  );

  console.log(
  "SOURCE PACKAGED PANELS",
  sourcePackagedPanelRows
  );

    console.log("SOURCE PANEL ROW", sourcePanelRow);



    const newPanelId = Date.now();

    const panelIdMap = new Map<number, number>();

panelIdMap.set(
  Number(sourcePanelRow.ID),
  newPanelId
);

const importedPackagedPanels: Panel[] = sourcePackagedPanelRows.map(
  (row, index) => {
    const newPackagedPanelId = Date.now() + index + 1000;

    panelIdMap.set(
      Number(row.ID),
      newPackagedPanelId
    );

    return {
      id: newPackagedPanelId,
      structureId: locationResult.roomId,
      name: String(row.Name),
      panelType: row.PanelType as PanelType,
      phaseType: row.PhaseType as PanelPhaseType,
      description:
        row.Description === ""
          ? undefined
          : String(row.Description),
      environment:
        row.Environment === ""
          ? undefined
          : (row.Environment as "Indoor" | "Outdoor"),
      ipRating:
        row.IpRating === ""
          ? undefined
          : String(row.IpRating),
      supplyPanelId: newPanelId,
      supplyPhaseLine:
        row.SupplyPhaseLine === ""
          ? undefined
          : (row.SupplyPhaseLine as PhaseLine),
      cableLengthM:
        row.CableLengthM === ""
          ? undefined
          : Number(row.CableLengthM),
      cableType:
        row.CableType === ""
          ? undefined
          : (row.CableType as CableType),
      createdAt: Date.now(),
      analyzers: [],
    };
  }
);

const importedPanel: Panel = {
  id: newPanelId,
  structureId: locationResult.roomId,
  name: String(sourcePanelRow.Name),
  panelType: sourcePanelRow.PanelType as PanelType,
  phaseType: sourcePanelRow.PhaseType as PanelPhaseType,
  description:
    sourcePanelRow.Description === ""
      ? undefined
      : String(sourcePanelRow.Description),
  environment:
    sourcePanelRow.Environment === ""
      ? undefined
      : (sourcePanelRow.Environment as "Indoor" | "Outdoor"),
  ipRating:
    sourcePanelRow.IpRating === ""
      ? undefined
      : String(sourcePanelRow.IpRating),
  supplyPanelId: undefined,
  supplyPhaseLine:
    sourcePanelRow.SupplyPhaseLine === ""
      ? undefined
      : (sourcePanelRow.SupplyPhaseLine as PhaseLine),
  cableLengthM:
    sourcePanelRow.CableLengthM === ""
      ? undefined
      : Number(sourcePanelRow.CableLengthM),
  cableType:
    sourcePanelRow.CableType === ""
      ? undefined
      : (sourcePanelRow.CableType as CableType),
  createdAt: Date.now(),
  analyzers: [],
};

    const loadIdMap = new Map<number, number>();

const sourcePanelRows = [
  sourcePanelRow,
  ...sourcePackagedPanelRows,
];

    const importedLoads: Load[] = loadsData
  .filter((row) =>
    sourcePanelRows.some(
      (panelRow) =>
        Number(panelRow.ID) === Number(row.ConnectedPanelID)
    )
  )
  .map((row, index) => ({
    id: (() => {
  const newLoadId = Date.now() + index + 100;

  loadIdMap.set(Number(row.ID), newLoadId);

  return newLoadId;
})(),
    connectedPanelId:
    panelIdMap.get(Number(row.ConnectedPanelID)) ?? newPanelId,
    roomId: locationResult.roomId,

    projectCode: String(row.ProjectCode),
    description: String(row.Description),

    loadType: row.LoadType as LoadType,

    manualLoadType:
      row.ManualLoadType === ""
        ? undefined
        : (row.ManualLoadType as ManualLoadType),

    powerKw: Number(row.PowerKw),
    quantity: Number(row.Quantity),

    phaseType: row.PhaseType as PhaseType,

    phaseLine:
      row.PhaseLine === ""
        ? undefined
        : (row.PhaseLine as PhaseLine),

    cosPhi:
      row.CosPhi === ""
        ? undefined
        : Number(row.CosPhi),

    loadCharacter:
      row.LoadCharacter === ""
        ? undefined
        : (row.LoadCharacter as LoadCharacter),

    startingMethod:
      row.StartingMethod === ""
        ? undefined
        : String(row.StartingMethod),

    cableLengthM:
      row.CableLengthM === ""
        ? undefined
        : Number(row.CableLengthM),

    cableType:
      row.CableType === ""
        ? undefined
        : (row.CableType as CableType),

    brand: String(row.Brand || ""),
    series: String(row.Series || ""),
    model: String(row.Model || ""),

    note:
      row.Note === ""
        ? undefined
        : String(row.Note),

    createdAt: Date.now(),
    updatedAt: undefined,
  }));

  const importedAnalyzers = analyzersData.filter(
  (row) => Number(row.PanelID) === Number(sourcePanelRow.ID)
);

console.log("IMPORTED ANALYZERS", importedAnalyzers);

const mappedAnalyzers: PanelAnalyzer[] = importedAnalyzers.map((row) => ({
  id: Date.now() + Number(row.AnalyzerID) % 100000,
  name: String(row.AnalyzerName),
  connectedLoadIds: String(row.ConnectedLoadIDs || "")
  .split(",")
  .map(Number)
  .map((oldConnectedId) => {
    if (oldConnectedId > 0) {
      return loadIdMap.get(oldConnectedId);
    }

    if (oldConnectedId < 0) {
      const newPackagedPanelId = panelIdMap.get(
        Math.abs(oldConnectedId)
      );

      return newPackagedPanelId !== undefined
        ? -newPackagedPanelId
        : undefined;
    }

    return undefined;
  })
  .filter(
    (newConnectedId): newConnectedId is number =>
      newConnectedId !== undefined
  ),
}));

importedPanel.analyzers = mappedAnalyzers;

const allImportedPanels: Panel[] = [
  importedPanel,
  ...importedPackagedPanels,
];

    setStructures(locationResult.nextStructures);
    setPanels((prev) => [...prev, ...allImportedPanels]);
    setLoads((prev) => [...prev, ...importedLoads]);
    setCollapsedIds([]);
    setSelectedParent(null);

    setPanelLocationOpen(false);
    setPendingImportFile(null);

    window.alert("Panel location created successfully.");
    return;

    
  } catch (error) {
    console.error(error);
    window.alert("Panel import failed.");
  }
};

  const performProjectImport = async (file: File) => {
  try {
    const buffer = await file.arrayBuffer();

    const workbook = XLSX.read(buffer, {
      type: "array",
    });

    const internalSheet = workbook.Sheets["__currist_internal__"];

    if (!internalSheet) {
      window.alert("This file is not a valid Currist export file.");
      return;
    }

    const projectMetaData = readInternalTable(
      internalSheet,
      "[PROJECT_META]"
    );

    const structuresData = readInternalTable(
      internalSheet,
      "[STRUCTURES]"
    );

    const panelsData = readInternalTable(
      internalSheet,
      "[PANELS]"
    );

    const loadsData = readInternalTable(
      internalSheet,
      "[LOADS]"
    );

    const analyzersData = readInternalTable(
      internalSheet,
      "[ANALYZERS]"
    );

    const importedStructures = parseStructures(structuresData);

    const importedPanels = parseAnalyzers(
      analyzersData,
      parsePanels(panelsData)
    );

    const importedLoads = parseLoads(loadsData);

    if (projectMetaData.length > 0) {
      setProjectCountry(
        String(projectMetaData[0].ProjectCountry || "")
      );

      setBuildingType(
        String(projectMetaData[0].BuildingType || "")
      );
    }

    setStructures(importedStructures);
    setPanels(importedPanels);
    setLoads(importedLoads);

    setSelectedParent(null);
    setCollapsedIds([]);
    setExpandedPanels({});

    setImportModeOpen(false);
    setPendingImportFile(null);

    window.alert("Project restored successfully.");
  } catch (error) {
    console.error(error);
    window.alert("Project restore failed.");
  }
};

  const handleExportPanelToExcel = async (panel: Panel) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Panel Report");

  const internalWorksheet = workbook.addWorksheet("__currist_internal__");
  internalWorksheet.state = "veryHidden";

  internalWorksheet.getCell("A1").value = "CURRIST_INTERNAL";
  internalWorksheet.getCell("A2").value = "Export Version";
  internalWorksheet.getCell("B2").value = "1.0";

  

  const panelSummary = panelSummaries.find(
    (summary) => summary.panelId === panel.id
  );

  const exportDate = new Date().toLocaleString("tr-TR", {
    timeZone: "Europe/Istanbul",
  });

  const darkBlue = "FF0F172A";
  const midBlue = "FF1E40AF";
  const slate = "FF334155";
  const lightBg = "FFF8FAFC";
  const white = "FFFFFFFF";

  worksheet.views = [{ showGridLines: false }];

  worksheet.columns = [
    { width: 18 },
    { width: 22 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
    { width: 18 },
  ];

  worksheet.mergeCells("A1:H1");
  worksheet.getCell("A1").value = panel.name;
  worksheet.getCell("A1").font = {
    bold: true,
    size: 24,
    color: { argb: white },
  };
  worksheet.getCell("A1").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: darkBlue },
  };
  worksheet.getRow(1).height = 36;

  worksheet.mergeCells("A2:H2");
  worksheet.getCell("A2").value = "Electrical Panel Report";
  worksheet.getCell("A2").font = {
    bold: true,
    size: 13,
    color: { argb: slate },
  };
  worksheet.getCell("A2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };
  worksheet.getRow(2).height = 22;

  const panelLocation = structures.find(
  (structure) => structure.id === panel.structureId
);



const parent1 = structures.find((s) => s.id === panelLocation?.parentId);
const parent2 = structures.find((s) => s.id === parent1?.parentId);
const parent3 = structures.find((s) => s.id === parent2?.parentId);
const parent4 = structures.find((s) => s.id === parent3?.parentId);

const locationChain = [parent4, parent3, parent2, parent1, panelLocation].filter(
  Boolean
);

const projectNode = locationChain.find((item) => item?.type === "project");
const buildingNode = locationChain.find((item) => item?.type === "building");

const supplyPanel = panels.find((item) => item.id === panel.supplyPanelId);

worksheet.getCell("A4").value = "Project";
worksheet.getCell("B4").value = projectNode?.name || "-";

internalWorksheet.getCell("A3").value = "Export Date";
internalWorksheet.getCell("B3").value = exportDate;

internalWorksheet.getCell("A4").value = "[PROJECT_META]";

internalWorksheet.getRow(5).values = [
  "ProjectCountry",
  "BuildingType",
];

internalWorksheet.getRow(6).values = [
  projectCountry || "",
  buildingType || "",
];

internalWorksheet.getCell("A8").value = "[STRUCTURES]";

internalWorksheet.getRow(9).values = [
  "ID",
  "ParentID",
  "Type",
  "Name",
  "OptionalName",
];

internalWorksheet.getRow(7).font = {
  bold: true,
  color: { argb: "FFFFFFFF" },
};

internalWorksheet.getRow(7).fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E40AF" },
};

structures.forEach((structure, index) => {
  const rowNumber = 10 + index;

  internalWorksheet.getRow(rowNumber).values = [
    structure.id,
    structure.parentId ?? "",
    structure.type,
    structure.name,
    structure.optionalName || "",
  ];
});

const panelsStartRow = 12 + structures.length;

internalWorksheet.getCell(`A${panelsStartRow}`).value = "[PANELS]";

internalWorksheet.getRow(panelsStartRow + 1).values = [
  "ID",
  "StructureID",
  "Name",
  "PanelType",
  "PhaseType",
  "Description",
  "Environment",
  "IpRating",
  "SupplyPanelID",
  "SupplyPhaseLine",
  "CableLengthM",
  "CableType",
  "CreatedAt",
];

internalWorksheet.getRow(panelsStartRow + 1).font = {
  bold: true,
  color: { argb: "FFFFFFFF" },
};

internalWorksheet.getRow(panelsStartRow + 1).fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E40AF" },
};

panels.forEach((panel, index) => {
  const rowNumber = panelsStartRow + 2 + index;

  internalWorksheet.getRow(rowNumber).values = [
    panel.id,
    panel.structureId,
    panel.name,
    panel.panelType,
    panel.phaseType,
    panel.description || "",
    panel.environment || "",
    panel.ipRating || "",
    panel.supplyPanelId ?? "",
    panel.supplyPhaseLine || "",
    panel.cableLengthM ?? "",
    panel.cableType || "",
    panel.createdAt,
  ];
});

const loadsStartRow = panelsStartRow + 4 + panels.length;

internalWorksheet.getCell(`A${loadsStartRow}`).value = "[LOADS]";

internalWorksheet.getRow(loadsStartRow + 1).values = [
  "ID",
  "ConnectedPanelID",
  "RoomID",
  "ProjectCode",
  "Description",
  "LoadType",
  "ManualLoadType",
  "PowerKw",
  "Quantity",
  "PhaseType",
  "PhaseLine",
  "CosPhi",
  "LoadCharacter",
  "Voltage",
  "StartingMethod",
  "CableLengthM",
  "CableType",
  "Brand",
  "Series",
  "Model",
  "Note",
  "CreatedAt",
  "UpdatedAt",
];

internalWorksheet.getRow(loadsStartRow + 1).font = {
  bold: true,
  color: { argb: "FFFFFFFF" },
};

internalWorksheet.getRow(loadsStartRow + 1).fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E40AF" },
};

loads.forEach((load, index) => {
  const rowNumber = loadsStartRow + 2 + index;

  internalWorksheet.getRow(rowNumber).values = [
    load.id,
    load.connectedPanelId,
    load.roomId,
    load.projectCode,
    load.description,
    load.loadType,
    load.manualLoadType || "",
    load.powerKw,
    load.quantity,
    load.phaseType,
    load.phaseLine || "",
    load.cosPhi ?? "",
    load.loadCharacter || "",
    getVoltage(load),
    load.startingMethod || "",
    load.cableLengthM ?? "",
    load.cableType || "",
    load.brand || "",
    load.series || "",
    load.model || "",
    load.note || "",
    load.createdAt,
    load.updatedAt || "",
  ];
});

const analyzersStartRow = loadsStartRow + 4 + loads.length;

internalWorksheet.getCell(`A${analyzersStartRow}`).value = "[ANALYZERS]";

internalWorksheet.getRow(analyzersStartRow + 1).values = [
  "PanelID",
  "AnalyzerID",
  "AnalyzerName",
  "ConnectedLoadIDs",
];

internalWorksheet.getRow(analyzersStartRow + 1).font = {
  bold: true,
  color: { argb: "FFFFFFFF" },
};

internalWorksheet.getRow(analyzersStartRow + 1).fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FF1E40AF" },
};

let analyzerRow = analyzersStartRow + 2;

panels.forEach((panel) => {
  (panel.analyzers || []).forEach((analyzer) => {
    internalWorksheet.getRow(analyzerRow).values = [
      panel.id,
      analyzer.id,
      analyzer.name,
      analyzer.connectedLoadIds.join(","),
    ];

    analyzerRow += 1;
  });
});

worksheet.getCell("A5").value = "Country";
worksheet.getCell("B5").value = projectCountry || "-";

worksheet.getCell("A6").value = "Building";
worksheet.getCell("B6").value = buildingNode?.name || "-";

worksheet.getCell("A7").value = "Building Type";
worksheet.getCell("B7").value = buildingType || "-";

worksheet.getCell("A9").value = "Panel Type";
worksheet.getCell("B9").value = panel.panelType;

worksheet.getCell("C9").value = "Phase Type";
worksheet.getCell("D9").value = panel.phaseType;

worksheet.getCell("A10").value = "Environment";
worksheet.getCell("B10").value = panel.environment || "-";

worksheet.getCell("C10").value = "IP Rating";
worksheet.getCell("D10").value = panel.ipRating || "-";

worksheet.getCell("A11").value = "Supply Panel";
worksheet.getCell("B11").value = supplyPanel?.name || "-";

worksheet.getCell("A13").value = "Generated By";
worksheet.getCell("B13").value = "Currist";

worksheet.getCell("A14").value = "Export Date";
worksheet.getCell("B14").value = exportDate;


  ["A4", "A5", "A6", "A7", "A9", "C9", "A10", "C10", "A11", "A13", "A14"].forEach((cell) => {
    worksheet.getCell(cell).font = { bold: true, color: { argb: slate } };
  });

  const styleInfoValue = (cell: string) => {
    worksheet.getCell(cell).font = { bold: true, color: { argb: darkBlue } };
  };

  ["B4", "B5", "B6", "B7", "B9", "D9", "B10", "D10", "B11", "B13", "B14"].forEach(styleInfoValue);

  const styleKpiCard = (
    titleCell: string,
    valueCell: string,
    title: string,
    value: string
  ) => {
    worksheet.getCell(titleCell).value = title;
    worksheet.getCell(valueCell).value = value;

    [titleCell, valueCell].forEach((cell) => {
      worksheet.getCell(cell).alignment = {
        horizontal: "center",
        vertical: "middle",
      };
      worksheet.getCell(cell).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: midBlue },
      };
      worksheet.getCell(cell).border = {
        top: { style: "thin", color: { argb: slate } },
        left: { style: "thin", color: { argb: slate } },
        bottom: { style: "thin", color: { argb: slate } },
        right: { style: "thin", color: { argb: slate } },
      };
    });

    worksheet.getCell(titleCell).font = {
      bold: true,
      size: 11,
      color: { argb: white },
    };

    worksheet.getCell(valueCell).font = {
      bold: true,
      size: 15,
      color: { argb: white },
    };
  };

  styleKpiCard(
    "D4",
    "D5",
    "Installed Power",
    `${formatNumber(panelSummary?.totalKw ?? 0)} kW`
  );

  styleKpiCard(
    "E4",
    "E5",
    "Current",
    `${formatNumber(panelSummary?.totalCurrent ?? 0)} A`
  );

  styleKpiCard(
    "F4",
    "F5",
    "Load Count",
    `${panelSummary?.loadCount ?? 0}`
  );

  styleKpiCard(
    "D7",
    "D8",
    "P",
    `${formatNumber(panelSummary?.panelP ?? 0)} kW`
  );

  styleKpiCard(
    "E7",
    "E8",
    "Q",
    `${formatNumber(panelSummary?.panelQ ?? 0)} kVAr`
  );

  styleKpiCard(
    "F7",
    "F8",
    "S",
    `${formatNumber(panelSummary?.panelS ?? 0)} kVA`
  );

  

  worksheet.mergeCells("A16:H16");
worksheet.getCell("A16").value = "Phase Distribution";
worksheet.getCell("A16").font = {
  bold: true,
  size: 13,
  color: { argb: white },
};
worksheet.getCell("A16").alignment = {
  horizontal: "center",
  vertical: "middle",
};
worksheet.getCell("A16").fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: slate },
};

const rKw = panelSummary?.panelR ?? 0;
const sKw = panelSummary?.panelSPhase ?? 0;
const tKw = panelSummary?.panelT ?? 0;
const totalPhaseKw = rKw + sKw + tKw;
const averageCos = panelSummary?.averageCosPhi ?? 1;

const clampedCos = Math.min(Math.max(averageCos, -1), 1);

const phiAngleDeg =
  Math.acos(clampedCos) * (180 / Math.PI);

const powerFactorType =
  (panelSummary?.panelQ ?? 0) > 0
    ? "Inductive"
    : (panelSummary?.panelQ ?? 0) < 0
    ? "Capacitive"
    : "Ohmic / Unity";


const getPhasePercent = (value: number) => {
  if (totalPhaseKw <= 0) return 0;
  return (value / totalPhaseKw) * 100;
};

const maxPhaseKw = Math.max(rKw, sKw, tKw);
const minPhaseKw = Math.min(rKw, sKw, tKw);

const phaseBalanceDeviation =
  maxPhaseKw > 0 ? ((maxPhaseKw - minPhaseKw) / maxPhaseKw) * 100 : 0;

const getPhaseBalanceStatus = () => {
  if (totalPhaseKw <= 0) return "No Load";
  if (phaseBalanceDeviation <= 5) return "Excellent";
  if (phaseBalanceDeviation <= 10) return "Good";
  if (phaseBalanceDeviation <= 20) return "Attention";
  return "Critical";
};

const phaseBalanceStatus = getPhaseBalanceStatus();

worksheet.getCell("A18").value = "R Phase";
worksheet.getCell("B18").value = `${formatNumber(rKw)} kW`;

worksheet.getCell("A19").value = "S Phase";
worksheet.getCell("B19").value = `${formatNumber(sKw)} kW`;

worksheet.getCell("A20").value = "T Phase";
worksheet.getCell("B20").value = `${formatNumber(tKw)} kW`;

worksheet.getCell("D18").value = "Phase";
worksheet.getCell("E18").value = "Share";
worksheet.getCell("F18").value = "Power";

worksheet.getCell("D19").value = "R";
worksheet.getCell("E19").value = `${formatNumber(getPhasePercent(rKw), 1)}%`;
worksheet.getCell("F19").value = `${formatNumber(rKw)} kW`;

worksheet.getCell("D20").value = "S";
worksheet.getCell("E20").value = `${formatNumber(getPhasePercent(sKw), 1)}%`;
worksheet.getCell("F20").value = `${formatNumber(sKw)} kW`;

worksheet.getCell("D21").value = "T";
worksheet.getCell("E21").value = `${formatNumber(getPhasePercent(tKw), 1)}%`;
worksheet.getCell("F21").value = `${formatNumber(tKw)} kW`;



worksheet.mergeCells("G18:H18");
worksheet.getCell("G18").value = "Balance Status";

worksheet.mergeCells("G19:H19");
worksheet.getCell("G19").value = phaseBalanceStatus;

worksheet.mergeCells("G20:H20");
worksheet.getCell("G20").value = "Max Deviation";

worksheet.mergeCells("G21:H21");
worksheet.getCell("G21").value = `${formatNumber(phaseBalanceDeviation, 1)}%`;

["G18", "G20"].forEach((cell) => {
  worksheet.getCell(cell).font = { bold: true, color: { argb: white } };
  worksheet.getCell(cell).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: slate },
  };
  worksheet.getCell(cell).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
});

["G19", "G21"].forEach((cell) => {
  worksheet.getCell(cell).font = { bold: true, color: { argb: darkBlue } };
  worksheet.getCell(cell).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: lightBg },
  };
  worksheet.getCell(cell).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
});

worksheet.mergeCells("A23:H23");
worksheet.getCell("A23").value = "Power Factor Summary";
worksheet.getCell("A23").font = {
  bold: true,
  size: 13,
  color: { argb: white },
};
worksheet.getCell("A23").alignment = {
  horizontal: "center",
  vertical: "middle",
};
worksheet.getCell("A23").fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: slate },
};

worksheet.getCell("A25").value = "Average Cos φ";
worksheet.getCell("B25").value = formatNumber(averageCos, 2);

worksheet.getCell("D25").value = "φ Angle";
worksheet.getCell("E25").value = `${formatNumber(phiAngleDeg, 1)}°`;

worksheet.getCell("G25").value = "PF Type";
worksheet.getCell("H25").value = powerFactorType;

["A25", "D25", "G25"].forEach((cell) => {
  worksheet.getCell(cell).font = { bold: true, color: { argb: slate } };
});

["B25", "E25", "H25"].forEach((cell) => {
  worksheet.getCell(cell).font = { bold: true, color: { argb: darkBlue } };
});

["A18", "A19", "A20", "D18", "E18", "F18", "D19", "D20", "D21"].forEach((cell) => {
  worksheet.getCell(cell).font = { bold: true, color: { argb: slate } };
});

["B18", "B19", "B20", "E19", "E20", "E21", "F19", "F20", "F21"].forEach((cell) => {
  worksheet.getCell(cell).font = { bold: true, color: { argb: darkBlue } };
});

  worksheet.getCell("D12").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: lightBg },
  };

const panelLoads = loads.filter(
  (load) => load.connectedPanelId === panel.id
);

const childPackagedPanels = panels.filter(
  (item) =>
    item.panelType === "Packaged Panel" &&
    item.supplyPanelId === panel.id
);

const cableSummaryMap: Record<string, number> = {};

panelLoads.forEach((load) => {
  if (!load.cableLengthM || !load.cableType) return;

  const section = getCalculatedCableSection(
    getCurrent(load),
    load.cableLengthM,
    load.phaseType
  );

  const cableName = `${load.cableType} ${
    load.phaseType === "1P" ? "3x" : "5x"
  }${section}`;

  cableSummaryMap[cableName] =
    (cableSummaryMap[cableName] || 0) + load.cableLengthM;
});

childPackagedPanels.forEach((packPanel) => {
  if (!packPanel.cableLengthM || !packPanel.cableType) return;

  const packLoads = loads.filter(
    (load) => load.connectedPanelId === packPanel.id
  );

  const packCurrent = packLoads.reduce(
    (sum, load) => sum + getCurrent(load),
    0
  );

  const section = getCalculatedCableSection(
    packCurrent,
    packPanel.cableLengthM,
    packPanel.phaseType
  );

  const cableName = `${packPanel.cableType} ${
    packPanel.phaseType === "1P" ? "3x" : "5x"
  }${section}`;

  cableSummaryMap[cableName] =
    (cableSummaryMap[cableName] || 0) + packPanel.cableLengthM;
});

let cableSummaryRow = 27;

worksheet.mergeCells(`A${cableSummaryRow}:H${cableSummaryRow}`);
worksheet.getCell(`A${cableSummaryRow}`).value =
  "Cable Summary (Calculated by 3% Voltage Drop)";
worksheet.getCell(`A${cableSummaryRow}`).font = {
  bold: true,
  size: 13,
  color: { argb: white },
};
worksheet.getCell(`A${cableSummaryRow}`).alignment = {
  horizontal: "center",
  vertical: "middle",
};
worksheet.getCell(`A${cableSummaryRow}`).fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: slate },
};

cableSummaryRow += 2;

worksheet.mergeCells(
  `A${cableSummaryRow}:D${cableSummaryRow}`
);

worksheet.mergeCells(
  `E${cableSummaryRow}:F${cableSummaryRow}`
);

worksheet.getCell(`A${cableSummaryRow}`).value =
  "Cable Type / Section";

worksheet.getCell(`E${cableSummaryRow}`).value =
  "Total Length";

["A", "E"].forEach((col) => {
  worksheet.getCell(`${col}${cableSummaryRow}`).font = {
    bold: true,
    color: { argb: white },
  };

  worksheet.getCell(`${col}${cableSummaryRow}`).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: midBlue },
  };

  worksheet.getCell(`${col}${cableSummaryRow}`).alignment = {
    horizontal: "center",
    vertical: "middle",
  };
});

cableSummaryRow += 1;

Object.entries(cableSummaryMap).forEach(([cableName, length]) => {
  worksheet.mergeCells(`A${cableSummaryRow}:D${cableSummaryRow}`);
  worksheet.mergeCells(`E${cableSummaryRow}:F${cableSummaryRow}`);

  worksheet.getCell(`A${cableSummaryRow}`).value = cableName;
  worksheet.getCell(`E${cableSummaryRow}`).value = `${formatNumber(length, 0)} m`;

  worksheet.getCell(`A${cableSummaryRow}`).font = {
    bold: true,
    color: { argb: darkBlue },
  };

  worksheet.getCell(`B${cableSummaryRow}`).font = {
    bold: true,
    color: { argb: darkBlue },
  };

  cableSummaryRow += 1;
});

const loadListTitleRow = Math.max(28, cableSummaryRow + 1);

worksheet.mergeCells(`A${loadListTitleRow}:H${loadListTitleRow}`);
worksheet.getCell(`A${loadListTitleRow}`).value = "LOAD LIST";
worksheet.getCell(`A${loadListTitleRow}`).font = {
  bold: true,
  size: 14,
  color: { argb: white },
};
worksheet.getCell(`A${loadListTitleRow}`).alignment = {
  horizontal: "center",
  vertical: "middle",
};
worksheet.getCell(`A${loadListTitleRow}`).fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: darkBlue },
};
worksheet.getRow(loadListTitleRow).height = 24;

const packagedPanelLoads = childPackagedPanels.flatMap((childPanel) =>
  loads.filter((load) => load.connectedPanelId === childPanel.id)
);

type ExportRowItem =
  | {
      rowType: "load";
      load: Load;
    }
  | {
      rowType: "packagedPanel";
      panel: Panel;
      loads: Load[];
    };

const exportItems: ExportRowItem[] = [
  ...panelLoads.map((load) => ({
    rowType: "load" as const,
    load,
  })),
  ...childPackagedPanels.map((childPanel) => ({
    rowType: "packagedPanel" as const,
    panel: childPanel,
    loads: loads.filter((load) => load.connectedPanelId === childPanel.id),
  })),
];

const getAnalyzerNameForExportLoad = (load: Load) => {
  const loadPanel = panels.find((p) => p.id === load.connectedPanelId);

  const analyzer = (panel.analyzers || []).find((item) => {
    if (item.connectedLoadIds.includes(load.id)) return true;

    if (
      loadPanel?.panelType === "Packaged Panel" &&
      item.connectedLoadIds.includes(-loadPanel.id)
    ) {
      return true;
    }

    return false;
  });

  return analyzer ? analyzer.name : "Unassigned";
};

const getLoadLocationForExport = (load: Load) => {
  const room = structures.find((s) => s.id === load.roomId);
  const floor = structures.find((s) => s.id === room?.parentId);
  const block = structures.find((s) => s.id === floor?.parentId);
  const building = structures.find((s) => s.id === block?.parentId);

  return {
    building: building?.name || "",
    block: block?.name || "",
    floor: floor?.optionalName
      ? `${floor.name} - ${floor.optionalName}`
      : floor?.name || "",
    roomNo: room?.name || "",
    roomName: room?.optionalName || "",
  };
};







const tableHeaderRow = loadListTitleRow + 2;

const tableHeaders = [
  "Line No",
  "Project Code",
  "Description",
  "Voltage",
  "Power (kW)",
  "Current (A)",
  "Character",
  "Cos φ",
  "Line",
  "Starting Method",
  "Analyzer",
  "Connected Panel",
  "Equipment Type",
  "Brand",
  "Series",
  "Model",
  "Block",
  "Floor",
  "Room No",
  "Room Name",
  "Cable Length (m)",
  "Cable Type",
  "Created",
  "Revised",
  "Note",
];

worksheet.getRow(tableHeaderRow).values = tableHeaders;

worksheet.getRow(tableHeaderRow).eachCell((cell) => {
  cell.font = { bold: true, color: { argb: white } };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: darkBlue },
  };
  cell.alignment = { horizontal: "center", vertical: "middle" };
});

let lineCounter = 1;
let currentExcelRow = tableHeaderRow + 1;

const mergeCellsIfNeeded = (
  startRow: number,
  endRow: number,
  column: number,
  horizontal: "left" | "right" | "center" = "left"
) => {
  if (endRow > startRow) {
    worksheet.mergeCells(startRow, column, endRow, column);
    worksheet.getCell(startRow, column).alignment = {
      horizontal: "left",
      vertical: "middle",
    };
  }
};

exportItems.forEach((item) => {
  if (item.rowType === "load") {
    const load = item.load;
    const location = getLoadLocationForExport(load);
    const connectedPanel = panels.find((p) => p.id === load.connectedPanelId);

    const row = worksheet.getRow(currentExcelRow);

    row.values = [
      `L${lineCounter}`,
      load.projectCode,
      load.description,
      getVoltage(load),
      Number((load.powerKw * load.quantity).toFixed(2)),
      Number(getCurrent(load).toFixed(2)),
      load.loadCharacter || "",
      load.cosPhi ?? "",
      load.phaseLine || "",
      load.startingMethod || "-",
      getAnalyzerNameForExportLoad(load),
      connectedPanel?.name || panel.name,
      getEquipmentType(load),
      load.brand || "",
      load.series || "",
      load.model || "",
      location.block,
      location.floor,
      location.roomNo,
      location.roomName,
      load.cableLengthM ?? "",
      load.cableType || "",
      new Date(load.createdAt).toLocaleString("tr-TR", {
        timeZone: "Europe/Istanbul",
      }),
      load.updatedAt
        ? new Date(load.updatedAt).toLocaleString("tr-TR", {
            timeZone: "Europe/Istanbul",
          })
        : "",
      load.note || "",
    ];

    lineCounter += 1;
    currentExcelRow += 1;
    return;
  }

  const groupedLoads = item.loads;

  if (groupedLoads.length === 0) return;

  const startRow = currentExcelRow;
  const endRow = currentExcelRow + groupedLoads.length - 1;

  const firstLoad = groupedLoads[0];
  const location = getLoadLocationForExport(firstLoad);

  const totalPowerKw = groupedLoads.reduce(
    (sum, load) => sum + load.powerKw * load.quantity,
    0
  );

  const totalCurrentA = groupedLoads.reduce(
    (sum, load) => sum + getCurrent(load),
    0
  );

  groupedLoads.forEach((load) => {
    const row = worksheet.getRow(currentExcelRow);

    row.values = [
      `L${lineCounter}`,
      load.projectCode,
      load.description,
      item.panel.phaseType === "1P" ? 230 : 380,
      Number(totalPowerKw.toFixed(2)),
      Number(totalCurrentA.toFixed(2)),
      load.loadCharacter || "",
      load.cosPhi ?? "",
      load.phaseLine || "",
      load.startingMethod || "-",
      getAnalyzerNameForExportLoad(load),
      item.panel.name,
      getEquipmentType(load),
      load.brand || "",
      load.series || "",
      load.model || "",
      location.block,
      location.floor,
      location.roomNo,
      location.roomName,
      item.panel.cableLengthM ?? "",
      item.panel.cableType || "",
      new Date(load.createdAt).toLocaleString("tr-TR", {
        timeZone: "Europe/Istanbul",
      }),
      load.updatedAt
        ? new Date(load.updatedAt).toLocaleString("tr-TR", {
            timeZone: "Europe/Istanbul",
          })
        : "",
      load.note || "",
    ];

    currentExcelRow += 1;
  });

  // Merge shared feeder/package fields
  mergeCellsIfNeeded(startRow, endRow, 1, "left");  // Line No
  mergeCellsIfNeeded(startRow, endRow, 4, "left"); // Voltage
  mergeCellsIfNeeded(startRow, endRow, 5, "left"); // Power (kW)
  mergeCellsIfNeeded(startRow, endRow, 6, "left"); // Current (A)
  mergeCellsIfNeeded(startRow, endRow, 12, "left"); // Connected Panel
  mergeCellsIfNeeded(startRow, endRow, 9, "left"); // Line
  mergeCellsIfNeeded(startRow, endRow, 11, "left"); // Analyzer
  mergeCellsIfNeeded(startRow, endRow, 17, "left"); // Block
  mergeCellsIfNeeded(startRow, endRow, 18, "left"); // Floor
  mergeCellsIfNeeded(startRow, endRow, 19, "left"); // Room No
  mergeCellsIfNeeded(startRow, endRow, 20, "left"); // Room Name
  mergeCellsIfNeeded(startRow, endRow, 21, "left"); // Cable Length (m)
  mergeCellsIfNeeded(startRow, endRow, 22, "left"); // Cable Type

  lineCounter += 1;
});

worksheet.columns = tableHeaders.map(() => ({ width: 18 }));

worksheet.getColumn(1).width = 12; // Line No
worksheet.getColumn(2).width = 22; // Project Code
worksheet.getColumn(3).width = 28; // Description

worksheet.getColumn(10).width = 18; // Starting Method
worksheet.getColumn(11).width = 20; // Analyzer
worksheet.getColumn(12).width = 22; // Connected Panel
worksheet.getColumn(13).width = 22; // Equipment Type
worksheet.getColumn(14).width = 20; // Brand
worksheet.getColumn(15).width = 22; // Series
worksheet.getColumn(16).width = 28; // Model

worksheet.getColumn(20).width = 20; // Room Name
worksheet.getColumn(22).width = 18; // Cable Type
worksheet.getColumn(23).width = 24; // Created
worksheet.getColumn(24).width = 24; // Revised
worksheet.getColumn(25).width = 30; // Note
for (let rowNumber = tableHeaderRow + 1; rowNumber < currentExcelRow; rowNumber++) {
  worksheet.getRow(rowNumber).eachCell((cell) => {
    cell.alignment = {
      horizontal: "left",
      vertical: "middle",
      wrapText: true,
    };
  });
}

  const buffer = await workbook.xlsx.writeBuffer();

  saveAs(new Blob([buffer]), `${panel.name} - Panel Report.xlsx`);
};

  const renderPanelCard = (panel: Panel) => {
  const panelSummary = panelSummaries.find(
    (summary) => summary.panelId === panel.id
  );

  const panelLoads = loads.filter(
  (load) => load.connectedPanelId === panel.id
);

const childPackagedPanels = panels.filter(
  (item) =>
    item.panelType === "Packaged Panel" &&
    item.supplyPanelId === panel.id
);

const isPanelExpanded = expandedPanels[panel.id] ?? true;

  return (
    <div
      key={panel.id}
      style={{
      padding: "10px 12px",
      marginBottom: 8,
      border: "1px solid #334155",
      background:
      panel.panelType === "Packaged Panel" ? "#4f66aa" : "#1e293b",
      borderRadius: 8,
    }}
  >
      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
  }}
>
  <button
    onClick={(e) => {
      e.stopPropagation();
      togglePanelExpand(panel.id);
    }}
    style={{
      width: 26,
      height: 26,
      borderRadius: 6,
      border: "1px solid #334155",
      background: "#0f172a",
      color: "white",
      cursor: "pointer",
    }}
  >
    {isPanelExpanded ? "▼" : "▶"}
  </button>

  <strong>{panel.name}</strong>
  <span>({panel.panelType})</span>
  {(panel.analyzers?.length || 0) > 0 && (
  <span
    style={{
      border: "1px solid #334155",
      borderRadius: 6,
      padding: "1px 6px",
      background: "#0f172a",
      fontSize: 12,
    }}
  >
    ⚡ Analyzer: {panel.analyzers?.length}
  </span>
)}
  {panel.panelType === "Packaged Panel" && (
  <span
  style={{
    border: "1px solid #334155",
    borderRadius: 6,
    padding: "1px 6px",
    background: "#0f172a",
    fontSize: 12,
  }}
>
  📦 Packaged
</span>
)}
</div>

      <div
  style={{
    marginTop: 8,
    fontSize: 13,
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    opacity: 0.9,
  }}
>
  <span>Phase: {panel.phaseType}</span>

  <span>
    Power: {formatNumber(panelSummary?.totalKw ?? 0)} kW
  </span>

  <span>
    Current: {formatNumber(panelSummary?.totalCurrent ?? 0)} A
  </span>

  <span>
    Loads: {panelSummary?.loadCount ?? 0}
  </span>

  {panel.panelType !== "Packaged Panel" && (
  <span>
    R:{formatNumber(panelSummary?.panelR ?? 0)}
    {" | "}
    S:{formatNumber(panelSummary?.panelSPhase ?? 0)}
    {" | "}
    T:{formatNumber(panelSummary?.panelT ?? 0)}
  </span>
)}

{panel.panelType === "Packaged Panel" && panel.phaseType === "1P" && (
  <span>
    Supply Phase: {panel.supplyPhaseLine || "-"}
  </span>
)}

{panel.panelType === "Packaged Panel" && (
  <>
    <span>
      Supply Panel:{" "}
      {panels.find((p) => p.id === panel.supplyPanelId)?.name || "-"}
    </span>

    <span>
      Supply Distance: {panel.cableLengthM ?? "-"} m
    </span>

    <span>
      Panel Cable Type: {panel.cableType || "-"}
    </span>
  </>
)}

</div>

      {isPanelExpanded &&
  (panelLoads.length > 0 || childPackagedPanels.length > 0) && (
    <div style={{ marginTop: 10, paddingLeft: 18 }}>
      {panelLoads.map(renderLoadCard)}

      {childPackagedPanels.map((childPanel: Panel) => {
  const childPanelLoads = loads.filter(
    (load) => load.connectedPanelId === childPanel.id
  );

  const childPanelSummary = panelSummaries.find(
    (summary) => summary.panelId === childPanel.id
  );

  const isChildPanelExpanded = expandedPanels[childPanel.id] ?? true;

  return (
    <div
      key={childPanel.id}
      style={{
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #93c5fd",
        background: "#4f66aa",
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 8,
  }}
>
  <button
    onClick={(e) => {
      e.stopPropagation();
      togglePanelExpand(childPanel.id);
    }}
    style={{
      width: 24,
      height: 24,
      borderRadius: 6,
      border: "1px solid #93c5fd",
      background: "#0f172a",
      color: "white",
      cursor: "pointer",
    }}
  >
    {isChildPanelExpanded ? "▼" : "▶"}
  </button>

  <strong>{childPanel.name}</strong>{" "}
        <span
  style={{
    border: "1px solid #334155",
    borderRadius: 6,
    padding: "1px 6px",
    background: "#0f172a",
    fontSize: 12,
  }}
>
  📦 Packaged
</span>
      </div>

      <div
  style={{
    display: "flex",
    gap: 6,
    marginTop: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  }}
>
  <button
    onClick={() => setSelectedPanelDetail(childPanel)}
    style={{
      ...buttonStyle,
      minWidth: 60,
      minHeight: 28,
      background: "#0ea5e9",
      color: "#0f172a",
      cursor: "pointer",
    }}
  >
    Detail
  </button>

  <button
    onClick={() => {
      setEditingPanelId(childPanel.id);

      setPanelName(childPanel.name);
      setPanelType(childPanel.panelType);
      setPanelPhaseType(childPanel.phaseType);
      setPanelDescription(childPanel.description || "");
      setPanelEnvironment(childPanel.environment || "Indoor");
      setPanelIpRating(childPanel.ipRating || "IP31");
      setPanelSupplyPanelId(
        childPanel.supplyPanelId !== undefined
          ? String(childPanel.supplyPanelId)
          : ""
      );

      setPanelSupplyPhaseLine(
      childPanel.supplyPhaseLine || ""
      );

      setPanelCableLengthM(
  childPanel.cableLengthM !== undefined ? String(childPanel.cableLengthM) : ""
);

setPanelCableType(
  childPanel.cableType || ""
);

      setSelectedParent(childPanel.structureId);
    }}
    style={{
      ...buttonStyle,
      minWidth: 60,
      minHeight: 28,
      background: "#334155",
      color: "white",
      cursor: "pointer",
    }}
  >
    Edit
  </button>

  <button
    onClick={() => {
      setCopyPanelSource(childPanel);
      setCopyPanelName("");
    }}
    style={{
      ...buttonStyle,
      minWidth: 60,
      minHeight: 28,
      background: "#22c55e",
      color: "#0f172a",
      cursor: "pointer",
    }}
  >
    Copy
  </button>

  <button
    onClick={() => handleDeletePanel(childPanel.id)}
    style={{
      ...buttonStyle,
      minWidth: 60,
      minHeight: 28,
      background: "#ef4444",
      color: "white",
      cursor: "pointer",
    }}
  >
    Delete
  </button>
</div>

      <div
  style={{
    marginTop: 8,
    fontSize: 13,
    display: "flex",
    flexWrap: "wrap",
    gap: 12,
    alignItems: "center",
    opacity: 0.9,
  }}
>
  <span>Phase: {childPanel.phaseType}</span>

  <span>
    Power: {formatNumber(childPanelSummary?.totalKw ?? 0)} kW
  </span>

  <span>
    Current: {formatNumber(childPanelSummary?.totalCurrent ?? 0)} A
  </span>

  <span>
    Loads: {childPanelSummary?.loadCount ?? 0}
  </span>

  <span>
    R:{formatNumber(childPanelSummary?.panelR ?? 0)}
    {" | "}
    S:{formatNumber(childPanelSummary?.panelSPhase ?? 0)}
    {" | "}
    T:{formatNumber(childPanelSummary?.panelT ?? 0)}
  </span>
</div>

      {isChildPanelExpanded && childPanelLoads.length > 0 && (
  <div style={{ marginTop: 8, paddingLeft: 12 }}>
    {childPanelLoads.map(renderLoadCard)}
  </div>
)}
    </div>
  );
})}
      
    </div>
  )}

<div style={{ marginTop: 10 }}>
  {selectedAnalyzerPanelId === panel.id ? (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <input
        style={{
          ...fieldStyle,
          minHeight: 32,
          padding: "6px 8px",
          fontSize: 12,
        }}
        placeholder="Analyzer name"
        value={analyzerName}
        onChange={(e) => setAnalyzerName(e.target.value)}
      />

      <button
        onClick={() => handleAddAnalyzerToPanel(panel.id)}
        style={{
          ...buttonStyle,
          minHeight: 32,
          background: "#22c55e",
          cursor: "pointer",
        }}
      >
        Save Analyzer
      </button>

      <button
        onClick={() => {
          setSelectedAnalyzerPanelId(null);
          setAnalyzerName("");
        }}
        style={{
          ...buttonStyle,
          minHeight: 32,
          background: "#334155",
          color: "white",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  ) : (
  panel.panelType !== "Packaged Panel" && (
    <button
      onClick={() => setSelectedAnalyzerPanelId(panel.id)}
      style={{
        ...buttonStyle,
        minHeight: 32,
        background: "#38bdf8",
        cursor: "pointer",
      }}
    >
      Add Analyzer
    </button>
  )
)}
</div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 8,
          justifyContent: "center",
  flexWrap: "wrap",
        }}
        >


{panel.panelType !== "Packaged Panel" && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      handleExportPanelToExcel(panel);
    }}
    style={{
      ...buttonStyle,
      minWidth: 70,
      minHeight: 32,
      background: "#f59e0b",
      color: "#0f172a",
      cursor: "pointer",
    }}
  >
    Export
  </button>
)}


<button
  onClick={(e) => {
    e.stopPropagation();
    window.alert("Panel import will be added in the next step.");
  }}
  style={{
    ...buttonStyle,
    minWidth: 70,
    minHeight: 32,
    background: "#a78bfa",
    color: "#0f172a",
    cursor: "pointer",
  }}
>
  Import
</button>

<button
  onClick={(e) => {
    e.stopPropagation();
    setSelectedPanelDetail(panel);
  }}
  style={{
    ...buttonStyle,
    minWidth: 70,
    minHeight: 32,
    background: "#0ea5e9",
    color: "#0f172a",
    cursor: "pointer",
  }}
>
  Detail
</button>

<button
  onClick={(e) => {
    e.stopPropagation();

    const panelLoads = loads.filter(
      (load) => load.connectedPanelId === panel.id
    );

    setCopyPanelSource(panel);
    setCopyPanelName("");

    setCopyLoadProjectCodes(
      panelLoads.reduce<Record<number, string>>((acc, load) => {
        acc[load.id] = "";
        return acc;
      }, {})
    );
  }}
  style={{
    ...buttonStyle,
    minWidth: 70,
    minHeight: 32,
    background: "#22c55e",
    color: "#0f172a",
    cursor: "pointer",
  }}
>
  Copy
</button>

<button
  onClick={(e) => {
    e.stopPropagation();

    setEditingPanelId(panel.id);

    setPanelName(panel.name);
    setPanelType(panel.panelType);
    setPanelPhaseType(panel.phaseType);
    setPanelDescription(panel.description || "");
    setPanelEnvironment(panel.environment || "Indoor");
    setPanelIpRating(panel.ipRating || "IP31");
    setPanelSupplyPanelId(
  panel.supplyPanelId !== undefined ? String(panel.supplyPanelId) : ""
);

setPanelSupplyPhaseLine(
  panel.supplyPhaseLine || ""
);

setPanelCableLengthM(
  panel.cableLengthM !== undefined ? String(panel.cableLengthM) : ""
);

setPanelCableType(
  panel.cableType || ""
);

setSelectedParent(panel.structureId);
  }}
  style={{
    ...buttonStyle,
    minWidth: 70,
    minHeight: 32,
    background: "#334155",
    color: "white",
    cursor: "pointer",
  }}
>
  Edit
</button>



  <button
    onClick={(e) => {
      e.stopPropagation();
      handleDeletePanel(panel.id);
    }}
    style={{
      ...buttonStyle,
      minWidth: 70,
      minHeight: 32,
      background: "#ef4444",
      color: "white",
      cursor: "pointer",
          }}
          >
          Delete
        </button>
      </div>

    </div>
  );
};

const renderLoadCard = (load: Load) => {
  const connectedPanel = panels.find(
    (p) => p.id === load.connectedPanelId
  );

  const loadRoom = structures.find((s) => s.id === load.roomId);
const panelRoom = connectedPanel
  ? structures.find((s) => s.id === connectedPanel.structureId)
  : undefined;

const showPhysicalLocation =
  connectedPanel && panelRoom && loadRoom && panelRoom.id !== loadRoom.id;

  return (
    <div
      key={load.id}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        padding: "8px 12px",
        marginBottom: 6,
        border: "1px solid #334155",
        background: "#1e293b",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          flex: 1,
          minWidth: 0,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {load.projectCode} - {load.description}
        </div>

        <div
  style={{
    fontSize: 12,
    opacity: 0.75,
    marginTop: 2,
    display: "flex",
    gap: 10,
    alignItems: "center",
    flexWrap: "wrap",
  }}
>
  <span>
    Panel:{" "}
    {connectedPanel
      ? `${connectedPanel.name} (${connectedPanel.panelType})`
      : "-"}
  </span>

  {showPhysicalLocation && (
    <span
      style={{
        border: "1px solid #334155",
        borderRadius: 6,
        padding: "1px 6px",
        background: "#0f172a",
      }}
    >
      📍 {loadRoom?.optionalName
  ? `${loadRoom.name} - ${loadRoom.optionalName}`
  : loadRoom?.name}
    </span>
  )}
</div>
      </div>



<input
  style={{
    ...fieldStyle,
    width: 180,
    minHeight: 32,
    padding: "6px 8px",
    fontSize: 12,
  }}
  placeholder="Note"
  value={load.note || ""}
  onClick={(e) => e.stopPropagation()}
  onChange={(e) => {
    const value = e.target.value;

    setLoads((prev) =>
      prev.map((item) =>
        item.id === load.id
          ? {
              ...item,
              note: value.trim() === "" ? undefined : value,
              updatedAt: Date.now(),
            }
          : item
      )
    );
  }}
/>

      <div
        style={{
          display: "flex",
          gap: 6,
          flexShrink: 0,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            setSelectedLoadDetail(load);
          }}
          style={{
            ...buttonStyle,
            minWidth: 70,
            minHeight: 32,
            background: "#0ea5e9",
            color: "#0f172a",
            cursor: "pointer",
          }}
        >
          Detail
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopyLoad(load);
          }}
          style={{
            ...buttonStyle,
            minWidth: 70,
            minHeight: 32,
            background: "#22c55e",
            color: "#0f172a",
            cursor: "pointer",
          }}
        >
          Copy
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleStartEditLoad(load);
          }}
          style={{
            ...buttonStyle,
            minWidth: 70,
            minHeight: 32,
            background: "#334155",
            color: "white",
            cursor: "pointer",
          }}
        >
          Edit
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteLoad(load.id);
          }}
          style={{
            ...buttonStyle,
            minWidth: 70,
            minHeight: 32,
            background: "#ef4444",
            color: "white",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const renderLoadDetailsCard = (load: Load) => {
  const connectedPanel = panels.find(
    (p) => p.id === load.connectedPanelId
  );

  return (
    <div
      key={load.id}
      style={{
        padding: "8px 10px",
        marginBottom: 8,
        border: "1px solid #334155",
        background: "#1e293b",
        borderRadius: 8,
      }}
    >
      <div>
        <strong>{load.projectCode}</strong> - {load.description} [{load.loadType}]
      </div>

      <div>
  Location:{" "}
  {(() => {
    const room = structures.find((s) => s.id === load.roomId);
    const floor = structures.find((s) => s.id === room?.parentId);
    const block = structures.find((s) => s.id === floor?.parentId);

    return [
      block?.name,
      floor?.optionalName
        ? `${floor.name} - ${floor.optionalName}`
        : floor?.name,
      room?.optionalName
        ? `${room.name} - ${room.optionalName}`
        : room?.name,
    ]
      .filter(Boolean)
      .join(" / ");
  })()}
</div>

      <div>
        {load.loadType === "Manual"
          ? `${load.manualLoadType || "-"}`
          : `${load.brand || "-"} / ${load.series || "-"} / ${load.model || "-"}`
        }
      </div>

      <div>
        {load.powerKw} kW × {load.quantity} ={" "}
        {(load.powerKw * load.quantity).toFixed(2)} kW
      </div>

      <div>
        Phase: {load.phaseType}
        {load.phaseType === "1P" && load.phaseLine
          ? ` / Line: ${load.phaseLine}`
          : ""}
      </div>

      <div>
        Character: {load.loadCharacter || "-"}
      </div>



      <div>
        Panel:{" "}
        {connectedPanel
          ? `${connectedPanel.name} (${connectedPanel.panelType})`
          : "-"}
      </div>

      

      <div>
        Cos φ: {load.cosPhi ?? "-"}
      </div>

      <div>
        Distance: {load.cableLengthM ?? "-"} m
      </div>

      <div>
  Note: {load.note || "-"}
</div>

<div>
  Created: {new Date(load.createdAt).toLocaleString()}
</div>

<div>
  Last Edited:{" "}
  {load.updatedAt ? new Date(load.updatedAt).toLocaleString() : "-"}
</div>


    </div>
  );
};

    const renderPanels = (nodeId: number) => {
    const nodePanels = getPanelsByNode(nodeId);

    if (nodePanels.length === 0) return null;

    return (
    <div style={{ marginTop: 8, marginLeft: 36 }}>
      {nodePanels.map(renderPanelCard)}
    </div>
  );
};

const renderPanelDetailModal = (panel: Panel) => {
  const currentPanel =
  panels.find((item) => item.id === panel.id) || panel;
  const panelSummary = panelSummaries.find(
    (summary) => summary.panelId === panel.id
  );

  const panelLoads = loads.filter(
    (load) => load.connectedPanelId === panel.id
  );

  const childPackagedPanels = panels.filter(
  (item) =>
    item.panelType === "Packaged Panel" &&
    item.supplyPanelId === panel.id
);

  const supplyPanel = panels.find(
  (item) => item.id === panel.supplyPanelId
);

  const panelLocation = structures.find(
    (structure) => structure.id === panel.structureId
  );

  const getPanelLocationText = () => {
  const current = structures.find((s) => s.id === panel.structureId);
  const parent1 = structures.find((s) => s.id === current?.parentId);
  const parent2 = structures.find((s) => s.id === parent1?.parentId);
  const parent3 = structures.find((s) => s.id === parent2?.parentId);
  const parent4 = structures.find((s) => s.id === parent3?.parentId);

  return [parent4, parent3, parent2, parent1, current]
    .filter(Boolean)
    .map((item) =>
      item?.optionalName
        ? `${item.name} - ${item.optionalName}`
        : item?.name
    )
    .join(" / ");
};

  return (
    <>
      <div
        onClick={() => setSelectedPanelDetail(null)}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(15, 23, 42, 0.65)",
          zIndex: 10000,
        }}
      />

      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 760,
          maxWidth: "calc(100vw - 40px)",
          maxHeight: "calc(100vh - 80px)",
          overflowY: "auto",
          background: "#111827",
          border: "1px solid #334155",
          borderRadius: 18,
          padding: 24,
          zIndex: 10001,
          boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
        }}
      >
        <h3
  style={{
    marginTop: 0,
    color: "#0ea5e9",
  }}
>
  Panel Detail
</h3>

        <div style={{ lineHeight: 1.8, fontSize: 14 }}>
          <div><strong>Panel Name:</strong> {panel.name}</div>
          <div><strong>Panel Type:</strong> {panel.panelType}</div>
          <div><strong>Supply Panel:</strong>{" "}{supplyPanel ? supplyPanel.name : "-"}</div>
          {panel.panelType === "Packaged Panel" && (
          <div>
          <strong>Panel Category:</strong> Packaged Panel
          </div>
          )}
          <div><strong>Phase Type:</strong> {panel.phaseType}</div>
          <div><strong>Environment:</strong> {panel.environment || "-"}</div>
          <div><strong>IP Rating:</strong> {panel.ipRating || "-"}</div>
          <div><strong>Description:</strong> {panel.description || "-"}</div>
          <div><strong>Location:</strong> {getPanelLocationText() || "-"}</div>
          <div>
            <strong>Created:</strong>{" "}
            {panel.createdAt ? new Date(panel.createdAt).toLocaleString() : "-"}
          </div>
        </div>

        <hr style={{ margin: "16px 0", borderColor: "#334155" }} />

        <h3>Electrical Summary</h3>

        <div style={{ lineHeight: 1.8, fontSize: 14 }}>
          <div>
            <strong>Installed Power:</strong>{" "}
            {formatNumber(panelSummary?.totalKw ?? 0)} kW
          </div>

          <div>
            <strong>Current:</strong>{" "}
            {formatNumber(panelSummary?.totalCurrent ?? 0)} A
          </div>

          <div>
            <strong>Load Count:</strong>{" "}
            {panelSummary?.loadCount ?? 0}
          </div>

          <div>
            <strong>P:</strong>{" "}
            {formatNumber(panelSummary?.panelP ?? 0)} kW
          </div>

          <div>
            <strong>Q:</strong>{" "}
            {(panelSummary?.panelQ ?? 0) > 0
              ? `↑ ${formatNumber(panelSummary?.panelQ ?? 0)} kVAr`
              : (panelSummary?.panelQ ?? 0) < 0
              ? `↓ ${formatNumber(panelSummary?.panelQ ?? 0)} kVAr`
              : `→ ${formatNumber(panelSummary?.panelQ ?? 0)} kVAr`}
          </div>

          <div>
            <strong>S:</strong>{" "}
            {formatNumber(panelSummary?.panelS ?? 0)} kVA
          </div>

          <div>
            <strong>Average Cos φ:</strong>{" "}
            {formatNumber(panelSummary?.averageCosPhi ?? 1, 2)}
          </div>

          <div>
            <strong>R / S / T:</strong>{" "}
            R: {formatNumber(panelSummary?.panelR ?? 0)} kW {" | "}
            S: {formatNumber(panelSummary?.panelSPhase ?? 0)} kW {" | "}
            T: {formatNumber(panelSummary?.panelT ?? 0)} kW
          </div>
        </div>

        <hr style={{ margin: "16px 0", borderColor: "#334155" }} />
              
         <h3>Energy Analyzers</h3>

{(() => {
  const panelDirectLoads = loads.filter(
    (load) => load.connectedPanelId === panel.id
  );

  const panelPackagedPanels = panels.filter(
  (item) =>
    item.panelType === "Packaged Panel" &&
    item.supplyPanelId === panel.id
);

  const virtualPackagedLoads = panelPackagedPanels.map((packPanel) => ({
  id: -packPanel.id,
  projectCode: packPanel.name,
  description: "Packaged Panel Feeder",
}));

  const assignedLoadIds = (currentPanel.analyzers || []).flatMap(
    (analyzer) => analyzer.connectedLoadIds
  );

  const analyzerAssignableItems = [
  ...panelDirectLoads,
  ...virtualPackagedLoads,
];

const unassignedAnalyzerLoads = analyzerAssignableItems.filter(
  (load) => !assignedLoadIds.includes(load.id)
);

  return (
    <div>
      <div
        style={{
          padding: "8px 10px",
          marginBottom: 10,
          border: "1px dashed #64748b",
          background: "#0f172a",
          borderRadius: 8,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <strong>Unassigned Loads</strong>

        {unassignedAnalyzerLoads.length === 0 ? (
          <div style={{ opacity: 0.75, marginTop: 6 }}>
            No available load for analyzer assignment.
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            {unassignedAnalyzerLoads.map((load) => (
              <div
                key={load.id}
                style={{
                  display: "flex",
                  gap: 8,
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginTop: 6,
                  flexWrap: "wrap",
                }}
              >
                <span>
                  {load.projectCode} - {load.description}
                </span>

                <select
                  style={{
                    ...fieldStyle,
                    minHeight: 30,
                    padding: "4px 8px",
                    fontSize: 12,
                    width: 180,
                  }}
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;

                    handleToggleAnalyzerLoad(
                      panel.id,
                      Number(e.target.value),
                      load.id
                    );
                  }}
                >
                  <option value="">Assign to analyzer</option>
                  {(currentPanel.analyzers || []).map((analyzer) => (
                    <option key={analyzer.id} value={analyzer.id}>
                      {analyzer.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      {(currentPanel.analyzers || []).length === 0 ? (
        <div style={{ opacity: 0.75 }}>No analyzer added.</div>
      ) : (
        (currentPanel.analyzers || []).map((analyzer) => {
          const analyzerLoads = analyzerAssignableItems.filter((load) =>
  analyzer.connectedLoadIds.includes(load.id)
);

          return (
            <div
              key={analyzer.id}
              style={{
                padding: "8px 10px",
                marginBottom: 8,
                border: "1px solid #334155",
                background: "#1e293b",
                borderRadius: 8,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 8,
                  alignItems: "center",
                }}
              >
                <strong>⚡ {analyzer.name}</strong>

                <button
                  onClick={() => handleDeleteAnalyzer(panel.id, analyzer.id)}
                  style={{
                    ...buttonStyle,
                    minHeight: 26,
                    padding: "4px 8px",
                    background: "#ef4444",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Delete
                </button>
              </div>

              {analyzerLoads.length === 0 ? (
                <div style={{ opacity: 0.75, marginTop: 8 }}>
                  No load assigned.
                </div>
              ) : (
                <div style={{ marginTop: 8 }}>
                  {analyzerLoads.map((load) => (
                    <div
                      key={load.id}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 8,
                        alignItems: "center",
                        marginTop: 6,
                        padding: "6px 8px",
                        border: "1px solid #334155",
                        background: "#0f172a",
                        borderRadius: 6,
                      }}
                    >
                      <span>
                        {load.projectCode} - {load.description}
                      </span>

                      <button
                        onClick={() =>
                          handleToggleAnalyzerLoad(
                            panel.id,
                            analyzer.id,
                            load.id
                          )
                        }
                        style={{
                          ...buttonStyle,
                          minHeight: 24,
                          padding: "3px 8px",
                          background: "#334155",
                          color: "white",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
})()}

<hr style={{ margin: "16px 0", borderColor: "#334155" }} />     

        {panelLoads.length === 0 && childPackagedPanels.length === 0 ? (
          <div style={{ opacity: 0.75 }}>No connected loads.</div>
        ) : (
          <div>
            {panelLoads.map((load) => (
  <div
    key={load.id}
    style={{
      padding: "8px 10px",
      marginBottom: 8,
      border: "1px solid #334155",
      background: "#1e293b",
      borderRadius: 8,
      fontSize: 13,
      lineHeight: 1.6,
    }}
  >
    <div>
      <strong>{load.projectCode}</strong> - {load.description}
    </div>
    <div>
      {load.powerKw} kW × {load.quantity} ={" "}
      {formatNumber(load.powerKw * load.quantity)} kW
    </div>
    <div>
      Phase: {load.phaseType}
      {load.phaseType === "1P" && load.phaseLine
        ? ` / Line: ${load.phaseLine}`
        : ""}
    </div>
    <div>
      Character: {load.loadCharacter || "-"} / Cos φ:{" "}
      {load.cosPhi ?? "-"}
    </div>
  </div>
))}

{childPackagedPanels.map((childPanel: Panel) => {
  const childPanelLoads = loads.filter(
    (load) => load.connectedPanelId === childPanel.id
  );

  return (
    <div
      key={childPanel.id}
      style={{
        padding: "8px 10px",
        marginBottom: 8,
        border: "1px solid #93c5fd",
        background: "#4f66aa",
        borderRadius: 8,
        fontSize: 13,
        lineHeight: 1.6,
      }}
    >
      <div>
        <strong>{childPanel.name}</strong>{" "}
        <span style={{ fontSize: 11 }}>[PACKAGED]</span>
      </div>

      {childPanelLoads.map((load) => (
  <div
    key={load.id}
    style={{
      marginLeft: 14,
      marginTop: 8,
      padding: "8px 10px",
      border: "1px solid #93c5fd",
      background: "#1e293b",
      borderRadius: 8,
    }}
  >
    <div>
      <strong>{load.projectCode}</strong> - {load.description}
    </div>

    <div>
      {load.powerKw} kW × {load.quantity} ={" "}
      {formatNumber(load.powerKw * load.quantity)} kW
    </div>

    <div>
      Phase: {load.phaseType}
      {load.phaseType === "1P" && load.phaseLine
        ? ` / Line: ${load.phaseLine}`
        : ""}
    </div>

    <div>
      Character: {load.loadCharacter || "-"} / Cos φ:{" "}
      {load.cosPhi ?? "-"}
    </div>
  </div>
))}
    </div>
  );
})}

            

          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 18,
          }}
        >
          <button
            onClick={() => setSelectedPanelDetail(null)}
            style={{
              ...buttonStyle,
              background: "#0ea5e9",
              color: "#0f172a",
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
};

  const renderUnassignedLoads = (roomId: number) => {
  const unassignedLoads = getLoadsByRoom(roomId).filter(
    (load) => load.connectedPanelId === undefined
  );

  if (unassignedLoads.length === 0) return null;

  return (
    <div
      style={{
        marginTop: 8,
        marginLeft: 36,
        padding: "10px 12px",
        border: "1px dashed #64748b",
        background: "#0f172a",
        borderRadius: 8,
      }}
    >
      <div style={{ fontSize: 14, marginBottom: 8 }}>
        <strong>Unassigned Loads</strong>
      </div>

      {unassignedLoads.map(renderLoadCard)}
    </div>
  );
};

  const renderTree = (parentId: number | null = null, level = 0) => {
    return (
      <div>
        {getChildren(parentId).map((item) => {
          const child = hasChildren(item.id);
          const collapsed = isCollapsed(item.id);

          return (
            <div key={item.id} style={{ marginLeft: level * 20, marginTop: 8 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <button
                  onClick={() => toggleCollapse(item.id)}
                  disabled={!child}
                  style={{
                    width: 28,
                    opacity: child ? 1 : 0.5,
                    cursor: child ? "pointer" : "default",
                  }}
                >
                  {child ? (collapsed ? "+" : "-") : "•"}
                </button>

                <span
                  style={{
                    cursor: "pointer",
                    fontWeight: selectedParent === item.id ? "bold" : "normal",
                    color: selectedParent === item.id ? "#4fc3f7" : "white",
                  }}
                  onClick={() => handleSelectNode(item)}
                >
                  {item.type === "project" && (
  <>
    {projectCountry && `${countryFlags[projectCountry] || "🌍"} `}
    {buildingType && `${buildingTypeIcons[buildingType] || "🏗️"} `}
  </>
)}

{item.type === "room" && item.optionalName
  ? `${item.name} - ${item.optionalName}`
  : item.name}{" "}
({item.type})
                </span>
              </div>

              {renderPanels(item.id)}
              {/* {item.type === "room" && renderLoads(item.id)} */}
              {item.type === "room" && renderUnassignedLoads(item.id)}

              {child && !collapsed && <div>{renderTree(item.id, level + 1)}</div>}
            </div>
          );
        })}
      </div>
    );
  };

  const allowedTypes = getAllowedChildTypes();

  return (
    <div
    style={{
    padding: "150px 20px 160px 20px",
    background: "#0f172a",
    minHeight: "calc(100vh + 240px)",
    color: "white",
  }}
>
      

      {/* SUMMARY BAR */}
<div
  style={{
    position: "sticky",
    top: 0,
    zIndex: 999,
    background: "#0f172a",
    padding: "12px 20px 14px 20px",
    borderBottom: "1px solid #1e293b",
  }}
>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
      gap: 14,
      alignItems: "stretch",
    }}
  >
    <div
      style={{
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 12,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <div style={{ fontSize: "clamp(26px, 5vw, 50px)", fontWeight: 700 }}>
  ⚡ Currist
</div>
      <div style={{ fontSize: 13, opacity: 0.7 }}>
             Design. Calculate. Control.
      </div>
    </div>

    <div style={summaryCardStyle}>
      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>
        Building Summary
      </div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>
        {formatNumber(summary.totalInstalledPowerKw)} kW
      </div>
      <div style={{ marginTop: 8, opacity: 0.8 }}>
        {summary.totalLoadCount} loads in project
      </div>
    </div>

    <div style={summaryCardStyle}>
      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>
        Estimated Current
      </div>
      <div style={{ fontSize: 26, fontWeight: 700 }}>
        {formatNumber(summary.estimatedCurrentA)} A
      </div>
      <div style={{ marginTop: 8, opacity: 0.8 }}>
        Live total current
      </div>
    </div>

    <div style={summaryCardStyle}>
  <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>
    Power Summary
  </div>
  <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
    <div>P: {formatNumber(summary.totalP)} kW</div>
    <div>
      Q:{" "}
      {summary.totalQ > 0
      ? `↑ ${formatNumber(summary.totalQ)} kVAr`
      : summary.totalQ < 0
      ? `↓ ${formatNumber(summary.totalQ)} kVAr`
      : `→ ${formatNumber(summary.totalQ)} kVAr`}
    </div>
    <div>S: {formatNumber(summary.totalS)} kVA</div>
    <div>Avg. Cos φ: {formatNumber(summary.averageCosPhi, 2)}</div>
  </div>
</div>

    <div style={summaryCardStyle}>
      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>
        Phase Types
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
        <div>1 Phase Loads: {summary.onePhaseCount}</div>
        <div>3 Phase Loads: {summary.threePhaseCount}</div>
        <div>Single Phase kW: {formatNumber(summary.totalSinglePhasePowerKw)}</div>
      </div>
    </div>

    <div
      style={{
        ...summaryCardStyle,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      <div>
        <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>
          Phase Distribution
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 14 }}>
          <div>R: {formatNumber(summary.phaseLoadsKw.R)} kW</div>
          <div>S: {formatNumber(summary.phaseLoadsKw.S)} kW</div>
          <div>T: {formatNumber(summary.phaseLoadsKw.T)} kW</div>
        </div>
      </div>

      <div
        style={{
          width: 94,
          height: 94,
          borderRadius: "50%",
          background: phaseDonutBackground,
          position: "relative",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 18,
            borderRadius: "50%",
            background: "#111827",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            textAlign: "center",
            lineHeight: 1.2,
            padding: 6,
          }}
        >
          R / S / T
        </div>
      </div>
    </div>
  </div>
</div>


      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div
          style={{
          width: "32%",
          background: "#111827",
          border: "1px solid #334155",
          borderRadius: 12,
          padding: 16,
          minHeight: 500,
          maxHeight: "calc(100vh - 180px)",
          overflowY: "auto",
        }}
        >
          

          <div
          style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          }}
          >
            <select
              style={fieldStyle}
              value={type}
              onChange={(e) => setType(e.target.value as StructureType)}
              disabled={editingId !== null}
            >
              {editingId !== null ? (
                <option value={type}>{type}</option>
              ) : (
                allowedTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))
              )}
            </select>

            <input
              style={fieldStyle}
              placeholder={getInputPlaceholder()}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            {type === "room" && (
  <input
    style={fieldStyle}
    placeholder="Room Name / Description (optional)"
    value={optionalName}
    onChange={(e) => setOptionalName(e.target.value)}
  />
)}

            <select
              style={fieldStyle}
              value={projectCountry}
              onChange={(e) => setProjectCountry(e.target.value)}
              >
              <option value="">Select Country</option>
              {countryOptions.map((country) => (
              <option key={country} value={country}>
              {country}
              </option>
              ))}
            </select>

            <select
              style={fieldStyle}
              value={buildingType}
              onChange={(e) => setBuildingType(e.target.value)}
              >
              <option value="">Select Building Type</option>
              {buildingTypeOptions.map((type) => (
              <option key={type} value={type}>
              {type}
              </option>
              ))}
            </select>

            <button
              style={{ ...buttonStyle, cursor: "pointer" }}
              onClick={handleAddOrUpdate}
            >
              {getActionButtonLabel()}
            </button>

            {editingId !== null && (
              <button
                style={{ ...buttonStyle, cursor: "pointer" }}
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}

            <select
              style={fieldStyle}
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="created">Created</option>
            </select>

            <button
              onClick={handleSelectRoot}
              disabled={selectedParent === null}
              style={{
                ...buttonStyle,
                opacity: selectedParent === null ? 0.5 : 1,
                cursor: selectedParent === null ? "not-allowed" : "pointer",
              }}
            >
              Add Another Building
            </button>

            <button
              onClick={handleEditSelected}
              disabled={!selectedNode}
              style={{
                ...buttonStyle,
                opacity: selectedNode ? 1 : 0.5,
                cursor: selectedNode ? "pointer" : "not-allowed",
              }}
            >
              Edit Selected
            </button>

            <button
              onClick={handleDeleteSelected}
              disabled={!selectedNode}
              style={{
                ...buttonStyle,
                opacity: selectedNode ? 1 : 0.5,
                cursor: selectedNode ? "pointer" : "not-allowed",
              }}
            >
              Delete Selected
            </button>
          </div>

          <div
            style={{
              marginTop: 20,
              borderTop: "1px solid #334155",
              paddingTop: 16,
            }}
          >
<div
  style={{
    marginTop: 20,
    borderTop: "1px solid #334155",
    paddingTop: 16,
  }}
>
  <h3 style={{ marginTop: 0 }}>Create Panel</h3>

  <div
    style={{
      display: "grid",
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
      gap: 10,
    }}
  >
    <input
      style={fieldStyle}
      placeholder="Panel Name"
      value={panelName}
      onChange={(e) => setPanelName(e.target.value)}
      disabled={!canAddPanel}
    />

    <select
      style={fieldStyle}
      value={panelType}
      onChange={(e) => setPanelType(e.target.value as PanelType)}
      disabled={!canAddPanel}
    >
      <option value="MCC">MCC</option>
      <option value="SMDB">SMDB</option>
      <option value="DB">DB</option>
      <option value="LP">LP</option>
      <option value="UPS DB">UPS DB</option>
      <option value="Packaged Panel">Packaged Panel</option>
    </select>

    <select
      style={fieldStyle}
      value={panelPhaseType}
      onChange={(e) => setPanelPhaseType(e.target.value as PanelPhaseType)}
      disabled={!canAddPanel}
    >
      <option value="1P">1 Phase</option>
      <option value="3P">3 Phase</option>
    </select>

    {isPackagedPanel && panelPhaseType === "1P" && (
  <select
    style={fieldStyle}
    value={panelSupplyPhaseLine}
    onChange={(e) =>
      setPanelSupplyPhaseLine(e.target.value as PhaseLine)
    }
    disabled={!canAddPanel}
  >
    <option value="">Supply Phase</option>
    <option value="R">R Phase</option>
    <option value="S">S Phase</option>
    <option value="T">T Phase</option>
  </select>
)}

    <input
      style={fieldStyle}
      placeholder="Panel Description"
      value={panelDescription}
      onChange={(e) => setPanelDescription(e.target.value)}
      disabled={!canAddPanel}
    />

    <select
  style={fieldStyle}
  value={panelEnvironment}
  onChange={(e) =>
    setPanelEnvironment(e.target.value as "Indoor" | "Outdoor")
  }
  disabled={!canAddPanel || isPackagedPanel}
>
  <option value="Indoor">Indoor</option>
  <option value="Outdoor">Outdoor</option>
</select>

<select
  style={fieldStyle}
  value={panelIpRating}
  onChange={(e) => setPanelIpRating(e.target.value)}
  disabled={!canAddPanel || isPackagedPanel}
>
  {getAvailableIpRatings().map((ip) => (
    <option key={ip} value={ip}>
      {ip}
    </option>
  ))}
</select>

{isPackagedPanel && (
  <>
    <select
      style={fieldStyle}
      value={panelSupplyPanelId}
      onChange={(e) => setPanelSupplyPanelId(e.target.value)}
      disabled={!canAddPanel}
    >
      <option value="">Supply Panel</option>

      {panels
        .filter((panel) => panel.id !== editingPanelId)
        .filter((panel) => panel.panelType !== "Packaged Panel")
        .map((panel) => (
          <option key={panel.id} value={panel.id}>
            {panel.name}
          </option>
        ))}
    </select>

    <input
      style={fieldStyle}
      type="number"
      step="0.1"
      min="0"
      placeholder="Distance to Supply Panel (m)"
      value={panelCableLengthM}
      onChange={(e) => setPanelCableLengthM(e.target.value)}
      disabled={!canAddPanel}
    />

    <select
      style={fieldStyle}
      value={panelCableType}
      onChange={(e) => setPanelCableType(e.target.value as CableType)}
      disabled={!canAddPanel}
    >
      <option value="">Panel Cable Type</option>

      {cableTypeOptions.map((item) => (
        <option key={item} value={item}>
          {item}
        </option>
      ))}
    </select>
  </>
)}

    <button
      onClick={handleAddPanel}
      disabled={!canAddPanel}
      style={{
      ...buttonStyle,
      cursor: canAddPanel ? "pointer" : "not-allowed",
      opacity: canAddPanel ? 1 : 0.5,
      gridColumn: "span 2",
      }}
      >
      {editingPanelId !== null ? "Update Panel" : "Add Panel"}
    </button>
  </div>

  <p style={{ marginBottom: 0, opacity: 0.8, marginTop: 12 }}>
    {canAddPanel
      ? `Selected node for panel: ${selectedNode?.name || "-"}`
      : "Select a node to add panel"}
  </p>
</div>

            <h3 style={{ marginTop: 0 }}>Create Load</h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
              }}
            >
              <select
                style={fieldStyle}
                value={loadType}
                onChange={(e) => {
                  setIsCopyDraft(false);
                  setLoadType(e.target.value as LoadType | "");
                  }}
                disabled={!canAddLoad}
              >
                <option value="">Select Load</option>
                <option value="Pump">Pump</option>
                <option value="Fan">Fan</option>
                <option value="AHU">AHU</option>
                <option value="Manual">Manual Entry</option>
              </select>

              <select
                style={fieldStyle}
                value={manualLoadType}
                onChange={(e) => setManualLoadType(e.target.value as "" | ManualLoadType)}
                disabled={!canAddLoad || !isManualLoad}
              >
                <option value="">Manual Load Type</option>
                {manualLoadTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                style={fieldStyle}
                value={brand}
                onChange={(e) => {
                setIsCopyDraft(false);
                setBrand(e.target.value);
                }}
                disabled={!canAddLoad || !loadType || !isCatalogLoad}
              >
                <option value="">Select Brand</option>
                {availableBrands.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                style={fieldStyle}
                value={series}
                onChange={(e) => {
                setIsCopyDraft(false);
                setSeries(e.target.value);
              }}
                disabled={!canAddLoad || !loadType || !isCatalogLoad || !brand}
              >
                <option value="">Select Series</option>
                {availableSeries.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                style={fieldStyle}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!canAddLoad || !loadType || !isCatalogLoad || !series}
              >
                <option value="">Select Model</option>
                {availableModels.map((item) => (
                  <option key={item.model} value={item.model}>
                    {item.model}
                  </option>
                ))}
              </select>

              <select
                style={fieldStyle}
                value={phaseType}
                onChange={(e) => setPhaseType(e.target.value as "" | PhaseType)}
                disabled={!canAddLoad || !isManualLoad}
              >
                <option value="">Select Phase</option>
                <option value="1P">1 Phase</option>
                <option value="3P">3 Phase</option>
              </select>

              <select
                style={fieldStyle}
                value={phaseLine}
                onChange={(e) => setPhaseLine(e.target.value as "" | PhaseLine)}
                disabled={!canAddLoad || phaseType !== "1P"}
              >
                <option value="">Select Line</option>
                <option value="R">R</option>
                <option value="S">S</option>
                <option value="T">T</option>
              </select>

              <select
                style={fieldStyle}
                value={loadCharacter}
                onChange={(e) =>
                setLoadCharacter(e.target.value as "" | LoadCharacter)
                }
              disabled={!canAddLoad || !isManualLoad}
              >
                <option value="">Select Load Character</option>
                <option value="Ohmic">Ohmic</option>
                <option value="Inductive">Inductive</option>
                <option value="Capacitive">Capacitive</option>
              </select>

              <select
                style={fieldStyle}
                value={cosPhi}
                onChange={(e) => setCosPhi(e.target.value)}
                disabled={!canAddLoad}
              >
              <option value="">Select Cos φ</option>
                {cosPhiOptions.map((item) => (
                <option key={item} value={item}>
                {item}
                </option>
                ))}
              </select>

              <select
                style={fieldStyle}
                value={startingMethod}
                onChange={(e) => setStartingMethod(e.target.value)}
                disabled={!canAddLoad}
                >
                <option value="">Starting Method</option>
                <option value="DOL">DOL</option>
                <option value="Star-Delta">Star-Delta</option>
                <option value="VFD">VFD</option>
                <option value="Soft Starter">Soft Starter</option>
                <option value="Direct Connection">Direct Connection</option>
                <option value="Other">Other</option>
              </select>

              <input
                style={fieldStyle}
                type="number"
                step="0.1"
                min="0"
                placeholder="Distance to Panel (m)"
                value={cableLengthM}
                onChange={(e) => setCableLengthM(e.target.value)}
                disabled={!canAddLoad}
              />

              <select
                style={fieldStyle}
                value={cableType}
                onChange={(e) => setCableType(e.target.value as CableType)}
                disabled={!canAddLoad}
                >
                <option value="">Cable Type</option>

                {cableTypeOptions.map((item) => (
                <option key={item} value={item}>
                {item}
                </option>
                ))}
              </select>

              <input
                style={fieldStyle}
                placeholder="Project Code"
                value={projectCode}
                onChange={(e) => setProjectCode(e.target.value)}
                disabled={!canAddLoad}
              />

              <input
                style={fieldStyle}
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={!canAddLoad}
              />

              

              <select
              style={fieldStyle}
              value={connectedPanelId}
              onChange={(e) => setConnectedPanelId(e.target.value)}
              disabled={!canAddLoad}
              >
              <option value="">Connected Panel</option>
              {availablePanelsForSelectedNode.map((panel) => (
              <option key={panel.id} value={panel.id}>
              {panel.name} ({panel.panelType})
              </option>
              ))}
              </select>

              <input
                style={fieldStyle}
                type="number"
                placeholder="Power (kW)"
                value={loadPowerKw}
                onChange={(e) => setLoadPowerKw(e.target.value)}
                disabled={!canAddLoad || !isManualLoad}
              />

              <input
                style={fieldStyle}
                type="number"
                placeholder="Quantity"
                value={loadQuantity}
                onChange={(e) => setLoadQuantity(e.target.value)}
                disabled={!canAddLoad}
              />

              <textarea
                style={{
                ...fieldStyle,
                gridColumn: "span 2",
                minHeight: 70,
                resize: "vertical",
                fontFamily: "inherit",
              }}
                placeholder="Load Note / Internal Comment"
                value={loadNote}
                onChange={(e) => setLoadNote(e.target.value)}
                disabled={!canAddLoad}
              />

              <button
                onClick={handleAddLoad}
                disabled={!canAddLoad}
                style={{
                  ...buttonStyle,
                  cursor: canAddLoad ? "pointer" : "not-allowed",
                  opacity: canAddLoad ? 1 : 0.5,
                  gridColumn: "span 2",
                }}
              >
                {editingLoadId !== null ? "Update Load" : "Add Load"}
              </button>
            </div>

            <p style={{ marginBottom: 0, opacity: 0.8, marginTop: 12 }}>
              {canAddLoad
                ? `Selected room: ${selectedNode.name}`
                : "Select a room to add load"}
            </p>
          </div>
        </div>

  <div style={{ width: "68%" }}>
  <div
    style={{
      background: "#111827",
      border: "1px solid #334155",
      borderRadius: 12,
      padding: 16,
      minHeight: 500,
      maxHeight: "calc(100vh - 180px)",
      overflowY: "auto",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
      }}
    >
      <h3 style={{ margin: 0 }}>Structure Tree</h3>

      <div style={{ display: "flex", gap: 8 }}>
  <input
    id="currist-import-input"
    type="file"
    accept=".xlsx"
    style={{ display: "none" }}
    onChange={handleImportFileSelection}
  />

  <button
    onClick={() => {
      document.getElementById("currist-import-input")?.click();
    }}
    style={{
      ...buttonStyle,
      background: "#a78bfa",
      color: "#0f172a",
      cursor: "pointer",
    }}
  >
    Import Project
  </button>
</div>
      
    </div>

    

    {renderTree(null)}
  </div>
</div>

{selectedPanelDetail &&
  renderPanelDetailModal(selectedPanelDetail)}

  {importModeOpen && pendingImportFile && (
  <>
    <div
      onClick={() => {
        setImportModeOpen(false);
        setPendingImportFile(null);
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        zIndex: 10000,
      }}
    />

    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 620,
        maxWidth: "calc(100vw - 40px)",
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 18,
        padding: 24,
        zIndex: 10001,
        boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Import Mode</h2>

      <p style={{ opacity: 0.8 }}>
        How would you like to use this file?
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginTop: 20,
        }}
      >
        <button
          onClick={async () => {
          if (!pendingImportFile) return;

          await preparePanelImport(pendingImportFile);
          }}
          style={{
            ...buttonStyle,
            minHeight: 120,
            background: "#38bdf8",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <strong style={{ fontSize: 17 }}>▣ Import Panel Only</strong>

          <span style={{ fontSize: 12, fontWeight: "normal" }}>
            Keep the current project and add only the exported panel.
          </span>
        </button>

        <button
          disabled={!canRestoreEntireProject}
          onClick={async () => {
          if (!pendingImportFile) return;

          const confirmed = window.confirm(
          "Your current project will be replaced. Continue?"
          );

          if (!confirmed) return;

          await performProjectImport(pendingImportFile);
          }}
          style={{
            ...buttonStyle,
            minHeight: 120,
            background: canRestoreEntireProject ? "#f59e0b" : "#334155",
            color: canRestoreEntireProject ? "#0f172a" : "#94a3b8",
            cursor: canRestoreEntireProject ? "pointer" : "not-allowed",
            opacity: canRestoreEntireProject ? 1 : 0.65,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <strong style={{ fontSize: 17 }}>▣ ▣ ▣ Restore Entire Project</strong>

          <span style={{ fontSize: 12, fontWeight: "normal" }}>
            {canRestoreEntireProject
              ? "Replace the current project with all data in this file."
              : "Full project data is not available in this file."}
          </span>
        </button>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 20,
        }}
      >
        <button
          onClick={() => {
            setImportModeOpen(false);
            setPendingImportFile(null);
          }}
          style={{
            ...buttonStyle,
            background: "#334155",
            color: "white",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </>
)}

{panelLocationOpen && pendingImportFile && (
  <>
    <div
      onClick={() => {
        setPanelLocationOpen(false);
        setPendingImportFile(null);
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.65)",
        zIndex: 10000,
      }}
    />

    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 680,
        maxWidth: "calc(100vw - 40px)",
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 18,
        padding: 24,
        zIndex: 10001,
        boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Panel Location</h2>

      <p style={{ opacity: 0.8 }}>
        Review or edit the destination before importing the panel.
      </p>

      <input
  style={{
    ...fieldStyle,
    width: "100%",
    boxSizing: "border-box",
    marginTop: 16,
  }}
  placeholder="Project Name"
  value={importProjectName}
  onChange={(e) => setImportProjectName(e.target.value)}
/>

<input
  style={{
    ...fieldStyle,
    width: "100%",
    boxSizing: "border-box",
    marginTop: 12,
  }}
  placeholder="Building Name"
  value={importBuildingName}
  onChange={(e) => setImportBuildingName(e.target.value)}
/>

<input
  style={{
    ...fieldStyle,
    width: "100%",
    boxSizing: "border-box",
    marginTop: 12,
  }}
  placeholder="Block Name"
  value={importBlockName}
  onChange={(e) => setImportBlockName(e.target.value)}
/>

<input
  style={{
    ...fieldStyle,
    width: "100%",
    boxSizing: "border-box",
    marginTop: 12,
  }}
  placeholder="Floor"
  value={importFloorName}
  onChange={(e) => setImportFloorName(e.target.value)}
/>

<input
  style={{
    ...fieldStyle,
    width: "100%",
    boxSizing: "border-box",
    marginTop: 12,
  }}
  placeholder="Room"
  value={importRoomName}
  onChange={(e) => setImportRoomName(e.target.value)}
/>

<input
  style={{
    ...fieldStyle,
    width: "100%",
    boxSizing: "border-box",
    marginTop: 12,
  }}
  placeholder="Room Description"
  value={importRoomOptionalName}
  onChange={(e) => setImportRoomOptionalName(e.target.value)}
/>

<select
  style={{
    ...fieldStyle,
    width: "100%",
    boxSizing: "border-box",
    marginTop: 12,
  }}
  value={importCountry}
  onChange={(e) => setImportCountry(e.target.value)}
>
  <option value="">Select Country</option>

  {countryOptions.map((country) => (
    <option key={country} value={country}>
      {countryFlags[country] || "🌍"} {country}
    </option>
  ))}
</select>

<select
  style={{
    ...fieldStyle,
    width: "100%",
    boxSizing: "border-box",
    marginTop: 12,
  }}
  value={importBuildingType}
  onChange={(e) => setImportBuildingType(e.target.value)}
>
  <option value="">Select Building Type</option>

  {buildingTypeOptions.map((item) => (
    <option key={item} value={item}>
      {buildingTypeIcons[item] || "🏗️"} {item}
    </option>
  ))}
</select>

      <button
        onClick={() => {
          setPanelLocationOpen(false);
          setPendingImportFile(null);
        }}
        style={{
          ...buttonStyle,
          background: "#334155",
          color: "white",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>

      <button
      onClick={async () => {
      if (!pendingImportFile) return;

      await performPanelImport(pendingImportFile);
      }}
    style={{
      ...buttonStyle,
      cursor: "pointer",
    }}
  >
    Create & Import
  </button>
    </div>
    
  </>
)}

{welcomeOpen && (
  <>
    <div
      onClick={() => setWelcomeOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        zIndex: 10000,
      }}
    />

    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 700,
        maxWidth: "calc(100vw - 40px)",
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 18,
        padding: 28,
        zIndex: 10001,
        boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          marginBottom: 18,
          fontSize: 32,
        }}
      >
        Welcome to Currist
      </h2>

      <div
  style={{
    lineHeight: 1.8,
    opacity: 0.9,
    fontSize: 15,
    maxHeight: 420,
    overflowY: "auto",
  }}
>
<h3>✅ COMPLETED FEATURES</h3>

<div><strong>Structure Management</strong></div>
<div>- Project / Building / Block / Floor / Room Structure</div>
<div>- Country Selection With Flag Badge</div>
<div>- Building Type Selection With Icon</div>
<div>- Alphabetical / Created Date Sorting</div>
<div>- Create / Edit / Delete Structure Nodes</div>
<div>- Full Structure Reconstruction From Project Import</div>
<div>- Automatic Destination Structure Creation For Panel Import</div>
<div>- Existing Structure Reuse During Panel Import</div>
<div>- Editable Panel Import Destination</div>

<br />

<div><strong>Load Management</strong></div>
<div>- Create / Edit / Copy / Delete Load</div>
<div>- Load Detail Popup</div>
<div>- Catalog Based Loads</div>
<div>- Manual Loads</div>
<div>- 1P / 3P Load Definition</div>
<div>- R / S / T Line Selection</div>
<div>- Load Character And Cos φ Selection</div>
<div>- Starting Method Definition</div>
<div>- Starting Method Display In Load Detail</div>
<div>- Cable Length Entry</div>
<div>- Cable Type Definition</div>
<div>- Load Note / Internal Comment</div>
<div>- Connected Panel Assignment</div>
<div>- Unassigned Load Management</div>
<div>- Full Load Reconstruction From Project Import</div>
<div>- Load Reconstruction With New IDs During Panel Import</div>
<div>- Connected Panel ID Remapping During Panel Import</div>
<div>- Packaged Panel Load Reconstruction</div>

<br />

<div><strong>Panel Management</strong></div>
<div>- Create / Edit / Copy / Delete Panel</div>
<div>- Copy Panel With Connected Loads</div>
<div>- Panel Detail Popup</div>
<div>- Panel Environment And IP Rating</div>
<div>- Packaged Panel Logic</div>
<div>- Packaged Panel Feeders</div>
<div>- Packaged Panel Supply Cable Definition</div>
<div>- Upstream Supply Panel Connection</div>
<div>- Connected Panel Relationships</div>
<div>- Packaged Panel Supply Phase Definition</div>
<div>- Full Panel Reconstruction From Project Import</div>
<div>- Panel Reuse In Another Project / Building / Floor / Room</div>
<div>- Main Panel ID Remapping During Panel Import</div>
<div>- Packaged Panel ID Remapping During Panel Import</div>
<div>- Packaged Panel Supply Relationship Reconstruction</div>
<div>- Editable Project And Location Information Before Panel Import</div>

<br />

<div><strong>Project & Panel Summary</strong></div>
<div>- Installed Power</div>
<div>- Current Calculation</div>
<div>- Project Load Count</div>
<div>- Packaged Panel Counted As A Single Project Load / Feeder</div>
<div>- Packaged Panel Internal Loads Excluded From Project Load Count</div>
<div>- Panel Outgoing Circuit Count</div>
<div>- P / Q / S Calculation</div>
<div>- Weighted Average Cos φ</div>
<div>- Phase Distribution</div>
<div>- Phase Balance Analysis</div>
<div>- Balance Status (Excellent / Good / Attention / Critical)</div>
<div>- Power Factor Summary</div>
<div>- Phase Angle (φ) Calculation</div>
<div>- Power Factor Type Classification (Inductive / Capacitive / Ohmic)</div>

<br />

<div><strong>Energy Analyzer / Meter</strong></div>
<div>- Multiple Analyzers Per Panel</div>
<div>- Assign Loads To Analyzer</div>
<div>- Each Load Can Belong To Only One Analyzer</div>
<div>- Common Unassigned Loads List</div>
<div>- Assigned Loads Move Under Related Analyzer</div>
<div>- Analyzer Badge On Panel Card</div>
<div>- Packaged Panel Feeder Assignment Support</div>
<div>- Analyzer Reconstruction From Project Import</div>
<div>- Analyzer Reconstruction During Panel Import</div>
<div>- Analyzer To Load ID Remapping</div>
<div>- Analyzer To Packaged Panel Feeder ID Remapping</div>

<br />

<div><strong>Excel Panel Export</strong></div>
<div>- Professional Panel Report Export</div>
<div>- Engineering Style Header</div>
<div>- Panel Based Excel File Naming</div>
<div>- File Name Format: Panel Name - Panel Report.xlsx</div>
<div>- KPI Dashboard</div>
<div>- P / Q / S Export</div>
<div>- Power Factor Summary Export</div>
<div>- Phase Distribution Export</div>
<div>- Phase Balance Analysis Export</div>
<div>- Analyzer Information Export</div>
<div>- Connected Panel Export</div>
<div>- Starting Method Export</div>
<div>- Cable Length Export</div>
<div>- Cable Type Export</div>
<div>- Load Notes Export</div>
<div>- Engineering Load Schedule</div>
<div>- Created / Revised Date Export</div>
<div>- Packaged Panel Grouping</div>
<div>- Multi-Row Packaged Panel Export</div>
<div>- Analyzer Cell Merge</div>
<div>- Packaged Panel Feeder Merge Logic</div>
<div>- Merged Feeder Information For Packaged Panels</div>
<div>- Cable Summary Report</div>
<div>- Automatic Cable Section Calculation</div>
<div>- Voltage Drop Based Cable Sizing</div>
<div>- 3% Voltage Drop Information</div>

<br />

<div><strong>Currist Internal Export Data</strong></div>
<div>- Hidden Engineering Data Sheet</div>
<div>- Currist File Validation Marker</div>
<div>- Export Version Information</div>
<div>- Project Metadata Table</div>
<div>- Structure Data Table</div>
<div>- Panel Data Table</div>
<div>- Load Data Table</div>
<div>- Analyzer Data Table</div>
<div>- Country And Building Type Storage</div>
<div>- Packaged Panel Relationship Storage</div>
<div>- Analyzer Connected Item Storage</div>

<br />

<div><strong>Project Restore</strong></div>
<div>- Restore Entire Project From Currist Excel Export</div>
<div>- Replace Current Project With Imported Project</div>
<div>- Project Restore Safety Confirmation</div>
<div>- Restore Option Availability Check</div>
<div>- Restore Button Disabled When Full Project Data Is Missing</div>
<div>- Country Reconstruction</div>
<div>- Building Type Reconstruction</div>
<div>- Structure Reconstruction</div>
<div>- Panel Reconstruction</div>
<div>- Load Reconstruction</div>
<div>- Analyzer Reconstruction</div>
<div>- Packaged Panel Reconstruction</div>
<div>- Supply Panel Relationship Reconstruction</div>

<br />

<div><strong>Panel Import / Reuse Engine</strong></div>
<div>- Import Mode Selection Popup</div>
<div>- Import Panel Only Mode</div>
<div>- Restore Entire Project Mode</div>
<div>- Editable Panel Destination Popup</div>
<div>- Source Project Details Automatically Loaded</div>
<div>- Project Name Editing Before Import</div>
<div>- Building Name Editing Before Import</div>
<div>- Block Editing Before Import</div>
<div>- Floor Editing Before Import</div>
<div>- Room Number Editing Before Import</div>
<div>- Room Description Editing Before Import</div>
<div>- Country Editing Before Import</div>
<div>- Building Type Editing Before Import</div>
<div>- Automatic Destination Structure Creation</div>
<div>- Existing Destination Structure Detection And Reuse</div>
<div>- Main Panel Import</div>
<div>- Main Panel Load Import</div>
<div>- Packaged Panel Import</div>
<div>- Packaged Panel Load Import</div>
<div>- Upstream Supply Panel Mapping</div>
<div>- Load ID Mapping</div>
<div>- Panel ID Mapping</div>
<div>- Analyzer ID Reconstruction</div>
<div>- Analyzer To Load Mapping</div>
<div>- Analyzer To Packaged Panel Feeder Mapping</div>
<div>- Reuse The Same Panel In Different Rooms</div>
<div>- Reuse Existing Engineering Designs In New Projects</div>

<hr style={{ margin: "16px 0", borderColor: "#334155" }} />

<h3>🔨 CURRENT DEVELOPMENT</h3>

<div><strong>Import / Export Architecture</strong></div>
<div>- Shared Import / Export Schema</div>
<div>- Centralized Column Definitions</div>
<div>- Reduce Duplicate Export And Import Field Mapping</div>
<div>- Import Pipeline Refactoring</div>
<div>- Separate Data Preparation And State Commit Stages</div>
<div>- Atomic Import Commit</div>
<div>- Remove Temporary Import Debug Logs</div>
<div>- Export Version Compatibility</div>
<div>- Backward Compatibility For Older Export Files</div>
<div>- Detailed Import Validation</div>
<div>- Duplicate Panel Name Validation</div>
<div>- Duplicate Project Code Validation During Panel Reuse</div>
<div>- Improved Import Success And Error Messages</div>

<br />

<div><strong>Import / Export Testing</strong></div>
<div>- Multiple Normal Panel Test</div>
<div>- Multiple Packaged Panel Test</div>
<div>- Multiple Analyzer Test</div>
<div>- Empty Analyzer Test</div>
<div>- Analyzer Feeder Mapping Test</div>
<div>- Existing Destination Structure Test</div>
<div>- New Destination Structure Test</div>
<div>- Same Panel Imported Into Multiple Rooms Test</div>
<div>- Old Export Version Test</div>
<div>- Invalid / Incomplete Excel File Test</div>
<div>- Project Restore Regression Test</div>
<div>- Panel Reuse Regression Test</div>

<br />

<div><strong>Engineering Report Improvements</strong></div>
<div>- Export Layout Refinement</div>
<div>- Engineering Report Formatting</div>
<div>- Header And Section Alignment</div>
<div>- Column Width And Text Wrapping Improvements</div>
<div>- Cable Summary Visual Refinement</div>
<div>- Packaged Panel Row Presentation Improvements</div>
<div>- Analyzer Presentation Improvements</div>
<div>- Cable Sizing Validation</div>
<div>- Final Excel Report Quality Review</div>

<br />

<div><strong>Panel Technical Specification</strong></div>
<div>- Panel Color</div>
<div>- Seismic Requirement</div>
<div>- Cable Entry Direction</div>
<div>- Cooling Method</div>
<div>- Technical Specification Generation</div>

<hr style={{ margin: "16px 0", borderColor: "#334155" }} />

<h3>🎯 ROADMAP</h3>

<div><strong>Project File System</strong></div>
<div>- .currist Native Project File</div>
<div>- Full Project Excel Export</div>
<div>- PDF Export</div>
<div>- Automatic Local Backup</div>
<div>- Project Recovery</div>
<div>- Import / Export Migration Between Versions</div>

<br />

<div><strong>Electrical Engineering</strong></div>
<div>- Diversity Factor</div>
<div>- Demand Factor</div>
<div>- Coincidence Factor</div>
<div>- Mutually Exclusive Loads</div>
<div>- Compensation Calculation</div>
<div>- Transformer Selection</div>
<div>- Generator Selection</div>
<div>- UPS Selection</div>

<br />

<div><strong>Cable Engineering</strong></div>
<div>- Cable Type Library</div>
<div>- Cable Current Carrying Capacity Validation</div>
<div>- Cable Schedule Report</div>
<div>- Advanced Voltage Drop Parameters</div>
<div>- Installation Method Definition</div>
<div>- Ambient Temperature Correction</div>
<div>- Grouping Correction Factors</div>
<div>- Cable Library Expansion</div>

<br />

<div><strong>Panel Engineering</strong></div>
<div>- Panel Dimension Calculation</div>
<div>- Main Switch Selection</div>
<div>- Feeder Breaker Selection</div>
<div>- Contactor Selection</div>
<div>- MPCB Selection</div>
<div>- Starter Selection</div>
<div>- Soft Starter Selection</div>
<div>- VFD Selection</div>
<div>- Motor Protection Selection</div>
<div>- Control Components Selection</div>

<br />

<div><strong>Documentation</strong></div>
<div>- PDF Panel Report</div>
<div>- Technical Specification Generation</div>
<div>- Panel Technical Specification</div>
<div>- Bill Of Materials (BOM)</div>
<div>- Cable Schedule</div>
<div>- Supplier Ready Documentation</div>

<br />

<div><strong>Supplier Workflow</strong></div>
<div>- Frozen Panel Status</div>
<div>- Revision Comparison</div>
<div>- Revision Tracking</div>
<div>- Imported Panel Source Tracking</div>
<div>- Panel Template Library</div>

<br />

<div><strong>User Account & Cloud</strong></div>
<div>- User Login</div>
<div>- User Account Management</div>
<div>- Cloud Project Storage</div>
<div>- Continue From Last Project</div>
<div>- Project Synchronization</div>
<div>- Automatic Cloud Backup</div>
<div>- Project Sharing</div>
<div>- Team Collaboration</div>

<br />

<div><strong>Commercial Product</strong></div>
<div>- Entry / Mid / High Subscription Tiers</div>
<div>- Import Availability For Mid And High Tiers</div>
<div>- Subscription Management</div>
<div>- Trial Period</div>
<div>- License And Feature Control</div>
<div>- Payment Integration</div>
<div>- Production Monitoring And Error Reporting</div>
<div>- User Documentation And Onboarding</div>

<br />

<div><strong>Platform</strong></div>
<div>- Tablet Responsive Layout</div>
<div>- iPad Compatibility</div>
<div>- Mobile Responsive Layout</div>
<div>- iPhone Compatibility</div>

<hr style={{ margin: "16px 0", borderColor: "#334155" }} />

<h3>📦 VERSION INFORMATION</h3>

<div>Version: 0.8.3</div>
<div>Developed By: Ergin Yurttaş</div>
<div>Contact: erginyurttas@gmail.com</div>

<div style={{ marginTop: 12 }}>
  <strong>Last Update:</strong> Jul 12, 2026
</div>

</div>

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: 24,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
            marginTop: 24,
            }}
          >
          <button
            onClick={() => {
              setWelcomeOpen(false);
              setHelpOpen(true);
            }}
            style={{
      background: "#1e293b",
      border: "1px solid #334155",
      padding: "10px 18px",
      borderRadius: 8,
      color: "white",
      cursor: "pointer",
    }}
  >
    I Need Help Getting Started
  </button>

  <button
    onClick={() => setWelcomeOpen(false)}
    style={{
      ...buttonStyle,
      cursor: "pointer",
      padding: "10px 18px",
    }}
  >
    Start Designing
  </button>
</div>
      </div>
    </div>
  </>
)}

{helpOpen && (
  <>
    <div
      onClick={() => setHelpOpen(false)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        zIndex: 10000,
      }}
    />

    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 720,
        maxWidth: "calc(100vw - 40px)",
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 18,
        padding: 28,
        zIndex: 10001,
        boxShadow: "0 25px 60px rgba(0,0,0,0.45)",
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: 18, fontSize: 30 }}>
        How to Start with Currist
      </h2>

      <div style={{ lineHeight: 1.8, opacity: 0.9, fontSize: 15 }}>
        <p>
          Start by creating your project structure. First add a project, then
          continue with building, block, floor, and room definitions.
        </p>

        <p>
          After selecting a room, you can create electrical loads such as pumps,
          fans, AHUs, or manual loads. Catalog-based loads will automatically
          bring default technical data such as power, phase type, and load
          character.
        </p>

        <p>
          You can also create panels and assign loads to panels. Currist will
          calculate installed power, operating current, phase distribution, load
          character, and power factor summaries.
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24 }}>
        <button
          onClick={() => setHelpOpen(false)}
          style={{
            ...buttonStyle,
            cursor: "pointer",
            padding: "10px 18px",
          }}
        >
          Got It, Start Designing
        </button>
      </div>
    </div>
  </>
)}

{selectedLoadDetail && (
  <>
    <div
      onClick={() => setSelectedLoadDetail(null)}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        zIndex: 9998,
      }}
    />

    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 520,
        maxWidth: "calc(100vw - 40px)",
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 16,
        padding: 20,
        zIndex: 9999,
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        lineHeight: 1.8,
      }}
    >
      <h3
  style={{
    marginTop: 0,
    color: "#0ea5e9",
  }}
>
  Load Detail
</h3>

      <div><strong>Project Code:</strong> {selectedLoadDetail.projectCode}</div>
      <div><strong>Description:</strong> {selectedLoadDetail.description}</div>

      <div>
  <strong>Location:</strong>{" "}
  {(() => {
    const room = structures.find((s) => s.id === selectedLoadDetail.roomId);
    const floor = structures.find((s) => s.id === room?.parentId);
    const block = structures.find((s) => s.id === floor?.parentId);

    return [
      block?.name,
      floor?.optionalName
        ? `${floor.name} - ${floor.optionalName}`
        : floor?.name,
      room?.optionalName
        ? `${room.name} - ${room.optionalName}`
        : room?.name,
    ]
      .filter(Boolean)
      .join(" / ");
  })()}
</div>

      <div><strong>Load Type:</strong> {selectedLoadDetail.loadType}</div>
      <div><strong>Manual Type:</strong> {selectedLoadDetail.manualLoadType || "-"}</div>
      <div><strong>Brand:</strong> {selectedLoadDetail.brand || "-"}</div>
      <div><strong>Series:</strong> {selectedLoadDetail.series || "-"}</div>
      <div><strong>Model:</strong> {selectedLoadDetail.model || "-"}</div>
      <div><strong>Power:</strong> {selectedLoadDetail.powerKw} kW</div>
      <div><strong>Quantity:</strong> {selectedLoadDetail.quantity}</div>
      <div><strong>Total Power:</strong> {(selectedLoadDetail.powerKw * selectedLoadDetail.quantity).toFixed(2)} kW</div>
      <div><strong>Phase:</strong> {selectedLoadDetail.phaseType}</div>
      <div><strong>Line:</strong> {selectedLoadDetail.phaseLine || "-"}</div>
      <div><strong>Character:</strong> {selectedLoadDetail.loadCharacter || "-"}</div>
      <div><strong>Starting Method:</strong>{" "}{selectedLoadDetail.startingMethod || "-"}</div>
      <div><strong>Cos φ:</strong> {selectedLoadDetail.cosPhi ?? "-"}</div>
      <div><strong>Distance:</strong> {selectedLoadDetail.cableLengthM ?? "-"} m</div>
      <div><strong>Cable Type:</strong> {selectedLoadDetail.cableType || "-"}</div>
      

<div>
  <strong>Note:</strong> {selectedLoadDetail.note || "-"}
</div>
      <div>
        <strong>Connected Panel:</strong>{" "}
        {panels.find((p) => p.id === selectedLoadDetail.connectedPanelId)
          ? `${panels.find((p) => p.id === selectedLoadDetail.connectedPanelId)?.name} (${panels.find((p) => p.id === selectedLoadDetail.connectedPanelId)?.panelType})`
          : "-"}
      </div>
      <div>
        <strong>Created At:</strong>{" "}
        {new Date(selectedLoadDetail.createdAt).toLocaleString("tr-TR", {
          timeZone: "Europe/Istanbul",
        })}
      </div>

      <div>
        <strong>Last Edited:</strong>{" "}
        {selectedLoadDetail.updatedAt
        ? new Date(selectedLoadDetail.updatedAt).toLocaleString("tr-TR", {
        timeZone: "Europe/Istanbul",
        })
        : "-"}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 18 }}>
        <button
          onClick={() => setSelectedLoadDetail(null)}
          style={{
            ...buttonStyle,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>
    </div>
  </>
)}

{copyPanelSource && (
  <>
    <div
      onClick={() => {
        setCopyPanelSource(null);
        setCopyPanelName("");
        setCopyLoadProjectCodes({});
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.45)",
        zIndex: 9998,
      }}
    />

    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 620,
        maxWidth: "calc(100vw - 40px)",
        maxHeight: "calc(100vh - 80px)",
        overflowY: "auto",
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 16,
        padding: 20,
        zIndex: 9999,
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
        lineHeight: 1.8,
      }}
    >
      <h3 style={{ marginTop: 0 }}>Copy Panel With Loads</h3>

      <div style={{ marginBottom: 12 }}>
        <strong>Source Panel:</strong> {copyPanelSource.name} ({copyPanelSource.panelType})
      </div>

      <input
        style={{
          ...fieldStyle,
          width: "100%",
          boxSizing: "border-box",
          marginBottom: 12,
        }}
        placeholder="New Panel Name"
        value={copyPanelName}
        onChange={(e) => setCopyPanelName(e.target.value)}
      />

      <div style={{ marginBottom: 8 }}>
        <strong>Loads to Copy</strong>
      </div>

      {loads
        .filter((load) => load.connectedPanelId === copyPanelSource.id)
        .map((load) => (
          <div
            key={load.id}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginBottom: 10,
              alignItems: "center",
            }}
          >
            <div>
              {load.projectCode} - {load.description}
            </div>

            <input
              style={fieldStyle}
              placeholder="New Project Code"
              value={copyLoadProjectCodes[load.id] || ""}
              onChange={(e) =>
                setCopyLoadProjectCodes((prev) => ({
                  ...prev,
                  [load.id]: e.target.value,
                }))
              }
            />
          </div>
        ))}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 10,
          marginTop: 18,
        }}
      >
        <button
          onClick={() => {
            setCopyPanelSource(null);
            setCopyPanelName("");
            setCopyLoadProjectCodes({});
          }}
          style={{
            ...buttonStyle,
            background: "#334155",
            color: "white",
            cursor: "pointer",
          }}
        >
          Cancel
        </button>

        <button
          
          onClick={() => {
  if (!copyPanelName.trim()) {
    window.alert("Please enter a new panel name.");
    return;
  }

  const sourceLoads = loads.filter(
    (load) => load.connectedPanelId === copyPanelSource.id
  );

  const missingCodes = sourceLoads.some(
    (load) => !(copyLoadProjectCodes[load.id] || "").trim()
  );

  if (missingCodes) {
    window.alert("Please enter new project codes for all loads.");
    return;
  }

  const duplicatePanelName = panels.some(
  (panel) =>
    panel.name.trim().toLowerCase() === copyPanelName.trim().toLowerCase()
);

if (duplicatePanelName) {
  window.alert("Panel name must be unique.");
  return;
}

const newProjectCodes = sourceLoads.map((load) =>
  (copyLoadProjectCodes[load.id] || "").trim().toLowerCase()
);

const hasDuplicateNewCodes =
  new Set(newProjectCodes).size !== newProjectCodes.length;

if (hasDuplicateNewCodes) {
  window.alert("New project codes must be unique.");
  return;
}

const existingProjectCodeConflict = loads.some((load) =>
  newProjectCodes.includes(load.projectCode.trim().toLowerCase())
);

if (existingProjectCodeConflict) {
  window.alert("One or more project codes already exist.");
  return;
}

const now = Date.now();
const newPanelId = now;

const newPanel: Panel = {
  ...copyPanelSource,
  id: newPanelId,
  name: copyPanelName.trim(),
  createdAt: now,
};

const copiedLoads: Load[] = sourceLoads.map((load, index) => ({
  ...load,
  id: now + index + 1,
  projectCode: (copyLoadProjectCodes[load.id] || "").trim(),
  connectedPanelId: newPanelId,
  createdAt: now + index + 1,
  updatedAt: now + index + 1,
}));

setPanels((prev) => [...prev, newPanel]);
setLoads((prev) => [...prev, ...copiedLoads]);

setCopyPanelSource(null);
setCopyPanelName("");
setCopyLoadProjectCodes({});

}}

          style={{
            ...buttonStyle,
            cursor: "pointer",
          }}
        >
          Create Copy
        </button>
      </div>
    </div>
  </>
)}

      </div>
    </div>
  );
}