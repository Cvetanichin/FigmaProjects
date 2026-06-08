export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      clients: { Row: Client; Insert: Omit<Client, 'id' | 'created_at'>; Update: Partial<Client> }
      projects: { Row: Project; Insert: Omit<Project, 'id' | 'created_at'>; Update: Partial<Project> }
      project_documents: { Row: ProjectDocument; Insert: Omit<ProjectDocument, 'id' | 'created_at'>; Update: Partial<ProjectDocument> }
      activities: { Row: Activity; Insert: Omit<Activity, 'id' | 'created_at'>; Update: Partial<Activity> }
      deliverables: { Row: Deliverable; Insert: Omit<Deliverable, 'id' | 'created_at'>; Update: Partial<Deliverable> }
      indicators: { Row: Indicator; Insert: Omit<Indicator, 'id' | 'created_at'>; Update: Partial<Indicator> }
      risks: { Row: Risk; Insert: Omit<Risk, 'id' | 'created_at'>; Update: Partial<Risk> }
      reports: { Row: Report; Insert: Omit<Report, 'id' | 'created_at'>; Update: Partial<Report> }
      ai_agents: { Row: AIAgent; Insert: Omit<AIAgent, 'id'>; Update: Partial<AIAgent> }
      prompt_modules: { Row: PromptModule; Insert: Omit<PromptModule, 'id'>; Update: Partial<PromptModule> }
      agent_runs: { Row: AgentRun; Insert: Omit<AgentRun, 'id' | 'created_at'>; Update: Partial<AgentRun> }
    }
  }
}

export interface Client {
  id: string
  created_at: string
  name: string
  country: string | null
  contact_email: string | null
}

export interface Project {
  id: string
  created_at: string
  client_id: string | null
  name: string
  description: string | null
  domain: string | null
  status: string
  start_date: string | null
  end_date: string | null
  budget_total: number | null
  budget_spent: number
  donor: string | null
  grant_reference: string | null
  created_by: string | null
}

export interface ProjectDocument {
  id: string
  created_at: string
  project_id: string
  name: string
  category: string | null
  file_path: string | null
  file_size: number | null
  mime_type: string | null
  uploaded_by: string | null
}

export interface Activity {
  id: string
  created_at: string
  project_id: string
  title: string
  description: string | null
  output: string | null
  start_date: string | null
  end_date: string | null
  status: string
  responsible: string | null
}

export interface Deliverable {
  id: string
  created_at: string
  project_id: string
  activity_id: string | null
  title: string
  due_date: string | null
  status: string
  notes: string | null
}

export interface Indicator {
  id: string
  created_at: string
  project_id: string
  name: string
  level: string | null
  unit: string | null
  baseline: number | null
  target: number | null
  actual: number | null
  data_source: string | null
  collection_method: string | null
  frequency: string | null
  responsible: string | null
  status: string | null
}

export interface Risk {
  id: string
  created_at: string
  project_id: string
  title: string
  description: string | null
  category: string | null
  likelihood: string | null
  impact: string | null
  risk_level: string | null
  mitigation: string | null
  owner: string | null
  status: string
}

export interface Report {
  id: string
  created_at: string
  project_id: string
  title: string
  report_type: string | null
  content: string | null
  generated_by: string | null
  period_start: string | null
  period_end: string | null
}

export interface AIAgent {
  id: string
  name: string
  slug: string
  description: string | null
  edge_function: string
}

export interface PromptModule {
  id: string
  agent_id: string | null
  name: string
  content: string
  version: number
}

export interface AgentRun {
  id: string
  created_at: string
  project_id: string
  agent_id: string | null
  status: string
  input_data: Json | null
  output_data: Json | null
  error_message: string | null
  report_id: string | null
  triggered_by: string | null
}
