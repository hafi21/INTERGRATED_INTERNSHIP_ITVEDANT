import { Link, NavLink } from "react-router-dom";
import { ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "../shared/button";
import { useAuth } from "../../hooks/use-auth";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/products", label: "Products" },
  { to: "/cart", label: "Cart" },
  { to: "/orders", label: "Orders" },
];

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/65 backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between gap-4 py-4">
        <Link to="/" className="flex items-center gap-3 text-ink">
          <span className="rounded-2xl bg-brand-600 p-3 text-white shadow-glow">
            <ShoppingBag className="h-5 w-5" />
          </span>
          <div>
            <p className="text-lg font-semibold tracking-tight">Aureon Store</p>
            <p className="text-xs text-slate-500">Shop tech, office, and desk essentials</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/65 px-2 py-2 shadow-soft md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-2 text-sm font-medium transition ${
                  isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:text-ink"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {user?.role === "ADMIN" ? (
            <>
              <NavLink
                to="/admin/orders"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:text-ink"
                  }`
                }
              >
                Order Admin
              </NavLink>
              <NavLink
                to="/admin/categories"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:text-ink"
                  }`
                }
              >
                Categories
              </NavLink>
              <NavLink
                to="/admin/products"
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive ? "bg-brand-600 text-white" : "text-slate-600 hover:text-ink"
                  }`
                }
              >
                Products
              </NavLink>
            </>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-sm text-brand-700 sm:flex">
                <span className="flex items-center gap-2">
                  {user.role === "ADMIN" ? <ShieldCheck className="h-4 w-4" /> : null}
                  {user.role === "ADMIN" ? "Admin" : "My Account"}
                </span>
              </div>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="hidden text-sm font-medium text-slate-600 sm:block">
                Login
              </Link>
              <Link to="/register">
                <Button>Create account</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
