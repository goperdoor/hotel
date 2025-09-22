const KEY = 'gopher_orders_v1';

export function getStoredOrders() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export function addStoredOrder(order) {
  if (!order) return;
  try {
    const list = getStoredOrders();
    // Avoid duplicates by orderNumber (if present) or _id
    const idKey = order.orderNumber != null ? `num-${order.orderNumber}` : order._id;
    const existingIdx = list.findIndex(o => (o.orderNumber != null ? `num-${o.orderNumber}` : o._id) === idKey);
    const minimal = {
      _id: order._id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      status: order.status,
      total: order.total,
      createdAt: order.createdAt || new Date().toISOString()
    };
    if (existingIdx >= 0) {
      list[existingIdx] = { ...list[existingIdx], ...minimal };
    } else {
      list.unshift(minimal);
    }
    // cap list length
    while (list.length > 20) list.pop();
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // ignore
  }
}

export function updateStoredOrderStatus(orderNumberOrId, newStatus) {
  try {
    const list = getStoredOrders();
    const idx = list.findIndex(o => String(o.orderNumber) === String(orderNumberOrId) || o._id === orderNumberOrId);
    if (idx >= 0) {
      list[idx].status = newStatus;
      localStorage.setItem(KEY, JSON.stringify(list));
    }
  } catch {}
}

export function clearStoredOrders() {
  try { localStorage.removeItem(KEY); } catch {}
}
