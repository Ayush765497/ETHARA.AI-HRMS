'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirect /recruitment/candidates to the main recruitment page with candidates tab
export default function CandidatesPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/recruitment/jobs'); }, [router]);
  return null;
}
