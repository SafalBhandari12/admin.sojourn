"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { AdminAPI } from "@/lib/auth";
import Link from "next/link";

interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  approvedVendors: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalVendors: 0,
    pendingVendors: 0,
    approvedVendors: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);

        // Fetch users and vendors data
        const [usersResponse, vendorsResponse, pendingVendorsResponse] =
          await Promise.all([
            AdminAPI.getUsers({ limit: 1 }),
            AdminAPI.getVendors({ limit: 1 }),
            AdminAPI.getVendors({ status: "PENDING", limit: 1 }),
          ]);

        const approvedVendorsResponse = await AdminAPI.getVendors({
          status: "APPROVED",
          limit: 1,
        });

        setStats({
          totalUsers: usersResponse.data.pagination.total,
          totalVendors: vendorsResponse.data.pagination.total,
          pendingVendors: pendingVendorsResponse.data.pagination.total,
          approvedVendors: approvedVendorsResponse.data.pagination.total,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className='px-4 py-6 sm:px-0'>
        <div className='animate-pulse'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='bg-white p-6 rounded-lg shadow'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-8 bg-gray-200 rounded w-1/2'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='px-4 py-6 sm:px-0'>
      <div className='mb-8'>
        <h1 className='text-3xl font-bold text-gray-900'>Admin Dashboard</h1>
        <p className='text-gray-600 mt-2'>
          Welcome back, {user?.phoneNumber}! Here's an overview of your
          platform.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
                  </svg>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Total Users
                  </dt>
                  <dd className='text-lg font-medium text-gray-900'>
                    {stats.totalUsers}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z' />
                  </svg>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Total Vendors
                  </dt>
                  <dd className='text-lg font-medium text-gray-900'>
                    {stats.totalVendors}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Pending Reviews
                  </dt>
                  <dd className='text-lg font-medium text-gray-900'>
                    {stats.pendingVendors}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-white overflow-hidden shadow rounded-lg'>
          <div className='p-5'>
            <div className='flex items-center'>
              <div className='flex-shrink-0'>
                <div className='w-8 h-8 bg-green-600 rounded-full flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-white'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path
                      fillRule='evenodd'
                      d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                      clipRule='evenodd'
                    />
                  </svg>
                </div>
              </div>
              <div className='ml-5 w-0 flex-1'>
                <dl>
                  <dt className='text-sm font-medium text-gray-500 truncate'>
                    Approved Vendors
                  </dt>
                  <dd className='text-lg font-medium text-gray-900'>
                    {stats.approvedVendors}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className='bg-white shadow rounded-lg'>
        <div className='px-4 py-5 sm:p-6'>
          <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
            Quick Actions
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            <Link
              href='/dashboard/vendors'
              className='relative group bg-white p-6 focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors'
            >
              <div>
                <span className='rounded-lg inline-flex p-3 bg-indigo-50 text-indigo-600 ring-4 ring-white'>
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m11 0a2 2 0 01-2 2H5a2 2 0 01-2-2m0 0V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10M7 11h4m6 0h2M7 15h4m6 0h2'
                    />
                  </svg>
                </span>
              </div>
              <div className='mt-4'>
                <h3 className='text-lg font-medium'>
                  <span className='absolute inset-0' aria-hidden='true' />
                  Manage Vendors
                </h3>
                <p className='mt-2 text-sm text-gray-500'>
                  Review, approve, or reject vendor applications.
                </p>
              </div>
            </Link>

            <Link
              href='/dashboard/users'
              className='relative group bg-white p-6 focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors'
            >
              <div>
                <span className='rounded-lg inline-flex p-3 bg-green-50 text-green-600 ring-4 ring-white'>
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-1a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z'
                    />
                  </svg>
                </span>
              </div>
              <div className='mt-4'>
                <h3 className='text-lg font-medium'>
                  <span className='absolute inset-0' aria-hidden='true' />
                  Manage Users
                </h3>
                <p className='mt-2 text-sm text-gray-500'>
                  Assign roles and manage user accounts.
                </p>
              </div>
            </Link>

            <Link
              href='/dashboard/profile'
              className='relative group bg-white p-6 focus:ring-2 focus:ring-inset focus:ring-indigo-500 rounded-lg border border-gray-300 hover:border-gray-400 transition-colors'
            >
              <div>
                <span className='rounded-lg inline-flex p-3 bg-purple-50 text-purple-600 ring-4 ring-white'>
                  <svg
                    className='h-6 w-6'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
                    />
                  </svg>
                </span>
              </div>
              <div className='mt-4'>
                <h3 className='text-lg font-medium'>
                  <span className='absolute inset-0' aria-hidden='true' />
                  Admin Profile
                </h3>
                <p className='mt-2 text-sm text-gray-500'>
                  Update your admin profile and permissions.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
