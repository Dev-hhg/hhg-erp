"use client";
import Alert from "@/components/Alert";
import {
	getFarmerAcc,
	editFarmerAccount,
	deleteFarmerAccount,
	getFarmers,
} from "@/serverComponents/dbFunctions";
import { useState, useEffect, useContext } from "react";
import { VendorContext } from "../Context/vendorcontext";
import { useRouter } from "next/navigation";
import { set } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Loader } from "lucide-react";

function Page() {
	
	
	const router = useRouter();
	//CONTEXT ///////////////////////////////////////////////////////////////////////////////////
	const { data: session, status } = useSession();
	if(status === "authenticated")
		{
			if(session?.user?.role === "guest" || session?.user?.role === "user"){
				return (
					<div className="flex justify-center items-center h-screen">
						<h1 className="text-3xl text-white">You are not allowed to view this page :)</h1>
					</div>
				);
			}
		}
	
	const [clearFarmers, setClearFarmers] = useState(false);
	const { farmers, setFarmers } = useContext(VendorContext);
	// fetch farmer data from db once and store it in context
	const getFarmerDetails = async () => {
		try {
			console.log("Fetching farmers");
			const tempfarmers = await getFarmers();
			console.log("Farmers", tempfarmers);
			localStorage.setItem("farmers", JSON.stringify(tempfarmers));
			// sort farmers by name
			tempfarmers.sort((a, b) => a.farmername.localeCompare(b.farmername));
			setFarmers(tempfarmers);
			console.log("Farmers set");
			setLoading(false);
		} catch (error) {
			setAlert({
				state: true,
				type: "danger",
				message: error,
			});
		}
	};

	useEffect(() => {
		setLoading(true);
		const storageFarmers = localStorage.getItem("farmers");
		const storageFarmersParsed = JSON.parse(storageFarmers);
		try {
			storageFarmersParsed.sort((a, b) =>
				a.farmername.localeCompare(b.farmername)
			);
		} catch (e) {
			console.log(e);
		}
		setFarmers(storageFarmersParsed);
		if (!Boolean(storageFarmers)) {
			return () => getFarmerDetails();
		} else {
			setLoading(false);
			return () => console.log("Farmers data exist");
		}
	}, [clearFarmers]);



	//STATES ///////////////////////////////////////////////////////////////////////////////////
	const [tempFarmers, setTempFarmers] = useState([]);
	const [error, setError] = useState(false);
	const [editClicked, setEditClicked] = useState(false);
	const [loading, setLoading] = useState(false);
	const [searchClicked, setSearchClicked] = useState(false);

	const [alert, setAlert] = useState({
		state: false,
		type: "",
		message: "",
	});
	const [data, setData] = useState({
		farmerName: "",
		mobileNumber: "",
		farmerAddress: "",
		uid: "",
		farmerid: "",
	});

	//DELETE FARMER FUNCTION ///////////////////////////////////////////////////////////////////////////////////
	function handleDelete(transactionId) {
		event.preventDefault();
		const reason = window.prompt("State the reason for entry?");
		window.scrollTo(0, 0);
		if (reason !== null && reason !== "") {
			deleteFarmerAccount({ farmerid: transactionId, reason: reason })
				.then((result) => {
					if (result && result.error) {
						setAlert({
							state: true,
							type: "danger",
							message: result.error,
						});
					} else if (result === "शेतकरी डिलीट केला") {
						setAlert({
							state: true,
							type: "success",
							message: "Farmer Deleted Successfully!",
						});
					}
				})
				.catch((error) => {
					setAlert({
						state: true,
						type: "danger",
						message: error.message,
					});
				})
				.finally(() => {
					getFarmerDetails().then(() => {
						console.log("Farmer details updated");
					});
				});
		}
	}

	// EDIT FARMER FUNCTION ///////////////////////////////////////////////////////////////////////////////////
	function handleEdit(transactionId) {
		event.preventDefault();
		setEditClicked(true);

		const entry = farmers.find((entry) => entry.farmerid === transactionId);
		console.log(entry);

		if (entry) {
			const editThisFarmer = {
				farmerName: entry.farmername,
				mobileNumber: entry.mobilenumber,
				farmerAddress: entry.farmeraddress,
				uid: entry.uid,
				farmerid: entry.farmerid,
			};
			setData(editThisFarmer);
		}
	}

	//EDIT FARMER FUNCTION ///////////////////////////////////////////////////////////////////////////////////
	const handleChange = (e) => {
		const { name, value } = e.target;
		setData((prev) => {
			return { ...prev, [name]: value };
		});

		console.log(data);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		console.log(data);
		try {
			let val = data.uid.trim();
			val = val.replace(/[०१२३४५६७८९]/g, function (match) {
				return "0123456789".charAt("०१२३४५६७८९".indexOf(match));
			});
			setData((prev) => {
				return { ...prev, uid: val };
			});
			const res = await editFarmerAccount(data);

			if (res?.error) throw res.error;
			window.scrollTo(0, 0);
			setAlert({
				state: true,
				type: "success",
				message: " Edited Farmer Successfully",
			});
		} catch (error) {
			console.log(error);
			setAlert({
				state: true,
				type: "danger",
				message: error.toString(),
			});
		} finally {
			setLoading(false);
			setEditClicked(false);
			setData({
				farmerName: "",
				mobileNumber: "",
				farmerAddress: "",
				uid: "",
				farmerid: "",
			});
			getFarmerDetails().then(() => {
				console.log("Farmer details updated");
				window.scrollTo(0, 0);
			});
		}
	};
	// MENU WHEN EDIT IS CLICKED ///////////////////////////////////////////////////////////////////////////////////
	const editMenu = (
		<div className="p-14">
			<div className="relative rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12 ">
				{alert.state && (
					<Alert
						message={alert.message}
						type={alert.type}
						setState={setAlert}
						timer={15000}
					/>
				)}
				{loading && (
					<Loader/>
				)}
				<form
					onSubmit={handleSubmit}
					className={`space-y-4 ${loading ? "opacity-20" : ""}`}
				>
					<h1>Edit Farmer Menu</h1>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className="sr-only" htmlFor="farmerName">
								farmerName
							</label>
							<input
								className="w-full rounded-lg border-gray-200 p-3 text-sm"
								placeholder="farmerName"
								type="text"
								id="farmerName"
								name="farmerName"
								onChange={handleChange}
								value={data.farmerName}
								disabled={loading}
								required
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<label className="sr-only" htmlFor="mobileNumber">
							Mobile Number
						</label>
						<input
							className=" w-full rounded-lg border-gray-200 p-3 text-sm "
							placeholder="mobileNumber"
							type="number"
							id="mobileNumber"
							name="mobileNumber"
							onChange={handleChange}
							onWheel={(e) => e.target.blur()}
							value={data.mobileNumber || ""}
							disabled={loading}
						/>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className="sr-only" htmlFor="farmerAddress">
								farmerAddress
							</label>
							<input
								className="w-full rounded-lg border-gray-200 p-3 text-sm"
								placeholder="farmerAddress"
								type="text"
								id="farmerAddress"
								name="farmerAddress"
								onChange={handleChange}
								value={data.farmerAddress || ""}
								disabled={loading}
								required
							/>
						</div>
					</div>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className="sr-only" htmlFor="uid">
								uid
							</label>
							<input
								className="w-full rounded-lg border-gray-200 p-3 text-sm"
								placeholder="uid"
								type="text"
								id="uid"
								name="uid"
								onChange={handleChange}
								value={data.uid}
								disabled={loading}
								maxLength={6}
								required
							/>
						</div>
					</div>
					<div className="mt-4">
						<button
							type="submit"
							className="inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto"
							disabled={loading}
						>
							Edit Farmer
						</button>
					</div>
				</form>
			</div>
		</div>
	);

	// export to csv function ///////////////////////////////////////////////////////////////////////////////////

	function exportToCSV() {
		try {
			const replacer = (key, value) => (value === null ? "" : value);
			const header = Object.keys(farmers[0]);
			let csv = farmers.map((row) =>
				header
					.map((fieldName) => JSON.stringify(row[fieldName], replacer))
					.join(",")
			);
			csv.unshift(header.join(","));
			csv = csv.join("\r\n");

			const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
			const link = document.createElement("a");
			const url = URL.createObjectURL(blob);
			link.setAttribute("href", url);
			link.setAttribute("download", "farmers.csv");
			link.style.visibility = "hidden";
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		} catch (error) {
			setAlert({
				state: true,
				type: "danger",
				message: error.toString(),
			});
		}
	}

	// searching
	function handleSearch(event) {
		event.preventDefault();
		setSearchClicked(!searchClicked);
		const check = !searchClicked;
		if (check) {
			setTempFarmers(farmers);
			const searchFarmer = document.getElementById("searchFarmer").value;
			if (searchFarmer === "") {
				setAlert({
					state: true,
					type: "danger",
					message: "Please enter the name of the farmer to search",
				});
				setSearchClicked(false);
				return;
			}
			setLoading(true);
			if (!isNaN(searchFarmer) && Number.isInteger(parseInt(searchFarmer))) {
				searchByNumber(searchFarmer);
				setLoading(false);
			} else {
				searchByName(searchFarmer);
				setLoading(false);
			}
		} else {
			console.log("Seacrhc should clear", searchClicked);
			setFarmers(tempFarmers);
			//make input field empty
			document.getElementById("searchFarmer").value = "";
		}
	}

	function searchByName(text) {
		// search in entries for the text in entries using farmername, item, vendorname
		const result = farmers.filter((entry) => entry.farmername.includes(text));
		if (result.length === 0) {
			setAlert({
				state: true,
				type: "danger",
				message: "No entries found for the name",
			});
			return;
		} else {
			setFarmers(result);
		}
	}
	function searchByNumber(number) {
		// search in entries for the number in adhaar
		const result = farmers.filter(
			(entry) =>
				entry.uid.includes(number) || entry.mobilenumber.includes(number)
		);
		if (result.length === 0) {
			setAlert({
				state: true,
				type: "danger",
				message: "No entries found for the adhaar number",
			});
			return;
		} else {
			setFarmers(result);
		}
	}
	function clearStorage() {
		console.log("Clearing storage");
		localStorage.clear();
		setFarmers([]);
		setClearFarmers(!clearFarmers);
	}

	function handleRowClick(uid) {
		router.push(`/findfarmer/${uid}`);
	}

	

	return (
		<div className="p-2 md:p-14 lg:p-14">
			{alert.state && (
				<Alert
					message={alert.message}
					type={alert.type}
					setState={setAlert}
					timer={2000}
				/>
			)}
			{editClicked ? (
				editMenu
			) : (
				<div className=" overflow-x-auto rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-8 ">
					<div className="flex flex-col justify-between">
						<div className="flex flex-row justify-center space-x-4">
							<h1 className="text-3xl font-bold text-center">शेतकरी यादी</h1>
							<button
								onClick={clearStorage}
								className={`inline-flex items-center rounded-lg bg-blue-700 py-2 px-4 hover:bg-blue-400 font-medium text-white`}
							>
								<svg
									className="w-6 h-6 text-gray-800 dark:text-white"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<path
										stroke="currentColor"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M17.7 7.7A7.1 7.1 0 0 0 5 10.8M18 4v4h-4m-7.7 8.3A7.1 7.1 0 0 0 19 13.2M6 20v-4h4"
									/>
								</svg>
								<span> Refresh List</span>
							</button>
						</div>
						<div className="flex space-x-4 mt-1">
							<div className="flex items-center">
								<label className="sr-only" htmlFor="farmerName">
									farmerName
								</label>
								<input
									className=" rounded-lg border-gray-200 p-3 text-sm"
									placeholder="Search by name or adhaar number"
									type="text"
									id="searchFarmer"
									name="searchFarmer"
									// onChange={handleChange}
									// value={data.farmerName}
									disabled={loading}
									// required
								/>
							</div>
							<button
								onClick={handleSearch}
								className={`inline-flex items-center rounded-lg bg-black py-2 px-4 font-medium text-white hover:bg-gray-800 `}
								disabled={loading}
							>
								{!searchClicked && (
									<svg
										className="w-6 h-6 text-gray-800 dark:text-white"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0  0  24  24"
									>
										<path
											stroke="currentColor"
											strokeLinecap="round"
											strokeWidth="2"
											d="m21  21-3.5-3.5M17  10a7  7  0  1  1-14  0  7  7  0  0  1  14  0Z"
										/>
									</svg>
								)}

								{searchClicked && (
									<svg
										data-unchecked-icon
										xmlns="http://www.w3.org/2000/svg"
										className="h-4 w-4"
										viewBox="0 0 20 20"
										fill="currentColor"
									>
										<path
											fill-rule="evenodd"
											d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
											clip-rule="evenodd"
										/>
									</svg>
								)}
								<span>{searchClicked ? "Clear Search" : "Search"}</span>
							</button>

							<button
								onClick={exportToCSV}
								className={`inline-flex items-center rounded-lg bg-black py-2 px-4 hover:bg-gray-800 font-medium text-white`}
							>
								<svg
									className="fill-current w-4 h-4 mr-2"
									xmlns="http://www.w3.org/2000/svg"
									viewBox="0 0 20 20"
								>
									<path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
								</svg>
								<span>Download List</span>
							</button>
						</div>

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

						{searchClicked && (
							<h1 className="text-center text-lg font-semi-bold mt-2 text-red-700">
								{farmers.length} जुळणारे शेतकरी सापडले
							</h1>
						)}

						<form
							className={`flex items-center justify-center ${
								loading ? "opacity-20" : ""
							}`}
						>
							<table
								className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm mt-5 md:block "
								id="my-table"
							>
								<thead className="">
									<tr className="bg-gray-300">
										<th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
											क्र.
										</th>
										<th className=" text-left px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
											मालधन्याचे नाव
										</th>
										<th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
											Mobile Number
										</th>

										<th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
											आधार क्रमांक
										</th>
										<th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
											पत्ता
										</th>
										<th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
											कार्य
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200">
									{Boolean(farmers) &&
										farmers.map((entry, index) => (
											<tr
												key={index}
												className="cursor-pointer hover:bg-gray-100 transition-all ease-in-out duration-200"
												onClick={(e) => {
													e.preventDefault();
													handleRowClick(entry.uid);
												}}
											>
												<td className="whitespace-nowrap text-center py-2 text-gray-700">
													{index + 1}
												</td>
												<td className="whitespace-nowrap text-left py-2 text-gray-700">
													{entry.farmername}
												</td>
												<td className="whitespace-nowrap text-center py-2 text-gray-700">
													{entry.mobilenumber}
												</td>

												<td className="whitespace-nowrap text-center py-2 text-gray-700">
													{entry.uid}
												</td>
												<td className="whitespace-nowrap text-center py-2 text-gray-700">
													{entry.farmeraddress}
												</td>
												<td className="whitespace-nowrap text-center py-2 text-gray-700">
													<button
														title="Delete entry"
														disabled={false}
														onClick={(event) => {
															event.preventDefault();
															event.stopPropagation();
															handleDelete(entry.farmerid);
														}}
														className={`bg-red-500 text-white rounded-lg p-2 cursor-pointer hover:bg-red-900`}
													>
														<svg
															className="w-4 h-4 text-gray-800 dark:text-white"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="currentColor"
															viewBox="0 0 18 20"
														>
															<path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z" />
														</svg>
													</button>
													<button
														className="ml-1 bg-green-500 text-white rounded-lg p-2 cursor-pointer hover:bg-green-900"
														onClick={(event) => {
															event.preventDefault();
															event.stopPropagation();
															handleEdit(entry.farmerid);
														}}
													>
														<svg
															className="w-4 h-4 text-gray-800 dark:text-white"
															aria-hidden="true"
															xmlns="http://www.w3.org/2000/svg"
															fill="currentColor"
															viewBox="0 0 20 20"
														>
															<path d="M1 5h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 1 0 0-2H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2Zm18 4h-1.424a3.228 3.228 0 0 0-6.152 0H1a1 1 0 1 0 0 2h10.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Zm0 6H8.576a3.228 3.228 0 0 0-6.152 0H1a1 1 0 0 0 0 2h1.424a3.228 3.228 0 0 0 6.152 0H19a1 1 0 0 0 0-2Z" />
														</svg>
													</button>
												</td>
											</tr>
										))}
								</tbody>
							</table>
						</form>
					</div>
				</div>
			)}

			{error && (
				<div className="text-red-500 text-center mt-2">
					Error fetching data. Please try again.
				</div>
			)}
		</div>
	);
}

export default Page;
