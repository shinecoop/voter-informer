import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voter Informer | Explore the United States",
  description: "An independent election research prototype. Verified research coverage is not yet available.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
