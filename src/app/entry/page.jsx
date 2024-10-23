'use client';
import { useState, useEffect, useContext } from 'react';
import {
  addEntry,
  getLastFewEntries,
  getFarmers,
  getItems,
} from '@/serverComponents/dbFunctions';
import VendorSelect from '@/components/VendorSelect';
import Alert from '@/components/Alert';
import DateSection from '@/components/DateSection';
import { VendorContext } from '../Context/vendorcontext';
import Fuse from 'fuse.js';
import JsBarcode from 'jsbarcode';
import { set } from 'react-hook-form';
import Loader from '@/components/Loader';
// import { Alert } from '@/components/ui'
import {
  Loader2,
  Search,
  Calendar,
  User,
  Phone,
  Package,
  Scale,
  Hash,
} from 'lucide-react';

export default function Page() {
  const [lastEntrySuccess, setLastEntrySuccess] = useState(0);
  const { printsize } = useContext(VendorContext);
  const [recentEntries, setRecentEntries] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [items, setItems] = useState([]);
  const [searchedMaal, setSearchedMaal] = useState([]);
  const [itemFocus, setItemFocus] = useState(false);

  const fuse = new Fuse(items, {
    keys: ['itemname'],
    includeScore: true,
    includeMatches: true,
    threshold: 0.4,
  });

  //
  const generateBarcodeImageURL = (uid) => {
    const canvas = document.createElement('canvas');
    JsBarcode(canvas, uid, {
      format: 'CODE128',
      lineColor: '#000',
      width: 2,
      height: 40,
      displayValue: false,
      margin: 0,
    });
    return canvas.toDataURL();
  };
  // fetch farmer data from db once and store it in context
  const getFarmerDetails = async () => {
    try {
      console.log('Fetching Farmers From DB');
      const tempfarmers = await getFarmers();
      // console.log("Farmers", tempfarmers);
      localStorage.setItem('farmers', JSON.stringify(tempfarmers));
      setFarmers(tempfarmers);

      return tempfarmers;
    } catch (error) {
      console.log(error);
      setAlert({
        state: true,
        type: 'danger',
        message: error,
      });
    }
  };

  useEffect(() => {
    // navigator.userAgent.includes("Mobile") ? window.alert("Mobile") : window.alert("Not Mobile");
    const storageFarmers = localStorage.getItem('farmers');
    // console.log("Storage", storageFarmers, Boolean(storageFarmers));

    if (!Boolean(storageFarmers) || storageFarmers === undefined) {
      return () => getFarmerDetails();
    } else {
      try {
        // console.log("Farmers data exist");
        setFarmers(JSON.parse(storageFarmers));
        return () => console.log('Farmers data exist');
      } catch (error) {
        console.log(error);
        setAlert({
          state: true,
          type: 'danger',
          message: error,
        });
        // clear local storage for any farmers or undefined data
        localStorage.removeItem('farmers');
        localStorage.clear();
        console.log('Local Storage Cleared');
        setFarmers([]);
      }
    }
  }, []);

  useEffect(() => {
    async function fetchItems() {
      // console.log("Fetching Items");
      try {
        const items = await getItems();
        // console.log("Items", items);
        setItems(items);
      } catch (error) {
        console.log(error);
        setAlert({
          state: true,
          type: 'danger',
          message: error,
        });
      }
    }

    const asylastFewEntries = async () => {
      try {
        console.log('Date', date);
        const lastFewEntries = await getLastFewEntries({ date: date });
        setRecentEntries(lastFewEntries);
      } catch (error) {
        console.log(error);
        setAlert({
          state: true,
          type: 'danger',
          message: error,
        });
      }
    };
    asylastFewEntries();
    fetchItems();
  }, [date]);

  // STATES ////////////////////////////////////////////////////////////////////////////////////////////////

  const [data, setData] = useState({
    farmerName: '',
    mobileNumber: '',
    vendorName: '',
    item: '',
    quantity: '',
    weight: '',
    date: '',
    uid: '',
    farmerid: -1,
    farmeraddress: '',
  });
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const [focusedItemIndex, setFocusedItemIndex] = useState(-1);

  const [isDisabledInput, setIsDisabledInput] = useState({
    farmerName: false,
    mobileNumber: false,
    uid: false,
    farmeraddress: false,
  });
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [alert, setAlert] = useState({
    state: false,
    type: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [searchedItems, setSearchedItems] = useState([]);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'item') {
      handleSearchItem(e);
    }
    setData((prev) => ({
      ...prev,
      [name]: value,
      date: date,
    }));
    setFocusedIndex(-1);
  };
  const handleKeyDown = (e) => {
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
        setData((prev) => ({
          ...prev,
          farmerName: searchedItems[focusedIndex].farmername,
        }));
        setSearchedItems([]);
      }
    }
  };
  const handleKeyDownItem = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedItemIndex((prevIndex) =>
        Math.min(prevIndex + 1, searchedMaal.length - 1)
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedItemIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchedMaal.length > 0) {
        setData((prev) => ({
          ...prev,
          item: searchedMaal[focusedItemIndex],
        }));
        setSearchedMaal([]);
      }
    }
  };

  const printFormData = (printSize) => {
    // open print window on same page
    console.log('Printing');
    if (typeof window !== 'undefined') {
      // console.log(typeof window);
      let printWindow = window.open();

      printWindow.document.write("<html lang='en'>");
      printWindow.document.write('<head>');
      printWindow.document.write('<title>Print Window</title>');
      printWindow.document.write('<style>');
      if (printSize === 'large') {
        console.log('printing for 48x50mm');
        printWindow.document.write(
          '@media print {@page {size: 48mm 50mm;margin: 0;}body {margin: 0;}}'
        );
        printWindow.document.write(
          '.large {font-size: 1.4rem;margin-top: 1px;margin-bottom: 1px;text-align: center;font-weight: bold;}' +
            '.small {font-size: 0.9rem;margin-top: 0px;margin-bottom: 1px;text-align: center;}' +
            '.med {font-size: 1.2rem;margin-top: 1px;margin-bottom: 0px;text-align: center;font-weight: 700;}' +
            '.border {position: relative;width: 48mm;height: 50mm;}' +
            '.left {position: absolute;bottom: -34px;left: 0;transform: rotate(-90deg);transform-origin: left top;width: 100%;}' +
            '.container {position: relative;top: 10px;left: 14px;width: 140%;height: 140%;}' +
            '.main-title {font-size: 1.2rem;margin-top: 1px;margin-bottom: 1.2px;text-align: center;text-overflow: ellipsis;font-weight: bold;}</style>'
        );
      } else if (printSize === 'small') {
        console.log('printing for 48x25mm');
        printWindow.document.write(
          '@media print {@page {size: 48mm 25mm;margin: 0;}body {margin: 0;}}'
        );
        printWindow.document.write(
          '.large {font-size: 1rem;margin-top: 0px;margin-bottom: 0px;text-align: center;font-weight: bold;}' +
            '.small {font-size: 0.6rem;margin-top: 0px;margin-bottom: 0px;text-align: center;}' +
            '.med {font-size: 0.8rem;margin-top: 0px;margin-bottom: 0px;text-align: center;font-weight: 700;}' +
            '.border {position: relative;width: 48mm;height: 26mm;}' +
            '.container {position: relative;top: 0;left: 4px;width: 120%;height: 120%;}' +
            '.main-title {font-size: 1rem;margin-top: 1px;margin-bottom: 0px;text-align: center;text-overflow: ellipsis;}</style>'
        );
      }

      printWindow.document.write('</head> <body>');
      for (let i = 0; i < Number(data.quantity) + 1; i++) {
        printWindow.document.write("<div class='border'>");
        printWindow.document.write("<div class='container'>");
        printWindow.document.write(
          "<p class='large'>" + data.farmerName + '</p>'
        );
        printWindow.document.write(
          "<p class='large'>" +
            data.item +
            ' | ' +
            data.quantity +
            ' X ' +
            data.weight +
            '</p>'
        );
        printWindow.document.write(
          "<p class='med'>" + data.vendorName + '</p>'
        );
        let currentTime = new Date().toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        });
        // modify data.date to show 2 digit year,month and date
        let currentDate = new Date(data.date).toLocaleDateString('en-IN', {
          year: '2-digit',
          month: '2-digit',
          day: '2-digit',
        });

        if (printSize === 'large') {
          printWindow.document.write("<p class='small'>" + data.uid + '</p>');
          printWindow.document.write('</div>');
          printWindow.document.write("<div class='left'>");
          printWindow.document.write(
            "<p class='small'>" + currentDate + ' | ' + currentTime + '</p>'
          );
          printWindow.document.write('</div>');
        } else {
          printWindow.document.write(
            "<p class='small'>" +
              data.uid +
              ' | ' +
              currentDate +
              ' | ' +
              currentTime +
              '</p>'
          );
          printWindow.document.write(
            "<img src='" +
              generateBarcodeImageURL(data.uid) +
              "' alt='Barcode' class='w-full' />"
          );

          printWindow.document.write('</div>');
        }
      }
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  // DATA TO DB //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  // printformdata using tailwind css
  // const printFormData = (printSize) => {
  //     const printWindow = window.open();

  //     printWindow.document.write(`
  //         <!DOCTYPE html>
  //             <html lang="en">
  //             <head>
  //                 <title>Hola</title>
  //                 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/tailwindcss/2.2.16/tailwind.min.css">
  //             </head>
  //             <body>
  //                 ${Array.from({ length: parseInt(data.quantity, 10) + 1 }, (_, i) => (
  //                     `<div class="w-52 p-2 h-50 -m-1">
  //                         <div class="text-center">
  //                             <h1 class="text-xl font-bold whitespace-nowrap">${data.farmerName}</h1>
  //                             <p class="text-lg whitespace-nowrap -mb-1">${data.item} | ${data.quantity} X ${data.weight}</p>
  //                             <p class="text-sm whitespace-nowrap">${data.vendorName}</p>
  //                         <div class="flex flex-col items-center -mb-0">
  //                             <img src="${generateBarcodeImageURL(lastEntrySuccess)}" alt="Barcode" class="w-full" />
  //                         </div>
  //                     </div>`
  //                 )).join('')}
  //             </body>
  //         </html>
  //     `);
  // printWindow.document.close();
  // printWindow.onload = () => {
  //     printWindow.print();
  // 	printWindow.close();
  // };
  // printWindow.close();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // Initial UID checks
    if (data.uid.length !== 5 && data.uid !== '') {
      setAlert({
        state: true,
        type: 'danger',
        message: 'UID should be 5 digit',
      });
      setLoading(false);
      return;
    }
    if (data.uid === '00000') {
      data.uid = '';
    }

    addEntry(data)
      .then((transactionId) => {
        // Database entry successful
        setAlert({
          state: true,
          type: 'success',
          message: 'Entry Added Successfully',
        });
        // if transaction id is not returned from db
        if (!transactionId) {
          setLastEntrySuccess(-1);
          return;
        }
        console.log('Transaction ID', transactionId[0].transactionid);
        setLastEntrySuccess(transactionId[0].transactionid);

        // Update recent entries with transaction ID
        const dataRecentFormat = {
          uid: data.uid,
          farmername: data.farmerName,
          item: data.item,
          vendorname: data.vendorName,
          quantity: data.quantity,
        };
        setRecentEntries((prev) => {
          const change = [dataRecentFormat, ...prev];
          change.pop();
          return change;
        });

        // Handle printing if not on mobile
        if (!navigator.userAgent.includes('Mobile')) {
          //   console.log(printsize);
          try {
            console.log('Printing.....');
            printFormData(printsize);
          } catch (e) {
            console.log('Printing Failed');
            setAlert({
              state: true,
              type: 'danger',
              message: 'Printing Failed',
            });
          }
        }

        // Update farmer details if necessary
        if (data.farmerid === -1) {
          //   console.log("Farmer not found in context");
          return getFarmerDetails();
        }
      })
      .then(() => {
        // Reset form data
        setData({
          farmerName: '',
          mobileNumber: '',
          vendorName: '',
          item: '',
          quantity: '',
          weight: '',
          uid: '',
          farmerid: -1,
        });
        setIsDisabledInput({
          farmerName: false,
          mobileNumber: false,
          farmeraddress: false,
          uid: false,
        });
        // console.log("Entry printing and cleaning done");
      })
      .catch((error) => {
        console.error('Error in handleSubmit:', error);
        setLastEntrySuccess(-1);
        setAlert({
          state: true,
          type: 'danger',
          message: 'An error occurred: ' + (error.message || 'Unknown error'),
        });
      })
      .finally(() => {
        setLoading(false);
        setIsDisabledInput({
          farmerName: false,
          mobileNumber: false,
          uid: false,
          farmeraddress: false,
        });
      });
  };
  ///SEARCH FARMER DETAILS USING UID IN FARMERS CONTEXT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleSearchByUid = async () => {
    try {
      // console.log("UID", data.uid);
      if (data.uid.length !== 5) return;
      if (data.uid === '00000') return;
      // const entry = await getDetailsUsingUid({ uid: data.uid });
      // search farmers array context for uid, farmers array is collection of object of type {farmername, mobilenumber, uid, farmerid, address}
      const entry = farmers.filter((farmer) => farmer.uid === data.uid);

      const farmerName = entry[0]?.farmername;
      const mobileNumber = entry[0]?.mobilenumber;
      const farmerid = entry[0]?.farmerid;
      const farmeraddress = entry[0]?.farmeraddress;

      if (farmerName) {
        setData((prev) => ({
          ...prev,
          farmerName: farmerName,
          mobileNumber: mobileNumber,
          farmerid: farmerid,
          farmeraddress: farmeraddress,
        }));

        setIsDisabledInput((prev) => ({
          ...prev,
          farmerName: true,
          mobileNumber: true,
          farmeraddress: true,
        }));
      } else {
        const tempfarmers = await getFarmerDetails();
        const entry = tempfarmers.filter((farmer) => farmer.uid === data.uid);
        const farmerName = entry[0]?.farmername;
        const mobileNumber = entry[0]?.mobilenumber;
        const farmerid = entry[0]?.farmerid;

        if (farmerName) {
          setData((prev) => ({
            ...prev,
            farmerName: farmerName,
            mobileNumber: mobileNumber,
            farmerid: farmerid,
          }));

          setIsDisabledInput((prev) => ({
            ...prev,
            farmerName: true,
            mobileNumber: true,
          }));
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // SEARCH FARMER DETAILS USING NAME IN FARMERS CONTEXT ///////////////////////////////////////////////////////////////////////
  const handleSearchNumber = async (e) => {
    setTimeout(() => setIsFocused(false), 1000);
    if (e.target.value)
      try {
        // serach farmers array context for farmername, farmers array is collection of object of type {farmername, mobilenumber, uid, farmerid, address}
        const farmerData = farmers.filter(
          (farmer) => farmer.farmername === e.target.value.trim()
        );
        const mobileNo = farmerData[0]?.mobilenumber;
        const uid = farmerData[0]?.uid;
        const farmerid = farmerData[0]?.farmerid;

        if (mobileNo || uid) {
          setData((prev) => {
            return {
              ...prev,
              mobileNumber: mobileNo,
              uid: uid,
              farmerid: farmerid,
            };
          });
          setIsDisabledInput((prev) => {
            return { ...prev, mobileNumber: true };
          });
          if (uid != '00000') {
            setIsDisabledInput((prev) => {
              return { ...prev, uid: true };
            });
          }
          if (uid === '00000' || uid === '') {
            setData((prev) => {
              return { ...prev, uid: '' };
            });
            setIsDisabledInput((prev) => {
              return { ...prev, uid: false };
            });
          }
        } else {
          const tempfarmers = await getFarmerDetails();
          const entry = tempfarmers.filter(
            (farmer) => farmer.farmername === e.target.value
          );
          const mobileNo = entry[0]?.mobilenumber;
          const uid = entry[0]?.uid;
          const farmerid = entry[0]?.farmerid;

          if (mobileNo || uid) {
            setData((prev) => {
              return {
                ...prev,
                mobileNumber: mobileNo,
                uid: uid,
                farmerid: farmerid,
              };
            });
            setIsDisabledInput((prev) => {
              return { ...prev, mobileNumber: true };
            });
            if (uid != '00000') {
              setIsDisabledInput((prev) => {
                return { ...prev, uid: true };
              });
            }
            if (uid === '00000' || uid === '') {
              setData((prev) => {
                return { ...prev, uid: '' };
              });
              setIsDisabledInput((prev) => {
                return { ...prev, uid: false };
              });
            }
          }
          console.log('found nothing');
        }
      } catch (error) {
        console.log(error);
      }
  };

  // AUTOCOMPLETE LIKE SEARCH FOR FARMER NAME FROM FARMERS CONTEXT//////////////////////////////////////////////////////////////////////////////////////////
  useEffect(() => {
    const timerId = setTimeout(() => {
      if ((data.farmerName !== '') & !isDisabledInput.farmerName) {
        // serach farmers array context for farmername, farmers array is collection of object of type {farmername, mobilenumber, uid, farmerid, address}
        const searchData = farmers.filter((farmer) =>
          farmer.farmername.includes(data.farmerName.trim())
        );
        setSearchedItems(searchData);
      }
    }, 500);
    return () => {
      clearTimeout(timerId);
    };
  }, [data.farmerName]);

  // if data.farmername or data.uid doesnt exist in farmers context setUpdateFarmerContext to true //////////////////////////////////////////////////////////////////////////////////////////
  const checkFarmerExist = () => {
    if (data.farmerName === '') return;
    const farmerNameExist = farmers.filter(
      (farmer) => farmer.farmername === data.farmerName.trim()
    );
    const uidExist = farmers.filter((farmer) => farmer.uid === data.uid);
  };

  const searchResult = searchedItems.map(({ farmername }, index) => {
    const isSel = index === focusedIndex;

    return (
      <li
        key={index * 17}
        className={`cursor-pointer ${
          isSel ? 'bg-blue-400 text-white' : ''
        }hover:bg-blue-400 p-2 hover:text-white`}
        onClick={() => {
          setData((prev) => {
            return { ...prev, farmerName: farmername };
          });
          setSearchedItems([]);
        }}
      >
        {farmername}
      </li>
    );
  });
  // when items value changes show dropdown of items matching fuzzily for speliiing mistakes
  const searchItems = items.map(({ itemname }) => {
    return itemname;
  });
  const handleSearchItem = (e) => {
    const search = e.target.value;

    const searchResult = fuse
      .search(search)
      .map((result) => result.item.itemname);
    setSearchedMaal(searchResult);
  };

  const searchResultItems = searchedMaal.map((item, index) => {
    const isSel = index === focusedItemIndex;
    return (
      <li
        key={index * 17}
        className={`cursor-pointer ${
          isSel ? 'bg-blue-400 text-white' : ''
        }hover:bg-blue-400 max-h-40 rounded-md p-1 hover:text-white`}
        onClick={() => {
          setData((prev) => {
            return { ...prev, item: item };
          });
          setSearchedMaal([]);
        }}
      >
        {item}
      </li>
    );
  });

  return (
    <div className="min-h-screen bg-slate-800 p-4 md:p-8">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        {alert.state && (
          <Alert
            message={alert.message}
            type={alert.type}
            setState={setAlert}
            timer={1500}
          />
        )}
        <DateSection date={date} setDate={setDate} />
        <div className="mt-6 flex flex-col md:flex-row md:space-x-8">
          <form onSubmit={handleSubmit} className="w-full space-y-4 md:w-2/3">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="relative">
                <input
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="UID"
                  type="number"
                  id="uid"
                  name="uid"
                  onChange={handleChange}
                  value={data.uid}
                  disabled={loading || isDisabledInput.uid}
                  onBlur={handleSearchByUid}
                  autoFocus
                />
                <Search className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              <div className="relative">
                <input
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Farmer's Name"
                  type="text"
                  id="farmerName"
                  name="farmerName"
                  onChange={handleChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={handleSearchNumber}
                  value={data.farmerName}
                  disabled={isDisabledInput.farmerName || loading}
                  required
                  onKeyDown={handleKeyDown}
                />
                {isFocused && (
                  <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                    {searchResult}
                  </ul>
                )}
              </div>
            </div>
            <input
              className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mobile Number"
              type="number"
              id="mobileNumber"
              name="mobileNumber"
              onChange={handleChange}
              onWheel={(e) => e.target.blur()}
              value={data.mobileNumber}
              disabled={isDisabledInput.mobileNumber || loading}
            />
            <VendorSelect
              handleChange={handleChange}
              value={data.vendorName}
              setLoadingVendors={setLoadingVendors}
              loading={loadingVendors}
            />
            <div className="relative">
              <input
                autoSave="on"
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type of Produce"
                type="text"
                id="item"
                name="item"
                onChange={handleChange}
                onFocus={() => setItemFocus(true)}
                onKeyDown={handleKeyDownItem}
                value={data.item}
                disabled={loading}
                required
              />
              {itemFocus && (
                <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
                  {searchResultItems}
                </ul>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <input
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Quantity"
                type="number"
                id="quantity"
                name="quantity"
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                value={data.quantity}
                disabled={loading}
                required
              />
              <input
                className="w-full rounded-lg border border-gray-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Weight"
                type="number"
                id="weight"
                name="weight"
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                value={data.weight}
                disabled={loading}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-blue-600 px-5 py-3 font-medium text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                'Submit'
              )}
            </button>
          </form>
          <div className="mt-8 w-full md:mt-0 md:w-1/3">
            <h2 className="mb-4 text-2xl font-bold">Recent Entries</h2>
            {lastEntrySuccess !== -1 && lastEntrySuccess !== 0 && (
              <div className="mb-4 rounded-md bg-green-100 p-2 text-green-800">
                Success with ID: {lastEntrySuccess}
              </div>
            )}
            {lastEntrySuccess === -1 && (
              <div className="mb-4 rounded-md bg-red-100 p-2 text-red-800">
                Failed to save the last entry!
              </div>
            )}
            <div className="space-y-4">
              {recentEntries.map((entry, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-gray-50 p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between">
                    <p className="text-lg font-semibold">{entry.farmername}</p>
                  </div>
                  <div className="gridtext-sm space-y-1 text-gray-600">
                    <p>
                      <span className="font-medium">UID:</span> {entry.uid}
                    </p>
                    <p>
                      <span className="font-medium">Item:</span>{' '}
                      {entry.quantity} x {entry.item}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
