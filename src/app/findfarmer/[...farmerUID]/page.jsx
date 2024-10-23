'use client';
import Alert from '@/components/Alert';
import {
  updatePaidStatus,
  getFarmerUsingUid,
  getAdvanceData,
  updateAdvancePaidStatus,
  getFarmersALlData,
  getFarmers,
} from '@/serverComponents/dbFunctions';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { set } from 'react-hook-form';
import SaveMenu from '@/components/SaveMenu';
import Loader from '@/components/Loader';

export default function ClientComponent({ params: { farmerUID } }) {
  const { data: session, status } = useSession();
  const [farmers, setFarmers] = useState([]);
  const [allowed, setAllowed] = useState(true);
  // fetch farmer data from db once and store it in context
  const getFarmerDetails = async () => {
    try {
      // console.log("Fetching Farmers From DB");
      const tempfarmers = await getFarmers();
      // console.log("Farmers", tempfarmers);
      localStorage.setItem('farmers', JSON.stringify(tempfarmers));
      setFarmers(tempfarmers);
      return tempfarmers;
    } catch (error) {
      setAlert({
        state: true,
        type: 'danger',
        message: error,
      });
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      console.log('Session', session?.user?.role);
      if (session?.user?.role === 'guest' || session?.user?.role === 'user') {
        // window.alert("आपण पट्टी पेड नाही करू शकत ");
        console.log('You are not allowed to access this page');
        setAllowed(false);
        // console.log("You are  allowed to access this page");
      } else {
        setAllowed(true);
        console.log('You are  allowed to access this page');
      }
    }
  }, [status, session]);

  useEffect(() => {
    const storageFarmers = localStorage.getItem('farmers');
    // console.log("Storage Farmers", Boolean(storageFarmers));

    if (!Boolean(storageFarmers)) {
      // console.log("Farmers data does not exist i am fetching");
      return () => getFarmerDetails();
    } else {
      // console.log("Farmers data exist" + storageFarmers);
      setFarmers(JSON.parse(storageFarmers));
      return () => console.log('Farmers data exist', farmers);
    }
  }, []);

  // STATES AND VARIABLES DECLARATION STARTS HERE /////////////////////////////////////////
  const [searchTerm, setSearchTerm] = useState('');
  const [entries, setEntries] = useState([]);

  const [sumOfChecked, setSumOfChecked] = useState(0.0);
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
  const [farmerMobileNo, setFarmerMobileNo] = useState('');

  const [advanceUpdates, setAdvanceUpdates] = useState({});
  const [advanceStatus, setAdvanceStatus] = useState({});
  const [update, setUpdates] = useState({});
  const [statusE, setStatusE] = useState({});

  const [advanceExists, setAdvanceExists] = useState(false);

  const [print, setPrint] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const id = farmerUID[0];
  const [submit, setSubmit] = useState(false);

  const [openSaveMenu, setOpenSaveMenu] = useState(false);
  const [paymentDescription, setPaymentDescription] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [paidBy, setPaidBy] = useState('');

  // STATES AND VARIABLES DECLARATION ENDS HERE /////////////////////////////////////////
  const getAdvance = async (tempID) => {
    try {
      console.log('Farmer Id', Number(tempID));
      const tempData = await getAdvanceData({ farmerid: Number(tempID) });
      // console.log("Advance Data before transformation", tempData);
      const transformedAdvanceData = tempData.map((item) => ({
        date: item.date,
        vendorname: item.description,
        payable: item.amount * -1,
        paid: item.paid,
        paiddate: item.paidtimestamp,
        advance: true,
        item: item.time,
        quantity: '-',
        weight: '-',
        someid: item.farmerpaymentid,
        // Add other fields as required
      }));

      return transformedAdvanceData;
    } catch (error) {
      setAlert({
        state: true,
        type: 'danger',
        message: error,
      });
    }
  };
  useEffect(() => {
    setLoading(true);
    if (id) {
      getFarmerUsingUid({ uid: id })
        .then(async (data) => {
          // console.log("DataL", data.length);
          if (data.length === 1 && data[0].tempID) {
            // console.log("Data 1", data[0]);

            if (data[0].tempID) {
              // console.log("Farmer Id", Number(data[0].tempID));
              const tempData = await getAdvanceData({
                farmerid: Number(data[0].tempID),
              });
              // console.log("Advance Data", tempData);
              if (tempData.length) {
                setAdvanceExists(true);
                setUid(id);

                // console.log("Farmers Data", farmers);

                // find farmer from farmers who has same uid

                // setFarmerName(tempName)
                // setMobileNo(tempMobileNo)
                const transformedAdvanceData = tempData.map((item) => ({
                  date: item.date,
                  vendorname: item.description,
                  payable: item.amount * -1,
                  paid: item.paid,
                  paiddate: item.paiddate,
                  advance: true,
                  item: item.time,
                  quantity: '-',
                  weight: '-',
                  someid: item.farmerpaymentid,
                  // Add other fields as required
                }));
                setEntries(transformedAdvanceData);
              } else {
                setAlert({
                  state: true,
                  message: 'Did not find any advance data',
                  type: 'danger',
                });
              }
            } else {
              setAlert({
                state: true,
                message: 'Did not find any data',
                type: 'danger',
              });
            }
          } else {
            // console.log("Data", data);

            setUid(id);
            const tempMobileNo = data.find(
              (entry) => entry.mobilenumber
            )?.mobilenumber;
            setMobileNo(tempMobileNo);
            const tempId = data.find((entry) => entry.farmerid)?.farmerid;
            // console.log("Temp Id", tempId);
            setFarmerName(data[0].farmername);

            const temp = {};
            for (const entry of data) {
              temp[entry.entryid] = entry.paid;
            }
            setStatusE(temp);

            // Use a local variable to store the data
            let allData = data;

            if (tempId) {
              const advanceData = await getAdvance(tempId);
              allData = [...allData, ...advanceData];
            }
            if (allData.length > 0) {
              let paidSum = 0;
              let toPaySum = 0;
              for (const entry of allData) {
                // Calculate paidSum and toPaySum
                if (entry.paid) {
                  paidSum += Math.abs(Number(entry.payable));
                } else {
                  toPaySum += Number(entry.payable);
                }
              }
              setPaidAmt(paidSum);
              setToPayAmt(toPaySum);
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
              advtemp[entry.someid] = entry.paid;
            }
            setAdvanceStatus(advtemp);

            // Update the state once all the data is ready

            // add farmerpaymentid to entries as entryid

            // allData.map((item) => {
            //   console.log("Item", item);
            //   item.someid = item.entryid;
            //   return item;
            // });
            // console.log("All Data atlast", allData);
            setEntries(allData);
          }
        })
        .catch((error) => {
          console.error('Error fetching data: ', error);
          setAlert({
            state: true,
            type: 'danger',
            message: error,
          });
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    setFocusedIndex(-1);
    const timerId = setTimeout(() => {
      if (searchTerm !== '' && isFocused) {
        const searchData = farmers.filter((farmer) =>
          farmer.farmername
            .toLowerCase()
            .includes(searchTerm.toLowerCase().trim())
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
        sear;

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
    setStatusE({});
    setFarmerName('');
    setMobileNo('');
    setUid('');
    // console.log("This", uid);

    try {
      if (searchTerm !== '' && uid === '') {
        // console.log("Search Term", searchTerm);
        setUid(
          farmers.find((farmer) => farmer.farmername === searchTerm.trim())?.uid
        );
        let id = farmers.find(
          (farmer) => farmer.farmername === searchTerm.trim()
        )?.farmerid;
        // console.log("Farmer Id", id);
        const data = await getFarmersALlData({ farmerid: id });
        // console.log("Data", data);
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
        setStatusE(temp);
        if (data.length > 0) {
          let paidSum = 0;
          let toPaySum = 0;
          for (const entry of data) {
            // Calculate paidSum and toPaySum
            if (entry.paid) {
              paidSum += Number(entry.payable);
            } else {
              toPaySum += Number(entry.payable);
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
          advtemp[entry.someid] = entry.paid;
        }
        setAdvanceStatus(advtemp);

        // Update the state once all the data is ready
        setEntries(allData);
      } else {
        //  redirect to findfarmer/uid
        window.location.href = `/findfarmer/${uid}`;
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
    setSubmit(true);
    // console.log("Payment Description", paymentDescription);
    // console.log("Payment Mode", paymentMode);
    setOpenSaveMenu(false);
    try {
      console.log('Update', update);
      console.log('Advance Updates', advanceUpdates);
      if (Object.keys(update).length != 0) {
        updatePaidStatus({
          update,
          today,
          paymentDescription,
          paymentMode,
          paidBy,
        })
          .then((data) => {
            // console.log("Data", data[0]?.paidtimestamp);
            setAlert({
              state: true,
              message: 'Paid Updated Successfully',
              type: 'success',
            });
            setUpdates({});
          })
          .catch((error) => {
            setAlert({
              state: true,
              type: 'danger',
              message: 'Error Updating Paid Status',
            });
          });
      }
      if (Object.keys(advanceUpdates).length != 0) {
        console.log('Advance Updates', advanceUpdates);
        await updateAdvancePaidStatus({
          update: advanceUpdates,
          today,
          paymentDescription,
          paymentMode,
          paidBy,
        });
        // console.log("Advance Updates have been sent to db", advanceUpdates);
        setAlert({
          state: true,
          message: 'Paid Updated Successfully',
          type: 'success',
        });
        setAdvanceUpdates({});
      }
      // else {
      //   setAlert({
      //     state: true,
      //     message: "Nothing To Update",
      //     type: "warn",
      //   });
      // }
      // update the adbvance and update states in the entries array
      const tempEntries = entries.map((entry) => {
        if (entry.advance) {
          if (advanceUpdates[entry.someid]) {
            entry.paid = advanceUpdates[entry.someid];
            entry.paiddate = new Date(today);
          }
        }
        if (update[entry.entryid]) {
          entry.paid = update[entry.entryid];
          entry.paiddate = new Date(today);
        }
        return entry;
      });
      setEntries(tempEntries);
    } catch (error) {
      setAlert({
        state: true,
        type: 'danger',
        message: error,
      });
      window.alert('Error Updating Paid Refresh the page and try again');
    } finally {
      setLoading(false);
      setSubmit(false);
      setPaymentDescription('');
      setPaymentMode('');
      setPaidBy('');
      setPaidAmt(paidAmt + sumOfChecked);
      setToPayAmt(toPayAmt - sumOfChecked);
      setSumOfChecked(0);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setOpenSaveMenu(true);
  };

  const printPDF = () => {
    setPrint(true);
    const printWindow = window.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${farmername}</title>
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

            <h1 class="text-lg font-bold text-center mt-2">
              ${farmername}
              </h1>
              <h1 class="text-md font-semibold text-center">
              ${mobileNo}
              </h1>
              <table class="min-w-full divide-y-2 divide-gray-200bg-white text-sm">
              <thead class="">
                <tr>
                  <th class="whitespace-nowrap px-1 py-2 font-bold text-gray-900">
                    Sr. No.
                  </th>
                  <th class="whitespace-nowrap px-1 py-2 font-bold text-gray-900">
                    Date
                  </th>
                  <th class="whitespace-nowrap px-1 py-2 font-bold text-gray-900">
                    Item  
                  </th>
                  <th class="whitespace-nowrap px-1 py-2 font-bold text-gray-900">
                    Vendor
                  </th>
                  <th class="whitespace-nowrap px-1 py-2 font-bold text-gray-900">
                    Quantity
                  </th>
                  <th class="whitespace-nowrap px-1 py-2 font-bold text-gray-900">
                    Weight
                  </th>
                  <th class="whitespace-nowrap px-1 py-2 font-bold text-gray-900">
                    Payable
                  </th>
                  <th class="whitespace-nowrap px-1 py-2 font-bold text-gray-900">
                    Paid Date
                  </th>
                  </tr>
                </thead>
                <tbody>
                  ${entries
                    .map(
                      (item, index) => `
                  <tr>
                    <td class="whitespace-nowrap text-center py-2 text-gray-700 border">
                      ${index + 1}
                    </td>
                    <td class="whitespace-nowrap  text-center py-2 text-gray-700 border">
                      ${item.date.toLocaleDateString('en-IN')}
                    </td>
                    <td class="whitespace-nowrap  text-center py-2 text-gray-700 border">
                      ${item.item}
                    </td>
                    <td class="whitespace-nowrap  text-center py-2 text-gray-700 border">
                      ${item.vendorname}
                    </td>
                    <td class="whitespace-nowrap  text-center py-2 text-gray-700 border">
                      ${item.quantity}
                    </td>
                    <td class="whitespace-nowrap  text-center py-2 text-gray-700 border">
                      ${item.weight}
                    </td>
                    <td class="whitespace-nowrap  text-center py-2 text-gray-700 border">
                      ${item.payable ? `₹${item.payable.toLocaleString('en-IN')}/-` : '-'}
                    </td>
                    <td class="whitespace-nowrap  text-center py-2 text-gray-700 border">
                      ${item.paiddate ? item.paiddate.toLocaleDateString('en-IN') : '-'}
                    </td>
                  </tr>
                  `
                    )
                    .join('')}
                </tbody>
                
              </table>
              <div class="flex justify-center mt-4 space-x-3">
                <div class="font-bold text-center text-gray-700">
                  Paid amt: ₹${paidAmt.toLocaleString('en-IN')}/-
                  </div>
                  <div class="font-bold text-center text-gray-700">
                  Amt to pay : ₹${toPayAmt.toLocaleString('en-IN')}/-
                  </div>
                  </div>
            </div>
          </body>
        </html>
      `);
    printWindow.document.close();

    printWindow.print();
    setPrint(false);
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
        {!allowed && (
          <Alert
            message={'You cannot mark the payment'}
            type={'danger'}
            setState={setAlert}
            timer={1000}
          />
        )}
        {loading && <Loader />}
        <div className="flex justify-evenly">
          <form
            onSubmit={handleSearch}
            className={`flex w-full ${loading ? 'opacity-20' : ''}`}
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
                placeholder="Uid"
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

          <button
            onClick={printPDF}
            className={`inline-flex items-center rounded-lg bg-black px-4 py-2 font-medium text-white hover:bg-gray-800 ${
              print ? 'opacity-50' : ''
            } ${loading ? 'opacity-20' : ''}`}
            disabled={print || loading || allowed}
          >
            <svg
              class="h-6 w-6 text-gray-800 dark:text-white"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0  0  24  24"
            >
              <path
                fillRule="evenodd"
                d="M8  3a2  2  0  0  0-2  2v3h12V5a2  2  0  0  0-2-2H8Zm-3  7a2  2  0  0  0-2  2v5c0  1.1.9  2  2  2h1v-4c0-.6.4-1  1-1h10c.6  0  1 .4  1  1v4h1a2  2  0  0  0  2-2v-5a2  2  0  0  0-2-2H5Zm4  11a1  1  0  0  1-1-1v-4h8v4c0 .6-.4  1-1  1H9Z"
                clipRule="evenodd"
              />
            </svg>
            <span>Print</span>
          </button>
        </div>

        <ul className="ml-2 mt-2 w-1/2 rounded-md bg-gray-400 text-white">
          {searchResult}
        </ul>
        {openSaveMenu && (
          <SaveMenu
            setPaymentDescription={setPaymentDescription}
            setPaymentMode={setPaymentMode}
            isOpen={openSaveMenu}
            setIsOpen={setOpenSaveMenu}
            handleSavee={handleSubmit}
            setPaidBy={setPaidBy}
          />
        )}
        {entries.length !== 0 && (
          <form
            className={`space-y-4 ${loading || openSaveMenu ? 'opacity-20' : ''}`}
            onSubmit={handleSave}
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
                    Item
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

                  <th
                    className={`whitespace-nowrap px-1 py-2 font-bold text-gray-900 md:px-10 lg:px-10 ${advanceExists ? 'block' : 'hidden'}`}
                  >
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
                            className={`py-text-gray-700 whitespace-nowrap text-center ${advanceExists ? 'block' : 'hidden'}`}
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
                      <td className="whitespace-nowrap py-2 text-center text-gray-700">
                        <input
                          name="paid"
                          className={`rounded-lg border-gray-200 p-3 text-sm accent-pink-500 ${
                            entry.payable == 0 ||
                            entry.payable === '' ||
                            entry.payable == null ||
                            entry.paiddate !== null
                              ? 'cursor-not-allowed bg-gray-200 text-blue-200'
                              : 'cursor-pointer bg-white'
                          }`}
                          type="checkbox"
                          checked={
                            entry.advance
                              ? advanceStatus[entry.someid] ||
                                entry.paiddate !== null
                              : statusE[entry.entryid] ||
                                entry.paiddate !== null
                          }
                          onChange={(e) => {
                            const value = e.target.checked;
                            console.log('Value', value);
                            console.log('Entry', entry);
                            if (!entry.advance) {
                              console.log('entry advance', entry.advance);
                              console.log('Only for Entry');
                              setUpdates((prev) => {
                                return { ...prev, [entry.entryid]: value };
                              });
                              setStatusE((prev) => {
                                return { ...prev, [entry.entryid]: value };
                              });
                              if (update[entry.entryid] === !entry.paid)
                                setUpdates((prev) => {
                                  delete prev[entry.entryid];
                                  const temp = prev;
                                  return prev;
                                });
                            } else {
                              console.log('entry advance', entry.advance);
                              console.log('Only for Advance');
                              setAdvanceStatus((prev) => {
                                return {
                                  ...prev,
                                  [entry.someid]: value,
                                };
                              });

                              setAdvanceUpdates((prev) => {
                                return {
                                  ...prev,
                                  [entry.someid]: value,
                                };
                              });
                              if (advanceUpdates[entry.someid] === !entry.paid)
                                setAdvanceUpdates((prev) => {
                                  delete prev[entry.someid];
                                  const temp = prev;
                                  return prev;
                                });
                            }

                            if (value) {
                              setSumOfChecked(
                                (prev) => prev + Number(entry.payable)
                              );
                            } else {
                              setSumOfChecked(
                                (prev) => prev - Number(entry.payable)
                              );
                            }
                          }}
                          disabled={
                            false ||
                            entry.payable == 0 ||
                            entry.payable === '' ||
                            entry.payable == null ||
                            loading ||
                            entry.paiddate !== null ||
                            !allowed
                          }
                        />
                      </td>
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
                    Amount to Pay
                  </td>
                  <td className="whitespace-nowrap py-2 text-center font-bold text-gray-700">
                    ₹{toPayAmt.toLocaleString('en-IN')}/-
                  </td>
                </tr>
              </tfoot>
            </table>
            <div className="w-full border-b-2 border-gray-500"></div>
            <div className="text-center text-xl font-semibold text-green-800">
              Selected amt : ₹{sumOfChecked.toLocaleString('en-IN')}/-
            </div>
            <div className="mt-8 flex items-center justify-center">
              <button
                type="submit"
                name="save"
                className={`mx-10 w-full rounded-lg bg-black px-10 py-3 font-medium text-white sm:w-auto ${
                  submit ? 'cursor-not-allowed bg-gray-400' : ''
                }`}
                disabled={loading || submit || !allowed}
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
