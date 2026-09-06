'use client';

import { useParams } from 'next/navigation';
import TimeOffTypeDetailView from '@/components/time-off/TimeOffTypeDetailView';

export default function TimeOffTypeDetailPage() {
  const params = useParams();
  const id = params?.id;

  return <TimeOffTypeDetailView id={id} />;
}
