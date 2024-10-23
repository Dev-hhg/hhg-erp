'use client';
import Alert from '@/components/Alert';
import DateSection from '@/components/DateSection';
import {
  getSum,
  getWeeklyReport,
  getDailyItemReportVendorWise,
} from '@/serverComponents/dbFunctions';
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { set } from 'react-hook-form';
import parser from 'ua-parser-js';

function Page() {
  const [device, setDevice] = useState('');
  const [error, setError] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [Data, setData] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [alert, setAlert] = useState({
    state: false,
    message: '',
    type: '',
  });
  const [print, setPrint] = useState(false);
  useEffect(() => {
    async function getData() {
      const reportData = await getDailyItemReportVendorWise({ date: date });
      setData(reportData);
      // sort the data by grouping items and then highest rate in descending order
      reportData.sort((a, b) => {
        if (a.item > b.item) {
          return 1;
        } else if (a.item < b.item) {
          return -1;
        }
        return b.highest_rate - a.highest_rate;
      });

      console.log(reportData);
      setFetching(true);
    }
    if (date) {
      getData();
    } else {
      setFetching(false);
    }
  }, [date]);

  async function getReport() {
    try {
      setData(reportData);
      console.log(reportData);
    } catch (error) {
      setError(true);
    }
  }
  const itemRowSpans = useMemo(() => {
    const spans = {};
    Data.forEach((item, index) => {
      if (index === 0 || Data[index - 1].item !== item.item) {
        spans[item.item] = Data.filter((i) => i.item === item.item).length;
      }
    });
    return spans;
  }, [Data]);

  async function printPDF() {
    setPrint(true);
    const printWindow = window.open();
    printWindow.document.write(`
			<!DOCTYPE html>
			<html>
				<head>
					<title>${date.split('-').reverse().join('-')}</title>
					<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.16/tailwind.min.css">
				</head>
				<body>
					<div class="overflow-x-auto rounded-lg bg-white shadow-lg ">
				
					<h1 class="text-lg font-bold text-center">
					HHG Enterprises
					</h1>
					<h1 class="text-md font-semibold text-center">
					Pune Maharashtra | 1234567890, 0987654321
					</h1>

						<h1 class="text-md font-bold text-center">
							Per Kg rate for ${date.split('-').reverse().join('-')} 
						</h1>
						<table class="w-full divide-y-2 divide-gray-200 bg-white text-sm mt-2">
							<thead class="border-b">
								<tr>
									<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">
										Sr. No.
									</th>
									<th class="whitespace
									-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">
										Item
									</th>
									<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">
										Vendor
									</th>
									<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">
										Maximum
									</th>
									<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">
										Minimum
									</th>
									<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">
										Average
									</th>
								</tr>
							</thead>
							<tbody>
								${Data.map(
                  (item, index) => `
									<tr class="border-b">
										${
                      index === 0 || Data[index - 1].item !== item.item
                        ? `
											<td rowspan=${itemRowSpans[item.item]} class="whitespace
											-nowrap text-center py-2 text-gray-700 font-semibold border">
												${index + 1}
											</td>
										`
                        : ''
                    }
										${
                      index === 0 || Data[index - 1].item !== item.item
                        ? `
											<td rowspan=${itemRowSpans[item.item]} class="whitespace
											-nowrap text-center py-2 text-gray-700 font-semibold border">
												${item.item}
											</td>
										`
                        : ''
                    }
										<td class="whitespace-nowrap text-center py-2 text-gray-700 border">
											${item.vendorname}
										</td>
										<td class="whitespace-nowrap text-center py-2 text-gray-700 border">
											${(Number(item.highest_rate) / 10).toLocaleString('en-IN')}
										</td>
										<td class="whitespace-nowrap text-center py-2 text-gray-700 border">
											${(Number(item.lowest_rate) / 10).toLocaleString('en-IN')}
										</td>
										<td class="whitespace-nowrap text-center py-2 text-gray-700 border">
											${(Number(item.average_rate) / 10).toLocaleString('en-IN')}

										</td>
									</tr>
								`
                ).join('')}
							</tbody>
						</table>
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
      <div className="overflow-x-auto rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-8">
        <DateSection date={date} setDate={setDate} />
        <h1 className="text-center text-2xl font-bold">
          Per Kg Rate for {date.split('-').reverse().join('-')}.
        </h1>
        <button
          onClick={printPDF}
          className={`inline-flex items-center rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-gray-800 ${
            print ? 'opacity-50' : ''
          }`}
          disabled={print}
        >
          <svg
            class="h-6 w-6 text-gray-800 dark:text-white"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0  0  24  24"
          >
            <path
              fill-rule="evenodd"
              d="M8  3a2  2  0  0  0-2  2v3h12V5a2  2  0  0  0-2-2H8Zm-3  7a2  2  0  0  0-2  2v5c0  1.1.9  2  2  2h1v-4c0-.6.4-1  1-1h10c.6  0  1 .4  1  1v4h1a2  2  0  0  0  2-2v-5a2  2  0  0  0-2-2H5Zm4  11a1  1  0  0  1-1-1v-4h8v4c0 .6-.4  1-1  1H9Z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Print</span>
        </button>

        {/* Make a table here week, commision, refund */}
        <table className="mt-5 w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="border-b">
            <tr>
              <th className="whitespace-nowrap border-2 px-1 py-2 font-bold text-gray-900 md:px-2 lg:px-2">
                Sr. No.
              </th>
              <th className="whitespace-nowrap border-2 px-1 py-2 font-bold text-gray-900 md:px-2 lg:px-2">
                Item
              </th>
              <th className="whitespace-nowrap border-2 px-1 py-2 font-bold text-gray-900 md:px-2 lg:px-2">
                Vendor
              </th>
              <th className="whitespace-nowrap border-2 px-1 py-2 font-bold text-gray-900 md:px-2 lg:px-2">
                Maximum
              </th>
              <th className="whitespace-nowrap border-2 px-1 py-2 font-bold text-gray-900 md:px-2 lg:px-2">
                Minimum
              </th>
              <th className="whitespace-nowrap border-2 px-1 py-2 font-bold text-gray-900 md:px-2 lg:px-2">
                Average
              </th>
            </tr>
          </thead>
          <tbody>
            {fetching ? (
              Data.map((item, index) => (
                <React.Fragment key={index}>
                  <tr className="border-b">
                    {index === 0 || Data[index - 1].item !== item.item ? (
                      <td
                        rowSpan={itemRowSpans[item.item]}
                        className="whitespace-nowrap border py-2 text-center font-semibold text-gray-700"
                      >
                        {index + 1}
                      </td>
                    ) : null}
                    {index === 0 || Data[index - 1].item !== item.item ? (
                      <td
                        rowSpan={itemRowSpans[item.item]}
                        className="whitespace-nowrap border py-2 text-center font-semibold text-gray-700"
                      >
                        {item.item}
                      </td>
                    ) : null}
                    <td className="whitespace-nowrap border py-2 text-center text-gray-700">
                      {item.vendorname}
                    </td>
                    <td className="whitespace-nowrap border py-2 text-center text-gray-700">
                      {(Number(item.highest_rate) / 10).toLocaleString('en-IN')}
                    </td>
                    <td className="whitespace-nowrap border py-2 text-center text-gray-700">
                      {(Number(item.lowest_rate) / 10).toLocaleString('en-IN')}
                    </td>
                    <td className="whitespace-nowrap border py-2 text-center text-gray-700">
                      {(Number(item.average_rate) / 10).toLocaleString('en-IN')}
                    </td>
                  </tr>
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center">
                  Fetching data...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="mt-2 text-center text-red-500">
          Error fetching data. Please try again.
        </div>
      )}
    </div>
  );
}

export default Page;
