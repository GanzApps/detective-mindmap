'use client';

import { useEffect, useMemo, useState } from 'react';
import { mockCaseRepository } from '@/lib/data/caseRepository';
import { type Case } from '@/lib/data/dataTypes';
import { useCaseStore } from '@/store/caseStore';

export function useCaseListData() {
  const cases = useCaseStore((state) => state.cases);
  const hydrateCases = useCaseStore((state) => state.hydrateCases);
  const [isLoading, setIsLoading] = useState(cases.length === 0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    if (cases.length > 0) {
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);
    mockCaseRepository
      .listCases()
      .then((loadedCases) => {
        if (cancelled) {
          return;
        }

        hydrateCases(loadedCases);
        setError(null);
        setIsLoading(false);
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }

        setError(reason instanceof Error ? reason.message : 'Unable to load cases.');
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cases.length, hydrateCases]);

  const sortedCases = useMemo(() => (
    [...cases].sort((left, right) => (
      right.updatedAt.localeCompare(left.updatedAt)
    ))
  ), [cases]);

  return {
    cases: sortedCases,
    isLoading,
    error,
  };
}

export function useCaseById(caseId: string) {
  const caseData = useCaseStore((state) => (
    state.cases.find((item) => item.id === caseId) ?? null
  ));
  const activeCaseId = useCaseStore((state) => state.activeCaseId);
  const upsertCase = useCaseStore((state) => state.upsertCase);
  const setActiveCase = useCaseStore((state) => state.setActiveCase);
  const [isLoading, setIsLoading] = useState(caseData === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setActiveCase(caseId);

    return () => {
      if (activeCaseId === caseId) {
        setActiveCase(null);
      }
    };
  }, [activeCaseId, caseId, setActiveCase]);

  useEffect(() => {
    let cancelled = false;

    if (caseData) {
      setIsLoading(false);
      return () => {
        cancelled = true;
      };
    }

    setIsLoading(true);
    mockCaseRepository
      .fetchCase(caseId)
      .then((loadedCase: Case) => {
        if (cancelled) {
          return;
        }

        upsertCase(loadedCase);
        setError(null);
        setIsLoading(false);
      })
      .catch((reason: unknown) => {
        if (cancelled) {
          return;
        }

        setError(reason instanceof Error ? reason.message : 'Unable to load case.');
        setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [caseData, caseId, upsertCase]);

  return {
    caseData,
    isLoading,
    error,
  };
}
