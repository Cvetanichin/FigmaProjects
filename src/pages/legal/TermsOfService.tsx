import { LegalLayout, LegalSection, LegalList } from './LegalLayout'

export function TermsOfService() {
  return (
    <LegalLayout title="Terms of Service" updated="24 June 2026">
      <LegalSection title="1. Acceptance">
        <p>By accessing or using Cvetanichin products and services, you agree to these Terms of Service.</p>
      </LegalSection>

      <LegalSection title="2. Services">
        <p>Cvetanichin provides:</p>
        <LegalList items={['Software applications', 'Digital tools', 'AI-assisted solutions', 'Templates', 'Databases', 'Educational resources', 'Subscription-based services']} />
      </LegalSection>

      <LegalSection title="3. User Accounts">
        <p>Users are responsible for:</p>
        <LegalList items={['Maintaining account security', 'Keeping credentials confidential', 'Activities occurring under their account']} />
      </LegalSection>

      <LegalSection title="4. Permitted Use">
        <p className="font-medium text-foreground">Users may:</p>
        <LegalList items={['Access purchased products', 'Use products for personal or organisational purposes', 'Generate outputs through authorised features']} />
        <p className="font-medium text-foreground mt-3">Users may not:</p>
        <LegalList items={['Reverse engineer software', 'Circumvent security controls', 'Resell products without permission', 'Use services unlawfully', 'Interfere with platform operation']} />
      </LegalSection>

      <LegalSection title="5. Intellectual Property">
        <p>All software, content, designs, databases, trademarks, and materials remain the property of Cvetanichin or its licensors.</p>
        <p>Purchases grant a limited, non-exclusive licence to use products according to these terms.</p>
      </LegalSection>

      <LegalSection title="6. AI Features">
        <p>Some products may incorporate AI-assisted functionality.</p>
        <p>Generated outputs are provided for informational purposes only and should be independently reviewed before making decisions.</p>
      </LegalSection>

      <LegalSection title="7. Payments">
        <p>Payments are processed through Paddle as Merchant of Record.</p>
        <p>Pricing, taxes, subscriptions, renewals, and payment processing are managed through Paddle.</p>
      </LegalSection>

      <LegalSection title="8. Service Availability">
        <p>We aim to provide reliable services but do not guarantee uninterrupted availability.</p>
        <p>Maintenance, upgrades, or external factors may occasionally affect access.</p>
      </LegalSection>

      <LegalSection title="9. Disclaimer">
        <p>Services are provided on an "as available" basis.</p>
        <p>We make no guarantee regarding specific outcomes, funding success, grant awards, business results, or organisational performance.</p>
      </LegalSection>

      <LegalSection title="10. Limitation of Liability">
        <p>To the fullest extent permitted by law, Cvetanichin shall not be liable for indirect, incidental, consequential, or special damages arising from the use of our services.</p>
      </LegalSection>

      <LegalSection title="11. Termination">
        <p>We may suspend or terminate access for violations of these Terms.</p>
      </LegalSection>

      <LegalSection title="12. Changes">
        <p>We may update these Terms periodically. Continued use constitutes acceptance of revised Terms.</p>
      </LegalSection>

      <LegalSection title="13. Contact">
        <p><a href="mailto:cvetanichin@gmail.com" className="text-primary hover:underline">cvetanichin@gmail.com</a></p>
      </LegalSection>
    </LegalLayout>
  )
}
