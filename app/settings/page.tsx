export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold">
            ⚙️ Settings
          </h1>

          <p className="text-gray-500 mt-2">
            Application Settings
          </p>
        </div>

        {/* Hospital Information */}

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">

          <h2 className="text-xl font-semibold mb-4">
            Hospital Information
          </h2>

          <div className="grid gap-4">

            <div>
              <label className="block mb-2 font-medium">
                Hospital Name
              </label>

              <input
                type="text"
                defaultValue="Veterinary Dispensary Kadavathur"
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Address
              </label>

              <textarea
                rows={3}
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Phone Number
              </label>

              <input
                type="text"
                className="w-full border rounded-xl p-3"
              />
            </div>

          </div>

        </div>

        {/* Inventory Settings */}

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">

          <h2 className="text-xl font-semibold mb-4">
            Inventory Settings
          </h2>

          <div>
            <label className="block mb-2 font-medium">
              Expiry Alert Days
            </label>

            <input
              type="number"
              defaultValue={30}
              className="w-full border rounded-xl p-3"
            />
          </div>

        </div>

        {/* User Information */}

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">

          <h2 className="text-xl font-semibold mb-4">
            User Information
          </h2>

          <div className="grid gap-4">

            <div>
              <label className="block mb-2 font-medium">
                User Name
              </label>

              <input
                type="text"
                defaultValue="Allwyn Vyas G"
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Role
              </label>

              <input
                type="text"
                defaultValue="Super Admin"
                className="w-full border rounded-xl p-3"
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">
                Status
              </label>

              <input
                type="text"
                defaultValue="Active"
                className="w-full border rounded-xl p-3"
              />
            </div>

          </div>

        </div>

        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl">
          Save Settings
        </button>

      </div>
    </main>
  );
}