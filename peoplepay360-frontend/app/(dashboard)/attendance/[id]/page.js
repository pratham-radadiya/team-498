import AttendanceFormPage from "@/components/attendance/AttendanceFormPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <AttendanceFormPage attendanceId={id} />;
}
