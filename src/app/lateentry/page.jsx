'use client';
import { useState, useEffect, useContext } from 'react';
import {
  addLateEntry,
  getLastFewEntries,
  getFarmers,
} from '@/serverComponents/dbFunctions';
import VendorSelect from '@/components/VendorSelect';
import Alert from '@/components/Alert';
import DateSection from '@/components/DateSection';
import { VendorContext } from '../Context/vendorcontext';
import Loader from '@/components/Loader';

export default function Page() {
  const { printsize } = useContext(VendorContext);
  const [recentEntries, setRecentEntries] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(today);
  const [vmchecked, setVmChecked] = useState(false);
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
    const storageFarmers = localStorage.getItem('farmers');
    console.log('Storage', storageFarmers, Boolean(storageFarmers));

    if (!Boolean(storageFarmers) || storageFarmers === undefined) {
      return () => getFarmerDetails();
    } else {
      try {
        console.log('Farmers data exist');
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
    transportrate: '',
    farmerid: -1,
  });
  const [vmData, setVmData] = useState({
    nettPayable: '',
    rate: '',
    commision: '',
  });

  const [focusedIndex, setFocusedIndex] = useState(-1);

  const [isDisabledInput, setIsDisabledInput] = useState({
    farmerName: false,
    mobileNumber: false,
    uid: false,
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

  const handleVMData = (e) => {
    const { name, value } = e.target;
    setVmData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // DATA TO DB //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    // if data.uid is not 5 digit and is not empty so basically if it is emty that is accepted
    // show window alert for date if the date is correct if clicked on yes then continue else return

    const res = window.confirm(
      `Are you sure you want to enter data for ${data.date} ?`
    );
    if (!res) {
      setLoading(false);
      return;
    }

    try {
      console.log('Data To Server', data);
      await addLateEntry(data);

      console.log(data);
      setAlert({
        state: true,
        type: 'success',
        message: 'Entry Added Successfully',
      });

      // if device is not a mobile device print the data

      console.log('out of printing..');
      if (data.farmerid === -1) {
        console.log('Farmer not found in context');
        await getFarmerDetails();
      }
      setData({
        farmerName: '',
        mobileNumber: '',
        vendorName: '',
        item: '',
        quantity: '',
        weight: '',
        uid: '',
        transportrate: '',
        farmerid: -1,
      });
      setIsDisabledInput({
        farmerName: false,
        mobileNumber: false,
        uid: false,
      });
      console.log('Entry printing and cleaning done');
    } catch (error) {
      console.log(error);
      setAlert({
        state: true,
        type: 'danger',
        message: error,
      });
    } finally {
      setLoading(false);
    }
  };

  ///SEARCH FARMER DETAILS USING UID IN FARMERS CONTEXT //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  const handleSearchByUid = async () => {
    try {
      console.log('UID', data.uid);
      if (data.uid.length !== 5) return;
      if (data.uid === '00000') return;
      // const entry = await getDetailsUsingUid({ uid: data.uid });
      // search farmers array context for uid, farmers array is collection of object of type {farmername, mobilenumber, uid, farmerid, address}
      const entry = farmers.filter((farmer) => farmer.uid === data.uid);

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
        className={`cursor-pointe ${
          isSel ? 'bg-blue-400 text-white' : ''
        }hover:bg-blue-400 rounded-md p-1 hover:text-white`}
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

  return (
    <div className="p-2 lg:p-14">
      <div className="relative rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
        <h1 className="text-2xl font-bold">Late Entries with all data</h1>
        {alert.state && (
          <Alert
            message={alert.message}
            type={alert.type}
            setState={setAlert}
            timer={1500}
          />
        )}
        {loading && <Loader />}
        <DateSection date={date} setDate={setDate} />
        <div className="flex">
          <div className="w-full md:w-1/2 lg:w-1/2">
            <form
              onSubmit={handleSubmit}
              className={`mt-4 w-full space-y-4 ${loading ? 'opacity-20' : ''}`}
            >
              <div className="">
                <div className="mt-1 md:mt-4">
                  <label className="sr-only" htmlFor="farmerName">
                    farmerName
                  </label>
                  <input
                    autoComplete="off"
                    className="e-disable w-full rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="शेतकऱ्याचे नाव "
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
                </div>
              </div>
              {isFocused && (
                <ul className="w-full rounded-md bg-gray-400 text-white">
                  {searchResult}
                </ul>
              )}

              <div className="">
                <label className="sr-only" htmlFor="mobileNumber">
                  mobileNumber
                </label>
                <input
                  className="w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="mobileNumber"
                  type="number"
                  id="mobileNumber"
                  name="mobileNumber"
                  onChange={handleChange}
                  onWheel={(e) => e.target.blur()}
                  value={data.mobileNumber}
                  disabled={isDisabledInput.mobileNumber || loading}
                />
              </div>
              <div className="">
                <div>
                  <label className="sr-only" htmlFor="vendorName">
                    vendorName
                  </label>
                  <VendorSelect
                    handleChange={handleChange}
                    value={data.vendorName}
                    setLoadingVendors={setLoadingVendors}
                    loading={loadingVendors}
                  />
                </div>
              </div>
              <div className="">
                <div>
                  <label className="sr-only" htmlFor="item">
                    item
                  </label>
                  <input
                    autoSave="on"
                    className="w-full rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="item "
                    type="text"
                    id="item"
                    name="item"
                    onChange={handleChange}
                    value={data.item}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <div className="">
                <div>
                  <label className="sr-only" htmlFor="quantity">
                    quantity
                  </label>
                  <input
                    className="w-full rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="quantity "
                    type="number"
                    id="quantity"
                    name="quantity"
                    onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    value={data.quantity}
                    disabled={loading}
                    required
                  />
                </div>
              </div>
              <div className=" ">
                <div>
                  <label className="sr-only" htmlFor="weight">
                    weight
                  </label>
                  <input
                    className="w-full rounded-lg border-gray-200 p-3 text-sm"
                    placeholder="weight "
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
              </div>
              <div>
                <label className="sr-only" htmlFor="transportrate">
                  Transport Charges
                </label>
                <input
                  autoComplete="off"
                  className="e-disable w-full rounded-lg border-gray-200 p-3 text-sm"
                  placeholder="transport rate"
                  type="number"
                  id="transportrate"
                  name="transportrate"
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              {/* show a small checkbox for adding the nett payable, rate and commision */}
              {/* <div className="flex items-center justify-evenly">
								<label htmlFor="vmdata" className="text-sm">
									Enter Mumbai memo data
								</label>
								<input
									type="checkbox"
									id="vmdata"
									name="vmdata"
									checked={vmchecked}
									onChange={() => setVmChecked(!vmchecked)}
									disabled={loading}
								/>
							</div> */}
              {/* {vmchecked && (
								// show the input fields for the vmdata nett payable, rate and commision
								<div className="flex items-center justify-between space-x-2">
									<div>
										<label htmlFor="nettPayable" className="text-sm">
											Nett Payable
										</label>
										<input
											type="number"
											id="nettPayable"
											name="nettPayable"
											className="rounded-lg border-gray-200 p-3 text-sm"
											onChange={handleVMData}
											disabled={loading}
										/>
									</div>
									<div>
										<label htmlFor="rate" className="text-sm">
											Rate
										</label>
										<input
											type="number"
											id="rate"
											name="rate"
											className="rounded-lg border-gray-200 p-3 text-sm"
											onChange={handleVMData}
											disabled={loading}
										/>
									</div>
									<div>
										<label htmlFor="commision" className="text-sm">
											Commision
										</label>
										<input
											type="number"
											id="commision"
											name="commision"
											className="rounded-lg border-gray-200 p-3 text-sm"
											onChange={handleVMData}
											disabled={loading}
										/>
									</div>
								</div>
							)
								
							} */}

              <div className="mt-4">
                <button
                  type="submit"
                  className="inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto"
                  disabled={loading}
                >
                  Add Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
