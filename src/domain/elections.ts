export const COLORADO_ELECTION_YEAR = 2026;

export function candidatePath(district: number, year: number = COLORADO_ELECTION_YEAR): string {
  return `/${year}/colorado/us-house/district-${district}/candidates`;
}

export const COLORADO_STATEWIDE_OFFICES = [
  { office: "senate", slug: "us-senate", label: "U.S. Senate" },
  { office: "governor", slug: "governor", label: "Governor" },
  { office: "secretary-of-state", slug: "secretary-of-state", label: "Secretary of State" },
  { office: "treasurer", slug: "treasurer", label: "Treasurer" },
] as const;

export type StatewideOffice = typeof COLORADO_STATEWIDE_OFFICES[number]["office"];

export function statewideCandidatePath(office: StatewideOffice, year: number = COLORADO_ELECTION_YEAR): string {
  const slug = COLORADO_STATEWIDE_OFFICES.find((entry) => entry.office === office)!.slug;
  return `/${year}/colorado/${slug}/candidates`;
}

export function senateCandidatePath(year: number = COLORADO_ELECTION_YEAR): string {
  return statewideCandidatePath("senate", year);
}

/** A month-only birth date cannot determine age during the birth month. */
export function ageOnDate(birthDate: string | null | undefined, asOf: string): number | null {
  if (!birthDate) return null;
  const [birthYear, birthMonth, birthDay] = birthDate.split("-").map(Number);
  const [year, month, day] = asOf.split("-").map(Number);
  if (birthYear === undefined || birthMonth === undefined || year === undefined || month === undefined || day === undefined) return null;
  if (birthDay === undefined && month === birthMonth) return null;
  const beforeBirthday = month < birthMonth || (month === birthMonth && birthDay !== undefined && day < birthDay);
  const age = year - birthYear - Number(beforeBirthday);
  return age >= 0 ? age : null;
}
