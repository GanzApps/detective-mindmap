import { type Case } from '@/lib/data/dataTypes';
import { type EntityType } from '@/lib/graph/graphTypes';
import { type ViewMode } from '@/store/caseStore';

export type ExportFormat = 'png' | 'pdf' | 'both';

export interface GraphExportSource {
  getActiveCanvas: () => HTMLCanvasElement | null;
  redrawActiveView: () => void;
  captureActiveViewDataUrl: () => string | null;
}

export interface GraphSnapshot {
  dataUrl: string;
  width: number;
  height: number;
  source: 'canvas' | 'dom';
}

export interface ReportExportContext {
  caseData: Case;
  viewMode: ViewMode;
  highlightedEvidenceId: string | null;
  highlightedEntityIds: string[];
  selectedNodeId: string | null;
  activeFilters: EntityType[];
  exportedAt?: string;
  activeEvidenceLabel?: string;
  selectedNodeLabel?: string;
}

export interface ReportSummaryRow {
  label: string;
  value: string;
}

export interface ReportSection {
  title: string;
  lines: string[];
}

export interface ReportDocumentModel {
  title: string;
  subtitle: string;
  summaryRows: ReportSummaryRow[];
  sections: ReportSection[];
}

export interface ReportExporterDependencies {
  downloadDataUrl?: (filename: string, dataUrl: string) => void;
  captureElementAsDataUrl?: (element: HTMLElement) => Promise<GraphSnapshot>;
  createPdf?: () => Promise<PdfDocument>;
}

export interface PdfDocument {
  internal: {
    pageSize: {
      getWidth: () => number;
      getHeight: () => number;
    };
  };
  setFont: (fontName: string, fontStyle?: string) => void;
  setFontSize: (fontSize: number) => void;
  text: (text: string | string[], x: number, y: number, options?: { maxWidth?: number }) => void;
  addImage: (
    imageData: string,
    format: string,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => void;
  addPage: () => void;
  save: (filename: string) => void;
}
