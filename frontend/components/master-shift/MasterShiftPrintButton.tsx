"use client";

import { Button } from "@/components/ui/button";

export function MasterShiftPrintButton() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
      <span>印刷</span>
    </Button>
  );
}
