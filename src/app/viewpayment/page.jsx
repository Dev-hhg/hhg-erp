'use client';
import { useEffect, useState } from 'react';
import {
  getPaymentDetails,
  getEntriesVmDataByVendor,
  getRefundByVendor,
} from '@/serverComponents/dbFunctions';
import VendorSelect from '@/components/VendorSelect';
import Alert from '@/components/Alert';
import FromtoDate from '@/components/FromtoDate';
import { useSession } from 'next-auth/react';

export default function Page() {
  const { data: session, status } = useSession();
  const [alert, setAlert] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [vendor, setVendor] = useState('');
  const [total, setTotal] = useState({ receivable: 0, received: 0 });
  // const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [entries, setEntries] = useState([]);
  const today = new Date().toISOString().split('T')[0];

  if (status === 'authenticated') {
    if (session?.user?.role === 'guest' || session?.user?.role === 'user') {
      return (
        <div className="flex h-screen items-center justify-center">
          <h1 className="text-3xl text-white">
            You are not authorized to view this page
          </h1>
        </div>
      );
    }
  }
  const [toDate, setToDate] = useState(today);
  // set from date one month prev to today
  const tempDate = new Date(
    new Date().getTime() - 30 * 24 * 60 * 60 * 1000
  ).toISOString();
  const [fromDate, setFromDate] = useState(tempDate.split('T')[0]);

  const refactorData = ({ vmData, refundData }) => {
    const newData = {};
    vmData
      .sort((a, b) => b.payable - a.payable)
      .forEach((entry) => {
        const date = entry.date.toLocaleDateString('en-IN');
        if (!newData[date]) {
          newData[date] = { vm: [], refund: 0 };
        }
        newData[date].vm.push(entry);
      });
    refundData.forEach(({ date, value }) => {
      const dateStr = date.toLocaleDateString('en-IN');
      if (newData[dateStr]) {
        newData[dateStr].refund = value;
      }
    });
    return newData;
  };

  const sumUp = (data) => {
    const dateWiseData = [];
    let totalPayable = 0;
    let totalCommission = 0;
    let totalRefund = 0;

    for (const date of Object.keys(data)) {
      const entry = data[date];
      if (entry != null) {
        let payable = 0;
        let commission = 0;

        for (const { payable: p, commision: c } of entry.vm) {
          payable += Number(p);
          commission += Number(c);
        }

        totalPayable += payable;
        totalCommission += commission;
        totalRefund += Number(entry.refund);

        dateWiseData.push({
          date,
          payable,
          commission,
          refund: entry.refund,
        });
      }
    }

    setTotal({
      payable: totalPayable,
      commission: totalCommission,
      refund: totalRefund,
    });

    return dateWiseData;
  };

  const printPDF = () => {
    const printWindow = window.open();
    printWindow.document.write(`
		  <!DOCTYPE html>
			<html>
			  <head>
				<title>${vendor}</title>
				<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.16/tailwind.min.css">
			  </head>
			  <body>
				<div class="">
				  <div class="">
					<div>
					  <div>
						<h1 class="flex text-2xl justify-center">Vendor : ${vendor}</h1>
						<h1 class="flex text-2xl justify-center">Date: ${fromDate.split('-').reverse().join('-')} to ${toDate.split('-').reverse().join('-')}</h1>
					  </div>
					  <table class="min-w-full divide-y-2 divide-gray-200 bg-white text-sm mt-5">
						<thead class="">
						  <tr>
							<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">Sr. No</th>
							<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">Date</th>
							<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">Amount paid</th>
							<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">Amount to be paid</th>
							<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">Commission</th>
							<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">Refund</th>
							<th class="whitespace-nowrap px-1 md:px-2 lg:px-2 py-2 font-bold text-gray-900 border-2">Description</th>
						  </tr>
						</thead>
						<tbody class="divide-y divide-gray-200">
						  ${entries
                .map(
                  (entry, index) => `
							<tr>
							  <td class="whitespace-nowrap text-center py-2 text-gray-700 font-semibold border">${index + 1}</td>
							  <td class="whitespace-nowrap text-center py-2 text-gray-700 font-semibold border">${entry.date}</td>
							  <td class="whitespace-nowrap text-center py-2 text-gray-700 font-semibold border">₹${entry.received?.toLocaleString('en-IN') || ''}</td>
							  <td class="whitespace-nowrap text-center py-2 text-gray-700 font-semibold border">₹${entry.payable?.toLocaleString('en-IN') || 0}/-</td>
							  <td class="whitespace-nowrap text-center py-2 text-gray-700 font-semibold border">₹${entry.commission?.toLocaleString('en-IN') || 0}/-</td>
							  <td class="whitespace-nowrap text-center py-2 text-gray-700 font-semibold border">₹${entry.refund?.toLocaleString('en-IN') || 0}/-</td>
							  <td class="whitespace-nowrap text-center py-2 text-gray-700 font-semibold border">${entry.modeofpayment ? entry.modeofpayment : `Memo ${entry.date}`}</td>
							</tr>
						  `
                )
                .join('')}
						</tbody>
						<tbody>
						  <tr>
							<td class="whitespace-nowrap text-semibold text-center py-2 text-gray-700">Total</td>
							<td class="whitespace-nowrap text-center py-2 text-gray-700"></td>
							<td class="whitespace-nowrap font-bold text-center py-2 text-gray-700">- ₹${total.received.toLocaleString('en-IN')}/-</td>
							<td class="whitespace-nowrap font-bold text-center py-2 text-gray-700">+ ₹${total.payable.toLocaleString('en-IN')}/-</td>
							<td class="whitespace-nowrap font-bold text-center py-2 text-gray-700">+ ₹${total.commission.toLocaleString('en-IN')}/-</td>
							<td class="whitespace-nowrap font-bold text-center py-2 text-gray-700">+ ₹${total.refund.toLocaleString('en-IN')}/-</td>
						  </tr>
						  <tr></tr>
						  <tr>
							<td class=" whitespace-nowrap font-bold text-center py-2 text-gray-700">Closing Balance</td>
							<td colSpan="5" class="whitespace-nowrap font-bold text-center py-2 text-gray-700">₹${(total.payable + total.commission + total.refund - total.received).toLocaleString('en-IN')}/-</td>
						  </tr>
						</tbody>
					  </table>
					</div>
				  </div>
				</div>
			  </body>
			</html>
		  `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  useEffect(() => {
    async function getData() {
      const vmData = await getEntriesVmDataByVendor({
        vendor,
        fromDate,
        toDate,
      });
      const refundData = await getRefundByVendor({ vendor, fromDate, toDate });
      const paidDetails = await getPaymentDetails({ vendor, fromDate, toDate });
      const refactoredData = refactorData({ vmData, refundData });
      const final = sumUp(refactoredData);
      let totalRecieved = 0;
      paidDetails.forEach(({ date, received, modeofpayment }) => {
        totalRecieved += received;
        final.push({
          received,
          modeofpayment,
          date: date.toLocaleDateString('en-IN'),
        });
      });
      setTotal((prev) => {
        return { ...prev, received: totalRecieved };
      });
      final.sort(
        (a, b) =>
          new Date(b.date.split('/').reverse().join('/')) -
          new Date(a.date.split('/').reverse().join('/'))
      );
      console.log(final);
      setEntries(final);
    }
    if (vendor) getData();
  }, [vendor, loadingVendors]);

  const handleVendorChange = (e) => {
    const { value } = e.target;
    setVendor(value);
  };

  return (
    <div className="mx-auto p-6">
      <div className="rounded-lg bg-white p-6 shadow-md">
        <h2 className="text-2xl font-bold">Vendor Payment</h2>

        {alert.show && (
          <div
            className={`mb-4 rounded-md p-4 ${alert.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
          >
            {alert.message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <FromtoDate
              from={fromDate}
              setFrom={setFromDate}
              to={toDate}
              setTo={setToDate}
            />
          </div>
          <div className="flex flex-row space-x-4">
            <VendorSelect
              className="w-auto"
              name="vendorName"
              handleChange={handleVendorChange}
              value={vendor}
              setLoadingVendors={setLoadingVendors}
              loading={loadingVendors}
              required
            />
            <button
              onClick={printPDF}
              className={`inline-flex items-center rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-gray-800`}
            >
              <svg
                className="mr-2 h-4 w-4 fill-current"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
              </svg>
              <span>Download</span>
            </button>
          </div>
        </div>

        {entries.length > 0 && (
          <div className="mt-8 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Sr. No.
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount to be paid
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Date
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Commission
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Refund
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount Recieved
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {entries.map((entry, index) => (
                  <tr key={index}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ₹{entry.payable?.toLocaleString('en-IN') || 0}/-
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {entry.date}
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ₹{entry.commission?.toLocaleString('en-IN') || 0}/-
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ₹{entry.refund?.toLocaleString('en-IN') || 0}/-
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {entry.modeofpayment || `Memo ${entry.date}`}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      ₹{entry.received?.toLocaleString('en-IN') || 0}/-
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td
                    colSpan="2"
                    className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900"
                  >
                    Total
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    ₹{total.payable.toLocaleString('en-IN')}/-
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    ₹{total.commission.toLocaleString('en-IN')}/-
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    ₹{total.refund.toLocaleString('en-IN')}/-
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900"></td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    ₹{total.received.toLocaleString('en-IN')}/-
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan="2"
                    className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900"
                  >
                    Closing Balance
                  </td>
                  <td
                    colSpan="5"
                    className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900"
                  >
                    ₹
                    {(
                      total.payable +
                      total.commission +
                      total.refund -
                      total.received
                    ).toLocaleString('en-IN')}
                    /-
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
