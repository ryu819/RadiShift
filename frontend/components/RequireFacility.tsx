import { requireFacility } from "@/lib/auth/require-facility";

export async function RequireFacility({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireFacility();

  return children;
}
