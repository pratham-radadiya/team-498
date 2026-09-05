import WorkingScheduleFormPage from "@/components/working-schedules/WorkingScheduleFormPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <WorkingScheduleFormPage scheduleId={id} />;
}
