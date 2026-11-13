import { notFound } from "next/navigation";
import { PRESENTATION_SCENARIOS } from "../../lib/presentationScenarios";
import { PresentationExperience } from "../../../src/components/PresentationExperience";

type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const scenario = PRESENTATION_SCENARIOS.find((entry) => entry.slug === slug);
  return {
    title: {
      absolute: scenario
        ? `${scenario.avatar.name.split(" ")[0]} · ${scenario.role} | Research Exchange`
        : "Research Exchange",
    },
  };
}
export function generateStaticParams() {
  return PRESENTATION_SCENARIOS.map(({ slug }) => ({ slug }));
}
export default async function PresentationPage({ params }: Props) {
  const { slug } = await params;
  const scenario = PRESENTATION_SCENARIOS.find((entry) => entry.slug === slug);
  if (!scenario) notFound();
  return <PresentationExperience scenario={scenario} />;
}
