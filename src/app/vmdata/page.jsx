"use client";
import { useEffect, useState, useContext } from "react";
import {
  getRefundVmData,
  deleteFromRefundTable,
  setRefundMarked,
} from "@/serverComponents/dbFunctions";
import VendorSelect from "@/components/VendorSelect";
import Alert from "@/components/Alert";
import { VendorContext } from "../Context/vendorcontext";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Page() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { selectedVMNDate, setSelectedVMNDate } = useContext(VendorContext);
  const [alert, setAlert] = useState(false);
  const [data, setData] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [loading, setLoading] = useState(true);


  

  useEffect(() => {
    async function getData() {
      const vmData = await getRefundVmData();
      console.log(vmData);
      vmData.sort((a, b) => a.date - b.date);
      setData(vmData);
      setLoading(false);
    }
    getData();
  }, []);

  if(status === "authenticated")
    {
      console.log("Session", session);
      if(session?.user?.role === "guest"){
        return (
          <div className="flex justify-center items-center h-screen">
            <h1 className="text-3xl text-white">You are not authorized to view this page :)</h1>
          </div>
        );
      }
    }

  function handleRowClick(vendorname, date) {
    console.log("Row clicked", vendorname, date);
    var dateObj = new Date(date);

    var day = String(dateObj.getDate()).padStart(2, "0"); // Ensures two digits
    var month = String(dateObj.getMonth() + 1).padStart(2, "0"); // Months are zer
    var year = dateObj.getFullYear();

    // Format the date as DD-MM-YYYY
    var formattedDate = `${year}-${month}-${day}`;

    console.log(formattedDate); // Outputs: "05-02-2024"
    console.log("Redirecting to ", vendorname, formattedDate);
    setSelectedVMNDate({
      vendorname: vendorname,
      date: formattedDate,
    });
    router.push("/vendorMemo");
    // redirectTovm();
  }
  function handleMarkedClick(vendorname, date) {
    console.log("Marked clicked", vendorname, date);
    setRefundMarked({ vendorName: vendorname, date: date })
      .then((res) => {
        console.log(res);
        setAlert({
          state: true,
          message: "Marked Successfully",
          type: "success",
        });
		// refresh the page
		// window.location.reload();
		// remove the entry from the data
		const newData = data.filter(
		  (entry) => entry.vendorname !== vendorname || entry.date !== date
		);
		setData(newData);
      })
      .catch((err) => {
        console.log(err);
        setAlert({
          state: true,
          message: "Failed to mark",
          type: "error",
        });
        setClicked(false);
      });
  }

  function handleDeleteClick(vendorname, date) {
    console.log("Delete clicked", vendorname, date);
    setClicked(true);
    // prompt for confirmation
    if (window.confirm("Are you sure you want to delete?")) {
      deleteFromRefundTable({ vendorName: vendorname, date: date })
        .then((res) => {
          console.log(res);
          setAlert({
            state: true,
            message: "Deleted Successfully",
            type: "success",
          });
          setClicked(false);
          window.alert("Deleted Successfully");
          // remove the entry from the data
          const newData = data.filter(
            (entry) => entry.vendorname !== vendorname || entry.date !== date
          );
          setData(newData);
        })
        .catch((err) => {
          console.log(err);
          setAlert({
            state: true,
            message: "Failed to delete",
            type: "error",
          });
          setClicked(false);
        });
    }
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
        <div className="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
          <svg
            aria-hidden="true"
            className="inline w-10 h-10text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
            viewBox="0 0 100 101"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
              fill="currentColor"
            />
            <path
              d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
              fill="currentFill"
            />
          </svg>
        </div>
      )}

      <div className=" overflow-x-auto rounded-lg bg-white p-8 shadow-lg lg:col-span-3 lg:p-8 ">
        <div className="flex flex-row justify-center space-x-4">
          <h1 className="text-3xl font-bold text-center">बाकी मुंबई मेमो</h1>
          <button
            onClick={() => router.push("/vendorMemo")}
            className="inline-block w-full rounded-lg bg-black px-5 py-3 font-medium text-white sm:w-auto"
            disabled={loading}
          >
            Memo वर जा
          </button>
        </div>

        <h4 className="mt-2 text-xl text-center">
          Remaining Mumbai Memo: {data && data.length}
        </h4>
        <div className="flex justify-center">
          <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm mt-5 ">
            <thead className="">
              <tr className="bg-gray-300">
                <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                 Sr. No.
                </th>
                <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                  Vendor Name
                </th>
                <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                  Transport Date
                </th>
                <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                  Transporter name
                </th>
                <th className="whitespace-nowrap px-1 md:px-12 lg:px-12 py-2 font-bold text-gray-900">
                Delete | Mark as Done
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data &&
                data.map((entry, index) => (
                  <tr
                    key={index + 1}
                    className="cursor-pointer hover:bg-gray-100 transition-all ease-in-out duration-200"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRowClick(entry.vendorname, entry.date);
                    }}
                  >
                    <td className="whitespace-nowrap text-center py-2 text-gray-700">
                      {index + 1}
                    </td>
                    <td className="whitespace-nowrap text-center font-bold py-2 text-gray-700">
                      {entry.vendorname}
                    </td>
                    <td className="whitespace-nowrap text-center py-2 font-semibold text-gray-700">
                      {entry.date.toLocaleDateString("en-IN")}
                    </td>

                    <td className="whitespace-nowrap text-center py-2 text-gray-700">
                      {entry.transportername}
                    </td>
                    <td className="whitespace-nowrap text-center py-2 text-gray-700">
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteClick(entry.vendorname, entry.date);
                        }}
                      >
                        <svg
                          className="w-4 h-4 text-gray-800 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="currentColor"
                          viewBox="0 0 18 20"
                        >
                          <path d="M17 4h-4V2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2H1a1 1 0 0 0 0 2h1v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1a1 1 0 1 0 0-2ZM7 2h4v2H7V2Zm1 14a1 1 0 1 1-2 0V8a1 1 0 0 1 2 0v8Zm4 0a1 1 0 0 1-2 0V8a1 1 0 0 1 2 0v8Z" />
                        </svg>
                      </button>
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded-lg ml-2"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleMarkedClick(entry.vendorname, entry.date);
                        }}
                      >
                        <svg
                          class="w-4 h-4 text-gray-800 dark:text-white"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <path
                            stroke="currentColor"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M5 11.917 9.724 16.5 19 7.5"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
