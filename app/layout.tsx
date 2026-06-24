import "./globals.css";

export const metadata = {
  title: "UK Compliance Checker — ishsitotombe.co.uk",
  description: "Full UK legal audit — GDPR, PECR, Companies Act, Consumer Rights Act, and more. Up to 260 checks across 21 industry categories.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Sync theme from localStorage before React hydrates to prevent flash */}
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){try{var t=localStorage.getItem('theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();`
        }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
