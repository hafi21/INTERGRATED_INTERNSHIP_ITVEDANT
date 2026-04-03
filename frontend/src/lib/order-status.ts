export const getOrderStatusLabel = (status: string) => {
  switch (status) {
    case "PROCESSING":
      return "Shipped";
    case "FULFILLED":
      return "Delivered";
    case "PAID":
      return "Paid";
    case "CANCELLED":
      return "Cancelled";
    case "PENDING":
    default:
      return "Pending";
  }
};

export const getOrderStatusTone = (status: string) => {
  switch (status) {
    case "PROCESSING":
      return "bg-amber-50 text-amber-700";
    case "FULFILLED":
      return "bg-emerald-50 text-emerald-600";
    case "PAID":
      return "bg-brand-50 text-brand-700";
    case "CANCELLED":
      return "bg-slate-100 text-slate-500";
    case "PENDING":
    default:
      return "bg-brand-50 text-brand-700";
  }
};
