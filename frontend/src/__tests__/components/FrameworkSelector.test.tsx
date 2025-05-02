import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FrameworkSelector from '../../components/FrameworkSelector';
import { FrameworkContext } from '../../context/FrameworkContext';

const mockSetSelectedFramework = jest.fn();
const mockContextValue = {
  selectedFramework: 'crewAI',
  setSelectedFramework: mockSetSelectedFramework,
  frameworks: ['crewAI', 'squidAI', 'lettaAI', 'autoGen', 'langGraph'],
  frameworkDetails: {},
  loading: false,
  error: null,
  fetchFrameworks: jest.fn(),
  fetchFrameworkDetails: jest.fn()
};

describe('FrameworkSelector Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all framework options', () => {
    render(
      <FrameworkContext.Provider value={mockContextValue}>
        <FrameworkSelector />
      </FrameworkContext.Provider>
    );

    mockContextValue.frameworks.forEach(framework => {
      expect(screen.getByText(framework)).toBeInTheDocument();
    });
  });

  it('selects the correct framework when clicked', () => {
    render(
      <FrameworkContext.Provider value={mockContextValue}>
        <FrameworkSelector />
      </FrameworkContext.Provider>
    );

    fireEvent.click(screen.getByText('squidAI'));

    expect(mockSetSelectedFramework).toHaveBeenCalledWith('squidAI');
  });

  it('highlights the currently selected framework', () => {
    render(
      <FrameworkContext.Provider value={mockContextValue}>
        <FrameworkSelector />
      </FrameworkContext.Provider>
    );

    const selectedElement = screen.getByText('crewAI').closest('button');
    expect(selectedElement).toHaveClass('bg-blue-500');

    const nonSelectedElement = screen.getByText('squidAI').closest('button');
    expect(nonSelectedElement).not.toHaveClass('bg-blue-500');
  });
});
