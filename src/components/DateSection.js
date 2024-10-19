export default function DateSection({ date, setDate }) {
  const today = new Date().toISOString().split('T')[0];
  const minimumDate = '2023-10-15';
  const handlePrev = () => {
    setDate(
      (curr) =>
        new Date(new Date(curr) - 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
    );
  };
  const handleNext = () => {
    setDate(
      (curr) =>
        new Date(new Date(curr).getTime() + 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
    );
    console.log(date);
  };

  const handleDateChange = (event) => {
    setDate(event.target.value);
  };

  return (
    <div className="flex justify-between items-center h-9 p-2">
      <div className="w-6">
        {date != minimumDate && (
          <img
            src="/left-arrow.svg"
            onClick={handlePrev}
            className="hover:cursor-pointer"
          />
        )}
      </div>
      <input
        value={date}
        type="date"
        min={minimumDate}
        max={today}
        onChange={handleDateChange}
        className="rounded-lg border-gray-200 p-3 text-sm hover:cursor-pointer "
      />
      <div className="w-6 hover:cursor-pointer">
        {date != today && <img src="/right-arrow.svg" onClick={handleNext} />}
      </div>
    </div>
  );
}
