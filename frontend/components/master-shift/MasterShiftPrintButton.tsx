"use client";

import { Button } from "@/components/ui/button";

export function MasterShiftPrintButton() {
  const handlePrint = () => {
    document.body.classList.add("master-shift-printing");
    window.print();
    document.body.classList.remove("master-shift-printing");
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={handlePrint}>
      <span>印刷</span>
    </Button>
  );
}
