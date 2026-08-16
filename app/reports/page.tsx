"use client";

import { getApiUrl } from "@/lib/getApiUrl";
import { useEffect, useState } from "react";

type Medicine = {
  Medicine_ID?: string;
  Medicine_Name?: string;
  Batch_Number?: string;
  Expiry_Date?: string;
  Initial_Stock?: number;
  Current_Stock?: number;
};

type Entry = {
  Entry_ID?: string;
  Issue_Date?: string;
  OP_Number?: string;
  Medicine_ID?: string;
  Medicine_Name?: string;
  Quantity?: number;
  Balance_After_Issue?: number;
  Entered_By?: string;
  Entry_Timestamp?: string;
  // Optional OP/animal details - only shown if present in the data
  Animal_Name?: string;
  Owner_Name?: string;
  Species?: string;
};

export default function ReportsPage() {

  const API_URL = getApiUrl();
  const [reportType, setReportType] = useState("current-stock");
  const [showReport, setShowReport] = useState(false);

  const [medicine, setMedicine] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [dateWiseDate, setDateWiseDate] = useState("");

  const [opWiseOP, setOpWiseOP] = useState("");
  const [expiryDays, setExpiryDays] = useState(90);

  const [medicinesData, setMedicinesData] = useState<Medicine[]>([]);
  const [entriesData, setEntriesData] = useState<Entry[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const medicinesRes = await fetch(`${API_URL}?action=medicines`);
      const medicinesJson = await medicinesRes.json();
      setMedicinesData(Array.isArray(medicinesJson) ? medicinesJson : []);

      const entriesRes = await fetch(`${API_URL}?action=entries`);
      const entriesJson = await entriesRes.json();
      setEntriesData(Array.isArray(entriesJson) ? entriesJson : []);
    } catch (error) {
      console.error("Error loading reports data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    setShowReport(true);
  };

  const formatDate = (value?: string) => {
    if (!value) return "";
    const text = String(value);
    if (text.length >= 10) {
      return text.substring(0, 10);
    }
    return text;
  };

  const formatDisplayDate = (value?: string) => {
    if (!value) return "";
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-GB");
  };

  /*
    EXPIRY HELPERS
  */
  const getDaysLeft = (expiryDate?: string): number | null => {
    if (!expiryDate) return null;
    const expiry = new Date(expiryDate);
    if (isNaN(expiry.getTime())) return null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);

    const diffMs = expiry.getTime() - today.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  };

  const getExpiryStatus = (daysLeft: number | null) => {
    if (daysLeft === null) {
      return { label: "Unknown", color: "bg-gray-100 text-gray-600", emoji: "⚪" };
    }
    if (daysLeft < 0) {
      return { label: "Expired", color: "bg-red-100 text-red-700", emoji: "🔴" };
    }
    if (daysLeft <= 90) {
      return { label: "Expiring Soon", color: "bg-yellow-100 text-yellow-700", emoji: "🟡" };
    }
    return { label: "Safe", color: "bg-green-100 text-green-700", emoji: "🟢" };
  };

  /*
    STOCK REGISTER FILTER
  */
  const stockRegisterEntries = entriesData
    .filter((item) => {
      const issueDate = formatDate(item.Issue_Date);

      const medicineMatch =
        !medicine ||
        String(item.Medicine_Name || "").toLowerCase().trim() ===
          medicine.toLowerCase().trim();

      const fromDateMatch = !fromDate || issueDate >= fromDate;
      const toDateMatch = !toDate || issueDate <= toDate;

      return medicineMatch && fromDateMatch && toDateMatch;
    })
    .sort(
      (a, b) =>
        new Date(a.Issue_Date || "").getTime() -
        new Date(b.Issue_Date || "").getTime()
    );

  /*
    DATE-WISE FILTER
  */
  const dateWiseEntries = entriesData
    .filter((item) => {
      if (!dateWiseDate) return true;
      return formatDate(item.Issue_Date) === dateWiseDate;
    })
    .sort(
      (a, b) =>
        new Date(a.Issue_Date || "").getTime() -
        new Date(b.Issue_Date || "").getTime()
    );

  const dateWiseTotalOPs = new Set(
    dateWiseEntries.map((item) => String(item.OP_Number || "").trim()).filter(Boolean)
  ).size;

  const dateWiseTotalMedicines = new Set(
    dateWiseEntries
      .map((item) => String(item.Medicine_Name || "").trim())
      .filter(Boolean)
  ).size;

  const dateWiseTotalQuantity = dateWiseEntries.reduce(
    (sum, item) => sum + (Number(item.Quantity) || 0),
    0
  );

  /*
    OP-WISE FILTER
  */
  const opWiseEntries = entriesData
    .filter((item) => {
      if (!opWiseOP) return true;
      return (
        String(item.OP_Number || "").toLowerCase().trim() ===
        opWiseOP.toLowerCase().trim()
      );
    })
    .sort(
      (a, b) =>
        new Date(a.Issue_Date || "").getTime() -
        new Date(b.Issue_Date || "").getTime()
    );

  /*
    UNIQUE OP NUMBERS (for searchable OP-wise input)
  */
  const uniqueOPNumbers = Array.from(
    new Set(
      entriesData
        .map((item) => String(item.OP_Number || "").trim())
        .filter(Boolean)
    )
  ).sort();

  /*
    EXPIRY REPORT FILTER
  */
  const expiryReportEntries = medicinesData
    .map((item) => ({
      ...item,
      daysLeft: getDaysLeft(item.Expiry_Date),
    }))
    .filter((item) => item.daysLeft !== null && item.daysLeft <= expiryDays)
    .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));

  /*
    DASHBOARD SUMMARY (always visible, independent of filters)
  */
  const totalMedicinesCount = medicinesData.length;

  const totalStockUnits = medicinesData.reduce(
    (sum, item) => sum + (Number(item.Current_Stock) || 0),
    0
  );

  const expiringSoonCount = medicinesData.filter((item) => {
    const daysLeft = getDaysLeft(item.Expiry_Date);
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= 90;
  }).length;

  const outOfStockCount = medicinesData.filter(
    (item) => (Number(item.Current_Stock) || 0) <= 0
  ).length;

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-7xl mx-auto">

        {/* ===================================================== */}
        {/* PAGE HEADER */}
        {/* ===================================================== */}

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-5">
          <h1 className="text-3xl font-bold">📊 Reports</h1>
          <p className="text-gray-500 mt-2">Inventory Reports</p>
        </div>

        {/* ===================================================== */}
        {/* DASHBOARD SUMMARY */}
        {/* ===================================================== */}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">

          <div className="bg-white rounded-3xl shadow-lg p-5 text-center">
            <div className="text-3xl mb-1">📦</div>
            <div className="text-2xl font-bold text-slate-800">
              {loading ? "…" : totalMedicinesCount}
            </div>
            <div className="text-gray-500 text-sm mt-1">Total Medicines</div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-5 text-center">
            <div className="text-3xl mb-1">📊</div>
            <div className="text-2xl font-bold text-slate-800">
              {loading ? "…" : totalStockUnits.toLocaleString()}
            </div>
            <div className="text-gray-500 text-sm mt-1">Total Stock Units</div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-5 text-center">
            <div className="text-3xl mb-1">⚠️</div>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? "…" : expiringSoonCount}
            </div>
            <div className="text-gray-500 text-sm mt-1">Expiring Soon (90d)</div>
          </div>

          <div className="bg-white rounded-3xl shadow-lg p-5 text-center">
            <div className="text-3xl mb-1">❌</div>
            <div className="text-2xl font-bold text-red-600">
              {loading ? "…" : outOfStockCount}
            </div>
            <div className="text-gray-500 text-sm mt-1">Out of Stock</div>
          </div>

        </div>

        {/* ===================================================== */}
        {/* REPORT SELECTION */}
        {/* ===================================================== */}

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-5">

          <label className="block mb-2 font-medium">Report Type</label>

          <select
            value={reportType}
            onChange={(e) => {
              setReportType(e.target.value);
              setShowReport(false);

              if (e.target.value !== "stock-register") {
                setMedicine("");
                setFromDate("");
                setToDate("");
              }

              if (e.target.value !== "date-wise") {
                setDateWiseDate("");
              }

              if (e.target.value !== "op-wise") {
                setOpWiseOP("");
              }
            }}
            className="w-full border border-gray-300 rounded-xl p-3"
          >
            <option value="current-stock">📦 Current Stock Report</option>
            <option value="stock-register">📖 Stock Register</option>
            <option value="expiry">⏰ Expiry Report</option>
            <option value="date-wise">📅 Date-wise Issue Report</option>
            <option value="op-wise">🩺 OP-wise Report</option>
          </select>

          {/* ================================================= */}
          {/* STOCK REGISTER FILTERS */}
          {/* ================================================= */}

          {reportType === "stock-register" && (
            <div className="grid md:grid-cols-3 gap-4 mt-5">

              <div>
                <label className="block mb-2 font-medium">Medicine</label>
                <select
                  value={medicine}
                  onChange={(e) => setMedicine(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3"
                >
                  <option value="">All Medicines</option>
                  {medicinesData.map((item, index) => (
                    <option
                      key={item.Medicine_ID || index}
                      value={item.Medicine_Name || ""}
                    >
                      {item.Medicine_Name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-3"
                />
              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* EXPIRY REPORT FILTER */}
          {/* ================================================= */}

          {reportType === "expiry" && (
            <div className="mt-5 max-w-sm">
              <label className="block mb-2 font-medium">
                Show medicines expiring within (days)
              </label>
              <input
                type="number"
                min={0}
                value={expiryDays}
                onChange={(e) =>
                  setExpiryDays(
                    e.target.value === "" ? 0 : parseInt(e.target.value, 10)
                  )
                }
                placeholder="e.g. 10"
                className="w-full border border-gray-300 rounded-xl p-3"
              />
              <p className="text-sm text-gray-500 mt-2">
                Enter a number of days — medicines expiring within that window
                (or already expired) will be listed below. You can change this
                anytime and the report updates automatically.
              </p>
            </div>
          )}

          {/* ================================================= */}
          {/* DATE-WISE FILTER */}
          {/* ================================================= */}

          {reportType === "date-wise" && (
            <div className="mt-5 max-w-sm">
              <label className="block mb-2 font-medium">Select Date</label>
              <input
                type="date"
                value={dateWiseDate}
                onChange={(e) => setDateWiseDate(e.target.value)}
                className="w-full border border-gray-300 rounded-xl p-3"
              />
            </div>
          )}

          {/* ================================================= */}
          {/* OP-WISE FILTER */}
          {/* ================================================= */}

          {reportType === "op-wise" && (
            <div className="mt-5 max-w-sm">
              <label className="block mb-2 font-medium">OP Number</label>
              <input
                type="text"
                list="op-number-suggestions"
                value={opWiseOP}
                onChange={(e) => setOpWiseOP(e.target.value)}
                placeholder="Type or select an OP Number"
                className="w-full border border-gray-300 rounded-xl p-3"
              />
              <datalist id="op-number-suggestions">
                {uniqueOPNumbers.map((op) => (
                  <option key={op} value={op} />
                ))}
              </datalist>
              <p className="text-sm text-gray-500 mt-2">
                Start typing to search existing OP numbers, or pick one from
                the suggestions. Leave blank to show all.
              </p>
            </div>
          )}

          <button
            onClick={generateReport}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium"
          >
            Generate Report
          </button>

        </div>

        {/* ===================================================== */}
        {/* STOCK REGISTER */}
        {/* ===================================================== */}

        {showReport && reportType === "stock-register" && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
  <h2 className="text-2xl font-bold">
    📖 Stock Register
  </h2>

  <button
    onClick={() => window.print()}
    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
  >
    🖨️ Print
  </button>
</div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="p-3 text-center">Sl No</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">OP Number</th>
                    <th className="px-6 py-3 text-left">Medicine</th>
                    <th className="p-3 text-center">Quantity Issued</th>
                    <th className="p-3 text-center">Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {stockRegisterEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-5 text-center text-gray-500">
                        No entries found
                      </td>
                    </tr>
                  ) : (
                    stockRegisterEntries.map((item, index) => (
                      <tr
                        key={item.Entry_ID || index}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="p-3 text-center">{index + 1}</td>
                        <td className="px-6 py-3 text-left">
                          {formatDate(item.Issue_Date)}
                        </td>
                        <td className="px-6 py-3 text-left">{item.OP_Number}</td>
                        <td className="px-6 py-3 text-left">
                          {item.Medicine_Name}
                        </td>
                        <td className="p-3 text-center">{item.Quantity}</td>
                        <td className="p-3 text-center font-semibold text-blue-600">
                          {item.Balance_After_Issue}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* CURRENT STOCK */}
        {/* ===================================================== */}

        {showReport && reportType === "current-stock" && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📦 Current Stock Report</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-6 py-3 text-left">Medicine</th>
                    <th className="px-6 py-3 text-left">Batch</th>
                    <th className="px-6 py-3 text-left">Expiry</th>
                    <th className="p-3 text-center">Initial</th>
                    <th className="p-3 text-center">Issued</th>
                    <th className="p-3 text-center">Current</th>
                  </tr>
                </thead>

                <tbody>
                  {medicinesData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-5 text-center text-gray-500">
                        No medicines found
                      </td>
                    </tr>
                  ) : (
                    medicinesData.map((item, index) => {
                      const initial = Number(item.Initial_Stock) || 0;
                      const current = Number(item.Current_Stock) || 0;
                      const issued = initial - current;

                      return (
                        <tr
                          key={item.Medicine_ID || index}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="px-6 py-3 text-left">
                            {item.Medicine_Name}
                          </td>
                          <td className="px-6 py-3 text-left">
                            {item.Batch_Number}
                          </td>
                          <td className="px-6 py-3 text-left">
                            {formatDisplayDate(item.Expiry_Date)}
                          </td>
                          <td className="p-3 text-center">{initial}</td>
                          <td className="p-3 text-center text-blue-600 font-medium">
                            {issued}
                          </td>
                          <td className="p-3 text-center font-semibold">
                            {current}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* EXPIRY REPORT */}
        {/* ===================================================== */}

        {showReport && reportType === "expiry" && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">
              ⏰ Expiry Report — within {expiryDays} day
              {expiryDays === 1 ? "" : "s"}
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-6 py-3 text-left">Medicine</th>
                    <th className="px-6 py-3 text-left">Batch No</th>
                    <th className="px-6 py-3 text-left">Expiry Date</th>
                    <th className="p-3 text-center">Days Left</th>
                    <th className="p-3 text-center">Current Stock</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {expiryReportEntries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-5 text-center text-gray-500">
                        No medicines expiring within {expiryDays} days
                      </td>
                    </tr>
                  ) : (
                    expiryReportEntries.map((item, index) => {
                      const status = getExpiryStatus(item.daysLeft);

                      return (
                        <tr
                          key={item.Medicine_ID || index}
                          className="border-b hover:bg-slate-50"
                        >
                          <td className="px-6 py-3 text-left">
                            {item.Medicine_Name}
                          </td>
                          <td className="px-6 py-3 text-left">
                            {item.Batch_Number}
                          </td>
                          <td className="px-6 py-3 text-left">
                            {formatDisplayDate(item.Expiry_Date)}
                          </td>
                          <td className="p-3 text-center font-medium">
                            {item.daysLeft !== null
                              ? item.daysLeft < 0
                                ? `${Math.abs(item.daysLeft)} days ago`
                                : item.daysLeft
                              : "-"}
                          </td>
                          <td className="p-3 text-center font-semibold">
                            {item.Current_Stock}
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                            >
                              {status.emoji} {status.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* DATE-WISE ISSUE REPORT */}
        {/* ===================================================== */}

        {showReport && reportType === "date-wise" && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">📅 Date-wise Issue Report</h2>

            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
              <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200">
                <div className="text-2xl font-bold text-slate-800">
                  {dateWiseTotalOPs}
                </div>
                <div className="text-gray-500 text-sm mt-1">Total OPs</div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200">
                <div className="text-2xl font-bold text-slate-800">
                  {dateWiseTotalMedicines}
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  Medicines Issued
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-200">
                <div className="text-2xl font-bold text-slate-800">
                  {dateWiseTotalQuantity}
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  Quantity Issued
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-left">OP Number</th>
                    <th className="px-6 py-3 text-left">Medicine</th>
                    <th className="p-3 text-center">Quantity</th>
                  </tr>
                </thead>

                <tbody>
                  {dateWiseEntries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-5 text-center text-gray-500">
                        No entries found
                      </td>
                    </tr>
                  ) : (
                    dateWiseEntries.map((item, index) => (
                      <tr
                        key={item.Entry_ID || index}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="px-6 py-3 text-left">
                          {formatDate(item.Issue_Date)}
                        </td>
                        <td className="px-6 py-3 text-left">{item.OP_Number}</td>
                        <td className="px-6 py-3 text-left">
                          {item.Medicine_Name}
                        </td>
                        <td className="p-3 text-center">{item.Quantity}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* OP-WISE REPORT */}
        {/* ===================================================== */}

        {showReport && reportType === "op-wise" && (
          <div className="bg-white rounded-3xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">🩺 OP-wise Report</h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-800 text-white">
                    <th className="px-6 py-3 text-left">OP Number</th>
                    <th className="px-6 py-3 text-left">Animal Name</th>
                    <th className="px-6 py-3 text-left">Owner Name</th>
                    <th className="px-6 py-3 text-left">Species</th>
                    <th className="px-6 py-3 text-left">Medicine</th>
                    <th className="p-3 text-center">Quantity</th>
                    <th className="px-6 py-3 text-left">Date</th>
                  </tr>
                </thead>

                <tbody>
                  {opWiseEntries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-5 text-center text-gray-500">
                        No entries found
                      </td>
                    </tr>
                  ) : (
                    opWiseEntries.map((item, index) => (
                      <tr
                        key={item.Entry_ID || index}
                        className="border-b hover:bg-slate-50"
                      >
                        <td className="px-6 py-3 text-left">{item.OP_Number}</td>
                        <td className="px-6 py-3 text-left">
                          {item.Animal_Name || "-"}
                        </td>
                        <td className="px-6 py-3 text-left">
                          {item.Owner_Name || "-"}
                        </td>
                        <td className="px-6 py-3 text-left">
                          {item.Species || "-"}
                        </td>
                        <td className="px-6 py-3 text-left">
                          {item.Medicine_Name}
                        </td>
                        <td className="p-3 text-center">{item.Quantity}</td>
                        <td className="px-6 py-3 text-left">
                          {formatDate(item.Issue_Date)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ===================================================== */}
        {/* LOADING MESSAGE */}
        {/* ===================================================== */}

        {loading && (
          <div className="text-center text-gray-500 mt-5">
            Loading report data...
          </div>
        )}

      </div>
    </main>
  );
}