"use client";
import { useEffect, useState } from "react";
import OtpInput from "./OtpInput";

function OtpVerification() {
  const [otp, setOtp] = useState("");

  const handleOtpComplete = (otp) => {
    setOtp(otp);
  };

  return (
    <div className="min-h-screen bg-[#ffffff] flex  justify-center p-4 ">
      <div className="w-full sm:max-w-[480px] p-6 sm:p-8 rounded-lg ">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-3 text-[#29296E]">
          Check your email
        </h2>
        <p className="text-center text-black text-sm sm:text-base mt-8 font-normal">
          Thanks! If{" "}
          <span className="text-[#29296a] font-semibold">
            johnstones@gmail.com
          </span>{" "}
          matches an email we have on our record, then we’ve sent you an{" "}
          <span className="text-[#29296a] font-semibold">OTP</span> to reset
          your password
        </p>

        <form className="mt-10">
          <div className="flex items-center justify-center">
            <OtpInput length={4} onComplete={handleOtpComplete} />
          </div>

          <button
            type="submit"
            disabled={otp.length !== 4}
            className="w-full bg-[#29296A] disabled:bg-[#29296A]/40 text-white p-3 rounded-full mt-10 sm:mt-10 text-sm sm:text-base"
          >
            Continue
          </button>
        </form>
      </div>
    </div>
  );
}

export default OtpVerification;
