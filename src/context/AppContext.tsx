import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  Brand,
  ManagerRedemption,
  ManagerStats,
  NotificationItem,
  Order,
  UserProfile,
  UserRole,
  Voucher,
  VoucherStatus,
  WalletVoucher,
} from '../types';
import { api, mapUser, setAuthToken, setUnauthorizedHandler } from '../services/api';
import { readAuthToken, removeAuthToken, saveAuthToken } from '../services/tokenStorage';

const EMPTY_USER: UserProfile = { id: '', name: '', email: '', phone: '', avatarUrl: '', role: 'USER' };
const EMPTY_STATS: ManagerStats = { activeVouchers: 0, totalOrders: 0, issuedVouchers: 0, simulatedRedemptions: 0, totalRevenue: 0 };

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  isLoggedIn: boolean;
  authReady: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<UserRole>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;

  brands: Brand[];
  vouchers: Voucher[];
  toggleFavoriteBrand: (brandId: string) => void;
  toggleFavoriteVoucher: (voucherId: string) => void;
  getBrandById: (id: string) => Brand | undefined;
  getVoucherById: (id: string) => Voucher | undefined;

  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  createOrder: (voucherId: string, paymentMethod: string) => Promise<{ order: Order; walletVoucher: WalletVoucher }>;

  walletVouchers: WalletVoucher[];
  getWalletVoucherById: (id: string) => WalletVoucher | undefined;
  redeemWalletVoucher: (walletVoucherId: string) => Promise<{ success: boolean; redeemedDate: string }>;

  managerStats: ManagerStats;
  managerRedemptions: ManagerRedemption[];
  createVoucher: (voucherData: Omit<Voucher, 'id' | 'availableQuantity'>) => Voucher;
  updateVoucher: (voucherId: string, updates: Partial<Voucher>) => void;
  updateVoucherStatus: (voucherId: string, status: VoucherStatus) => void;

  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>('USER');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(EMPTY_USER);
  const [authReady, setAuthReady] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [walletVouchers, setWalletVouchers] = useState<WalletVoucher[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [managerRedemptions] = useState<ManagerRedemption[]>([]);
  const [managerStats] = useState<ManagerStats>(EMPTY_STATS);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (currentUser.role !== newRole) setRole(currentUser.role);
  };

  const loadAuthenticatedData = useCallback(async () => {
    try {
      const [apiBrands, apiVouchers, apiWallet, favoriteVouchers] = await Promise.all([
        api.brands(), api.vouchers(), api.wallet(), api.favoriteVouchers(),
      ]);
      setBrands(apiBrands);
      const vouchersById = new Map(apiVouchers.map((voucher) => [voucher.id, voucher]));
      favoriteVouchers.forEach((voucher) => {
        vouchersById.set(voucher.id, { ...vouchersById.get(voucher.id), ...voucher, isFavorite: true });
      });
      setVouchers(Array.from(vouchersById.values()));
      setWalletVouchers(apiWallet);
    } catch (error) {
      Alert.alert('Không thể tải dữ liệu tài khoản', error instanceof Error ? error.message : 'Vui lòng thử lại khi kết nối máy chủ ổn định.');
    }
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void removeAuthToken();
      setIsLoggedIn(false);
      setRole('USER');
      setCurrentUser(EMPTY_USER);
      setOrders([]);
      setWalletVouchers([]);
    });
    return () => setUnauthorizedHandler(undefined);
  }, []);

  useEffect(() => {
    Promise.all([api.brands(), api.vouchers()])
      .then(([apiBrands, apiVouchers]) => {
        setBrands(apiBrands);
        setVouchers(apiVouchers);
      })
      .catch((error) => {
        setBrands([]);
        setVouchers([]);
        Alert.alert('Không thể tải ưu đãi', error instanceof Error ? error.message : 'Vui lòng kiểm tra kết nối máy chủ.');
      });
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await readAuthToken();
        if (!token) return;
        setAuthToken(token);
        const profile = mapUser((await api.me()).user);
        if (!active) return;
        setCurrentUser(profile);
        setRole(profile.role);
        setIsLoggedIn(true);
        try { await loadAuthenticatedData(); } catch { /* Auth remains valid; data can be retried by the screens. */ }
      } catch (error) {
        setAuthToken(null);
        if ((error as { status?: number })?.status === 401) await removeAuthToken();
        else Alert.alert('Không thể khôi phục phiên', error instanceof Error ? error.message : 'Vui lòng đăng nhập lại khi có kết nối.');
      } finally {
        if (active) setAuthReady(true);
      }
    })();
    return () => { active = false; };
  }, [loadAuthenticatedData]);

  const login = async (email: string, password: string, rememberMe = true): Promise<UserRole> => {
    const auth = await api.login(email, password);
    if (rememberMe) await saveAuthToken(auth.token);
    else await removeAuthToken();
    setAuthToken(auth.token);
    let profile: UserProfile;
    try { profile = mapUser((await api.me()).user); }
    catch (error) { setAuthToken(null); await removeAuthToken(); throw error; }
    setRole(profile.role);
    setCurrentUser(profile);
    setIsLoggedIn(true);
    await loadAuthenticatedData();
    return profile.role;
  };

  const register = async (name: string, email: string, password: string, phone?: string) => {
    const auth = await api.register(name, email, password, phone);
    await saveAuthToken(auth.token);
    setAuthToken(auth.token);
    let profile: UserProfile;
    try { profile = mapUser((await api.me()).user); }
    catch (error) { setAuthToken(null); await removeAuthToken(); throw error; }
    setRole(profile.role);
    setCurrentUser(profile);
    setIsLoggedIn(true);
    await loadAuthenticatedData();
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Clear the local session even if the server is no longer reachable.
    }
    setAuthToken(null);
    try { await removeAuthToken(); } catch { /* The in-memory session is still cleared. */ }
    setIsLoggedIn(false);
    setRole('USER');
    setCurrentUser(EMPTY_USER);
    setOrders([]);
    setWalletVouchers([]);
    setNotifications([]);
  };

  const updateProfile = (_data: Partial<UserProfile>) => { throw new Error('Backend chưa hỗ trợ cập nhật hồ sơ.'); };

  const toggleFavoriteBrand = async (brandId: string) => {
    const result = await api.toggleBrandFavorite(brandId);
    setBrands((prev) => prev.map((b) => b.id === brandId ? { ...b, isFavorite: result.isFavorite } : b));
  };

  const toggleFavoriteVoucher = async (voucherId: string) => {
    const result = await api.toggleVoucherFavorite(voucherId);
    setVouchers((prev) => prev.map((v) => v.id === voucherId ? { ...v, isFavorite: result.isFavorite } : v));
  };

  const getBrandById = (id: string) => brands.find((b) => b.id === id);
  const getVoucherById = (id: string) => vouchers.find((v) => v.id === id);
  const getOrderById = (id: string) => orders.find((o) => o.id === id);
  const getWalletVoucherById = (id: string) => walletVouchers.find((w) => w.id === id);

  const createOrder = async (voucherId: string, paymentMethod: string) => {
    const purchase = await api.buyVoucher(voucherId, paymentMethod);
    const voucher = vouchers.find((v) => v.id === voucherId);
    if (!voucher) throw new Error('Không tìm thấy voucher đã tải.');
    const walletVoucherId = String(purchase.userVoucherId);

    const newWalletVoucher: WalletVoucher = {
      id: walletVoucherId,
      voucherId: voucher.id,
      brandName: purchase.brandName || voucher.brandName,
      brandLogo: purchase.brandLogo || voucher.brandLogo,
      title: purchase.voucherTitle || voucher.title,
      discountDisplay: voucher.discountDisplay,
      voucherCode: purchase.voucherCode,
      purchasedDate: purchase.purchasedDate || new Date().toISOString(),
      expirationDate: purchase.expirationDate || voucher.expirationDate,
      status: 'AVAILABLE',
      usageConditions: voucher.usageConditions,
      sellingPrice: purchase.totalAmount ?? voucher.sellingPrice,
      originalValue: voucher.originalValue,
      coverImage: voucher.coverImage,
    };

    const newOrder: Order = {
      id: purchase.orderCode,
      voucherId: voucher.id,
      voucherTitle: purchase.voucherTitle || voucher.title,
      brandName: purchase.brandName || voucher.brandName,
      brandLogo: purchase.brandLogo || voucher.brandLogo,
      amount: purchase.totalAmount ?? voucher.sellingPrice,
      paymentMethod: purchase.paymentMethod || paymentMethod,
      status: 'PAID',
      createdAt: new Date().toISOString(),
      walletVoucherId,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setWalletVouchers((prev) => [newWalletVoucher, ...prev]);

    // Decrement available quantity
    setVouchers((prev) =>
      prev.map((v) =>
        v.id === voucherId
          ? { ...v, availableQuantity: Math.max(0, v.availableQuantity - 1) }
          : v
      )
    );

    return { order: newOrder, walletVoucher: newWalletVoucher };
  };

  const redeemWalletVoucher = async (walletVoucherId: string) => {
    const result = await api.useVoucher(walletVoucherId);
    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
      now.getDate()
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let redeemedItem: WalletVoucher | undefined;

    setWalletVouchers((prev) =>
      prev.map((item) => {
        if (item.id === walletVoucherId) {
          redeemedItem = {
            ...item,
            status: 'REDEEMED',
            redeemedDate: result.usedAt || formattedDate,
          };
          return redeemedItem;
        }
        return item;
      })
    );

    if (redeemedItem) setWalletVouchers((prev) => prev.map((item) => item.id === walletVoucherId ? redeemedItem! : item));

    return { success: true, redeemedDate: result.usedAt || formattedDate };
  };

  const createVoucher = (_voucherData: Omit<Voucher, 'id' | 'availableQuantity'>): Voucher => { throw new Error('Backend chưa có endpoint tạo voucher.'); };

  const updateVoucher = (_voucherId: string, _updates: Partial<Voucher>) => { throw new Error('Backend chưa có endpoint cập nhật voucher.'); };

  const updateVoucherStatus = (_voucherId: string, _status: VoucherStatus) => { throw new Error('Backend chưa có endpoint cập nhật trạng thái voucher.'); };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  return (
    <AppContext.Provider
      value={{
        role,
        setRole: switchRole,
        currentUser,
        isLoggedIn,
        authReady,
        login,
        register,
        logout,
        updateProfile,

        brands,
        vouchers,
        toggleFavoriteBrand,
        toggleFavoriteVoucher,
        getBrandById,
        getVoucherById,

        orders,
        getOrderById,
        createOrder,

        walletVouchers,
        getWalletVoucherById,
        redeemWalletVoucher,

        managerStats,
        managerRedemptions,
        createVoucher,
        updateVoucher,
        updateVoucherStatus,

        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
