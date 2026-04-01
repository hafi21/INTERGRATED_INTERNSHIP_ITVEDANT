import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Card } from "../components/shared/card";
import { Button } from "../components/shared/button";
import { useAuth } from "../hooks/use-auth";

const registerSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password needs one uppercase letter")
    .regex(/[0-9]/, "Password needs one number"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerUser(values);
      toast.success("Account created successfully");
      navigate("/");
    } catch {
      toast.error("Registration failed. Please try again.");
    }
  };

  return (
    <main className="section-shell py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[0.95fr,1.05fr]">
        <Card className="rounded-[36px] overflow-hidden p-0">
          <div className="relative h-full min-h-[520px]">
            <img
              src="https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1200&q=80"
              alt="Desk setup"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-sm uppercase tracking-[0.28em] text-white/75">New arrivals</p>
              <h2 className="mt-3 text-3xl font-semibold">Create an account to save your cart and track orders.</h2>
            </div>
          </div>
        </Card>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-[36px] p-8 sm:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Create account</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Join Aureon Store</h1>
            <p className="mt-2 text-sm text-slate-500">Sign up to shop faster and manage your orders.</p>
            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <input
                  {...register("fullName")}
                  placeholder="Full name"
                  className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
                />
                {errors.fullName ? <p className="mt-2 text-sm text-brand-700">{errors.fullName.message}</p> : null}
              </div>
              <div>
                <input
                  {...register("email")}
                  placeholder="Email address"
                  className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
                />
                {errors.email ? <p className="mt-2 text-sm text-brand-700">{errors.email.message}</p> : null}
              </div>
              <div>
                <input
                  {...register("password")}
                  type="password"
                  placeholder="Password"
                  className="w-full rounded-2xl border border-white/70 bg-white/85 px-4 py-3 outline-none focus:border-brand-300"
                />
                {errors.password ? (
                  <p className="mt-2 text-sm text-brand-700">{errors.password.message}</p>
                ) : null}
              </div>
              <Button className="w-full" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>
            <p className="mt-6 text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-brand-700">
                Sign in
              </Link>
            </p>
          </Card>
        </motion.div>
      </div>
    </main>
  );
};
