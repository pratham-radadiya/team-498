'use client';

import { useParams } from 'next/navigation';
import AttendanceDetailView from '@/components/attendance/AttendanceDetailView';

export default function AttendanceDetailPage() {
  const params = useParams();
  const id = params?.id;

  return <AttendanceDetailView id={id} />;
}
