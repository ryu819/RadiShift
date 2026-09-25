import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

export function FacilityInformationSkeleton() {
  return (
    <Card className="shadow-none max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-lg">施設情報</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 mt-1">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">施設名</p>
          <Skeleton className="h-5 w-40" />
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">申請締切の設定</p>
          <Skeleton className="h-5 w-20" />
        </div>

        <Separator />

        <div className="space-y-3">
          <div className="text-sm text-muted-foreground flex items-center">
            <Skeleton className="h-4 w-4" />
            月シフトの申請締切
          </div>

          <Skeleton className="h-5 w-20" />
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">施設ルール</p>

          <div className="space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
