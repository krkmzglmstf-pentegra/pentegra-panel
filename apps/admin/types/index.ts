export type Platform = "Getir" | "Yemeksepeti" | "Migros";
export type OrderStatus = "Yeni" | "Onay Bekliyor" | "Hazirlaniyor" | "Yolda" | "Teslim" | "Iptal";
export type CourierStatus = "online" | "offline" | "break";

export type Tenant = {
  id: string;
  name: string;
};

export type Restaurant = {
  id: string;
  name: string;
  platformRestaurantId: string;
  platform: Platform;
  lat: number;
  lon: number;
  autoApprove: boolean;
  autoPrint: boolean;
};

export type Order = {
  id: string;
  restaurant: string;
  platform: Platform;
  status: OrderStatus;
  createdAt: string;
  totalPrice: number;
  address: string;
};

export type Courier = {
  id: string;
  name: string;
  status: CourierStatus;
  activeOrders: number;
  autoAssign: boolean;
};

export type Integration = {
  platform: Platform;
  apiKeyMasked: string;
  apiSecretMasked: string;
  tokenStatus: "aktif" | "suresi doldu" | "baglanti yok";
  lastChecked: string;
};

export type DashboardSnapshot = {
  stats: {
    todaysOrders: number;
    pendingApprovals: number;
    activeCouriers: number;
    avgDeliveryMinutes: number;
  };
  liveOrders: Order[];
  courierStatus: {
    online: number;
    offline: number;
    break: number;
  };
  health: Array<{
    label: string;
    status: "ok" | "warning" | "error";
    detail: string;
  }>;
};

export type RestaurantDashboardSnapshot = {
  stats: {
    todaysOrders: number;
    pendingOrders: number;
    inDelivery: number;
    avgPrepMinutes: number;
  };
  liveOrders: Order[];
  courierStatus: {
    online: number;
    offline: number;
    break: number;
  };
};
