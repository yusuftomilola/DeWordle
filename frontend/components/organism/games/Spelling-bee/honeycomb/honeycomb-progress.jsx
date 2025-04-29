export default function HoneycombProgress({
  level = 'Beginner',
  progress = 1,
}) {
  return (
    <div className="w-full max-w-3xl mx-auto py-4 px-6 flex items-center gap-4">
      <span className="text-sm font-medium">{level}</span>
      <div className="relative flex-1 h-1 bg-gray-200 rounded-full">
        <div className="absolute flex items-center justify-center w-6 h-6 bg-yellow-400 rounded-full text-xs font-bold -top-2.5 -left-1">
          {progress}
        </div>
        <div className="absolute w-full h-full flex items-center justify-between px-6">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="w-2 h-2 bg-gray-300 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
