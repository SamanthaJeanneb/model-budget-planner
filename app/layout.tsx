import type { Metadata } from "next";
import { Geist_Mono, Inter } from "next/font/google";
import { MotionRoot } from "@/components/ui/MotionRoot";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Model Budget",
  description: "Split a project into tasks and pick the best model each task can afford.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${geistMono.variable}`}>
      <body className="bg-canvas text-ink">
        <MotionRoot>{children}</MotionRoot>
      </body>
    </html>
  );
}
