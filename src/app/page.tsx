"use client";

import { useEffect, useMemo, useState } from "react";
import { catalog } from "./data/catalog";

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
  ManualLoadType,
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

const countryOptions = [
  "Turkey",
  "Germany",
  "France",
  "United Kingdom",
  "United States",
  "Saudi Arabia",
  "United Arab Emirates",
  "Qatar",
  "Kuwait",
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

  const [name, setName] = useState("");
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
  

  const [projectCode, setProjectCode] = useState("");
  const [description, setDescription] = useState("");
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
  const [panelName, setPanelName] = useState("");
  const [panelType, setPanelType] = useState<PanelType>("DB");
  const [panelPhaseType, setPanelPhaseType] = useState<PanelPhaseType>("3P");
  const [panelDescription, setPanelDescription] = useState("");
  const [connectedPanelId, setConnectedPanelId] = useState("");
  const [editingLoadId, setEditingLoadId] = useState<number | null>(null);
  const [isCopyDraft, setIsCopyDraft] = useState(false);
  const [editingPanelId, setEditingPanelId] = useState<number | null>(null);
  const [copyPanelSource, setCopyPanelSource] = useState<Panel | null>(null);
  const [copyPanelName, setCopyPanelName] = useState("");
  const [copyLoadProjectCodes, setCopyLoadProjectCodes] = useState<Record<number, string>>({});
  const [expandedPanels, setExpandedPanels] = useState<Record<number, boolean>>({});

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
          item.id === editingId ? { ...item, name: name.trim() } : item
        )
      );
      setEditingId(null);
      setName("");
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
    };

    setStructures((prev) => [...prev, newItem]);
    setName("");

    if (selectedParent !== null) {
      setCollapsedIds((prev) => prev.filter((id) => id !== selectedParent));
    }
  };

  const handleEditSelected = () => {
    if (!selectedNode) return;

    setEditingId(selectedNode.id);
    setName(selectedNode.name);
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
  if (!selectedNode) return [];

  return panels.filter((panel) => {
    if (selectedNode.type === "room") {
      const floor = structures.find((s) => s.id === selectedNode.parentId);
      const block = structures.find((s) => s.id === floor?.parentId);

      return (
        panel.structureId === selectedNode.id ||
        panel.structureId === floor?.id ||
        panel.structureId === block?.id
      );
    }

    return panel.structureId === selectedNode.id;
  });
}, [panels, selectedNode, structures]);

  

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

const handleAddPanel = () => {
  if (!selectedNode) return;
  if (!panelName.trim()) return;
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
          }
        : panel
    )
  );

  setEditingPanelId(null);

  setPanelName("");
  setPanelType("DB");
  setPanelPhaseType("3P");
  setPanelDescription("");

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
    createdAt: now,
  };

  setPanels((prev) => [...prev, newPanel]);

  setPanelName("");
  setPanelType("DB");
  setPanelPhaseType("3P");
  setPanelDescription("");
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
            connectedPanelId:
              connectedPanelId.trim() === ""
                ? undefined
                : Number(connectedPanelId),
            loadCharacter: loadCharacter || undefined,
            cosPhi: parsedCosPhi,
            cableLengthM: parsedCableLength,
            updatedAt: Date.now(),
          }
        : load
    )
  );

  setEditingLoadId(null);
  setProjectCode("");
  setDescription("");
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
      
    };

    setLoads((prev) => [...prev, newLoad]);

    setProjectCode("");
    setDescription("");
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

const getPanelsByNode = (nodeId: number) => {
  return panels
    .filter((panel) => panel.structureId === nodeId)
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

  onePhaseLoads.forEach((load) => {
    if (load.phaseLine) {
      phaseLoadsKw[load.phaseLine] += load.powerKw * load.quantity;
    }
  });

  const totalSinglePhasePowerKw =
    phaseLoadsKw.R + phaseLoadsKw.S + phaseLoadsKw.T;

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
    totalLoadCount: loads.length,
    totalP,
    totalQ,
    totalS,
    averageCosPhi,
  };
}, [loads]);


const panelSummaries = useMemo(() => {
  return panels.map(panel => {
    const panelLoads = loads.filter(
      (load) => load.connectedPanelId === panel.id
    );

    const totalKw = panelLoads.reduce(
      (sum, load) => sum + load.powerKw * load.quantity,
      0
    );

    const totalCurrent = panelLoads.reduce((sum, load) => {
      const totalPowerW = load.powerKw * load.quantity * 1000;
      const cosValue = load.cosPhi && load.cosPhi > 0 ? load.cosPhi : 1;

      if (load.phaseType === "1P") {
        return sum + totalPowerW / (230 * cosValue);
      }

      return sum + totalPowerW / (1.732 * 400 * cosValue);
    }, 0);

    let weightedCosNumerator = 0;
let weightedCosDenominator = 0;

panelLoads.forEach((load) => {
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

panelLoads.forEach((load) => {
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
  loadCount: panelLoads.length,
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

  const renderPanelCard = (panel: Panel) => {
  const panelSummary = panelSummaries.find(
    (summary) => summary.panelId === panel.id
  );

  const panelLoads = loads.filter(
  (load) => load.connectedPanelId === panel.id
);

const isPanelExpanded = expandedPanels[panel.id] ?? true;

  return (
    <div
      key={panel.id}
      style={{
        padding: "10px 12px",
        marginBottom: 8,
        border: "1px solid #334155",
        background: "#1e293b",
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
</div>

      <div style={{ marginTop: 4, opacity: 0.85 }}>
        Phase: {panel.phaseType}
      </div>

      <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6 }}>
      <div>Total Power: {formatNumber(panelSummary?.totalKw ?? 0)} kW</div>
      <div>Total Current: {formatNumber(panelSummary?.totalCurrent ?? 0)} A</div>
      <div>Load Count: {panelSummary?.loadCount ?? 0}</div>
      </div>

      {isPanelExpanded && (
        <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6 }}>
        
        
        
        <div>
        R: {formatNumber(panelSummary?.panelR ?? 0)} kW | S:{" "}
        {formatNumber(panelSummary?.panelSPhase ?? 0)} kW | T:{" "}
        {formatNumber(panelSummary?.panelT ?? 0)} kW
        {panelLoads.length > 0 && (
        <div style={{ marginTop: 10, paddingLeft: 18 }}>
        {panelLoads.map(renderLoadCard)}
        </div>
        )}
        </div>
      </div>
      )}



      <div
  style={{
    display: "flex",
    gap: 8,
    marginTop: 8,
    justifyContent: "flex-end",
  }}
>

<button
  onClick={(e) => {
    e.stopPropagation();
    setSelectedPanelDetail(panel);
  }}
  style={{
    ...buttonStyle,
    minWidth: 90,
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
    minWidth: 90,
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

    setSelectedParent(panel.structureId);
  }}
  style={{
    ...buttonStyle,
    minWidth: 90,
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
      minWidth: 90,
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
        <div style={{ fontSize: 14 }}>
          <strong>{load.projectCode}</strong> - {load.description}
        </div>

          <div>
          Panel:{" "}
          {connectedPanel
          ? `${connectedPanel.name} (${connectedPanel.panelType})`
          : "-"}
        </div>

        <div
          style={{
          display: "flex",
          gap: 8,
          marginTop: 8,
          justifyContent: "flex-end",
        }}
        >

        <button
          onClick={(e) => {
          e.stopPropagation();
          setSelectedLoadDetail(load);
          }}
          style={{
          ...buttonStyle,
          minWidth: 90,
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
          minWidth: 90,
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
          minWidth: 90,
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
      minWidth: 90,
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
                  {item.name} ({item.type})
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
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    background: "#0f172a",
    padding: "12px 20px 14px 20px",
    borderBottom: "1px solid #1e293b",
  }}
>
  <div
    style={{
      display: "grid",
      gridTemplateColumns: "1.5fr 1.2fr 1fr 1fr 1fr 1.2fr",
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
      <div style={{ fontSize: 50, fontWeight: 700 }}>⚡ Currist</div>
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

    <input
      style={fieldStyle}
      placeholder="Panel Description"
      value={panelDescription}
      onChange={(e) => setPanelDescription(e.target.value)}
      disabled={!canAddPanel}
    />

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

      
    </div>

    

    {renderTree(null)}
  </div>
</div>

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
  <h3>🚀 CURRENT VERSION</h3>

  <div>✅ Project / Building / Block / Floor / Room Structure</div>

  <div>✅ Load Management</div>
  <div>- Create Load</div>
  <div>- Edit Load</div>
  <div>- Copy Load</div>
  <div>- Delete Load</div>
  <div>- Load Detail Popup</div>

  <br />

  <div>✅ Panel Management</div>
  <div>- Create Panel</div>
  <div>- Edit Panel</div>
  <div>- Delete Panel</div>
  <div>- Panel Detail Popup</div>

  <br />

  <div>✅ Panel Summary</div>
  <div>- Installed Power</div>
  <div>- Current</div>
  <div>- Load Count</div>
  <div>- P-Q-S Calculation</div>
  <div>- Average Cos φ</div>
  <div>- R-S-T Distribution</div>

  <br />

  <div>✅ Country Selection</div>
  <div>✅ Building Type Selection</div>

  <br />

  <div>✅ Created At / Last Edited</div>

  <br />

  <div>✅ Connected Panel Validation</div>
  <div>- 3 Phase loads cannot be connected to 1 Phase panels</div>

  <hr style={{ margin: "16px 0", borderColor: "#334155" }} />

  <h3>🔄 IN PROGRESS</h3>

  <div>□ Panel Copy With Loads</div>

  <div>□ Panel Export to Excel</div>

  <div>□ Full Location Chain</div>
  <div>- Project</div>
  <div>- Building</div>
  <div>- Block</div>
  <div>- Floor</div>
  <div>- Room</div>

  <br />

  <div>□ Country Based Time Zone</div>

  <hr style={{ margin: "16px 0", borderColor: "#334155" }} />

  <h3>📋 PLANNED FEATURES</h3>

  <div>□ Diversity Factor</div>

  <br />

  <div>□ Mutually Exclusive Loads</div>

  <div style={{ marginLeft: 12 }}>
    Example:
  </div>

  <div style={{ marginLeft: 24 }}>CWP-03</div>
  <div style={{ marginLeft: 24 }}>HWP-03</div>

  <div style={{ marginLeft: 12 }}>
    These loads never operate simultaneously.
  </div>

  <div style={{ marginLeft: 12 }}>
    The calculation will use the larger load instead of summing both loads.
  </div>

  <br />

  <div>□ Demand Factor</div>

  <div>□ Coincidence Factor</div>

  <hr style={{ margin: "16px 0", borderColor: "#334155" }} />

  <h3>⚡ ELECTRICAL CALCULATIONS</h3>

  <div>□ Compensation Calculation</div>

  <div>□ Transformer Selection</div>

  <div>□ Generator Selection</div>

  <div>□ UPS Selection</div>

  <hr style={{ margin: "16px 0", borderColor: "#334155" }} />

  <h3>🔌 CABLE ENGINEERING</h3>

  <div>□ Cable Sizing</div>

  <div>□ Voltage Drop Calculation</div>

  <div>□ Cable Length Summary</div>

  <div>□ Project Cable Report</div>

  <hr style={{ margin: "16px 0", borderColor: "#334155" }} />

  <h3>📤 EXPORT / IMPORT & COMMUNICATION</h3>

<div>□ Excel Export</div>
<div>- Panel Export</div>
<div>- Load List Export</div>
<div>- Project Summary Export</div>
<div>- Cable Summary Export</div>

<br />

<div>□ Excel Import</div>
<div>- Project Structure Import</div>
<div>- Building / Block / Floor / Room Import</div>
<div>- Panel Import</div>
<div>- Load Import</div>
<div>- Auto Relink Panels & Loads</div>
<div>- Import Validation</div>
<div>- Import Error Report</div>

<br />

<div>□ Save / Open Project File</div>
<div>- Save Currist Project</div>
<div>- Open Existing Currist Project</div>
<div>- Future .currist File Format</div>

<br />

<div>□ PDF Export</div>

<div>□ Email Export</div>
<div>- Send exported files by email</div>
<div>- Send panel package to supplier</div>

<hr style={{ margin: "16px 0", borderColor: "#334155" }} />

  <h3>🏭 PANEL MANUFACTURER WORKFLOW</h3>

<div>□ Freeze Panel</div>

<div>□ Send Frozen Panel To Supplier</div>

<div>□ Revision Tracking</div>

<div>□ Revision Summary Mail</div>

<br />

<div>□ Panel Dimensions Calculation</div>
<div>- Width</div>
<div>- Height</div>
<div>- Depth</div>
<div>- Estimated enclosure size based on loads and components</div>

<br />

<div>□ Panel Environment Type</div>
<div>- Indoor Panel</div>
<div>- Outdoor Panel</div>
<div>- IP Rating Suggestion</div>
<div>- Ventilation / Cooling Requirement</div>

<br />

<div>□ Panel Component List</div>
<div>- Main Switch / MCCB</div>
<div>- Feeder Breakers</div>
<div>- Contactors</div>
<div>- Motor Protection Switches</div>
<div>- Soft Starters</div>
<div>- VFDs</div>
<div>- Control Transformer</div>
<div>- Power Supply</div>
<div>- Terminals</div>
<div>- Cable Glands</div>

<br />

<div>□ Analyzer / Energy Meter Selection</div>
<div>- Main Incomer Analyzer</div>
<div>- Feeder Analyzer</div>
<div>- Communication Protocol Selection</div>
<div>- Modbus RTU</div>
<div>- Modbus TCP/IP</div>
<div>- Bacnet MSTP</div>
<div>- Bacnet IP</div>

<br />

<div>□ Panel Specification Generation</div>
<div>- Technical Specification</div>
<div>- Component Schedule</div>
<div>- Supplier Ready Documentation</div>

<br />

<div>Examples:</div>

<div>- Pump-03 deleted</div>
<div>- Fan-02 power changed (3.0 kW → 5.5 kW)</div>
<div>- Chiller-01 renamed</div>
<div>- New load added</div>

<hr style={{ margin: "16px 0", borderColor: "#334155" }} />

  <h3>📱 PLATFORM</h3>

  <div>□ Mobile Responsive</div>

  <div>□ Tablet Responsive</div>

  <hr style={{ margin: "16px 0", borderColor: "#334155" }} />

  <h3>📦 Version</h3>

  <div>Version: 0.4.0</div>

  <div style={{ marginTop: 10 }}>
  <strong>Developed By:</strong> Ergin Yurttaş
</div>

<div>
  <strong>Contact:</strong> erginyurttas@gmail.com
</div>

  <div style={{ marginTop: 12 }}>
  <strong>Last Update:</strong> June 6, 2026 0:27:19 AM
</div>

<ul>
  
</ul>
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
      <h3 style={{ marginTop: 0 }}>Load Detail</h3>

      <div><strong>Project Code:</strong> {selectedLoadDetail.projectCode}</div>
      <div><strong>Description:</strong> {selectedLoadDetail.description}</div>
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
      <div><strong>Cos φ:</strong> {selectedLoadDetail.cosPhi ?? "-"}</div>
      <div><strong>Distance:</strong> {selectedLoadDetail.cableLengthM ?? "-"} m</div>
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