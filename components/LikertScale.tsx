'use client';

interface LikertScaleProps {
  question: string;
  subtext?: string;
  anchorLeft: string;
  anchorRight: string;
  value: number | null;
  onChange: (v: number) => void;
}

export default function LikertScale({ question, subtext, anchorLeft, anchorRight, value, onChange }: LikertScaleProps) {
  return (
    <div className="w-full">
      <p className="text-sm font-medium text-gray-800 mb-1">{question}</p>
      {subtext && <p className="text-xs text-gray-500 mb-3">{subtext}</p>}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-20 text-right shrink-0">{anchorLeft}</span>
        <div className="flex gap-3 flex-1 justify-center">
          {[1, 2, 3, 4, 5].map(n => (
            <label key={n} className="flex flex-col items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name={question}
                value={n}
                checked={value === n}
                onChange={() => onChange(n)}
                className="w-5 h-5 accent-blue-600 cursor-pointer"
              />
              <span className="text-xs text-gray-600">{n}</span>
            </label>
          ))}
        </div>
        <span className="text-xs text-gray-500 w-20 shrink-0">{anchorRight}</span>
      </div>
    </div>
  );
}
