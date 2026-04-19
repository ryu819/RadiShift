import { UploadImageForm } from "@/components/UploadImageForm";
import { getCurrentUser } from "@/lib/actions/get-current-user";

export async function UploadImageServer() {
  const user = await getCurrentUser();

  return <UploadImageForm user={user} />;
}
