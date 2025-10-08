const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

if (!BACKEND_URL) {
  throw new Error(
    "NEXT_PUBLIC_BACKEND_URL is not defined in environment variables"
  );
}

export interface SendOTPRequest {
  phoneNumber: string;
}

export interface SendOTPResponse {
  success: boolean;
  message: string;
  data: {
    verificationId: string;
    timeout: string;
  };
}

export interface VerifyOTPRequest {
  phoneNumber: string;
  verificationId: string;
  code: string;
}

export interface User {
  id: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: User;
  };
}

export class AuthAPI {
  static async sendOTP(phoneNumber: string): Promise<SendOTPResponse> {
    const response = await fetch(`${BACKEND_URL}/auth/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ phoneNumber }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send OTP: ${response.statusText}`);
    }

    return response.json();
  }

  static async verifyOTP(
    phoneNumber: string,
    verificationId: string,
    code: string
  ): Promise<VerifyOTPResponse> {
    const response = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phoneNumber,
        verificationId,
        code,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to verify OTP: ${response.statusText}`);
    }

    return response.json();
  }
}

// Admin API Types
export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  ownerName: string;
  contactNumbers: string[];
  email: string;
  businessAddress: string;
  googleMapsLink?: string;
  gstNumber: string;
  panNumber: string;
  aadhaarNumber: string;
  vendorType: "HOTEL" | "ADVENTURE" | "TRANSPORT" | "MARKET";
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";
  commissionRate: number;
  createdAt: string;
  updatedAt: string;
  user: {
    phoneNumber: string;
    createdAt: string;
  };
  bankDetails?: {
    id: string;
    accountHolderName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branchName: string;
  };
}

export interface UserWithProfiles {
  id: string;
  phoneNumber: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  vendorProfile?: {
    businessName: string;
    status: string;
    vendorType: string;
  };
  adminProfile?: {
    fullName: string;
    email: string;
    permissions: string[];
  };
}

export interface AdminProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    vendors?: T[];
    users?: T[];
    pagination: {
      total: number;
      page: number;
      pages: number;
    };
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// Admin API Class
export class AdminAPI {
  private static getAuthHeaders() {
    const token = TokenStorage.getAccessToken();
    console.log("Getting auth headers, token exists:", !!token);
    if (token) {
      console.log("Token preview:", token.substring(0, 20) + "...");
    }
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }

  // Helper method to handle API responses with consistent error handling
  private static async handleApiResponse(response: Response): Promise<any> {
    console.log("API Response status:", response.status);
    console.log("API Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log("API Error response:", errorText);

      // Create specific error messages for authentication issues
      if (response.status === 401) {
        throw new Error(
          `Authentication failed: 401 Unauthorized - Token expired or invalid`
        );
      } else if (response.status === 403) {
        throw new Error(
          `Access forbidden: 403 Forbidden - Insufficient permissions`
        );
      }

      throw new Error(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    return response.json();
  }

  // Vendor Management
  static async getVendors(params?: {
    status?: string;
    vendorType?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Vendor>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append("status", params.status);
    if (params?.vendorType)
      searchParams.append("vendorType", params.vendorType);
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const url = `${BACKEND_URL}/auth/admin/vendors?${searchParams}`;
    console.log("Making API request to:", url);
    console.log("With headers:", this.getAuthHeaders());

    const response = await fetch(url, {
      headers: this.getAuthHeaders(),
    });

    return this.handleApiResponse(response);
  }

  static async approveVendor(vendorId: string): Promise<ApiResponse<Vendor>> {
    const response = await fetch(
      `${BACKEND_URL}/auth/admin/vendor/${vendorId}/approve`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleApiResponse(response);
  }

  static async rejectVendor(vendorId: string): Promise<ApiResponse<Vendor>> {
    const response = await fetch(
      `${BACKEND_URL}/auth/admin/vendor/${vendorId}/reject`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleApiResponse(response);
  }

  static async suspendVendor(vendorId: string): Promise<ApiResponse<Vendor>> {
    const response = await fetch(
      `${BACKEND_URL}/auth/admin/vendor/${vendorId}/suspend`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
      }
    );

    return this.handleApiResponse(response);
  }

  // User Management
  static async getUsers(params?: {
    role?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<UserWithProfiles>> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append("role", params.role);
    if (params?.isActive !== undefined)
      searchParams.append("isActive", params.isActive.toString());
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const response = await fetch(
      `${BACKEND_URL}/auth/admin/users?${searchParams}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  }

  static async assignAdminRole(
    userId: string,
    data: {
      fullName: string;
      email: string;
      permissions: string[];
    }
  ): Promise<
    ApiResponse<{ user: UserWithProfiles; adminProfile: AdminProfile }>
  > {
    const response = await fetch(
      `${BACKEND_URL}/auth/admin/user/${userId}/assign-admin`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to assign admin role: ${response.statusText}`);
    }

    return response.json();
  }

  static async revokeAdminRole(
    userId: string
  ): Promise<ApiResponse<UserWithProfiles>> {
    const response = await fetch(
      `${BACKEND_URL}/auth/admin/user/${userId}/revoke-admin`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to revoke admin role: ${response.statusText}`);
    }

    return response.json();
  }

  static async toggleUserStatus(
    userId: string,
    isActive: boolean
  ): Promise<ApiResponse<UserWithProfiles>> {
    const response = await fetch(
      `${BACKEND_URL}/auth/admin/user/${userId}/toggle-status`,
      {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ isActive }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to toggle user status: ${response.statusText}`);
    }

    return response.json();
  }

  // Admin Profile Management
  static async updateAdminProfile(data: {
    fullName: string;
    email: string;
    permissions: string[];
  }): Promise<ApiResponse<AdminProfile>> {
    const response = await fetch(`${BACKEND_URL}/auth/admin/profile`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update admin profile: ${response.statusText}`);
    }

    return response.json();
  }
}

// Utility functions for token management
export const TokenStorage = {
  setTokens: (accessToken: string, refreshToken: string) => {
    console.log("TokenStorage: Setting tokens", {
      accessToken: accessToken.substring(0, 20) + "...",
      refreshToken: refreshToken.substring(0, 20) + "...",
    });
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
  },

  getAccessToken: (): string | null => {
    const token = localStorage.getItem("accessToken");
    console.log(
      "TokenStorage: Getting access token",
      token ? "Found" : "Not found"
    );
    return token;
  },

  getRefreshToken: (): string | null => {
    const token = localStorage.getItem("refreshToken");
    console.log(
      "TokenStorage: Getting refresh token",
      token ? "Found" : "Not found"
    );
    return token;
  },

  clearTokens: () => {
    console.log("TokenStorage: Clearing tokens");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },
};
