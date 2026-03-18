'use client';

import { useState, useEffect } from 'react';

interface LeaderboardUser {
  id: string;
  username: string;
  credibility: number;
  trustTier: string;
  totalEndorsements: number;
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/users/leaderboard')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setUsers(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <h2>Leaderboard</h2>
      <p className="subtitle">Top contributors by credibility</p>
      
      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>No users yet. Be the first to join!</p>
          <a href="/join" className="btn">Join Now</a>
        </div>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Credibility</th>
              <th>Tier</th>
              <th>Endorsements</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id}>
                <td className="rank">#{index + 1}</td>
                <td className="username">{user.username}</td>
                <td className="credibility">{user.credibility}</td>
                <td>
                  <span className={`tier tier-${user.trustTier.toLowerCase()}`}>
                    {user.trustTier}
                  </span>
                </td>
                <td>{user.totalEndorsements}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <style jsx>{`
        .subtitle {
          color: #666;
          margin-bottom: 2rem;
        }
        .empty-state {
          text-align: center;
          padding: 3rem;
          background: #f9f9f9;
          border-radius: 8px;
        }
        .leaderboard-table {
          width: 100%;
          border-collapse: collapse;
        }
        .leaderboard-table th,
        .leaderboard-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #eee;
        }
        .leaderboard-table th {
          font-weight: 600;
          color: #666;
        }
        .rank {
          font-weight: bold;
          color: #666;
          width: 60px;
        }
        .username {
          font-weight: 500;
        }
        .credibility {
          font-weight: bold;
          color: #2a9d8f;
        }
        .tier {
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.85rem;
          font-weight: 500;
        }
        .tier-bronze { background: #f4a261; color: white; }
        .tier-silver { background: #adb5bd; color: white; }
        .tier-gold { background: #ffd700; color: #333; }
        .tier-platinum { background: #e5e4e2; color: #333; }
        .btn {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: #2a9d8f;
          color: white;
          border-radius: 6px;
          text-decoration: none;
          margin-top: 1rem;
        }
      `}</style>
    </div>
  );
}
