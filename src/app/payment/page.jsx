'use client';
import { useEffect, useState } from 'react';
import { addPayment } from '@/serverComponents/dbFunctions';
import DateSection from '@/components/DateSection';
import VendorSelect from '@/components/VendorSelect';
import Alert from '@/components/Alert';
import { useSession } from 'next-auth/react';

export default function Page() {
  const { data: session, status } = useSession();

  const [alert, setAlert] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [vendor, setVendor] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState({
    amount: '',
    paymentMode: '',
  });
  const [initialDataState, setInitialDataState] = useState(false);

  useEffect(() => {
    async function getData() {
      setLoading(true);
      try {
        console.log('Fetching data');
      } catch (error) {
        setAlert({
          state: true,
          type: 'danger',
          message: error,
        });
      } finally {
        setLoadingVendors(false);
        setLoading(false);
      }
    }

    if (!loadingVendors && vendor) {
      getData();
    }
  }, [date, vendor, loadingVendors]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setAlert(true);
    addPayment({ vendorName: vendor, date, ...data });
    console.log(data);
  };
  const handleChange = (e) => {
    setData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
      date: date,
    }));
  };
  const handleVendorChange = (e) => {
    const { value } = e.target;
    setVendor(value);
  };
  const handleDateChange = (e) => {
    const { value } = e.target;
    setDate(value);
  };
  if (status === 'authenticated') {
    console.log('Session', session);
    if (session?.user?.role !== 'super-admin') {
      return (
        <div className="flex h-screen items-center justify-center">
          <h1 className="text-3xl text-white">
            You are not authorized to view this page :)
          </h1>
        </div>
      );
    }
  }

  return (
    <div className="p-14">
      {alert && (
        <Alert
          message="Payment added successfully"
          type="success"
          setState={setAlert}
          timer={5000}
        />
      )}

      <div className="rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-12">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <DateSection
              date={date}
              name="date"
              setDate={setDate}
              handleChange={handleDateChange}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <VendorSelect
              name="vendorName"
              handleChange={handleVendorChange}
              value={vendor}
              setLoadingVendors={setLoadingVendors}
              loading={loadingVendors}
              required
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="sr-only" htmlFor="amount">
              Amount Recieved
            </label>
            <input
              className="w-full rounded-lg border-gray-200 p-3 text-sm"
              placeholder="amount"
              type="number"
              id="amount"
              name="amount"
              required
              onChange={handleChange}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="sr-only" htmlFor="paymentMode">
              Payment Description
            </label>
            <input
              className="w-full rounded-lg border-gray-200 p-3 text-sm"
              placeholder="paymentMode"
              type="text"
              id="paymentMode"
              name="paymentMode"
              required
              onChange={handleChange}
            />
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto"
            >
              Add Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
