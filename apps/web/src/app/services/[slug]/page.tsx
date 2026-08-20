import { ServiceDetailDossier } from "@/components/services/ServiceDetailDossier";

export default function ServiceDetails({ params }: { params: Promise<{ slug: string }> }) {
  return <ServiceDetailDossier params={params} />;
}
