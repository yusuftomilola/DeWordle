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
        </form>
      </div>
    </div>
  );
}
