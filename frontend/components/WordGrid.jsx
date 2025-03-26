"use client"
import { useContext } from "react"
import { AppContext } from "@/context/AppContext"

function WordGrid() {
  const { gridData } = useContext(AppContext)

  // Function to determine background color based on status
  const getBackgroundColor = (status) => {
    switch (status) {
      case "correct":
        return "#6aaa64" // Green for correct letter in correct position
      case "present":
        return "#c9b458" // Yellow for correct letter in wrong position
      case "absent":
        return "#787c7e" // Gray for incorrect letter
      default:
        return "#ffffff" // White for empty or not validated
    }
  }

  // Function to determine text color based on status
  const getTextColor = (status) => {
    return status ? "#ffffff" : "#000000" // White text for colored backgrounds, black for default
  }

  return (
    <div className="mt-5">
      <div className="grid grid-cols-5 gap-3 md:gap-5 place-content-center mx-auto w-[300px] md:w-[400px] text-foreground">
        {gridData.map((cell, index) => (
          <div
            key={index}
            className="w-[50px] h-[50px] rounded-[4px] flex items-center justify-center text-2xl font-semibold shadow-md transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: getBackgroundColor(cell.status),
              color: getTextColor(cell.status),
              border: cell.status ? "none" : "1px solid #777777",
              animation: cell.char ? "fadeIn 0.5s ease-in-out" : "none",
            }}
          >
            {cell.char}
          </div>
        ))}
      </div>
    </div>
  )
}

export default WordGrid


