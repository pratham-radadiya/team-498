'use client';

import { useParams } from 'next/navigation';
import SalaryRuleDetailView from '@/components/payroll/SalaryRuleDetailView';

export default function SalaryRuleDetailPage() {
  const params = useParams();
  const id = params?.id;

  return <SalaryRuleDetailView id={id} />;
}
