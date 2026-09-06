'use client';

import { useParams } from 'next/navigation';
import SalaryStructureDetailView from '@/components/payroll/SalaryStructureDetailView';

export default function SalaryStructureDetailPage() {
  const params = useParams();
  const id = params?.id;

  return <SalaryStructureDetailView id={id} />;
}
