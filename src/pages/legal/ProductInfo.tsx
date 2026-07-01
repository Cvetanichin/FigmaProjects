import { Mail, Globe } from 'lucide-react'
import { LegalLayout, LegalSection, LegalList } from './LegalLayout'

export function ProductInfo() {
  return (
    <LegalLayout title="About Intelligence Workspace">
      <p className="text-foreground font-medium">
        AI-enhanced CSO Project Management Software with Project Planning, Progress & Risk Management Tracking,
        Budget Planning, and Donor-Compliant Reporting — delivered as a secure, cloud-based web application.
      </p>

      <LegalSection title="What We Offer">
        <LegalList items={[
          'Monitoring and Evaluation Tools',
          'Project Planning & Activity Tracking',
          'Risk Register & Mitigation Management',
          'Budget Planning',
          'Donor-Compliant Reporting (AI-assisted)',
          'AI Intelligence Briefs & Compliance Review Agents',
          'Grant & Funding Opportunity Database (Civil Society OS)',
        ]} />
        <p>Available through free access and paid subscriptions.</p>
      </LegalSection>

      <LegalSection title="Who Uses Intelligence Workspace">
        <LegalList items={[
          'NGOs and Civil Society Organisations',
          'Foundations and Grantmakers',
          'Independent Consultants',
          'Researchers and Academics',
          'Social Enterprises',
          'Public Institutions',
        ]} />
      </LegalSection>

      <LegalSection title="About Cvetanichin">
        <p>
          Cvetanichin develops and sells AI-powered software, digital tools, SaaS platforms, templates, databases,
          and knowledge systems that help NGOs, civil society organisations, consultants, researchers, and social
          impact organisations plan, manage, monitor, and grow their work.
        </p>
        <p>
          Our solutions simplify project design, fundraising, monitoring and evaluation, reporting, organisational
          management, and strategic decision-making through secure, cloud-based applications and digital resources.
        </p>
        <p>Our mission is to make professional-grade planning, learning, and growth tools accessible to organisations of all sizes.</p>
      </LegalSection>

      <LegalSection title="Why Choose Cvetanichin">
        <p><span className="font-medium text-foreground">Practical</span> — Built around real-world project implementation and organisational needs.</p>
        <p><span className="font-medium text-foreground">Professional</span> — Based on recognised planning, monitoring, evaluation, and management methodologies.</p>
        <p><span className="font-medium text-foreground">Efficient</span> — Reduce administrative work and focus on delivering results.</p>
        <p><span className="font-medium text-foreground">Accessible</span> — Professional tools without enterprise-level complexity.</p>
      </LegalSection>

      <LegalSection title="Trust & Compliance">
        <LegalList items={['Secure payment processing through Stripe', 'Transparent pricing', 'Privacy-first approach', 'Clear licensing terms', 'Dedicated customer support']} />
      </LegalSection>

      <LegalSection title="Contact">
        <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> <a href="mailto:cvetanichin@gmail.com" className="text-primary hover:underline">cvetanichin@gmail.com</a></p>
        <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> <a href="mailto:vaskac@gmail.com" className="text-primary hover:underline">vaskac@gmail.com</a></p>
        <p className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> <a href="https://www.cvetanichin.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.cvetanichin.org</a></p>
      </LegalSection>
    </LegalLayout>
  )
}
