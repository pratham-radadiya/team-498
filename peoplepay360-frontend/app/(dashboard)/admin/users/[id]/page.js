import RequireRole from "@/components/layout/RequireRole";
import UserFormPage from "@/components/admin/UserFormPage";
import { ROLES } from "@/lib/constants/roles";

export default async function Page({ params }) {
  const { id } = await params;
  return (
    <RequireRole roles={[ROLES.ADMIN]}>
      <UserFormPage userId={id} />
    </RequireRole>
  );
}
