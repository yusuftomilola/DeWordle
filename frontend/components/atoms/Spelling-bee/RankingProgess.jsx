import clsx from "clsx"

const rankingThresholds = {
    'Beginner': 0,
    'Good Start': 3,
    'Moving Up': 8,
    'Good': 14,
    'Solid': 25,
    'Nice': 42,
    'Great': 68,
    'Amazing': 85,
    'Genius': 118,
}

export default function RankingProgress({ className, score }) {
    const currentThreshold = getCurrentThreshold(score)

    return  (
        <div className={clsx("relative flex w-full", className)}>
            <div className="w-[100px] mr-4">{currentThreshold}</div>
            <div className="relative h-[28px] grow">
                <div className='absolute top-[13px] h-0 w-full border-b z-[-1]' />
                <div className="flex flex-row justify-between w-full items-center">
                    {Object.entries(rankingThresholds).map(renderThreshold)}
                </div>
            </div>
        </div>)

    function renderThreshold([label, minScore]) {
        const size = label === currentThreshold ? 'h-[28px] w-[28px]' : 'h-[14px] w-[14px]'
        const text = label === currentThreshold ? score : ''

        return <div key={label} className={clsx("rounded-full bg-yellow-200 text-center leading-7", size)}>{text}</div>
    }

    function getCurrentThreshold(score) {
        let output = 'Beginner'
        for(let threshold in rankingThresholds) {
            const minScore = rankingThresholds[threshold]

            if (score >= minScore) {
                output = threshold
            } else {
                break
            }
        }

        return output
    }
}