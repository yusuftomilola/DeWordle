import clsx from "clsx";
import { useCallback } from "react";

export default function CurrentWord({ centerLetter, word, textColor }) {

    return <div className="text-4xl font-bold h-12 tracking-wider text-indigo-900 ">
        {word.split('').map((letter, index) => (
        <span key={index} className={clsx(textColor, {'text-yellow-500': letter === centerLetter && !textColor })}>
            {letter.toUpperCase()}
        </span>
        ))}
    </div>
}