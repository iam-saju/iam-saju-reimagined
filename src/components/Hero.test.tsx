import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Hero from './Hero';

describe('Hero', () => {
  it('renders without crashing', async () => {
    render(<Hero />);
    await waitFor(() => {
      expect(screen.getAllByText(/hey/i).length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('renders with dark mode', async () => {
    render(<Hero isDarkMode={true} />);
    await waitFor(() => {
      expect(screen.getAllByText(/hey/i).length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });

  it('renders with light mode', async () => {
    render(<Hero isDarkMode={false} />);
    await waitFor(() => {
      expect(screen.getAllByText(/hey/i).length).toBeGreaterThan(0);
    }, { timeout: 3000 });
  });
});