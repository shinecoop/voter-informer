export const PLATFORM_ISSUES = [
  { id: "economy", label: "Economy" },
  { id: "housing", label: "Housing" },
  { id: "health-care", label: "Health care" },
  { id: "education", label: "Education" },
  { id: "climate-energy", label: "Climate and energy" },
  { id: "immigration", label: "Immigration" },
  { id: "gun-policy", label: "Gun policy" },
  { id: "democracy", label: "Democracy" },
  { id: "veterans", label: "Veterans" },
  { id: "foreign-policy", label: "Foreign policy" },
] as const;

export type PlatformIssueId = typeof PLATFORM_ISSUES[number]["id"];
