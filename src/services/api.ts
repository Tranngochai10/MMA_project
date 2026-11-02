import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { endpoints } from "./endpoints";
import { mapBrand, mapVoucher, mapWalletVoucher } from "./apiMappers";
import {
  ApiUser,
  AuthResponse,
  BrandDto,
  CategoryDto,
  FavoriteToggleDto,
  ManagerStatsDto,
  NotificationDto,
  OrderDto,
  PurchaseDto,
  VoucherDto,
  VoucherPageDto,
  WalletVoucherDto,
} from "./apiTypes";
export { mapBrand, mapUser, mapVoucher, mapWalletVoucher } from "./apiMappers";

const baseURL = process.env.EXPO_PUBLIC_API_URL?.trim().replace(/\/+$/, "");
const DEFAULT_TIMEOUT_MS = 15000;

export class ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
  constructor(
    message: string,
    options: { status?: number; code?: string; details?: unknown } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.code = options.code;
    this.details = options.details;
  }
}

export const http = axios.create({
  baseURL,
  headers: { Accept: "application/json", "Content-Type": "application/json" },
  timeout: DEFAULT_TIMEOUT_MS,
});

let authToken: string | null = null;
let unauthorizedHandler: (() => void) | undefined;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};
export const setUnauthorizedHandler = (handler?: () => void) => {
  unauthorizedHandler = handler;
};

http.interceptors.request.use((config) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  return config;
});

http.interceptors.response.use(
  (response) => {
    const body: unknown = response.data;
    if (isRecord(body) && body.success === false) {
      return Promise.reject(
        new ApiError(stringValue(body.message) || "Yêu cầu không thành công.", {
          status: response.status,
          details: body.details,
        }),
      );
    }
    return response;
  },
  (error: AxiosError<{ message?: string; details?: unknown }>) => {
    const status = error.response?.status;
    if (status === 401) {
      setAuthToken(null);
      unauthorizedHandler?.();
    }
    let message = error.response?.data?.message;
    if (!message) {
      if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT")
        message = "Máy chủ phản hồi quá lâu. Vui lòng thử lại.";
      else if (!error.response)
        message =
          "Không thể kết nối tới máy chủ. Kiểm tra mạng và địa chỉ API.";
      else if (status === 403)
        message = "Bạn không có quyền thực hiện thao tác này.";
      else if (status === 404) message = "Không tìm thấy dữ liệu yêu cầu.";
      else if (status === 422) message = "Dữ liệu gửi lên không hợp lệ.";
      else if (status && status >= 500)
        message = "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
      else message = error.message || "Yêu cầu không thành công.";
    }
    return Promise.reject(
      new ApiError(message, {
        status,
        code: error.code,
        details: error.response?.data?.details,
      }),
    );
  },
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
function stringValue(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}
function ensureConfigured() {
  if (!baseURL)
    throw new ApiError("Chưa cấu hình EXPO_PUBLIC_API_URL trong file .env.");
  try {
    const url = new URL(baseURL);
    if (!/^https?:$/.test(url.protocol)) throw new Error();
  } catch {
    throw new ApiError(
      "EXPO_PUBLIC_API_URL phải là địa chỉ HTTP hoặc HTTPS hợp lệ.",
    );
  }
}

type ApiEnvelope<T> = { success: true; message: string; data: T };
async function requestData<T>(config: AxiosRequestConfig): Promise<T> {
  ensureConfigured();
  const { data } = await http.request<ApiEnvelope<T>>(config);
  if (!isRecord(data) || data.success !== true || !("data" in data)) {
    throw new ApiError("Phản hồi từ máy chủ không đúng định dạng.", {
      status: 502,
      details: data,
    });
  }
  return data.data as T;
}

export const api = {
  login: (email: string, password: string) =>
    requestData<AuthResponse>({
      method: "POST",
      url: endpoints.auth.login,
      data: { email, password },
    }),
  register: (
    full_name: string,
    email: string,
    password: string,
    phone?: string,
  ) =>
    requestData<AuthResponse>({
      method: "POST",
      url: endpoints.auth.register,
      data: { full_name, email, password, phone },
    }),
  me: () =>
    requestData<{ user: ApiUser }>({ method: "GET", url: endpoints.auth.me }),
  updateMe: async (data: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  }) =>
    requestData<{ user: ApiUser }>({
      method: "PUT",
      url: endpoints.auth.me,
      data,
    }),
  forgotPassword: (email: string) =>
    requestData<{ email: string; mockOtp?: string; expiresIn?: string }>({
      method: "POST",
      url: endpoints.auth.forgotPassword,
      data: { email },
    }),
  resetPassword: (email: string, otp: string, new_password: string) =>
    requestData<{ message?: string }>({
      method: "POST",
      url: endpoints.auth.resetPassword,
      data: { email, otp, new_password },
    }),
  logout: () =>
    requestData<{ logged_out: boolean }>({
      method: "POST",
      url: endpoints.auth.logout,
    }),
  changePassword: (current_password: string, new_password: string) =>
    requestData<{ success: boolean; message: string }>({
      method: "POST",
      url: endpoints.auth.changePassword,
      data: { current_password, new_password },
    }),
  categories: () =>
    requestData<CategoryDto[]>({ method: "GET", url: endpoints.categories }),
  brands: async () =>
    (
      await requestData<BrandDto[]>({ method: "GET", url: endpoints.brands })
    ).map(mapBrand),
  brand: async (id: string) =>
    mapBrand(
      await requestData<BrandDto>({ method: "GET", url: endpoints.brand(id) }),
    ),
  voucherPage: async (params?: Record<string, string | number | undefined>) => {
    const result = await requestData<VoucherPageDto>({
      method: "GET",
      url: endpoints.vouchers,
      params,
    });
    return { ...result, vouchers: result.vouchers.map(mapVoucher) };
  },
  vouchers: async (params?: Record<string, string | number | undefined>) =>
    (await api.voucherPage(params)).vouchers,
  voucher: async (id: string) =>
    mapVoucher(
      await requestData<VoucherDto>({
        method: "GET",
        url: endpoints.voucher(id),
      }),
    ),
  wallet: async (status = "all") => {
    const normalizedStatus = status.toLowerCase();
    const backendStatus =
      normalizedStatus === "redeemed" ? "used" : normalizedStatus;
    return (
      await requestData<WalletVoucherDto[]>({
        method: "GET",
        url: endpoints.wallet,
        params: { status: backendStatus },
      })
    ).map(mapWalletVoucher);
  },
  favoriteBrands: async () =>
    (
      await requestData<BrandDto[]>({
        method: "GET",
        url: endpoints.favorites.brands,
      })
    ).map(mapBrand),
  favoriteVouchers: async () =>
    (
      await requestData<VoucherDto[]>({
        method: "GET",
        url: endpoints.favorites.vouchers,
      })
    ).map(mapVoucher),
  toggleBrandFavorite: (id: string) =>
    requestData<FavoriteToggleDto>({
      method: "POST",
      url: endpoints.favorites.brandToggle(id),
    }),
  toggleVoucherFavorite: (id: string) =>
    requestData<FavoriteToggleDto>({
      method: "POST",
      url: endpoints.favorites.voucherToggle(id),
    }),
  buyVoucher: (id: string, paymentMethod: string) =>
    requestData<PurchaseDto>({
      method: "POST",
      url: endpoints.buyVoucher(id),
      data: { paymentMethod },
    }),
  walletVoucher: async (id: string) =>
    (
      await requestData<WalletVoucherDto[]>({
        method: "GET",
        url: endpoints.wallet,
        params: { status: "all" },
      })
    )
      .map(mapWalletVoucher)
      .find((item) => item.id === id),
  useVoucher: (id: string) =>
    requestData<WalletVoucherDto>({
      method: "PATCH",
      url: endpoints.useVoucher(id),
    }),
  orders: (params?: Record<string, string | number | undefined>) =>
    requestData<OrderDto[]>({ method: "GET", url: endpoints.orders, params }),
  order: (id: string) =>
    requestData<OrderDto>({ method: "GET", url: endpoints.order(id) }),
  notifications: async () =>
    requestData<{ notifications: NotificationDto[]; unreadCount: number }>({
      method: "GET",
      url: endpoints.notifications,
    }),
  markNotificationRead: (id: string) =>
    requestData<NotificationDto>({
      method: "PATCH",
      url: endpoints.markNotificationRead(id),
    }),
  markAllNotificationsRead: () =>
    requestData<{ success: boolean }>({
      method: "PATCH",
      url: endpoints.markAllNotificationsRead,
    }),
  managerDashboard: (brandId?: string) =>
    requestData<ManagerStatsDto>({
      method: "GET",
      url: endpoints.manager.dashboard,
      params: brandId ? { brandId } : undefined,
    }),
  managerBrands: async () =>
    (
      await requestData<BrandDto[]>({
        method: "GET",
        url: endpoints.manager.brands,
      })
    ).map(mapBrand),
  createManagerBrand: async (data: { name: string; code: string; categoryId?: string; rating: number; logo_url: string; cover_image_url: string; description: string }) =>
    mapBrand(await requestData<BrandDto>({ method: "POST", url: endpoints.manager.brands, data })),
  managerVouchers: async (
    params?: Record<string, string | number | undefined>,
  ) => {
    const page = await requestData<{
      vouchers: VoucherDto[];
      total: number;
      page: number;
      limit: number;
    }>({ method: "GET", url: endpoints.manager.vouchers, params });
    return { ...page, vouchers: page.vouchers.map(mapVoucher) };
  },
  createManagerVoucher: async (data: Record<string, unknown>) =>
    mapVoucher(
      await requestData<VoucherDto>({
        method: "POST",
        url: endpoints.manager.vouchers,
        data,
      }),
    ),
  updateManagerVoucher: async (id: string, data: Record<string, unknown>) =>
    mapVoucher(
      await requestData<VoucherDto>({
        method: "PUT",
        url: endpoints.manager.voucher(id),
        data,
      }),
    ),
  updateManagerVoucherStatus: async (id: string, status: string) =>
    mapVoucher(
      await requestData<VoucherDto>({
        method: "PATCH",
        url: endpoints.manager.voucherStatus(id),
        data: { status },
      }),
    ),
  managerOrders: (params?: Record<string, string | number | undefined>) =>
    requestData<{
      orders: OrderDto[];
      total: number;
      page: number;
      limit: number;
    }>({ method: "GET", url: endpoints.manager.orders, params }),
  managerRedemptions: (params?: Record<string, string | number | undefined>) =>
    requestData<{
      redemptions: Record<string, unknown>[];
      total: number;
      page: number;
      limit: number;
    }>({ method: "GET", url: endpoints.manager.redemptions, params }),
  verifyRedemption: (voucherCode: string) =>
    requestData<Record<string, unknown>>({
      method: "POST",
      url: endpoints.manager.verifyRedemption,
      data: { voucherCode },
    }),
  redeemAtCounter: (voucherCode: string) =>
    requestData<Record<string, unknown>>({
      method: "POST",
      url: endpoints.manager.redeem,
      data: { voucherCode },
    }),
};
