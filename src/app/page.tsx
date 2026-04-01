"use client";

import { useEffect, useMemo, useState } from "react";

type StructureType = "building" | "floor" | "room";
type SortMode = "alphabetical" | "created";
type LoadType = "Pump" | "Fan" | "AHU" | "Manual";
type PhaseType = "1P" | "3P";
type PhaseLine = "R" | "S" | "T";
type LoadCharacter = "Ohmic" | "Inductive" | "Capacitive";
type ManualLoadType =
  | "Socket Outlet"
  | "Lighting Circuit"
  | "UPS Outlet"
  | "Kitchen Outlet"
  | "Spare Load"
  | "Other";

type Structure = {
  id: number;
  name: string;
  type: StructureType;
  parentId: number | null;
  createdAt: number;
};

type CatalogItem = {
  loadType: Exclude<LoadType, "Manual">;
  brand: string;
  series: string;
  model: string;
  powerKw: number;
  phaseType: PhaseType;
};

type Load = {
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
  createdAt: number;
  loadCharacter?: LoadCharacter;
  cosPhi?: number;
};

const catalog: CatalogItem[] = [
  {
    loadType: "Pump",
    brand: "Grundfos",
    series: "Magna",
    model: "Magna3 25-40",
    powerKw: 0.18,
    phaseType: "1P",
  },
  {
    loadType: "Pump",
    brand: "Grundfos",
    series: "Magna",
    model: "Magna3 32-60",
    powerKw: 0.34,
    phaseType: "1P",
  },
  {
    loadType: "Pump",
    brand: "Grundfos",
    series: "Magna",
    model: "Magna3 40-80",
    powerKw: 0.78,
    phaseType: "1P",
  },
  {
    loadType: "Pump",
    brand: "Wilo",
    series: "Stratos",
    model: "Stratos 25/1-6",
    powerKw: 0.22,
    phaseType: "1P",
  },
  {
    loadType: "Fan",
    brand: "Systemair",
    series: "K",
    model: "K 160 EC",
    powerKw: 0.12,
    phaseType: "1P",
  },
  {
    loadType: "Fan",
    brand: "Systemair",
    series: "K",
    model: "K 200 EC",
    powerKw: 0.17,
    phaseType: "1P",
  },
  {
    loadType: "AHU",
    brand: "Systemair",
    series: "Geniox",
    model: "Geniox Core 06",
    powerKw: 1.5,
    phaseType: "1P",
  },
];

const manualLoadTypes: ManualLoadType[] = [
  "Socket Outlet",
  "Lighting Circuit",
  "UPS Outlet",
  "Kitchen Outlet",
  "Spare Load",
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

  const [name, setName] = useState("");
  const [selectedParent, setSelectedParent] = useState<number | null>(null);
  const [type, setType] = useState<StructureType>("building");
  const [sortMode, setSortMode] = useState<SortMode>("alphabetical");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [collapsedIds, setCollapsedIds] = useState<number[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);
  

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

  const selectedNode = useMemo(
    () => structures.find((s) => s.id === selectedParent),
    [structures, selectedParent]
  );

  const isCatalogLoad =
    loadType === "Pump" || loadType === "Fan" || loadType === "AHU";
  const isManualLoad = loadType === "Manual";
  const canAddLoad = selectedNode?.type === "room";

  const getAllowedChildTypes = (): StructureType[] => {
    if (!selectedNode) return ["building"];
    if (selectedNode.type === "building") return ["floor"];
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

  if (item.type === "building") setType("floor");
  else if (item.type === "floor") setType("room");
};

  const handleSelectRoot = () => {
    setSelectedParent(null);
    setType("building");
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
    setType("building");

    if (editingId !== null && idsToDelete.includes(editingId)) {
      setEditingId(null);
      setName("");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");

    if (!selectedNode) {
      setType("building");
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
    if (type === "building") return "Add Building";
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

  useEffect(() => {
    setBrand("");
    setSeries("");
    setModel("");
    setLoadPowerKw("");
    setManualLoadType("");

    if (!isManualLoad) {
      setPhaseType("");
      setPhaseLine("");
    }
  }, [loadType, isManualLoad]);

  useEffect(() => {
    setSeries("");
    setModel("");
    setLoadPowerKw("");
  }, [brand]);

  useEffect(() => {
    setModel("");
    setLoadPowerKw("");
  }, [series]);

  useEffect(() => {
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
    setPhaseType(selectedCatalogItem.phaseType);

    if (selectedCatalogItem.phaseType === "3P") {
      setPhaseLine("");
    }
  }, [loadType, brand, series, model, isManualLoad]);

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
    (load) => load.projectCode.trim().toLowerCase() === normalizedProjectCode
    );

    if (projectCodeExists) {
    window.alert("Project Code must be unique.");
    return;
    }


    const powerKw = Number(loadPowerKw);
    const quantity = Number(loadQuantity);
    const parsedCosPhi = cosPhi.trim() === "" ? undefined : Number(cosPhi);

    if (Number.isNaN(powerKw) || powerKw <= 0) return;
    if (Number.isNaN(quantity) || quantity <= 0) return;

    if (parsedCosPhi !== undefined) {
      if (Number.isNaN(parsedCosPhi) || parsedCosPhi <= 0 || parsedCosPhi > 1) {
        return;
      }
    }

    const now = Date.now();

    const normalizedPhaseLine: PhaseLine | undefined =
      phaseType === "1P" && phaseLine !== "" ? phaseLine : undefined;

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
      createdAt: now,
      loadCharacter: loadCharacter || undefined,
      cosPhi: parsedCosPhi,
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

  const renderLoadCard = (load: Load) => {
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
          {load.phaseType === "1P" && load.phaseLine ? ` / Line: ${load.phaseLine}` : ""}
        </div>
        <div>
          Character: {load.loadCharacter || "-"}
          {load.cosPhi !== undefined ? ` / Cos φ: ${load.cosPhi}` : ""}
        </div>
      </div>
    );
  };

  const renderLoads = (roomId: number) => {
    const roomLoads = getLoadsByRoom(roomId);

    if (roomLoads.length === 0) return null;

    return <div style={{ marginTop: 8, marginLeft: 36 }}>{roomLoads.map(renderLoadCard)}</div>;
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

              {item.type === "room" && renderLoads(item.id)}

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
    padding: "150px 20px 20px 20px",
    background: "#0f172a",
    minHeight: "100vh",
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
    <div>Q: {formatNumber(summary.totalQ)} kVAr</div>
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
          }}
        >
          

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
                onChange={(e) => setLoadType(e.target.value as LoadType | "")}
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
                onChange={(e) => setBrand(e.target.value)}
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
                onChange={(e) => setSeries(e.target.value)}
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
                disabled={!canAddLoad}
              >
                <option value="">Select Load Character</option>
                <option value="Ohmic">Ohmic</option>
                <option value="Inductive">Inductive</option>
                <option value="Capacitive">Capacitive</option>
              </select>

              <input
                style={fieldStyle}
                type="number"
                step="0.01"
                min="0"
                max="1"
                placeholder="Cos φ"
                value={cosPhi}
                onChange={(e) => setCosPhi(e.target.value)}
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
                Add Load
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

      <button
        onClick={() => setDetailsOpen(true)}
        disabled={!selectedNode}
        style={{
          ...buttonStyle,
          cursor: selectedNode ? "pointer" : "not-allowed",
          opacity: selectedNode ? 1 : 0.5,
        }}
      >
        Show Details
      </button>
    </div>

    

    {renderTree(null)}
  </div>
</div>


{detailsOpen && (
  <>
    <div
      onClick={() => setDetailsOpen(false)}
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
        top: 150,
        right: 20,
        width: 420,
        maxWidth: "calc(100vw - 40px)",
        maxHeight: "calc(100vh - 170px)",
        overflowY: "auto",
        background: "#111827",
        border: "1px solid #334155",
        borderRadius: 16,
        padding: 18,
        zIndex: 9999,
        boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <h3 style={{ margin: 0 }}>Details</h3>

        <button
          onClick={() => setDetailsOpen(false)}
          style={{
            ...buttonStyle,
            cursor: "pointer",
          }}
        >
          Close
        </button>
      </div>

      {selectedNode ? (
        <>
          <div style={{ lineHeight: 1.8 }}>
            <div><strong>Name:</strong> {selectedNode.name}</div>
            <div><strong>Type:</strong> {selectedNode.type}</div>
            <div><strong>ID:</strong> {selectedNode.id}</div>
          </div>

          {selectedNode.type === "room" && (
            <div style={{ marginTop: 20 }}>
              <h4 style={{ marginTop: 0 }}>Room Loads</h4>
              {getLoadsByRoom(selectedNode.id).length > 0 ? (
                getLoadsByRoom(selectedNode.id).map(renderLoadCard)
              ) : (
                <p style={{ opacity: 0.7 }}>
                  No loads added for this room yet.
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <p style={{ opacity: 0.7, margin: 0 }}>
          Select a building, floor, or room.
        </p>
      )}
    </div>
  </>
)}


      </div>
    </div>
  );
}