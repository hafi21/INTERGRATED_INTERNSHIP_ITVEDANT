export const getPaymentStatusLabel = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "Paid";
    case "REFUNDED":
      return "Refunded";
    case "FAILED":
      return "Failed";
    case "PENDING":
    default:
      return "Pending";
  }
};

export const getPaymentStatusTone = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "bg-emerald-50 text-emerald-700";
    case "REFUNDED":
      return "bg-amber-50 text-amber-700";
    case "FAILED":
      return "bg-rose-50 text-rose-700";
    case "PENDING":
    default:
      return "bg-slate-100 text-slate-600";
  }
};

export const formatPaymentMethod = (method: string | null, provider: string) => {
  if (method?.trim()) {
    return method;
  }

  return provider === "RAZORPAY" ? "Razorpay Checkout" : provider;
};
