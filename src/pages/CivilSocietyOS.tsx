import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// ==========================================
// SEED DATA: 2026 CSO FUNDING OPPORTUNITIES REGISTER
// ==========================================
const INITIAL_GRANTS = [
  { id: 'grant-2026-01', title: "Support to Human Rights Defenders and Civic Space in the Western Balkans", donor: "European Commission - DG NEAR (IPA III)", portal: "EU Funding & Tenders Portal", budget: 1200000, thematicFocus: "Human Rights", region: "Western Balkans", deadline: "2026-09-15", status: "Open", link: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities/topic-search", description: "Strengthening the resilience of local human rights defenders, anti-discrimination watchdogs, and community coalitions against civic harassment." },
  { id: 'grant-2026-02', title: "European Youth Foundation (EYF) - Annual Work Plan Grants 2026", donor: "Council of Europe", portal: "Council of Europe Youth Department", budget: 50000, thematicFocus: "Youth", region: "Europe", deadline: "2026-10-01", status: "Open", link: "https://www.coe.int/en/web/european-youth-foundation/grants", description: "Funding civil society youth organizations hosting international cooperation and human rights non-formal education tracks." },
  { id: 'grant-2026-03', title: "Direct Support to Independent Civil Society Initiatives & Democratic Resilience", donor: "European Endowment for Democracy (EED)", portal: "EED Grants Management System", budget: 150000, thematicFocus: "Civic Space", region: "Western Balkans", deadline: "2026-12-31", status: "Open", link: "https://www.democracyendowment.eu/en/apply-for-support.html", description: "Unearmarked, rolling application mechanism supporting grassroots actors, online activists, and community-based advocacy groups operating under tight civic constraints." },
  { id: 'grant-2026-04', title: "Strengthening Democratic Institutions and Civic Engagement in Macedonia", donor: "Balkan Trust for Democracy (BTD)", portal: "GMFUS Balkan Platform", budget: 35000, thematicFocus: "Governance", region: "North Macedonia", deadline: "2026-07-20", status: "Open", link: "https://www.gmfus.org/balkan-trust-democracy", description: "Rapid-response grants aimed at monitoring administrative transparency, supporting municipal oversight, and promoting legal accountability." },
  { id: 'grant-2026-05', title: "Town Twinning & Networks of Towns: Civic Democratic Participation", donor: "European Commission - CERV Programme", portal: "EU Funding & Tenders Portal", budget: 250000, thematicFocus: "Governance", region: "EU & Associated States", deadline: "2026-11-12", status: "Upcoming", link: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/programmes/cerv", description: "Encouraging regional and cross-border cooperation on democratic citizenship, history, and community resilience panels." },
  { id: 'grant-2026-06', title: "Active Citizens Fund - Support to Vulnerable Groups and Gender Equality", donor: "EEA and Norway Grants", portal: "ACF North Macedonia Platform", budget: 75000, thematicFocus: "Human Rights", region: "North Macedonia", deadline: "2026-08-30", status: "Open", link: "https://activecitizensfund.mk", description: "Supporting structural advocacy campaigns promoting systemic gender equality, LGBTI access to local social services, and anti-hate speech networks." },
  { id: 'grant-2026-07', title: "Human Rights Education and Democratic Citizenship Youth Interventions", donor: "Council of Europe", portal: "Council of Europe Youth Department", budget: 25000, thematicFocus: "Youth", region: "Europe", deadline: "2026-09-01", status: "Upcoming", link: "https://www.coe.int/en/web/youth", description: "Pilot activity grants supporting localized civic workshops promoting gender tolerance and non-discriminatory education models." },
  { id: 'grant-2026-08', title: "Visegrad + Grants: Democratic Accountability and Western Balkan Inclusion", donor: "Visegrad Fund", portal: "International Visegrad Portal", budget: 60000, thematicFocus: "Governance", region: "Western Balkans", deadline: "2026-10-15", status: "Open", link: "https://www.visegradfund.org/apply/grants/v4-grants/", description: "Facilitating policy transfer, cross-border analysis, and civil society capability exchanges between V4 nations and Western Balkan partners." },
  { id: 'grant-2026-09', title: "Re-evaluating Democratic Governance and Citizen Engagement Models", donor: "European Commission - Horizon Europe", portal: "EU Funding & Tenders Portal", budget: 3000000, thematicFocus: "Governance", region: "Global", deadline: "2026-12-10", status: "Upcoming", link: "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/home", description: "Large-scale consortia projects mapping civic tech innovation, combating regional disinformation, and enhancing deliberative democracy models." },
  { id: 'grant-2026-10', title: "Local Community Advocacy for Decarbonization and Climate Justice", donor: "European Climate Foundation", portal: "ECF Grants Portal", budget: 120000, thematicFocus: "Environment", region: "Europe", deadline: "2026-11-05", status: "Open", link: "https://europeanclimate.org/grants/", description: "Grassroots organizing and legal advocacy aiming to monitor carbon transition compliance and protect green spaces from speculative municipal developments." }
]

const INITIAL_PROJECT_METADATA = {
  title: "HERA - Building a Community of Human Rights Defenders",
  leadOrganization: "HERA - Health Education and Research Association",
  partnerOrganization: "Civic Coalition for Human Rights",
  contractNumber: "EuropeAid/180645/DD/ACT/MK/04",
  donor: "European Commission - Thematic Programme on Human Rights and Democracy",
  country: "North Macedonia",
  startDate: "2026-01-01",
  endDate: "2028-06-30",
  durationMonths: 30,
  totalBudget: 345000,
  reportingPeriod: "Month 1 - Month 6 (Inception Phase)"
}

const INITIAL_INDICATORS = [
  { id: 'ind-1', level: 'IMPACT', code: 'IMP.1', description: 'Percentage shift in social attitudes and public awareness regarding human rights of vulnerable groups, women, girls, and LGBTI persons.', baseline: '25%', target: '60%', current: '32%', progress: 20, verification: 'Annual Independent Survey', frequency: 'Annual', status: 'In Progress' },
  { id: 'ind-2', level: 'OUTCOME 1', code: 'OC1.1', description: 'Number of active media partnerships established with major regional media houses and networks.', baseline: '0', target: '8 partnerships', current: '5 partnerships', progress: 62.5, verification: 'Memorandums of Cooperation', frequency: 'Quarterly', status: 'On Track' },
  { id: 'ind-3', level: 'OUTCOME 1', code: 'OC1.2', description: 'Total aggregate reach of investigative human rights reports published across partnered media.', baseline: '10,000', target: '400,000', current: '142,000', progress: 35.5, verification: 'Google Analytics & Reach Reports', frequency: 'Monthly', status: 'In Progress' },
  { id: 'ind-4', level: 'OUTCOME 2', code: 'OC2.1', description: 'Number of Constitutional Court judges and judicial helpers trained on international gender and LGBTI human rights standards.', baseline: '0', target: '30 Judges/Helpers', current: '12 Judges/Helpers', progress: 40, verification: 'Training Attendance Logs', frequency: 'Bi-Annual', status: 'On Track' },
  { id: 'ind-5', level: 'OUTCOME 3', code: 'OC3.1', description: 'Municipal community-based human rights support services operationalized in target underserved regions.', baseline: '0', target: '4 Centers', current: '1 Center', progress: 25, verification: 'Operational Licences & Service Logs', frequency: 'Quarterly', status: 'Attention Needed' },
  { id: 'ind-6', level: 'OUTPUT 1.1', code: 'OP1.1.1', description: 'Journalists successfully completing the customized gender-sensitive human rights reporting mentorship.', baseline: '0', target: '40 Journalists', current: '42 Journalists', progress: 100, verification: 'Certificate Register', frequency: 'One-time', status: 'Achieved' },
  { id: 'ind-7', level: 'OUTPUT 2.1', code: 'OP2.1.1', description: 'Drafting and publication of the "Constitutional Court Case-Law Toolkit on Non-Discrimination".', baseline: 'None', target: '1 Toolkit', current: 'Draft Complete', progress: 80, verification: 'Published Toolkit Document', frequency: 'One-time', status: 'On Track' }
]

const INITIAL_RISKS = [
  { id: 'risk-1', category: 'Social/Political', description: 'Conservative backlash and coordinated online smear campaigns targeting activities related to LGBTI rights and comprehensive sexual education.', likelihood: 'High', impact: 'High', riskLevel: 'Critical', mitigation: 'Develop robust cyber-security and communications protocol, establish close partnerships with human rights ombudsman, and run targeted, low-profile focus group dialogues.', owner: 'Executive Director', status: 'Active' },
  { id: 'risk-2', category: 'Political/Regulatory', description: 'Delayed regulatory clearances and bureaucratic blockages by municipal administrations in conservative-dominated areas for establishing local services.', likelihood: 'Medium', impact: 'High', riskLevel: 'High', mitigation: 'Engage municipal civil servants at technical levels rather than purely political levels, framing community support in terms of social protection rather than ideological rights.', owner: 'Project Coordinator', status: 'Active' },
  { id: 'risk-3', category: 'Media Coverage', description: 'Misinterpretation or sensationalist reporting by mainstream media channels resulting in security risks for trained defenders.', likelihood: 'Medium', impact: 'Medium', riskLevel: 'Medium', mitigation: 'Establish clear press-release guidelines, pre-brief trusted journalists, and conduct pre-training sensitive briefings for editors.', owner: 'Media Officer', status: 'Active' },
  { id: 'risk-4', category: 'Financial', description: 'Fluctuations in exchange rates or rapid inflation in local operational costs exceeding pre-approved EU budget lines.', likelihood: 'Low', impact: 'Medium', riskLevel: 'Low', mitigation: 'Maintain strict financial forecast schedules, group procurement where possible, and negotiate contingency adjustments within the allowable 15% budget reallocation thresholds.', owner: 'Finance & Admin Officer', status: 'Monitored' }
]

const INITIAL_BUDGET_LINES = [
  { id: 'b-1', heading: '1. Human Resources', code: '1.1.1', description: 'Technical Expert / M&E Coordinator', unit: 'Month', quantity: 30, unitValue: 1200, totalCost: 36000, justification: 'Essential for developing and coordinating the Logical Framework metrics, verifying data quality, drafting compliance-ready donor progress reports, and guiding target evaluation structures across all 4 work packages.' },
  { id: 'b-2', heading: '1. Human Resources', code: '1.1.2', description: 'Project Coordinator (Full-time)', unit: 'Month', quantity: 30, unitValue: 1500, totalCost: 45000, justification: 'Oversees day-to-day coordination, manages relationship with European Commission representatives, supervises work package leads, and ensures all project deliverables match EU compliance standards.' },
  { id: 'b-3', heading: '3. Equipment & Supplies', code: '3.2.1', description: 'IT Infrastructure & Digital Workspace Tools', unit: 'Package', quantity: 1, unitValue: 4500, totalCost: 4500, justification: 'Required for secure storage of sensitive beneficiary data, coordinating project materials across partners, and hosting the cloud-based collaborative M&E dashboard.' },
  { id: 'b-4', heading: '5. Other costs, services', code: '5.1.1', description: 'Constitutional Court Case-Law Toolkit Publication', unit: 'Document', quantity: 1, unitValue: 6000, totalCost: 6000, justification: 'Covers professional legal translation, graphic design, proofreading, and publishing costs of the Toolkit to guarantee its accessibility to judges and civil legal assistance agencies.' }
]

const PROMPT_TEMPLATES = [
  { id: 'p-concept-note', category: 'Annex A1: Concept Note', name: 'Annex A1: Section 1.1 Relevance of Action', description: 'Generates EuropeAid Annex A1-compliant relevance statements connecting community needs with EU strategic human rights lots.', systemInstruction: 'You are a Senior EU Proposal Writer and Director of Cvetanichin Consultancy. Write in a formal, evidence-based, donor-compliant tone. Rely on clear data indicators, policy references (like the EU Gender Equality Strategy or EU Human Rights Action Plans), and structural cohesion. Format output in clear markdown with bold headers.', userPrompt: 'Draft the Relevance of the Action for [Project Title] addressing the target groups and direct beneficiaries in North Macedonia. Elaborate on structural problems, target group needs, and the specific EU funding lot relevance.' },
  { id: 'p-a2-description', category: 'Annex A2: Full Application', name: 'Annex A2: Sec 1.1 Detailed Description', description: 'Builds a complete, rigorous Section 1.1 narrative mapping Work Packages, target group parameters, outputs, and clear activities.', systemInstruction: 'You are the Lead Project Architect at Cvetanichin Consultancy. Write in a formal, structured, highly professional, and precise EuropeAid-compliant style. Structure your response into clear Work Packages with distinct, numbered activities, and explicit target beneficiary disaggregation. Use markdown formatting with bold headers and bullet points.', userPrompt: 'Generate Section 1.1 "Description of the Action" for: [Project Title]. Focus on breaking down Work Package 1 (Media Sensitization & Advocacy) and Work Package 3 (Municipal Community-Based Support Services). Clearly state direct outputs and relation to the project target indicator framework.' },
  { id: 'p-a2-methodology', category: 'Annex A2: Full Application', name: 'Annex A2: Sec 1.2 Methodology & Governance', description: 'Develops Section 1.2 covering governance plans, role of co-applicants, monitoring systems, and change-management risk structures.', systemInstruction: 'You are a Senior Civil Society Consultant. Draft a rigorous, audit-proof project management plan. Detail precise communication rhythms, collaborative coordination models, clear divisions of tasks between applicants and co-applicants, and continuous learning/evaluation feedback loops. Use clear markdown structure.', userPrompt: 'Draft Section 1.2 "Methodology" for: [Project Title]. Provide structured descriptions for: a) Institutional and operational roles of HERA (Lead applicant) and Civic Coalition for Human Rights (Co-applicant), b) Monitoring and evaluation procedures, c) Standard contingency and issue escalation protocols.' },
  { id: 'p-a2-sustainability', category: 'Annex A2: Full Application', name: 'Annex A2: Sec 1.3 Sustainability & Replication', description: 'Creates Section 1.3 explaining financial continuity, structural municipal handovers, policy integration, and multiplier impacts.', systemInstruction: 'You are an Expert in Sustainable Development and NGO Capacity Building. Craft strategic sustainability narratives that prove to European Commission evaluators that project services will survive after EU funding ends through state budgeting, municipal integration, and organizational assets. Use formal markdown formatting.', userPrompt: 'Build Section 1.3 "Sustainability of the Action" for: [Project Title]. Explicitly elaborate on structural handovers of local physical community centers to municipal social departments, continuous volunteer engagement frameworks, and integration with national gender strategies.' },
  { id: 'p-logical-framework', category: 'Structural Frameworks', name: 'Annex C: Theory of Change Logic Cascade', description: 'Formats a cascading results logic chain matching Activities, Outputs, and Outcomes into logical IF-THEN-THEREFORE pathways.', systemInstruction: 'You are an expert M&E Designer specializing in civil society capacity. Draft high-fidelity Theory of Change pathways using the strict IF-THEN-THEREFORE logic chains common in EU Annex C forms. Format in clear markdown with numbered pathways.', userPrompt: 'Build a full Theory of Change chain for a project aiming to [Core Goal]. Map out at least 3 Activities, 3 corresponding Outputs, and 1 specific Outcome with clear means of verification.' },
  { id: 'p-budget-justifier', category: 'Structural Frameworks', name: 'Annex B: Budget Justification Builder', description: 'Converts quantitative spreadsheet line items into robust justification narratives explaining cost-effectiveness.', systemInstruction: 'You are an EU Finance Compliance Auditor. Your job is to draft justifications that explain to the European Commission that the budget item is 100% necessary, realistic, and calculated based on actual market values. Use formal markdown with bold section headers.', userPrompt: 'Draft the justification narrative for: Budget Item: [Item Name], Unit Cost: EUR [Unit Cost] for [Quantity] units. Explain how it directly links to achieving deliverables under Work Package [WP].' }
]

// Routes AI calls through a Supabase Edge Function to avoid CORS + key exposure
async function callAI(systemInstruction: string, userPrompt: string, projectContext: typeof INITIAL_PROJECT_METADATA) {
  const fullUserMessage = `${userPrompt}

Project Context:
- Title: ${projectContext.title}
- Donor: ${projectContext.donor}
- Country: ${projectContext.country}
- Total Budget: €${projectContext.totalBudget.toLocaleString()}
- Duration: ${projectContext.durationMonths} months
- Reporting Period: ${projectContext.reportingPeriod}`

  const { data: { session } } = await supabase.auth.getSession()
  const response = await supabase.functions.invoke('proposal-agent', {
    body: { system: systemInstruction, prompt: fullUserMessage },
    headers: session ? { Authorization: `Bearer ${session.access_token}` } : undefined,
  })
  if (response.error) throw new Error(response.error.message)
  if (!response.data?.content) throw new Error('No content returned')
  return response.data.content as string
}

function renderMarkdown(text: string) {
  if (!text) return ''
  return text
    .replace(/^### (.+)$/gm, '<h3 class="text-sm font-bold text-[#1E3A52] mt-4 mb-1 font-serif">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-[#1E3A52] mt-5 mb-2 font-serif">$1</h2>')
    .replace(/^#### (.+)$/gm, '<h4 class="text-xs font-bold text-[#1E3A52] mt-3 mb-1 font-serif">$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-[11px] leading-relaxed">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-[11px] leading-relaxed"><strong>$1.</strong> $2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>')
}

export function CivilSocietyOS() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [projectMetadata, setProjectMetadata] = useState(INITIAL_PROJECT_METADATA)
  const [indicators, setIndicators] = useState(INITIAL_INDICATORS)
  const [risks, setRisks] = useState(INITIAL_RISKS)
  const [budgetLines, setBudgetLines] = useState(INITIAL_BUDGET_LINES)
  const [promptTemplates, setPromptTemplates] = useState(PROMPT_TEMPLATES)
  const [grantsList] = useState(INITIAL_GRANTS)

  const [selectedPrompt, setSelectedPrompt] = useState(PROMPT_TEMPLATES[1])
  const [userPromptText, setUserPromptText] = useState(PROMPT_TEMPLATES[1].userPrompt)
  const [apiLogs, setApiLogs] = useState<{ id: string; timestamp: string; promptName: string; status: string; model: string }[]>([])
  const [aiOutput, setAiOutput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('All')

  const [grantSearch, setGrantSearch] = useState('')
  const [filterTheme, setFilterTheme] = useState('All')
  const [filterRegion, setFilterRegion] = useState('All')
  const [filterBudgetBracket, setFilterBudgetBracket] = useState('All')
  const [filterStatus, setFilterStatus] = useState('All')
  const [sortField, setSortField] = useState('deadline')
  const [sortAscending, setSortAscending] = useState(true)

  const [newIndicator, setNewIndicator] = useState({ level: 'OUTCOME 1', code: '', description: '', baseline: '', target: '', current: '', progress: 0, verification: '', frequency: 'Quarterly', status: 'In Progress' })
  const [newRisk, setNewRisk] = useState({ category: 'Implementation', description: '', likelihood: 'Medium', impact: 'Medium', riskLevel: 'Medium', mitigation: '', owner: '', status: 'Active' })
  const [newBudgetLine, setNewBudgetLine] = useState({ heading: '1. Human Resources', code: '', description: '', unit: 'Month', quantity: 0, unitValue: 0, justification: '' })

  const [notification, setNotification] = useState<{ message: string; type: string } | null>(null)

  const triggerNotification = (message: string, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 4000)
  }

  useEffect(() => {
    setUserPromptText(selectedPrompt.userPrompt)
    setAiOutput('')
  }, [selectedPrompt])

  const handleConnectGrantToProposal = (grant: typeof INITIAL_GRANTS[0]) => {
    setProjectMetadata({ ...projectMetadata, title: `Consortium Initiative: ${grant.title}`, donor: grant.donor, totalBudget: grant.budget, country: grant.region === 'Western Balkans' ? 'Western Balkans Region' : grant.region })
    setSelectedPrompt(PROMPT_TEMPLATES[1])
    setUserPromptText(`Generate Section 1.1 Detailed Description for our newly targeted call: "${grant.title}" funded by the ${grant.donor}.\n\nCore thematic focus must explore: ${grant.thematicFocus}.\nProposed allocation value is EUR ${grant.budget.toLocaleString()}.`)
    setAiOutput('')
    setActiveTab('proposal')
    triggerNotification(`Injected details for "${grant.title}" into AI Co-Writer`, 'success')
  }

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    setAiOutput('')
    const logEntry = { id: crypto.randomUUID(), timestamp: new Date().toLocaleTimeString(), promptName: selectedPrompt.name, status: 'Running', model: 'claude-sonnet-4-6' }
    setApiLogs(prev => [logEntry, ...prev])
    try {
      const result = await callAI(selectedPrompt.systemInstruction, userPromptText, projectMetadata)
      setAiOutput(result)
      setApiLogs(prev => prev.map(l => l.id === logEntry.id ? { ...l, status: 'Success' } : l))
      triggerNotification('Content generated via Claude Sonnet', 'success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      setApiLogs(prev => prev.map(l => l.id === logEntry.id ? { ...l, status: `Error: ${msg}` } : l))
      triggerNotification(`API error: ${msg}`, 'error')
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      const el = document.createElement('textarea')
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    })
    triggerNotification('Copied to clipboard', 'info')
  }

  const handleAddIndicator = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newIndicator.code || !newIndicator.description) { triggerNotification('Code and Description are required', 'error'); return }
    setIndicators([...indicators, { ...newIndicator, id: crypto.randomUUID(), progress: parseFloat(String(newIndicator.progress)) || 0 }])
    setNewIndicator({ level: 'OUTCOME 1', code: '', description: '', baseline: '', target: '', current: '', progress: 0, verification: '', frequency: 'Quarterly', status: 'In Progress' })
    triggerNotification('Indicator added')
  }

  const handleDeleteIndicator = (id: string) => { setIndicators(indicators.filter(i => i.id !== id)); triggerNotification('Indicator removed', 'info') }

  const handleAddRisk = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRisk.description || !newRisk.mitigation) { triggerNotification('Description and Mitigation required', 'error'); return }
    const calcLevel = (l: string, i: string) => {
      if (l === 'High' && i === 'High') return 'Critical'
      if (l === 'High' || i === 'High') return 'High'
      if (l === 'Medium' && i === 'Medium') return 'Medium'
      return 'Low'
    }
    setRisks([...risks, { ...newRisk, id: crypto.randomUUID(), riskLevel: calcLevel(newRisk.likelihood, newRisk.impact) }])
    setNewRisk({ category: 'Implementation', description: '', likelihood: 'Medium', impact: 'Medium', mitigation: '', owner: '', status: 'Active', riskLevel: 'Medium' })
    triggerNotification('Risk registered')
  }

  const handleAddBudgetLine = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBudgetLine.description || newBudgetLine.quantity <= 0 || newBudgetLine.unitValue <= 0) { triggerNotification('Fill all required budget fields', 'error'); return }
    setBudgetLines([...budgetLines, { ...newBudgetLine, id: crypto.randomUUID(), totalCost: newBudgetLine.quantity * newBudgetLine.unitValue }])
    setNewBudgetLine({ heading: '1. Human Resources', code: '', description: '', unit: 'Month', quantity: 0, unitValue: 0, justification: '' })
    triggerNotification('Budget line committed')
  }

  const handleSort = (field: string) => {
    if (sortField === field) setSortAscending(!sortAscending)
    else { setSortField(field); setSortAscending(true) }
  }

  const filteredAndSortedGrants = grantsList
    .filter(g => {
      const s = grantSearch.toLowerCase()
      const matchSearch = g.title.toLowerCase().includes(s) || g.donor.toLowerCase().includes(s) || g.description.toLowerCase().includes(s)
      const matchTheme = filterTheme === 'All' || g.thematicFocus === filterTheme
      const matchRegion = filterRegion === 'All' || g.region === filterRegion
      const matchStatus = filterStatus === 'All' || g.status === filterStatus
      let matchBudget = true
      if (filterBudgetBracket === 'small') matchBudget = g.budget < 50000
      else if (filterBudgetBracket === 'medium') matchBudget = g.budget >= 50000 && g.budget <= 250000
      else if (filterBudgetBracket === 'large') matchBudget = g.budget > 250000
      return matchSearch && matchTheme && matchRegion && matchStatus && matchBudget
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortField === 'title') cmp = a.title.localeCompare(b.title)
      else if (sortField === 'budget') cmp = a.budget - b.budget
      else if (sortField === 'deadline') cmp = a.deadline.localeCompare(b.deadline)
      return sortAscending ? cmp : -cmp
    })

  const totalBudgetCost = budgetLines.reduce((acc, l) => acc + l.totalCost, 0)
  const averageProgress = Math.round(indicators.reduce((acc, i) => acc + i.progress, 0) / indicators.length)

  const inputCls = "w-full text-xs p-2 rounded border border-gray-200 focus:ring-1 focus:ring-[#A079AE] outline-none"
  const labelCls = "block text-[10px] font-mono text-gray-500 uppercase font-bold mb-1"

  return (
    <div className="min-h-screen bg-[#F4F6F9] text-[#1E3A52] font-sans antialiased flex flex-col">

      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white transition-all ${notification.type === 'success' ? 'bg-[#2E7D32]' : notification.type === 'error' ? 'bg-[#C62828]' : 'bg-[#1565C0]'}`}>
          <span className="text-sm">{notification.message}</span>
          <button onClick={() => setNotification(null)} className="font-bold opacity-80 hover:opacity-100 text-lg leading-none">&times;</button>
        </div>
      )}

      <header className="bg-[#1E3A52] text-[#F7F4ED] py-5 px-6 shadow-md border-b-2 border-[#A079AE]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-[#A079AE] text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">CIVIL SOCIETY OS</span>
              <span className="text-xs text-gray-300">v3.0 — Claude Sonnet</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1 font-serif">Cvetanichin Consultancy</h1>
            <p className="text-[#EAD9CB] text-xs font-mono mt-1">Platform: Project Truth Workspace • Powered by Claude Sonnet 4.6</p>
          </div>
          <div className="bg-[#2d5573] px-4 py-2 rounded-lg border border-[#A079AE]/30 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <div>
              <span className="text-[10px] text-gray-300 font-mono block">AI Engine</span>
              <span className="text-xs text-white font-bold">claude-sonnet-4-6</span>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Orchestration Dashboard', icon: '📊' },
            { id: 'scanner', label: '2026 Grant Scanner', icon: '🔍' },
            { id: 'proposal', label: 'AI Proposal Assistant', icon: '✍️' },
            { id: 'indicators', label: 'Logical Framework (M&E)', icon: '🎯' },
            { id: 'risks', label: 'Risk Register', icon: '⚠️' },
            { id: 'budget', label: 'Budget & Cost Justifier', icon: '💰' },
            { id: 'admin', label: 'Backoffice Config', icon: '⚙️' }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-4 text-xs font-medium border-b-2 whitespace-nowrap transition-all ${activeTab === tab.id ? 'border-[#1E3A52] text-[#1E3A52] bg-blue-50/40 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'}`}>
              <span>{tab.icon}</span>{tab.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-grow max-w-7xl mx-auto p-4 md:p-6 w-full">

        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#1E3A52] to-[#2d5573] text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 font-serif text-[180px] select-none -translate-y-12">EU</div>
              <div className="relative z-10 space-y-3">
                <span className="bg-[#A079AE] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Active Contract</span>
                <h2 className="text-xl md:text-2xl font-serif font-bold text-[#F7F4ED]">{projectMetadata.title}</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 text-xs font-mono border-t border-white/20">
                  <div><span className="block text-gray-300">Contract Authority:</span><strong>{projectMetadata.donor}</strong></div>
                  <div><span className="block text-gray-300">Lead Organization:</span><strong>{projectMetadata.leadOrganization}</strong></div>
                  <div><span className="block text-gray-300">Contract Reference:</span><strong>{projectMetadata.contractNumber}</strong></div>
                  <div><span className="block text-gray-300">Duration & Phase:</span><strong>{projectMetadata.durationMonths} Months / {projectMetadata.reportingPeriod}</strong></div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Aggregate M&E Progress', value: `${averageProgress}%`, sub: 'across all indicators', icon: '🎯', bar: averageProgress, color: 'bg-[#A079AE]' },
                { label: 'Financial Allocation', value: `€${totalBudgetCost.toLocaleString()}`, sub: '100% EC Compliant', icon: '💶', color: 'bg-green-500' },
                { label: 'Critical/High Risks', value: `${risks.filter(r => r.riskLevel === 'Critical' || r.riskLevel === 'High').length} Active`, sub: `${risks.length} total registered`, icon: '⚠️', color: 'bg-red-500' },
                { label: 'Active Indicators', value: `${indicators.length} Points`, sub: 'Direct Verification', icon: '📊', color: 'bg-blue-500' }
              ].map((kpi, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
                  <div>
                    <span className="text-xs text-gray-500 font-mono block">{kpi.label}</span>
                    <span className="text-xl font-bold font-serif text-[#1E3A52]">{kpi.value}</span>
                    {kpi.bar !== undefined && (<div className="w-28 bg-gray-200 h-1.5 rounded-full mt-2"><div className={`${kpi.color} h-1.5 rounded-full`} style={{ width: `${kpi.bar}%` }}></div></div>)}
                    <span className="text-[10px] text-gray-500 block mt-1">{kpi.sub}</span>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg text-xl">{kpi.icon}</div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-serif font-bold text-[#1E3A52]">Logical If-Then Pathway & Theory of Change</h3>
                  <p className="text-xs text-gray-500">Causal links per EC results-chain methodology</p>
                </div>
                <span className="bg-[#EAD9CB] text-[#1E3A52] text-[10px] font-mono font-bold px-2 py-1 rounded">Annex C</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {[
                  { step: '1. IF ACTIVITIES RUN', bg: 'bg-[#1E3A52]/5', badge: 'bg-[#1E3A52] text-white', title: 'Establish Media Partnerships & Court Mentorships', body: 'Deploy experts, organize focus groups, establish support lines.' },
                  { step: '2. THEN OUTPUTS', bg: 'bg-purple-50', badge: 'bg-[#A079AE] text-white', title: '40+ Investigative Reports Published', body: 'Concrete deliverables produced under Work Package timelines.' },
                  { step: '3. THEREFORE OUTCOMES', bg: 'bg-amber-50', badge: 'bg-[#E5C690] text-[#1E3A52]', title: 'Dismantle Public Misconceptions', body: 'Measurable shift in legal systems and local civic dialogue.' },
                  { step: '4. IMPACT MET', bg: 'bg-green-50', badge: 'bg-[#2E7D32] text-white', title: 'Social Attitudes Shift to Protect Vulnerable Groups', body: 'An enabling institutional environment for human rights in Macedonia.' }
                ].map((c, i) => (
                  <div key={i} className={`${c.bg} p-4 rounded-xl border border-gray-100`}>
                    <span className={`text-[10px] ${c.badge} px-2 py-0.5 rounded font-mono font-semibold`}>{c.step}</span>
                    <h4 className="text-xs font-bold mt-2">{c.title}</h4>
                    <p className="text-[11px] text-gray-600 mt-1">{c.body}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-sm font-serif font-bold text-[#1E3A52] border-b border-gray-100 pb-2">Workspace Configuration</h3>
                <div className="space-y-3">
                  {[{ label: 'Project Title', key: 'title' }, { label: 'Target Donor Agency', key: 'donor' }].map(f => (
                    <div key={f.key}>
                      <label className={labelCls}>{f.label}</label>
                      <input type="text" value={projectMetadata[f.key as keyof typeof projectMetadata] as string} onChange={e => setProjectMetadata({ ...projectMetadata, [f.key]: e.target.value })} className={inputCls} />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-2">
                    <div><label className={labelCls}>Total Budget (€)</label><input type="number" value={projectMetadata.totalBudget} onChange={e => setProjectMetadata({ ...projectMetadata, totalBudget: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
                    <div><label className={labelCls}>Duration (Mo)</label><input type="number" value={projectMetadata.durationMonths} onChange={e => setProjectMetadata({ ...projectMetadata, durationMonths: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
                  </div>
                </div>
                <div className="p-3 bg-[#EAD9CB]/30 rounded-xl">
                  <span className="text-[10px] font-bold text-[#1E3A52] block uppercase tracking-wider">🔒 Compliance Shield Active</span>
                  <p className="text-[10px] text-gray-600 leading-relaxed mt-1">Changes here auto-propagate to AI proposal context on next generation.</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm lg:col-span-2 space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-sm font-serif font-bold text-[#1E3A52]">Cvetanichin Operating Intelligence</h3>
                  <span className="text-[10px] text-[#A079AE] font-mono">🟢 Optimized</span>
                </div>
                <div className="space-y-3">
                  {[
                    { color: 'red', icon: '🚨', title: 'Immediate Action: Risk Mitigation Review', body: 'Smear campaigns against gender awareness (R1) remain Critical. Establish comms protocol before launching community help lines.' },
                    { color: 'blue', icon: '📈', title: 'M&E Milestone: OP1.1.1 at 100%', body: 'Journalists trained indicator (42/40) is complete. Export certificate register for intermediate EC report.' },
                    { color: 'green', icon: '💰', title: 'Budget Integrity Verified', body: 'All budget lines mapped to activities. No unallocated margins detected. Compliant with lot parameters.' }
                  ].map((a, i) => (
                    <div key={i} className={`flex gap-3 items-start p-3 rounded-xl border`} style={{ backgroundColor: a.color === 'red' ? '#FFF5F5' : a.color === 'blue' ? '#EFF6FF' : '#F0FFF4', borderColor: a.color === 'red' ? '#FED7D7' : a.color === 'blue' ? '#DBEAFE' : '#C6F6D5' }}>
                      <span className="text-base">{a.icon}</span>
                      <div>
                        <h4 className="text-xs font-bold" style={{ color: a.color === 'red' ? '#742A2A' : a.color === 'blue' ? '#1E3A8A' : '#1C4532' }}>{a.title}</h4>
                        <p className="text-[11px] mt-0.5" style={{ color: a.color === 'red' ? '#9B2C2C' : a.color === 'blue' ? '#1E40AF' : '#276749' }}>{a.body}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scanner' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-[#1E3A52] to-[#7A558A] p-6 rounded-2xl text-white shadow relative overflow-hidden">
              <div className="absolute right-0 top-0 opacity-10 font-serif text-[120px] select-none -translate-y-8">SCANNER</div>
              <div className="relative z-10 space-y-2 max-w-2xl">
                <span className="bg-[#EAD9CB] text-[#1E3A52] text-[10px] font-mono font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">Agent 1 ACTIVE</span>
                <h2 className="text-xl font-serif font-bold">2026 CSO & NGO Open Call Scanner</h2>
                <p className="text-xs text-gray-200 leading-relaxed">Opportunities from EU Funding & Tenders, Council of Europe EYF, and regional donor foundations.</p>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-500 font-mono">Filters</span>
                <span className="text-xs text-gray-400 font-mono">{filteredAndSortedGrants.length} of {grantsList.length} opportunities</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                <div><label className={labelCls}>Search Keywords</label><input type="text" placeholder="Search titles, donors..." value={grantSearch} onChange={e => setGrantSearch(e.target.value)} className={inputCls} /></div>
                {[
                  { label: 'Thematic Focus', val: filterTheme, set: setFilterTheme, opts: ['All', 'Human Rights', 'Youth', 'Civic Space', 'Governance', 'Environment'] },
                  { label: 'Geographic Zone', val: filterRegion, set: setFilterRegion, opts: ['All', 'Western Balkans', 'Europe', 'North Macedonia', 'EU & Associated States', 'Global'] },
                  { label: 'Budget Cap', val: filterBudgetBracket, set: setFilterBudgetBracket, opts: [['All', 'All Sizes'], ['small', '< €50k'], ['medium', '€50k–€250k'], ['large', '> €250k']] as (string | string[])[] },
                  { label: 'Call Status', val: filterStatus, set: setFilterStatus, opts: ['All', 'Open', 'Upcoming'] }
                ].map((f, i) => (
                  <div key={i}><label className={labelCls}>{f.label}</label>
                    <select value={f.val} onChange={e => f.set(e.target.value)} className={inputCls}>
                      {f.opts.map(o => Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o as string} value={o as string}>{o as string}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-200 text-gray-500 font-mono text-[10px] uppercase bg-gray-50">
                      {[['title', 'Grant Title'], ['', 'Authority'], ['budget', 'Budget'], ['', 'Theme'], ['', 'Region'], ['deadline', 'Deadline'], ['', 'Status'], ['', 'Actions']].map(([field, label], i) => (
                        <th key={i} onClick={field ? () => handleSort(field) : undefined} className={`py-3 px-4 ${field ? 'cursor-pointer hover:bg-gray-100 select-none' : ''}`}>
                          {label} {field && (sortField === field ? (sortAscending ? '🔼' : '🔽') : '↕️')}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredAndSortedGrants.length === 0
                      ? <tr><td colSpan={8} className="py-8 text-center text-gray-400 font-mono">No opportunities match your filters.</td></tr>
                      : filteredAndSortedGrants.map(g => (
                        <tr key={g.id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="py-4 px-4 w-1/4"><strong className="text-sm font-serif text-[#1E3A52] block">{g.title}</strong><p className="text-gray-500 text-[11px] mt-0.5 line-clamp-2">{g.description}</p></td>
                          <td className="py-4 px-4 font-mono text-gray-600 text-[11px]"><span className="block font-bold">{g.donor}</span><span className="text-gray-400 text-[10px]">{g.portal}</span></td>
                          <td className="py-4 px-4 font-mono font-bold">€{g.budget.toLocaleString()}</td>
                          <td className="py-4 px-4"><span className="bg-[#A079AE]/10 text-[#7A558A] text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase">{g.thematicFocus}</span></td>
                          <td className="py-4 px-4 text-gray-600 font-medium text-[11px]">{g.region}</td>
                          <td className="py-4 px-4 font-mono text-gray-500 text-[11px]">{g.deadline}</td>
                          <td className="py-4 px-4"><span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${g.status === 'Open' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>{g.status}</span></td>
                          <td className="py-4 px-4 text-right space-y-1.5">
                            <a href={g.link} target="_blank" rel="noopener noreferrer" className="text-[11px] text-[#1E3A52] hover:text-[#A079AE] font-mono font-bold flex items-center justify-end gap-1">Portal 🔗</a>
                            <button onClick={() => handleConnectGrantToProposal(g)} className="bg-[#1E3A52] hover:bg-[#2d5573] text-white font-bold text-[10px] px-3 py-1.5 rounded-md shadow-sm transition-all block w-full text-center">✍️ Inject to AI Writer</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'proposal' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="pb-2 border-b border-gray-100"><h3 className="text-sm font-serif font-bold text-[#1E3A52]">Strategic Methodology Library</h3><p className="text-[11px] text-gray-500 mt-0.5">EU grant structuring templates</p></div>
              <div className="flex flex-wrap gap-1.5">
                {['All', 'Annex A1', 'Annex A2', 'Frameworks'].map(cat => (
                  <button key={cat} onClick={() => setTemplateCategoryFilter(cat)} className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider transition-all ${(cat === 'All' && templateCategoryFilter === 'All') || (cat !== 'All' && templateCategoryFilter.includes(cat)) ? 'bg-[#1E3A52] text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {cat === 'Frameworks' ? 'Budget/Logframe' : cat}
                  </button>
                ))}
              </div>
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {promptTemplates.filter(t => templateCategoryFilter === 'All' || t.category.includes(templateCategoryFilter)).map(tpl => (
                  <button key={tpl.id} onClick={() => setSelectedPrompt(tpl)} className={`w-full text-left p-3 rounded-xl border transition-all ${selectedPrompt.id === tpl.id ? 'bg-blue-50/50 border-[#1E3A52] ring-1 ring-[#1E3A52]/20' : 'border-gray-200 hover:bg-gray-50'}`}>
                    <span className="text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded bg-[#A079AE]/15 text-[#7A558A]">{tpl.category}</span>
                    <span className="text-xs font-bold text-[#1E3A52] block mt-1">{tpl.name}</span>
                    <span className="text-[11px] text-gray-500 line-clamp-2">{tpl.description}</span>
                  </button>
                ))}
              </div>
              <div className="pt-3 border-t border-gray-100">
                <label className={labelCls}>System Instructions (editable)</label>
                <textarea rows={4} value={selectedPrompt.systemInstruction} onChange={e => setPromptTemplates(promptTemplates.map(t => t.id === selectedPrompt.id ? { ...t, systemInstruction: e.target.value } : t))} className="w-full text-[11px] font-mono p-2 bg-gray-50 rounded border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#A079AE] leading-relaxed" />
              </div>
            </div>
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#A079AE] uppercase tracking-wider block">{selectedPrompt.category}</span>
                    <h3 className="text-sm font-serif font-bold text-[#1E3A52]">{selectedPrompt.name}</h3>
                  </div>
                  <button onClick={handleGenerateAI} disabled={isGenerating} className="bg-[#1E3A52] text-white hover:bg-[#2d5573] disabled:bg-gray-300 font-bold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-2 shadow">
                    {isGenerating ? <><span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></span>Generating via Claude...</> : <>✨ Generate via Claude Sonnet</>}
                  </button>
                </div>
                <div className="bg-[#EAD9CB]/20 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-xs text-[#1E3A52] font-mono">Active Project:</span>
                  <strong className="text-xs text-[#1E3A52] truncate max-w-sm font-mono">{projectMetadata.title}</strong>
                </div>
                <div>
                  <label className={labelCls}>Customize Narrative Inputs</label>
                  <textarea rows={5} value={userPromptText} onChange={e => setUserPromptText(e.target.value)} className="w-full text-xs p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#A079AE] leading-relaxed font-mono" placeholder="Specify target municipalities, budget items, partner organizations..." />
                </div>
                {aiOutput && (
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                      <div className="flex items-center gap-2"><span className="text-[10px] font-mono font-bold text-gray-500 uppercase">Claude Sonnet Output</span><span className="bg-green-100 text-green-700 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded">LIVE</span></div>
                      <button onClick={() => copyToClipboard(aiOutput)} className="text-xs text-[#1E3A52] hover:text-[#A079AE] font-semibold flex items-center gap-1">📋 Copy</button>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 text-xs leading-relaxed text-[#1E3A52] max-h-96 overflow-y-auto shadow-inner" dangerouslySetInnerHTML={{ __html: renderMarkdown(aiOutput) }} />
                  </div>
                )}
              </div>
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-xs font-serif font-bold text-gray-500 uppercase tracking-wider mb-3">Session Log</h3>
                {apiLogs.length === 0 ? <p className="text-[11px] text-gray-400 font-mono">No generations this session.</p>
                  : <div className="space-y-2 max-h-40 overflow-y-auto">{apiLogs.map(log => (
                    <div key={log.id} className="flex justify-between items-center text-[10px] font-mono p-2 rounded bg-gray-50 border border-gray-100">
                      <span className="text-gray-500">[{log.timestamp}]</span>
                      <span className="font-bold text-[#1E3A52] truncate max-w-xs">{log.promptName}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${log.status === 'Success' ? 'bg-green-100 text-green-800' : log.status === 'Running' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>{log.status}</span>
                    </div>
                  ))}</div>}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'indicators' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
                <div><h3 className="text-base font-serif font-bold text-[#1E3A52]">Performance Indicator Matrix</h3><p className="text-xs text-gray-500">Live indicators mapped to HERA contract outputs</p></div>
                <div className="flex gap-2"><span className="bg-[#2E7D32]/10 text-[#2E7D32] text-[10px] font-mono font-bold px-2 py-1 rounded">EU Compliant</span><span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-2 py-1 rounded">Total: {indicators.length}</span></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-gray-200 text-gray-500 font-mono text-[10px] uppercase">{['Level', 'ID', 'Description', 'Baseline', 'Target', 'Current', 'Progress', 'Status', ''].map((h, i) => <th key={i} className="py-3 px-2">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {indicators.map(ind => (
                      <tr key={ind.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-2"><span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${ind.level.includes('IMPACT') ? 'bg-red-100 text-red-800' : ind.level.includes('OUTCOME') ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>{ind.level}</span></td>
                        <td className="py-3 px-2 font-mono font-bold">{ind.code}</td>
                        <td className="py-3 px-2 font-serif text-[#1E3A52] leading-relaxed w-1/3">{ind.description}</td>
                        <td className="py-3 px-2 font-mono text-gray-500">{ind.baseline}</td>
                        <td className="py-3 px-2 font-mono font-bold">{ind.target}</td>
                        <td className="py-3 px-2 font-mono text-blue-700 font-bold">{ind.current}</td>
                        <td className="py-3 px-2"><div className="flex items-center gap-2"><div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden"><div className="bg-[#A079AE] h-1.5 rounded-full" style={{ width: `${Math.min(ind.progress, 100)}%` }}></div></div><span className="font-mono text-[10px]">{ind.progress}%</span></div></td>
                        <td className="py-3 px-2"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ind.status === 'Achieved' ? 'bg-green-100 text-green-800' : ind.status === 'On Track' ? 'bg-blue-100 text-blue-800' : ind.status === 'In Progress' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'}`}>{ind.status}</span></td>
                        <td className="py-3 px-2 text-right"><button onClick={() => handleDeleteIndicator(ind.id)} className="text-gray-400 hover:text-red-600 font-bold px-2">&times;</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-serif font-bold text-[#1E3A52] pb-2 border-b border-gray-100 mb-4">Add New Indicator</h3>
              <form onSubmit={handleAddIndicator} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div><label className={labelCls}>Level</label><select value={newIndicator.level} onChange={e => setNewIndicator({ ...newIndicator, level: e.target.value })} className={inputCls}>{['IMPACT', 'OUTCOME 1', 'OUTCOME 2', 'OUTCOME 3', 'OUTPUT 1.1', 'OUTPUT 2.1'].map(o => <option key={o}>{o}</option>)}</select></div>
                <div><label className={labelCls}>Code</label><input type="text" placeholder="e.g. OC1.3" value={newIndicator.code} onChange={e => setNewIndicator({ ...newIndicator, code: e.target.value })} className={inputCls} /></div>
                <div className="md:col-span-2"><label className={labelCls}>Description</label><input type="text" placeholder="Full objective description..." value={newIndicator.description} onChange={e => setNewIndicator({ ...newIndicator, description: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Baseline</label><input type="text" value={newIndicator.baseline} onChange={e => setNewIndicator({ ...newIndicator, baseline: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Target</label><input type="text" value={newIndicator.target} onChange={e => setNewIndicator({ ...newIndicator, target: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Current</label><input type="text" value={newIndicator.current} onChange={e => setNewIndicator({ ...newIndicator, current: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Progress %</label><input type="number" value={newIndicator.progress} onChange={e => setNewIndicator({ ...newIndicator, progress: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
                <div><label className={labelCls}>Verification</label><input type="text" placeholder="Attendance files, survey..." value={newIndicator.verification} onChange={e => setNewIndicator({ ...newIndicator, verification: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Frequency</label><input type="text" placeholder="Quarterly" value={newIndicator.frequency} onChange={e => setNewIndicator({ ...newIndicator, frequency: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Status</label><select value={newIndicator.status} onChange={e => setNewIndicator({ ...newIndicator, status: e.target.value })} className={inputCls}>{['On Track', 'In Progress', 'Attention Needed', 'Achieved'].map(o => <option key={o}>{o}</option>)}</select></div>
                <div className="flex items-end"><button type="submit" className="w-full bg-[#1E3A52] hover:bg-[#2d5573] text-white text-xs font-bold py-2 rounded-lg transition-all">Save Indicator</button></div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'risks' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-gray-100">
                <div><h3 className="text-base font-serif font-bold text-[#1E3A52]">Risk & Assumptions Registry</h3><p className="text-xs text-gray-500">Live operational constraints monitored by Cvetanichin AI agents</p></div>
                <div className="flex gap-2"><span className="bg-red-50 text-red-700 text-[10px] font-mono font-bold px-2 py-1 rounded">Critical: {risks.filter(r => r.riskLevel === 'Critical').length}</span><span className="bg-[#A079AE]/10 text-[#A079AE] text-[10px] font-mono font-bold px-2 py-1 rounded">High: {risks.filter(r => r.riskLevel === 'High').length}</span></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {risks.map(risk => (
                  <div key={risk.id} className="bg-gray-50 border border-gray-100 p-5 rounded-xl space-y-3 relative hover:shadow-sm transition-all">
                    <span className={`absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded ${risk.riskLevel === 'Critical' ? 'bg-red-200 text-red-900' : risk.riskLevel === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-gray-200 text-gray-700'}`}>{risk.riskLevel}</span>
                    <div><span className="text-[10px] font-mono text-[#A079AE] uppercase font-bold">{risk.category}</span><h4 className="text-xs font-bold text-[#1E3A52] leading-relaxed pr-16 mt-0.5">{risk.description}</h4></div>
                    <div className="text-xs bg-white p-3 rounded-lg border border-gray-100"><span className="text-[10px] font-mono text-gray-500 block uppercase font-bold mb-1">Mitigation</span><p className="text-gray-700 text-[11px] leading-relaxed font-serif">{risk.mitigation}</p></div>
                    <div className="flex justify-between text-[10px] font-mono text-gray-500 pt-2 border-t border-gray-100"><span>Owner: <strong>{risk.owner || 'PM'}</strong></span><span>Status: <strong className="text-blue-600">{risk.status}</strong></span></div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-serif font-bold text-[#1E3A52] pb-2 border-b border-gray-100 mb-4">Register New Risk</h3>
              <form onSubmit={handleAddRisk} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><label className={labelCls}>Category</label><select value={newRisk.category} onChange={e => setNewRisk({ ...newRisk, category: e.target.value })} className={inputCls}>{['Social/Political', 'Political/Regulatory', 'Media Coverage', 'Financial', 'Implementation'].map(o => <option key={o}>{o}</option>)}</select></div>
                <div><label className={labelCls}>Likelihood</label><select value={newRisk.likelihood} onChange={e => setNewRisk({ ...newRisk, likelihood: e.target.value })} className={inputCls}>{['High', 'Medium', 'Low'].map(o => <option key={o}>{o}</option>)}</select></div>
                <div><label className={labelCls}>Impact</label><select value={newRisk.impact} onChange={e => setNewRisk({ ...newRisk, impact: e.target.value })} className={inputCls}>{['High', 'Medium', 'Low'].map(o => <option key={o}>{o}</option>)}</select></div>
                <div className="md:col-span-3"><label className={labelCls}>Description</label><textarea rows={2} value={newRisk.description} onChange={e => setNewRisk({ ...newRisk, description: e.target.value })} placeholder="Describe the potential bottleneck..." className={inputCls} /></div>
                <div className="md:col-span-2"><label className={labelCls}>Mitigation Protocol</label><textarea rows={2} value={newRisk.mitigation} onChange={e => setNewRisk({ ...newRisk, mitigation: e.target.value })} placeholder="Actionable strategy..." className={inputCls} /></div>
                <div className="space-y-2"><div><label className={labelCls}>Risk Owner</label><input type="text" placeholder="e.g. Executive Director" value={newRisk.owner} onChange={e => setNewRisk({ ...newRisk, owner: e.target.value })} className={inputCls} /></div><button type="submit" className="w-full bg-[#1E3A52] hover:bg-[#2d5573] text-white text-xs font-bold py-2 rounded-lg transition-all">Commit to Registry</button></div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div><h3 className="text-base font-serif font-bold text-[#1E3A52]">EU Annex B: Cost Justification Center</h3><p className="text-xs text-gray-500">Narrative proofs mapping currency to Work Package outcomes</p></div>
                <span className="bg-green-100 text-green-800 text-xs font-bold font-mono px-3 py-1 rounded">Portfolio: €{totalBudgetCost.toLocaleString()}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-gray-200 text-gray-500 font-mono text-[10px] uppercase">{['Heading', 'Code', 'Description', 'Calculation', 'Total', 'Justification Narrative'].map((h, i) => <th key={i} className="py-3 px-2">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {budgetLines.map(line => (
                      <tr key={line.id} className="hover:bg-gray-50/50">
                        <td className="py-3 px-2 font-mono text-[#A079AE] font-semibold text-[11px]">{line.heading}</td>
                        <td className="py-3 px-2 font-mono font-bold">{line.code}</td>
                        <td className="py-3 px-2 font-bold font-serif text-[#1E3A52]">{line.description}</td>
                        <td className="py-3 px-2 font-mono text-[11px]">{line.quantity} {line.unit} × €{line.unitValue}</td>
                        <td className="py-3 px-2 font-mono font-bold">€{line.totalCost.toLocaleString()}</td>
                        <td className="py-3 px-2 text-[11px] text-gray-600 font-serif leading-relaxed bg-[#1E3A52]/5 rounded">{line.justification}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <h3 className="text-sm font-serif font-bold text-[#1E3A52] pb-2 border-b border-gray-100 mb-4">Add Budget Line</h3>
              <form onSubmit={handleAddBudgetLine} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div><label className={labelCls}>Section</label><select value={newBudgetLine.heading} onChange={e => setNewBudgetLine({ ...newBudgetLine, heading: e.target.value })} className={inputCls}>{['1. Human Resources', '2. Travel', '3. Equipment & Supplies', '4. Project Office', '5. Other costs, services'].map(o => <option key={o}>{o}</option>)}</select></div>
                <div><label className={labelCls}>Code</label><input type="text" placeholder="e.g. 1.1.3" value={newBudgetLine.code} onChange={e => setNewBudgetLine({ ...newBudgetLine, code: e.target.value })} className={inputCls} /></div>
                <div className="md:col-span-2"><label className={labelCls}>Description</label><input type="text" placeholder="Resource name..." value={newBudgetLine.description} onChange={e => setNewBudgetLine({ ...newBudgetLine, description: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Unit</label><input type="text" placeholder="Month, Package..." value={newBudgetLine.unit} onChange={e => setNewBudgetLine({ ...newBudgetLine, unit: e.target.value })} className={inputCls} /></div>
                <div><label className={labelCls}>Quantity</label><input type="number" value={newBudgetLine.quantity} onChange={e => setNewBudgetLine({ ...newBudgetLine, quantity: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
                <div><label className={labelCls}>Unit Value (€)</label><input type="number" value={newBudgetLine.unitValue} onChange={e => setNewBudgetLine({ ...newBudgetLine, unitValue: parseInt(e.target.value) || 0 })} className={inputCls} /></div>
                <div className="flex items-end"><span className="text-xs font-mono text-gray-500">Sum: <strong>€{(newBudgetLine.quantity * newBudgetLine.unitValue).toLocaleString()}</strong></span></div>
                <div className="md:col-span-3"><label className={labelCls}>Justification Narrative</label><textarea rows={3} value={newBudgetLine.justification} onChange={e => setNewBudgetLine({ ...newBudgetLine, justification: e.target.value })} placeholder="State necessity, market rate basis, and link to Work Package..." className={`${inputCls} leading-relaxed`} /></div>
                <div className="flex items-end"><button type="submit" className="w-full bg-[#1E3A52] hover:bg-[#2d5573] text-white text-xs font-bold py-3 rounded-lg transition-all">Commit Budget Item</button></div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'admin' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#1E3A52] pb-2 border-b border-gray-100">Consultancy Operations</h3>
              <div className="space-y-3 text-xs">
                {[['Workspace Key', 'MKD-EU-2026-HERA'], ['AI Engine', 'claude-sonnet-4-6 (Anthropic)'], ['API Mode', 'Supabase Edge Function proxy'], ['Day Rate', '€400–€600 (Senior EU Consultant)']].map(([label, val]) => (
                  <div key={label}><span className="text-[10px] font-mono text-gray-500 block">{label}:</span><strong className="font-mono text-gray-800">{val}</strong></div>
                ))}
              </div>
              <div className="p-4 bg-[#A079AE]/10 rounded-xl space-y-2">
                <span className="text-xs font-bold text-[#1E3A52] block">API Config</span>
                <div className="space-y-1 text-[10px] font-mono text-gray-600">
                  {['Calls proxied via proposal-agent edge function', 'Model: claude-sonnet-4-6', 'System prompt sent as top-level field', 'Response parsed from content[].text blocks', 'No API key exposed to browser'].map((note, i) => (
                    <div key={i} className="flex gap-2"><span className="text-green-600">✓</span><span>{note}</span></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-4">
              <h3 className="text-sm font-serif font-bold text-[#1E3A52] pb-2 border-b border-gray-100">System Prompt Library Editor</h3>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {promptTemplates.map(tpl => (
                  <div key={tpl.id} className="border border-gray-200 p-4 rounded-xl space-y-3">
                    <div className="flex justify-between items-center"><div className="flex items-center gap-2"><span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#A079AE]/15 text-[#7A558A]">{tpl.category}</span><strong className="text-xs text-[#1E3A52] font-serif">{tpl.name}</strong></div><span className="text-[9px] font-mono text-gray-400">{tpl.id}</span></div>
                    <div className="space-y-2 text-xs">
                      <div><label className={labelCls}>System Directive</label><textarea rows={2} value={tpl.systemInstruction} onChange={e => setPromptTemplates(promptTemplates.map(t => t.id === tpl.id ? { ...t, systemInstruction: e.target.value } : t))} className="w-full p-2 bg-gray-50 border border-gray-100 rounded font-mono text-[11px] text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#A079AE]" /></div>
                      <div><label className={labelCls}>Default Prompt</label><input type="text" value={tpl.userPrompt} onChange={e => setPromptTemplates(promptTemplates.map(t => t.id === tpl.id ? { ...t, userPrompt: e.target.value } : t))} className="w-full p-2 bg-gray-50 border border-gray-100 rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#A079AE]" /></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-[#1E3A52] text-[#F7F4ED] py-6 px-6 text-center text-xs border-t border-[#A079AE]/20 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Cvetanichin Consultancy. All Rights Reserved.</p>
          <div className="flex gap-4 font-mono text-gray-300"><span>Engine: Claude Sonnet 4.6</span><span>Market: Western Balkans & Europe</span></div>
        </div>
      </footer>
    </div>
  )
}
