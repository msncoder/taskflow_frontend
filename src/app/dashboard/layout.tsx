import DashboardLayoutClient from '@/components/DashboardLayout';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // We separate the client and server components here.
  // The layout wrapper itself can be a server component that renders the client wrapper.
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
