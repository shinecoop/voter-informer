export const COLORADO_ELECTION_YEAR = 2026;

export function candidatePath(district: number): string {
  return `/${COLORADO_ELECTION_YEAR}/colorado/district${district}/candidates`;
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
