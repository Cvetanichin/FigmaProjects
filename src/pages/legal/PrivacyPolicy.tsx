import { LegalLayout, LegalSection, LegalList } from './LegalLayout'

export function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" updated="24 June 2026">
      <p>Welcome to Intelligence Workspace. We respect your privacy and are committed to protecting your personal data.</p>

      <LegalSection title="1. Who We Are">
        <p>
          Cvetanichin develops and provides digital products, software applications, templates, databases, AI-powered
          tools, and educational resources for civil society organisations, consultants, researchers, social impact
          professionals, and businesses.
        </p>
        <p>
          For privacy-related enquiries, contact:{' '}
          <a href="mailto:cvetanichin@gmail.com" className="text-primary hover:underline">cvetanichin@gmail.com</a>
        </p>
      </LegalSection>

      <LegalSection title="2. Information We Collect">
        <p className="font-medium text-foreground">Information You Provide</p>
        <LegalList items={['Name', 'Email address', 'Organisation name', 'Account information', 'Support requests', 'Information submitted through forms']} />
        <p className="font-medium text-foreground mt-3">Information Collected Automatically</p>
        <LegalList items={['IP address', 'Browser type', 'Device information', 'Pages visited', 'Usage analytics', 'Cookies and similar technologies']} />
      </LegalSection>

      <LegalSection title="3. How We Use Your Information">
        <LegalList items={[
          'Provide access to products and services',
          'Process subscriptions and purchases',
          'Respond to enquiries and support requests',
          'Improve our products and platform',
          'Monitor security and prevent fraud',
          'Comply with legal obligations',
          'Send service-related communications',
        ]} />
      </LegalSection>

      <LegalSection title="4. Payments">
        <p>Payments are processed by Paddle, our Merchant of Record.</p>
        <p>Paddle is responsible for payment processing, billing, tax collection, fraud prevention, and transaction management. Paddle's own privacy practices may also apply to payment data — see Paddle's privacy policy for details.</p>
      </LegalSection>

      <LegalSection title="5. Cookies">
        <p>We may use cookies and similar technologies to:</p>
        <LegalList items={['Maintain user sessions', 'Improve website performance', 'Understand website usage', 'Enhance user experience']} />
        <p>Users may control cookies through browser settings.</p>
      </LegalSection>

      <LegalSection title="6. Data Sharing">
        <p>We do not sell personal information.</p>
        <p>We may share information with:</p>
        <LegalList items={['Payment providers', 'Hosting providers', 'Analytics providers', 'Customer support services', 'Legal authorities when required by law']} />
      </LegalSection>

      <LegalSection title="7. Data Security">
        <p>We implement reasonable technical and organisational measures to protect personal information.</p>
        <p>No internet transmission or storage system can be guaranteed as completely secure.</p>
      </LegalSection>

      <LegalSection title="8. Data Retention">
        <p>We retain information only for as long as necessary to:</p>
        <LegalList items={['Provide services', 'Meet legal obligations', 'Resolve disputes', 'Enforce agreements']} />
      </LegalSection>

      <LegalSection title="9. Your Rights">
        <p>Depending on your jurisdiction, you may have the right to:</p>
        <LegalList items={['Access your information', 'Correct inaccurate information', 'Delete your information', 'Restrict processing', 'Object to processing', 'Request data portability']} />
      </LegalSection>

      <LegalSection title="10. Changes">
        <p>We may update this Privacy Policy periodically. Updated versions will be posted on this page.</p>
      </LegalSection>

      <LegalSection title="11. Contact">
        <p>For privacy enquiries: <a href="mailto:cvetanichin@gmail.com" className="text-primary hover:underline">cvetanichin@gmail.com</a></p>
      </LegalSection>
    </LegalLayout>
  )
}
