'use client';
// vendorcontext.jsx

import React, { createContext, useState } from 'react';

export const VendorContext = createContext();

export const VendorProvider = ({ children }) => {
  const [vendors, setVendors] = useState([]);
  const [farmers, setFarmers] = useState([]);
  const [printsize, setPrintsize] = useState('small');
  const [refundData, setRefundData] = useState([]);
  const [entriesData, setEntriesData] = useState([]);
  const [selectedVMNDate, setSelectedVMNDate] = useState({
    vendorname: '',
    date: '',
  });
  const [transportMemoData, setTransportMemoData] = useState([]);
  const [isLogged, setIsLogged] = useState(false);

  // console.log("Hello context is running");
  return (
    <VendorContext.Provider
      value={{
        vendors,
        setVendors,
        farmers,
        setFarmers,
        printsize,
        setPrintsize,
        selectedVMNDate,
        setSelectedVMNDate,
        transportMemoData,
        setTransportMemoData,
        refundData,
        setRefundData,
        entriesData,
        setEntriesData,
        isLogged,
        setIsLogged,
      }}
    >
      {children}
    </VendorContext.Provider>
  );
};
