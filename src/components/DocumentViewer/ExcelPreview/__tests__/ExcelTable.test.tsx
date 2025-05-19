
import { render, screen } from '@testing-library/react';
import ExcelTable from "../components/ExcelTable";

describe('ExcelTable', () => {
  const testData = [
    { name: 'John', age: 30, city: 'New York' },
    { name: 'Jane', age: 25, city: 'Boston' }
  ];

  it('renders table headers correctly', () => {
    render(<ExcelTable data={testData} />);
    
    expect(screen.getByText('name')).toBeInTheDocument();
    expect(screen.getByText('age')).toBeInTheDocument();
    expect(screen.getByText('city')).toBeInTheDocument();
  });

  it('renders table data correctly', () => {
    render(<ExcelTable data={testData} />);
    
    expect(screen.getByText('John')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('New York')).toBeInTheDocument();
    
    expect(screen.getByText('Jane')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('Boston')).toBeInTheDocument();
  });

  it('handles empty data gracefully', () => {
    render(<ExcelTable data={[]} />);
    
    expect(screen.getByText('No data available')).toBeInTheDocument();
  });
});
