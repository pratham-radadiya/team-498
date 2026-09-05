import RequireRole from "@/components/layout/RequireRole";
import UserFormPage from "@/components/admin/UserFormPage";
import { ROLES } from "@/lib/constants/roles";

export default function Page() {
  return (
    <RequireRole roles={[ROLES.ADMIN]}>
      <UserFormPage />
    </RequireRole>
  );
}
