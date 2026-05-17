import { useState } from 'react';
import { ProjectOverview } from './components/ProjectOverview';
import { ProjectCard } from './components/ProjectCard';
import { FilterBar } from './components/FilterBar';
import { StatsCards } from './components/StatsCards';
import { LayoutGrid, List } from 'lucide-react';

const projectsData = [
  {
    id: 'hera',
    name: 'HERA',
    domain: 'CSO',
    homeFolder: '01_CSO-Consultancy/Projects/HERA/',
    description: 'Building a Community of Human Rights Defenders to Promote Gender Equality',
    progress: 68,
    status: 'on-track',
    indicators: {
      achieved: 8,
      onTrack: 7,
      inProgress: 3,
      behind: 2,
      total: 20
    },
    nextMilestone: 'CBS Services Launch',
    milestoneDate: 'Feb 2026',
    stakeholders: 60,
    budget: 450000,
    spent: 180000,
    startDate: '2025-01-01',
    endDate: '2027-06-30',
    color: '#5B8A5A'
  },
  {
    id: 'funding-dashboard',
    name: 'Funding Dashboard',
    domain: 'AI',
    homeFolder: '02_AI/Projects/FundingDashboard/',
    description: 'AI-powered funding opportunity tracking and analysis platform',
    progress: 75,
    status: 'on-track',
    indicators: {
      achieved: 12,
      onTrack: 5,
      inProgress: 2,
      behind: 1,
      total: 20
    },
    nextMilestone: 'Beta Release',
    milestoneDate: 'Jun 2026',
    stakeholders: 25,
    budget: 120000,
    spent: 65000,
    startDate: '2025-03-15',
    endDate: '2026-12-31',
    color: '#3498db'
  },
  {
    id: 'aiwork',
    name: 'AI at Work Academy',
    domain: 'AI',
    homeFolder: '02_AI/Learning/AIatWorkAcademy/',
    description: 'Corporate training program for AI adoption and implementation',
    progress: 42,
    status: 'in-progress',
    indicators: {
      achieved: 6,
      onTrack: 8,
      inProgress: 4,
      behind: 2,
      total: 20
    },
    nextMilestone: 'Module 3 Launch',
    milestoneDate: 'Aug 2026',
    stakeholders: 150,
    budget: 280000,
    spent: 85000,
    startDate: '2025-05-01',
    endDate: '2027-04-30',
    color: '#9b59b6'
  },
  {
    id: 'familynest',
    name: 'Family Nest',
    domain: 'AI',
    homeFolder: '02_AI/Apps/FamilyNest/',
    description: 'AI-assisted family organization and communication platform',
    progress: 88,
    status: 'ahead',
    indicators: {
      achieved: 15,
      onTrack: 3,
      inProgress: 1,
      behind: 0,
      total: 19
    },
    nextMilestone: 'Public Launch',
    milestoneDate: 'May 2026',
    stakeholders: 12,
    budget: 95000,
    spent: 78000,
    startDate: '2024-11-01',
    endDate: '2026-06-30',
    color: '#e74c3c'
  },
  {
    id: 'careerpath',
    name: 'Career Path',
    domain: 'Personal',
    homeFolder: '03_Personal/Docs/CareerPath/',
    description: 'Professional development and career progression planning',
    progress: 35,
    status: 'in-progress',
    indicators: {
      achieved: 3,
      onTrack: 6,
      inProgress: 5,
      behind: 1,
      total: 15
    },
    nextMilestone: 'Q2 Review',
    milestoneDate: 'Jun 2026',
    stakeholders: 5,
    budget: 25000,
    spent: 8000,
    startDate: '2025-01-15',
    endDate: '2026-12-31',
    color: '#f39c12'
  }
];

export default function App() {
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const filteredProjects = selectedDomain === 'all'
    ? projectsData
    : projectsData.filter(p => p.domain === selectedDomain);

  const totalProjects = filteredProjects.length;
  const avgProgress = Math.round(
    filteredProjects.reduce((sum, p) => sum + p.progress, 0) / totalProjects
  );
  const onTrackCount = filteredProjects.filter(p =>
    p.status === 'on-track' || p.status === 'ahead'
  ).length;
  const totalBudget = filteredProjects.reduce((sum, p) => sum + p.budget, 0);
  const totalSpent = filteredProjects.reduce((sum, p) => sum + p.spent, 0);

  if (selectedProject) {
    const project = projectsData.find(p => p.id === selectedProject);
    if (project) {
      return (
        <ProjectOverview
          project={project}
          onBack={() => setSelectedProject(null)}
        />
      );
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-[1600px] mx-auto p-6 md:p-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl mb-2 text-slate-900">Project Progress Tracker</h1>
              <p className="text-lg text-slate-600">Consultancy Dashboard</p>
              <p className="text-sm text-slate-500 mt-2">Last Updated: May 17, 2026</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <StatsCards
          totalProjects={totalProjects}
          avgProgress={avgProgress}
          onTrackCount={onTrackCount}
          totalBudget={totalBudget}
          totalSpent={totalSpent}
        />

        {/* Filter Bar */}
        <FilterBar
          selectedDomain={selectedDomain}
          onDomainChange={setSelectedDomain}
        />

        {/* Projects Grid/List */}
        <div className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
            : 'flex flex-col gap-4'
        }>
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              onClick={() => setSelectedProject(project.id)}
            />
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <p className="text-slate-500 text-lg">No projects found for the selected domain.</p>
          </div>
        )}
      </div>
    </div>
  );
}
