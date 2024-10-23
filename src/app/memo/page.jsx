'use client';
import {
  getEntriesByDateVendor,
  getRefundByDateVendor,
  updateEntryData,
  getTransDetailsFromPrevious,
} from '@/serverComponents/dbFunctions';
import VendorSelect from '@/components/VendorSelect';
import { useEffect, useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import DateSection from '@/components/DateSection';
import Alert from '@/components/Alert';
import { set } from 'react-hook-form';
import { VendorContext } from '../Context/vendorcontext';
import { useSession } from 'next-auth/react';
import Loader from '@/components/Loader';

export default function Memo() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const {
    selectedVMNDate,
    setSelectedVMNDate,
    refundData,
    setRefundData,
    entriesData,
    setEntriesData,
  } = useContext(VendorContext);
  const today = new Date().toISOString().split('T')[0];
  const [allowed, setAllowed] = useState(false);
  const [records, setRecords] = useState([]);
  const [vendor, setVendor] = useState(selectedVMNDate.vendorname);
  const [date, setDate] = useState(today);

  const [count, setCount] = useState(0);
  if (
    selectedVMNDate.date !== '' &&
    date !== selectedVMNDate.date &&
    count === 0
  ) {
    setDate(selectedVMNDate.date);
    setCount(1);
  }

  const [saved, setSaved] = useState(false);
  const [print, setPrint] = useState(false);
  const [total, setTotal] = useState({
    weight: 0,
    quantity: 0,
    transportrate: 0,
    refund: 0,
  });

  const [transportDetails, setTransportDetails] = useState({
    transporterName: '',
    vehicleNo: '',
  });
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [alert, setAlert] = useState({
    state: false,
    type: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (status === 'authenticated') {
      if (session?.user?.role === 'guest' || session?.user?.role === 'user') {
        setAllowed(false);
        // redirect to print
        router.push(`/print/${vendor}/${date}`);
      } else {
        setAllowed(true);
        console.log('You are authorized to edit this page :)');
      }
    }
  }, [status, session]);
  useEffect(() => {
    async function getData() {
      setRefundData([]);
      setEntriesData([]);
      setLoading(true);
      setPrint(false);
      setSaved(false);
      setTransportDetails({
        transporterName: '',
        vehicleNo: '',
      });
      setTotal({
        weight: 0,
        quantity: 0,
        transportrate: 0,
        refund: 0,
      });
      setRecords([]);

      try {
        const data = await getEntriesByDateVendor({ date, vendor });
        const refundData = await getRefundByDateVendor({ date, vendor });
        if (refundData.length !== 0) {
          setTransportDetails({
            transporterName: refundData[0].transportername,
            vehicleNo: refundData[0].vehicleno,
          });
          setTotal((prev) => ({
            ...prev,
            refund: Number(refundData[0].value),
          }));
          setRefundData(refundData);
          // console.log("Context Refund Data", refundData);
        } else {
          setTotal((prev) => ({
            ...prev,
            refund: 0,
          }));
        }

        let tempWeight = 0;
        let tempQuantity = 0;

        data.forEach((data) => {
          const { weight, quantity } = data;
          tempWeight += weight;
          tempQuantity += quantity;
        });

        setTotal((prev) => ({
          ...prev,
          quantity: tempQuantity,
          weight: tempWeight,
        }));
        // New addition
        setRecords(data);
        setEntriesData(data);
        if (refundData.length === 0) {
          // console.log("Refund Data doesnt exist");
          // fetch transporter name and vehicle no from last refund entry for the day
          try {
            const lastRefundData = await getTransDetailsFromPrevious({
              date,
            });
            // console.log("Refund Data c", lastRefundData);
            if (lastRefundData.length !== 0) {
              setTransportDetails({
                transporterName: lastRefundData[0].transportername,
                vehicleNo: lastRefundData[0].vehicleno,
              });
            }
            console.log('Refund Data doesnt exist');
          } catch (error) {
            console.log(error);
          } finally {
            setTotal((prev) => ({
              ...prev,
              refund: tempQuantity * 10,
            }));
          }
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
    }
    if (vendor !== '') {
      getData();
    }
  }, [date, vendor]);

  useEffect(() => {
    let tempTotal = 0;

    records.forEach((data) => {
      const { transportrate } = data;
      tempTotal += transportrate;
    });

    setTotal((prev) => ({ ...prev, transportrate: tempTotal }));
  }, [records]);

  const handleChange = (e) => {
    const { value } = e.target;
    setVendor(value);
    setSelectedVMNDate({ vendorname: value, date: date });
  };

  const handleTransportDetail = (e) => {
    const { name, value } = e.target;
    setTransportDetails((prev) => {
      return { ...prev, [name]: value };
    });
  };

  const refundHandle = (e) => {
    const { value, name } = e.target;
    setTotal((prev) => ({ ...prev, [name]: Number(value) }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
    const button = e.nativeEvent.submitter.name;
    setSaved(true);

    try {
      await updateEntryData({
        vendor,
        date,
        newData: records,
        refund: total.refund,
        transportDetails,
      });
      setRefundData([
        {
          date: date,
          vendorname: vendor,
          transportername: transportDetails.transporterName,
          vehicleno: transportDetails.vehicleNo,
          value: total.refund,
        },
      ]);
      // console.log("Context Refund Data", refundData);
      setAlert({
        state: true,
        type: 'success',
        message: 'Data saved successfull',
      });
      setPrint(true);
      router.push(`/print/${vendor}/${date}`);
      if (button === 'print') {
        setPrint(true);
        router.push(`/print/${vendor}/${date}`);
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

  const rows = records.map((data, index) => (
    <Row
      data={data}
      index={index}
      setRecords={setRecords}
      key={data.transactionid}
      loading={loading}
    />
  ));

  return (
    <div className="p-2 md:p-14 lg:p-14">
      <div className="relative rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
        {alert.state && (
          <Alert
            message={alert.message}
            type={alert.type}
            setState={setAlert}
            timer={3000}
            // relod={true}
          />
        )}
        {loading && <Loader />}

        <div className={`${loading ? 'opacity-20' : ''}`}>
          <DateSection date={date} setDate={setDate} />
        </div>
        <div className={`flex justify-between ${loading ? 'opacity-20' : ''}`}>
          <div className={`my-6 flex w-1/2 md:w-3/12 lg:w-3/12`}>
            <VendorSelect
              handleChange={handleChange}
              value={vendor}
              setLoadingVendors={setLoadingVendors}
              loading={loadingVendors}
            />
          </div>
          <div className="ml-2 flex w-1/2 flex-col md:flex-row">
            <div className="mt-2 flex items-center md:mr-4 md:mt-0">
              <label
                htmlFor="transporter"
                className="text-sm font-semibold text-gray-900 md:mx-5"
              >
                transporterName
              </label>
              <input
                className="w-1/2 appearance-none border-0 border-b border-gray-200 px-2 py-1 text-center text-sm focus:outline-none focus:ring-0 md:w-36"
                type="text"
                id="transporter"
                name="transporterName"
                value={transportDetails.transporterName}
                onChange={handleTransportDetail}
                disabled={loading}
                required
              />
            </div>
            <div className="flex items-center">
              <label
                htmlFor="vehicleno"
                className="text-sm font-semibold text-gray-900 md:mx-5"
              >
                vehicleno:
              </label>
              <input
                className="w-1/2 appearance-none border-0 border-b border-gray-200 px-2 py-1 text-center text-sm focus:outline-none focus:ring-0 md:w-36"
                type="text"
                id="vehicleno"
                name="vehicleNo"
                value={transportDetails.vehicleNo}
                onChange={handleTransportDetail}
                disabled={loading}
                required
              />
            </div>
          </div>
        </div>

        <form
          className={`flex flex-col justify-center ${
            loading ? 'opacity-20' : ''
          }`}
          onSubmit={handleFormSubmit}
        >
          <table className="mt-5 min-w-full divide-y-2 divide-gray-200 bg-white text-sm md:block">
            <thead className="">
              <tr>
                <th className="whitespace-nowrap px-1 py-2 font-semibold text-gray-900 md:px-16 lg:px-16">
                  Sr. No.
                </th>
                <th className="whitespace-nowrap px-1 py-2 font-semibold text-gray-900 md:px-16 lg:px-16">
                  Farmer Name
                </th>

                <th className="whitespace-nowrap px-1 py-2 font-semibold text-gray-900 md:px-16 lg:px-16">
                  Item
                </th>
                <th className="whitespace-nowrap px-1 py-2 font-semibold text-gray-900 md:px-16 lg:px-16">
                  Quantity
                </th>
                <th className="whitespace-nowrap px-1 py-2 font-semibold text-gray-900 md:px-16 lg:px-16">
                  Weight
                </th>
                <th className="whitespace-nowrap px-1 py-2 font-semibold text-gray-900 md:px-16 lg:px-16">
                  Transport Rate
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {rows}
              {rows.length !== 0 && (
                <tr>
                  <td className="whitespace-nowrap py-4 text-center font-semibold text-gray-900">
                    Total
                  </td>
                  <td
                    className="whitespace-nowrap py-4 text-center font-semibold text-gray-900"
                    colSpan="2"
                  ></td>
                  <td className="whitespace-nowrap py-4 text-center font-semibold text-gray-900">
                    {total.quantity}
                  </td>
                  <td className="whitespace-nowrap py-4 text-center font-semibold text-gray-900">
                    {total.weight}
                  </td>
                  <td className="whitespace-nowrap py-4 text-center font-semibold text-gray-900">
                    ₹ {total.transportrate}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {rows.length !== 0 && (
            <div className="flex items-center">
              <label
                htmlFor="refund"
                className="mx-5 text-sm font-medium text-gray-900"
              >
                Refund :
              </label>
              <input
                className="w-24 appearance-none border-0 border-b border-gray-200 px-2 py-1 text-center text-sm focus:outline-none focus:ring-0"
                type="number"
                id="refund"
                name="refund"
                onChange={refundHandle}
                onWheel={(e) => e.target.blur()}
                value={total.refund}
                disabled={loading || !allowed}
                required
              />
            </div>
          )}
          {records.length !== 0 && (
            <div className="mt-8 flex items-center justify-center">
              <button
                type="submit"
                name="save"
                className={`mx-10 inline-block w-full rounded-lg bg-black px-10 py-3 font-medium text-white sm:w-auto ${
                  saved || !allowed ? 'cursor-progress opacity-20' : ''
                }`}
                disabled={saved || !allowed}
              >
                Save
              </button>
              <button
                type="submit"
                name="print"
                className={`mx-10 inline-block w-full rounded-lg bg-black px-10 py-3 font-medium text-white sm:w-auto ${
                  print || !allowed ? 'cursor-progress opacity-20' : ''
                }`}
                disabled={print || !allowed}
              >
                Print
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const Row = ({
  data: { farmername, item, quantity, weight, transportrate },
  index,
  setRecords,
  loading,
}) => {
  const [newrate, setRate] = useState(
    Number(transportrate) || calculateTransportRate(weight, quantity)
  );
  const handleChange = (e) => {
    const { value } = e.target;
    setRate(value);
  };
  const handleFocusOut = (e) => {
    setRecords((prev) => {
      prev[index].transportrate = Number(e.target.value);
      return [...prev];
    });
  };
  useEffect(() => {
    // Perform calculations and updates here
    if (newrate != transportrate && newrate != '') {
      // setUpdates((prev) => {
      //   return { ...prev, [transactionid]: Number(newrate) };
      // });
      setRecords((prev) => {
        prev[index].transportrate = Number(newrate);
        return [...prev];
      });
    }
  }, [newrate]); // Dependency array
  function calculateTransportRate(weight, quantity) {
    const tmpWeight = Number(weight) / quantity;
    if (tmpWeight >= 15 && tmpWeight <= 36) {
      return quantity * 70;
    } else if (tmpWeight > 36 && tmpWeight <= 43) {
      return quantity * 90;
    } else if (tmpWeight > 43 && tmpWeight <= 47) {
      return quantity * 110;
    } else if (tmpWeight > 47 && tmpWeight <= 55) {
      return quantity * 120;
    } else {
      return 0;
    }
  }

  return (
    <tr>
      <td className="whitespace-nowrap px-16 py-2 font-medium text-gray-700">
        {index + 1}
      </td>
      <td className="whitespace-nowrap py-2 text-center text-gray-700">
        {farmername}
      </td>

      <td className="whitespace-nowrap py-2 text-center text-gray-700">
        {item}
      </td>
      <td className="whitespace-nowrap py-2 text-center text-gray-700">
        {quantity}
      </td>
      <td className="whitespace-nowrap py-2 text-center text-gray-700">
        {weight}
      </td>
      <td className="whitespace-nowrap py-2 text-center text-gray-700">
        <input
          className="w-14 appearance-none border-0 border-b border-gray-200 px-2 py-1 text-center text-sm focus:outline-none focus:ring-0"
          type="number"
          name="transportrate"
          onChange={handleChange}
          // onBlur={handleFocusOut}
          onWheel={(e) => e.target.blur()}
          value={newrate}
          disabled={loading}
          required
        />
      </td>
    </tr>
  );
};
