import "./globals.css";

export const metadata = {
  title: "Agent Desk",
  description: "Personal analytics agent harness"
};

export default function RootLayout({ children }) {
  return <html lang="ru"><body>{children}</body></html>;
}
