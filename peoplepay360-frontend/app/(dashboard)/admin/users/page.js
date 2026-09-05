import RequireRole from "@/components/layout/RequireRole";
import UsersPage from "@/components/admin/UsersPage";
import { ROLES } from "@/lib/constants/roles";

export default function Page() {
  return (
    <RequireRole roles={[ROLES.ADMIN]}>
      <UsersPage />
    </RequireRole>
  );
}
