"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TokenStorage } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const accessToken = TokenStorage.getAccessToken();

    if (accessToken) {
      // User is authenticated, redirect to dashboard
      router.push("/dashboard");
    } else {
      // User is not authenticated, redirect to auth page
      router.push("/auth");
    }
  }, [router]);

  return (
    <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
    </div>
  );
}
