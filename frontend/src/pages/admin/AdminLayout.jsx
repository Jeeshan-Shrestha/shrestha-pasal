import { NavLink, Outlet } from "react-router-dom";
import { PageTitle } from "../../components/ui";

const TABS = [
  ["/admin/orders", "Orders"],
  ["/admin/products", "Products"],
  ["/admin/categories", "Categories"],
  ["/admin/users", "Users"],
];

export default function AdminLayout() {
  return (
    <div>
      <PageTitle>Admin panel</PageTitle>
      <nav className="mb-6 flex flex-wrap gap-2">
        {TABS.map(([to, label]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `rounded-full px-4 py-1.5 text-sm font-medium ${isActive ? "bg-purple-600 text-white" : "border border-gray-300 text-gray-900 hover:bg-gray-100"}`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}
