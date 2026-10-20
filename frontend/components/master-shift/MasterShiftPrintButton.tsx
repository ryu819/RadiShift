"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function MasterShiftPrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
      <Printer />
      <span className="max-sm:hidden">印刷</span>
    </Button>
  );
}
