"use client";
import { useState, useContext } from "react";
import { createFarmerAccount } from "@/serverComponents/dbFunctions";
import Alert from "@/components/Alert";
import { VendorContext } from "../Context/vendorcontext";
import Loader from "@/components/Loader";

export default function Page() {
	const { farmers, setFarmer } = useContext(VendorContext);
	const [data, setData] = useState({
		farmerName: "",
		mobileNumber: "",
		farmerAddress: "",
		uid: "",
	});
	const [alert, setAlert] = useState({
		state: false,
		type: "",
		message: "",
	});
	const [loading, setLoading] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setData((prev) => {
			return { ...prev, [name]: value };
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		console.log(data);
		try {
			let val = "";
			if (data.uid.length > 0) {
				val = data.uid.trim();
				val = val.replace(/[०१२३४५६७८९]/g, function (match) {
					return "0123456789".charAt("०१२३४५६७८९".indexOf(match));
				});
			}
			setData((prev) => {
				return { ...prev, uid: val };
			});
			// if farmer uid already exists in farmers array then throw error
			if (farmers.some((farmer) => farmer.uid === val)) {
				throw new Error("Farmer UId already exists");
			}

			const res = await createFarmerAccount(data);
			if (res?.error) throw res.error;
			setAlert({
				state: true,
				type: "success",
				message: " Added Successfully",
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
			setData({
				farmerName: "",
				mobileNumber: "",
				farmerAddress: "",
				uid: "",
			});
			try {
				localStorage.setItem("farmerData", null);
				setFarmer([]);
			} catch (e) {
				console.log(e);
			}
		}
	};

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
				<form
					onSubmit={handleSubmit}
					className={`space-y-4 ${loading ? "opacity-20" : ""}`}
				>
					<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<label className="sr-only" htmlFor="farmerName">
								farmerName
							</label>
							<input
								className="w-full rounded-lg border-gray-200 p-3 text-sm"
								placeholder="Farmer Name"
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
							placeholder="Mobile Number"
							type="number"
							id="mobileNumber"
							name="mobileNumber"
							onChange={handleChange}
							onWheel={(e) => e.target.blur()}
							value={data.mobileNumber}
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
								placeholder="Address"
								type="text"
								id="farmerAddress"
								name="farmerAddress"
								onChange={handleChange}
								value={data.farmerAddress}
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
								placeholder="5 digit UID"
								type="text"
								id="uid"
								name="uid"
								onChange={handleChange}
								value={data.uid}
								disabled={loading}
								maxLength={6}
							/>
						</div>
					</div>
					<div className="mt-4">
						<button
							type="submit"
							className="inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto"
							disabled={loading}
						>
							Add Farmer
						</button>
					</div>
				</form>
			</div>
		</div>
	);
}
