import { Link, useLocation } from "react-router-dom"


const Sidebar = () => {
  const location = useLocation()

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: "📊" },
    { name: "User Management", path: "/admin/users", icon: "👥" },
    { name: "Category Management", path: "/admin/categories", icon: "🗂️" },
    { name: "Coupon Management", path: "/admin/coupons", icon: "🎟️" },
    { name: "Event Management", path: "/admin/events", icon: "🛠️" },
    { name: "Event Settlement", path: "/admin/settlement", icon: "💸" },
    { name: "Wallet", path: "/admin/wallet", icon: "💰" },
  ]

  return (
    <div className="bg-[#f5f0e8] w-64 shrink-0 self-start sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto shadow-md">
      {navItems.map((item) => (
        <Link
          key={item.name}
          to={item.path}
          className={`flex items-center px-6 py-4 text-sm font-medium ${
            location.pathname === item.path ? "bg-[#333333] text-white" : "text-gray-700 hover:bg-gray-200"
          }`}
        >
          <span className="mr-3">{item.icon}</span>
          {item.name}
        </Link>
      ))}
    </div>
  )
}

export default Sidebar