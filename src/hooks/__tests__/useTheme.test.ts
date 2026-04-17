/** @jest-environment jsdom */

import { act, renderHook } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';

function setDomTheme(theme: string) {
  document.documentElement.setAttribute('data-theme', theme);
}

function clearDomTheme() {
  document.documentElement.removeAttribute('data-theme');
}

beforeEach(() => {
  localStorage.clear();
  clearDomTheme();
});

describe('useTheme', () => {
  it('defaults to dark when localStorage is empty and DOM has no attribute', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('reads light from DOM on mount when no-flash script already set it', () => {
    setDomTheme('light');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('toggleTheme switches dark → light, updates data-theme and localStorage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('shell-theme')).toBe('light');
  });

  it('toggleTheme switches light → dark, updates data-theme and localStorage', () => {
    setDomTheme('light');
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.theme).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('shell-theme')).toBe('dark');
  });

  it('setTheme writes both DOM attribute and localStorage', () => {
    const { result } = renderHook(() => useTheme());

    act(() => {
      result.current.setTheme('light');
    });

    expect(result.current.theme).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('shell-theme')).toBe('light');
  });
});
