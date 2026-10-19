import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPatient, PATIENTS, type PatientId } from "../lib/patients";
import { MentalHealthExperience } from "../../src/components/MentalHealthExperience";

type PatientPageProps = {
  params: Promise<{ patient: string }>;
};

export function generateStaticParams() {
  return PATIENTS.map((patient) => ({ patient: patient.id }));
}

export async function generateMetadata({
  params,
}: PatientPageProps): Promise<Metadata> {
  const { patient } = await params;
  const match = findPatient(patient);
  if (!match) {
    return {};
  }
  return {
    title: `${match.name} | CU School of Dental Medicine - Mental Health Assessment`,
  };
}

export default async function PatientPage({ params }: PatientPageProps) {
  const { patient } = await params;
  const match = findPatient(patient);
  if (!match) {
    notFound();
  }

  return <MentalHealthExperience initialPatientId={match.id as PatientId} />;
}
