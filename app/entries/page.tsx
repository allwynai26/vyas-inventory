"use client";

import { getApiUrl } from "@/lib/getApiUrl";
import { useEffect, useState } from "react";

type Entry = {
  Entry_ID: string;
  Issue_Date: string;
  OP_Number: string;
  Medicine_ID: string;
  Medicine_Name: string;
  Quantity: number;
  Entered_By: string;
  Entry_Timestamp: string;
};

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const [dateFilter, setDateFilter] = useState("");
  const [opFilter, setOpFilter] = useState("");
  const [medicineFilter, setMedicineFilter] =
    useState("");

  const API_URL = getApiUrl();

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const response = await fetch(
        `${API_URL}?action=entries`
      );

      const data = await response.json();

      setEntries(data.reverse());
    } catch (error) {
      console.error(error);
      alert("Failed to load entries");
    } finally {
      setLoading(false);
    }
  };

  const filteredEntries = entries.filter(
    (entry) => {
      const dateMatch =
        !dateFilter ||
        String(entry.Issue_Date)
          .substring(0, 10)
          .includes(dateFilter);

      const opMatch =
        !opFilter ||
        entry.OP_Number?.toLowerCase().includes(
          opFilter.toLowerCase()
        );

      const medicineMatch =
        !medicineFilter ||
        entry.Medicine_Name?.toLowerCase().includes(
          medicineFilter.toLowerCase()
        );

      return (
        dateMatch &&
        opMatch &&
        medicineMatch
      );
    }
  );

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-7xl mx-auto">

        <div className="bg-white rounded-3xl shadow-lg p-5 mb-4">
          <h1 className="text-3xl font-bold">
            📋 Daily Entries
          </h1>

          <p className="text-gray-500 mt-1">
            Medicine Issue Register
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-5 mb-4">

          <div className="grid gap-3 md:grid-cols-3">

            <input
              type="date"
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(e.target.value)
              }
              className="border rounded-xl p-3"
            />

            <input
              type="text"
              placeholder="Search OP Number"
              value={opFilter}
              onChange={(e) =>
                setOpFilter(e.target.value)
              }
              className="border rounded-xl p-3"
            />

            <input
              type="text"
              placeholder="Search Medicine"
              value={medicineFilter}
              onChange={(e) =>
                setMedicineFilter(e.target.value)
              }
              className="border rounded-xl p-3"
            />

          </div>

        </div>

        <div className="mb-4 font-medium">
          Total Entries : {filteredEntries.length}
        </div>

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

          <div className="overflow-x-auto">

            <table className="w-full table-auto">

              <thead className="bg-slate-800 text-white">

                <tr>
                  <th className="p-3 text-left">
                    Date
                  </th>

                  <th className="p-3 text-left">
                    OP Number
                  </th>

                  <th className="p-3 text-left">
                    Medicine
                  </th>

                  <th className="p-3 text-center">
                    Quantity
                  </th>
                </tr>

              </thead>

             <tbody>

  {loading ? (

    <tr>
      <td colSpan={4} className="p-5 text-center">
        Loading...
      </td>
    </tr>

  ) : filteredEntries.length === 0 ? (

    <tr>
      <td colSpan={4} className="p-5 text-center">
        No entries found
      </td>
    </tr>

  ) : (

    filteredEntries.map((entry, index) => (

      <tr
        key={index}
        className="border-b hover:bg-slate-50"
      >

        <td className="p-3">
          {String(entry.Issue_Date).substring(0, 10)}
        </td>

        <td className="p-3 font-medium">
          {entry.OP_Number}
        </td>

        <td className="p-3">
          {entry.Medicine_Name}
        </td>

        <td className="p-3 text-center">
          {entry.Quantity}
        </td>

      </tr>

    ))

  )}

</tbody>

            </table>

          </div>

        </div>

      </div>
    </main>
  );
}