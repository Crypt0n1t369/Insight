'use client';

import { useState } from 'react';

type BugCategory = 'bug' | 'feature' | 'improvement' | 'other';

interface BugReport {
  category: BugCategory;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function BugReportButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState<BugReport>({
    category: 'bug',
    title: '',
    description: '',
    severity: 'medium',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Store in localStorage for now (can be expanded to API)
    const reports = JSON.parse(localStorage.getItem('bugReports') || '[]');
    reports.push({
      ...report,
      id: Date.now(),
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('bugReports', JSON.stringify(reports));
    
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setReport({ category: 'bug', title: '', description: '', severity: 'medium' });
    }, 1500);
  };

  return (
    <>
      {/* Floating Button */}
      <button
        className="bug-report-fab"
        onClick={() => setIsOpen(true)}
        title="Report a bug or feature request"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
          <path d="M12 8v4M12 16h.01"/>
        </svg>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="bug-report-overlay" onClick={() => setIsOpen(false)}>
          <div className="bug-report-modal" onClick={(e) => e.stopPropagation()}>
            {submitted ? (
              <div className="bug-report-success">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#38a169" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                <p>Report submitted!</p>
              </div>
            ) : (
              <>
                <div className="bug-report-header">
                  <h2>Report Issue</h2>
                  <button className="close-btn" onClick={() => setIsOpen(false)}>×</button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Type</label>
                    <select
                      value={report.category}
                      onChange={(e) => setReport({ ...report, category: e.target.value as BugCategory })}
                    >
                      <option value="bug">🐛 Bug</option>
                      <option value="feature">✨ Feature Request</option>
                      <option value="improvement">💡 Improvement</option>
                      <option value="other">❓ Other</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Severity</label>
                    <select
                      value={report.severity}
                      onChange={(e) => setReport({ ...report, severity: e.target.value as BugReport['severity'] })}
                    >
                      <option value="low">Low - Minor inconvenience</option>
                      <option value="medium">Medium - Workaround exists</option>
                      <option value="high">High - Blocked</option>
                      <option value="critical">Critical - Data loss/Security</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      placeholder="Brief summary"
                      value={report.title}
                      onChange={(e) => setReport({ ...report, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      placeholder="Steps to reproduce / details..."
                      value={report.description}
                      onChange={(e) => setReport({ ...report, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary">Submit Report</button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
