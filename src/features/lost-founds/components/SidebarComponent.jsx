import { Link, useLocation } from "react-router-dom";
import {
  IconLayoutDashboard,
  IconChartBar,
  IconUsers,
  IconUserCircle,
  IconChevronRight,
} from "@tabler/icons-react";

const navItems = [
  {
    to: "/",
    hash: "",
    label: "Dashboard Laporan",
    icon: IconLayoutDashboard,
  },
  {
    to: "/",
    hash: "#statistik",
    label: "Statistik",
    icon: IconChartBar,
  },
  {
    to: "/users",
    hash: "",
    label: "Semua Pengguna",
    icon: IconUsers,
  },
  {
    to: "/profile",
    hash: "",
    label: "Profil Saya",
    icon: IconUserCircle,
  },
];

function SidebarComponent({ isSidebarOpen, onCloseMobile }) {
  const location = useLocation();

  function isItemActive(item) {
    return location.pathname === item.to && location.hash === item.hash;
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Tutup menu samping"
          data-testid="sidebar-backdrop"
          onClick={onCloseMobile}
          className="fixed inset-0 z-30 w-full h-full cursor-default bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        aria-label="Navigasi utama"
        className={`fixed top-16 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/80 p-4 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full justify-between">
          <div className="space-y-6">
            <div>
              <p className="px-3 text-xs font-bold uppercase tracking-wider text-slate-600">
                Menu Utama
              </p>
              <nav className="mt-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isItemActive(item);
                  return (
                    <Link
                      key={`${item.to}${item.hash}`}
                      to={`${item.to}${item.hash}`}
                      onClick={onCloseMobile}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        active
                          ? "bg-indigo-700 text-white shadow-md shadow-indigo-600/25 font-semibold"
                          : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={20}
                          className={
                            active
                              ? "text-white"
                              : "text-slate-600 group-hover:text-slate-700"
                          }
                        />
                        <span>{item.label}</span>
                      </div>
                      {active && <IconChevronRight size={16} />}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Footer note in sidebar */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-50 border border-indigo-100/60">
            <p className="text-xs font-semibold text-indigo-900">
              Praktikum 4 PABWE
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SidebarComponent;
