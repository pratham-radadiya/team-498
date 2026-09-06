'use client';

import { useParams } from 'next/navigation';
import WorkingScheduleDetailView from '@/components/schedules/WorkingScheduleDetailView';

export default function WorkingScheduleDetailPage() {
  const params = useParams();
  const id = params?.id;

  return <WorkingScheduleDetailView id={id} />;
}
