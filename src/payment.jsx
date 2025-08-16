import { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { TableRecords } from "./tableRecords";
import { BASE_URL } from "./utils";

function App() {
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [payments, setPayments] = useState([]);

  const toastId = useRef(null);
  const intervalId = useRef(null);

  // const BASE_URL = "http://127.0.0.1:5000";

  const fetchPayments = async () => {
    try {
      const res = await fetch(`${BASE_URL}/payments`);
      const data = await res.json();
      const sortedData = (data || []).sort(
        (a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)
      );
      setPayments(sortedData);
    } catch (err) {
      toast.error("Failed to fetch payment records");
    }
  };

  useEffect(() => {
    fetchPayments();
    return () => clearInterval(intervalId.current);
  }, []);

  const checkPayment = (checkoutRequestId) => {
    fetch(`${BASE_URL}/payments/check/${checkoutRequestId}`)
      .then((res) => res.json())
      .then((data) => {
        clearInterval(intervalId.current);
        if (data.data?.ResultCode === "0") {
          toast.update(toastId.current, {
            render: "Payment successful",
            type: "success",
            isLoading: false,
            autoClose: 4000,
          });
          if (data.payment) {
            setPayments((prev) => [data.payment, ...prev]);
          } else {
            fetchPayments();
          }
        } else {
          toast.update(toastId.current, {
            render: "Payment not successful",
            type: "error",
            isLoading: false,
            autoClose: 4000,
          });
        }
      })
      .catch(() => {
        clearInterval(intervalId.current);
        toast.update(toastId.current, {
          render: "Error checking payment",
          type: "error",
          isLoading: false,
          autoClose: 4000,
        });
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !amount) {
      toast.error("Please enter phone number and amount");
      return;
    }

    let formattedPhone = phone;
    if (phone.startsWith("0")) {
      formattedPhone = `254${phone.slice(1)}`;
    } else if (phone.startsWith("+254")) {
      formattedPhone = phone.slice(1);
    } else if (!phone.startsWith("254")) {
      toast.error(
        "Please enter a valid phone number (starting with 07, 254, or +254)"
      );
      return;
    }

    toastId.current = toast.loading("Initiating STK push...");

    try {
      const res = await fetch(`${BASE_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formattedPhone, amount }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast.update(toastId.current, {
          render: result.message || "Payment initiation failed",
          type: "error",
          isLoading: false,
          autoClose: 4000,
        });

        return;
      }

      toast.update(toastId.current, {
        render: "Confirming payment...",
        type: "info",
        isLoading: true,
      });

      intervalId.current = setInterval(() => {
        checkPayment(result.data.CheckoutRequestID);
      }, 10_000);

      setTimeout(() => clearInterval(intervalId.current), 100_000);

      setPhone("");
      setAmount("");
    } catch {
      toast.update(toastId.current, {
        render: "Something went wrong. Try again.",
        type: "error",
        isLoading: false,
        autoClose: 4000,
      });
    }
  };

  return (
    <>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-white  rounded-xl shadow-lg border border-gray-200 p-6">
          <h1 className="text-xl sm:text-5xl font-bold mb-4 text-black text-center">
           --- Mash Collection ----
          </h1>
          <p className="text-xl sm:text-2xl font-bold mb-4 text-green-600 text-center">
            Mpesa Payment platform
          </p>
          {/* Payment Form */}
          <form onSubmit={handleSubmit} className="mb-8 space-y-3 sm:space-y-4">
            <label>Enter phone number</label>
            <input
              type="text"
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="border p-2  border-green-600 rounded w-full text-sm sm:text-base"
              required
            />
            <label>Enter amount </label>
            <input
              type="number"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border p-2  border-green-600 rounded w-full text-sm sm:text-base"
              required
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 cursor-pointer text-white px-4 py-2 rounded w-full "
            >
              Make Payment
            </button>
          </form>{" "}
          <h2 className="text-lg sm:text-xl  font-semibold mb-2 ">
            Payment Records
          </h2>
          {/* Table Component */}
          <TableRecords
            payments={payments}
            phone={phone}
            amount={amount}
            setPhone={setPhone}
            setAmount={setAmount}
          />
        </div>
      </div>

      <ToastContainer />
    </>
  );
}

export default App;
