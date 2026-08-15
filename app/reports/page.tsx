"use client";

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
  Entered_By?: string;
  Entry_Timestamp?: string;
};

const API_URL =
  "https://script.google.com/macros/s/AKfycbzbcCJzVI12vs2K_vHhTxUhyhMveb8TQU-lfJYds_PDWvkw1k5-aI-UtNI8T09_E5UA/exec";

export default function ReportsPage() {
  const [reportType, setReportType] = useState("current-stock");
  const [showReport, setShowReport] = useState(false);

  const [medicine, setMedicine] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [dateWiseDate, setDateWiseDate] = useState("");

  const [opWiseOP, setOpWiseOP] = useState("");

  const [medicinesData, setMedicinesData] = useState<Medicine[]>([]);
  const [entriesData, setEntriesData] = useState<Entry[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const medicinesRes = await fetch(
        `${API_URL}?action=medicines`
      );

      const medicinesJson = await medicinesRes.json();

      setMedicinesData(
        Array.isArray(medicinesJson) ? medicinesJson : []
      );

      const entriesRes = await fetch(
        `${API_URL}?action=entries`
      );

      const entriesJson = await entriesRes.json();

      setEntriesData(
        Array.isArray(entriesJson) ? entriesJson : []
      );
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

  /*
    STOCK REGISTER FILTER
  */
  const stockRegisterEntries = entriesData.filter((item) => {
    const issueDate = formatDate(item.Issue_Date);

    const medicineMatch =
      !medicine ||
      String(item.Medicine_Name || "")
        .toLowerCase()
        .trim() === medicine.toLowerCase().trim();

    const fromDateMatch =
      !fromDate || issueDate >= fromDate;

    const toDateMatch =
      !toDate || issueDate <= toDate;

    return (
      medicineMatch &&
      fromDateMatch &&
      toDateMatch
    );
  });

  /*
    DATE-WISE REPORT FILTER
  */
  const dateWiseEntries = entriesData.filter((item) => {
    if (!dateWiseDate) return true;

    return (
      formatDate(item.Issue_Date) === dateWiseDate
    );
  });

  /*
    OP-WISE REPORT FILTER
  */
  const opWiseEntries = entriesData.filter((item) => {
    if (!opWiseOP) return true;

    return String(item.OP_Number || "")
      .toLowerCase()
      .includes(opWiseOP.toLowerCase());
  });

  return (
    <main className="min-h-screen bg-slate-100 p-4">
      <div className="max-w-7xl mx-auto">

        {/* ===================================================== */}
        {/* PAGE HEADER */}
        {/* ===================================================== */}

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-5">
          <h1 className="text-3xl font-bold">
            📊 Reports
          </h1>

          <p className="text-gray-500 mt-2">
            Inventory Reports
          </p>
        </div>

        {/* ===================================================== */}
        {/* REPORT SELECTION */}
        {/* ===================================================== */}

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-5">

          <label className="block mb-2 font-medium">
            Report Type
          </label>

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
            <option value="current-stock">
              📦 Current Stock Report
            </option>

            <option value="stock-register">
              📖 Stock Register
            </option>

            <option value="expiry">
              ⏰ Expiry Report
            </option>

            <option value="date-wise">
              📅 Date-wise Issue Report
            </option>

            <option value="op-wise">
              🩺 OP-wise Report
            </option>
          </select>

          {/* ================================================= */}
          {/* STOCK REGISTER FILTERS */}
          {/* ================================================= */}

          {reportType === "stock-register" && (
            <div className="grid md:grid-cols-3 gap-4 mt-5">

              <div>
                <label className="block mb-2 font-medium">
                  Medicine
                </label>

                <select
                  value={medicine}
                  onChange={(e) =>
                    setMedicine(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-xl p-3"
                >
                  <option value="">
                    All Medicines
                  </option>

                  {medicinesData.map(
                    (item, index) => (
                      <option
                        key={
                          item.Medicine_ID ||
                          index
                        }
                        value={
                          item.Medicine_Name || ""
                        }
                      >
                        {item.Medicine_Name}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  From Date
                </label>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) =>
                    setFromDate(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-xl p-3"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium">
                  To Date
                </label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) =>
                    setToDate(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-xl p-3"
                />
              </div>

            </div>
          )}

          {/* ================================================= */}
          {/* DATE-WISE FILTER */}
          {/* ================================================= */}

          {reportType === "date-wise" && (
            <div className="mt-5 max-w-sm">

              <label className="block mb-2 font-medium">
                Select Date
              </label>

              <input
                type="date"
                value={dateWiseDate}
                onChange={(e) =>
                  setDateWiseDate(e.target.value)
                }
                className="w-full border border-gray-300 rounded-xl p-3"
              />

            </div>
          )}

          {/* ================================================= */}
          {/* OP-WISE FILTER */}
          {/* ================================================= */}

          {reportType === "op-wise" && (
            <div className="mt-5 max-w-sm">

              <label className="block mb-2 font-medium">
                OP Number
              </label>

              <input
                type="text"
                value={opWiseOP}
                onChange={(e) =>
                  setOpWiseOP(e.target.value)
                }
                placeholder="Enter OP Number"
                className="w-full border border-gray-300 rounded-xl p-3"
              />

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

        {showReport &&
          reportType === "stock-register" && (

            <div className="bg-white rounded-3xl shadow-lg p-6">

              <h2 className="text-2xl font-bold mb-4">
                📖 Stock Register
              </h2>

              <div className="overflow-x-auto">

                <table className="w-full border-collapse">

                  

                  <thead>
                    <tr className="bg-slate-800 text-white">

                      <th className="px-6 py-3 text-left">
                        Date
                      </th>

                      <th className="px-6 py-3 text-left">
                        OP Number
                      </th>

                      <th className="px-6 py-3 text-left">
                        Medicine
                      </th>

                      <th className="p-3 text-center">
                        Quantity
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {stockRegisterEntries.length === 0 ? (

                      <tr>
                        <td
                          colSpan={4}
                          className="p-5 text-center text-gray-500"
                        >
                          No entries found
                        </td>
                      </tr>

                    ) : (

                      stockRegisterEntries.map(
                        (item, index) => (

                          <tr
                            key={
                              item.Entry_ID ||
                              index
                            }
                            className="border-b hover:bg-slate-50"
                          >

                            <td className="px-6 py-3 text-left">
                              {formatDate(
                                item.Issue_Date
                              )}
                            </td>

                            <td className="px-6 py-3 text-left">
                              {item.OP_Number}
                            </td>

                            <td className="px-6 py-3 text-left">
                              {item.Medicine_Name}
                            </td>

                            <td className="p-3 text-center">
                              {item.Quantity}
                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        {/* ===================================================== */}
        {/* CURRENT STOCK */}
        {/* ===================================================== */}

        {showReport &&
          reportType === "current-stock" && (

            <div className="bg-white rounded-3xl shadow-lg p-6">

              <h2 className="text-2xl font-bold mb-4">
                📦 Current Stock Report
              </h2>

              <div className="overflow-x-auto">

                <table className="w-full border-collapse">

                  

                  <thead>
                    <tr className="bg-slate-800 text-white">

                      <th className="px-6 py-3 text-left">
                        Medicine
                      </th>

                      <th className="px-6 py-3 text-left">
                        Batch
                      </th>

                      <th className="px-6 py-3 text-left">
                        Expiry
                      </th>

                      <th className="p-3 text-center">
                        Initial
                      </th>

                      <th className="p-3 text-center">
                        Current
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {medicinesData.length === 0 ? (

                      <tr>
                        <td
                          colSpan={5}
                          className="p-5 text-center text-gray-500"
                        >
                          No medicines found
                        </td>
                      </tr>

                    ) : (

                      medicinesData.map(
                        (item, index) => (

                          <tr
                            key={
                              item.Medicine_ID ||
                              index
                            }
                            className="border-b hover:bg-slate-50"
                          >

                            <td className="px-6 py-3 text-left">
                              {item.Medicine_Name}
                            </td>

                            <td className="px-6 py-3 text-left">
                              {item.Batch_Number}
                            </td>

                            <td className="px-6 py-3 text-left">
                              {item.Expiry_Date
                                ? new Date(
                                    item.Expiry_Date
                                  ).toLocaleDateString(
                                    "en-GB"
                                  )
                                : ""}
                            </td>

                            <td className="p-3 text-center">
                              {item.Initial_Stock}
                            </td>

                            <td className="p-3 text-center">
                              {item.Current_Stock}
                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        {/* ===================================================== */}
        {/* EXPIRY REPORT */}
        {/* ===================================================== */}

        {showReport &&
          reportType === "expiry" && (

            <div className="bg-white rounded-3xl shadow-lg p-6">

              <h2 className="text-2xl font-bold mb-4">
                ⏰ Expiry Report
              </h2>

              <div className="overflow-x-auto">

                <table className="w-full border-collapse">

                  

                  <thead>
                    <tr className="bg-slate-800 text-white">

                      <th className="px-6 py-3 text-left">
                        Medicine
                      </th>

                      <th className="px-6 py-3 text-left">
                        Batch
                      </th>

                      <th className="px-6 py-3 text-left">
                        Expiry Date
                      </th>

                      <th className="p-3 text-center">
                        Current Stock
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {medicinesData.length === 0 ? (

                      <tr>
                        <td
                          colSpan={4}
                          className="p-5 text-center text-gray-500"
                        >
                          No medicines found
                        </td>
                      </tr>

                    ) : (

                      medicinesData.map(
                        (item, index) => (

                          <tr
                            key={
                              item.Medicine_ID ||
                              index
                            }
                            className="border-b hover:bg-slate-50"
                          >

                            <td className="px-6 py-3 text-left">
                              {item.Medicine_Name}
                            </td>

                            <td className="px-6 py-3 text-left">
                              {item.Batch_Number}
                            </td>

                            <td className="px-6 py-3 text-left">
                              {item.Expiry_Date
                                ? new Date(
                                    item.Expiry_Date
                                  ).toLocaleDateString(
                                    "en-GB"
                                  )
                                : ""}
                            </td>

                            <td className="p-3 text-center">
                              {item.Current_Stock}
                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        {/* ===================================================== */}
        {/* DATE-WISE ISSUE REPORT */}
        {/* ===================================================== */}

        {showReport &&
          reportType === "date-wise" && (

            <div className="bg-white rounded-3xl shadow-lg p-6">

              <h2 className="text-2xl font-bold mb-4">
                📅 Date-wise Issue Report
              </h2>

              <div className="overflow-x-auto">

                <table className="w-full border-collapse">

                  

                  <thead>
                    <tr className="bg-slate-800 text-white">

                      <th className="px-6 py-3 text-left">
                        Date
                      </th>

                      <th className="px-6 py-3 text-left">
                        OP Number
                      </th>

                      <th className="px-6 py-3 text-left">
                        Medicine
                      </th>

                      <th className="p-3 text-center">
                        Quantity
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {dateWiseEntries.length === 0 ? (

                      <tr>
                        <td
                          colSpan={4}
                          className="p-5 text-center text-gray-500"
                        >
                          No entries found
                        </td>
                      </tr>

                    ) : (

                      dateWiseEntries.map(
                        (item, index) => (

                          <tr
                            key={
                              item.Entry_ID ||
                              index
                            }
                            className="border-b hover:bg-slate-50"
                          >

                            <td className="px-6 py-3 text-left">
                              {formatDate(
                                item.Issue_Date
                              )}
                            </td>

                            <td className="px-6 py-3 text-left">
                              {item.OP_Number}
                            </td>

                            <td className="px-6 py-3 text-left">
                              {item.Medicine_Name}
                            </td>

                            <td className="p-3 text-center">
                              {item.Quantity}
                            </td>

                          </tr>

                        )
                      )

                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}

        {/* ===================================================== */}
        {/* OP-WISE REPORT */}
        {/* ===================================================== */}

        {showReport &&
          reportType === "op-wise" && (

            <div className="bg-white rounded-3xl shadow-lg p-6">

              <h2 className="text-2xl font-bold mb-4">
                🩺 OP-wise Report
              </h2>

              <div className="overflow-x-auto">

                <table className="w-full border-collapse">

                  

                  <thead>
                    <tr className="bg-slate-800 text-white">

                      <th className="px-6 py-3 text-left">
                        OP Number
                      </th>

                      <th className="px-6 py-3 text-left">
                        Medicine
                      </th>

                      <th className="p-3 text-center">
                        Quantity
                      </th>

                      <th className="px-6 py-3 text-left">
                        Date
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {opWiseEntries.length === 0 ? (

                      <tr>
                        <td
                          colSpan={4}
                          className="p-5 text-center text-gray-500"
                        >
                          No entries found
                        </td>
                      </tr>

                    ) : (

                      opWiseEntries.map(
                        (item, index) => (

                          <tr
                            key={
                              item.Entry_ID ||
                              index
                            }
                            className="border-b hover:bg-slate-50"
                          >

                            <td className="px-6 py-3 text-left">
                              {item.OP_Number}
                            </td>

                            <td className="px-6 py-3 text-left">
                              {item.Medicine_Name}
                            </td>

                            <td className="p-3 text-center">
                              {item.Quantity}
                            </td>

                            <td className="px-6 py-3 text-left">
                              {formatDate(
                                item.Issue_Date
                              )}
                            </td>

                          </tr>

                        )
                      )

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