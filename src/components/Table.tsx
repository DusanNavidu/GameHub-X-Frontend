import type { ReactNode } from "react";

interface TableProps {
  headers: string[];
  children: ReactNode;
}

export default function Table({ headers, children }: TableProps) {
  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-2xl backdrop-blur-sm overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="bg-black/60 border-b border-green-500/20 text-xs text-gray-400 uppercase tracking-widest font-mono">
              {headers.map((header, index) => (
                <th
                  key={index}
                  className={`p-4 font-bold ${index === headers.length - 1 ? "text-right" : ""}`}
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-sm">{children}</tbody>
        </table>
      </div>
    </div>
  );
}
