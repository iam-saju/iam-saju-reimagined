import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem = vi.fn(() => null);
  });

  it('returns dark mode false by default when no localStorage', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDarkMode).toBe(false);
  });

  it('toggles theme correctly', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });

    expect(result.current.isDarkMode).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalledWith('theme-preference', 'true');
  });

  it('persists theme to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    
    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.setItem).toHaveBeenCalled();
  });
});
