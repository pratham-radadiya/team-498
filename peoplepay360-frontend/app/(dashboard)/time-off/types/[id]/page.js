import TimeOffTypeFormPage from "@/components/time-off/TimeOffTypeFormPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <TimeOffTypeFormPage typeId={id} />;
}
