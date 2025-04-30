import { useCallback, useState } from "react";

export default function useLetters() {

    const [isLoaded, setIsLoaded] = useState(false)
    const [centerLetter, setCenterLetter] = useState('');
    const [outerLetters, setOuterLetters] = useState([]);

    const load = useCallback(async function() {
        // @TODO retrieve letters from API
        setCenterLetter('p')
        setOuterLetters([
            'o',
            'i',
            'n',
            'a',
            'c',
            't',
        ])

        setIsLoaded (true)
    }, [setCenterLetter, setOuterLetters])

    return {
        centerLetter,
        outerLetters,
        load,
        alphabet: [centerLetter, ...outerLetters]
    }
}