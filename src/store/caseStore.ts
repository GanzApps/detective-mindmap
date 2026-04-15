import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { type Case, type EvidenceFile } from '@/lib/data/dataTypes';
import {
  type EntityStatus,
  type EntityType,
  type GraphEdge,
  type GraphNode,
} from '@/lib/graph/graphTypes';
import { type AIResultPayload, type CommandHistoryEntry } from '@/lib/ai/knownIntents';

export type ViewMode = '2d' | '3d';

export const ENTITY_FILTER_OPTIONS: EntityType[] = [
  'person',
  'location',
  'event',
  'evidence',
  'organization',
  'vehicle',
  'digital',
];

export interface LayerPreferences {
  showEdgeLabels: boolean;
  showNodeLabels: boolean;
  focusSelectedNeighborhood: boolean;
}

export const DEFAULT_LAYER_PREFERENCES: LayerPreferences = {
  showEdgeLabels: true,
  showNodeLabels: true,
  focusSelectedNeighborhood: true,
};

export interface CreateCaseInput {
  name: string;
  description: string;
  status: Case['status'];
}

export interface CreateEntityInput {
  label: string;
  type: EntityType;
  status?: EntityStatus;
  parent?: string | null;
  properties?: Record<string, string>;
}

export interface CreateConnectionInput {
  source: string;
  target: string;
  label: string;
  strength?: number;
}

export interface TabWorkspaceState {
  selectedNodeId: string | null;
  activeFilters: EntityType[];
  layerPreferences: LayerPreferences;
  highlightedEvidenceId: string | null;
  highlightedEntityIds: string[];
  viewMode: ViewMode;
  aiResult: AIResultPayload | null;
  commandHistory: CommandHistoryEntry[];
  commandStatus: 'idle' | 'running' | 'complete' | 'failed';
  commandStatusMessage: string;
}

export function makeDefaultTabWorkspaceState(): TabWorkspaceState {
  return {
    selectedNodeId: null,
    activeFilters: [...ENTITY_FILTER_OPTIONS],
    layerPreferences: DEFAULT_LAYER_PREFERENCES,
    highlightedEvidenceId: null,
    highlightedEntityIds: [],
    viewMode: '2d',
    aiResult: null,
    commandHistory: [],
    commandStatus: 'idle',
    commandStatusMessage: 'Known intents are ready. Type naturally or start with /.',
  };
}

export interface OpenTab {
  caseId: string;
  title: string;
}

interface CaseStoreState {
  cases: Case[];
  activeCaseId: string | null;
  // Tab management
  openTabs: OpenTab[];
  activeTabCaseId: string | null;
  perTabState: Record<string, TabWorkspaceState>;
  // Global (shared across tabs for backward compat)
  selectedNodeId: string | null;
  activeFilters: EntityType[];
  layerPreferences: LayerPreferences;
  highlightedEvidenceId: string | null;
  highlightedEntityIds: string[];
  viewMode: ViewMode;
  hydrateCases: (cases: Case[]) => void;
  upsertCase: (caseData: Case) => void;
  setActiveCase: (caseId: string | null) => void;
  // Tab management actions
  openTab: (caseId: string, title: string) => void;
  closeTab: (caseId: string) => void;
  switchTab: (caseId: string) => void;
  setActiveTabState: <K extends keyof TabWorkspaceState>(
    key: K,
    value: TabWorkspaceState[K],
  ) => void;
  activeTabWorkspaceState: () => TabWorkspaceState;
  // Existing actions (delegates to per-tab state when active)
  setSelectedNode: (nodeId: string | null) => void;
  setActiveFilters: (filters: EntityType[]) => void;
  toggleEntityFilter: (entityType: EntityType) => void;
  setLayerPreference: <K extends keyof LayerPreferences>(
    key: K,
    value: LayerPreferences[K],
  ) => void;
  setViewMode: (viewMode: ViewMode) => void;
  setHighlightedEvidence: (evidenceId: string | null, entityIds: string[]) => void;
  setGraphFocus: (selectedNodeId: string | null, highlightedEntityIds: string[]) => void;
  createCase: (input: CreateCaseInput) => Case;
  addEntity: (caseId: string, input: CreateEntityInput) => GraphNode | null;
  addConnection: (caseId: string, input: CreateConnectionInput) => GraphEdge | null;
  deleteEntity: (caseId: string, entityId: string) => void;
  deleteConnection: (caseId: string, connectionId: string) => void;
}

function makeId(prefix: string) {
  // Use crypto.randomUUID when available for collision resistance
  const unique = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  return `${prefix}-${unique}`;
}

function mergeCases(existing: Case[], incoming: Case[]) {
  const existingById = new Map(existing.map((caseData) => [caseData.id, caseData]));
  const incomingIds = new Set(incoming.map((caseData) => caseData.id));

  return [
    ...incoming.map((caseData) => existingById.get(caseData.id) ?? caseData),
    ...existing.filter((caseData) => !incomingIds.has(caseData.id)),
  ];
}

function updateCaseCollection(
  cases: Case[],
  caseId: string,
  updater: (caseData: Case) => Case,
) {
  return cases.map((caseData) => (
    caseData.id === caseId ? updater(caseData) : caseData
  ));
}

function normalizeFilters(filters: EntityType[]) {
  return ENTITY_FILTER_OPTIONS.filter((type) => filters.includes(type));
}

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useCaseStore = create<CaseStoreState>()(persist((set, get) => ({
  cases: [],
  activeCaseId: null,
  // Tab management init
  openTabs: [],
  activeTabCaseId: null,
  perTabState: {},
  // Global state (backward compat — reads from active tab when available)
  selectedNodeId: null,
  activeFilters: [...ENTITY_FILTER_OPTIONS],
  layerPreferences: DEFAULT_LAYER_PREFERENCES,
  highlightedEvidenceId: null,
  highlightedEntityIds: [],
  viewMode: '2d',
  hydrateCases: (cases) => set((state) => ({
    cases: mergeCases(state.cases, cases),
  })),
  upsertCase: (caseData) => set((state) => {
    const exists = state.cases.some((item) => item.id === caseData.id);

    return {
      cases: exists
        ? state.cases.map((item) => (item.id === caseData.id ? caseData : item))
        : [caseData, ...state.cases],
    };
  }),
  setActiveCase: (activeCaseId) => set({ activeCaseId }),
  // Tab management
  openTab: (caseId, title) => set((state) => {
    const exists = state.openTabs.some((tab) => tab.caseId === caseId);
    if (exists) {
      return { activeTabCaseId: caseId };
    }
    return {
      openTabs: [...state.openTabs, { caseId, title }],
      activeTabCaseId: caseId,
      perTabState: {
        ...state.perTabState,
        [caseId]: makeDefaultTabWorkspaceState(),
      },
    };
  }),
  closeTab: (caseId) => set((state) => {
    const newTabs = state.openTabs.filter((tab) => tab.caseId !== caseId);
    const newPerTab = { ...state.perTabState };
    delete newPerTab[caseId];
    const newActive = state.activeTabCaseId === caseId
      ? (newTabs.length > 0 ? newTabs[newTabs.length - 1].caseId : null)
      : state.activeTabCaseId;
    return {
      openTabs: newTabs,
      activeTabCaseId: newActive,
      perTabState: newPerTab,
    };
  }),
  switchTab: (caseId) => set({ activeTabCaseId: caseId }),
  setActiveTabState: (key, value) => set((state) => {
    const activeId = state.activeTabCaseId;
    if (!activeId) return {};
    const current = state.perTabState[activeId] ?? makeDefaultTabWorkspaceState();
    return {
      perTabState: {
        ...state.perTabState,
        [activeId]: { ...current, [key]: value },
      },
    };
  }),
  activeTabWorkspaceState: () => {
    const state = get();
    if (!state.activeTabCaseId) return makeDefaultTabWorkspaceState();
    return state.perTabState[state.activeTabCaseId] ?? makeDefaultTabWorkspaceState();
  },
  setSelectedNode: (selectedNodeId) => set((state) => {
    if (state.activeTabCaseId) {
      const current = state.perTabState[state.activeTabCaseId] ?? makeDefaultTabWorkspaceState();
      return {
        selectedNodeId,
        perTabState: {
          ...state.perTabState,
          [state.activeTabCaseId]: { ...current, selectedNodeId },
        },
      };
    }
    return { selectedNodeId };
  }),
  setActiveFilters: (activeFilters) => set((state) => {
    const normalized = normalizeFilters(activeFilters);
    if (state.activeTabCaseId) {
      const current = state.perTabState[state.activeTabCaseId] ?? makeDefaultTabWorkspaceState();
      return {
        activeFilters: normalized,
        perTabState: {
          ...state.perTabState,
          [state.activeTabCaseId]: { ...current, activeFilters: normalized },
        },
      };
    }
    return { activeFilters: normalized };
  }),
  toggleEntityFilter: (entityType) => set((state) => {
    const isActive = state.activeFilters.includes(entityType);
    const newFilters = isActive
      ? state.activeFilters.filter((type) => type !== entityType)
      : [...state.activeFilters, entityType];
    const normalized = normalizeFilters(newFilters);
    if (state.activeTabCaseId) {
      const current = state.perTabState[state.activeTabCaseId] ?? makeDefaultTabWorkspaceState();
      return {
        activeFilters: normalized,
        perTabState: {
          ...state.perTabState,
          [state.activeTabCaseId]: { ...current, activeFilters: normalized },
        },
      };
    }
    return { activeFilters: normalized };
  }),
  setLayerPreference: (key, value) => set((state) => {
    const newPrefs = { ...state.layerPreferences, [key]: value };
    if (state.activeTabCaseId) {
      const current = state.perTabState[state.activeTabCaseId] ?? makeDefaultTabWorkspaceState();
      return {
        layerPreferences: newPrefs,
        perTabState: {
          ...state.perTabState,
          [state.activeTabCaseId]: { ...current, layerPreferences: newPrefs },
        },
      };
    }
    return { layerPreferences: newPrefs };
  }),
  setViewMode: (viewMode) => set((state) => {
    if (state.activeTabCaseId) {
      const current = state.perTabState[state.activeTabCaseId] ?? makeDefaultTabWorkspaceState();
      return {
        viewMode,
        perTabState: {
          ...state.perTabState,
          [state.activeTabCaseId]: { ...current, viewMode },
        },
      };
    }
    return { viewMode };
  }),
  setHighlightedEvidence: (highlightedEvidenceId, highlightedEntityIds) => set((state) => {
    if (state.activeTabCaseId) {
      const current = state.perTabState[state.activeTabCaseId] ?? makeDefaultTabWorkspaceState();
      return {
        highlightedEvidenceId,
        highlightedEntityIds,
        perTabState: {
          ...state.perTabState,
          [state.activeTabCaseId]: { ...current, highlightedEvidenceId, highlightedEntityIds },
        },
      };
    }
    return { highlightedEvidenceId, highlightedEntityIds };
  }),
  setGraphFocus: (selectedNodeId, highlightedEntityIds) => set((state) => {
    if (state.activeTabCaseId) {
      const current = state.perTabState[state.activeTabCaseId] ?? makeDefaultTabWorkspaceState();
      return {
        selectedNodeId,
        highlightedEvidenceId: null,
        highlightedEntityIds,
        perTabState: {
          ...state.perTabState,
          [state.activeTabCaseId]: {
            ...current,
            selectedNodeId,
            highlightedEvidenceId: null,
            highlightedEntityIds,
          },
        },
      };
    }
    return { selectedNodeId, highlightedEvidenceId: null, highlightedEntityIds };
  }),
  createCase: (input) => {
    const now = new Date().toISOString();
    const caseData: Case = {
      id: makeId('case'),
      name: input.name,
      description: input.description,
      status: input.status,
      createdAt: now,
      updatedAt: now,
      graph: {
        nodes: [],
        edges: [],
      },
      evidence: [],
    };

    set((state) => ({
      cases: [caseData, ...state.cases],
      activeCaseId: caseData.id,
    }));

    return caseData;
  },
  addEntity: (caseId, input) => {
    let createdNode: GraphNode | null = null;

    set((state) => ({
      cases: updateCaseCollection(state.cases, caseId, (caseData) => {
        const parentNode = input.parent
          ? caseData.graph.nodes.find((node) => node.id === input.parent)
          : null;

        createdNode = {
          id: makeId('node'),
          label: input.label,
          type: input.type,
          status: input.status ?? 'unknown',
          tier: parentNode ? parentNode.tier + 1 : 0,
          parent: input.parent ?? null,
          properties: input.properties ?? {},
        };

        return {
          ...caseData,
          updatedAt: new Date().toISOString(),
          graph: {
            ...caseData.graph,
            nodes: [...caseData.graph.nodes, createdNode],
          },
        };
      }),
    }));

    return createdNode;
  },
  addConnection: (caseId, input) => {
    let createdEdge: GraphEdge | null = null;

    set((state) => ({
      cases: updateCaseCollection(state.cases, caseId, (caseData) => {
        const sourceExists = caseData.graph.nodes.some((node) => node.id === input.source);
        const targetExists = caseData.graph.nodes.some((node) => node.id === input.target);

        if (!sourceExists || !targetExists) {
          createdEdge = null;
          return caseData;
        }

        createdEdge = {
          id: makeId('edge'),
          source: input.source,
          target: input.target,
          label: input.label,
          strength: input.strength ?? 1,
        };

        return {
          ...caseData,
          updatedAt: new Date().toISOString(),
          graph: {
            ...caseData.graph,
            edges: [...caseData.graph.edges, createdEdge],
          },
        };
      }),
    }));

    return createdEdge;
  },
  deleteEntity: (caseId, entityId) => set((state) => ({
    cases: updateCaseCollection(state.cases, caseId, (caseData) => ({
      ...caseData,
      updatedAt: new Date().toISOString(),
      graph: {
        nodes: caseData.graph.nodes.filter((node) => node.id !== entityId),
        edges: caseData.graph.edges.filter((edge) => (
          edge.source !== entityId && edge.target !== entityId
        )),
      },
    })),
    selectedNodeId: state.selectedNodeId === entityId ? null : state.selectedNodeId,
    highlightedEntityIds: state.highlightedEntityIds.filter((id) => id !== entityId),
  })),
  deleteConnection: (caseId, connectionId) => set((state) => ({
    cases: updateCaseCollection(state.cases, caseId, (caseData) => ({
      ...caseData,
      updatedAt: new Date().toISOString(),
      graph: {
        ...caseData.graph,
        edges: caseData.graph.edges.filter((edge) => edge.id !== connectionId),
      },
    })),
  })),
}), {
  name: 'case-workspace-store',
  storage: createJSONStorage(() => (
    typeof window === 'undefined' ? noopStorage : window.localStorage
  )),
  partialize: (state) => {
    // Prune perTabState entries for tabs that are no longer open
    const prunedPerTabState: Record<string, TabWorkspaceState> = {};
    for (const tab of state.openTabs) {
      if (state.perTabState[tab.caseId]) {
        prunedPerTabState[tab.caseId] = state.perTabState[tab.caseId];
      }
    }
    return {
      cases: state.cases,
      activeCaseId: state.activeCaseId,
      activeFilters: state.activeFilters,
      layerPreferences: state.layerPreferences,
      highlightedEvidenceId: state.highlightedEvidenceId,
      highlightedEntityIds: state.highlightedEntityIds,
      viewMode: state.viewMode,
      // Tab persistence (pruned)
      openTabs: state.openTabs,
      activeTabCaseId: state.activeTabCaseId,
      perTabState: prunedPerTabState,
    };
  },
}));

export const selectCases = (state: CaseStoreState) => state.cases;
export const selectOpenTabs = (state: CaseStoreState) => state.openTabs;
export const selectActiveTabCaseId = (state: CaseStoreState) => state.activeTabCaseId;
export const selectActiveTabWorkspaceState = (state: CaseStoreState) => {
  if (!state.activeTabCaseId) return makeDefaultTabWorkspaceState();
  return state.perTabState[state.activeTabCaseId] ?? makeDefaultTabWorkspaceState();
};
export const selectActiveFilters = (state: CaseStoreState) => state.activeFilters;
export const selectLayerPreferences = (state: CaseStoreState) => state.layerPreferences;
export const selectViewMode = (state: CaseStoreState) => state.viewMode;
export const selectHighlightedEntityIds = (state: CaseStoreState) => state.highlightedEntityIds;
export const selectHighlightedEvidenceId = (state: CaseStoreState) => state.highlightedEvidenceId;
export const selectSelectedNodeId = (state: CaseStoreState) => state.selectedNodeId;
export const selectCaseById = (caseId: string) => (state: CaseStoreState) =>
  state.cases.find((caseData) => caseData.id === caseId) ?? null;

export function getEvidenceLabel(file: EvidenceFile) {
  return `${file.name} · ${file.size}`;
}
