import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Card } from "../components/shared/card";
import { Button } from "../components/shared/button";
import { useAuth } from "../hooks/use-auth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.fullName}`);
      navigate(location.state?.from ?? "/");
    } catch {
      toast.error("Login failed. Try the seeded demo credentials.");
    }
  };

  return (
    <main className="section-shell py-16">
      <div className="mx-auto grid max-w-5xl gap-8 lg:grid-cols-[1fr,1fr]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="rounded-[36px] p-8 sm:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-brand-600">Sign in</p>
            <h1 className="mt-3 text-3xl font-semibold text-ink">Welcome back</h1>
            <p className="mt-2 text-sm text-slate-500">Log in to view your cart, orders, and saved account details.</p>
            <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
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
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            <p className="mt-6 text-sm text-slate-500">
              New customer?{" "}
              <Link to="/register" className="font-semibold text-brand-700">
                Create an account
              </Link>
            </p>
          </Card>
        </motion.div>

        <Card className="rounded-[36px] overflow-hidden p-0">
          <div className="relative h-full min-h-[520px]">
            <img
              src="https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80"
              alt="Tablet and accessories"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-8 text-white">
              <p className="text-sm uppercase tracking-[0.28em] text-white/75">Demo accounts</p>
              <div className="mt-4 space-y-3 rounded-[28px] bg-black/20 p-5 backdrop-blur-sm">
                <p className="font-medium">Customer: customer@aureon.com / Customer@123</p>
                <p className="font-medium">Admin: admin@aureon.com / Admin@123</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
};
