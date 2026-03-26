import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Footer from './Footer';

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />);
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
  });

  it('renders with dark mode by default', () => {
    const { container } = render(<Footer isDarkMode={true} />);
    expect(container.querySelector('footer')).toBeInTheDocument();
  });

  it('renders with light mode', () => {
    const { container } = render(<Footer isDarkMode={false} />);
    expect(container.querySelector('footer')).toBeInTheDocument();
  });
});