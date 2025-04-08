import React from "react";

const AuthLayout = ({ children }) => {
  return (
    <div className="h-screen bg-[#ffffff] flex flex-col ">
      <main>{children}</main>
    </div>
  );
};

export default AuthLayout;
