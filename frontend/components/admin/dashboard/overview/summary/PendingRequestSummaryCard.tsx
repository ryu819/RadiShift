import { FileText } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function PendingRequestSummaryCard({ count }: { count?: number }) {
  return (
    <Card className="py-0 shadow-none">
      <CardContent className="flex h-full flex-col px-5 py-5">
        <div className="flex items-center gap-3">
          <FileText className="size-6 text-primary" />

          <p className="text-sm font-medium text-muted-foreground">
            未処理の申請
          </p>
        </div>

        <div className="flex items-baseline justify-center gap-1.5 pt-5">
          <span className="text-3xl font-semibold">{count}</span>

          <span className="text-base font-medium text-muted-foreground">
            件
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
