"use client";
import { useContext, useEffect } from "react";
import { AppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

const Notification = () => {
  const { notification } = useContext(AppContext);

  // Define styles based on notification type
  const getBackgroundColor = (type) => {
    switch (type) {
      case "success":
        return "bg-green-500";
      case "error":
        return "bg-red-500";
      case "warning":
        return "bg-yellow-500";
      default:
        return "bg-blue-500";
    }
  };

  // Determine if this is an important message (long message typically means game over or success)
  const isImportant = notification.message.length > 50;

  return (
    <AnimatePresence>
      {notification.show && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-md shadow-lg text-white ${getBackgroundColor(
            notification.type
          )} z-50 flex items-center justify-center max-w-md text-center ${
            isImportant ? "border-2 border-white" : ""
          }`}
        >
          <p className={`${isImportant ? "text-base md:text-lg font-semibold" : "text-sm md:text-base font-medium"}`}>
            {notification.message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification; 