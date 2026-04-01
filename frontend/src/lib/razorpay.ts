declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}

type OpenCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  orderNumber: string;
  customerName?: string;
  customerEmail?: string;
};

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

let scriptPromise: Promise<boolean> | null = null;

export const loadRazorpayScript = () => {
  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise((resolve) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );

    if (existingScript) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  return scriptPromise;
};

export const openRazorpayCheckout = (options: OpenCheckoutOptions) =>
  new Promise<RazorpaySuccessResponse>((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK failed to load"));
      return;
    }

    const razorpay = new window.Razorpay({
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      name: "Aureon Store",
      description: `Payment for ${options.orderNumber}`,
      order_id: options.razorpayOrderId,
      prefill: {
        name: options.customerName,
        email: options.customerEmail,
      },
      theme: {
        color: "#e11d2e",
      },
      modal: {
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
      handler: (response: RazorpaySuccessResponse) => resolve(response),
    });

    razorpay.on("payment.failed", () => {
      reject(new Error("Payment failed"));
    });

    razorpay.open();
  });
