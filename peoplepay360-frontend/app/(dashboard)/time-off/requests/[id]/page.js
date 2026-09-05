import RequestDetailPage from "@/components/time-off/RequestDetailPage";

export default async function Page({ params }) {
  const { id } = await params;
  return <RequestDetailPage requestId={id} />;
}
