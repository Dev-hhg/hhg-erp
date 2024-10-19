"use client";
import Alert from "@/components/Alert";
import DateSection from "@/components/DateSection";
import { getDailyPaidEntries } from "@/serverComponents/dbFunctions";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

function Page() {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    console.log("Session", session);
    if (session?.user?.role === "guest") {
      return (
        <div className="flex justify-center items-center h-screen">
          <h1 className="text-3xl text-white">You are not authorized to view this page</h1>
        </div>
      );
    }
  }

  const [error, setError] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [paidEntries, setPaidEntries] = useState([]);
  const [paidAdvances, setPaidAdvances] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [paymentTotal, setPaymentTotal] = useState({
    cash: 0,
    upi: 0,
    mix: 0,
  });
  const [advanceTotal, setAdvanceTotal] = useState({
    cash: 0,
    upi: 0,
    mix: 0,
  });
  const [alert, setAlert] = useState({
    state: false,
    message: "",
    type: "",
  });
  const [print, setPrint] = useState(false);

  useEffect(() => {
    async function getData() {
      setFetching(true);
      try {
        const { paidEntries, paidAdvances } = await getDailyPaidEntries({ date });
        console.log(paidEntries, paidAdvances);
        
        let cash = 0, upi = 0, mix = 0;
        let advCash = 0, advUpi = 0, advMix = 0;

        paidEntries.forEach((item) => {
          if (item.paymenttype === "cash" || item.paymenttype === "" || item.paymenttype === null) {
            cash += Number(item.totalpayable);
          } else if (item.paymenttype === "UPI") {
            upi += Number(item.totalpayable);
          } else {
            mix += Number(item.totalpayable);
          }
        });

        paidAdvances.forEach((item) => {
          if (item.paymenttype === "cash" || item.paymenttype === "" || item.paymenttype === null) {
            advCash -= Number(item.totaladvance);
          } else if (item.paymenttype === "UPI") {
            advUpi -= Number(item.totaladvance);
          } else {
            advMix -= Number(item.totaladvance);
          }
        });

        setPaidEntries(paidEntries);
        setPaidAdvances(paidAdvances);
        setPaymentTotal({ cash, upi, mix });
        setAdvanceTotal({ cash: advCash, upi: advUpi, mix: advMix });
        setFetching(false);
      } catch (err) {
        setError(true);
        setAlert({
          state: true,
          message: "Error fetching data. Please try again.",
          type: "error",
        });
        setFetching(false);
      }
    }
    getData();
  }, [date]);

  async function printPDF() {
    setPrint(true);
    const printWindow = window.open();
    printWindow.document.write(`
			<!DOCTYPE html>
			<html>
				<head>
					<title>${date.split("-").reverse().join("-")}</title>
					<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.16/tailwind.min.css">
				</head>
				<body>
					<div class="overflow-x-auto rounded-lg bg-white shadow-lg ">
				
					<h1 class="text-lg font-bold text-center">
					HHG Enterprises
					</h1>
					<h1 class="text-md font-semibold text-center">
            Insert Address Here
					</h1>

						<h1 class="text-md font-bold text-center">
							Date ${date.split("-").reverse().join("-")} daily entries
						</h1>
						<table class="w-full divide-y-2 divide-gray-200 bg-white text-sm mt-2">
							<thead class="border-b">
								<tr>
									<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">
										Sr. No.
									</th>
									<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">
										Farmer Name
									</th>
									<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">
									Mobile Number
									</th>
									<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">
										Reciepts/Count
									</th>
									<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">
										Amount Paid
									</th>

								</tr>
							</thead>
							<tbody>
								${Data.map(
                  (item, index) => `
									<tr class="border-b">
										<td class="whitespace-nowrap text-center py-2 text-gray-700 border">
											${index}
										</td>
										<td class="whitespace-nowrap text-center py-2 text-gray-700 border">
											${item.farmername}
										</td>
										<td class="whitespace-nowrap text-center py-2 text-gray-700 border">
											${item.mobilenumber}
										</td>
										<td class="whitespace-nowrap text-center py-2 text-gray-700 border">
											${Number(item.entrycount).toLocaleString("en-IN")}
										</td>
										<td class="whitespace-nowrap text-center py-2 text-gray-700 border">
											${Number(item.totalpayable).toLocaleString("en-IN")}/-
										</td>

									</tr>
								`
                ).join("")}
				<tr class="border-b">
					<td colspan="3" class="whitespace-nowrap text-center py-2 text-gray-700  border font-bold">
						Total
					</td>
					<td class="whitespace-nowrap text-center py-2 text-gray-700 border font-bold">
						${Data.reduce((acc, item) => acc + Number(item.entrycount),0)}
					</td>
					<td class="whitespace-nowrap text-center py-2 text-gray-700 border font-bold">
						${Data.reduce((acc, item) => acc + Number(item.totalpayable),0)}
					</td>
				</tr>

							</tbody>
						</table>
						<div class="flex justify-between mt-4">
							<div class="w-1/3">
								<p class="border-b-2
								border-black">सही</p>
							</div>
							</div>

					</div>
					
				

				</body>
			</html>
		`);
    printWindow.document.close();
    // wait for the window to load
    printWindow.onload = () => {
      // print the window
      printWindow.print();
    };
    setPrint(false);
  }

  function handleRowClick(uid) {
    router.push(`/findfarmer/${uid}`);
  }

  const renderTableRow = (item, index, isAdvance = false) => (
    <tr
      key={index}
      className={`cursor-pointer hover:bg-gray-100 transition-all ease-in-out duration-200 ${
        isAdvance ? 'text-red-600' : ''
      }`}
      onClick={(e) => {
        e.preventDefault();
        handleRowClick(item.uid);
      }}
    >
      <td className="text-center py-2 font-semibold border">{index + 1}</td>
      <td className="whitespace-nowrap text-lg font-semibold text-center py-2 border">
        {item.farmername}
      </td>
      <td className="text-center py-2 border w-auto">{item.mobilenumber}</td>
      <td className="text-center py-2 border w-auto">
        {Number(isAdvance ? item.advancecount : item.entrycount).toLocaleString("en-IN")}
      </td>
      <td className="text-center py-2 border w-auto">{item.paymenttype || "Cash"}</td>
      <td className="text-center py-2 border w-auto">
        {isAdvance ? item.paiddescription : item.description || "Payment"}
      </td>
      <td className="text-center py-2 font-semibold border w-auto">
        {Number(isAdvance ? item.totaladvance : item.totalpayable).toLocaleString("en-IN")}/-
      </td>
      <td className="text-center py-2 border">
        {new Date(item.paidtimestamp_ist).toLocaleTimeString("en-IN")}
      </td>
      <td className="text-center py-2 border">{isAdvance ? item.collectedby : item.paidby}</td>
    </tr>
  );

  return (
    <div className="p-2 md:p-14 lg:p-14">
      {alert.state && (
        <Alert message={alert.message} type={alert.type} setState={setAlert} timer={2000} />
      )}
      <div className="overflow-x-auto rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-8">
        <h1 className="text-2xl font-bold text-center mb-2">रोजमेळ</h1>
        <DateSection date={date} setDate={setDate} />

        <button
          onClick={printPDF}
          className={`inline-flex items-center rounded-lg bg-black py-2 px-4 hover:bg-gray-800 font-medium text-white ${
            print ? "opacity-50" : ""
          }`}
          disabled={print}
        >
          <svg
            className="w-6 h-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M8 3a2 2 0 0 0-2 2v3h12V5a2 2 0 0 0-2-2H8Zm-3 7a2 2 0 0 0-2 2v5c0 1.1.9 2 2 2h1v-4c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v4h1a2 2 0 0 0 2-2v-5a2 2 0 0 0-2-2H5Zm4 11a1 1 0 0 1-1-1v-4h8v4c0 .6-.4 1-1 1H9Z"
              clipRule="evenodd"
            />
          </svg>
          <span>Print</span>
        </button>

        <table className="w-full divide-y-2 divide-gray-200 bg-white text-sm mt-5 p-8 overflow-x-auto">
          <thead className="border-b">
            <tr>
              <th className="py-2 font-bold text-gray-900 border-2">Sr. no</th>
              <th className="py-2 font-bold text-gray-900 border-2">Farmer Name</th>
              <th className="py-2 font-bold text-gray-900 border-2">Mobile</th>
              <th className="py-2 font-bold text-gray-900 border-2">Reciept Count</th>
              <th className="py-2 font-bold text-gray-900 border-2">Payment Mode</th>
              <th className="py-2 font-bold text-gray-900 border-2">Description</th>
              <th className="py-2 font-bold text-gray-900 border-2">Amount Paid</th>
              <th className="py-2 font-bold text-gray-900 border-2">Time</th>
              <th className="py-2 font-bold text-gray-900 border-2">Paid By</th>
            </tr>
          </thead>

          <tbody>
            {fetching ? (
              <tr>
                <td colSpan="9" className="text-center">
                  Fetching data...
                </td>
              </tr>
            ) : (
              <>
                {paidEntries.map((item, index) => renderTableRow(item, index))}
                {paidAdvances.map((item, index) => renderTableRow(item, paidEntries.length + index, true))}
              </>
            )}
            {(paidEntries.length !== 0 || paidAdvances.length !== 0) && (
              <tr className="border-b">
                <td colSpan="3" className="text-center py-2 text-gray-700 border font-bold">
                  Total
                </td>
                <td className="text-center py-2 text-gray-700 border font-bold">
                  {(
                    paidEntries.reduce((acc, item) => acc + Number(item.entrycount), 0) +
                    paidAdvances.reduce((acc, item) => acc + Number(item.advancecount), 0)
                  ).toLocaleString("en-IN")}
                </td>
                <td colSpan={2} className="text-center py-2 text-gray-700 border font-bold"></td>
                <td className="text-center py-2 text-gray-700 border font-bold">
                  {(
                    paidEntries.reduce((acc, item) => acc + Number(item.totalpayable), 0) +
                    paidAdvances.reduce((acc, item) => acc + Number(item.totaladvance), 0)
                  ).toLocaleString("en-IN")}
                  /-
                </td>
                <td className="text-center py-2 text-gray-700 border font-bold"></td>
              </tr>
            )}
          </tbody>
          {(paidEntries.length !== 0 || paidAdvances.length !== 0) && (
            <tfoot>
              <tr>
                <td colSpan="3" className="text-center py-2 text-gray-700 border font-bold">
                  Total Amount
                </td>
                <td colSpan={3} className="text-center py-2 text-gray-700 border font-bold">
                  Cash: {(paymentTotal.cash + advanceTotal.cash).toLocaleString("en-IN")} /-
                  UPI: {(paymentTotal.upi + advanceTotal.upi).toLocaleString("en-IN")} /-
                  Mix: {(paymentTotal.mix + advanceTotal.mix).toLocaleString("en-IN")} /-
                </td>
                <td className="text-center py-2 text-gray-700 border font-bold">
                  Total:{" "}
                  {(
                    paymentTotal.cash +
                    paymentTotal.upi +
                    paymentTotal.mix +
                    advanceTotal.cash +
                    advanceTotal.upi +
                    advanceTotal.mix
                  ).toLocaleString("en-IN")}
                  /-
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {error && (
        <div className="text-red-500 text-center mt-2">
          Error fetching data. Please try again.
        </div>
      )}
    </div>
  );
}

export default Page;