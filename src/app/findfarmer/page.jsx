'use client';
import Alert from '@/components/Alert';
import {
  getFarmersALlData,
  updatePaidStatus,
  searchFarmer,
  getFarmerUsingUid,
  getAdvanceData,
  updateAdvancePaidStatus,
  getFarmers,
} from '@/serverComponents/dbFunctions';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Loader from '@/components/Loader';

export default function Page() {
  const { data: session, statusA } = useSession();
  const [allowed, setAllowed] = useState(false);

  const [farmers, setFarmers] = useState([]);
  // const router = useRouter();
  // fetch farmer data from db once and store it in context

  if (statusA === 'authenticated') {
    if (session?.user?.role !== 'guest') {
      window.alert('You are not allowed to access this page');
      setAllowed(true);
    }
  }

  useEffect(() => {
    const getFarmerDetails = async () => {
      try {
        console.log('Fetching Farmers From DB');
        const tempfarmers = await getFarmers();
        console.log('Farmers', tempfarmers);
        localStorage.setItem('farmers', JSON.stringify(tempfarmers));
        setFarmers(tempfarmers);
        return tempfarmers;
      } catch (error) {
        // setAlert({
        //   state: true,
        //   type: "danger",
        //   message: error.message,
        // });
        window.alert(error.message);
      }
    };
    const storageFarmers = localStorage.getItem('farmers');
    setFarmers(JSON.parse(storageFarmers));
    if (!Boolean(storageFarmers)) {
      return () => getFarmerDetails();
    } else {
      return () => console.log('Farmers data exist');
    }
  }, []);

  // STATES AND VARIABLES DECLARATION STARTS HERE /////////////////////////////////////////
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState([]);

  const [sumOfChecked, setSumOfChecked] = useState(0);
  const [alert, setAlert] = useState({
    state: false,
    type: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const [searchedItems, setSearchedItems] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [paidAmt, setPaidAmt] = useState(0);
  const [toPayAmt, setToPayAmt] = useState(0);

  const [uid, setUid] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [farmername, setFarmerName] = useState('');

  const [advanceUpdates, setAdvanceUpdates] = useState({});
  const [advanceStatus, setAdvanceStatus] = useState({});
  const [update, setUpdates] = useState({});
  const [status, setStatus] = useState({});
  const id = 0;
  const today = new Date().toISOString().split('T')[0];

  // STATES AND VARIABLES DECLARATION ENDS HERE /////////////////////////////////////////
  // const getAdvance = async (tempID) => {
  //   try {
  //     console.log("Farmer Id", Number(tempID));
  //     const tempData = await getAdvanceData({ farmerid: Number(tempID) });
  //     console.log("Advance Data", tempData);
  //     const transformedAdvanceData = tempData.map((item) => ({
  //       date: item.date,
  //       vendorname: item.description,
  //       payable: item.amount * -1,
  //       paid: item.paid,
  //       paiddate: item.paiddate,
  //       advance: true,
  //       time: item.time,
  //       quantity: "-",
  //       weight: "-",
  //       farmerpaymentid: item.farmerpaymentid,
  //       // Add other fields as required
  //     }));

  //     return transformedAdvanceData;
  //   } catch (error) {
  //     setAlert({
  //       state: true,
  //       type: "danger",
  //       message: error,
  //     });
  //     window.alert(error.message);
  //   }
  // };

  useEffect(() => {
    setFocusedIndex(-1);
    const timerId = setTimeout(() => {
      if (searchTerm !== '') {
        const searchData = farmers.filter((farmer) =>
          farmer.farmername.includes(searchTerm.trim())
        );
        setSearchedItems(searchData);
      }
    }, 500);
    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  const keyDownHandler = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIndex((prevIndex) =>
        Math.min(prevIndex + 1, searchedItems.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchedItems.length > 0) {
        setSearchTerm(searchedItems[focusedIndex].farmername);
        setSearchedItems([]);
      }
    }
  };
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSearchedItems([]);
    setEntries([]);
    setSumOfChecked(0);
    setPaidAmt(0);
    setToPayAmt(0);
    setAdvanceStatus({});
    setStatus({});
    setFarmerName('');
    setMobileNo('');
    setUid('');
    try {
      if (searchTerm !== '' && uid === '') {
        console.log('Search Term', searchTerm);
        setUid(
          farmers.find((farmer) => farmer.farmername === searchTerm.trim())?.uid
        );
        console.log(
          'UID',
          farmers.find((farmer) => farmer.farmername === searchTerm.trim())?.uid
        );
        console.log('Re routing to findfarmer/uid');
        window.location.href = `/findfarmer/${farmers.find((farmer) => farmer.farmername === searchTerm.trim())?.uid}`;
        let id = farmers.find(
          (farmer) => farmer.farmername === searchTerm.trim()
        )?.farmerid;
        console.log('Farmer Id', id);
        const data = await getFarmersALlData({ farmerid: id });
        console.log('Data', data);
        const tempMobileNo = data.find(
          (entry) => entry.mobilenumber
        )?.mobilenumber;
        setMobileNo(tempMobileNo);
        const tempId = id;
        //   console.log("Temp Id", tempId);
        setFarmerName(searchTerm);

        const temp = {};
        for (const entry of data) {
          temp[entry.entryid] = entry.paid;
        }
        setStatus(temp);
        if (data.length > 0) {
          let paidSum = 0;
          let toPaySum = 0;
          for (const entry of data) {
            // Calculate paidSum and toPaySum
            if (entry.paid) {
              paidSum += entry.payable;
            } else {
              toPaySum += entry.payable;
            }
          }
          setPaidAmt(paidSum);
          setToPayAmt(toPaySum);
        }

        // Use a local variable to store the data
        let allData = data;

        if (tempId) {
          const advanceData = await getAdvance(tempId);
          allData = [...allData, ...advanceData];
        }
        allData.sort((a, b) => {
          // Convert paid to number
          let paidA = Number(a.paid);
          let paidB = Number(b.paid);

          // Sort by paid first
          if (paidA !== paidB) {
            return paidA - paidB;
          }

          // If paid is the same, sort by date
          let dateA = new Date(a.date);
          let dateB = new Date(b.date);

          return dateB - dateA;
        });
        const advtemp = {};
        for (const entry of allData) {
          advtemp[entry.farmerpaymentid] = entry.paid;
        }
        setAdvanceStatus(advtemp);

        // Update the state once all the data is ready
        setEntries(allData);
      } else {
        //  redirect to findfarmer/uid
        window.location.href = `/findfarmer/${uid}`;
        // const data = await getFarmerUsingUid({ uid: uid });
        // console.log("Data", data);
        // setUid(farmers.find(
        // 	(farmer) => farmer.farmername === searchTerm.trim()
        //   )?.uid);
        // const tempMobileNo = data.find(
        //   (entry) => entry.mobilenumber
        // )?.mobilenumber;
        // setMobileNo(tempMobileNo);
        // const tempId = data.find((entry) => entry.farmerid)?.farmerid;
        // console.log("Temp Id", tempId);
        // setFarmerName(data[0].farmername);

        // const temp = {};
        // for (const entry of data) {
        //   temp[entry.entryid] = entry.paid;
        // }
        // setStatus(temp);

        // // Use a local variable to store the data
        // let allData = data;

        // if (tempId) {
        //   const advanceData = await getAdvance(tempId);
        //   allData = [...allData, ...advanceData];
        // }
        // if (allData.length > 0) {
        //   let paidSum = 0;
        //   let toPaySum = 0;
        //   for (const entry of allData) {
        //     // Calculate paidSum and toPaySum
        //     if (entry.paid) {
        //       paidSum += Math.abs(entry.payable);
        //     } else {
        //       toPaySum += entry.payable;
        //     }
        //   }
        //   setPaidAmt(paidSum);
        //   setToPayAmt(toPaySum);
        // }
        // allData.sort((a, b) => {
        //   // Convert paid to number
        //   let paidA = Number(a.paid);
        //   let paidB = Number(b.paid);

        //   // Sort by paid first
        //   if (paidA !== paidB) {
        //     return paidA - paidB;
        //   }

        //   // If paid is the same, sort by date
        //   let dateA = new Date(a.date);
        //   let dateB = new Date(b.date);

        //   return dateB - dateA;
        // });
        // const advtemp = {};
        // for (const entry of allData) {
        //   advtemp[entry.farmerpaymentid] = entry.paid;
        // }
        // setAdvanceStatus(advtemp);

        // // Update the state once all the data is ready
        // setEntries(allData);
      }
    } catch (error) {
      setAlert({
        state: true,
        type: 'danger',
        message: error.message,
      });
      console.log('Error', error);
    } finally {
      setLoading(false);
      console.log('Loading', loading);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      console.log('Update', advanceUpdates);
      if (Object.keys(update).length != 0) {
        await updatePaidStatus({ update, today });
        setAlert({
          state: true,
          message: 'Paid Updated Successfully',
          type: 'success',
        });
        setUpdates({});
      } else if (Object.keys(advanceUpdates).length != 0) {
        await updateAdvancePaidStatus({ update: advanceUpdates, today });
        console.log('Advance Updates have been sent to db', advanceUpdates);
        setAlert({
          state: true,
          message: 'Paid Updated Successfully',
          type: 'success',
        });
        setAdvanceUpdates({});
      } else {
        setAlert({
          state: true,
          message: 'Nothing To Update',
          type: 'warn',
        });
      }
    } catch (error) {
      setAlert({
        state: true,
        type: 'danger',
        message: error,
      });
    } finally {
      setLoading(false);
    }
  };

  const searchResult = searchedItems.map(({ farmername }, index) => {
    const isSel = index === focusedIndex;
    return (
      <li
        key={farmername}
        className={`cursor-pointe ${
          isSel ? 'bg-blue-400 text-white' : ''
        }hover:bg-blue-400 rounded-md p-1 hover:text-white`}
        onClick={() => setSearchTerm(farmername)}
      >
        {farmername}
      </li>
    );
  });

  return (
    <div className="p-2 md:p-14 lg:p-14">
      <div className="relative rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
        {alert.state && (
          <Alert
            message={alert.message}
            type={alert.type}
            setState={setAlert}
            timer={5000}
          />
        )}
        {loading && <Loader />}
        <form
          onSubmit={handleSearch}
          className={`flex ${loading ? 'opacity-20' : ''}`}
        >
          <div className="mx-2 flex w-full space-x-2 md:w-1/2">
            <input
              className="w-full rounded-lg border-gray-200 p-3 text-sm"
              placeholder="farmerName"
              type="text"
              id="farmerName"
              name="farmerName"
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 1000)}
              disabled={loading}
              value={searchTerm || farmername}
              autoFocus
              onKeyDown={keyDownHandler}
            />
            <input
              className="w-full rounded-lg border-gray-200 p-3 text-sm"
              placeholder="5 digit uid"
              type="text"
              id="uid"
              name="uid"
              onChange={(e) => setUid(e.target.value)}
              value={uid}
              pattern="\d{5}"
              title="UID must be a 5-digit number"
              disabled={loading}
            />
          </div>
          <div className="group">
            <button
              id="search"
              disabled={loading}
              className="rounded-lg border border-gray-200 bg-gray-50 px-2 py-2.5 font-medium text-blue-600 transition-colors hover:text-white active:bg-blue-800 disabled:opacity-50 group-hover:border-blue-700 group-hover:bg-blue-600 md:px-12"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="fill-current text-gray-900 group-hover:text-white"
                width="24"
                height="24"
              >
                <path
                  fillRule="evenodd"
                  d="M14.53 15.59a8.25 8.25 0 111.06-1.06l5.69 5.69a.75.75 0 11-1.06 1.06l-5.69-5.69zM2.5 9.25a6.75 6.75 0 1111.74 4.547.746.746 0 00-.443.442A6.75 6.75 0 012.5 9.25z"
                ></path>
              </svg>
            </button>
          </div>
        </form>
        <ul className="ml-2 mt-2 w-1/2 rounded-md bg-gray-400 text-white">
          {searchResult}
        </ul>
        {entries.length !== 0 && (
          <form
            className={`space-y-4 ${loading ? 'opacity-20' : ''}`}
            onSubmit={handleSubmit}
          >
            <div className="mt-4 flex justify-around">
              <div className="ml-2font-bold">UID: {uid}</div>
              <div className="ml-2font-bold">Farmer Name : {farmername}</div>
              <div className="ml-2font-bold">Mobile Number : {mobileNo}</div>
            </div>
            <div className="w-full border-b-2 border-gray-500"></div>

            <table className="mt-5 min-w-full divide-y-2 divide-gray-200 bg-white text-sm md:block">
              <thead className="">
                <tr>
                  <th className="whitespace-nowrap px-1 py-2 font-bold text-gray-900 md:px-10 lg:px-10">
                    Sr. No.
                  </th>
                  <th className="whitespace-nowrap px-1 py-2 font-bold text-gray-900 md:px-10 lg:px-10">
                    Date
                  </th>
                  <th className="whitespace-nowrap px-1 py-2 font-bold text-gray-900 md:px-10 lg:px-10">
                    Farmer Name
                  </th>

                  <th className="whitespace-nowrap px-1 py-2 font-bold text-gray-900 md:px-10 lg:px-10">
                    Vendor
                  </th>
                  <th className="whitespace-nowrap px-1 py-2 font-bold text-gray-900 md:px-10 lg:px-10">
                    Quantity
                  </th>
                  <th className="whitespace-nowrap px-1 py-2 font-bold text-gray-900 md:px-10 lg:px-10">
                    Weight
                  </th>
                  <th className="whitespace-nowrap px-1 py-2 font-bold text-gray-900 md:px-10 lg:px-10">
                    Advance
                  </th>
                  <th className="whitespace-nowrap px-1 py-2 font-bold text-gray-900 md:px-10 lg:px-10">
                    Payable
                  </th>
                  <th className="whitespace-nowrap px-1 py-2 font-bold text-gray-900 md:px-10 lg:px-10">
                    Date Paid
                  </th>
                  <th className="whitespace-nowrap px-1 py-2 font-bold text-gray-900 md:px-10 lg:px-10">
                    Paid
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {entries.map((entry, index) => {
                  return (
                    <tr key={index}>
                      <td
                        className={`whitespace-nowrap py-2 text-center text-gray-700`}
                      >
                        {index + 1}
                      </td>
                      <td
                        className={`whitespace-nowrap py-2 text-center ${
                          entry.advance && !entry.paid
                            ? 'text-red-500'
                            : 'text-gray-700'
                        }`}
                      >
                        {entry.date.toLocaleDateString('en-IN')}
                      </td>

                      {entry.advance ? (
                        <>
                          <td
                            className={`whitespace-nowrap py-2 text-center ${
                              entry.advance && !entry.paid
                                ? 'text-red-500'
                                : 'text-gray-700'
                            }`}
                          >
                            {entry.time}
                          </td>
                          <td
                            className={`whitespace-nowrap py-2 text-center font-bold ${
                              entry.advance && !entry.paid
                                ? 'text-red-500'
                                : 'text-gray-700'
                            }`}
                            colSpan="3"
                          >
                            {entry.vendorname}
                          </td>
                          <td
                            className={`py-text-gray-700 whitespace-nowrap text-center`}
                          >
                            ₹{entry.payable || 0}
                          </td>
                          <td
                            className={`whitespace-nowrap py-2 text-center ${
                              entry.advance && !entry.paid
                                ? 'text-red-500'
                                : 'text-gray-700'
                            }`}
                          ></td>
                        </>
                      ) : (
                        <>
                          <td
                            className={`whitespace-nowrap py-2 text-center ${
                              entry.advance && !entry.paid
                                ? 'text-red-500'
                                : 'text-gray-700'
                            }`}
                          >
                            {entry.item}
                          </td>
                          <td
                            className={`whitespace-nowrap py-2 text-center ${
                              entry.advance && !entry.paid
                                ? 'text-red-500'
                                : 'text-gray-700'
                            }`}
                          >
                            {entry.vendorname}
                          </td>
                          <td
                            className={`whitespace-nowrap py-2 text-center ${
                              entry.advance && !entry.paid
                                ? 'text-red-500'
                                : 'text-gray-700'
                            }`}
                          >
                            {entry.quantity}
                          </td>
                          <td
                            className={`whitespace-nowrap py-2 text-center ${
                              entry.advance && !entry.paid
                                ? 'text-red-500'
                                : 'text-gray-700'
                            }`}
                          >
                            {entry.weight} {entry.advance ? '' : 'Kg'}
                          </td>
                          <td
                            className={`py-text-gray-700 whitespace-nowrap text-center`}
                          >
                            {''}
                          </td>
                          <td
                            className={`whitespace-nowrap py-2 text-center ${
                              entry.advance && !entry.paid
                                ? 'text-red-500'
                                : 'text-gray-700'
                            }`}
                          >
                            ₹{entry.payable || 0}
                          </td>
                        </>
                      )}

                      <td
                        className={`whitespace-nowrap py-2 text-center ${
                          entry.advance && !entry.paid
                            ? 'text-red-500'
                            : 'text-gray-700'
                        }`}
                      >
                        {entry.paiddate
                          ? entry.paiddate.toLocaleDateString('en-IN')
                          : 'Not Paid'}
                      </td>
                      {allowed && (
                        <td className="whitespace-nowrap py-2 text-center text-gray-700">
                          <input
                            name="paid"
                            className={`rounded-lg border-gray-200 p-3 text-sm ${
                              entry.payable == 0 ||
                              entry.payable === '' ||
                              entry.payable == null
                                ? 'cursor-not-allowed bg-gray-200'
                                : 'cursor-pointer bg-white'
                            }`}
                            type="checkbox"
                            checked={
                              status[entry.entryid] || entry.advance
                                ? advanceStatus[entry.farmerpaymentid]
                                : false
                            }
                            onChange={(e) => {
                              const value = e.target.checked;

                              setUpdates((prev) => {
                                return { ...prev, [entry.entryid]: value };
                              });
                              setStatus((prev) => {
                                return { ...prev, [entry.entryid]: value };
                              });
                              setAdvanceStatus((prev) => {
                                return {
                                  ...prev,
                                  [entry.farmerpaymentid]: value,
                                };
                              });
                              setAdvanceUpdates((prev) => {
                                return {
                                  ...prev,
                                  [entry.farmerpaymentid]: value,
                                };
                              });
                              if (update[entry.entryid] === !entry.paid)
                                setUpdates((prev) => {
                                  delete prev[entry.entryid];
                                  const temp = prev;
                                  return prev;
                                });
                              if (
                                advanceUpdates[entry.farmerpaymentid] ===
                                !entry.paid
                              )
                                setAdvanceUpdates((prev) => {
                                  delete prev[entry.farmerpaymentid];
                                  const temp = prev;
                                  return prev;
                                });
                              if (value) {
                                setSumOfChecked((prev) => prev + entry.payable);
                              } else {
                                setSumOfChecked((prev) => prev - entry.payable);
                              }
                            }}
                            disabled={
                              false ||
                              entry.payable == 0 ||
                              entry.payable === '' ||
                              entry.payable == null ||
                              loading ||
                              !allowed
                            }
                          />
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td className="whitespace-nowrap py-2 text-center text-gray-700"></td>
                  <td
                    colSpan={3}
                    className="whitespace-nowrap py-2 text-center text-gray-700"
                  ></td>
                  <td
                    colSpan={2}
                    className="whitespace-nowrap py-2 text-center font-bold text-gray-700"
                  >
                    Amount Paid
                  </td>
                  <td className="whitespace-nowrap py-2 text-center font-bold text-gray-700">
                    ₹{paidAmt.toLocaleString('en-IN')}/-
                  </td>
                  <td className="whitespace-nowrap py-2 text-center font-bold text-gray-700">
                    Amount To Pay
                  </td>
                  <td className="whitespace-nowrap py-2 text-center font-bold text-gray-700">
                    ₹{toPayAmt.toLocaleString('en-IN')}/-
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="w-full border-b-2 border-gray-500"></div>
            <div className="text-center text-xl font-semibold text-green-800">
              Selected Reciepts amt : ₹{sumOfChecked.toLocaleString('en-IN')}/-
            </div>
            <div className="mt-8 flex items-center justify-center">
              <button
                type="submit"
                name="save"
                className="mx-10 inline-block w-full rounded-lg bg-black px-10 py-3 font-medium text-white sm:w-auto"
                disabled={loading}
              >
                Save
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
