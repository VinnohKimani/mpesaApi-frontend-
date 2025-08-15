import React, { useState } from "react";

export const TableRecords = ({ payments }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredPayments, setFilteredPayments] = useState(payments);

  const handleSearch = () => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      setFilteredPayments(payments); // reset if empty
      return;
    }

    setFilteredPayments(
      payments.filter((p) => p.phone_number.toLowerCase().includes(term))
    );
  };

  let lastDate = null;

  return (
    <>
      {/* Filter Input + Button */}
      <label>Search by phone number</label>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search here"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border p-2  border-green-600 rounded w-full sm:w-2/3 text-sm sm:text-base"
        />
        <button
          onClick={handleSearch}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded cursor-pointer sm:w-auto "
        >
          Search Payment
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-yellow-300 text-sm sm:text-base">
          <thead>
            <tr className="bg-yellow-100">
              <th className="border border-yellow-300 p-2">Phone Number</th>
              <th className="border border-yellow-300 p-2">Amount</th>
              <th className="border border-yellow-300 p-2">Transaction Code</th>
              <th className="border border-yellow-300 p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredPayments.length > 0 ? (
              filteredPayments.map((p, idx) => {
                const currentDate = new Date(p.transaction_date);
                const dayString = currentDate.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                });

                const isNewDay = lastDate !== dayString;
                lastDate = dayString;

                return (
                  <React.Fragment key={idx}>
                    {isNewDay && (
                      <tr>
                        <td
                          colSpan="4"
                          className="bg-yellow-200 text-center font-semibold border border-yellow-300 py-2"
                        >
                          {dayString}
                        </td>
                      </tr>
                    )}
                    <tr className="hover:bg-yellow-50">
                      <td className="border border-yellow-300 p-2">
                        {p.phone_number}
                      </td>
                      <td className="border border-yellow-300 p-2">
                        {p.amount}
                      </td>
                      <td className="border border-yellow-300 p-2">
                        {p.transaction_code}
                      </td>
                      <td className="border border-yellow-300 p-2">
                        {currentDate.toLocaleString()}
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className="border p-2 text-center">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};
