'use client';
import { VendorContext } from '@/app/Context/vendorcontext';
import { getVendors } from '@/serverComponents/dbFunctions';
import { useEffect, useContext } from 'react';

const VendorSelect = ({ handleChange, value, setLoadingVendors, loading }) => {
  const { vendors, setVendors } = useContext(VendorContext);
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await getVendors();
        const vendorNamesArray = res.map((vendor) => vendor.vendorname);
        setVendors(vendorNamesArray);
        // console.log("vendors fetched");
      } catch (error) {
        // setAlert({
        //   state: true,
        //   type: 'danger',
        //   message: error,
        // });
        console.log('Error in vendor fetching!');
      } finally {
        setLoadingVendors(false);
      }
    };
    if (vendors.length > 0) {
      // console.log("vendors already fetched");
      setLoadingVendors(false);
    } else {
      fetchVendors();
    }
  }, []);

  const vendorOptions = vendors.map((name, index) => (
    <option value={name} key={Number(index) + 1}>
      {name}
    </option>
  ));

  return (
    <select
      className="w-full rounded-lg border-gray-200 p-3 text-sm"
      id="vendorName"
      name="vendorName"
      onChange={handleChange}
      value={value}
      required
      autoFocus
    >
      <option value="" disabled>
        दलाल
      </option>
      {loading ? <option disabled>दलाल लोड करत आहे...</option> : vendorOptions}
    </select>
  );
};

export default VendorSelect;
