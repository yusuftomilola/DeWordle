"use client";

import API from "@/utils/axios";
import { useMutation } from "@tanstack/react-query";
import { validateWord, mightBeValidWord } from "@/utils/wordValidator";

// List of common 5-letter words for validation if the API fails
const COMMON_WORDS = [
  "APPLE", "ABOUT", "ABOVE", "ABUSE", "ACTOR", "ADAPT", "ADMIT", "ADOPT", "ADULT", "AFTER",
  "AGAIN", "AGENT", "AGREE", "AHEAD", "ALARM", "ALBUM", "ALERT", "ALIKE", "ALIVE", "ALLOW",
  "ALONE", "ALONG", "ALTER", "AMONG", "ANGER", "ANGLE", "ANGRY", "ANKLE", "APART", "APPLE",
  "APPLY", "ARENA", "ARGUE", "ARISE", "ARMOR", "ARRAY", "ARROW", "ASSET", "AVOID", "AWARD",
  "AWARE", "BADLY", "BAKER", "BASES", "BASIC", "BASIS", "BEACH", "BEGAN", "BEGIN", "BEGUN",
  "BEING", "BELOW", "BENCH", "BILLY", "BIRTH", "BLACK", "BLAME", "BLIND", "BLOCK", "BLOOD",
  "BOARD", "BOOST", "BOOTH", "BORN", "BORROW", "BOSS", "BOTTOM", "BOUGHT", "BRAIN", "BRAND",
  "BREAD", "BREAK", "BREED", "BRIEF", "BRING", "BROAD", "BROKE", "BROWN", "BUILD", "BUILT",
  "BUYER", "CABLE", "CALIF", "CARRY", "CATCH", "CAUSE", "CHAIN", "CHAIR", "CHART", "CHASE",
  "CHEAP", "CHECK", "CHEST", "CHIEF", "CHILD", "CHINA", "CHOSE", "CIVIL", "CLAIM", "CLASS",
  "CLEAN", "CLEAR", "CLICK", "CLOCK", "CLOSE", "COACH", "COAST", "COULD", "COUNT", "COURT",
  "COVER", "CRAFT", "CRASH", "CREAM", "CRIME", "CROSS", "CROWD", "CROWN", "CURVE", "CYCLE",
  "DAILY", "DANCE", "DATED", "DEALT", "DEATH", "DEBUT", "DELAY", "DEPTH", "DOING", "DOUBT",
  "DOZEN", "DRAFT", "DRAMA", "DRAWN", "DREAM", "DRESS", "DRILL", "DRINK", "DRIVE", "DROVE",
  "DYING", "EAGER", "EARLY", "EARTH", "EIGHT", "ELITE", "EMPTY", "ENEMY", "ENJOY", "ENTER",
  "ENTRY", "EQUAL", "ERROR", "EVENT", "EVERY", "EXACT", "EXIST", "EXTRA", "FAITH", "FALSE",
  "FANCY", "FAULT", "FAVOR", "FEAST", "FIELD", "FIFTH", "FIFTY", "FIGHT", "FINAL", "FIRST",
  "FIXED", "FLASH", "FLEET", "FLOOR", "FLUID", "FOCUS", "FORCE", "FORTH", "FORTY", "FORUM",
  "FOAMY", "FOUND", "FRAME", "FRANK", "FRAUD", "FRESH", "FRONT", "FRUIT", "FULLY", "FUNNY",
  "GIANT", "GIVEN", "GLASS", "GLOBE", "GOING", "GRACE", "GRADE", "GRAND", "GRANT", "GRASS",
  "GREAT", "GREEN", "GROSS", "GROUP", "GROWN", "GUARD", "GUESS", "GUEST", "GUIDE", "HAPPY",
  "HARRY", "HEART", "HEAVY", "HENCE", "HENRY", "HORSE", "HOTEL", "HOUSE", "HUMAN", "IDEAL",
  "IMAGE", "INDEX", "INNER", "INPUT", "ISSUE", "JAPAN", "JIMMY", "JOINT", "JONES", "JUDGE",
  "KNOWN", "LABEL", "LARGE", "LASER", "LATER", "LAUGH", "LAYER", "LEARN", "LEASE", "LEAST",
  "LEAVE", "LEGAL", "LEVEL", "LEWIS", "LIGHT", "LIMIT", "LINKS", "LIVES", "LOCAL", "LOGIC",
  "LOOSE", "LOWER", "LUCKY", "LUNCH", "LYING", "MAGIC", "MAJOR", "MAKER", "MARCH", "MARIA",
  "MATCH", "MAYBE", "MAYOR", "MEANT", "MEDIA", "METAL", "MIGHT", "MINOR", "MINUS", "MIXED",
  "MODEL", "MONEY", "MONTH", "MORAL", "MOTOR", "MOUNT", "MOUSE", "MOUTH", "MOVIE", "MUSIC",
  "NEEDS", "NEVER", "NEWLY", "NIGHT", "NOISE", "NORTH", "NOTED", "NOVEL", "NURSE", "OCCUR",
  "OCEAN", "OFFER", "OFTEN", "ORDER", "OTHER", "OUGHT", "PAINT", "PANEL", "PAPER", "PARTY",
  "PEACE", "PETER", "PHASE", "PHONE", "PHOTO", "PIECE", "PILOT", "PITCH", "PLACE", "PLAIN",
  "PLANE", "PLANT", "PLATE", "POINT", "POUND", "POWER", "PRESS", "PRICE", "PRIDE", "PRIME",
  "PRINT", "PRIOR", "PRIZE", "PROOF", "PROUD", "PROVE", "QUEEN", "QUICK", "QUIET", "QUITE",
  "RADIO", "RAISE", "RANGE", "RAPID", "RATIO", "REACH", "READY", "REFER", "RIGHT", "RIVAL",
  "RIVER", "ROBIN", "ROGER", "ROMAN", "ROUGH", "ROUND", "ROUTE", "ROYAL", "RURAL", "SCALE",
  "SCENE", "SCOPE", "SCORE", "SENSE", "SERVE", "SEVEN", "SHALL", "SHAPE", "SHARE", "SHARP",
  "SHEET", "SHELF", "SHELL", "SHIFT", "SHIRT", "SHOCK", "SHOOT", "SHORT", "SHOWN", "SIGHT",
  "SINCE", "SIXTH", "SIXTY", "SIZED", "SKILL", "SLEEP", "SLIDE", "SMALL", "SMART", "SMILE",
  "SMITH", "SMOKE", "SOLID", "SOLVE", "SORRY", "SOUND", "SOUTH", "SPACE", "SPARE", "SPEAK",
  "SPEED", "SPEND", "SPENT", "SPLIT", "SPOKE", "SPORT", "STAFF", "STAGE", "STAKE", "STAND",
  "START", "STATE", "STEAM", "STEEL", "STICK", "STILL", "STOCK", "STONE", "STOOD", "STORE",
  "STORM", "STORY", "STRIP", "STUCK", "STUDY", "STUFF", "STYLE", "SUGAR", "SUITE", "SUPER",
  "SWEET", "TABLE", "TAKEN", "TASTE", "TAXES", "TEACH", "TEETH", "TERRY", "TEXAS", "THANK",
  "THEFT", "THEIR", "THEME", "THERE", "THESE", "THICK", "THING", "THINK", "THIRD", "THOSE",
  "THREE", "THREW", "THROW", "TIGHT", "TIMES", "TIRED", "TITLE", "TODAY", "TOPIC", "TOTAL",
  "TOUCH", "TOUGH", "TOWER", "TRACK", "TRADE", "TRAIN", "TREAT", "TREND", "TRIAL", "TRIED",
  "TRIES", "TRUCK", "TRULY", "TRUST", "TRUTH", "TWICE", "UNDER", "UNDUE", "UNION", "UNITY",
  "UNTIL", "UPPER", "UPSET", "URBAN", "USAGE", "USUAL", "VALID", "VALUE", "VIDEO", "VIRUS",
  "VISIT", "VITAL", "VOICE", "WASTE", "WATCH", "WATER", "WHEEL", "WHERE", "WHICH", "WHILE",
  "WHITE", "WHOLE", "WHOSE", "WOMAN", "WOMEN", "WORLD", "WORRY", "WORSE", "WORST", "WORTH",
  "WOULD", "WOUND", "WRITE", "WRONG", "WROTE", "YIELD", "YOUNG", "YOUTH"
];

const API_URL = "https://dewordle.onrender.com/api/v1";

export function useGetWord() {
  return useMutation({
    mutationFn: () => API.get(`${API_URL}/words/daily`),    
  });
}

export function useValidateGuess() {
  return useMutation({
    mutationFn: async (guess) => {
      try {        
        // First try to validate with the API
        const response = await API.get(`${API_URL}/words/guess/${guess}`);              
        
        // Make sure we have a properly formatted hint
        let hint = response.data.hint;
        if (hint) {
          // Ensure we're working with the exact characters from the API
          if (typeof hint === 'string') {
            hint = Array.from(hint).join('');
          }
        }

        // If the API explicitly says the word is invalid
        if (response.data.valid === false) {
          return {
            data: {
              valid: false,
              word: guess
            }
          };
        }
        
        // If the API response indicates the word is correct
        if (response.data && response.data.correct === true) {
          return {
            data: {
              valid: true,
              correct: true,
              word: guess,
              hint: hint
            }
          };
        }
        
        // Check if the API returned a hint, which means it's a valid word
        // even if the word is not the correct one for the day
        if (response.data && hint) {
          return {
            data: {
              valid: true,
              word: guess,
              hint: hint
            }
          };
        }
        
        // If there's no hint but the response indicates it's valid in some way
        if (response.data && response.data.valid === true) {
          return response;
        }
        
        // If we get here, we have a response but no hint and no explicit valid flag
        // Treat this as an invalid word
        return {
          data: {
            valid: false,
            word: guess,
            message: "Not a valid dictionary word"
          }
        };
      } catch (error) {        
        // Log the error for debugging
        console.error(`API error for word "${guess}":`, error);
        
        // For API errors, check if it's a 404 (word not found) vs other errors
        if (error.response && error.response.status === 404) {
          return {
            data: {
              valid: false,
              word: guess,
              message: "Word not found in dictionary"
            }
          };
        }
        
        // For other types of errors, fallback to local validation
        const upperGuess = guess.toUpperCase();
        
        // Use our dictionary validator
        const validationResult = validateWord(upperGuess);
        const valid = validationResult.valid;
        
        // Return a similar structure to what the API would return
        return { 
          data: { 
            valid,
            word: guess,
            message: valid ? undefined : (validationResult.reason || "Not a valid word")
          } 
        };
      }
    },
  });
}
