import { ArrowLeft, Calendar, DollarSign, Users, TrendingUp, CheckCircle, Clock, AlertCircle, Target } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  domain: string;
  homeFolder: string;
  description: string;
  progress: number;
  status: string;
  indicators: {
    achieved: number;
    onTrack: number;
    inProgress: number;
    behind: number;
    total: number;
  };
  nextMilestone: string;
  milestoneDate: string;
  stakeholders: number;
  budget: number;
  spent: number;
  startDate: string;
  endDate: string;
  color: string;
}

interface ProjectOverviewProps {
  project: Project;
  onBack: () => void;
}

export function ProjectOverview({ project, onBack }: ProjectOverviewProps) {
  const budgetUtilization = Math.round((project.spent / project.budget) * 100);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-[1600px] mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Projects</span>
          </button>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h1 className="text-4xl text-slate-900">{project.name}</h1>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm">
                  {project.domain}
                </span>
              </div>
              <p className="text-lg text-slate-600 mb-4">{project.description}</p>
              <div className="text-sm text-slate-500">
                <span className="inline-block mr-4">
                  <strong>Start:</strong> {formatDate(project.startDate)}
                </span>
                <span className="inline-block">
                  <strong>End:</strong> {formatDate(project.endDate)}
                </span>
              </div>
              <div className="text-sm text-slate-500 mt-2">
                <strong>Path:</strong> {project.homeFolder}
              </div>
            </div>

            <div className="lg:min-w-[250px]">
              <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                <div className="text-5xl text-slate-900 mb-2">{project.progress}%</div>
                <div className="text-sm text-slate-600 uppercase tracking-wide mb-4">Overall Progress</div>
                <div className="w-full bg-white rounded-full h-3 shadow-inner">
                  <div
                    className="h-3 rounded-full transition-all shadow-sm"
                    style={{ width: `${project.progress}%`, backgroundColor: project.color }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600 uppercase tracking-wide">Budget</div>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl text-slate-900 mb-1">{formatCurrency(project.budget)}</div>
            <div className="text-xs text-slate-500">Total allocation</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600 uppercase tracking-wide">Spent</div>
              <TrendingUp className="w-5 h-5 text-orange-500" />
            </div>
            <div className="text-2xl text-slate-900 mb-1">{formatCurrency(project.spent)}</div>
            <div className="text-xs text-slate-500">{budgetUtilization}% utilized</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600 uppercase tracking-wide">Stakeholders</div>
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl text-slate-900 mb-1">{project.stakeholders}</div>
            <div className="text-xs text-slate-500">Active participants</div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm text-slate-600 uppercase tracking-wide">Next Milestone</div>
              <Calendar className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-lg text-slate-900 mb-1 line-clamp-1">{project.nextMilestone}</div>
            <div className="text-xs text-slate-500">{project.milestoneDate}</div>
          </div>
        </div>

        {/* Indicators Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-slate-900">Performance Indicators</h2>
            <div className="text-sm text-slate-600">
              {project.indicators.achieved} of {project.indicators.total} achieved
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-green-50 rounded-xl p-6 border-l-4 border-green-500">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div className="text-sm text-green-800 uppercase tracking-wide">Achieved</div>
              </div>
              <div className="text-4xl text-green-900 mb-1">{project.indicators.achieved}</div>
              <div className="text-xs text-green-700">Targets met</div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-blue-600" />
                <div className="text-sm text-blue-800 uppercase tracking-wide">On Track</div>
              </div>
              <div className="text-4xl text-blue-900 mb-1">{project.indicators.onTrack}</div>
              <div className="text-xs text-blue-700">Meeting schedule</div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-6 border-l-4 border-yellow-500">
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-yellow-600" />
                <div className="text-sm text-yellow-800 uppercase tracking-wide">In Progress</div>
              </div>
              <div className="text-4xl text-yellow-900 mb-1">{project.indicators.inProgress}</div>
              <div className="text-xs text-yellow-700">Active work</div>
            </div>

            <div className="bg-red-50 rounded-xl p-6 border-l-4 border-red-500">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
                <div className="text-sm text-red-800 uppercase tracking-wide">Behind</div>
              </div>
              <div className="text-4xl text-red-900 mb-1">{project.indicators.behind}</div>
              <div className="text-xs text-red-700">Need attention</div>
            </div>
          </div>

          {/* Progress Bar Breakdown */}
          <div className="mt-8">
            <div className="text-sm text-slate-600 mb-3">Indicator Distribution</div>
            <div className="flex w-full h-6 rounded-full overflow-hidden shadow-inner">
              <div
                className="bg-green-500 flex items-center justify-center text-white text-xs"
                style={{ width: `${(project.indicators.achieved / project.indicators.total) * 100}%` }}
              >
                {project.indicators.achieved > 0 && project.indicators.achieved}
              </div>
              <div
                className="bg-blue-500 flex items-center justify-center text-white text-xs"
                style={{ width: `${(project.indicators.onTrack / project.indicators.total) * 100}%` }}
              >
                {project.indicators.onTrack > 0 && project.indicators.onTrack}
              </div>
              <div
                className="bg-yellow-500 flex items-center justify-center text-white text-xs"
                style={{ width: `${(project.indicators.inProgress / project.indicators.total) * 100}%` }}
              >
                {project.indicators.inProgress > 0 && project.indicators.inProgress}
              </div>
              <div
                className="bg-red-500 flex items-center justify-center text-white text-xs"
                style={{ width: `${(project.indicators.behind / project.indicators.total) * 100}%` }}
              >
                {project.indicators.behind > 0 && project.indicators.behind}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>Achieved: {Math.round((project.indicators.achieved / project.indicators.total) * 100)}%</span>
              <span>On Track: {Math.round((project.indicators.onTrack / project.indicators.total) * 100)}%</span>
              <span>In Progress: {Math.round((project.indicators.inProgress / project.indicators.total) * 100)}%</span>
              <span>Behind: {Math.round((project.indicators.behind / project.indicators.total) * 100)}%</span>
            </div>
          </div>
        </div>

        {/* Budget Visualization */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl text-slate-900 mb-6">Budget Overview</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-600">Budget Utilization</span>
                  <span className="text-sm text-slate-900">{budgetUtilization}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-6 shadow-inner">
                  <div
                    className="h-6 rounded-full transition-all shadow-sm flex items-center justify-end px-3 text-white text-xs"
                    style={{
                      width: `${budgetUtilization}%`,
                      backgroundColor: budgetUtilization > 90 ? '#ef4444' : budgetUtilization > 70 ? '#f59e0b' : '#10b981'
                    }}
                  >
                    {budgetUtilization}%
                  </div>
                </div>
              </div>

              <div className="space-y-3 mt-6">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-sm text-slate-700">Total Budget</span>
                  <span className="text-lg text-slate-900">{formatCurrency(project.budget)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <span className="text-sm text-slate-700">Amount Spent</span>
                  <span className="text-lg text-slate-900">{formatCurrency(project.spent)}</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm text-slate-700">Remaining</span>
                  <span className="text-lg text-slate-900">{formatCurrency(project.budget - project.spent)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="w-48 h-48 mx-auto mb-6 relative">
                  <svg viewBox="0 0 100 100" className="transform -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#e2e8f0"
                      strokeWidth="12"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={project.color}
                      strokeWidth="12"
                      strokeDasharray={`${budgetUtilization * 2.51} ${251 - budgetUtilization * 2.51}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div>
                      <div className="text-3xl text-slate-900">{budgetUtilization}%</div>
                      <div className="text-xs text-slate-600">Utilized</div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-600">
                  {project.budget - project.spent > 0
                    ? `${formatCurrency(project.budget - project.spent)} remaining for project activities`
                    : 'Budget fully utilized'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
