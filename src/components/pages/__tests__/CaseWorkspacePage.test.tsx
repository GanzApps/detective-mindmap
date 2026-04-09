/** @jest-environment jsdom */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import CaseWorkspacePage from '@/components/pages/CaseWorkspacePage';
import { mockCases } from '@/lib/data/mockCases';
import { useCaseStore } from '@/store/caseStore';

const exportPNG = jest.fn();
const exportPDF = jest.fn();
const exportBoth = jest.fn();

jest.mock('@/hooks/useCaseData', () => ({
  useCaseById: () => ({
    caseData: mockCases[0],
    isLoading: false,
    error: null,
  }),
}));

jest.mock('@/lib/export/reportExporter', () => ({
  exportPNG: (...args: unknown[]) => exportPNG(...args),
  exportPDF: (...args: unknown[]) => exportPDF(...args),
  exportBoth: (...args: unknown[]) => exportBoth(...args),
}));

jest.mock('@/components/layout/CaseWorkspaceShell', () => ({
  __esModule: true,
  default: ({
    onExport,
    isExporting,
    graphWorkspaceRef,
  }: {
    onExport: (format: 'png' | 'pdf' | 'both') => void;
    isExporting: boolean;
    graphWorkspaceRef: {
      current: {
        getActiveCanvas: () => HTMLCanvasElement | null;
        getActiveCaptureElement: () => HTMLElement | null;
        redrawActiveView: () => void;
        captureActiveViewDataUrl: () => string | null;
      } | null;
    };
  }) => {
    graphWorkspaceRef.current = {
      getActiveCanvas: () => ({ width: 1600, height: 900 } as HTMLCanvasElement),
      getActiveCaptureElement: () => document.createElement('div'),
      redrawActiveView: () => {},
      captureActiveViewDataUrl: () => 'data:image/png;base64,graph',
    };

    return (
      <div>
        <div data-testid="export-state">{isExporting ? 'exporting' : 'idle'}</div>
        <button type="button" onClick={() => onExport('png')}>
          Trigger PNG Export
        </button>
        <button type="button" onClick={() => onExport('both')}>
          Trigger Both Export
        </button>
      </div>
    );
  },
}));

describe('CaseWorkspacePage', () => {
  beforeEach(() => {
    exportPNG.mockReset().mockResolvedValue(undefined);
    exportPDF.mockReset().mockResolvedValue(undefined);
    exportBoth.mockReset().mockResolvedValue(undefined);

    useCaseStore.setState({
      highlightedEvidenceId: mockCases[0].evidence[0].files[0].id,
      highlightedEntityIds: ['node-002', 'node-007'],
      selectedNodeId: 'node-002',
      activeFilters: ['person', 'location'],
      viewMode: '3d',
    });
  });

  it('routes PNG export through the report exporter with current case context', async () => {
    render(<CaseWorkspacePage caseId={mockCases[0].id} />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger PNG Export' }));

    await waitFor(() => {
      expect(exportPNG).toHaveBeenCalledTimes(1);
    });

    const [context, exportSource, fallbackElement] = exportPNG.mock.calls[0];

    expect(context).toEqual(expect.objectContaining({
      caseData: mockCases[0],
      viewMode: '3d',
      highlightedEvidenceId: mockCases[0].evidence[0].files[0].id,
      highlightedEntityIds: ['node-002', 'node-007'],
      selectedNodeId: 'node-002',
      activeFilters: ['person', 'location'],
      selectedNodeLabel: 'Marco Delgado',
    }));
    expect(exportSource).toEqual(expect.objectContaining({
      captureActiveViewDataUrl: expect.any(Function),
    }));
    expect(fallbackElement).toBeInstanceOf(HTMLDivElement);
  });

  it('can route the combined export action through the shared exporter', async () => {
    render(<CaseWorkspacePage caseId={mockCases[0].id} />);

    fireEvent.click(screen.getByRole('button', { name: 'Trigger Both Export' }));

    await waitFor(() => {
      expect(exportBoth).toHaveBeenCalledTimes(1);
    });
  });
});
