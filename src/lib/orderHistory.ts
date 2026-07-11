const ORDER_HISTORY_KEY = "lisa-cookies-order-history";
const MAX_HISTORY = 50;

export interface OrderHistoryEntry {
  orderNumber: string;
  total: string;
  deliveryDate: string;
  placedAt: string;
}

export function getOrderHistory(): OrderHistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(ORDER_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addOrderToHistory(entry: OrderHistoryEntry) {
  const history = getOrderHistory();
  history.unshift(entry);
  window.localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(history.slice(0, MAX_HISTORY)));
}
