"use client";
import { useEffect, useState } from "react";
import { Chart } from "chart.js/auto";
import LineChart from "@/components/LineChart";
import {
	getLast30DaysSummary,
	getTopFarmersWeekly,
	getDailyComissionSumForMonth,
} from "@/serverComponents/dbFunctions";
import { set } from "react-hook-form";
import Article from "@/components/Article";
import DateSection from "@/components/DateSection";
import Alert from "@/components/Alert";
import DoughnutChart from "@/components/DoughnutChart";
import { parse } from "dotenv";
import {useSession} from "next-auth/react";
import Loader from "@/components/Loader";

function Page() {
	const { data: session, status } = useSession();

	if (status === "authenticated") {
		console.log("Session", session);
		if(session?.user?.role !== "super-admin"){
			return (
				<div className="flex justify-center items-center h-screen">
					<h1 className="text-3xl text-white">You are not authorized to view this page :)</h1>
				</div>
			);
		}
	}
	const [data, setData] = useState([]);
	const today = new Date().toISOString().split("T")[0];
	const [date, setDate] = useState(today);
	const [labels, setLabels] = useState([]);
	const [dates, setDates] = useState([]);
	const [refund, setRefund] = useState([]);
	const [loading, setLoading] = useState(true);
	const [alert, setAlert] = useState({ show: false, message: "", type: "" });
	const [topFarmers, setTopFarmers] = useState([]);
	const [topFarmersLabels, setTopFarmersLabels] = useState([]);
	const [topFarmersData, setTopFarmersData] = useState([]);
	const [commissionDates, setCommissionDates] = useState([]);
	const [commissionData, setCommissionData] = useState([]);
	const [commissionSum, setCommissionSum] = useState(0);
	const [refundSum, setRefundSum] = useState(0);
	const [averageMonthlyWweight, setAverageMonthlyWeight] = useState(0);
	const [averageMonthlyQuantity, setAverageMonthlyQuantity] = useState(0);
	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				console.log("Date", date);
				const res = await getLast30DaysSummary({ date: date });
				const res1 = await getTopFarmersWeekly({ date: date });
				const res2 = await getDailyComissionSumForMonth({ date: date });
				console.log("Commission", res2);
				const tempL1 = res2.map((item) => {
					const date = new Date(item.date);
					return date.toLocaleDateString("en-IN", {
						weekday: "short",
						day: "numeric",
						month: "short",
					});
				}
				);
				const tempD1 = res2.map((item) => item.total_commision);
				console.log("TempL1", tempL1);
				console.log("TempD1", tempD1);
				setCommissionDates(tempL1);
				setCommissionData(tempD1);
				console.log("Commission", commissionDates, commissionData);
				const commissionSum = res2.reduce((acc, item) => acc + parseInt(item.total_commision, 10), 0);
           		 setCommissionSum(commissionSum);
				console.log("TopFarmers", res1);
				setTopFarmers(res1);

				const topFLabels = res1.map((item) => item.farmername);
				const topFData = res1.map((item) => item.total_quantity);
				setTopFarmersLabels(topFLabels);
				setTopFarmersData(topFData);
				setData(res);
				console.log("Data", res);

				const tempL = res.map((item) => {
					const date = new Date(item.date);
					return date.toLocaleDateString("en-IN", {
						weekday: "short",
						day: "numeric",
						month: "short",
					});
				});
				console.log("TempL", tempL[28]);

				const refundT = res.map((item) => item.total_refund_value);

				const tempD = res.map((item) => item.total_quantity);
				const refundSum = res.reduce((acc, item) => acc + parseInt(item.total_refund_value, 10), 0);
				const avgMonthlyWweight = res.reduce((acc, item) => acc + parseInt(item.total_weight, 10), 0) / 30;
				const avgMonthlyQuantity = res.reduce((acc, item) => acc + parseInt(item.total_quantity, 10), 0) / 30;
				setAverageMonthlyQuantity(avgMonthlyQuantity);
				setAverageMonthlyWeight(avgMonthlyWweight);

				
            	setRefundSum(refundSum);	
				setDates(tempD);
				setLabels(tempL);
				setRefund(refundT);
				if (res.length <= 0) {
					setLoading(true);

					setAlert({
						show: true,
						message: "No data for this date, change date ",
						type: "warn",
					});
				} else {
					setLoading(false);
				}
				
			} catch (e) {
				console.log(e);
				window.alert("Error fetching data");
			}
		};
		fetchData();
	}, [date]);
	// useEffect(() => {
	// 	// console.log("New Commission Dates", commissionDates);
	// 	// console.log("New Commission Data", commissionData);
		
	// 	// console.log("Commision for last day", commissionData[commissionData.length-1]);
		
	//    }, [commissionDates, commissionData]);

	// useEffect(() => {
	// 	console.log("Total commision sum", commissionSum);
	// 	console.log("Refund for last day", refundSum);
	// }, [commissionSum, refundSum]);
	   

	return (
		<div className="p-14">
			<div className="bg-white rounded-md">
				{/* Filled line chart */}
				<h1 className="p-2 text-3xl text-center font-semibold mb-2">
					Daily Summary
				</h1>
				<DateSection date={date} setDate={setDate} />
				{alert.show && (
					<Alert
						message={alert.message}
						type={alert.type}
						timer={3000}
						setState={setAlert}
					/>
				)}
				<div className="p-2">
					<div>
						{/* loading show loader */}
						{loading && (
				<Loader />
			)}
						{!loading && (
							<>
								<div>
									<div className="flex flex-col md:flex-row lg:flex-row justify-center md:space-x-8  lg:space-x-4 sm:space-y-2 md:space-y-0 lg:space-y-0 mt-2">
										<Article
											valName={"No of bags today"}
											val={
												data[data.length-1]?.total_quantity ? data[data.length-1]?.total_quantity : 0
											}
											metaVal={
												"Avg: "+ Number(averageMonthlyQuantity).toFixed(0)
											}
										/>
										{/* Average monthly quantity */}
										<Article
											valName={"Monthly avg weight"}
											// create val for average monthly quantity
											val={Number(averageMonthlyWweight).toFixed(0) + " Kg"}

											metaVal={1}
										/>
										<Article
											valName={"Refund today"}
											val={
												(data[data.length-1]?.total_refund_value).toLocaleString("en-IN")
													? "Rs." + data[data.length-1]?.total_refund_value
													: 0
											}
											metaVal={
												data[data.length-1]?.total_refund_value -
												data[data.length-2]?.total_refund_value
													? "Rs." +
													  (data[data.length-1]?.total_refund_value -
															data[data.length-2]?.total_refund_value)
													: 0
											}
										/>
										<Article
											valName={commissionDates[commissionDates.length-1]+" commission"}
											val={
												commissionData[commissionData.length-1]
													? "Rs." + (commissionData[commissionData.length-1]).toLocaleString("en-IN") + " /-"	
													: 0
											}
											metaVal={
												(commissionData[commissionData.length-1] - commissionData[commissionData.length-2])
													? "Rs." +
													  (commissionData[commissionData.length-1] - commissionData[commissionData.length-2]).toLocaleString("en-IN")
													: 0
											}
										/>
										{/* article for the total earnings over last 30 days */}
										<Article
											valName={"Total earnings"}
											val={
												"Rs. " + (commissionSum + refundSum).toLocaleString("en-IN") + " /-"
											}
											metaVal={""}
										/>
									</div>
								</div>
								<div className="flex flex-col md:flex-row lg:flex-row">
									<LineChart
										datesT={dates}
										labelsT={labels}
										refundT={refund}
										labelN={"Bag Quantity"}
										bgCol={"rgba(255, 99, 132, 0.2)"}
										borCol={"rgba(255, 99, 132, 1)"}
										tody={date}
									/>
									<LineChart
										datesT={refund}
										labelsT={labels}
										labelN={"Refund Amt"}
										bgCol={"rgba(25, 99, 132, 0.2)"}
										borCol={"blue"}
										tody={date}
									/>
								</div>
								<div className="flex justify-center">
								<LineChart
									datesT={commissionData}
									labelsT={commissionDates}
									labelN={"Commission"}
									bgCol={"rgba(25, 99, 132, 0.2)"}
									borCol={"green"}
									tody={date}
									/>
								</div>
								<div className="flex flex-col justify-center">
									<h1 className="text-center font-semibold 5xl">
										Top 5 Farmers for the week of{" "}
										{new Date(date).toLocaleDateString("en-IN", {
											weekday: "short",
											day: "numeric",
											month: "short",
										})}
									</h1>
									{/* <DoughnutChart
										datesT={topFarmersData}
										labelsT={topFarmersLabels}
										labelN={"डाग"}
									/> */}
									{/* create table */}
									<div className="flex flex-col">
										<table className="table-auto">
											<thead>
												<tr>
													<th className="px-4 py-2">Farmer Name</th>
													<th className="px-4 py-2">Quantity</th>
												</tr>
											</thead>
											<tbody>
												{topFarmers.map((item, index) => (
													<tr key={index}>
														<td className="border px-4 py-2">
															{item.farmername}
														</td>
														<td className="border px-4 py-2">
															{item.total_quantity}
														</td>
													</tr>
												))}
											</tbody>
										</table>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default Page;
