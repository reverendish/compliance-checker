import "./globals.css";

export const metadata = {
  title: "UK Compliance Checker — ishsitotombe.co.uk",
  description:
    "Instant audit of any UK website against GDPR, PECR, and consumer law. Not legal advice.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
