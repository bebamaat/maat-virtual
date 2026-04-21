import "./globals.css";
import { DM_Sans } from "next/font/google";
import { Providers } from "./providers";
import data from "../data/maat-virtual.json";
import { validateMaatVirtual } from "../lib/validate.js";

validateMaatVirtual(data);

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata = {
  title: "MAAT Virtual — Painel Central",
  description: "Painel da empresa virtual MAAT",
};

const themeBootstrap = `
(function() {
  try {
    var stored = localStorage.getItem('maat-virtual-theme');
    var theme = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={dmSans.variable}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
