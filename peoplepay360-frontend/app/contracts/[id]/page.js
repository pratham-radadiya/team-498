'use client';

import { useParams } from 'next/navigation';
import ContractDetailView from '@/components/contracts/ContractDetailView';

export default function ContractDetailPage() {
  const params = useParams();
  const id = params?.id;

  return <ContractDetailView id={id} />;
}
