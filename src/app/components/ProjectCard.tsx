import { Calendar, Users, TrendingUp, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  domain: string;
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
  color: string;
}

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  onClick: () => void;
}

export function ProjectCard({ project, viewMode, onClick }: ProjectCardProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ahead':
        return {
          badge: 'bg-green-100 text-green-800',
          icon: TrendingUp,
          label: 'Ahead of Schedule'
        };
      case 'on-track':
        return {
          badge: 'bg-blue-100 text-blue-800',
          icon: CheckCircle,
          label: 'On Track'
        };
      case 'in-progress':
        return {
          badge: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          label: 'In Progress'
        };
      case 'behind':
        return {
          badge: 'bg-red-100 text-red-800',
          icon: AlertCircle,
          label: 'Behind Schedule'
        };
      default:
        return {
          badge: 'bg-gray-100 text-gray-800',
          icon: Clock,
          label: 'In Progress'
        };
    }
  };

  const statusConfig = getStatusConfig(project.status);
  const StatusIcon = statusConfig.icon;

  if (viewMode === 'list') {
    return (
      <div
        onClick={onClick}
        className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer p-6 border-l-4"
        style={{ borderLeftColor: project.color }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl text-slate-900">{project.name}</h3>
              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
                {project.domain}
              </span>
            </div>
            <p className="text-slate-600 mb-3">{project.description}</p>
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{project.stakeholders} stakeholders</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{project.nextMilestone}: {project.milestoneDate}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3 min-w-[200px]">
            <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${statusConfig.badge}`}>
              <StatusIcon className="w-4 h-4" />
              <span>{statusConfig.label}</span>
            </div>
            <div className="text-right">
              <div className="text-3xl text-slate-900 mb-1">{project.progress}%</div>
              <div className="text-xs text-slate-500">Overall Progress</div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${project.progress}%`, backgroundColor: project.color }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer overflow-hidden"
    >
      <div className="h-2" style={{ backgroundColor: project.color }} />

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl text-slate-900 mb-1">{project.name}</h3>
            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded-full text-xs">
              {project.domain}
            </span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${statusConfig.badge}`}>
            <StatusIcon className="w-3 h-3" />
            <span>{statusConfig.label}</span>
          </div>
        </div>

        <p className="text-slate-600 text-sm mb-4 line-clamp-2">{project.description}</p>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">Progress</span>
            <span className="text-sm text-slate-900">{project.progress}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${project.progress}%`, backgroundColor: project.color }}
            />
          </div>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>{project.indicators.achieved} indicators achieved</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600" />
            <span>{project.stakeholders} stakeholders</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600" />
            <span className="truncate">{project.nextMilestone}</span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500">Next: {project.milestoneDate}</div>
        </div>
      </div>
    </div>
  );
}
