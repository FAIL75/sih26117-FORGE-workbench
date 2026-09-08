"use client";

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import RagWorkbench from '../../components/RagWorkbench';
import VisionWorkbench from '../../components/VisionWorkbench';
import CodeWorkbench from '../../components/CodeWorkbench';

function WorkbenchRouter() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  if (mode === 'rag') {
    return <RagWorkbench />;
  }

  if (mode === 'vision') {
    return <VisionWorkbench />;
  }
  
  if (mode === 'code') {
    return <CodeWorkbench />;
  }

  return <div className="h-full flex items-center justify-center text-white">Select a valid mode from the homepage.</div>;
}

export default function DemoPage() {
  return (
    <div className="h-[calc(100vh-72px)] w-full flex overflow-hidden bg-[#82B3E8]">
      <Suspense fallback={<div className="h-full flex items-center justify-center text-white">Loading Enclave...</div>}>
        <WorkbenchRouter />
      </Suspense>
    </div>
  );
}