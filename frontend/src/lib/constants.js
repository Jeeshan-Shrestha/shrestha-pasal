export const STORE_NAME = "New Shrestha Bhada Pasal";
export const EMAIL = "experimentmail777@gmail.com";
export const PHONENO = "9800000003";
export const ADDRESS = "Biratnagar, Nepal";
export const FREE_DELIVERY_FROM = 3000; // keep in sync with backend FREE_DELIVERY_THRESHOLD
export const DELIVERY_FEE = 100; // keep in sync with backend DELIVERY_FEE

export const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "Newest" },
  { value: "price,asc", label: "Price: low to high" },
  { value: "price,desc", label: "Price: high to low" },
  { value: "ratingAverage,desc", label: "Top rated" },
  { value: "name,asc", label: "Name A-Z" },
];

export const ORDER_STATUS_STYLE = {
  PLACED: "bg-yellow-100 text-yellow-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-700",
};

// Mirrors OrderStatus.next() on the backend (admin workflow).
export const NEXT_STATUS = {
  PLACED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED", "CANCELLED"],
  DELIVERED: [],
  CANCELLED: [],
};
