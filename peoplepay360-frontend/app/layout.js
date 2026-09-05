import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import AuthProvider from "@/components/providers/AuthProvider";
import ThemeProvider from "@/components/providers/ThemeProvider";
import "./globals.css";

// Runs before hydration so the correct theme class is already on <html>
// by first paint — avoids a flash of the wrong theme on load/refresh.
const NO_FLASH_THEME_SCRIPT = `
  (function () {
    try {
      var stored = localStorage.getItem("theme");
      var theme = stored || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      if (theme === "dark") document.documentElement.classList.add("dark");
    } catch (e) {}
  })();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PeoplePay360",
  description: "HR & Payroll platform",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="no-flash-theme" strategy="beforeInteractive">
          {NO_FLASH_THEME_SCRIPT}
        </Script>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
