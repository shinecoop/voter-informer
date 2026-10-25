import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voter Informer | Explore the United States",
  description: "Explore U.S. congressional districts and sourced candidate lists for Colorado’s 2026 general election.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
