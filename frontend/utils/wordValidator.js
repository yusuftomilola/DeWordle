"use client";

import words from 'an-array-of-english-words';

// Filter out only 5-letter words and convert to uppercase
const fiveLetterWords = words
  .filter(word => word.length === 5)
  .map(word => word.toUpperCase());

// Create a Set for faster lookups
const wordSet = new Set(fiveLetterWords);

/**
 * Validates if a word is a valid 5-letter English word
 * @param {string} word - The word to validate
 * @returns {object} - Validation result with validity and reason
 */
export const validateWord = (word) => {
  if (!word || word.length !== 5) {
    return { 
      valid: false, 
      reason: "Word must be 5 letters" 
    };
  }

  const upperWord = word.toUpperCase();
  
  // Check for vowels
  if (!/[AEIOU]/.test(upperWord)) {
    return { 
      valid: false, 
      reason: "Word must contain at least one vowel" 
    };
  }
  
  // Check for repeated letters (4+ times)
  if (/(.).*\1.*\1.*\1/.test(upperWord)) {
    return { 
      valid: false, 
      reason: "Not a valid word" 
    };
  }
  
  // Check if it exists in our dictionary
  if (!wordSet.has(upperWord)) {
    return { 
      valid: false, 
      reason: "Not in word list" 
    };
  }
  
  return { valid: true };
};

/**
 * Checks if a word might be valid (less strict validation)
 * @param {string} word - The word to check
 * @returns {boolean} - Whether the word might be valid
 */
export const mightBeValidWord = (word) => {
  if (!word || word.length !== 5) return false;
  
  const upperWord = word.toUpperCase();
  
  // Must have at least one vowel
  if (!/[AEIOU]/.test(upperWord)) return false;
  
  // Cannot have the same letter repeated 4+ times
  if (/(.).*\1.*\1.*\1/.test(upperWord)) return false;
  
  return true;
};