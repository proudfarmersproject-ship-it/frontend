import { useEffect, useState } from "react";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  ArrowUpRight,
} from "lucide-react";

export default function Dashboard() {
  const [stats] = useState({
    totalProducts: 124,
    totalCustomers: 1205,
    totalOrders: 450,
    totalRevenue: 12500.5,
  });

  const [recentOrders] = useState([
    {
      id: 1,
      order_number: "ORD-9921",
      status: "delivered",
      total_amount: 1250.0,
      customer: "Aravind Kumar",
      date: "30 Dec 2025",
    },
    {
      id: 2,
      order_number: "ORD-9922",
      status: "processing",
      total_amount: 4500.0,
      customer: "Saira Banu",
      date: "30 Dec 2025",
    },
  ]);

  const statCards = [
    {
      title: "Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-blue-600",
      bg: "bg-blue-50",
      trend: "+12.5%",
    },
    {
      title: "Orders",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-orange-600",
      bg: "bg-orange-50",
      trend: "+5.2%",
    },
    {
      title: "Customers",
      value: stats.totalCustomers.toLocaleString(),
      icon: Users,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      trend: "+8.1%",
    },
    {
      title: "Products",
      value: stats.totalProducts,
      icon: Package,
      color: "text-purple-600",
      bg: "bg-purple-50",
      trend: "-2.4%",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto pb-20 px-4 space-y-12 animate-in fade-in duration-700">
      {/* SIMPLE HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Overview
          </h1>
          <p className="text-slate-500 text-sm font-medium">
            Insights for your store performance.
          </p>
        </div>
        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
          View Detailed Analytics <ChevronRight size={16} />
        </button>
      </div>

      {/* TOP FOUR TABS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                  <Icon size={20} />
                </div>
                <span
                  className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                    stat.trend.includes("+")
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-rose-50 text-rose-600"
                  }`}
                >
                  {stat.trend}
                </span>
              </div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {stat.title}
              </h3>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* RECENT ORDERS TAB */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-xl font-bold text-slate-900">Recent Orders</h2>
          <button className="px-4 py-2 bg-slate-50 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors">
            Manage All
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Order Info
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Customer
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <td className="px-8 py-5">
                    <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">
                      #{order.order_number}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {order.date}
                    </p>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-600">
                    {order.customer}
                  </td>
                  <td className="px-8 py-5">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        order.status === "delivered"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right font-mono font-black text-slate-900">
                    ₹{order.total_amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {recentOrders.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-slate-400 text-sm font-medium italic">
                No recent transactions recorded.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
