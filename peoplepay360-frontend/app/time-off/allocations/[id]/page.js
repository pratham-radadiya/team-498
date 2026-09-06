'use client';

import { useParams } from 'next/navigation';
import AllocationDetailView from '@/components/time-off/AllocationDetailView';

export default function AllocationDetailPage() {
  const params = useParams();
  const id = params?.id;

  return <AllocationDetailView id={id} />;
}
