import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Credo - Distributed Collaboration',
  description: 'A credibility-based collaboration platform for distributed teams',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <header className="header">
          <div className="container">
            <h1>Credo</h1>
            <nav>
              <a href="/">Home</a>
              <a href="/branches">Branches</a>
              <a href="/profile">Profile</a>
            </nav>
          </div>
        </header>
        <main className="main">
          {children}
        </main>
        <footer className="footer">
          <div className="container">
            <p>Credo Platform v0.1.0 - MVP</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
