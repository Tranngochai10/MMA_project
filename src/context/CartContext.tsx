import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useApp } from './AppContext';
import { CART_LIMIT, readCartIds, writeCartIds } from '../services/cartStorage';

interface CartContextValue {
  ids: string[];
  ready: boolean;
  error: string;
  addVoucher: (id: string) => Promise<void>;
  removeVoucher: (id: string) => Promise<void>;
}
const CartContext = createContext<CartContextValue | undefined>(undefined);
export function CartProvider({ children }: { children: React.ReactNode }) {
  const { currentUser, isLoggedIn, authReady } = useApp();
  const owner = isLoggedIn && currentUser.id ? currentUser.id : 'guest';
  const [cart, setCart] = useState<{ owner: string; ids: string[] }>();
  const [failure, setFailure] = useState<{ owner: string; message: string }>();
  const queue = useRef<Promise<unknown>>(Promise.resolve());
  const enqueue = useCallback(<T,>(operation: () => Promise<T>): Promise<T> => {
    const pending = queue.current.then(operation, operation);
    queue.current = pending.catch(() => {});
    return pending;
  }, []);
  useEffect(() => {
    if (!authReady) return;
    let active = true;
    void enqueue(async () => {
      let ids = await readCartIds(owner);
      if (owner !== 'guest' && active) {
        const guest = await readCartIds('guest');
        if (guest.length) {
          ids = [...new Set([...ids, ...guest])].slice(0, CART_LIMIT);
          await writeCartIds(owner, ids);
          // Retain excess guest items rather than silently dropping them.
          await writeCartIds('guest', guest.filter(id => !ids.includes(id)));
        }
      }
      if (active) { setCart({ owner, ids }); setFailure(undefined); }
    }).catch(e => { if (active) setFailure({ owner, message: e instanceof Error ? e.message : 'Không thể tải giỏ hàng.' }); });
    return () => { active = false; };
  }, [authReady, owner, enqueue]);
  const ready = authReady && cart?.owner === owner;
  const mutate = useCallback(async (change: (ids: string[]) => string[]) => {
    if (!ready) throw new Error('Giỏ hàng chưa sẵn sàng. Vui lòng thử lại.');
    await enqueue(async () => {
      const ids = change(await readCartIds(owner));
      await writeCartIds(owner, ids);
      setCart(previous => previous?.owner === owner ? { owner, ids } : previous);
    });
  }, [ready, owner, enqueue]);
  const addVoucher = useCallback(async (id: string) => {
    if (!/^[a-f0-9]{24}$/i.test(id)) throw new Error('Voucher không hợp lệ.');
    await mutate(ids => {
      if (ids.includes(id)) return ids;
      if (ids.length >= CART_LIMIT) throw new Error(`Giỏ hàng chứa tối đa ${CART_LIMIT} voucher.`);
      return [...ids, id];
    });
  }, [mutate]);
  const removeVoucher = useCallback(async (id: string) => { await mutate(ids => ids.filter(value => value !== id)); }, [mutate]);
  return <CartContext.Provider value={{ ids: ready ? cart.ids : [], ready, error: failure?.owner === owner ? failure.message : '', addVoucher, removeVoucher }}>{children}</CartContext.Provider>;
}
export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error('CartProvider is missing.');
  return value;
}
