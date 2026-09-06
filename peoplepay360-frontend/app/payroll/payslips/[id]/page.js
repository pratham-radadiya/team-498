'use client';

import { useParams } from 'next/navigation';
import PayslipDetailView from '@/components/payroll/PayslipDetailView';

export default function PayslipDetailPage() {
  const params = useParams();
  const id = params?.id;

  return <PayslipDetailView id={id} />;
}
