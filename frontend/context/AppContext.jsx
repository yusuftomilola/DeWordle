"use client";
import { createContext, useState, useEffect } from "react";
import { useGetWord, useValidateGuess } from "@/hooks/useGetWord";
import { validateWord } from "@/utils/wordValidator";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [targetWord, setTargetWord] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [userData, setUserData] = useState({});
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  // Get user data from local storage
  useEffect(() => {
    setIsLoading(true);
    const storedUser = localStorage.getItem("currentUser");
    // if (storedUser) {
    //   setUserData(JSON.parse(storedUser));
    // }
    setIsLoading(false);
  }, []);

  // Initialize grid data from localStorage or empty grid
  const [gridData, setGridData] = useState(() => {
    if (typeof window !== "undefined") {
      const savedGridData = localStorage.getItem("dewordle_grid");
      if (savedGridData) {
        return JSON.parse(savedGridData);
        b;
      }
    }
    return Array(30)
      .fill()
      .map(() => ({ char: "", status: "" }));
  });

  // Load position from localStorage - moved this up so it runs before other effects
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load game over state
      const savedGameOver = localStorage.getItem("dewordle_gameOver");
      if (savedGameOver) {
        setGameOver(JSON.parse(savedGameOver));
      }

      // Load grid data
      const savedGridData = localStorage.getItem("dewordle_grid");
      if (savedGridData) {
        const parsedGridData = JSON.parse(savedGridData);

        // Calculate currentRow based on the grid data
        // Find the last row that has any characters
        let lastFilledRow = 0;
        let lastFilledCol = 0;

        for (let row = 0; row < 6; row++) {
          const rowStart = row * 5;
          const rowData = parsedGridData.slice(rowStart, rowStart + 5);

          // Check if this row has any filled cells
          if (rowData.some((cell) => cell.char !== "")) {
            lastFilledRow = row;

            // Find the last filled column in this row
            for (let col = 0; col < 5; col++) {
              if (rowData[col].char !== "") {
                lastFilledCol = col + 1; // +1 because we want the position after the last filled cell
              }
            }

            // If the row is complete (all 5 columns filled) and has status values set,
            // then we should move to the next row and reset the column
            if (
              lastFilledCol === 5 &&
              rowData.every((cell) => cell.status !== "")
            ) {
              lastFilledRow++;
              lastFilledCol = 0;
            }
          }
        }

        // Only update if there's actual data to consider
        if (parsedGridData.some((cell) => cell.char !== "")) {
          setCurrentRow(lastFilledRow);
          setCurrentCol(lastFilledCol);
        }
      }
    }
  }, []);

  // Save current game state to localStorage
  useEffect(() => {
    if (gridData.some((cell) => cell.char !== "")) {
      localStorage.setItem("dewordle_grid", JSON.stringify(gridData));
    }
  }, [gridData]);

  // Save current row and column to localStorage
  useEffect(() => {
    localStorage.setItem(
      "dewordle_position",
      JSON.stringify({ row: currentRow, col: currentCol })
    );
  }, [currentRow, currentCol]);

  // Save game over state to localStorage
  useEffect(() => {
    localStorage.setItem("dewordle_gameOver", JSON.stringify(gameOver));
  }, [gameOver]);

  const { mutate: fetchWord, isLoading: wordLoading } = useGetWord();
  const { mutate: validateGuess, isLoading: validationLoading } =
    useValidateGuess();

  useEffect(() => {
    fetchWord(undefined, {
      onSuccess: (response) => {
        const word = response.data.word;
        setTargetWord(word.toUpperCase());

        // Save the target word to localStorage
        localStorage.setItem("dewordle_targetWord", word.toUpperCase());

        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching word:", error);
        setMessage("Error loading game. Please try again.");
        setIsLoading(false);
      },
    });
  }, [fetchWord]);

  // Restore target word from localStorage if available
  useEffect(() => {
    const savedTargetWord = localStorage.getItem("dewordle_targetWord");
    if (savedTargetWord && !targetWord) {
      setTargetWord(savedTargetWord);
      setIsLoading(false);
    }
  }, [targetWord]);

  // Show notification
  const showNotification = (message, type = "info") => {
    setNotification({ show: true, message, type });

    // Auto-hide after 5 seconds for longer messages, 3 seconds for shorter ones
    // Give game over messages a longer display time (7 seconds)
    let duration = 3000;

    if (
      message.includes("You've used all your tries") ||
      message.includes("You guessed the correct word")
    ) {
      duration = 7000; // Game over and success messages stay longer
    } else if (message.length > 50) {
      duration = 5000; // Other longer messages
    }

    setTimeout(() => {
      setNotification({ show: false, message: "", type: "" });
    }, duration);
  };

  const validateCurrentWord = async () => {
    // We've already verified in the Keyboard component that currentCol === 5,
    // so we don't need to check again here

    const startIdx = currentRow * 5;
    const currentWord = gridData
      .slice(startIdx, startIdx + 5)
      .map((cell) => cell.char)
      .join("");

    // Use the dictionary-based word validator first
    const validationResult = validateWord(currentWord);
    if (!validationResult.valid) {
      showNotification(validationResult.reason, "error");
      return false;
    }

    // Validate if the word exists in the dictionary
    try {
      const response = await new Promise((resolve, reject) => {
        validateGuess(currentWord.toLowerCase(), {
          onSuccess: (response) => resolve(response),
          onError: (error) => reject(error),
        });
      });

      console.log("Validation response:", response.data);

      // If the word is not valid
      if (!response.data.valid) {
        const message = response.data.message || "Not a valid word";
        console.log("Word invalid:", message);
        showNotification(message, "error");
        return false;
      }

      let newGridData = [...gridData];

      // Check if the API confirmed this is the correct word
      if (response.data.correct === true) {
        // Mark all letters as correct
        for (let i = 0; i < 5; i++) {
          const cellIndex = startIdx + i;
          newGridData[cellIndex].status = "correct";
        }

        setGridData(newGridData);
        showNotification(
          "🎉 You guessed the correct word! Check back tomorrow!",
          "success"
        );
        setGameOver(true);
        return true;
      }

      // If API returned a hint, use it to color the letters
      else if (response.data.hint) {
        const hint = response.data.hint;
        console.log("API Hint received:", hint); // Debug log to see exact hint format
        console.log("Hint length:", hint.length);

        // Convert the hint to an array of characters to ensure proper emoji handling
        const hintChars = Array.from(hint);
        console.log("Hint characters array:", hintChars);

        // Apply the hint colors to the grid
        for (let i = 0; i < 5 && i < hintChars.length; i++) {
          const cellIndex = startIdx + i;
          const hintChar = hintChars[i];

          console.log(`Processing hint char at position ${i}: "${hintChar}"`);

          // Direct check for emoji characters
          if (hintChar === "🟩") {
            console.log(
              `Setting letter ${currentWord[i]} at position ${i} to "correct"`
            );
            newGridData[cellIndex].status = "correct";
          } else if (hintChar === "🟨") {
            console.log(
              `Setting letter ${currentWord[i]} at position ${i} to "present"`
            );
            newGridData[cellIndex].status = "present";
          } else {
            console.log(
              `Setting letter ${currentWord[i]} at position ${i} to "absent"`
            );
            newGridData[cellIndex].status = "absent";
          }
        }

        console.log(
          "Final grid statuses:",
          newGridData.slice(startIdx, startIdx + 5).map((cell) => cell.status)
        );

        setGridData(newGridData);

        // Check if the word is correct based on the API response
        if (response.data.correct === true) {
          showNotification(
            "🎉 You guessed the correct word! Check back tomorrow!",
            "success"
          );
          setGameOver(true);
          return true;
        }

        // Also check if all hints are green (all correct)
        const allGreen =
          hintChars.length === 5 && hintChars.every((char) => char === "🟩");
        if (allGreen) {
          showNotification(
            "🎉 You guessed the correct word! Check back tomorrow!",
            "success"
          );
          setGameOver(true);
          return true;
        }

        // Check if game is over (all rows used)
        if (currentRow === 5) {
          showNotification(
            `😔 You've used all your tries. The correct word was '${targetWord}'. Come back tomorrow!`,
            "error"
          );
          setGameOver(true);
        }

        return false;
      }

      // If no hint is available, fall back to the original logic
      let remainingLetters = [...targetWord];

      // First pass: Mark correct letters (green)
      for (let i = 0; i < 5; i++) {
        const cellIndex = startIdx + i;
        const guessedLetter = currentWord[i];

        if (guessedLetter === targetWord[i]) {
          newGridData[cellIndex].status = "correct";
          remainingLetters[i] = null; // Mark this position as used
        }
      }

      // Second pass: Mark present letters (orange)
      for (let i = 0; i < 5; i++) {
        const cellIndex = startIdx + i;
        const guessedLetter = currentWord[i];

        // Skip letters that were already marked as correct
        if (newGridData[cellIndex].status === "correct") continue;

        const letterPosition = remainingLetters.indexOf(guessedLetter);
        if (letterPosition !== -1) {
          newGridData[cellIndex].status = "present";
          remainingLetters[letterPosition] = null; // Mark this letter as used
        } else {
          newGridData[cellIndex].status = "absent";
        }
      }

      setGridData(newGridData);

      // Check if the word is correct
      const isCorrect = currentWord === targetWord;
      if (isCorrect) {
        showNotification(
          "🎉 You guessed the correct word! Check back tomorrow!",
          "success"
        );
        setGameOver(true);
        return true;
      }

      // Check if game is over (all rows used)
      // Note: Since rows are 0-indexed, currentRow 5 is the 6th row
      if (currentRow === 5) {
        showNotification(
          `😔 You've used all your tries. The correct word was '${targetWord}'. Come back tomorrow!`,
          "error"
        );
        setGameOver(true);
      }
    } catch (error) {
      console.error("Error validating word:", error);
      showNotification("Not a valid word", "error");
      return false;
    }

    return false;
  };

  // Reset the game
  const resetGame = () => {
    setCurrentRow(0);
    setCurrentCol(0);
    setGridData(
      Array(30)
        .fill()
        .map(() => ({ char: "", status: "" }))
    );
    setMessage("");
    setGameOver(false);
    setIsLoading(true);

    // Clear localStorage
    localStorage.removeItem("dewordle_grid");
    localStorage.removeItem("dewordle_position");
    localStorage.removeItem("dewordle_gameOver");
    localStorage.removeItem("dewordle_targetWord");

    fetchWord(undefined, {
      onSuccess: (response) => {
        const word = response.data.word;
        setTargetWord(word.toUpperCase());
        localStorage.setItem("dewordle_targetWord", word.toUpperCase());
        setIsLoading(false);
      },
      onError: (error) => {
        console.error("Error fetching word:", error);
        setMessage("Error loading game. Please try again.");
        setIsLoading(false);
      },
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentRow,
        setCurrentRow,
        currentCol,
        setCurrentCol,
        gridData,
        setGridData,
        targetWord,
        isLoading: isLoading || wordLoading || validationLoading,
        message,
        setMessage,
        gameOver,
        validateCurrentWord,
        resetGame,
        userData,
        setUserData,
        notification,
        showNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
