'use client';

import { useParams } from 'next/navigation';
import PayrunDetailView from '@/components/payroll/PayrunDetailView';

export default function PayrunDetailPage() {
  const params = useParams();
  const id = params?.id;

  return <PayrunDetailView id={id} />;
}
