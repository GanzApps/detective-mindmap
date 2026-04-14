import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { type Case, type EvidenceFile } from '@/lib/data/dataTypes';
import {
  type EntityStatus,
  type EntityType,
  type GraphEdge,
  type GraphNode,
} from '@/lib/graph/graphTypes';

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

interface CaseStoreState {
  cases: Case[];
  activeCaseId: string | null;
  selectedNodeId: string | null;
  activeFilters: EntityType[];
  layerPreferences: LayerPreferences;
  highlightedEvidenceId: string | null;
  highlightedEntityIds: string[];
  viewMode: ViewMode;
  hydrateCases: (cases: Case[]) => void;
  upsertCase: (caseData: Case) => void;
  setActiveCase: (caseId: string | null) => void;
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
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
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

export const useCaseStore = create<CaseStoreState>()(persist((set) => ({
  cases: [],
  activeCaseId: null,
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
  setSelectedNode: (selectedNodeId) => set({ selectedNodeId }),
  setActiveFilters: (activeFilters) => set({ activeFilters: normalizeFilters(activeFilters) }),
  toggleEntityFilter: (entityType) => set((state) => {
    const isActive = state.activeFilters.includes(entityType);

    return {
      activeFilters: isActive
        ? state.activeFilters.filter((type) => type !== entityType)
        : [...state.activeFilters, entityType],
    };
  }),
  setLayerPreference: (key, value) => set((state) => ({
    layerPreferences: {
      ...state.layerPreferences,
      [key]: value,
    },
  })),
  setViewMode: (viewMode) => set({ viewMode }),
  setHighlightedEvidence: (highlightedEvidenceId, highlightedEntityIds) => set({
    highlightedEvidenceId,
    highlightedEntityIds,
  }),
  setGraphFocus: (selectedNodeId, highlightedEntityIds) => set({
    selectedNodeId,
    highlightedEvidenceId: null,
    highlightedEntityIds,
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
  partialize: (state) => ({
    cases: state.cases,
    activeCaseId: state.activeCaseId,
    selectedNodeId: state.selectedNodeId,
    activeFilters: state.activeFilters,
    layerPreferences: state.layerPreferences,
    highlightedEvidenceId: state.highlightedEvidenceId,
    highlightedEntityIds: state.highlightedEntityIds,
    viewMode: state.viewMode,
  }),
}));

export const selectCases = (state: CaseStoreState) => state.cases;
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
