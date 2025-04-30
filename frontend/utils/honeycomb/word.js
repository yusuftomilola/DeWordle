export function canSendWord(word, { mandatoryLetter, blacklistWords }) {
    return word.length >= 4 && word.includes(mandatoryLetter) && !blacklistWords.includes(word) 
}
