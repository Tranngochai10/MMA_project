import { CATEGORIES } from '../constants/categories';
import { VoucherCategory } from '../types';

export function categoryChoices(values: VoucherCategory[]) {
  return [{ id: 'All' as VoucherCategory, label: 'Tất cả' }, ...Array.from(new Set(values)).filter(id => id && id !== 'All').map(id => ({ id, label: CATEGORIES.find(item => item.id === id)?.label || id }))];
}
