export type AuthenticatedUser = {
  id: number;
  email: string;
  role: "ADMIN" | "CUSTOMER";
};

