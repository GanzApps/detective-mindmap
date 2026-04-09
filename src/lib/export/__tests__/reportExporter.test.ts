/** @jest-environment jsdom */

import { mockCases } from '@/lib/data/mockCases';
import {
  buildPdfFilename,
  buildPngFilename,
  buildReportDocumentModel,
  captureGraphSnapshot,
  exportPNG,
} from '@/lib/export/reportExporter';
import { type GraphExportSource, type PdfDocument, type ReportExportContext } from '@/lib/export/exportTypes';

describe('reportExporter', () => {
  const caseData = mockCases[0];
  const context: ReportExportContext = {
    caseData,
    viewMode: '3d',
    highlightedEvidenceId: caseData.evidence[0]?.files[0]?.id ?? null,
    highlightedEntityIds: ['node-001', 'node-003'],
    selectedNodeId: 'node-003',
    activeFilters: ['person', 'event'],
    exportedAt: '2026-04-09T09:08:07.000Z',
  };

  it('builds stable export filenames from case metadata', () => {
    expect(buildPngFilename(caseData.name, context.exportedAt!)).toBe('operation-nightfall-20260409-090807-graph.png');
    expect(buildPdfFilename(caseData.name, context.exportedAt!)).toBe('operation-nightfall-20260409-090807-report.pdf');
  });

  it('assembles a detailed report model with workspace context', () => {
    const model = buildReportDocumentModel(context);

    expect(model.title).toContain(caseData.name);
    expect(model.summaryRows).toEqual(expect.arrayContaining([
      expect.objectContaining({ label: 'Renderer', value: '3D workspace' }),
      expect.objectContaining({ label: 'Highlighted', value: '2' }),
    ]));
    expect(model.sections[0]?.lines).toEqual(expect.arrayContaining([
      expect.stringContaining('Highlighted evidence:'),
      expect.stringContaining('Selected node:'),
      expect.stringContaining('Active filters: person, event'),
    ]));
    expect(model.sections.some((section) => section.title === 'Entity list')).toBe(true);
    expect(model.sections.some((section) => section.title === 'Connection summary')).toBe(true);
  });

  it('prefers the active canvas snapshot before using DOM capture fallback', async () => {
    const redrawActiveView = jest.fn();
    const exportSource: GraphExportSource = {
      getActiveCanvas: () => ({ width: 1600, height: 900 } as HTMLCanvasElement),
      redrawActiveView,
      captureActiveViewDataUrl: () => 'data:image/png;base64,canvas',
    };
    const captureElementAsDataUrl = jest.fn();

    const snapshot = await captureGraphSnapshot(
      exportSource,
      document.createElement('div'),
      { captureElementAsDataUrl },
    );

    expect(redrawActiveView).toHaveBeenCalled();
    expect(snapshot).toEqual({
      dataUrl: 'data:image/png;base64,canvas',
      width: 1600,
      height: 900,
      source: 'canvas',
    });
    expect(captureElementAsDataUrl).not.toHaveBeenCalled();
  });

  it('exports a PNG using the active renderer snapshot and requested filename', async () => {
    const downloadDataUrl = jest.fn();
    const exportSource: GraphExportSource = {
      getActiveCanvas: () => ({ width: 1200, height: 800 } as HTMLCanvasElement),
      redrawActiveView: jest.fn(),
      captureActiveViewDataUrl: () => 'data:image/png;base64,graph',
    };

    const result = await exportPNG(context, exportSource, null, { downloadDataUrl });

    expect(downloadDataUrl).toHaveBeenCalledWith(
      'operation-nightfall-20260409-090807-graph.png',
      'data:image/png;base64,graph',
    );
    expect(result.snapshot.source).toBe('canvas');
  });

  it('supports injected PDF writers without depending on browser plugins in tests', async () => {
    const save = jest.fn();
    const pdf: PdfDocument = {
      internal: {
        pageSize: {
          getWidth: () => 842,
          getHeight: () => 595,
        },
      },
      setFont: jest.fn(),
      setFontSize: jest.fn(),
      text: jest.fn(),
      addImage: jest.fn(),
      addPage: jest.fn(),
      save,
    };
    const exportSource: GraphExportSource = {
      getActiveCanvas: () => ({ width: 1200, height: 800 } as HTMLCanvasElement),
      redrawActiveView: jest.fn(),
      captureActiveViewDataUrl: () => 'data:image/png;base64,graph',
    };
    const { exportPDF } = await import('@/lib/export/reportExporter');

    const result = await exportPDF(context, exportSource, null, {
      createPdf: async () => pdf,
    });

    expect(pdf.addImage).toHaveBeenCalledWith(
      'data:image/png;base64,graph',
      'PNG',
      expect.any(Number),
      34,
      expect.any(Number),
      expect.any(Number),
    );
    expect(save).toHaveBeenCalledWith('operation-nightfall-20260409-090807-report.pdf');
    expect(result.model.sections.length).toBeGreaterThan(1);
  });
});
