import "./globals.css";

export const metadata = {
  title: "UK Compliance Checker — ishsitotombe.co.uk",
  description: "Full UK legal audit — GDPR, PECR, Companies Act, Consumer Rights Act, and more. 36 checks across 6 categories.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
