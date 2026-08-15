"use client";

import { useEffect, useState } from "react";

type Medicine = {
  Medicine_ID: string;
  Medicine_Name: string;
  Current_Stock: number;
};

export default function IssuePage() {
  const [issueDate, setIssueDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [opNumber, setOpNumber] = useState("");

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineSearch, setMedicineSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] =
    useState<Medicine | null>(null);

  const [quantity, setQuantity] = useState("");

  const [medicineList, setMedicineList] = useState<
    {
      medicineId: string;
      medicineName: string;
      quantity: number;
      availableStock: number;
    }[]
  >([]);

  const API_URL =
    "https://script.google.com/macros/s/AKfycbzbcCJzVI12vs2K_vHhTxUhyhMveb8TQU-lfJYds_PDWvkw1k5-aI-UtNI8T09_E5UA/exec";

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const response = await fetch(
        `${API_URL}?action=medicines`
      );

      const data = await response.json();

      setMedicines(data);
    } catch (error) {
      console.error(error);
      alert("Failed to load medicines");
    }
  };

  const filteredMedicines = medicines.filter((medicine) =>
    medicine.Medicine_Name?.toLowerCase().includes(
      medicineSearch.toLowerCase()
    )
  );

  const addMedicine = () => {
    if (!selectedMedicine) {
      alert("Select a medicine");
      return;
    }

    if (!quantity) {
      alert("Enter quantity");
      return;
    }

    const qty = Number(quantity);

    if (qty <= 0) {
      alert("Quantity should be greater than zero");
      return;
    }

    if (qty > Number(selectedMedicine.Current_Stock)) {
      alert(
        `Available stock is only ${selectedMedicine.Current_Stock}`
      );
      return;
    }

    setMedicineList([
      ...medicineList,
      {
        medicineId: selectedMedicine.Medicine_ID,
        medicineName: selectedMedicine.Medicine_Name,
        quantity: qty,
        availableStock: Number(
          selectedMedicine.Current_Stock
        ),
      },
    ]);

    setMedicineSearch("");
    setSelectedMedicine(null);
    setQuantity("");
  };

  const removeMedicine = (index: number) => {
    setMedicineList(
      medicineList.filter((_, i) => i !== index)
    );
  };

  const submitData = async () => {
    if (!opNumber) {
      alert("Enter OP Number");
      return;
    }

    if (medicineList.length === 0) {
      alert("Add at least one medicine");
      return;
    }

    try {
      for (const item of medicineList) {
        const url =
          `${API_URL}` +
          `?action=saveIssue` +
          `&issueDate=${encodeURIComponent(issueDate)}` +
          `&opNumber=${encodeURIComponent(opNumber)}` +
          `&medicineName=${encodeURIComponent(
            item.medicineName
          )}` +
          `&quantity=${item.quantity}`;

        const response = await fetch(url);

        const result = await response.json();

        if (result.status !== "success") {
          alert(result.message);
          return;
        }
      }

      alert("Medicine Issue Saved Successfully");

      setOpNumber("");
      setMedicineList([]);

      await loadMedicines();
    } catch (error) {
      console.error(error);
      alert("Error saving data");
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-md mx-auto">

        <div className="bg-white rounded-3xl shadow-lg p-5">

          <h1 className="text-2xl font-bold text-center mb-1">
            💊 Issue Medicine
          </h1>

          <p className="text-center text-gray-500 mb-6">
            Vyas Inventory
          </p>

          <div className="mb-4">
            <label className="font-medium block mb-2">
              Issue Date
            </label>

            <input
              type="date"
              value={issueDate}
              onChange={(e) => setIssueDate(e.target.value)}
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div className="mb-4">
            <label className="font-medium block mb-2">
              OP Number
            </label>

            <input
              type="text"
              value={opNumber}
              onChange={(e) => setOpNumber(e.target.value)}
              placeholder="Enter OP Number"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div className="mb-4">
            <label className="font-medium block mb-2">
              Search Medicine
            </label>

            <input
              type="text"
              value={medicineSearch}
              onChange={(e) =>
                setMedicineSearch(e.target.value)
              }
              placeholder="Type medicine name..."
              className="w-full border rounded-xl p-3"
            />

            {medicineSearch && (
              <div className="border rounded-xl mt-2 max-h-48 overflow-y-auto bg-white">

                {filteredMedicines.map((medicine) => (

                  <div
                    key={medicine.Medicine_ID}
                    onClick={() => {
                      setSelectedMedicine(medicine);
                      setMedicineSearch(
                        medicine.Medicine_Name
                      );
                    }}
                    className="p-3 cursor-pointer hover:bg-blue-100 border-b"
                  >
                    <div>
                      {medicine.Medicine_Name}
                    </div>

                    <div className="text-sm text-green-600">
                      Available :
                      {" "}
                      {medicine.Current_Stock}
                    </div>
                  </div>

                ))}

              </div>
            )}
          </div>

          {selectedMedicine && (
            <div className="mb-4 bg-green-50 p-3 rounded-xl">

              <div className="font-medium">
                {selectedMedicine.Medicine_Name}
              </div>

              <div className="text-green-700">
                Available Stock :
                {" "}
                {selectedMedicine.Current_Stock}
              </div>

            </div>
          )}

          <div className="mb-4">
            <label className="font-medium block mb-2">
              Quantity
            </label>

            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter Quantity"
              className="w-full border rounded-xl p-3"
            />
          </div>

          <button
            onClick={addMedicine}
            className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold"
          >
            + Add Medicine
          </button>

        </div>

        <div className="bg-white rounded-3xl shadow-lg p-5 mt-4">

          <h2 className="font-bold text-lg mb-3">
            Added Medicines
          </h2>

          {medicineList.length === 0 ? (
            <p className="text-gray-500">
              No medicines added
            </p>
          ) : (
            medicineList.map((item, index) => (

              <div
                key={index}
                className="flex justify-between items-center border rounded-xl p-3 mb-2"
              >
                <div>

                  <div className="font-medium">
                    {item.medicineName}
                  </div>

                  <div className="text-sm text-gray-500">
                    Qty : {item.quantity}
                  </div>

                </div>

                <button
                  onClick={() =>
                    removeMedicine(index)
                  }
                  className="bg-red-500 text-white px-3 py-2 rounded-lg"
                >
                  Delete
                </button>

              </div>

            ))
          )}

          <div className="mt-4 text-center text-sm text-gray-500">
            Total Medicines Added :
            {" "}
            {medicineList.length}
          </div>

        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">

          <button
            onClick={submitData}
            className="bg-green-600 text-white py-3 rounded-xl font-semibold"
          >
            Submit
          </button>

          <button
            onClick={() => {
              setOpNumber("");
              setMedicineList([]);
            }}
            className="bg-indigo-600 text-white py-3 rounded-xl font-semibold"
          >
            New OP
          </button>

        </div>

      </div>
    </main>
  );
}