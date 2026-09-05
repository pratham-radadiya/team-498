import SalaryStructureFormPage from "@/components/payroll/SalaryStructureFormPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <SalaryStructureFormPage structureId={id} />;
}
