import React from 'react';

export default function FromtoDate({ from, setFrom, to, setTo }) {
  const today = new Date().toISOString().split('T')[0];
  const minimumDate = '2023-10-15';

  const handleFromChange = (event) => {
    const newFrom = event.target.value;
    setFrom(newFrom);
    // Ensure 'to' date is not before 'from' date
    if (newFrom > to) {
      setTo(newFrom);
    }
  };

  const handleToChange = (event) => {
    const newTo = event.target.value;
    setTo(newTo);
    // Ensure 'from' date is not after 'to' date
    if (newTo < from) {
      setFrom(newTo);
    }
  };

  return (
    <div className="mb-4 flex h-9 items-center justify-center space-x-4 p-2">
      <div className="mr-4">From</div>
      <input
        id="from"
        value={from}
        type="date"
        min={minimumDate}
        max={to}
        onChange={handleFromChange}
        className="rounded-lg border-gray-200 p-3 text-sm hover:cursor-pointer"
      />
      <div className="mr-4">To</div>
      <input
        id="to"
        value={to}
        type="date"
        min={from}
        max={today}
        onChange={handleToChange}
        className="rounded-lg border-gray-200 p-3 text-sm hover:cursor-pointer"
      />
    </div>
  );
}
