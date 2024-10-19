"use client";
import {
  getEntriesVmDataByDateVendor,
  getRefundByDateVendor,
  updateVmData,
} from "@/serverComponents/dbFunctions";
import VendorSelect from "@/components/VendorSelect";
import { useEffect, useState, useContext } from "react";
import DateSection from "@/components/DateSection";
import Alert from "@/components/Alert";
import { VendorContext } from "../Context/vendorcontext";
import { set } from "react-hook-form";
import { useSession } from "next-auth/react";
import Loader from "@/components/Loader";


export default function VendorMemo() {
  const { data: session, status } = useSession();

	if (status === "authenticated") {
		console.log("Session", session);
		if(session?.user?.role === "guest" || session?.user?.role === "user"){
			return (
				<div className="flex justify-center items-center h-screen">
					<h1 className="text-3xl text-white">You are not authorized to view this page :)</h1>
				</div>
			);
		}
	}
  const { selectedVMNDate, setSelectedVMNDate } = useContext(VendorContext);
  const today = new Date().toISOString().split("T")[0];
  const [records, setRecords] = useState([]);
  const [vendor, setVendor] = useState(selectedVMNDate.vendorname);
  const [date, setDate] = useState(today);
  const [count, setCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  const [tempRecords, setTempRecords] = useState([]);
  if (
    selectedVMNDate.date !== "" &&
    date !== selectedVMNDate.date &&
    count === 0
  ) {
    setDate(selectedVMNDate.date);
    setCount(1);
  }

  const [total, setTotal] = useState({
    weight: 0,
    quantity: 0,
    payable: 0,
    rate: 0,
    commision: 0,
    refund: 0,
  });
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [alert, setAlert] = useState({
    state: false,
    type: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getData() {
      setLoading(true);
      setRecords([]);
      setTotal({
        weight: 0,
        quantity: 0,
        payable: 0,
        rate: 0,
        commision: 0,
        refund: 0,
      });
      try {
        const data = await getEntriesVmDataByDateVendor({ date, vendor });
        console.log("data", data);
        const refundData = await getRefundByDateVendor({ date, vendor });
        console.log("refundData", refundData);

        if (refundData.length !== 0) {
          setTotal((prev) => ({
            ...prev,
            refund: Number(refundData[0].value),
          }));

          let tempWeight = 0;
          let tempQuantity = 0;

          data.forEach((data) => {
            const { weight, quantity } = data;
            tempWeight += Number(weight);
            tempQuantity += Number(quantity);
          });

          setTotal((prev) => ({
            ...prev,
            quantity: Number(tempQuantity),
            weight: Number(tempWeight),
          }));
        } else {
          setTotal((prev) => ({
            ...prev,
            refund: 0,
          }));
        }
        setRecords(data);
        
      setTempRecords(data);
      } catch (error) {
        setAlert({
          state: true,
          type: "danger",
          message: error.message,
        });
      } finally {
        setLoading(false);
      }
    }

    if (vendor !== "") {
      getData();
    }
  }, [date, vendor]);

  useEffect(() => {
    let tempPayable = 0;
    let tempRate = 0;
    let tempCommision = 0;

    records.forEach((data) => {
      const { payable, rate, commision } = data;
      (tempPayable += Number(payable)), (tempRate += Number(rate));
      tempCommision += Number(commision);
    });

    setTotal((prev) => ({
      ...prev,
      payable: Number(tempPayable),
      rate: Number(tempRate),
      commision: Number(tempCommision),
    }));

    console.log("records", records);
  }, [records]);


  const handleVendorChange = (e) => {
    const { value } = e.target;
    // setSelectedVMNDate({ vendorname: value, date: date });
    setVendor(value);
  };

  const refundHandle = (e) => {
    const { value, name } = e.target;
    setTotal((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    // Check if any record has a payable value of  0
    const hasZeroPayable = records.some((record) => record.payable === 0);

    if (hasZeroPayable) {
      setAlert({
        state: true,
        type: "danger",
        message:
          "कृपया सर्व रेकॉर्डमध्ये देय रक्कम 0 पेक्षा जास्त असल्याची खात्री करा.",
      });
      return; // Exit early if any payable is  0
    }

    try {
      setLoading(true);
      console.log("final", records);

      const existingData = await getEntriesVmDataByDateVendor({
        date,
        vendor,
      });
      console.log("existingData", existingData);
      // differentiate between updates and addiyions
      const updates = [];
      const additions = [];
      records.forEach((record) => {
        const { transactionid } = record;
        //  check if the commision, rate and payable are null in the existingData if null then addition if value exists then update
        const existingRecord = existingData.find(
          (data) => data.transactionid === transactionid
        );
        if (
          existingRecord.commision === null ||
          existingRecord.rate === null ||
          existingRecord.payable === null
        ) {
          additions.push(record);
        } else {
          if (
            record.payable !== existingRecord.payable ||
            record.rate !== existingRecord.rate ||
            record.commision !== existingRecord.commision
          ) {
            updates.push(record);
          }
        }
      });
      const res = await updateVmData({
        vendor,
        date,
        updates,
        additions,
        refund: total.refund,
      });
      setAlert({
        state: true,
        message: res.message,
        type: "success",
      });
      // added markvmdata in the query itself
    } catch (error) {
      setAlert({
        state: true,
        type: "danger",
        message: error,
      });
    } finally {
      setLoading(false);
    }
  };

  const rows = records.map((data, index) => (
    <Row
      data={data}
      index={index}
      setRecords={setRecords}
      key={data.transactionid}
      loading={loading}
    />
  ));

  const handleChange = (e) => {
    const { value } = e.target;
    console.log("Searching val",value);
    setSearchTerm(value);
  }

  useEffect(() => {
    if (searchTerm.trim()!== '') {
      const filteredRecords = records.filter(record =>
        Object.values(record).some(val =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setRecords(filteredRecords);
    } else {
      // Reset records if search term is cleared
      console.log("tempRecords");
      setRecords(tempRecords);
    }
    // if search term is emtpy then reset the records
    // if(searchTerm.length ){
    //   setRecords(tempRecords);
    // }
  }, [searchTerm]); // Depend on searchTerm to re-run this effect
  

  return (
    <div className="p-14">
      <div className="relative rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12 ">
        {alert.state && (
          <Alert
            message={alert.message}
            type={alert.type}
            setState={setAlert}
            timer={5000}
          />
        )}
        {loading && (
          <Loader />
        )}
        <div className={loading ? "opacity-20" : ""}>
          <DateSection date={date} setDate={setDate} />
        </div>
        <div className="flex flex-row justify-start space-x-4 mt-4">
          <div className={`my-6 w-3/12 ${loading ? "opacity-20" : ""}`}>
            <VendorSelect
              handleChange={handleVendorChange}
              value={vendor}
              setLoadingVendors={setLoadingVendors}
              loading={loadingVendors}
            />
          </div>
          <div className="flex space-x-4 ">
            <div className="flex items-center">
              <label className="sr-only" htmlFor="farmerName">
                farmerName
              </label>
              <input
                className=" rounded-lg border-gray-200 p-3 text-sm"
                placeholder="Search by name"
                type="text"
                id="searchFarmer"
                name="searchFarmer"
                onChange={handleChange}
                // value={data.farmerName}
                disabled={loading}
                // required
              />
            </div>
            
          </div>
        </div>
        {records.length != 0 && (
          <form
            className={`flex flex-col justify-center ${
              loading ? "opacity-20" : ""
            }`}
            onSubmit={handleFormSubmit}
          >
            <table className="min-w-full divide-y-2  divide-gray-200 bg-white text-sm mt-5 hidden md:block">
              <thead className="">
                <tr>
                  <th className="whitespace-nowrap px-8 py-2 font-medium text-gray-900">
                    Sr. No.
                  </th>
                  <th className="whitespace-nowrap px-8 py-2 font-medium text-gray-900">
                   Amount Recievable
                  </th>
                  <th className="whitespace-nowrap px-8 py-2 font-medium text-gray-900">
                  farmerName
                  </th>

                  <th className="whitespace-nowrap px-8 py-2 font-medium text-gray-900">
                    Item
                  </th>
                  <th className="whitespace-nowrap px-8 py-2 font-medium text-gray-900">
                    Qty
                  </th>
                  <th className="whitespace-nowrap px-8 py-2 font-medium text-gray-900">
                    Weight
                  </th>
                  <th className="whitespace-nowrap px-8 py-2 font-medium text-gray-900">
                    Per 10 Kg Rate
                  </th>
                  <th className="whitespace-nowrap px-8 py-2 font-medium text-gray-900">
                    Commission
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rows.length !== 0 && rows}
                {rows.length !== 0 && (
                  <tr>
                    <td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900">
                     Total
                    </td>
                    <td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900 ">
                      ₹{total.payable.toLocaleString("en-IN")}/-
                    </td>
                    <td
                      className="whitespace-nowrap text-center py-4 font-semibold text-gray-900"
                      colSpan={2}
                    ></td>

                    <td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900 ">
                      {total.quantity}
                    </td>
                    <td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900 ">
                      {total.weight}
                    </td>
                    <td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900 ">
                      {total.rate}
                    </td>
                    <td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900 ">
                      {total.commision}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            {rows.length !== 0 && (
              <div>
                <div className="flex items-center my-2 ">
                  <label
                    htmlFor="refund"
                    className="font-medium text-sm text-gray-900 mx-5"
                  >
                    Refund :
                  </label>
                  <input
                    className="w-24 border-0 border-b appearance-none focus:outline-none focus:ring-0 border-gray-200 px-2 py-1 text-center text-sm  "
                    type="number"
                    id="refund"
                    name="refund"
                    onChange={refundHandle}
                    onWheel={(e) => e.target.blur()}
                    value={total.refund}
                    disabled={loading}
                    required
                  />
                </div>
                <div className="flex items-center my-2 text-lg ">
                  <label
                    htmlFor="refund"
                    className="font-medium  text-gray-900 mx-5"
                  >
                    Total Receivable :
                    <span className=" px-4 font-semibold text-gray-900 ">
                      ₹
                      {(
                        Number(total.payable) +
                        Number(total.commision) +
                        Number(total.refund)
                      ).toLocaleString("en-IN")}
                      /-
                    </span>
                  </label>
                </div>
              </div>
            )}
            {records.length !== 0 && (
              <div className="flex mt-8 justify-center items-center">
                <button
                  type="submit"
                  name="save"
                  className={`inline-block w-full rounded-lg bg-black px-10 py-3 mx-10 font-medium text-white sm:w-auto`}
                >
                  Save
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

const Row = ({
  data: { farmername, item, quantity, weight, payable, rate, commision },
  index,
  setRecords,
  loading,
}) => {
  const [vmData, setVmData] = useState({
    payable: Number(payable) || 0,
    rate: Number(rate) || 0,
    commision: Number(commision) || 0,
  });
  const handleChange = (e) => {
    const { value, name } = e.target;
    console.log(vmData);
    setVmData((prev) => {
      return { ...prev, [name]: value };
    });
  };
  // const handleFocusOut = (e) => {
  //   const { name, value } = e.target;
  //   setRecords((prev) => {
  //     prev[index][name] = Number(value);
  //     return [...prev];
  //   });
  // };
  useEffect(() => {
    setRecords((prev) => {
      prev[index].payable = Number(vmData.payable);
      prev[index].rate = Number(vmData.rate);
      prev[index].commision = Number(vmData.commision);
      return [...prev];
    });
  }, [vmData]);

  return (
    <tr>
      <td className="whitespace-nowrap text-center  py-2 font-medium text-gray-700">
        {index + 1}
      </td>

      <td className="whitespace-nowrap text-center py-2  text-gray-700">
        <input
          className="w-14 border-0 border-b appearance-none focus:outline-none focus:ring-0 border-gray-200 px-2 py-1 text-center text-sm  "
          step="any"
          type="number"
          name="payable"
          onChange={handleChange}
          // onBlur={handleFocusOut}
          onWheel={(e) => e.target.blur()}
          value={vmData.payable}
          disabled={loading}
          required
        />
      </td>
      <td className="whitespace-nowrap text-center py-2 text-gray-700">
        {farmername}
      </td>

      <td className="whitespace-nowrap text-center py-2 text-gray-700">
        {item}
      </td>
      <td className="whitespace-nowrap text-center py-2 text-gray-700">
        {quantity}
      </td>
      <td className="whitespace-nowrap text-center py-2 text-gray-700">
        {weight}
      </td>

      <td className="whitespace-nowrap text-center py-2  text-gray-700">
        <input
          className="w-14 border-0 border-b appearance-none focus:outline-none focus:ring-0 border-gray-200 px-2 py-1 text-center text-sm  "
          step="any"
          type="number"
          name="rate"
          onChange={handleChange}
          // onBlur={handleFocusOut}
          onWheel={(e) => e.target.blur()}
          value={vmData.rate}
          disabled={loading}
          required
        />
      </td>
      <td className="whitespace-nowrap text-center py-2  text-gray-700">
        <input
          className="w-14 border-0 border-b appearance-none focus:outline-none focus:ring-0 border-gray-200 px-2 py-1 text-center text-sm  "
          step="any"
          type="number"
          name="commision"
          value={vmData.commision}
          onChange={handleChange}
          // onBlur={handleFocusOut}
          onWheel={(e) => e.target.blur()}
          disabled={loading}
          required
        />
      </td>
    </tr>
  );
};
