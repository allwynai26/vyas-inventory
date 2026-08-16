"use client";

import { getApiUrl } from "@/lib/getApiUrl";
import { useEffect, useState } from "react";
type Medicine = {
  Medicine_ID: string;
  Medicine_Name: string;
  Medicine_Type?: string;
  Presentation?: string;
  Unit?: string;
  Batch_Number?: string;
  Expiry_Date?: string;
  Initial_Stock?: number;
  Current_Stock?: number;
};

export default function AdjustmentsPage() {
  const API_URL = getApiUrl();

  // =====================================================
  // STATES
  // =====================================================

  const [adjustmentDate, setAdjustmentDate] =
    useState(
      new Date()
        .toISOString()
        .split("T")[0]
    );

  const [medicine, setMedicine] =
    useState("");

  const [adjustmentType, setAdjustmentType] =
    useState("");

  const [quantity, setQuantity] =
    useState("");

  const [medicines, setMedicines] =
    useState<Medicine[]>([]);

  const [loadingMedicines, setLoadingMedicines] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // Logged-in user's name, used for Entered_By
  const [enteredBy, setEnteredBy] =
    useState("");


  // =====================================================
  // ADJUSTMENT TYPES
  // =====================================================

  const adjustmentTypes = [
    "Expired",
    "Damaged",
    "Correction +",
    "Correction -",
    "Transfer In",
    "Transfer Out",
  ];


  // =====================================================
  // LOAD MEDICINES FROM GOOGLE SHEETS
  // =====================================================

  const loadMedicines = async () => {

    try {

      setLoadingMedicines(true);

      const response =
        await fetch(
          `${API_URL}?action=medicines`
        );

      if (!response.ok) {
        throw new Error(
          "Failed to fetch medicines"
        );
      }

      const data =
        await response.json();

      if (Array.isArray(data)) {

        setMedicines(data);

      } else {

        setMedicines([]);

        console.error(
          "Invalid medicine data:",
          data
        );

      }

    } catch (error) {

      console.error(
        "Error loading medicines:",
        error
      );

      alert(
        "Unable to load medicines. Please check your internet connection or Google Apps Script deployment."
      );

    } finally {

      setLoadingMedicines(false);

    }

  };


  // =====================================================
  // LOAD LOGGED-IN USER
  // =====================================================

  useEffect(() => {

    try {

      const storedUser =
        localStorage.getItem(
          "vyas_user"
        );

      if (storedUser) {

        const parsedUser =
          JSON.parse(
            storedUser
          );

        setEnteredBy(
          parsedUser.User_Name || ""
        );

      }

    } catch (error) {

      console.error(error);

    }

  }, []);


  // =====================================================
  // LOAD ON PAGE OPEN
  // =====================================================

  useEffect(() => {

    loadMedicines();

  }, []);


  // =====================================================
  // SELECTED MEDICINE
  // =====================================================

  const selectedMedicine =
    medicines.find(
      (item) =>
        item.Medicine_ID ===
        medicine
    );


  // =====================================================
  // SAVE ADJUSTMENT
  // =====================================================

  const handleSave = async () => {

    if (
      !medicine ||
      !adjustmentType ||
      !quantity
    ) {

      alert(
        "Please fill all fields"
      );

      return;

    }


    const qty =
      Number(quantity);

    if (
      !Number.isFinite(qty) ||
      qty <= 0
    ) {

      alert(
        "Please enter a valid quantity"
      );

      return;

    }


    if (!selectedMedicine) {

      alert(
        "Please select a valid medicine"
      );

      return;

    }


    // Current stock

    const currentStock =
      Number(
        selectedMedicine.Current_Stock || 0
      );


    // Prevent negative stock
    // for reductions

    if (
      (
        adjustmentType ===
          "Expired" ||
        adjustmentType ===
          "Damaged" ||
        adjustmentType ===
          "Correction -" ||
        adjustmentType ===
          "Transfer Out"
      ) &&
      qty > currentStock
    ) {

      alert(
        `Insufficient stock. Current stock: ${currentStock}`
      );

      return;

    }


    try {

      setSaving(true);


      const params =
        new URLSearchParams();

      params.append(
        "action",
        "saveAdjustment"
      );

      params.append(
        "adjustmentDate",
        adjustmentDate
      );

      params.append(
        "medicineId",
        selectedMedicine.Medicine_ID
      );

      params.append(
        "medicineName",
        selectedMedicine.Medicine_Name
      );

      params.append(
        "adjustmentType",
        adjustmentType
      );

      params.append(
        "quantity",
        String(qty)
      );

      params.append(
        "enteredBy",
        enteredBy
      );


      const response =
        await fetch(
          `${API_URL}?${params.toString()}`
        );


      const result =
        await response.json();


      if (
        result.status ===
        "success"
      ) {

        alert(
          `Stock adjustment saved successfully.\n\nMedicine: ${selectedMedicine.Medicine_Name}\nAdjustment: ${adjustmentType}\nQuantity: ${qty}\nNew Stock: ${result.currentStock}`
        );


        // Reset

        setMedicine("");

        setAdjustmentType("");

        setQuantity("");


        // Reload medicine stock

        loadMedicines();

      } else {

        alert(
          result.message ||
            "Failed to save adjustment"
        );

      }

    } catch (error) {

      console.error(
        "Save adjustment error:",
        error
      );

      alert(
        "Unable to save adjustment. Please check your internet connection or Google Apps Script deployment."
      );

    } finally {

      setSaving(false);

    }

  };


  // =====================================================
  // PAGE
  // =====================================================

  return (

    <main className="min-h-screen bg-slate-100 p-4">

      <div className="max-w-2xl mx-auto">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-lg p-5 mb-4">

          <h1 className="text-3xl font-bold">
            ⚖️ Stock Adjustment
          </h1>

          <p className="text-gray-500 mt-1">
            Adjust inventory for expiry,
            damage and corrections
          </p>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-lg p-5">

          <div className="space-y-4">


            {/* =================================================
                DATE
            ================================================= */}

            <div>

              <label className="block font-medium mb-2">
                Adjustment Date
              </label>

              <input
                type="date"
                value={adjustmentDate}
                onChange={(e) =>
                  setAdjustmentDate(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3"
              />

            </div>


            {/* =================================================
                MEDICINE
            ================================================= */}

            <div>

              <label className="block font-medium mb-2">
                Medicine
              </label>

              <select
                value={medicine}
                onChange={(e) =>
                  setMedicine(
                    e.target.value
                  )
                }
                disabled={
                  loadingMedicines
                }
                className="w-full border rounded-xl p-3 bg-white"
              >

                <option value="">
                  {loadingMedicines
                    ? "Loading medicines..."
                    : "Select Medicine"}
                </option>


                {medicines.map(
                  (med) => (

                    <option
                      key={
                        med.Medicine_ID
                      }
                      value={
                        med.Medicine_ID
                      }
                    >

                      {
                        med.Medicine_Name
                      }

                      {med.Batch_Number
                        ? ` - Batch ${med.Batch_Number}`
                        : ""}

                    </option>

                  )
                )}

              </select>


              {/* Current Stock */}

              {selectedMedicine && (

                <div className="mt-2 bg-slate-100 rounded-xl p-3">

                  <div className="flex justify-between">

                    <span className="text-gray-600">
                      Current Stock
                    </span>

                    <span className="font-bold">

                      {
                        selectedMedicine.Current_Stock ??
                        0
                      }

                    </span>

                  </div>


                  {selectedMedicine.Unit && (

                    <div className="text-sm text-gray-500 mt-1">

                      Unit:{" "}
                      {
                        selectedMedicine.Unit
                      }

                    </div>

                  )}

                </div>

              )}

            </div>


            {/* =================================================
                ADJUSTMENT TYPE
            ================================================= */}

            <div>

              <label className="block font-medium mb-2">
                Adjustment Type
              </label>

              <select
                value={
                  adjustmentType
                }
                onChange={(e) =>
                  setAdjustmentType(
                    e.target.value
                  )
                }
                className="w-full border rounded-xl p-3 bg-white"
              >

                <option value="">
                  Select Adjustment Type
                </option>


                {adjustmentTypes.map(
                  (type) => (

                    <option
                      key={type}
                      value={type}
                    >
                      {type}
                    </option>

                  )
                )}

              </select>

            </div>


            {/* =================================================
                QUANTITY
            ================================================= */}

            <div>

              <label className="block font-medium mb-2">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) =>
                  setQuantity(
                    e.target.value
                  )
                }
                placeholder="Enter Quantity"
                className="w-full border rounded-xl p-3"
              />

            </div>


            {/* =================================================
                SAVE
            ================================================= */}

            <button
              onClick={
                handleSave
              }
              disabled={saving}
              className={`w-full text-white py-3 rounded-xl font-medium ${
                saving
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >

              {saving
                ? "Saving..."
                : "Save Adjustment"}

            </button>

          </div>

        </div>

      </div>

    </main>

  );

}