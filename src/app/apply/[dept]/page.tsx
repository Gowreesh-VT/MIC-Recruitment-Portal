import { redirect } from "next/navigation";
import { getCanonicalDeptSlug } from "@/lib/constants";

interface RouteParams {
  params: Promise<{ dept: string }>;
}

export default async function ApplyDeptCatchAllPage({ params }: RouteParams) {
  const { dept } = await params;
  const canonicalSlug = getCanonicalDeptSlug(dept);
  redirect(`/apply/${canonicalSlug}/quest-1`);
}
