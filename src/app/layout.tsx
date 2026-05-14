import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "SmartProperty — Calculadora de ROI imobiliário",
  description: "Calcule o ROI de um flip imobiliário em Portugal: IMT, IS, mais-valias, financiamento e custos de detenção.",
};

export const viewport: Viewport = {
  themeColor: "#0b1224",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased min-h-screen`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
