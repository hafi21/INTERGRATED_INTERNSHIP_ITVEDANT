import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, ShoppingBag, ShieldCheck } from "lucide-react";
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
  const location = useLocation();
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const adminMenuRef = useRef<HTMLDivElement | null>(null);
  const accountLabel = user?.fullName?.trim() || "My Account";

  useEffect(() => {
    setAdminMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!adminMenuRef.current?.contains(event.target as Node)) {
        setAdminMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const adminLinks = [
    { to: "/admin/payments", label: "Payments" },
    { to: "/admin/orders", label: "Order Admin" },
    { to: "/admin/customers", label: "Customers" },
    { to: "/admin/categories", label: "Categories" },
    { to: "/admin/products", label: "Products" },
  ];

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
            <div className="relative" ref={adminMenuRef}>
              <button
                type="button"
                onClick={() => setAdminMenuOpen((current) => !current)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                  location.pathname.startsWith("/admin")
                    ? "bg-brand-600 text-white"
                    : "text-slate-600 hover:text-ink"
                }`}
              >
                Admin
                <ChevronDown
                  className={`h-4 w-4 transition ${adminMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              {adminMenuOpen ? (
                <div className="absolute right-0 top-[calc(100%+0.75rem)] w-56 overflow-hidden rounded-[24px] border border-white/70 bg-white/95 p-2 shadow-soft backdrop-blur-xl">
                  {adminLinks.map((item) => {
                    const isActive = location.pathname === item.to;

                    return (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                          isActive
                            ? "bg-brand-600 text-white"
                            : "text-slate-600 hover:bg-brand-50 hover:text-ink"
                        }`}
                      >
                        {item.label}
                      </NavLink>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden max-w-[240px] rounded-full border border-brand-100 bg-brand-50 px-4 py-2 text-sm text-brand-700 sm:flex">
                <span className="flex items-center gap-2">
                  {user.role === "ADMIN" ? <ShieldCheck className="h-4 w-4" /> : null}
                  <span className="truncate font-medium">{accountLabel}</span>
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
