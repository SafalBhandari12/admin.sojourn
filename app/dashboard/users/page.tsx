"use client";

import { useState, useEffect } from "react";
import { AdminAPI, UserWithProfiles } from "@/lib/auth";
import { useToast } from "@/contexts/ToastContext";

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithProfiles[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: "",
    isActive: undefined as boolean | undefined,
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 0,
  });
  const [selectedUser, setSelectedUser] = useState<UserWithProfiles | null>(
    null
  );
  const [showAssignAdminModal, setShowAssignAdminModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: "revoke-admin" | "toggle-status";
    userId: string;
    newStatus?: boolean;
  } | null>(null);
  const [adminForm, setAdminForm] = useState({
    fullName: "",
    email: "",
    permissions: [] as string[],
  });
  const { showSuccess, showError } = useToast();

  const availablePermissions = [
    "MANAGE_VENDORS",
    "MANAGE_USERS",
    "MANAGE_BOOKINGS",
    "MANAGE_REPORTS",
  ];

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await AdminAPI.getUsers(filters);
      setUsers(response.data.users || []);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      showError("Failed to load users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handleAssignAdmin = async () => {
    if (!selectedUser) return;

    try {
      setActionLoading(selectedUser.id);
      const response = await AdminAPI.assignAdminRole(
        selectedUser.id,
        adminForm
      );

      if (response.success) {
        fetchUsers();
        setShowAssignAdminModal(false);
        setAdminForm({ fullName: "", email: "", permissions: [] });
        setSelectedUser(null);
        showSuccess("Admin role assigned successfully!");
      }
    } catch (error) {
      console.error("Failed to assign admin role:", error);
      showError("Failed to assign admin role. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeAdmin = async (userId: string) => {
    try {
      setActionLoading(userId);
      const response = await AdminAPI.revokeAdminRole(userId);

      if (response.success) {
        fetchUsers();
        setShowConfirmModal(false);
        setConfirmAction(null);
        showSuccess("Admin role revoked successfully!");
      }
    } catch (error) {
      console.error("Failed to revoke admin role:", error);
      showError("Failed to revoke admin role. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleUserStatus = async (userId: string, newStatus: boolean) => {
    try {
      setActionLoading(userId);
      const response = await AdminAPI.toggleUserStatus(userId, newStatus);

      if (response.success) {
        fetchUsers();
        setShowConfirmModal(false);
        setConfirmAction(null);
        showSuccess(
          `User ${newStatus ? "activated" : "deactivated"} successfully!`
        );
      }
    } catch (error) {
      console.error("Failed to toggle user status:", error);
      showError("Failed to update user status. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      CUSTOMER: "bg-blue-100 text-blue-800",
      VENDOR: "bg-purple-100 text-purple-800",
      ADMIN: "bg-red-100 text-red-800",
    };
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      styles[role as keyof typeof styles] || styles.CUSTOMER
    }`;
  };

  const getStatusBadge = (isActive: boolean) => {
    return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
      isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
    }`;
  };

  if (isLoading) {
    return (
      <div className='px-4 py-6 sm:px-0'>
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

  return (
    <div className='px-4 py-6 sm:px-0'>
      <div className='sm:flex sm:items-center'>
        <div className='sm:flex-auto'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            User Management
          </h1>
          <p className='mt-2 text-sm text-gray-700'>
            Manage user accounts, roles, and permissions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className='mt-6 bg-white shadow rounded-lg p-4'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) =>
                setFilters({ ...filters, role: e.target.value, page: 1 })
              }
              className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            >
              <option value=''>All Roles</option>
              <option value='CUSTOMER'>Customer</option>
              <option value='VENDOR'>Vendor</option>
              <option value='ADMIN'>Admin</option>
            </select>
          </div>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-1'>
              Status
            </label>
            <select
              value={
                filters.isActive === undefined
                  ? ""
                  : filters.isActive.toString()
              }
              onChange={(e) =>
                setFilters({
                  ...filters,
                  isActive:
                    e.target.value === ""
                      ? undefined
                      : e.target.value === "true",
                  page: 1,
                })
              }
              className='block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
            >
              <option value=''>All Statuses</option>
              <option value='true'>Active</option>
              <option value='false'>Inactive</option>
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

      {/* Users Table */}
      <div className='mt-8 flex flex-col'>
        <div className='-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8'>
          <div className='inline-block min-w-full py-2 align-middle md:px-6 lg:px-8'>
            <div className='overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg'>
              <table className='min-w-full divide-y divide-gray-300'>
                <thead className='bg-gray-50'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      User
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Role
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Status
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Profile Info
                    </th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'>
                      Joined
                    </th>
                    <th className='relative px-6 py-3'>
                      <span className='sr-only'>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className='bg-white divide-y divide-gray-200'>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900'>
                          {user.phoneNumber}
                        </div>
                        <div className='text-sm text-gray-500'>
                          ID: {user.id}
                        </div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className={getRoleBadge(user.role)}>
                          {user.role}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className={getStatusBadge(user.isActive)}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {user.vendorProfile && (
                          <div>
                            <div className='font-medium'>
                              {user.vendorProfile.businessName}
                            </div>
                            <div className='text-xs'>
                              {user.vendorProfile.vendorType} -{" "}
                              {user.vendorProfile.status}
                            </div>
                          </div>
                        )}
                        {user.adminProfile && (
                          <div>
                            <div className='font-medium'>
                              {user.adminProfile.fullName}
                            </div>
                            <div className='text-xs'>
                              {user.adminProfile.email}
                            </div>
                          </div>
                        )}
                        {!user.vendorProfile && !user.adminProfile && (
                          <span>-</span>
                        )}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex space-x-2'>
                          {user.role !== "ADMIN" && (
                            <button
                              onClick={() => {
                                setSelectedUser(user);
                                setShowAssignAdminModal(true);
                                setAdminForm({
                                  fullName: user.adminProfile?.fullName || "",
                                  email: user.adminProfile?.email || "",
                                  permissions:
                                    user.adminProfile?.permissions || [],
                                });
                              }}
                              className='text-indigo-600 hover:text-indigo-900'
                            >
                              Make Admin
                            </button>
                          )}
                          {user.role === "ADMIN" && (
                            <button
                              onClick={() => {
                                setConfirmAction({
                                  type: "revoke-admin",
                                  userId: user.id,
                                });
                                setShowConfirmModal(true);
                              }}
                              className='text-red-600 hover:text-red-900'
                            >
                              Revoke Admin
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setConfirmAction({
                                type: "toggle-status",
                                userId: user.id,
                                newStatus: !user.isActive,
                              });
                              setShowConfirmModal(true);
                            }}
                            className={
                              user.isActive
                                ? "text-yellow-600 hover:text-yellow-900"
                                : "text-green-600 hover:text-green-900"
                            }
                          >
                            {user.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
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
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page <= 1}
              className='px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Previous
            </button>
            <button
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page >= pagination.pages}
              className='px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Assign Admin Modal */}
      {showAssignAdminModal && selectedUser && (
        <div className='fixed inset-0 z-10 overflow-y-auto'>
          <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
            <div
              className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
              onClick={() => setShowAssignAdminModal(false)}
            ></div>
            <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
              <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                <h3 className='text-lg leading-6 font-medium text-gray-900 mb-4'>
                  Assign Admin Role to {selectedUser.phoneNumber}
                </h3>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Full Name
                    </label>
                    <input
                      type='text'
                      value={adminForm.fullName}
                      onChange={(e) =>
                        setAdminForm({ ...adminForm, fullName: e.target.value })
                      }
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Email
                    </label>
                    <input
                      type='email'
                      value={adminForm.email}
                      onChange={(e) =>
                        setAdminForm({ ...adminForm, email: e.target.value })
                      }
                      className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm'
                      required
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Permissions
                    </label>
                    <div className='space-y-2'>
                      {availablePermissions.map((permission) => (
                        <label key={permission} className='flex items-center'>
                          <input
                            type='checkbox'
                            checked={adminForm.permissions.includes(permission)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAdminForm({
                                  ...adminForm,
                                  permissions: [
                                    ...adminForm.permissions,
                                    permission,
                                  ],
                                });
                              } else {
                                setAdminForm({
                                  ...adminForm,
                                  permissions: adminForm.permissions.filter(
                                    (p) => p !== permission
                                  ),
                                });
                              }
                            }}
                            className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                          />
                          <span className='ml-2 text-sm text-gray-700'>
                            {permission}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
                <button
                  type='button'
                  onClick={handleAssignAdmin}
                  disabled={
                    actionLoading === selectedUser.id ||
                    !adminForm.fullName ||
                    !adminForm.email
                  }
                  className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50'
                >
                  {actionLoading === selectedUser.id
                    ? "Assigning..."
                    : "Assign Admin Role"}
                </button>
                <button
                  type='button'
                  onClick={() => setShowAssignAdminModal(false)}
                  className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && confirmAction && (
        <div className='fixed inset-0 z-10 overflow-y-auto'>
          <div className='flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0'>
            <div
              className='fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity'
              onClick={() => setShowConfirmModal(false)}
            ></div>
            <div className='inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full'>
              <div className='bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4'>
                <h3 className='text-lg leading-6 font-medium text-gray-900'>
                  Confirm Action
                </h3>
                <div className='mt-2'>
                  <p className='text-sm text-gray-500'>
                    {confirmAction.type === "revoke-admin"
                      ? "Are you sure you want to revoke admin privileges from this user? Their role will be changed to CUSTOMER."
                      : `Are you sure you want to ${
                          confirmAction.newStatus ? "activate" : "deactivate"
                        } this user account?`}
                  </p>
                </div>
              </div>
              <div className='bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse'>
                <button
                  type='button'
                  onClick={() => {
                    if (confirmAction.type === "revoke-admin") {
                      handleRevokeAdmin(confirmAction.userId);
                    } else {
                      handleToggleUserStatus(
                        confirmAction.userId,
                        confirmAction.newStatus!
                      );
                    }
                  }}
                  disabled={actionLoading === confirmAction.userId}
                  className='w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50'
                >
                  {actionLoading === confirmAction.userId
                    ? "Processing..."
                    : "Confirm"}
                </button>
                <button
                  type='button'
                  onClick={() => setShowConfirmModal(false)}
                  className='mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm'
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
