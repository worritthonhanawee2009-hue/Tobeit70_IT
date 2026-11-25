import { fireEvent, render, screen } from '@testing-library/react';
import App from './App';

test('renders the AI time planner', () => {
  render(<App />);
  expect(screen.getByText(/วันนี้คุณวางแผนทำอะไร/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /จัดตารางให้ฉัน/i })).toBeInTheDocument();
});

test('can generate a schedule from the text fields', () => {
  render(<App />);
  const textarea = screen.getByPlaceholderText(/พิมพ์งานทีละบรรทัด/i);
  fireEvent.change(textarea, { target: { value: 'เขียนรายงาน' } });
  fireEvent.click(screen.getByRole('button', { name: /จัดตารางให้ฉัน/i }));
  expect(screen.getAllByText('เขียนรายงาน').length).toBeGreaterThan(0);
});
