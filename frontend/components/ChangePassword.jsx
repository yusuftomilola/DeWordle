
"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function PasswordChangeForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Check if all fields are filled
    setIsFormValid(
      currentPassword.trim() !== "" &&
        newPassword.trim() !== "" &&
        confirmPassword.trim() !== "" &&
        securityAnswer.trim() !== ""
    );
  }, [currentPassword, newPassword, confirmPassword, securityAnswer]);

  const handleSubmit = () => {
    e.preventDefault();
    if (isFormValid) {
      // Handle form submission
      console.log("Form submitted");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md">
        <h1 className="text-xl font-medium text-gray-800 mb-6">
          Change password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="relative">
            <input
              type={showCurrentPassword ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            >
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <input
              type={showNewPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Security Answer */}
          <div>
            <input
              type="text"
              placeholder="Security Answer"
              value={securityAnswer}
              onChange={(e) => setSecurityAnswer(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 px-4 rounded-md transition-colors duration-200 ${
              isFormValid
                ? "bg-[#7b79b1] text-white hover:bg-[#6a68a0]"
                : "bg-[#7b79b1] bg-opacity-70 text-white cursor-not-allowed"
            }`}
          >
            Continue
          </button>

"use client"
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';


const PasswordChangeForm = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted', { currentPassword, newPassword, confirmPassword });
  };
  
  const isFormValid = currentPassword && newPassword && confirmPassword;
  
  return (
    <div className="w-full max-w-xl mx-auto p-6">
      <div className="p-6">
        <h1 className="text-[48px] md:text-[48px] text-[#29296E] font-[600] font-roboto text-center mb-10 text-3xl sm:text-4xl">Password Change</h1>
       
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password  */}
          <div>
            <label htmlFor="currentPassword" className="block text-[16px] font-[400] text-[#535353] mb-1">
            Enter Existing Password
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#535353] rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                placeholder="Enter current password"
               style={{ WebkitAppearance: "none" }}
              autoComplete="current-password"
              />
              
                <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
            >
              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button> 
            </div>
          </div>
          
          {/* New Password  */}
          <div>
            <label htmlFor="newPassword" className="block text-[16px] font-[400] text-[#535353] mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#535353] rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                placeholder="Enter new password"
                style={{ WebkitAppearance: "none" }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowNewPassword(!showNewPassword)}
                tabIndex="-1"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          {/* Confirm Password  */}
          <div>
            <label htmlFor="confirmPassword" className="block text-[16px] font-[400] text-[#535353] mb-1">
              Re-enter Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-[#535353] rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                placeholder="Confirm new password"
                style={{ WebkitAppearance: "none" }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>
          
          
         {/* Submission Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!isFormValid}
              className={`w-full py-4 px-4 rounded-[24px] text-white font-medium transition-colors ${
                isFormValid 
                  ? "bg-[#29296E] hover:bg-[#12123f]" 
                  : "bg-[#656586] cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>

        </form>
      </div>
    </div>
  );

}

};

export default PasswordChangeForm
