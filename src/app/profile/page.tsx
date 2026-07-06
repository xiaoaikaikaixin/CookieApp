import PageHeader from "@/components/PageHeader";
import BottomNav from "@/components/BottomNav";

const menuItems = [
  { icon: "📦", label: "My Orders" },
  { icon: "📍", label: "Shipping Addresses" },
  { icon: "💳", label: "Payment Methods" },
  { icon: "♥", label: "Favorites" },
  { icon: "🔔", label: "Notifications" },
  { icon: "❓", label: "Help & Support" },
];

export default function ProfilePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PageHeader title="Profile" />

      <div className="flex items-center gap-3.5 px-5 pt-2">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-beige text-[28px] text-gold">
          👤
        </span>
        <div className="flex flex-col gap-1">
          <p className="font-heading text-[18px] font-bold text-brown">Mei Ling Tan</p>
          <p className="text-[12px] text-soft-brown">+65 9123 4567</p>
        </div>
      </div>

      <div className="px-5 pt-4">
        <div className="flex justify-between rounded-lg bg-white p-4 card-shadow">
          {[
            ["12", "Orders"],
            ["350", "Points"],
            ["3", "Vouchers"],
          ].map(([num, label]) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-0.5">
              <span className="font-heading text-[20px] font-bold text-gold">{num}</span>
              <span className="text-[11px] font-medium text-soft-brown">{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col px-5 pt-6">
        {menuItems.map((item, i) => (
          <div key={item.label}>
            <button className="flex w-full items-center gap-3 py-3.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-beige text-[16px]">
                {item.icon}
              </span>
              <span className="flex-1 text-left text-[14px] font-semibold text-brown">{item.label}</span>
              <span className="text-soft-brown">›</span>
            </button>
            {i < menuItems.length - 1 && <div className="h-px w-full bg-beige" />}
          </div>
        ))}
      </div>

      <button className="flex items-center justify-center gap-2 px-5 py-8 text-[14px] font-semibold text-red">
        <span>⎋</span> Log Out
      </button>

      <BottomNav />
    </div>
  );
}
