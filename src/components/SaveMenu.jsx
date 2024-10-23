import React, { useEffect } from 'react';

export default function SaveMenu({
  setPaymentDescription,
  setPaymentMode,
  isOpen,
  setIsOpen,
  handleSavee,
  setPaidBy,
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="mx-4 w-full max-w-md rounded-lg bg-white shadow-xl">
        <form onSubmit={handleSavee} className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              Save Payment
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 transition-colors hover:text-gray-700"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Payment Description"
              onChange={(e) => setPaymentDescription(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <select
              onChange={(e) => setPaymentMode(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Payment Mode</option>
              <option value="cash">Cash</option>
              <option value="upi">Online</option>
              <option value="cash-upi">Mix</option>
              <option value="old-paid">old patti</option>
            </select>
            <select
              onChange={(e) => setPaidBy(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Paid By</option>
              <option value="gadekar">Gadekar</option>
              <option value="mangesh madhe">Mangesh Madhe</option>
              <option value="vinod aher">Vinod Aher</option>
              <option value="Other">Other</option>
            </select>
            <button
              type="submit"
              className="w-full rounded-md bg-blue-600 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
