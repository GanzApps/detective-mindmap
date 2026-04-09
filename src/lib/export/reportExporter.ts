import { getEvidenceLabel } from '@/store/caseStore';
import {
  type GraphExportSource,
  type GraphSnapshot,
  type PdfDocument,
  type ReportDocumentModel,
  type ReportExportContext,
  type ReportExporterDependencies,
  type ReportSection,
  type ReportSummaryRow,
} from '@/lib/export/exportTypes';

const TIMESTAMP_SEPARATOR = '-';

function padTimestamp(value: number) {
  return value.toString().padStart(2, '0');
}

export function formatExportTimestamp(timestamp: string) {
  const date = new Date(timestamp);

  return [
    date.getUTCFullYear(),
    padTimestamp(date.getUTCMonth() + 1),
    padTimestamp(date.getUTCDate()),
    TIMESTAMP_SEPARATOR,
    padTimestamp(date.getUTCHours()),
    padTimestamp(date.getUTCMinutes()),
    padTimestamp(date.getUTCSeconds()),
  ].join('');
}

export function slugifyCaseName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    || 'case-report';
}

export function buildExportBaseName(caseName: string, exportedAt: string) {
  return `${slugifyCaseName(caseName)}-${formatExportTimestamp(exportedAt)}`;
}

export function buildPngFilename(caseName: string, exportedAt: string) {
  return `${buildExportBaseName(caseName, exportedAt)}-graph.png`;
}

export function buildPdfFilename(caseName: string, exportedAt: string) {
  return `${buildExportBaseName(caseName, exportedAt)}-report.pdf`;
}

function formatDisplayDate(timestamp: string) {
  return new Date(timestamp).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function resolveActiveEvidenceLabel(context: ReportExportContext) {
  if (context.activeEvidenceLabel) {
    return context.activeEvidenceLabel;
  }

  const evidenceFile = context.caseData.evidence
    .flatMap((category) => category.files)
    .find((file) => file.id === context.highlightedEvidenceId);

  return evidenceFile ? getEvidenceLabel(evidenceFile) : 'None selected';
}

function resolveSelectedNodeLabel(context: ReportExportContext) {
  if (context.selectedNodeLabel) {
    return context.selectedNodeLabel;
  }

  return context.caseData.graph.nodes.find((node) => node.id === context.selectedNodeId)?.label ?? 'No active node';
}

export function buildReportSummaryRows(context: ReportExportContext): ReportSummaryRow[] {
  const exportedAt = context.exportedAt ?? new Date().toISOString();

  return [
    { label: 'Status', value: context.caseData.status },
    { label: 'Renderer', value: context.viewMode === '2d' ? '2D workspace' : '3D workspace' },
    { label: 'Exported', value: formatDisplayDate(exportedAt) },
    { label: 'Entities', value: `${context.caseData.graph.nodes.length}` },
    { label: 'Connections', value: `${context.caseData.graph.edges.length}` },
    { label: 'Highlighted', value: `${context.highlightedEntityIds.length}` },
  ];
}

function buildEntitySection(context: ReportExportContext): ReportSection {
  return {
    title: 'Entity list',
    lines: context.caseData.graph.nodes.map((node) => {
      const propertyCount = Object.keys(node.properties).length;
      return `${node.label} | ${node.type} | ${node.status} | tier ${node.tier} | ${propertyCount} properties`;
    }),
  };
}

function buildConnectionSection(context: ReportExportContext): ReportSection {
  return {
    title: 'Connection summary',
    lines: context.caseData.graph.edges.map((edge) => {
      const source = context.caseData.graph.nodes.find((node) => node.id === edge.source)?.label ?? edge.source;
      const target = context.caseData.graph.nodes.find((node) => node.id === edge.target)?.label ?? edge.target;
      return `${source} -> ${target} | ${edge.label} | strength ${edge.strength.toFixed(1)}`;
    }),
  };
}

export function buildReportDocumentModel(context: ReportExportContext): ReportDocumentModel {
  const activeEvidenceLabel = resolveActiveEvidenceLabel(context);
  const selectedNodeLabel = resolveSelectedNodeLabel(context);

  return {
    title: `${context.caseData.name} export report`,
    subtitle: context.caseData.description,
    summaryRows: buildReportSummaryRows(context),
    sections: [
      {
        title: 'Current workspace context',
        lines: [
          `Highlighted evidence: ${activeEvidenceLabel}`,
          `Selected node: ${selectedNodeLabel}`,
          `Active filters: ${context.activeFilters.length > 0 ? context.activeFilters.join(', ') : 'None'}`,
          `Updated at: ${formatDisplayDate(context.caseData.updatedAt)}`,
        ],
      },
      buildEntitySection(context),
      buildConnectionSection(context),
    ],
  };
}

export function downloadDataUrl(filename: string, dataUrl: string) {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export async function captureElementAsDataUrl(element: HTMLElement): Promise<GraphSnapshot> {
  const html2canvas = (await import('html2canvas')).default;
  const canvas = await html2canvas(element, {
    backgroundColor: null,
    scale: 2,
    useCORS: true,
  });

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width: canvas.width,
    height: canvas.height,
    source: 'dom',
  };
}

export async function createPdfDocument(): Promise<PdfDocument> {
  const { jsPDF } = await import('jspdf');

  return new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: 'a4',
  }) as PdfDocument;
}

export async function captureGraphSnapshot(
  exportSource: GraphExportSource,
  fallbackElement?: HTMLElement | null,
  dependencies: ReportExporterDependencies = {},
): Promise<GraphSnapshot> {
  exportSource.redrawActiveView();

  const activeCanvas = exportSource.getActiveCanvas();
  const activeDataUrl = exportSource.captureActiveViewDataUrl();

  if (activeCanvas && activeDataUrl) {
    return {
      dataUrl: activeDataUrl,
      width: activeCanvas.width,
      height: activeCanvas.height,
      source: 'canvas',
    };
  }

  if (!fallbackElement) {
    throw new Error('Unable to capture graph snapshot from the active renderer.');
  }

  const capture = dependencies.captureElementAsDataUrl ?? captureElementAsDataUrl;
  return capture(fallbackElement);
}

function drawReportHeader(pdf: PdfDocument, model: ReportDocumentModel) {
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(22);
  pdf.text(model.title, 40, 42);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(model.subtitle, 40, 62, { maxWidth: 720 });
}

function drawSummaryRows(pdf: PdfDocument, summaryRows: ReportSummaryRow[], startY: number) {
  let currentY = startY;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Report summary', 40, currentY);
  currentY += 20;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);

  for (const row of summaryRows) {
    pdf.text(`${row.label}: ${row.value}`, 40, currentY);
    currentY += 16;
  }

  return currentY;
}

function drawSections(pdf: PdfDocument, sections: ReportSection[], startY: number, pageHeight: number) {
  let currentY = startY;

  for (const section of sections) {
    if (currentY > pageHeight - 80) {
      pdf.addPage();
      currentY = 48;
    }

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.text(section.title, 40, currentY);
    currentY += 18;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);

    for (const line of section.lines) {
      const wrappedLine = line.length > 118
        ? `${line.slice(0, 115)}...`
        : line;

      pdf.text(wrappedLine, 52, currentY, { maxWidth: 700 });
      currentY += 14;

      if (currentY > pageHeight - 40) {
        pdf.addPage();
        currentY = 48;
      }
    }

    currentY += 10;
  }
}

export async function exportPNG(
  context: ReportExportContext,
  exportSource: GraphExportSource,
  fallbackElement?: HTMLElement | null,
  dependencies: ReportExporterDependencies = {},
) {
  const exportedAt = context.exportedAt ?? new Date().toISOString();
  const snapshot = await captureGraphSnapshot(exportSource, fallbackElement, dependencies);
  const triggerDownload = dependencies.downloadDataUrl ?? downloadDataUrl;
  const filename = buildPngFilename(context.caseData.name, exportedAt);

  triggerDownload(filename, snapshot.dataUrl);

  return {
    filename,
    snapshot,
  };
}

export async function exportPDF(
  context: ReportExportContext,
  exportSource: GraphExportSource,
  fallbackElement?: HTMLElement | null,
  dependencies: ReportExporterDependencies = {},
) {
  const exportedAt = context.exportedAt ?? new Date().toISOString();
  const snapshot = await captureGraphSnapshot(exportSource, fallbackElement, dependencies);
  const model = buildReportDocumentModel({
    ...context,
    exportedAt,
  });
  const pdf = await (dependencies.createPdf ?? createPdfDocument)();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imageMaxWidth = 420;
  const imageAspectRatio = snapshot.width > 0 ? snapshot.height / snapshot.width : 0.5625;
  const imageWidth = Math.min(imageMaxWidth, pageWidth - 80);
  const imageHeight = imageWidth * imageAspectRatio;

  drawReportHeader(pdf, model);
  pdf.addImage(snapshot.dataUrl, 'PNG', pageWidth - imageWidth - 40, 34, imageWidth, imageHeight);

  const afterSummaryY = drawSummaryRows(pdf, model.summaryRows, 110);
  drawSections(pdf, model.sections, afterSummaryY + 12, pageHeight);

  const filename = buildPdfFilename(context.caseData.name, exportedAt);
  pdf.save(filename);

  return {
    filename,
    model,
    snapshot,
  };
}

export async function exportBoth(
  context: ReportExportContext,
  exportSource: GraphExportSource,
  fallbackElement?: HTMLElement | null,
  dependencies: ReportExporterDependencies = {},
) {
  const exportedAt = context.exportedAt ?? new Date().toISOString();
  const sharedContext = {
    ...context,
    exportedAt,
  };

  const pngResult = await exportPNG(sharedContext, exportSource, fallbackElement, dependencies);
  const pdfResult = await exportPDF(sharedContext, exportSource, fallbackElement, dependencies);

  return {
    pngResult,
    pdfResult,
  };
}
