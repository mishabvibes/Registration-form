import './dashboard.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'لوحة التحكم - Dashboard',
  description: 'Drag and drop field position editor',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
