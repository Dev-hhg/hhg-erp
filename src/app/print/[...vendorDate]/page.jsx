'use client';
import { useEffect, useRef, useState, useContext } from 'react';
import generatePDF from 'react-to-pdf';
import {
  getEntriesByDateVendor,
  getRefundByDateVendor,
  getGalaNumber,
  updateRefundPrinted,
} from '@/serverComponents/dbFunctions';
import { VendorContext } from '@/app/Context/vendorcontext';

export default function ClientComponent({ params: { vendorDate } }) {
  const { refundData, setRefundData, entriesData, setEntriesData } =
    useContext(VendorContext);
  const [data, setData] = useState([]);
  // const [refundData, setRefundData] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [print, setPrint] = useState(false);
  const [count, setCount] = useState(0);
  const [galaNumber, setGalaNumber] = useState('');

  const targetRef = useRef();
  const vendor = decodeURIComponent(vendorDate[0]);
  const date = vendorDate[1];
  const dateArr = date.split('-');
  const formattedDate = `${dateArr[2]}-${dateArr[1]}-${dateArr[0]}`;
  const options = {
    method: 'save',
    page: {
      format: 'A5',
    },
    filename: `${vendor}${date}`,
  };

  function printPDF() {
    // console.log(entries);
    setPrint(true);
    const printWindow = window.open();
    printWindow.document.open();
    printWindow.document.write(`
			<html>
				<head>
					<title>Print</title>
					<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss/dist/tailwind.min.css">
				</head>
				<title>HHG</title>
				<style>
				@media print {
					@page {
						size: A5;
						margin: 2px;
					}
					body {
						border: 2px solid black; /* Adjust border width and color as needed */
						padding: 10px; /* Adjust padding as needed */
					}
					 tfoot td {
                            height: 30px; /* Adjust the height as needed */
                    }
                        .report-footer {
                            position: fixed;
                            bottom: 2px;
                            height: 20px; /* Adjust the height as needed */
                            display: block;
                            width: 100%;
                            overflow: visible;
							text-align: center;
							left: 10px;
						}
				}
					
				  
	  
				 
				
						</style>
									<body>
						
							<div class="m-2">
								<div class="flex justify-center">
								<div class="flex flex-col items-center justify-center  ">
							<div class="">
							<div class="my-1 text-xs font-bold flex justify-center">
								।। श्री हनुमान प्रसन्न ।।
							</div>
							<div class="my-1 text-3xl font-black text-red-500 flex justify-center">
								HHG Enterprises
							</div>
							<div class=" my-1 xs font-semibold flex justify-center">
								Pune, Maharashtra | 1234567890, 0987654321
							</div>
							<div class="text-sm font-black flex justify-center border-gray-500">
							 Prop. - Shri. Owner Name
							</div>
							</div>
							<div class="w-full border-b-2 border-gray-500"></div>
							<div class=" mt-2 text-lg w-full flex justify-between items-center">
							<div>
							Dear Sir, : <span class=" font-semibold">${vendor}</span> <span class="text-xs font-semibold">(${
                galaNumber || ''
              })</span>
													</div>
													<div class="text-sm font-semibold">दि : ${formattedDate}</div>
													</div>
													<div class="mt-1 flex text-xs text-left font-semibold  ">
													We have sent <span class="font-bold px-1 underline">${totalQuantity}</span> quantity of material <span class="font-bold underline px-1">${
                            refundData[0]?.transportername
                          }</span> in vehicle no. <span class="font-bold px-1 underline">${
                            refundData[0]?.vehicleno
                          }</span> today.
							</div>
							<div class="mt-2 w-full border-b-2 border-gray-500"></div>
							<table class="w-full divide-y-2 divide-gray-200 bg-white text-sm">
							<thead class="first-page" id="printTable">
							<tr>
							<th colSpan="6" class="whitespace-nowrap px-3 py-1 font-medium text-gray-900"  id="headerRow"> HHG, ${formattedDate} | ${vendor}</th>
							</tr>
							<th class="text-gray-900">Sr. No.</th>
							<th class="text-gray-900">Farmer name</th>
							<th class="text-gray-900">Item</th>
							<th class="text-gray-900">Qty</th>
							<th class="text-gray-900">Weight</th>
							<th class="text-gray-900">Transort rate</th>
							</tr>
							</thead>
							<tbody class="divide-y">
							${data.map(
                (ok, index) =>
                  `<div>
								<tr>
									<td class=" text-center   py-1.5 p-1 w-1/8 text-gray-700">${index + 1}</td>
									<td class=" text-center py-1.5 whitespace-nowrap text-gray-700">${
                    ok.farmername
                  }</td>
									<td class=" text-center py-1.5 text-gray-700">${ok.item}</td>
									<td class=" text-center py-1.5 text-gray-700">${ok.quantity}</td>
									<td class=" text-center py-1.5 text-gray-700">${ok.weight}</td>
									<td class=" text-center py-1.5 text-gray-700">${ok.transportrate}/-</td>
								</tr>
								
								</div
								`
              )}
							<tr class="">
							<td class="whitespace-nowrap text-right py-1 font-semibold text-gray-900">Total</td>
							<td colSpan="2" class="whitespace-nowrap text-right py-1 font-semibold text-gray-900"></td>
							<td class="whitespace-nowrap text-center py-1 font-semibold text-gray-900 ">${totalQuantity}</td>
							<td class="whitespace-nowrap text-center py-1 font-semibold text-gray-900 ">${totalWeight.toLocaleString(
                'en-IN'
              )}</td>
							<td class="whitespace-nowrap text-center  py-1 font-semibold text-gray-900 ">₹ ${totalTransportRate.toLocaleString(
                'en-IN'
              )}/-</td>

						</tr>
						
						</tbody>
						<tfoot>
									<tr>
										<td>&nbsp;</td>
									</tr>
						</tfoot>
						</table>
						<div class="w-full border-b-2 border-gray-500 "></div>
						${
              refundData[0] &&
              `<div class="w-full flex items-center justify-between mx-10 ">
								<div class="font-semibold">
									<label for="refund" class="ml-2 font-medium text-sm text-gray-900 ">Refund :</label>
									<span class=" text-center   font-semibold text-gray-900  ">₹ ${refundData[0]?.value.toLocaleString(
                    'en-IN'
                  )}/-</span>
								</div>
								<div class="font-[Noto Sans] my-1">
									<label for="refund" class="font-medium text-sm text-gray-900 ">Nett transport charge :</label>
									<span class=" text-center font-semibold text-gray-900  ">₹ ${(
                    Number(totalTransportRate) -
                    Number(refundData[0]?.value || 0)
                  ).toLocaleString('en-IN')}/-</span>
								</div>
							</div>
							<div class="w-full flex my-1">
								<div class="w-full border-b-2 border-gray-500"></div>
							</div>
							<div class="flex ">
								<div class=" ml-2 text-xs font-semibold ">
									Note: If bags are reduced, make a slip from the freight. If there is any discrepancy, do not pay the freight.
								</div>
								<div class="my-2 text-sm w-1/2 text-right ml-2">
                  <img id="logo" src="/sign.png" width="100px" height="100px"  alt="signature" />
									For HHG Enterprises
								</div>
							</div>`
            }
						</div>
						
						<div class="report-footer flex justify-center text-center">
							<p class="text-xs font-semibold">*PPO </p>
                </div>
				</body>
			</html>
		`);
    printWindow.document.close();
    // wait for the window to load
    printWindow.onload = () => {
      // print the window
      printWindow.print();
      printWindow.close();
      setPrint(false);
    };
  }

  function downloadPDF() {
    setPrint(true);
    try {
      updateRefundPrinted({ date, vendor });
    } catch (error) {
      window.alert('Error updating refund printed status');
    }
    // generatePDF(targetRef, options);
    // options.method = "open";
    generatePDF(targetRef, options);
    // only print if the device is not mobile
    if (window.innerWidth > 768) {
      printPDF();
    }
  }

  useEffect(() => {
    const getData = async () => {
      setIsLoading(true);
      if (refundData.length === 0) {
        console.log('Getting Data from DB');
        const newdata = await getEntriesByDateVendor({ date, vendor });
        const newRefundData = await getRefundByDateVendor({ date, vendor });
        setRefundData(newRefundData);
        console.log('Refund Data', newRefundData);
        setData(newdata);
      } else {
        console.log('Data already present in context');
        console.log('Refund Data', refundData);
        console.log('Entries Data', entriesData);
        setData(entriesData);
      }
      const newGalaNumber = await getGalaNumber({ vendorName: vendor });
      console.log('Address', newGalaNumber);
      if (newGalaNumber.length > 0) {
        console.log('Addresss', newGalaNumber[0].galanumber);
        setGalaNumber(newGalaNumber[0].galanumber);
      }
      setIsLoading(false);
    };
    getData();
  }, []);

  const rows = data.map((data, index) => (
    <Row data={data} index={index} key={data.transactionid} />
  ));

  function splitArrayIntoChunks(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      const chunk = array.slice(i, i + chunkSize);
      result.push(chunk);
    }
    return result;
  }

  const groups = splitArrayIntoChunks(rows, 15);
  let totalWeight = 0;
  let totalQuantity = 0;
  let totalTransportRate = 0;

  data.forEach((data) => {
    const { weight, quantity, transportrate } = data;
    totalWeight += weight;
    totalQuantity += quantity;
    totalTransportRate += transportrate;
  });

  const Bill = ({ mypagerow, showTotal, firstPage }) => {
    return (
      <div
        className={`flex flex-col items-center justify-center border-2 border-gray-500 px-10 ${
          !firstPage && showTotal ? 'mt-44' : ''
        }`}
      >
        <div className="flex flex-col items-center justify-center">
          <div className="">
            <div className="mt-1 flex justify-center text-xs font-bold">
              ।। श्री हनुमान प्रसन्न ।।
            </div>
            <div className="mb-1 flex justify-center text-3xl font-black text-red-500">
              HHG Enterprises
            </div>
            <div className="xs my-2 flex justify-center font-semibold">
              Pune Maharashtra | 1234567890, 0987654321
            </div>
            <div className="my-1 flex justify-center border-gray-500 pb-1 text-sm font-black">
              Prop. - Shri. Owner Name
            </div>
          </div>

          <div className="w-full border-b-2 border-gray-500"></div>

          <div className="my-1 flex w-full items-center justify-between text-lg">
            <div>
              Dear Sir,: <span className="font-semibold">{vendor}</span>{' '}
              <span className="text-xs font-semibold">
                {'('}
                {galaNumber || ''}
                {')'}
              </span>
            </div>
            <div className="text-sm font-semibold">दि : {formattedDate}</div>
          </div>

          <div className="mt-1 flex justify-end text-left text-xs font-semibold">
            We have sent{' '}
            <span className="px-1 font-bold underline">{totalQuantity}</span>
            quantity item in{' '}
            <span className="px-1 font-bold underline">
              {refundData[0]?.transportername}'s
            </span>
            vehicle no{' '}
            <span className="px-1 font-bold underline">
              {refundData[0]?.vehicleno}
            </span>
            today.
          </div>

          <div className="mt-2 w-full border-b-2 border-gray-500"></div>
          <table className="w-full divide-y-2 divide-gray-200 bg-white text-sm">
            <thead>
              <tr>
                <th className="whitespace-nowrap px-3 py-1 font-medium text-gray-900">
                  Sr. No.
                </th>
                <th className="whitespace-nowrap px-3 py-1 font-medium text-gray-900">
                  Farmer Name
                </th>

                <th className="whitespace-nowrap px-3 py-1 font-medium text-gray-900">
                  Item
                </th>
                <th className="whitespace-nowrap px-3 py-1 font-medium text-gray-900">
                  Quantity
                </th>
                <th className="whitespace-nowrap px-3 py-1 font-medium text-gray-900">
                  Weight
                </th>
                <th className="whitespace-nowrap px-3 py-1 font-medium text-gray-900">
                  Transport Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mypagerow}

              {showTotal && (
                <tr>
                  <td className="whitespace-nowrap py-1 text-right font-semibold text-gray-900">
                    Total
                  </td>
                  <td
                    colSpan="2"
                    className="whitespace-nowrap py-1 text-right font-semibold text-gray-900"
                  ></td>
                  <td className="whitespace-nowrap py-1 text-center font-semibold text-gray-900">
                    {totalQuantity}
                  </td>
                  <td className="whitespace-nowrap py-1 text-center font-semibold text-gray-900">
                    {totalWeight}
                  </td>
                  <td className="whitespace-nowrap py-1 text-center font-semibold text-gray-900">
                    ₹ {totalTransportRate.toLocaleString('en-IN')}/-
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {!showTotal && <div className="mb-2 text-center">*PTO </div>}

          {showTotal && (
            <>
              {refundData[0] && (
                <div className="mx-10 my-1 flex w-full items-center justify-between">
                  <div className="font-semibold">
                    <label
                      htmlFor="refund"
                      className="text-sm font-medium text-gray-900"
                    >
                      Refund :
                    </label>
                    <span className="text-center font-semibold text-gray-900">
                      ₹ {refundData[0]?.value.toLocaleString('en-IN')}/-
                    </span>
                  </div>
                  <div className="font-[Noto Sans]">
                    <label
                      htmlFor="refund"
                      className="text-sm font-medium text-gray-900"
                    >
                      Nett transport charge :
                    </label>
                    <span className="text-center font-semibold text-gray-900">
                      ₹{' '}
                      {(
                        Number(totalTransportRate) -
                        Number(refundData[0]?.value || 0)
                      ).toLocaleString('en-IN')}
                      /-
                    </span>
                  </div>
                </div>
              )}
              <div className="flex w-full">
                <div className="w-full border-b-2 border-gray-500"></div>
              </div>

              <div className="flex">
                <div className="text-xs font-semibold">
                  Note: If bags are reduced, make a slip from the freight. If
                  there is any discrepancy, do not pay the freight.
                </div>
                <div className="my-6 w-full text-right text-sm">
                  For HHG Enterprises
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };
  const allPages = groups.map((data, index) => {
    if (groups.length === index + 1) {
      if (index === 0)
        return (
          <Bill
            key={index}
            mypagerow={data}
            showTotal={true}
            firstPage={true}
          />
        );
      else
        return (
          <Bill
            key={index}
            mypagerow={data}
            showTotal={true}
            firstPage={false}
          />
        );
    } else {
      if (index === 0)
        return (
          <Bill
            key={index}
            mypagerow={data}
            showTotal={false}
            firstPage={true}
          />
        );
      else
        return (
          <Bill
            key={index}
            mypagerow={data}
            showTotal={true}
            firstPage={false}
          />
        );
    }
  });

  return (
    <div>
      <div className={`p-14 ${isLoading ? 'cursor-wait' : ''}`}>
        <div className="flex flex-col items-center overflow-x-auto rounded-lg bg-white p-8 shadow-lg lg:col-span-3">
          {isLoading ? (
            <div className="">
              <svg
                aria-hidden="true"
                className="h-10text-gray-200 inline w-10 animate-spin fill-blue-600 dark:text-gray-600"
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
          ) : (
            <button
              onClick={downloadPDF}
              className={`my-5 inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto ${
                print ? 'opacity-50' : ''
              }`}
            >
              Print
            </button>
          )}
          <div ref={targetRef}>{allPages}</div>
          <div className="mt-2 flex justify-center"></div>
        </div>
      </div>
    </div>
  );
}

const Row = ({
  data: { farmername, item, quantity, weight, transportrate },
  index,
}) => {
  return (
    <tr className="">
      <td className="whitespace-nowrap pb-2 text-center font-medium text-gray-700">
        {index + 1}
      </td>
      <td className="whitespace-nowrap pb-2 text-center text-gray-700">
        {farmername}
      </td>

      <td className="whitespace-nowrap pb-2 text-center text-gray-700">
        {item}
      </td>
      <td className="whitespace-nowrap pb-2 text-center text-gray-700">
        {quantity}
      </td>
      <td className="whitespace-nowrap pb-2 text-center text-gray-700">
        {weight}
      </td>
      <td className="whitespace-nowrap pb-2 text-center text-gray-700">
        {transportrate}/-
      </td>
    </tr>
  );
};
