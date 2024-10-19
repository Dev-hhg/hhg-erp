'use client';
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import {
  addAdvance,
  getAdvanceDetails,
  getFarmers,
} from "@/serverComponents/dbFunctions";
import DateSection from "@/components/DateSection";
import Alert from "@/components/Alert";

export default function Page() {
  const [farmers, setFarmers] = useState([]);
  const [searchedFarmers, setSearchedFarmers] = useState([]);
  const { data: session, status } = useSession();

  const [alert, setAlert] = useState({
    state: false,
    type: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [data, setData] = useState({
    farmerName: "",
    uid: "",
    farmerid: "",
    amount: "",
    paymentMode: "",
    date: "",
  });
  const [recentData, setRecentData] = useState([]);
  const [submit, setSubmit] = useState(false);
  const [isDisabledInput, setIsDisabledInput] = useState({
    farmerName: false,
    uid: false,
  });

  useEffect(() => {
    const getFarmerDetails = async () => {
      try {
        const tempFarmers = await getFarmers();
        localStorage.setItem("farmers", JSON.stringify(tempFarmers));
        setFarmers(tempFarmers);
      } catch (error) {
        setAlert({
          state: true,
          type: "danger",
          message: error.toString(),
        });
      }
    };

    const storageFarmers = localStorage.getItem("farmers");
    if (storageFarmers) {
      setFarmers(JSON.parse(storageFarmers));
    } else {
      getFarmerDetails();
    }
  }, []);

  useEffect(() => {
    const getRecentData = async () => {
      if (data.farmerid) {
        try {
          const tempRecentData = await getAdvanceDetails({
            farmerid: data.farmerid,
          });
          setRecentData(tempRecentData);
        } catch (error) {
          setAlert({
            state: true,
            type: "danger",
            message: error.toString(),
          });
        }
      }
    };
    getRecentData();
  }, [data.farmerid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmit(true);
    setData((prev) => ({ ...prev, date }));

    if (data.uid.length !== 5 && data.uid !== "") {
      setAlert({
        state: true,
        type: "danger",
        message: "UID should be 5 digits",
      });
      setLoading(false);
      return;
    }

    try {
      const res = await addAdvance({ farmerid: data.farmerid, date, ...data });
      if (res?.error) throw res.error;
      setAlert({
        state: true,
        type: "success",
        message: "Advance added successfully",
      });
      resetForm();
    } catch (error) {
      setAlert({
        state: true,
        type: "danger",
        message: error.toString(),
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setData({
      farmerName: "",
      uid: "",
      farmerid: "",
      amount: "",
      paymentMode: "",
      date: "",
    });
    setDate(new Date().toISOString().split("T")[0]);
    setIsDisabledInput({
      farmerName: false,
      uid: false,
    });
    setSearchedFarmers([]);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value, date }));

    if (name === "farmerName") {
      searchFarmers(value);
    }
  };

  const searchFarmers = (query) => {
    if (query.trim() === "") {
      setSearchedFarmers([]);
    } else {
      const filtered = farmers.filter((farmer) =>
        farmer.farmername.toLowerCase().includes(query.toLowerCase())
      );
      setSearchedFarmers(filtered);
    }
  };

  const handleFarmerSelect = (farmer) => {
    setData((prev) => ({
      ...prev,
      farmerName: farmer.farmername,
      uid: farmer.uid,
      farmerid: farmer.farmerid,
    }));
    setSearchedFarmers([]);
    setIsDisabledInput({ farmerName: true, uid: true });
  };

  const handleSearchByUid = async () => {
    if (data.uid.length === 5 && data.uid !== "00000") {
      const entry = farmers.find((farmer) => farmer.uid === data.uid);
      if (entry) {
        setData((prev) => ({
          ...prev,
          farmerName: entry.farmername,
          farmerid: entry.farmerid,
        }));
        setIsDisabledInput({ farmerName: true, uid: true });
      }
    }
  };

  if (status === "authenticated" && (session?.user?.role === "guest" || session?.user?.role === "user")) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-3xl text-white">You are not authorized to view this page</h1>
      </div>
    );
  }

  return (
    <div className="p-14">
      {alert.state && (
        <Alert
          message={alert.message}
          type={alert.type}
          setState={setAlert}
          timer={2000}
          relod={true}
        />
      )}

      <div className="rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
        <div>
          <DateSection
            date={date}
            name="date"
            setDate={setDate}
            handleChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        <div className="flex space-x-4">
          <div className="w-full md:w-1/2 lg:w-1/2">
            <form onSubmit={handleSubmit} className="mt-4 space-y-4 w-full">
              <h1 className="text-2xl align-middle font-bold text-center whitespace-nowrap">
                Farmer Advance
              </h1>

              <div>
                <label className="sr-only" htmlFor="uid">
                  UID
                </label>
                <input
                  autoComplete="off"
                  className="w-full rounded-lg border-gray-200 p-3 text-sm e-disable"
                  placeholder="5 digit UID"
                  type="number"
                  id="uid"
                  name="uid"
                  onChange={handleChange}
                  value={data.uid}
                  disabled={loading || isDisabledInput.uid}
                  onBlur={handleSearchByUid}
                  autoFocus
                />
              </div>
              <div className="relative">
                <label className="sr-only" htmlFor="farmerName">
                farmerName
                </label>
                <input
                  autoComplete="off"
                  className="w-full rounded-lg border-gray-200 p-3 text-sm e-disable"
                  placeholder="farmerName"
                  type="text"
                  id="farmerName"
                  name="farmerName"
                  onChange={handleChange}
                  value={data.farmerName}
                  disabled={isDisabledInput.farmerName || loading}
                  required
                />
                {searchedFarmers.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchedFarmers.map((farmer) => (
                      <li
                        key={farmer.farmerid}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleFarmerSelect(farmer)}
                      >
                        {farmer.farmername}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <label className="sr-only" htmlFor="amount">
                  Amount Given
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Amount Given"
                  type="number"
                  id="amount"
                  name="amount"
                  min="0"
                  required
                  value={data.amount}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="sr-only" htmlFor="paymentMode">
                  Payment Description
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="Payment Description"
                  type="text"
                  id="paymentMode"
                  name="paymentMode"
                  value={data.paymentMode}
                  required
                  onChange={handleChange}
                />
              </div>
              <div>
                <button
                  type="submit"
                  className={`w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto ${
                    submit ? "cursor-not-allowed bg-gray-400" : ""
                  }`}
                  disabled={submit}
                >
                  Add Advance
                </button>
              </div>
            </form>
          </div>

          {/* Recent entries table */}
          <div className="mt-4 w-1/2 lg:w-1/2 hidden md:block lg:block">
            <h1 className="text-2xl align-middle font-bold text-center whitespace-nowrap">
              Recent Entries
            </h1>
            <table className="justify-center divide-y divide-gray-900 bg-white md:text-sm mt-5 text-xs border border-gray-900 w-full">
              <thead>
                <tr>
                  <th className="whitespace-nowrap px-1 md:px-4 py-2 font-bold text-gray-900">
                    Sr. No.
                  </th>
                  <th className="whitespace-nowrap px-1 md:px-4 py-2 font-bold text-gray-900">
                    Amount
                  </th>
                  <th className="whitespace-nowrap px-1 md:px-4 py-2 font-bold text-gray-900">
                   Description
                  </th>
                  <th className="whitespace-nowrap px-1 md:px-4 py-2 font-bold text-gray-900">
                    Date
                  </th>
                  <th className="whitespace-nowrap px-1 md:px-4 py-2 font-bold text-gray-900">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {recentData.map((entry, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap text-center py-2 text-gray-700">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap text-center py-2 text-gray-700">
                      ₹{entry.amount.toLocaleString("en-IN")}/-
                    </td>
                    <td className="whitespace-nowrap text-center py-2 text-gray-700">
                      {entry.description}
                    </td>
                    <td className="whitespace-nowrap text-center py-2 text-gray-700">
                      {new Date(entry.date).toLocaleDateString("en-IN")}
                    </td>
                    <td className="whitespace-nowrap text-center py-2 text-gray-700">
                      {entry.time}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}