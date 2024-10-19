"use client";
import Alert from "@/components/Alert";
import DateSection from "@/components/DateSection";
import React from "react";
import { useEffect, useState, useContext } from "react";
import { getTransportRateSum } from "@/serverComponents/dbFunctions";
import { VendorContext } from "../Context/vendorcontext";
import { useRouter } from "next/navigation";

function Page() {
	const router = useRouter();
	const { selectedVMNDate, setSelectedVMNDate } = useContext(VendorContext);
	const today = new Date().toISOString().split("T")[0];
	const [date, setDate] = useState(today);
	const [alert, setAlert] = useState(false);
	const [entries, setEntries] = useState([]);
	const [loading, setLoading] = useState(true);
	const [total, setTotal] = useState({ quantity: 0, weight: 0, transport: 0 });
	const [print, setPrint] = useState(false);
	const [count, setCount] = useState(0);
	useEffect(() => {
		try {
			getTransportRateSum({ date }).then((res) => {
				console.log(res);
				// sort according to printed status and transport cost > 0
				res.sort((a, b) => {
					if (a.printed && !b.printed) return 1;
					if (!a.printed && b.printed) return -1;
					if (
						Number(a.totaltransportcost) > 0 &&
						Number(b.totaltransportcost) === 0
					)
						return 1;
					if (
						Number(a.totaltransportcost) === 0 &&
						Number(b.totaltransportcost) > 0
					)
						return -1;
					return 0;
				});
				setEntries(res);
				let temp = { quantity: 0, weight: 0, transport: 0 };
				res.forEach((entry) => {
					temp.quantity += Number(entry.totalquantity);
					temp.weight += Number(entry.totalweight);
					temp.transport += Number(entry.totaltransportcost);
				});
				setTotal(temp);
				console.log(temp);
			});
		} catch (error) {
			console.log(error);
		} finally {
			setLoading(false);
		}
	}, [date]);
	function handleRowClick(vendorname) {
		setSelectedVMNDate({ vendorname: vendorname, date: date });
		console.log(vendorname);
		router.push(`/memo`);
	}
	function printPDF() {
		console.log(entries);
		setPrint(true);
		const printWindow = window.open();
		printWindow.document.open();
		printWindow.document.write(`
		  <html>
			<head>
			  <title>HHG</title>
			  <style>
				@media print {
				  @page {
					size: A5;
					margin: 0;
				  }
				}
				body {
				  margin: 0;
				  padding: 0;
				  font-family: Arial, sans-serif;
				}
				.border {
				  border: 3px solid black;
				  padding: 10px;
				  width: 520px;
				  height: 750px;
				  box-sizing: border-box;
				  margin: 0 auto;
				}
				table {
				  border-collapse: collapse;
				  width: 100%;
				}
				th, td {
				  border: 1px solid black;
				  padding: 2px;
				  text-align: center;
				  font-size: 16px;
				}
				th {
				  background-color: #f2f2f2;
				}
				.header {
				  text-align: center;
				  margin-bottom: 10px;
				}
				.header h1 {
				  font-size: 24px;
				  margin: 0;
				}
				.header h2 {
				  font-size: 14px;
				  margin: 5px 0;
				}
				.subheader {
				  display: flex;
				  justify-content: space-between;
				  font-size: 14px;
				  margin-bottom: 10px;
				}
				.footer {
				  display: flex;
				  justify-content: space-between;
				  margin-top: 20px;
				}
				.signature {
				  text-align: center;
				  width: 45%;
				}
				.signature img {
				  width: 100px;
				  height: auto;
				}
				.signature-line {
				  border-top: 1px solid black;
				  width: 200px;
				  margin: 10px auto;
				}
			  </style>
			</head>
			<body>
			  <div class="border">
				<div class="header">
				  <h2>।। श्री हनुमान प्रसन्न ।।</h2>
				  <h1>HHG Enterprises</h1>
				  <h2>Pune, Maharashtra | 0123456789, 9876543210</h2>
				  <h1>Transporter Reciept</h1>
				</div>
				
				<div class="subheader">
				  <div>Date: ${date.split("-").reverse().join("-")}</div>
				  <div>Vehicle No: ${entries[0].vehicleno ? entries[0].vehicleno : "-"}</div>
				</div>
	  
				<table>
				  <thead>
					<tr>
					  <th>Sr. No</th>
					  <th>Vendor</th>
					  <th>Qty</th>
					  <th>Token</th>
					  <th>Freight</th>
					</tr>
				  </thead>
				  <tbody>
					${entries.map((entry, index) => `
					  <tr>
						<td>${index + 1}</td>
						<td>${entry.vendorname}</td>
						<td>${entry.totalquantity}</td>
						<td>${entry.token_no ? entry.token_no : ""}</td>
						<td style="text-align: right;">${
						  Number(entry.totaltransportcost) > 0
							? Number(entry.totaltransportcost).toLocaleString("en-IN") + "/-"
							: "-"
						}</td>
					  </tr>
					`).join("")}
					<tr>
					  <td>Total</td>
					  <td></td>
					  <td style="font-weight: bold">${total.quantity}</td>
					  <td style="font-weight: bold"></td>
					  <td style="font-weight: bold">${total.transport.toLocaleString("en-IN")}/-</td>
					</tr>
				  </tbody>
				</table>
				
				<div class="footer">
				  <div class="signature">
					<div class="signature-line"></div>
					<h4>${entries[0].transportername ? entries[0].transportername : "For transporter"}</h4>
				  </div>
				  <div class="signature">
					<img src="./sign.png" alt="signature" />
					<h4>For HHG enterprises</h4>
				  </div>
				</div>
			  </div>
			</body>
		  </html>
		`);
	  
		printWindow.document.close();
		printWindow.print();
		setPrint(false);
	  }
	return (
		<div className="p-14">
			{alert && (
				<Alert
					message="Payment added successfully"
					type="success"
					setState={setAlert}
					timer={5000}
				/>
			)}
			{loading && (
				<div className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
					<svg
						aria-hidden="true"
						className="inline w-10 h-10text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
						viewBox="0 0 100 101"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
							fill="currentColor"
						/>
						<path
							d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
							fill="currentFill"
						/>
					</svg>
				</div>
			)}

			<div className="rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
				<DateSection date={date} setDate={setDate} />
				<h1 className="text-3xl font-bold text-center">Transporter Memo</h1>
				<div className="mt-8">
					<table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm mt-5">
						<thead className="">
							<tr className="bg-gray-300">
								<th className="whitespace-nowrap px-1 md:px-16 lg:px-16 py-2 font-bold text-gray-900">
									Sr. No
								</th>
								<th className="whitespace-nowrap px-1 md:px-16 lg:px-16 py-2 font-bold text-gray-900">
									Vendor
								</th>
								<th className="whitespace-nowrap px-1 md:px-16 lg:px-16 py-2 font-bold text-gray-900">
									Qty
								</th>
								<th className="whitespace-nowrap px-1 md:px-16 lg:px-16 py-2 font-bold text-gray-900">
									Weight
								</th>
								<th className="whitespace-nowrap px-1 md:px-16 lg:px-16 py-2 font-bold text-gray-900">
									Transport Cost
								</th>
								<th className="whitespace-nowrap px-1 md:px-16 lg:px-16 py-2 font-bold text-gray-900">
									Memo Printed?
								</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{entries.map((entry, index) => (
								<tr
									key={index + 1}
									className="cursor-pointer hover:bg-gray-100 transition-all ease-in-out duration-200"
									onClick={(e) => {
										e.preventDefault();
										handleRowClick(entry.vendorname);
									}}
								>
									<td className="whitespace-nowrap text-center py-2 text-gray-700">
										{index + 1}
									</td>
									<td className="whitespace-nowrap text-center py-2 text-gray-700">
										{entry.vendorname}
									</td>
									<td className="whitespace-nowrap text-center py-2 text-gray-700">
										{entry.totalquantity}
									</td>
									<td className="whitespace-nowrap text-center py-2 text-gray-700">
										{entry.totalweight}Kg
									</td>
									<td className="whitespace-nowrap text-center py-2 text-gray-700">
										{Number(entry.totaltransportcost) > 0
											? Number(entry.totaltransportcost).toLocaleString(
													"en-IN"
											  ) + "/-"
											: "-"}
									</td>
									<td
										className={`whitespace-nowrap text-center py-2 font-bold text-xl ${
											entry.printed ? "text-green-600" : "text-red-600"
										}`}
									>
										{entry.printed ? "Yes" : "No"}
									</td>
								</tr>
							))}
							<tr>
								<td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900">
									Total
								</td>
								<td
									className="whitespace-nowrap text-center py-4 font-semibold text-gray-900"
									colSpan="1"
								></td>
								<td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900 ">
									{total.quantity}
								</td>
								<td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900 ">
									{Number(total.weight).toLocaleString("en-IN")}Kg
								</td>
								<td className="whitespace-nowrap text-center py-4 font-semibold text-gray-900 ">
									{total.transport.toLocaleString("en-IN")}/-
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				<div className="flex justify-center">
					<button
						onClick={printPDF}
						className={`inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto my-5 ${
							print ? "opacity-50" : ""
						}`}
						disabled={print}
					>
						Print
					</button>
				</div>
			</div>
		</div>
	);
}

export default Page;
