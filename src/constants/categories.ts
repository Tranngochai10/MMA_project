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

