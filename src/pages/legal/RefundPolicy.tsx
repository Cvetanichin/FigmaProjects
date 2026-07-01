import { LegalLayout, LegalSection } from './LegalLayout'

export function RefundPolicy() {
  return (
    <LegalLayout title="Refund Policy" updated="24 June 2026">
      <LegalSection title="Digital Products">
        <p>Because our products are digital and delivered immediately upon purchase, refunds are generally not available after access has been granted.</p>
      </LegalSection>

      <LegalSection title="Subscription Products">
        <p>If you believe a billing error has occurred, contact us within 14 days of the transaction.</p>
        <p>We will review requests fairly and may provide refunds at our discretion where appropriate.</p>
      </LegalSection>

      <LegalSection title="Duplicate Purchases">
        <p>Accidental duplicate purchases are eligible for refund upon verification.</p>
      </LegalSection>

      <LegalSection title="Technical Issues">
        <p>If a technical issue prevents access to a purchased product and we are unable to resolve the issue within a reasonable timeframe, a refund may be considered.</p>
      </LegalSection>

      <LegalSection title="Chargebacks">
        <p>Please contact us before initiating a chargeback so we can attempt to resolve the issue directly.</p>
      </LegalSection>

      <LegalSection title="Contact">
        <p><a href="mailto:cvetanichin@gmail.com" className="text-primary hover:underline">cvetanichin@gmail.com</a></p>
      </LegalSection>
    </LegalLayout>
  )
}
