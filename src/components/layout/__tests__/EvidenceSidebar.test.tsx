/** @jest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react';
import EvidenceSidebar from '@/components/layout/EvidenceSidebar';
import { mockCases } from '@/lib/data/mockCases';

describe('EvidenceSidebar', () => {
  it('renders evidence categories and files', () => {
    render(
      <EvidenceSidebar
        evidence={mockCases[0].evidence}
        selectedEvidenceId="file-001"
        onEvidenceSelect={() => {}}
        filtersPanel={<div>Filters panel content</div>}
      />,
    );

    expect(screen.getByRole('button', { name: 'Raw Evidence' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Filters & Layers' })).toBeInTheDocument();
    expect(screen.getByText('Device Data')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /iPhone_14_extraction\.zip/i })).toBeInTheDocument();
    expect(screen.getByText('Surveillance')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Warehouse_cam_jan18\.mp4/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Filters & Layers' }));

    expect(screen.getByText('Filters panel content')).toBeInTheDocument();
  });

  it('emits the selected evidence file through the callback', () => {
    const onEvidenceSelect = jest.fn();

    render(
      <EvidenceSidebar
        evidence={mockCases[0].evidence}
        selectedEvidenceId={null}
        onEvidenceSelect={onEvidenceSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Signal_message_export\.json/i }));

    expect(onEvidenceSelect).toHaveBeenCalledTimes(1);
    expect(onEvidenceSelect.mock.calls[0][0]).toMatchObject({
      id: 'file-003',
      name: 'Signal_message_export.json',
    });
  });
});
