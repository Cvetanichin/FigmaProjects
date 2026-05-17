import { TrendingUp, CheckCircle, DollarSign, FolderKanban } from 'lucide-react';

interface StatsCardsProps {
  totalProjects: number;
  avgProgress: number;
  onTrackCount: number;
  totalBudget: number;
  totalSpent: number;
}

export function StatsCards({
  totalProjects,
  avgProgress,
  onTrackCount,
  totalBudget,
  totalSpent
}: StatsCardsProps) {
  const budgetUtilization = Math.round((totalSpent / totalBudget) * 100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-600 uppercase tracking-wide">Total Projects</div>
          <FolderKanban className="w-5 h-5 text-blue-500" />
        </div>
        <div className="text-3xl text-slate-900 mb-1">{totalProjects}</div>
        <div className="text-xs text-slate-500">Active portfolio</div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-600 uppercase tracking-wide">Avg Progress</div>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <div className="text-3xl text-slate-900 mb-1">{avgProgress}%</div>
        <div className="text-xs text-slate-500">Portfolio-wide completion</div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-600 uppercase tracking-wide">On Track</div>
          <CheckCircle className="w-5 h-5 text-purple-500" />
        </div>
        <div className="text-3xl text-slate-900 mb-1">{onTrackCount}/{totalProjects}</div>
        <div className="text-xs text-slate-500">Meeting targets</div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-slate-600 uppercase tracking-wide">Budget Usage</div>
          <DollarSign className="w-5 h-5 text-orange-500" />
        </div>
        <div className="text-3xl text-slate-900 mb-1">{budgetUtilization}%</div>
        <div className="text-xs text-slate-500">${(totalSpent / 1000).toFixed(0)}K of ${(totalBudget / 1000).toFixed(0)}K</div>
      </div>
    </div>
  );
}
