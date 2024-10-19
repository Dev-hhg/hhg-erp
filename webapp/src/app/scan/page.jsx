"use client";
import { useEffect, useState } from "react";
import DateSection from "@/components/DateSection";
import QRScan from "@/components/QRScan";
import Modal from "@/components/Modal";
import { set } from "react-hook-form";
import {getSetEntryScan} from "@/serverComponents/dbFunctions";

function Page() {
  const [modalOpen, setModalOpen] = useState(false);
  const [decodedText, setDecodedText] = useState("");
  const [previousDecodedText, setPreviousDecodedText] = useState("");
  const [scannedBags, setScannedBags] = useState([]);
  const [duplicate, setDuplicate] = useState(false);
  const [dataBaseEntry, setDataBaseEntry] = useState([]); // [bag1, bag2, bag3, ...
  let lastScannedText = [];

  const onNewScanResult = (txt, decodedResult) => {
    console.log("Values in scanned bags", scannedBags);
    setDecodedText(txt);
  };

  // Effect hook to perform actions based on the updated previousDecodedText
  useEffect(() => {
    console.log("scannedBags", scannedBags);
    if (
      decodedText !== null &&
      decodedText !== ""
    ) {
      if (scannedBags.indexOf(decodedText) === -1) {
        console.log("New scanned");
        setPreviousDecodedText(decodedText); // Schedule an update to previousDecodedText
        lastScannedText.push(decodedText);
        setModalOpen(true);
      } else {
        console.log("Duplicate QR code scanned");
        setDuplicate(true);
      }
    }

  }, [decodedText]);

  const closeModal = () => {
    setModalOpen(false);
  };

  const handleOk = () => {
    setScannedBags((prev) => [...prev, decodedText]);
    // getSetEntryScan(decodedText);
    
    async function setEntryScan() {
        const temp = await getSetEntryScan(decodedText);
        console.log("temp", temp);
        
        setDataBaseEntry(temp);
    }
    setEntryScan();

    closeModal();
  };

  const handleCancel = () => {
    setDuplicate(false);
    console.log("lastScannedTextP", lastScannedText);
    lastScannedText.pop();
    console.log("lastScannedTextA", lastScannedText);
    closeModal();
  };

  const qrboxFunction = function (viewfinderWidth, viewfinderHeight) {
    let minEdgePercentage = 0.8; // 70%
    let minEdgeSize = Math.min(viewfinderWidth, viewfinderHeight);
    let qrboxSize = Math.floor(minEdgeSize * minEdgePercentage);
    return {
      width: qrboxSize,
      height: Math.floor(qrboxSize / 2),
    };
  };

  return (
    <div className="p-2 flex flex-col items-start h-screen">
      <div>
        <div className="">
          <div className="text-white">
            Go{" "}
            <a href="/entry" className="text-blue-600">
              Home
            </a>
          </div>
        </div>
        <div className="text-white">
          Now scanned: <span className=" text-green-600">{decodedText}</span>
        </div>
        {duplicate && (
          <div className="text-red-600">Duplicate QR code scanned</div>
        )}
      </div>
      <div className="m-2 max-w-full max-h-full">
        <QRScan
          className="p-10"
          fps={1}
          qrbox={qrboxFunction}
          aspectRatio={1}
          disableFlip={false}
          qrCodeSuccessCallback={onNewScanResult}
          qrCodeErrorCallback={(errorMessage) => {
            console.error(errorMessage);
          }}
        />
        <div>
          {/* show scanned bags in reverse order of scanning */}
          {scannedBags.map((bag, index) => {
            return <div key={index}>{bag}</div>;
          })}
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        decodedText={decodedText}
        onOk={handleOk}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default Page;
