"use client";

import { getApiUrl } from "@/lib/getApiUrl";
import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";

type Medicine = {
  Medicine_ID: string;
  Medicine_Name: string;
  Medicine_Type: string;
  Presentation: string;
  Unit: string;
  Batch_Number: string;
  Expiry_Date: string;
  Initial_Stock: number;
  Current_Stock: number;
};

const API_URL = getApiUrl();
export default function MedicinesPage() {
  const [search, setSearch] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // =====================================================
  // FORMAT DATE - DATE ONLY
  // =====================================================

  const formatDate = (value: any) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-GB");
  };

  // =====================================================
  // LOAD MEDICINES
  // =====================================================

  const loadMedicines = async () => {
    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}?action=medicines`
      );

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const data = await response.json();

      setMedicines(data);
    } catch (error) {
      console.error(
        "Error loading medicines:",
        error
      );

      alert(
        "Unable to load medicines from Google Sheet."
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {
    loadMedicines();
  }, []);

  // =====================================================
  // EXCEL IMPORT
  // =====================================================

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);

      // -----------------------------------------------
      // READ EXCEL FILE
      // -----------------------------------------------

      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data, {
        cellDates: true,
      });

      if (
        !workbook.SheetNames ||
        workbook.SheetNames.length === 0
      ) {
        alert("Excel file contains no sheets.");
        return;
      }

      const sheetName =
        workbook.SheetNames[0];

      const worksheet =
        workbook.Sheets[sheetName];

      const jsonData =
        XLSX.utils.sheet_to_json(
          worksheet,
          {
            defval: "",
          }
        );

      if (jsonData.length === 0) {
        alert("Excel file is empty.");
        return;
      }

      console.log(
        "Excel data:",
        jsonData
      );

      // -----------------------------------------------
      // SEND TO GOOGLE APPS SCRIPT
      // -----------------------------------------------

      const response = await fetch(
        API_URL,
        {
          method: "POST",

          // IMPORTANT:
          // Do NOT add Content-Type: application/json.
          // This avoids the CORS preflight problem.
          body: JSON.stringify({
            action: "importMedicines",
            medicines: jsonData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Server error: ${response.status}`
        );
      }

      const result =
        await response.json();

      console.log(
        "Import result:",
        result
      );

      // -----------------------------------------------
      // IMPORT SUCCESS
      // -----------------------------------------------

      if (
        result.status === "success"
      ) {
        alert(
          `Import completed successfully!\n\n` +
          `Imported: ${result.imported}\n` +
          `Skipped: ${result.skipped}`
        );

        await loadMedicines();
      } else {
        alert(
          result.message ||
            "Import failed."
        );
      }
    } catch (error) {
      console.error(
        "Excel import error:",
        error
      );

      alert(
        "Excel import failed.\n\n" +
        "Please check your internet connection and Google Apps Script deployment."
      );
    } finally {
      setUploading(false);

      // Reset file input so the same file can
      // be selected again.
      e.target.value = "";
    }
  };

  // =====================================================
  // FILTER MEDICINES
  // =====================================================

  const filteredMedicines =
    medicines.filter(
      (medicine) =>
        medicine.Medicine_Name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-7xl mx-auto">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-lg p-5 mb-4">

          <h1 className="text-3xl font-bold">
            📦 Medicine Master
          </h1>

          <p className="text-gray-500 mt-1">
            Manage Medicines and Stock
          </p>

        </div>

        {/* =================================================
            SEARCH + ACTIONS
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-lg p-5 mb-4">

          <div className="flex flex-col md:flex-row gap-3">

            {/* SEARCH */}

            <input
              type="text"
              placeholder="Search medicine..."
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              className="flex-1 border rounded-xl p-3"
            />

            {/* ADD MEDICINE */}

            <button
              type="button"
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl"
            >
              + Add Medicine
            </button>

            {/* IMPORT EXCEL */}

            <button
              type="button"
              disabled={uploading}
              onClick={() =>
                fileInputRef.current?.click()
              }
              className={`text-white px-5 py-3 rounded-xl ${
                uploading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {uploading
                ? "Importing..."
                : "Import Excel"}
            </button>

            {/* HIDDEN FILE INPUT */}

            <input
              type="file"
              accept=".xlsx,.xls"
              ref={fileInputRef}
              className="hidden"
              onChange={
                handleFileUpload
              }
            />

          </div>

          {/* EXCEL FORMAT HELP */}

          <div className="mt-4 bg-slate-50 rounded-xl p-4 text-sm text-gray-600">

            <p className="font-semibold mb-2">
              Excel columns expected:
            </p>

            <p>
              Medicine_Name, Medicine_Type,
              Presentation, Unit,
              Batch_Number, Expiry_Date,
              Initial_Stock, Current_Stock
            </p>

          </div>

        </div>

        {/* =================================================
            MEDICINE TABLE
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

          {loading ? (

            /* LOADING */

            <div className="p-8 text-center">
              Loading medicines...
            </div>

          ) : filteredMedicines.length === 0 ? (

            /* NO MEDICINES */

            <div className="p-8 text-center text-gray-500">

              {search
                ? "No medicines found."
                : "No medicines available."}

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                {/* =================================================
                    TABLE HEADER
                ================================================= */}

                <thead className="bg-slate-800 text-white">

                  <tr>

                    <th className="p-3 text-left">
                      Medicine
                    </th>

                    <th className="p-3 text-left">
                      Type
                    </th>

                    <th className="p-3 text-left">
                      Presentation
                    </th>

                    <th className="p-3 text-left">
                      Unit
                    </th>

                    <th className="p-3 text-left">
                      Batch
                    </th>

                    <th className="p-3 text-center">
                      Expiry
                    </th>

                    <th className="p-3 text-center">
                      Initial Stock
                    </th>

                    <th className="p-3 text-center">
                      Current Stock
                    </th>

                  </tr>

                </thead>

                {/* =================================================
                    TABLE BODY
                ================================================= */}

                <tbody>

                  {filteredMedicines.map(
                    (
                      medicine,
                      index
                    ) => (

                      <tr
                        key={
                          medicine.Medicine_ID ||
                          index
                        }
                        className="border-b hover:bg-slate-50"
                      >

                        {/* MEDICINE */}

                        <td className="p-3 font-medium">
                          {
                            medicine.Medicine_Name
                          }
                        </td>

                        {/* TYPE */}

                        <td className="p-3">
                          {
                            medicine.Medicine_Type
                          }
                        </td>

                        {/* PRESENTATION */}

                        <td className="p-3">
                          {
                            medicine.Presentation
                          }
                        </td>

                        {/* UNIT */}

                        <td className="p-3">
                          {
                            medicine.Unit
                          }
                        </td>

                        {/* BATCH */}

                        <td className="p-3">
                          {
                            medicine.Batch_Number
                          }
                        </td>

                        {/* EXPIRY */}

                        <td className="p-3 text-center">
                          {
                            formatDate(
                              medicine.Expiry_Date
                            )
                          }
                        </td>

                        {/* INITIAL STOCK */}

                        <td className="p-3 text-center">
                          {
                            medicine.Initial_Stock
                          }
                        </td>

                        {/* CURRENT STOCK */}

                        <td className="p-3 text-center">

                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              Number(
                                medicine.Current_Stock
                              ) <= 10
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >

                            {
                              medicine.Current_Stock
                            }

                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>
    </main>
  );
}