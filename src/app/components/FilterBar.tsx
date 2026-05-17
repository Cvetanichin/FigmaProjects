import { Filter } from 'lucide-react';

interface FilterBarProps {
  selectedDomain: string;
  onDomainChange: (domain: string) => void;
}

export function FilterBar({ selectedDomain, onDomainChange }: FilterBarProps) {
  const domains = ['all', 'CSO', 'AI', 'Personal'];

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-8">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-slate-700">
          <Filter className="w-4 h-4" />
          <span className="text-sm">Filter by Domain:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          {domains.map((domain) => (
            <button
              key={domain}
              onClick={() => onDomainChange(domain)}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                selectedDomain === domain
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {domain === 'all' ? 'All Domains' : domain}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
