import React, { createContext, useContext, useState, useMemo } from 'react';
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
import {
  BRANDS,
  INITIAL_MANAGER,
  INITIAL_MANAGER_REDEMPTIONS,
  INITIAL_MANAGER_STATS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ORDERS,
  INITIAL_USER,
  INITIAL_VOUCHERS,
  INITIAL_WALLET_VOUCHERS,
} from '../data/mockData';
import { generateOrderId, generateVoucherCode } from '../utils/formatters';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;
  isLoggedIn: boolean;
  login: (email: string, targetRole?: UserRole) => boolean;
  register: (name: string, email: string, phone?: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;

  brands: Brand[];
  vouchers: Voucher[];
  toggleFavoriteBrand: (brandId: string) => void;
  toggleFavoriteVoucher: (voucherId: string) => void;
  getBrandById: (id: string) => Brand | undefined;
  getVoucherById: (id: string) => Voucher | undefined;

  orders: Order[];
  getOrderById: (id: string) => Order | undefined;
  createOrder: (voucherId: string, paymentMethod: string) => { order: Order; walletVoucher: WalletVoucher };

  walletVouchers: WalletVoucher[];
  getWalletVoucherById: (id: string) => WalletVoucher | undefined;
  redeemWalletVoucher: (walletVoucherId: string) => { success: boolean; redeemedDate: string };

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
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USER);

  const [brands, setBrands] = useState<Brand[]>(BRANDS);
  const [vouchers, setVouchers] = useState<Voucher[]>(INITIAL_VOUCHERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [walletVouchers, setWalletVouchers] = useState<WalletVoucher[]>(INITIAL_WALLET_VOUCHERS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [managerRedemptions, setManagerRedemptions] = useState<ManagerRedemption[]>(INITIAL_MANAGER_REDEMPTIONS);
  const [managerStats, setManagerStats] = useState<ManagerStats>(INITIAL_MANAGER_STATS);

  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'MANAGER') {
      setCurrentUser(INITIAL_MANAGER);
    } else {
      setCurrentUser(INITIAL_USER);
    }
  };

  const login = (email: string, targetRole?: UserRole) => {
    const selectedRole = targetRole || (email.toLowerCase().includes('manager') ? 'MANAGER' : 'USER');
    setRole(selectedRole);
    setIsLoggedIn(true);
    if (selectedRole === 'MANAGER') {
      setCurrentUser({
        ...INITIAL_MANAGER,
        email: email || INITIAL_MANAGER.email,
      });
    } else {
      setCurrentUser({
        ...INITIAL_USER,
        email: email || INITIAL_USER.email,
      });
    }
    return true;
  };

  const register = (name: string, email: string, phone?: string) => {
    setIsLoggedIn(true);
    setRole('USER');
    setCurrentUser({
      id: `usr_${Date.now()}`,
      name,
      email,
      phone: phone || '',
      avatarUrl: INITIAL_USER.avatarUrl,
      role: 'USER',
    });
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setCurrentUser((prev) => ({ ...prev, ...data }));
  };

  const toggleFavoriteBrand = (brandId: string) => {
    setBrands((prev) =>
      prev.map((b) => (b.id === brandId ? { ...b, isFavorite: !b.isFavorite } : b))
    );
  };

  const toggleFavoriteVoucher = (voucherId: string) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, isFavorite: !v.isFavorite } : v))
    );
  };

  const getBrandById = (id: string) => brands.find((b) => b.id === id);
  const getVoucherById = (id: string) => vouchers.find((v) => v.id === id);
  const getOrderById = (id: string) => orders.find((o) => o.id === id);
  const getWalletVoucherById = (id: string) => walletVouchers.find((w) => w.id === id);

  const createOrder = (voucherId: string, paymentMethod: string) => {
    const voucher = vouchers.find((v) => v.id === voucherId) || vouchers[0];
    const orderId = generateOrderId();
    const walletVoucherId = `wlt_${Date.now()}`;
    const code = generateVoucherCode(voucher.brandName.substring(0, 4));

    const newWalletVoucher: WalletVoucher = {
      id: walletVoucherId,
      voucherId: voucher.id,
      brandName: voucher.brandName,
      brandLogo: voucher.brandLogo,
      title: voucher.title,
      discountDisplay: voucher.discountDisplay,
      voucherCode: code,
      purchasedDate: new Date().toISOString().split('T')[0],
      expirationDate: voucher.expirationDate,
      status: 'AVAILABLE',
      usageConditions: voucher.usageConditions,
      sellingPrice: voucher.sellingPrice,
      originalValue: voucher.originalValue,
      coverImage: voucher.coverImage,
    };

    const newOrder: Order = {
      id: orderId,
      voucherId: voucher.id,
      voucherTitle: voucher.title,
      brandName: voucher.brandName,
      brandLogo: voucher.brandLogo,
      amount: voucher.sellingPrice,
      paymentMethod,
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

    // Update manager stats
    setManagerStats((prev) => ({
      ...prev,
      totalOrders: prev.totalOrders + 1,
      issuedVouchers: prev.issuedVouchers + 1,
      totalRevenue: prev.totalRevenue + voucher.sellingPrice,
    }));

    // Trigger purchase notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      type: 'PURCHASE_SUCCESS',
      title: 'Order Confirmed! 🎉',
      message: `Your ${voucher.brandName} voucher has been successfully issued to your wallet.`,
      createdAt: 'Just now',
      isRead: false,
      actionUrl: '/(user)/wallet',
    };
    setNotifications((prev) => [newNotif, ...prev]);

    return { order: newOrder, walletVoucher: newWalletVoucher };
  };

  const redeemWalletVoucher = (walletVoucherId: string) => {
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
            redeemedDate: formattedDate,
          };
          return redeemedItem;
        }
        return item;
      })
    );

    if (redeemedItem) {
      // Record simulated redemption for manager dashboard
      const newRedemption: ManagerRedemption = {
        id: `red_${Date.now()}`,
        voucherId: redeemedItem.voucherId,
        voucherTitle: redeemedItem.title,
        voucherCode: redeemedItem.voucherCode,
        customerName: currentUser.name || 'Demo Customer',
        redeemedDate: formattedDate,
        status: 'CONFIRMED',
      };
      setManagerRedemptions((prev) => [newRedemption, ...prev]);

      // Update manager stats
      setManagerStats((prev) => ({
        ...prev,
        simulatedRedemptions: prev.simulatedRedemptions + 1,
      }));

      // Add notification
      const newNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        type: 'REDEMPTION_CONFIRMED',
        title: 'Voucher Redeemed',
        message: `Voucher ${redeemedItem.voucherCode} was successfully marked as used.`,
        createdAt: 'Just now',
        isRead: false,
        actionUrl: '/(user)/wallet',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }

    return { success: true, redeemedDate: formattedDate };
  };

  const createVoucher = (voucherData: Omit<Voucher, 'id' | 'availableQuantity'>) => {
    const newId = `vchr_${Date.now()}`;
    const newVoucher: Voucher = {
      ...voucherData,
      id: newId,
      availableQuantity: voucherData.totalQuantity,
    };
    setVouchers((prev) => [newVoucher, ...prev]);
    setManagerStats((prev) => ({
      ...prev,
      activeVouchers: prev.activeVouchers + (voucherData.status === 'ACTIVE' ? 1 : 0),
    }));
    return newVoucher;
  };

  const updateVoucher = (voucherId: string, updates: Partial<Voucher>) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, ...updates } : v))
    );
  };

  const updateVoucherStatus = (voucherId: string, status: VoucherStatus) => {
    setVouchers((prev) =>
      prev.map((v) => (v.id === voucherId ? { ...v, status } : v))
    );
  };

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
