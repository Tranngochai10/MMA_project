import { VoucherCategory } from '../types';

export const CATEGORIES: { id: VoucherCategory; label: string; icon: string }[] = [
  { id: 'All', label: 'Tất cả', icon: 'grid-outline' },
  { id: 'Food & Dining', label: 'Ẩm thực', icon: 'restaurant-outline' },
  { id: 'Coffee & Tea', label: 'Cà phê & Trà', icon: 'cafe-outline' },
  { id: 'Entertainment', label: 'Giải trí', icon: 'ticket-outline' },
  { id: 'Travel & Hotel', label: 'Du lịch', icon: 'airplane-outline' },
  { id: 'Tech & Gadgets', label: 'Công nghệ', icon: 'hardware-chip-outline' },
  { id: 'Beauty & Spa', label: 'Làm đẹp', icon: 'sparkles-outline' },
  { id: 'Groceries', label: 'Siêu thị', icon: 'basket-outline' },
  { id: 'Fitness', label: 'Thể thao', icon: 'fitness-outline' },
];

export const PAYMENT_METHODS = [
  { id: 'wallet', name: 'Số dư Ví Dealora', balance: '2.850.000đ', icon: 'wallet-outline' },
  { id: 'card', name: 'Thẻ Quốc tế / Ghi nợ (•••• 4242)', balance: '', icon: 'card-outline' },
  { id: 'applepay', name: 'Apple Pay / Google Pay', balance: '', icon: 'phone-portrait-outline' },
  { id: 'paypal', name: 'Ví điện tử / Chuyển khoản', balance: '', icon: 'cash-outline' },
];

