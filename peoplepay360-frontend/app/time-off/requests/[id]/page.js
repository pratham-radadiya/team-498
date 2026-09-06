'use client';

import { useParams } from 'next/navigation';
import RequestDetailView from '@/components/time-off/RequestDetailView';

export default function RequestDetailPage() {
  const params = useParams();
  const id = params?.id;

  return <RequestDetailView id={id} />;
}
