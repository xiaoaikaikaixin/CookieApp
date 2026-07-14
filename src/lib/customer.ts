export const CUSTOMER_STORAGE_KEY = "lisa-cookies-customer";

export interface Customer {
  name: string;
  phone: string;
}

export function getCustomer(): Customer | null {
  try {
    const raw = window.localStorage.getItem(CUSTOMER_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveCustomer(customer: Customer) {
  window.localStorage.setItem(CUSTOMER_STORAGE_KEY, JSON.stringify(customer));
}
