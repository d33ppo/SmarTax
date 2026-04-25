import BusinessSmeWizardClient from './wizard-client'

type BusinessSmeWizardPageProps = {
  searchParams: Promise<{
    filingId?: string | string[]
  }>
}

export default async function BusinessSmeWizardPage({ searchParams }: BusinessSmeWizardPageProps) {
  const resolvedSearchParams = await searchParams;
  const filingId = Array.isArray(resolvedSearchParams?.filingId) ? resolvedSearchParams?.filingId[0] : resolvedSearchParams?.filingId || null

  return <BusinessSmeWizardClient filingId={filingId} />
}
