import EmployeeFormPage from "@/components/employees/EmployeeFormPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <EmployeeFormPage employeeId={id} />;
}
