import { executeKnownIntent, getQuickCommandSuggestions } from '@/lib/ai/knownIntents';
import { mockCases } from '@/lib/data/mockCases';

describe('known intents', () => {
  it('supports natural-language parsing for suspicious patterns', () => {
    const execution = executeKnownIntent('find suspicious patterns in this case', {
      caseData: mockCases[0],
      selectedNodeId: null,
    });

    expect(execution.ok).toBe(true);
    if (execution.ok) {
      expect(execution.result.intentId).toBe('suspicious_patterns');
      expect(execution.result.highlightedNodeIds.length).toBeGreaterThan(0);
    }
  });

  it('uses the selected node for show connections when no explicit label is provided', () => {
    const execution = executeKnownIntent('/show connections', {
      caseData: mockCases[0],
      selectedNodeId: 'node-002',
    });

    expect(execution.ok).toBe(true);
    if (execution.ok) {
      expect(execution.result.selectedNodeId).toBe('node-002');
      expect(execution.result.highlightedNodeIds).toContain('node-002');
    }
  });

  it('provides contextual quick commands when a node is selected', () => {
    const suggestions = getQuickCommandSuggestions(mockCases[0], 'node-002');

    expect(suggestions.some((suggestion) => suggestion.kind === 'context')).toBe(true);
    expect(suggestions.some((suggestion) => suggestion.prompt.includes('Marco Delgado'))).toBe(true);
  });
});
