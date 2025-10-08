"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AdminAPI, Vendor } from "@/lib/auth";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

export default function VendorsPage() {
  console.log("VendorsPage component rendered");

  const router = useRouter();
  const { logout } = useAuth();

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    vendorType: "",
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
  });
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { showSuccess, showError } = useToast();

  // Helper function to check if error is due to authentication issues
  const isAuthError = useCallback((error: unknown): boolean => {
    const errorMessage = (error as Error)?.message || "";
    return (
      errorMessage.includes("401") ||
      errorMessage.includes("403") ||
      errorMessage.includes("Unauthorized") ||
      errorMessage.includes("Forbidden") ||
      errorMessage.includes("Authentication failed") ||
      errorMessage.includes("Access forbidden") ||
      errorMessage.includes("Invalid token") ||
      errorMessage.includes("Token expired") ||
      errorMessage.includes("JWT") ||
      errorMessage.includes("Bearer")
    );
  }, []);

  // Helper function to handle authentication errors
  const handleAuthError = useCallback(() => {
    console.log("Authentication error detected, redirecting to login");
    logout(); // Clear tokens and user state
    router.push("/auth"); // Redirect to login page
  }, [logout, router]);

  const fetchVendors = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log("Fetching vendors with filters:", filters);

      // Check if we have a token first
      const token = localStorage.getItem("accessToken");
      console.log("Access token exists:", !!token);
      if (token) {
        console.log("Token preview:", token.substring(0, 20) + "...");
      }

      const response = await AdminAPI.getVendors(filters);
      console.log("Vendors API response:", response);

      setVendors(response.data.vendors || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Check if this is an authentication error
      if (isAuthError(error)) {
        handleAuthError();
        return; // Don't show error message, just redirect
      }

      showError("Failed to load vendors. Please try again.");

      // Set empty data to show the UI instead of infinite loading
      setVendors([]);
      setPagination({ total: 0, page: 1, pages: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [filters, isAuthError, handleAuthError, showError]);

  useEffect(() => {
    console.log("useEffect triggered, calling fetchVendors");
    fetchVendors();
  }, [fetchVendors]);

  const handleVendorAction = async (
    vendorId: string,
    action: "approve" | "reject" | "suspend"
  ) => {
    try {
      setActionLoading(vendorId);

      let response;
      switch (action) {
        case "approve":
          response = await AdminAPI.approveVendor(vendorId);
          break;
        case "reject":
          response = await AdminAPI.rejectVendor(vendorId);
          break;
        case "suspend":
          response = await AdminAPI.suspendVendor(vendorId);
          break;
      }

      if (response.success) {
        // Refresh the vendors list
        fetchVendors();
        setShowModal(false);
        showSuccess(`Vendor ${action}d successfully!`);
      }
    } catch (error) {
      console.error(`Failed to ${action} vendor:`, error);

      // Check if this is an authentication error
      if (isAuthError(error)) {
        handleAuthError();
        return; // Don't show error message, just redirect
      }

      showError(`Failed to ${action} vendor. Please try again.`);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      SUSPENDED: "bg-gray-100 text-gray-800",
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      styles[status as keyof typeof styles] || styles.PENDING
    }`;
  };

  const getVendorTypeBadge = (type: string) => {
    const styles = {
      HOTEL: "bg-blue-100 text-blue-800",
      ADVENTURE: "bg-purple-100 text-purple-800",
      TRANSPORT: "bg-indigo-100 text-indigo-800",
      MARKET: "bg-pink-100 text-pink-800",
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      styles[type as keyof typeof styles] || styles.HOTEL
    }`;
  };

  if (isLoading) {
    console.log("Component is in loading state");
    return (
      <div className='px-4 py-6 sm:px-0'>
        <div className='mb-4 text-sm text-gray-500'>Loading vendors...</div>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/4 mb-6'></div>
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className='bg-white p-4 rounded-lg shadow'>
                <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                <div className='h-4 bg-gray-200 rounded w-1/2'></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  console.log("Component rendering with vendors:", vendors.length);

  return (
    <div className='px-4 py-6 sm:px-0'>
      <div>
        <div className='sm:flex sm:items-center'>
          <div className='sm:flex-auto'>
            <h1 className='text-2xl font-semibold text-gray-900'>
              Vendor Management
            </h1>
            <p className='mt-2 text-sm text-gray-700'>
              Review and manage vendor applications for the platform.
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className='mt-6 bg-white shadow rounded-lg p-4'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value, page: 1 })
                }
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              >
                <option value=''>All Statuses</option>
                <option value='PENDING'>Pending</option>
                <option value='APPROVED'>Approved</option>
                <option value='REJECTED'>Rejected</option>
                <option value='SUSPENDED'>Suspended</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Vendor Type
              </label>
              <select
                value={filters.vendorType}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    vendorType: e.target.value,
                    page: 1,
                  })
                }
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              >
                <option value=''>All Types</option>
                <option value='HOTEL'>Hotel</option>
                <option value='ADVENTURE'>Adventure</option>
                <option value='TRANSPORT'>Transport</option>
                <option value='MARKET'>Market</option>
              </select>
            </div>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1'>
                Items per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    limit: parseInt(e.target.value),
                    page: 1,
                  })
                }
                className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
              >
                <option value='10'>10</option>
                <option value='25'>25</option>
                <option value='50'>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* Vendors Table */}
        <div className='mt-8 flex flex-col'>
          <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
            <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
              <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
                <table className='min-w-full divide-y divide-gray-300'>
                  <thead className='bg-gray-50'>
                    <tr>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Business
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Owner
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Type
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Status
                      </th>
                      <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                        Applied
                      </th>
                      <th className='relative px-6 py-3'>
                        <span className='sr-only'>Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className='bg-white divide-y divide-gray-200'>
                    {vendors.length === 0 ? (
                      <tr>
                        <td colSpan={6} className='px-6 py-12 text-center'>
                          <div className='text-gray-500'>
                            <svg
                              className='mx-auto h-12 w-12 text-gray-400'
                              fill='none'
                              viewBox='0 0 24 24'
                              stroke='currentColor'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                              />
                            </svg>
                            <h3 className='mt-2 text-sm font-medium text-gray-900'>
                              No vendors found
                            </h3>
                            <p className='mt-1 text-sm text-gray-500'>
                              {filters.status || filters.vendorType
                                ? "Try adjusting your filters."
                                : "No vendor applications have been submitted yet."}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      vendors.map((vendor) => (
                        <tr key={vendor.id}>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm font-medium text-gray-900'>
                              {vendor.businessName}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {vendor.email}
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='text-sm text-gray-900'>
                              {vendor.ownerName}
                            </div>
                            <div className='text-sm text-gray-500'>
                              {vendor.user.phoneNumber}
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span
                              className={getVendorTypeBadge(vendor.vendorType)}
                            >
                              {vendor.vendorType}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span className={getStatusBadge(vendor.status)}>
                              {vendor.status}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {new Date(vendor.createdAt).toLocaleDateString()}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                            <button
                              onClick={() => {
                                setSelectedVendor(vendor);
                                setShowModal(true);
                              }}
                              className='text-indigo-600 hover:text-indigo-900'
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className='mt-6 flex items-center justify-between'>
            <div className='text-sm text-gray-700'>
              Showing {(pagination.page - 1) * filters.limit + 1} to{" "}
              {Math.min(pagination.page * filters.limit, pagination.total)} of{" "}
              {pagination.total} results
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page - 1 })
                }
                disabled={filters.page <= 1}
                className='px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setFilters({ ...filters, page: filters.page + 1 })
                }
                disabled={filters.page >= pagination.pages}
                className='px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Vendor Details Modal */}
        {showModal && selectedVendor && (
          <div className='fixed inset-0 z-50 overflow-y-auto backdrop-blur-sm'>
            <div className='flex items-center justify-center min-h-screen pt-4 px-4 pb-20'>
              <div
                className='fixed inset-0 bg-black bg-opacity-60 transition-opacity'
                onClick={() => setShowModal(false)}
              ></div>
              <div className='relative bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 z-10 transform transition-all'>
                <div className='max-h-[85vh] overflow-y-auto'>
                  {/* Modal Header */}
                  <div className='bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 rounded-t-xl'>
                    <div className='flex items-center justify-between'>
                      <h3 className='text-xl font-semibold text-white'>
                        Vendor Application Details
                      </h3>
                      <button
                        onClick={() => setShowModal(false)}
                        className='text-white hover:text-gray-200 transition-colors'
                      >
                        <svg
                          className='w-6 h-6'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M6 18L18 6M6 6l12 12'
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Modal Content */}
                  <div className='p-6'>
                    {/* Status Badge */}
                    <div className='mb-6 flex items-center justify-between'>
                      <div className='flex items-center space-x-3'>
                        <span
                          className={`${getStatusBadge(
                            selectedVendor.status
                          )} text-sm font-medium px-3 py-1 rounded-full`}
                        >
                          {selectedVendor.status}
                        </span>
                        <span
                          className={`${getVendorTypeBadge(
                            selectedVendor.vendorType
                          )} text-sm font-medium px-3 py-1 rounded-full`}
                        >
                          {selectedVendor.vendorType}
                        </span>
                      </div>
                      <div className='text-sm text-gray-500'>
                        Applied:{" "}
                        {new Date(selectedVendor.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </div>
                    </div>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
                      {/* Business Information */}
                      <div className='bg-gray-50 rounded-lg p-6'>
                        <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                          <svg
                            className='w-5 h-5 mr-2 text-indigo-600'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'
                            />
                          </svg>
                          Business Information
                        </h4>
                        <div className='space-y-4'>
                          <div>
                            <dt className='text-sm font-medium text-gray-600'>
                              Business Name
                            </dt>
                            <dd className='text-base font-semibold text-gray-900 mt-1'>
                              {selectedVendor.businessName}
                            </dd>
                          </div>
                          <div>
                            <dt className='text-sm font-medium text-gray-600'>
                              Owner Name
                            </dt>
                            <dd className='text-base text-gray-900 mt-1'>
                              {selectedVendor.ownerName}
                            </dd>
                          </div>
                          <div>
                            <dt className='text-sm font-medium text-gray-600'>
                              Email Address
                            </dt>
                            <dd className='text-base text-blue-600 mt-1'>
                              {selectedVendor.email}
                            </dd>
                          </div>
                          <div>
                            <dt className='text-sm font-medium text-gray-600'>
                              Contact Numbers
                            </dt>
                            <dd className='text-base text-gray-900 mt-1'>
                              {selectedVendor.contactNumbers.join(", ")}
                            </dd>
                          </div>
                          <div>
                            <dt className='text-sm font-medium text-gray-600'>
                              Business Address
                            </dt>
                            <dd className='text-base text-gray-900 mt-1 leading-relaxed'>
                              {selectedVendor.businessAddress}
                            </dd>
                          </div>
                          <div>
                            <dt className='text-sm font-medium text-gray-600'>
                              Commission Rate
                            </dt>
                            <dd className='text-lg font-bold text-green-600 mt-1'>
                              {selectedVendor.commissionRate}%
                            </dd>
                          </div>
                        </div>
                      </div>

                      {/* Legal & Financial Information */}
                      <div className='space-y-6'>
                        {/* Legal Information */}
                        <div className='bg-blue-50 rounded-lg p-6'>
                          <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                            <svg
                              className='w-5 h-5 mr-2 text-blue-600'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
                              />
                            </svg>
                            Legal Information
                          </h4>
                          <div className='space-y-3'>
                            <div>
                              <dt className='text-sm font-medium text-gray-600'>
                                GST Number
                              </dt>
                              <dd className='text-sm font-mono text-gray-900 mt-1 bg-white px-3 py-2 rounded border'>
                                {selectedVendor.gstNumber}
                              </dd>
                            </div>
                            <div>
                              <dt className='text-sm font-medium text-gray-600'>
                                PAN Number
                              </dt>
                              <dd className='text-sm font-mono text-gray-900 mt-1 bg-white px-3 py-2 rounded border'>
                                {selectedVendor.panNumber}
                              </dd>
                            </div>
                            <div>
                              <dt className='text-sm font-medium text-gray-600'>
                                Aadhaar Number
                              </dt>
                              <dd className='text-sm font-mono text-gray-900 mt-1 bg-white px-3 py-2 rounded border'>
                                {selectedVendor.aadhaarNumber}
                              </dd>
                            </div>
                            <div>
                              <dt className='text-sm font-medium text-gray-600'>
                                Phone Number
                              </dt>
                              <dd className='text-base text-gray-900 mt-1'>
                                {selectedVendor.user.phoneNumber}
                              </dd>
                            </div>
                          </div>
                        </div>

                        {/* Bank Details */}
                        {selectedVendor.bankDetails && (
                          <div className='bg-green-50 rounded-lg p-6'>
                            <h4 className='text-lg font-semibold text-gray-900 mb-4 flex items-center'>
                              <svg
                                className='w-5 h-5 mr-2 text-green-600'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z'
                                />
                              </svg>
                              Bank Details
                            </h4>
                            <div className='space-y-3'>
                              <div>
                                <dt className='text-sm font-medium text-gray-600'>
                                  Account Holder Name
                                </dt>
                                <dd className='text-base font-medium text-gray-900 mt-1'>
                                  {selectedVendor.bankDetails.accountHolderName}
                                </dd>
                              </div>
                              <div>
                                <dt className='text-sm font-medium text-gray-600'>
                                  Account Number
                                </dt>
                                <dd className='text-sm font-mono text-gray-900 mt-1 bg-white px-3 py-2 rounded border'>
                                  {selectedVendor.bankDetails.accountNumber}
                                </dd>
                              </div>
                              <div>
                                <dt className='text-sm font-medium text-gray-600'>
                                  Bank Name
                                </dt>
                                <dd className='text-base text-gray-900 mt-1'>
                                  {selectedVendor.bankDetails.bankName}
                                </dd>
                              </div>
                              <div>
                                <dt className='text-sm font-medium text-gray-600'>
                                  IFSC Code
                                </dt>
                                <dd className='text-sm font-mono text-gray-900 mt-1 bg-white px-3 py-2 rounded border'>
                                  {selectedVendor.bankDetails.ifscCode}
                                </dd>
                              </div>
                              <div>
                                <dt className='text-sm font-medium text-gray-600'>
                                  Branch
                                </dt>
                                <dd className='text-base text-gray-900 mt-1'>
                                  {selectedVendor.bankDetails.branchName}
                                </dd>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className='bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200'>
                    <div className='flex flex-col sm:flex-row-reverse gap-3'>
                      {selectedVendor.status === "PENDING" && (
                        <>
                          <button
                            type='button'
                            onClick={() =>
                              handleVendorAction(selectedVendor.id, "approve")
                            }
                            disabled={actionLoading === selectedVendor.id}
                            className='inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors'
                          >
                            {actionLoading === selectedVendor.id ? (
                              <div className='flex items-center'>
                                <svg
                                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                >
                                  <circle
                                    className='opacity-25'
                                    cx='12'
                                    cy='12'
                                    r='10'
                                    stroke='currentColor'
                                    strokeWidth='4'
                                  ></circle>
                                  <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                  ></path>
                                </svg>
                                Processing...
                              </div>
                            ) : (
                              "Approve"
                            )}
                          </button>
                          <button
                            type='button'
                            onClick={() =>
                              handleVendorAction(selectedVendor.id, "reject")
                            }
                            disabled={actionLoading === selectedVendor.id}
                            className='inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 transition-colors'
                          >
                            {actionLoading === selectedVendor.id ? (
                              <div className='flex items-center'>
                                <svg
                                  className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                  fill='none'
                                  viewBox='0 0 24 24'
                                >
                                  <circle
                                    className='opacity-25'
                                    cx='12'
                                    cy='12'
                                    r='10'
                                    stroke='currentColor'
                                    strokeWidth='4'
                                  ></circle>
                                  <path
                                    className='opacity-75'
                                    fill='currentColor'
                                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                  ></path>
                                </svg>
                                Processing...
                              </div>
                            ) : (
                              "Reject"
                            )}
                          </button>
                        </>
                      )}
                      {selectedVendor.status === "APPROVED" && (
                        <button
                          type='button'
                          onClick={() =>
                            handleVendorAction(selectedVendor.id, "suspend")
                          }
                          disabled={actionLoading === selectedVendor.id}
                          className='inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-yellow-600 text-base font-medium text-white hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 transition-colors'
                        >
                          {actionLoading === selectedVendor.id ? (
                            <div className='flex items-center'>
                              <svg
                                className='animate-spin -ml-1 mr-2 h-4 w-4 text-white'
                                fill='none'
                                viewBox='0 0 24 24'
                              >
                                <circle
                                  className='opacity-25'
                                  cx='12'
                                  cy='12'
                                  r='10'
                                  stroke='currentColor'
                                  strokeWidth='4'
                                ></circle>
                                <path
                                  className='opacity-75'
                                  fill='currentColor'
                                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                ></path>
                              </svg>
                              Processing...
                            </div>
                          ) : (
                            "Suspend"
                          )}
                        </button>
                      )}
                      <button
                        type='button'
                        onClick={() => setShowModal(false)}
                        className='inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors'
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
