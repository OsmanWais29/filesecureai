
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FolderIcon } from '../components/FolderIcon';
import { vi } from 'vitest';
import { screen, fireEvent } from '../../../setupTests';

describe('FolderIcon', () => {
  it('renders with default variant', () => {
    render(<FolderIcon />);
    expect(screen.getByTestId('folder-icon')).toHaveClass('from-blue-500');
  });

  it('changes appearance on hover', async () => {
    render(<FolderIcon />);
    const icon = screen.getByTestId('folder-icon');
    
    fireEvent.mouseEnter(icon);
    expect(screen.getByTestId('hover-indicator')).toBeInTheDocument();
    
    fireEvent.mouseLeave(icon);
    expect(screen.queryByTestId('hover-indicator')).not.toBeInTheDocument();
  });

  it('displays different variants correctly', () => {
    const { rerender } = render(<FolderIcon variant="form" />);
    expect(screen.getByTestId('folder-icon')).toHaveClass('from-green-500');

    rerender(<FolderIcon variant="archive" />);
    expect(screen.getByTestId('folder-icon')).toHaveClass('from-gray-500');
  });
});
