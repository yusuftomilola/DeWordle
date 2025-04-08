import React from "react";


const AuthLayout = ({ children }) => {
  return (
    <div className="bg-[#ffffff] flex flex-col">
      <main className="">{children}</main>
    </div>
  );
};

export default AuthLayout;
