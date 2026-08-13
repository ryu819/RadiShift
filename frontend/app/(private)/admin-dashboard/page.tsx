import { Metadata } from "next";

import { Overview } from "@/components/admin/dashboard/overview/Overview";

export const metadata: Metadata = {
  title: "管理画面TOP",
};

export default function AdminDashboardPage() {
  return <Overview />;
}
