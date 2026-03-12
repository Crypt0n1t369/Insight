'use client';

import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="container" style={{ padding: '2rem', maxWidth: '800px' }}>
      <h1>About Credo</h1>
      
      <section style={{ marginBottom: '2rem' }}>
        <h2>What is Credo?</h2>
        <p>
          Credo is a <strong>distributed collaboration platform</strong> designed for teams 
          and communities to work together without hierarchical structures. Instead of traditional 
          top-down management, Credo uses a <strong>credibility-based reputation system</strong> 
          to surface the most valuable contributions.
        </p>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Core Concepts</h2>
        
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>🌿 Branches</h3>
          <p>
            Branches are like workspaces or teams. Each branch can have sub-branches, 
            creating a tree structure. Branches can focus on specific topics, projects, 
            or areas of expertise.
          </p>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>💡 Contributions</h3>
          <p>
            Contributions are ideas, comments, questions, resources, or syntheses shared 
            within a branch. Anyone can contribute, and contributions can be 
            <strong> endorsed</strong> by other members to increase their credibility.
          </p>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>👍 Endorsements</h3>
          <p>
            When you endorse a contribution, you signal that you find it valuable. 
            Endorsements increase the contributor's credibility score, helping 
            quality ideas rise to the top organically.
          </p>
        </div>

        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>📊 Credibility</h3>
          <p>
            Your credibility score is calculated based on the endorsements your 
            contributions receive. Higher credibility means your future contributions 
            carry more weight in the community.
          </p>
        </div>

        <div className="card">
          <h3>🗳️ Proposals</h3>
          <p>
            Branches can create proposals for important decisions. Members can vote 
            on proposals, with voting power influenced by credibility scores.
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2>Getting Started</h2>
        <ol style={{ lineHeight: '2' }}>
          <li><Link href="/join" style={{ color: 'var(--accent)' }}>Create an anonymous identity</Link> — no email required</li>
          <li><Link href="/branches" style={{ color: 'var(--accent)' }}>Explore branches</Link> or create your own</li>
          <li>Add contributions to share ideas</li>
          <li>Endorse contributions you find valuable</li>
          <li>Build your credibility over time</li>
        </ol>
      </section>

      <section>
        <h2>Why Anonymous?</h2>
        <p>
          Credo uses <strong>pseudo-anonymous</strong> identities. You don't need to reveal 
          your real name — just create an identity and build your reputation through 
          quality contributions. This encourages egoless collaboration and focuses 
          on the ideas, not the person.
        </p>
      </section>

      <div style={{ marginTop: '3rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '8px' }}>
        <Link href="/join" className="btn btn-primary" style={{ marginRight: '1rem' }}>
          Get Started
        </Link>
        <Link href="/branches" className="btn">
          Explore Branches
        </Link>
      </div>
    </div>
  );
}
