'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect to the new home page with all batting orders
export default function BattingOrderRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-t-4 border-blue-500 border-solid rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting...</p>
      </div>
    </div>
  );
}