import React, { createContext, useContext, useState, useMemo, useEffect, useCallback } from 'react';
import { Alert, View, Text, StyleSheet } from 'react-native';
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
const toOrder = (item: import('../services/apiTypes').OrderDto): Order => ({ id: item.orderCode || item.id || item._id || '', voucherId: item.voucherId || '', voucherTitle: item.voucherTitle || 'Voucher', brandName: item.brandName || '', brandLogo: item.brandLogo || '', amount: Number(item.amount || 0), paymentMethod: item.paymentMethod || '', status: (item.status || 'PAID') as Order['status'], createdAt: item.createdAt || new Date().toISOString(), walletVoucherId: item.walletVoucherId || undefined });

interface AppContextType {
  notify: (message: string, kind?: 'success' | 'error' | 'info') => void;
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
  managerVoucherList: Voucher[];
  managerRecentOrders: Order[];
  preferredVoucherBrandId: string;
  setPreferredVoucherBrandId: (id: string) => void;
  createManagerBrand: (data: { name: string; code: string; categoryId?: string; rating: number; logo_url: string; cover_image_url: string; description: string }) => Promise<Brand>;
  verifyVoucherCode: (code: string) => Promise<Record<string, unknown>>;
  redeemVoucherCode: (code: string) => Promise<Record<string, unknown>>;
  createVoucher: (voucherData: Omit<Voucher, 'id' | 'availableQuantity'>) => Promise<Voucher>;
  updateVoucher: (voucherId: string, updates: Partial<Voucher>) => Promise<void>;
  updateVoucherStatus: (voucherId: string, status: VoucherStatus) => Promise<void>;

  notifications: NotificationItem[];
  unreadNotificationCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ message: string; kind: 'success' | 'error' | 'info' } | null>(null);
  const notify = useCallback((message: string, kind: 'success' | 'error' | 'info' = 'success') => setToast({ message, kind }), []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);
  const [role, setRole] = useState<UserRole>('USER');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(EMPTY_USER);
  const [authReady, setAuthReady] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [walletVouchers, setWalletVouchers] = useState<WalletVoucher[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [managerRedemptions, setManagerRedemptions] = useState<ManagerRedemption[]>([]);
  const [managerStats, setManagerStats] = useState<ManagerStats>(EMPTY_STATS);
  const [managerVoucherList, setManagerVoucherList] = useState<Voucher[]>([]);
  const [managerRecentOrders, setManagerRecentOrders] = useState<Order[]>([]);
  const [preferredVoucherBrandId, setPreferredVoucherBrandId] = useState('');

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (currentUser.role !== newRole) setRole(currentUser.role);
  };

  const loadAuthenticatedData = useCallback(async (activeRole: UserRole, assignedBrandId?: string) => {
    if (activeRole === 'MANAGER') {
      const results = await Promise.allSettled([
        api.managerDashboard(assignedBrandId),
        api.managerVouchers({ brandId: assignedBrandId, limit: 100 }),
        api.managerOrders({ brandId: assignedBrandId, limit: 100 }),
        api.managerRedemptions({ brandId: assignedBrandId, limit: 100 }),
        api.managerBrands(),
      ]);
      const errors: string[] = [];
      if (results[0].status === 'fulfilled') setManagerStats(results[0].value.stats); else errors.push(results[0].reason.message);
      if (results[1].status === 'fulfilled') setManagerVoucherList(results[1].value.vouchers); else errors.push(results[1].reason.message);
      if (results[2].status === 'fulfilled') setManagerRecentOrders(results[2].value.orders.map(toOrder)); else errors.push(results[2].reason.message);
      if (results[3].status === 'fulfilled') setManagerRedemptions(results[3].value.redemptions.map((item) => ({ id: String(item.id || ''), voucherId: String(item.voucherId || ''), voucherTitle: String(item.voucherTitle || ''), voucherCode: String(item.voucherCode || ''), customerName: String(item.customerName || ''), redeemedDate: String(item.redeemedDate || ''), status: (item.status || 'CONFIRMED') as ManagerRedemption['status'] }))); else errors.push(results[3].reason.message);
      if (results[4].status === 'fulfilled') setBrands(results[4].value); else errors.push(results[4].reason.message);
      if (errors.length) Alert.alert('Một số dữ liệu quản lý chưa tải được', errors.join('\n'));
      return;
    }

    const results = await Promise.allSettled([
      api.brands(), api.vouchers(), api.favoriteBrands(), api.favoriteVouchers(),
      api.wallet(), api.orders(), api.notifications(),
    ]);
    const errors: string[] = [];
    const brandsResult = results[0];
    const vouchersResult = results[1];
    const favoriteBrandsResult = results[2];
    const favoriteVouchersResult = results[3];
    if (brandsResult.status === 'fulfilled') {
      const favoriteIds = new Set(favoriteBrandsResult.status === 'fulfilled' ? favoriteBrandsResult.value.map((brand) => brand.id) : []);
      setBrands(brandsResult.value.map((brand) => ({ ...brand, isFavorite: brand.isFavorite || favoriteIds.has(brand.id) })));
    } else errors.push(brandsResult.reason.message);
    if (vouchersResult.status === 'fulfilled') {
      const vouchersById = new Map(vouchersResult.value.map((voucher) => [voucher.id, voucher]));
      if (favoriteVouchersResult.status === 'fulfilled') favoriteVouchersResult.value.forEach((voucher) => {
        const catalogVoucher = vouchersById.get(voucher.id);
        vouchersById.set(voucher.id, catalogVoucher ? { ...catalogVoucher, isFavorite: true } : { ...voucher, isFavorite: true });
      });
      setVouchers(Array.from(vouchersById.values()));
    } else errors.push(vouchersResult.reason.message);
    if (favoriteBrandsResult.status === 'rejected') errors.push(favoriteBrandsResult.reason.message);
    if (favoriteVouchersResult.status === 'rejected') errors.push(favoriteVouchersResult.reason.message);
    if (results[4].status === 'fulfilled') setWalletVouchers(results[4].value); else errors.push(results[4].reason.message);
    if (results[5].status === 'fulfilled') setOrders(results[5].value.map(toOrder)); else errors.push(results[5].reason.message);
    if (results[6].status === 'fulfilled') setNotifications(results[6].value.notifications.map((n) => ({ id: n.id || n._id || '', type: (n.type || 'PROMO') as NotificationItem['type'], title: n.title || '', message: n.message || '', createdAt: n.timestamp || n.createdAt || '', isRead: Boolean(n.isRead), actionUrl: n.actionUrl || undefined }))); else errors.push(results[6].reason.message);
    if (errors.length) Alert.alert('Một số dữ liệu tài khoản chưa tải được', errors.join('\n'));
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
    if (!authReady || isLoggedIn) return;
    let active = true;
    Promise.all([api.brands(), api.vouchers()])
      .then(([apiBrands, apiVouchers]) => {
        if (!active) return;
        setBrands(apiBrands);
        setVouchers(apiVouchers);
      })
      .catch((error) => {
        if (!active) return;
        setBrands([]);
        setVouchers([]);
        Alert.alert('Không thể tải ưu đãi', error instanceof Error ? error.message : 'Vui lòng kiểm tra kết nối máy chủ.');
      });
    return () => { active = false; };
  }, [authReady, isLoggedIn]);

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
        try { await loadAuthenticatedData(profile.role, profile.assignedBrandId); } catch { /* Auth remains valid; data can be retried by the screens. */ }
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
    await loadAuthenticatedData(profile.role, profile.assignedBrandId);
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
    await loadAuthenticatedData(profile.role, profile.assignedBrandId);
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

  const updateProfile = async (data: Partial<UserProfile>) => {
    const result = await api.updateMe({ full_name: data.name, phone: data.phone, avatar_url: data.avatarUrl });
    setCurrentUser(mapUser(result.user));
    notify('Đã cập nhật hồ sơ.');
  };

  const toggleFavoriteBrand = async (brandId: string) => {
    if (!isLoggedIn) {
      Alert.alert('Cần đăng nhập', 'Đăng nhập để lưu thương hiệu yêu thích vào tài khoản của bạn.');
      return;
    }
    const previous = brands.find((brand) => brand.id === brandId)?.isFavorite || false;
    setBrands((prev) => prev.map((brand) => brand.id === brandId ? { ...brand, isFavorite: !previous } : brand));
    try {
      const result = await api.toggleBrandFavorite(brandId);
      setBrands((prev) => prev.map((brand) => brand.id === brandId ? { ...brand, isFavorite: result.isFavorite } : brand));
      notify(result.isFavorite ? 'Đã thêm thương hiệu vào yêu thích.' : 'Đã bỏ thương hiệu khỏi yêu thích.');
    } catch (error) {
      setBrands((prev) => prev.map((brand) => brand.id === brandId ? { ...brand, isFavorite: previous } : brand));
      Alert.alert('Không thể cập nhật yêu thích', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    }
  };

  const toggleFavoriteVoucher = async (voucherId: string): Promise<boolean> => {
    if (!isLoggedIn) {
      notify('Đăng nhập để lưu voucher yêu thích.', 'info');
      return false;
    }
    const previous = vouchers.find((voucher) => voucher.id === voucherId)?.isFavorite || false;
    setVouchers((prev) => prev.map((voucher) => voucher.id === voucherId ? { ...voucher, isFavorite: !previous } : voucher));
    try {
      const result = await api.toggleVoucherFavorite(voucherId);
      setVouchers((prev) => prev.map((voucher) => voucher.id === voucherId ? { ...voucher, isFavorite: result.isFavorite } : voucher));
      notify(result.isFavorite ? 'Đã thêm voucher vào yêu thích.' : 'Đã bỏ voucher khỏi yêu thích.');
      return true;
    } catch (error) {
      setVouchers((prev) => prev.map((voucher) => voucher.id === voucherId ? { ...voucher, isFavorite: previous } : voucher));
      notify(error instanceof Error ? error.message : 'Không thể cập nhật yêu thích. Vui lòng thử lại.', 'error');
      return false;
    }
  };

  const getBrandById = (id: string) => brands.find((b) => b.id === id);
  const getVoucherById = (id: string) => managerVoucherList.find((v) => v.id === id) || vouchers.find((v) => v.id === id);
  const getOrderById = (id: string) => orders.find((o) => o.id === id);
  const getWalletVoucherById = (id: string) => walletVouchers.find((w) => w.id === id);

  const createOrder = async (voucherId: string, paymentMethod: string) => {
    let voucher = vouchers.find((v) => v.id === voucherId);
    if (!voucher) {
      voucher = await api.voucher(voucherId);
      setVouchers((prev) => prev.some((item) => item.id === voucherId) ? prev : [voucher!, ...prev]);
    }
    const purchase = await api.buyVoucher(voucherId, paymentMethod);
    const walletVoucherId = String(purchase.walletVoucherId);

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
    notify('Mua voucher thành công. Voucher đã được thêm vào ví.');

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
    notify('Đổi voucher thành công.');

    return { success: true, redeemedDate: result.usedAt || formattedDate };
  };

  const createVoucher = async (voucherData: Omit<Voucher, 'id' | 'availableQuantity'>) => {
    const created = await api.createManagerVoucher({ brandId: voucherData.brandId || currentUser.assignedBrandId, categoryId: voucherData.categoryId, title: voucherData.title, description: voucherData.description, discountType: voucherData.discountType, discountValue: voucherData.discountValue, discountDisplay: voucherData.discountDisplay, sellingPrice: voucherData.sellingPrice, originalValue: voucherData.originalValue, totalQuantity: voucherData.totalQuantity, startDate: voucherData.startDate, expirationDate: voucherData.expirationDate, usageConditions: voucherData.usageConditions, coverImage: voucherData.coverImage, status: voucherData.status });
    setManagerVoucherList((prev) => [created, ...prev]);
    notify('Đã tạo voucher.');
    return created;
  };

  const updateVoucher = async (voucherId: string, updates: Partial<Voucher>) => {
    const updated = await api.updateManagerVoucher(voucherId, { title: updates.title, description: updates.description, sellingPrice: updates.sellingPrice, originalValue: updates.originalValue, totalQuantity: updates.totalQuantity, expirationDate: updates.expirationDate, usageConditions: updates.usageConditions });
    setManagerVoucherList((prev) => prev.map((item) => item.id === voucherId ? updated : item));
    notify('Đã cập nhật voucher.');
  };

  const updateVoucherStatus = async (voucherId: string, status: VoucherStatus) => {
    const updated = await api.updateManagerVoucherStatus(voucherId, status);
    setManagerVoucherList((prev) => prev.map((item) => item.id === voucherId ? updated : item));
    notify('Đã cập nhật trạng thái voucher.');
  };

  const verifyVoucherCode = (code: string) => api.verifyRedemption(code);
  const createManagerBrand = async (data: { name: string; code: string; categoryId?: string; rating: number; logo_url: string; cover_image_url: string; description: string }) => {
    const brand = await api.createManagerBrand(data);
    setBrands((prev) => [brand, ...prev.filter((item) => item.id !== brand.id)]);
    setPreferredVoucherBrandId(brand.id);
    notify('Đã tạo thương hiệu.');
    return brand;
  };
  const redeemVoucherCode = async (code: string) => {
    const result = await api.redeemAtCounter(code);
    const page = await api.managerRedemptions({ brandId: currentUser.assignedBrandId, limit: 100 });
    setManagerRedemptions(page.redemptions.map((item) => ({ id: String(item.id || ''), voucherId: String(item.voucherId || ''), voucherTitle: String(item.voucherTitle || ''), voucherCode: String(item.voucherCode || ''), customerName: String(item.customerName || ''), redeemedDate: String(item.redeemedDate || ''), status: (item.status || 'CONFIRMED') as ManagerRedemption['status'] })));
    return result;
  };

  const markNotificationAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = async () => {
    await api.markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const unreadNotificationCount = useMemo(
    () => notifications.filter((n) => !n.isRead).length,
    [notifications]
  );

  return (
    <AppContext.Provider
      value={{
        notify,
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
        managerVoucherList,
        managerRecentOrders,
        preferredVoucherBrandId,
        setPreferredVoucherBrandId,
        createManagerBrand,
        verifyVoucherCode,
        redeemVoucherCode,
        createVoucher,
        updateVoucher,
        updateVoucherStatus,

        notifications,
        unreadNotificationCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      <View style={toastStyles.root}>
        {children}
        {toast ? <View pointerEvents="none" style={[toastStyles.toast, toast.kind === 'error' ? toastStyles.error : toast.kind === 'info' ? toastStyles.info : toastStyles.success]}><Text style={toastStyles.text}>{toast.message}</Text></View> : null}
      </View>
    </AppContext.Provider>
  );
};

const toastStyles = StyleSheet.create({
  root: { flex: 1 },
  toast: { position: 'absolute', top: 54, left: 20, right: 20, paddingHorizontal: 16, paddingVertical: 13, borderRadius: 12, zIndex: 9999, elevation: 12 },
  success: { backgroundColor: '#16794B' },
  error: { backgroundColor: '#B42318' },
  info: { backgroundColor: '#344054' },
  text: { color: '#FFFFFF', fontWeight: '600', textAlign: 'center' },
});

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
