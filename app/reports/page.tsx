"use client";

import { useEffect, useState } from "react";

const API_URL =
  "https://script.google.com/macros/s/AKfycbzbcCJzVI12vs2K_vHhTxUhyhMveb8TQU-lfJYds_PDWvkw1k5-aI-UtNI8T09_E5UA/exec";

export default function ReportsPage() {
  const [reportType, setReportType] =
    useState("current-stock");

  const [showReport, setShowReport] =
    useState(false);

  const [expiryDays, setExpiryDays] =
    useState(30);

  const [medicine, setMedicine] =
    useState("");

  const [fromDate, setFromDate] =
    useState("");

  const [toDate, setToDate] =
    useState("");

  const [medicinesData, setMedicinesData] =
    useState<any[]>([]);

  const [entriesData, setEntriesData] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadData();
  }, []);


  const loadData = async () => {
    try {
      setLoading(true);

      const medicinesRes =
        await fetch(
          `${API_URL}?action=medicines`
        );

      const medicinesJson =
        await medicinesRes.json();

      if (Array.isArray(medicinesJson)) {
        setMedicinesData(
          medicinesJson
        );
      } else {
        setMedicinesData([]);
      }


      const entriesRes =
        await fetch(
          `${API_URL}?action=entries`
        );

      const entriesJson =
        await entriesRes.json();

      if (Array.isArray(entriesJson)) {
        setEntriesData(
          entriesJson
        );
      } else {
        setEntriesData([]);
      }

    } catch (error) {
      console.error(
        "Error loading data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // GENERATE REPORT
  // =====================================================

  const generateReport = () => {
    setShowReport(true);
  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value: any) => {
    if (!value) return "";

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return "";
    }

    return date.toLocaleDateString(
      "en-GB"
    );
  };


  // =====================================================
  // DATE FOR FILTERING
  // =====================================================

  const getDateOnly = (
    value: any
  ) => {
    if (!value) return null;

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return null;
    }

    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    );
  };


  // =====================================================
  // GET DAYS UNTIL EXPIRY
  // =====================================================

  const getDaysUntilExpiry = (
    expiryDate: any
  ) => {
    if (!expiryDate) {
      return Infinity;
    }

    const today =
      new Date();

    today.setHours(
      0,
      0,
      0,
      0
    );

    const expiry =
      new Date(
        expiryDate
      );

    if (
      Number.isNaN(
        expiry.getTime()
      )
    ) {
      return Infinity;
    }

    expiry.setHours(
      0,
      0,
      0,
      0
    );

    return Math.ceil(
      (
        expiry.getTime() -
        today.getTime()
      ) /
        (
          1000 *
          60 *
          60 *
          24
        )
    );
  };


  // =====================================================
  // EXPIRY REPORT DATA
  // =====================================================

  const expiryReportData =
    medicinesData.filter(
      (item: any) => {

        const daysLeft =
          getDaysUntilExpiry(
            item.Expiry_Date
          );

        return (
          daysLeft >= 0 &&
          daysLeft <= expiryDays
        );
      }
    );


  // =====================================================
  // STOCK REGISTER FILTER
  // =====================================================

  const stockRegisterData =
    entriesData.filter(
      (item: any) => {

        // -----------------------------------------------
        // MEDICINE FILTER
        // -----------------------------------------------

        if (medicine) {

          const selectedMedicine =
            medicine
              .trim()
              .toLowerCase();

          const entryMedicine =
            String(
              item.Medicine_Name || ""
            )
              .trim()
              .toLowerCase();

          if (
            selectedMedicine !==
            entryMedicine
          ) {
            return false;
          }
        }


        // -----------------------------------------------
        // FROM DATE FILTER
        // -----------------------------------------------

        if (fromDate) {

          const entryDate =
            getDateOnly(
              item.Issue_Date
            );

          const startDate =
            getDateOnly(
              fromDate
            );

          if (
            !entryDate ||
            !startDate
          ) {
            return false;
          }

          if (
            entryDate <
            startDate
          ) {
            return false;
          }
        }


        // -----------------------------------------------
        // TO DATE FILTER
        // -----------------------------------------------

        if (toDate) {

          const entryDate =
            getDateOnly(
              item.Issue_Date
            );

          const endDate =
            getDateOnly(
              toDate
            );

          if (
            !entryDate ||
            !endDate
          ) {
            return false;
          }

          if (
            entryDate >
            endDate
          ) {
            return false;
          }
        }


        return true;
      }
    );


  // =====================================================
  // UNIQUE MEDICINE LIST
  // =====================================================

  const uniqueMedicines =
    Array.from(
      new Map(
        medicinesData.map(
          (item: any) => [
            String(
              item.Medicine_Name || ""
            )
              .trim()
              .toLowerCase(),

            item
          ]
        )
      ).values()
    );


  // =====================================================
  // PAGE
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-100 p-4">

      <div className="max-w-7xl mx-auto">


        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-5">

          <h1 className="text-3xl font-bold">
            📊 Reports
          </h1>

          <p className="text-gray-500 mt-2">
            Inventory Reports
          </p>

        </div>


        {/* =================================================
            REPORT CONTROLS
        ================================================= */}

        <div className="bg-white rounded-3xl shadow-lg p-6 mb-5">

          <label className="block mb-2 font-medium">
            Report Type
          </label>


          <select
            value={reportType}
            onChange={(e) => {

              setReportType(
                e.target.value
              );

              setShowReport(false);

            }}
            className="w-full border rounded-xl p-3"
          >

            <option value="stock-register">
              📖 Stock Register
            </option>

            <option value="current-stock">
              📦 Current Stock Report
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


          {/* =================================================
              EXPIRY SETTINGS
          ================================================= */}

          {reportType === "expiry" && (

            <div className="mt-4 max-w-sm">

              <label className="block mb-2 font-medium">
                Show medicines expiring within (days)
              </label>

              <input
                type="number"
                min="0"
                value={expiryDays}
                onChange={(e) =>
                  setExpiryDays(
                    Math.max(
                      0,
                      Number(
                        e.target.value
                      )
                    )
                  )
                }
                className="w-full border rounded-xl p-3"
                placeholder="e.g. 30"
              />

              <p className="text-sm text-gray-500 mt-1">
                Only medicines with an expiry date from
                today up to this number of days will be shown.
              </p>

            </div>

          )}


          {/* =================================================
              STOCK REGISTER FILTERS
          ================================================= */}

          {reportType === "stock-register" && (

            <div className="grid md:grid-cols-3 gap-4 mt-4">


              {/* MEDICINE */}

              <div>

                <label className="block mb-2 font-medium">
                  Medicine
                </label>

                <select
                  value={medicine}
                  onChange={(e) =>
                    setMedicine(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                >

                  <option value="">
                    All Medicines
                  </option>


                  {uniqueMedicines.map(
                    (item: any) => (

                      <option
                        key={
                          item.Medicine_ID ||
                          item.Medicine_Name
                        }
                        value={
                          item.Medicine_Name
                        }
                      >
                        {
                          item.Medicine_Name
                        }
                      </option>

                    )
                  )}

                </select>

              </div>


              {/* FROM DATE */}

              <div>

                <label className="block mb-2 font-medium">
                  From Date
                </label>

                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) =>
                    setFromDate(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

              </div>


              {/* TO DATE */}

              <div>

                <label className="block mb-2 font-medium">
                  To Date
                </label>

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) =>
                    setToDate(
                      e.target.value
                    )
                  }
                  className="w-full border rounded-xl p-3"
                />

              </div>

            </div>

          )}


          {/* =================================================
              GENERATE BUTTON
          ================================================= */}

          <button
            onClick={
              generateReport
            }
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl"
          >
            Generate Report
          </button>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading && (

          <div className="bg-white rounded-3xl shadow-lg p-8 text-center">

            Loading reports...

          </div>

        )}


        {/* =================================================
            STOCK REGISTER
        ================================================= */}

        {showReport &&
          !loading &&
          reportType ===
            "stock-register" && (

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">

              <h2 className="text-2xl font-bold">
                📖 Stock Register
              </h2>

              <div className="text-sm text-gray-500 mt-2 md:mt-0">

                {medicine
                  ? `Medicine: ${medicine}`
                  : "All Medicines"}

                {(fromDate ||
                  toDate) && (
                  <span>
                    {" "}
                    |{" "}
                    {fromDate
                      ? formatDate(
                          fromDate
                        )
                      : "Start"}

                    {" - "}

                    {toDate
                      ? formatDate(
                          toDate
                        )
                      : "Today"}
                  </span>
                )}

              </div>

            </div>


            <div className="overflow-x-auto">

              <table className="w-full table-auto border-collapse">


                {/* HEADER */}

                <thead>

                  <tr className="bg-slate-800 text-white">

                    <th className="p-3 text-center align-middle whitespace-nowrap">
                      Date
                    </th>

                    <th className="p-3 text-center align-middle whitespace-nowrap">
                      OP Number
                    </th>

                    <th className="p-3 text-center align-middle whitespace-nowrap">
                      Medicine
                    </th>

                    <th className="p-3 text-center align-middle whitespace-nowrap">
                      Quantity
                    </th>

                  </tr>

                </thead>


                {/* BODY */}

                <tbody>

                  {stockRegisterData.map(
                    (
                      item: any,
                      index: number
                    ) => (

                    <tr
                      key={index}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="p-3 text-center align-middle">
                        {
                          formatDate(
                            item.Issue_Date
                          )
                        }
                      </td>


                      <td className="p-3 text-center align-middle">
                        {
                          item.OP_Number
                        }
                      </td>


                      <td className="p-3 text-left align-middle font-medium">
                        {
                          item.Medicine_Name
                        }
                      </td>


                      <td className="p-3 text-center align-middle">
                        {
                          item.Quantity
                        }
                      </td>

                    </tr>

                  ))}


                  {/* NO DATA */}

                  {stockRegisterData.length ===
                    0 && (

                    <tr>

                      <td
                        colSpan={4}
                        className="p-8 text-center text-gray-500"
                      >

                        {medicine
                          ? `No stock entries found for ${medicine}.`
                          : "No stock entries found."}

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}


        {/* =================================================
            CURRENT STOCK REPORT
        ================================================= */}

        {showReport &&
          !loading &&
          reportType ===
            "current-stock" && (

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-4">
              📦 Current Stock Report
            </h2>


            <div className="overflow-x-auto">

              <table className="w-full table-auto border-collapse">

                <thead>

                  <tr className="bg-slate-800 text-white">

                    <th className="p-3 text-center align-middle">
                      Medicine
                    </th>

                    <th className="p-3 text-center align-middle">
                      Batch
                    </th>

                    <th className="p-3 text-center align-middle">
                      Expiry
                    </th>

                    <th className="p-3 text-center align-middle">
                      Initial
                    </th>

                    <th className="p-3 text-center align-middle">
                      Current
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {medicinesData.map(
                    (
                      item: any,
                      index: number
                    ) => (

                    <tr
                      key={index}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="p-3 text-left">
                        {
                          item.Medicine_Name
                        }
                      </td>

                      <td className="p-3 text-center">
                        {
                          item.Batch_Number
                        }
                      </td>

                      <td className="p-3 text-center">
                        {
                          formatDate(
                            item.Expiry_Date
                          )
                        }
                      </td>

                      <td className="p-3 text-center">
                        {
                          item.Initial_Stock
                        }
                      </td>

                      <td className="p-3 text-center">

                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            Number(
                              item.Current_Stock
                            ) <= 10
                              ? "bg-red-100 text-red-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >

                          {
                            item.Current_Stock
                          }

                        </span>

                      </td>

                    </tr>

                  ))}


                  {medicinesData.length ===
                    0 && (

                    <tr>

                      <td
                        colSpan={5}
                        className="p-8 text-center text-gray-500"
                      >
                        No medicines found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}


        {/* =================================================
            EXPIRY REPORT
        ================================================= */}

        {showReport &&
          !loading &&
          reportType ===
            "expiry" && (

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-4">
              ⏰ Expiry Report
            </h2>


            <div className="overflow-x-auto">

              <table className="w-full table-auto border-collapse">

                <thead>

                  <tr className="bg-slate-800 text-white">

                    <th className="p-3 text-center align-middle">
                      Medicine
                    </th>

                    <th className="p-3 text-center align-middle">
                      Batch
                    </th>

                    <th className="p-3 text-center align-middle">
                      Expiry Date
                    </th>

                    <th className="p-3 text-center align-middle">
                      Days Left
                    </th>

                    <th className="p-3 text-center align-middle">
                      Current Balance
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {expiryReportData.map(
                    (
                      item: any,
                      index: number
                    ) => (

                    <tr
                      key={index}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="p-3 text-left align-middle">
                        {
                          item.Medicine_Name
                        }
                      </td>

                      <td className="p-3 text-center align-middle">
                        {
                          item.Batch_Number
                        }
                      </td>

                      <td className="p-3 text-center align-middle">
                        {
                          formatDate(
                            item.Expiry_Date
                          )
                        }
                      </td>

                      <td className="p-3 text-center align-middle">

                        {
                          getDaysUntilExpiry(
                            item.Expiry_Date
                          )
                        }

                      </td>

                      <td className="p-3 text-center align-middle font-semibold">

                        {
                          item.Current_Stock
                        }

                      </td>

                    </tr>

                  ))}


                  {expiryReportData.length ===
                    0 && (

                    <tr>

                      <td
                        colSpan={5}
                        className="p-6 text-center text-gray-500"
                      >

                        No medicines are expiring within{" "}
                        {expiryDays} days.

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}


        {/* =================================================
            DATE-WISE ISSUE REPORT
        ================================================= */}

        {showReport &&
          !loading &&
          reportType ===
            "date-wise" && (

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-4">
              📅 Date-wise Issue Report
            </h2>


            <div className="overflow-x-auto">

              <table className="w-full table-auto border-collapse">

                <thead>

                  <tr className="bg-slate-800 text-white">

                    <th className="p-3 text-center align-middle">
                      Date
                    </th>

                    <th className="p-3 text-center align-middle">
                      OP Number
                    </th>

                    <th className="p-3 text-center align-middle">
                      Medicine
                    </th>

                    <th className="p-3 text-center align-middle">
                      Quantity
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {entriesData.map(
                    (
                      item: any,
                      index: number
                    ) => (

                    <tr
                      key={index}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="p-3 text-center">
                        {
                          formatDate(
                            item.Issue_Date
                          )
                        }
                      </td>

                      <td className="p-3 text-center">
                        {
                          item.OP_Number
                        }
                      </td>

                      <td className="p-3 text-left">
                        {
                          item.Medicine_Name
                        }
                      </td>

                      <td className="p-3 text-center">
                        {
                          item.Quantity
                        }
                      </td>

                    </tr>

                  ))}


                  {entriesData.length ===
                    0 && (

                    <tr>

                      <td
                        colSpan={4}
                        className="p-6 text-center text-gray-500"
                      >
                        No entries found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}


        {/* =================================================
            OP-WISE REPORT
        ================================================= */}

        {showReport &&
          !loading &&
          reportType ===
            "op-wise" && (

          <div className="bg-white rounded-3xl shadow-lg p-6">

            <h2 className="text-2xl font-bold mb-4">
              🩺 OP-wise Report
            </h2>


            <div className="overflow-x-auto">

              <table className="w-full table-auto border-collapse">

                <thead>

                  <tr className="bg-slate-800 text-white">

                    <th className="p-3 text-center align-middle">
                      OP Number
                    </th>

                    <th className="p-3 text-center align-middle">
                      Medicine
                    </th>

                    <th className="p-3 text-center align-middle">
                      Quantity
                    </th>

                    <th className="p-3 text-center align-middle">
                      Date
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {entriesData.map(
                    (
                      item: any,
                      index: number
                    ) => (

                    <tr
                      key={index}
                      className="border-b hover:bg-slate-50"
                    >

                      <td className="p-3 text-center">
                        {
                          item.OP_Number
                        }
                      </td>

                      <td className="p-3 text-left">
                        {
                          item.Medicine_Name
                        }
                      </td>

                      <td className="p-3 text-center">
                        {
                          item.Quantity
                        }
                      </td>

                      <td className="p-3 text-center">
                        {
                          formatDate(
                            item.Issue_Date
                          )
                        }
                      </td>

                    </tr>

                  ))}


                  {entriesData.length ===
                    0 && (

                    <tr>

                      <td
                        colSpan={4}
                        className="p-6 text-center text-gray-500"
                      >
                        No entries found.
                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}