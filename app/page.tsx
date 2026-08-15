import Link from "next/link";

export default function HomePage() {
  const modules = [
    {
      title: "Medicine Master",
      icon: "💊",
      href: "/medicines",
      description: "Manage medicine details and stock",
    },
    {
      title: "Issue Medicine",
      icon: "📝",
      href: "/issue",
      description: "Issue medicines for OP cases",
    },
    {
      title: "Daily Entries",
      icon: "📋",
      href: "/entries",
      description: "View and edit daily transactions",
    },
    {
      title: "Stock Adjustments",
      icon: "⚖️",
      href: "/adjustments",
      description: "Manage damaged, expired and corrections",
    },
    {
      title: "Reports",
      icon: "📊",
      href: "/reports",
      description: "Stock register and inventory reports",
    },
    {
      title: "Settings",
      icon: "⚙️",
      href: "/settings",
      description: "Application settings",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}

        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <h1 className="text-4xl font-bold">
            Vyas Inventory
          </h1>

          <p className="text-gray-500 mt-2">
            Veterinary Medicine Inventory Management System
          </p>
        </div>

        {/* Module Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {modules.map((module) => (
            <Link
              key={module.href}
              href={module.href}
              className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
            >
              <div className="text-5xl mb-4">
                {module.icon}
              </div>

              <h2 className="text-xl font-bold mb-2">
                {module.title}
              </h2>

              <p className="text-gray-500">
                {module.description}
              </p>
            </Link>
          ))}

        </div>

      </div>
    </main>
  );
}