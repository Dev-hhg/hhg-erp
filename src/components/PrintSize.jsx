'use client';
import { VendorContext } from '@/app/Context/vendorcontext';
import React, { useState, useContext } from 'react';

function PrintSize() {
  const { printsize, setPrintsize } = useContext(VendorContext);
  const [selectedSize, setSelectedSize] = useState('small');

  const handleChange = (event) => {
    setSelectedSize(event.target.value);
    console.log('selected size: ', event.target.value);
    setPrintsize(event.target.value);
  };
  const handleHome = () => {
    // redirect to /entry
    window.location.href = '/entry';
  };

  return (
    <div className="flex">
      {/* <div>
				<button className=" mt-2 flex bg-white p-2 rounded-md align-middle justify-center items-center mr-2 hover:bg-indigo-700" onClick={handleHome}>Go to Home</button>

			</div> */}
      <div className="flex flex-col items-center justify-center">
        {/* <p className="mr-4">Print Size:</p>
				<select
					className="mt-2 py-2 px-8 flex align-middle items-center justify-center bg-white border border-gray-400 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
					value={printsize}
					onChange={handleChange}
				>
					<option value="small">48x25</option>
					<option value="large">48x50</option>
				</select> */}
        <p className="flex">Version : 5.0.4</p>
      </div>
    </div>
  );
}

export default PrintSize;
