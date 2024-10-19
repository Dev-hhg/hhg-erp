"use client";
import { useEffect, useState, useContext } from "react";

import VendorSelect from "@/components/VendorSelect";
import Alert from "@/components/Alert";
import { VendorContext } from "../Context/vendorcontext";
import { useRouter } from "next/navigation";
import { refreshMaterializedView } from "@/serverComponents/dbFunctions";
import Loader from "@/components/Loader";

export default function Page() {
  const router = useRouter();

  const [alert, setAlert] = useState(false);
  const [data, setData] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleLateClick() {
	router.push("/lateentry");
  }

  function handleRefresh() {
    refreshMaterializedView()
      .then((res) => {
        setAlert({
          state: true,
          message: "Materialised view refreshed",
          type: "success",
        });
      })
      .catch((err) => {
        setAlert({
          state: true,
          message: "Error refreshing materialised view",
          type: "error",
        });
      })
    
  }

  return (
    <div className="p-14">
      {alert.state && (
        <Alert
          message={alert.message}
          type={alert.type}
          setState={setAlert}
          timer={2000}
        />
      )}
      {loading && (
        <Loader />
      )}

      <div className=" overflow-x-auto rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-8 ">
        <div className="flex flex-row justify-center space-x-4">
          <h1 className="text-3xl font-bold text-center">Extras</h1>
          {/* <button
            onClick={() => router.push("/vendorMemo")}
            className="inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto"
            disabled={loading}
          >
            Mumbai Memo वर जा
          </button> */}
        </div>

        {/* create cards for navigating to different pages  */}
        <div className="flex justify-evenly">
          <div>
            <button onClick={handleLateClick} className="p-4 border border-gray-200 rounded w-64 bg-white hover:bg-gray-50 hover:border-b-4 hover:border-b-blue-500 flex items-center active:bg-gray-100">
              {" "}
              <div className="flex justify-center items-center text-gray-500 mr-4">
                {" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />{" "}
                </svg>{" "}
              </div>{" "}
              <h1 className="font-bold text-gray-700 text-sm">
                Add Late Entries
              </h1>{" "}
            </button>
          </div>
          

          {/* Button to refresh materialised view */}
          <div>
            <button
              onClick={handleRefresh}
              className="p-4 border border-gray-200 rounded w-64 bg-white hover:bg-gray-50 hover:border-b-4 hover:border-b-blue-500 flex items-center active:bg-gray-100"
            >
              {" "}
              <div className="flex justify-center items-center text-gray-500 mr-4">
                {" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  {" "}
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />{" "}
                </svg>{" "}
              </div>{" "}
              <h1 className="font-bold text-gray-700 text-sm">
                Refresh Daily Rate
              </h1>{" "}
            </button>

            </div>
        </div>
      </div>
    </div>
  );
}
