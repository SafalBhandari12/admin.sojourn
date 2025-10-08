"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AdminAPI } from "@/lib/auth";
import { useToast } from "@/contexts/ToastContext";

export default function ProfilePage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const { showSuccess, showError } = useToast();
  const [profileForm, setProfileForm] = useState({
    fullName: "",
    email: "",
    permissions: [] as string[],
  });

  const availablePermissions = [
    "MANAGE_VENDORS",
    "MANAGE_USERS",
    "MANAGE_BOOKINGS",
    "MANAGE_REPORTS",
  ];

  const permissionDescriptions = {
    MANAGE_VENDORS: "Approve, reject, and suspend vendor applications",
    MANAGE_USERS: "Manage user accounts and assign admin roles",
    MANAGE_BOOKINGS: "View and manage all platform bookings",
    MANAGE_REPORTS: "Access analytics and generate reports",
  };

  useEffect(() => {
    // In a real app, you would fetch the current admin profile
    // For now, we'll use placeholder data based on JWT token
    if (user) {
      // This would come from the decoded JWT or a separate API call
      setProfileForm({
        fullName: "Admin User", // Placeholder
        email: "admin@sojourn.com", // Placeholder
        permissions: ["MANAGE_VENDORS", "MANAGE_USERS"], // Placeholder
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await AdminAPI.updateAdminProfile(profileForm);

      if (response.success) {
        showSuccess("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      showError("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setProfileForm({
        ...profileForm,
        permissions: [...profileForm.permissions, permission],
      });
    } else {
      setProfileForm({
        ...profileForm,
        permissions: profileForm.permissions.filter((p) => p !== permission),
      });
    }
  };

  return (
    <div className='px-4 py-6 sm:px-0'>
      <div className='sm:flex sm:items-center'>
        <div className='sm:flex-auto'>
          <h1 className='text-2xl font-semibold text-gray-900'>
            Admin Profile
          </h1>
          <p className='mt-2 text-sm text-gray-700'>
            Manage your admin profile information and permissions.
          </p>
        </div>
      </div>

      <div className='mt-8'>
        <div className='md:grid md:grid-cols-3 md:gap-6'>
          <div className='md:col-span-1'>
            <div className='px-4 sm:px-0'>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>
                Profile Information
              </h3>
              <p className='mt-1 text-sm text-gray-600'>
                Update your personal information and administrative permissions.
              </p>
            </div>
          </div>
          <div className='mt-5 md:mt-0 md:col-span-2'>
            <form onSubmit={handleSubmit}>
              <div className='shadow sm:rounded-md sm:overflow-hidden'>
                <div className='px-4 py-5 bg-white space-y-6 sm:p-6'>
                  {/* User Info Display */}
                  <div className='grid grid-cols-1 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Phone Number (Read-only)
                      </label>
                      <input
                        type='text'
                        value={user?.phoneNumber || ""}
                        disabled
                        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        User ID (Read-only)
                      </label>
                      <input
                        type='text'
                        value={user?.id || ""}
                        disabled
                        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700'>
                        Role (Read-only)
                      </label>
                      <input
                        type='text'
                        value={user?.role || ""}
                        disabled
                        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                    </div>
                  </div>

                  <hr />

                  {/* Editable Admin Profile */}
                  <div className='grid grid-cols-1 gap-6'>
                    <div>
                      <label
                        htmlFor='fullName'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Full Name *
                      </label>
                      <input
                        type='text'
                        id='fullName'
                        value={profileForm.fullName}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            fullName: e.target.value,
                          })
                        }
                        required
                        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                    </div>

                    <div>
                      <label
                        htmlFor='email'
                        className='block text-sm font-medium text-gray-700'
                      >
                        Email Address *
                      </label>
                      <input
                        type='email'
                        id='email'
                        value={profileForm.email}
                        onChange={(e) =>
                          setProfileForm({
                            ...profileForm,
                            email: e.target.value,
                          })
                        }
                        required
                        className='mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm'
                      />
                    </div>
                  </div>

                  {/* Permissions */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-3'>
                      Administrative Permissions
                    </label>
                    <div className='space-y-3'>
                      {availablePermissions.map((permission) => (
                        <div key={permission} className='flex items-start'>
                          <div className='flex items-center h-5'>
                            <input
                              id={permission}
                              type='checkbox'
                              checked={profileForm.permissions.includes(
                                permission
                              )}
                              onChange={(e) =>
                                handlePermissionChange(
                                  permission,
                                  e.target.checked
                                )
                              }
                              className='focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded'
                            />
                          </div>
                          <div className='ml-3 text-sm'>
                            <label
                              htmlFor={permission}
                              className='font-medium text-gray-700'
                            >
                              {permission}
                            </label>
                            <p className='text-gray-500'>
                              {
                                permissionDescriptions[
                                  permission as keyof typeof permissionDescriptions
                                ]
                              }
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Current Permissions Display */}
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Current Permissions
                    </label>
                    <div className='flex flex-wrap gap-2'>
                      {profileForm.permissions.length > 0 ? (
                        profileForm.permissions.map((permission) => (
                          <span
                            key={permission}
                            className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800'
                          >
                            {permission}
                          </span>
                        ))
                      ) : (
                        <span className='text-sm text-gray-500'>
                          No permissions assigned
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className='px-4 py-3 bg-gray-50 text-right sm:px-6'>
                  <button
                    type='submit'
                    disabled={
                      isSaving || !profileForm.fullName || !profileForm.email
                    }
                    className='inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Account Security Section */}
      <div className='mt-10 sm:mt-12'>
        <div className='md:grid md:grid-cols-3 md:gap-6'>
          <div className='md:col-span-1'>
            <div className='px-4 sm:px-0'>
              <h3 className='text-lg font-medium leading-6 text-gray-900'>
                Account Security
              </h3>
              <p className='mt-1 text-sm text-gray-600'>
                Information about your account security and access.
              </p>
            </div>
          </div>
          <div className='mt-5 md:mt-0 md:col-span-2'>
            <div className='shadow sm:rounded-md sm:overflow-hidden'>
              <div className='px-4 py-5 bg-white space-y-6 sm:p-6'>
                <div className='grid grid-cols-1 gap-6'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Account Status
                    </label>
                    <div className='mt-1'>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user?.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {user?.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className='block text-sm font-medium text-gray-700'>
                      Authentication Method
                    </label>
                    <p className='mt-1 text-sm text-gray-500'>
                      Phone number with OTP verification
                    </p>
                  </div>

                  <div className='bg-yellow-50 border border-yellow-200 rounded-md p-4'>
                    <div className='flex'>
                      <div className='flex-shrink-0'>
                        <svg
                          className='h-5 w-5 text-yellow-400'
                          fill='currentColor'
                          viewBox='0 0 20 20'
                        >
                          <path
                            fillRule='evenodd'
                            d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                            clipRule='evenodd'
                          />
                        </svg>
                      </div>
                      <div className='ml-3'>
                        <h3 className='text-sm font-medium text-yellow-800'>
                          Security Notice
                        </h3>
                        <div className='mt-2 text-sm text-yellow-700'>
                          <p>
                            Your admin account has elevated privileges. Keep
                            your phone number secure and only access the admin
                            panel from trusted devices.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
