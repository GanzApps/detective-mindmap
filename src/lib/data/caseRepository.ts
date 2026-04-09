import { CaseSchema, type Case } from '@/lib/data/dataTypes';
import { mockCases } from '@/lib/data/mockCases';

export interface CaseRepository {
  fetchCase(id: string): Promise<Case>;
  listCases(): Promise<Case[]>;
}

function cloneCase(caseData: Case): Case {
  return CaseSchema.parse(JSON.parse(JSON.stringify(caseData)));
}

export const mockCaseRepository: CaseRepository = {
  fetchCase(id: string): Promise<Case> {
    const found = mockCases.find((c) => c.id === id);

    if (!found) {
      return Promise.reject(new Error(`Case not found: ${id}`));
    }

    return Promise.resolve(cloneCase(found));
  },

  listCases(): Promise<Case[]> {
    return Promise.resolve(mockCases.map(cloneCase));
  },
};
