"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user, checkTokenExpiration } = useAuth();
  const router = useRouter();

  useEffect(() => {
    console.log(
      "AuthGuard - isLoading:",
      isLoading,
      "isAuthenticated:",
      isAuthenticated,
      "user:",
      user
    ); // Debug log

    if (!isLoading) {
      // Check token expiration on component mount
      const isTokenValid = checkTokenExpiration();

      if (!isAuthenticated || !isTokenValid) {
        console.log(
          "Redirecting to /auth - user not authenticated or token expired"
        ); // Debug log
        router.push("/auth");
        return;
      }
    }

    // Check if user has admin role (temporarily disabled for debugging)
    if (!isLoading && isAuthenticated && user) {
      console.log(
        "User role check - role:",
        user.role,
        "isAdmin:",
        user.role === "ADMIN"
      );

      // Temporarily disable admin role check to see if this is the issue
      // if (user.role !== "ADMIN") {
      //   console.log("Redirecting to /auth - user is not admin:", user.role);
      //   router.push("/auth");
      // }
    }
  }, [isLoading, isAuthenticated, router, checkTokenExpiration, user]);

  if (isLoading) {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600'></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log("AuthGuard: Not rendering children - user not authenticated");
    return null; // Will redirect to auth
  }

  console.log("AuthGuard: Rendering children - user is authenticated");
  return <>{children}</>;
}
