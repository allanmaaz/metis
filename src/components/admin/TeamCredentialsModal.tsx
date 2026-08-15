import React, { useState } from 'react';
import { Team, TeamMember } from '../../types';
import { Modal } from '../ui/Modal';
import { Printer, Copy, Check, ShieldCheck, QrCode, ExternalLink, Sparkles } from 'lucide-react';
import { formatWealth } from '../../lib/formatting';

interface TeamCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  membersMap: Record<string, TeamMember[]>;
  singleTeam?: Team | null;
}

export const TeamCredentialsModal: React.FC<TeamCredentialsModalProps> = ({
  isOpen,
  onClose,
  teams,
  membersMap,
  singleTeam,
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedTeamId, setCopiedTeamId] = useState<string | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);

  const activeTeams = singleTeam ? [singleTeam] : teams;
  const portalUrl = 'https://metis-bvx.pages.dev';

  const formatTeamText = (team: Team) => {
    const pin = team.pin_hash || '4821';
    const members = membersMap[team.id] || [];
    const memberList = members.map(m => m.full_name).join(', ') || 'Team Members';

    return `🏛️ *METIS 2026 — Official Team Access Credentials*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 *Team Name:* ${team.name}
👤 *Members:* ${memberList}
🎟️ *Team Code:* \`${team.team_code}\`
🔑 *Security PIN:* \`${pin}\`
💰 *Starting Capital:* ${formatWealth(team.cash_balance)}
🌐 *Trading Portal:* ${portalUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 *Login Instructions:*
1. Visit ${portalUrl}
2. Enter your Team Code and Security PIN
3. Start trading live as soon as market opens!

_Keep your PIN confidential. Authorized participant use only._`;
  };

  const handleCopySingle = (team: Team) => {
    navigator.clipboard.writeText(formatTeamText(team));
    setCopiedTeamId(team.id);
    setTimeout(() => setCopiedTeamId(null), 2000);
  };

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  const handleCopyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPinId(id);
    setTimeout(() => setCopiedPinId(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = activeTeams
      .map((team, idx) => {
        const pin = team.pin_hash || '4821';
        const members = (membersMap[team.id] || []).map(m => m.full_name).join(', ') || 'N/A';
        return `[#${idx + 1}] ${team.name}
Members: ${members}
Team Code: ${team.team_code} | PIN: ${pin} | Capital: ${formatWealth(team.cash_balance)}`;
      })
      .join('\n' + '─'.repeat(45) + '\n');

    const fullSummary = `🏛️ METIS 2026 — OFFICIAL TEAM CREDENTIALS ROSTER (${activeTeams.length} Teams)
Portal: ${portalUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${allText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Generated on ${new Date().toLocaleString()}`;

    navigator.clipboard.writeText(fullSummary);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  const handlePrintPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to open the printable PDF view.');
      return;
    }

    const isSingle = activeTeams.length === 1;

    const cardsHtml = activeTeams
      .map((team, idx) => {
        const pin = team.pin_hash || '4821';
        const members = membersMap[team.id] || [];
        const memberNames = members.map(m => m.full_name).join(', ') || 'Registered Participant';

        if (isSingle) {
          // Large, full-page executive pass design for single team print
          return `
          <div class="page-container">
            <!-- MAIN OFFICIAL PASS -->
            <div class="executive-pass">
              <div class="pass-header-strip">
                <div class="brand-left">
                  <span class="metis-logo">🏛️ METIS 2026</span>
                  <span class="sub-logo">SIMULATED STOCK TRADING ARENA · ROUND 2</span>
                </div>
                <div class="badge-right">
                  <span class="official-tag">OFFICIAL ACCESS PASS</span>
                  <span class="serial-tag">AUTH #${team.team_code}</span>
                </div>
              </div>

              <div class="pass-content">
                <div class="team-spotlight">
                  <div class="team-avatar-lg">${team.name.charAt(0)}</div>
                  <div class="team-info-lg">
                    <div class="status-pill">OFFICIAL COMPETITOR · VERIFIED</div>
                    <h1 class="team-title-lg">${team.name}</h1>
                    <p class="members-lg"><strong>Team Members:</strong> ${memberNames}</p>
                  </div>
                </div>

                <div class="key-credentials-box">
                  <div class="cred-cell primary">
                    <span class="cell-label">OFFICIAL TEAM ACCESS CODE</span>
                    <div class="cell-value-code">${team.team_code}</div>
                    <span class="cell-sub">Enter on the participant portal to unlock trading terminal</span>
                  </div>
                  <div class="cred-cell secondary">
                    <span class="cell-label">CONFIDENTIAL SECURITY PIN</span>
                    <div class="cell-value-pin">${pin}</div>
                    <span class="cell-sub">4-Digit authorized trading authentication PIN</span>
                  </div>
                </div>

                <div class="trading-parameters-grid">
                  <div class="param-card">
                    <span class="param-label">STARTING CAPITAL</span>
                    <span class="param-value">${formatWealth(team.cash_balance)}</span>
                  </div>
                  <div class="param-card">
                    <span class="param-label">TRADING PORTAL</span>
                    <span class="param-value link">metis-bvx.pages.dev</span>
                  </div>
                  <div class="param-card">
                    <span class="param-label">ARENA VENUE</span>
                    <span class="param-value">Main Trading Floor</span>
                  </div>
                </div>

                <div class="login-guide-card">
                  <h3>🚀 Step-by-Step Login Instructions:</h3>
                  <ol>
                    <li>Connect to the event network and visit <strong>${portalUrl}</strong> on any browser.</li>
                    <li>Select your team or input your Team Access Code: <strong>${team.team_code}</strong>.</li>
                    <li>Choose your name from the roster and enter your Security PIN: <strong>${pin}</strong>.</li>
                    <li>When the market opens, execute live buys & sells to maximize portfolio wealth!</li>
                  </ol>
                </div>

                <div class="pass-seal-row">
                  <div class="rules-note">
                    <strong>⚠️ Confidentiality Notice:</strong> This pass contains authorized access credentials. All trades executed under this team ID are final and binding on the competition leaderboard.
                  </div>
                  <div class="signature-box">
                    <div class="sig-line"></div>
                    <span>Authorized Event Official</span>
                  </div>
                </div>
              </div>

              <div class="pass-footer-strip">
                <span>METIS Market Engine v3.0 · Ultra-Low-Latency Realtime Trading Simulation</span>
                <span>Pass Issued: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
              </div>
            </div>

            <!-- CUT LINE -->
            <div class="cut-divider">
              <span class="cut-label">✂️ &nbsp; TEAR-OFF PARTICIPANT QUICK REFERENCE SLIP &nbsp; ✂️</span>
            </div>

            <!-- SECONDARY TEAR-OFF SLIP -->
            <div class="slip-card">
              <div class="slip-header">
                <div>
                  <span class="slip-title">🏛️ METIS 2026 · TEAM TRADING SLIP</span>
                  <span class="slip-sub">${team.name} · Roster: ${memberNames}</span>
                </div>
                <div class="slip-portal">Portal: <strong>${portalUrl.replace('https://', '')}</strong></div>
              </div>
              <div class="slip-body">
                <div class="slip-box highlight">
                  <span class="slip-lbl">TEAM CODE</span>
                  <span class="slip-val">${team.team_code}</span>
                </div>
                <div class="slip-box">
                  <span class="slip-lbl">SECURITY PIN</span>
                  <span class="slip-val">${pin}</span>
                </div>
                <div class="slip-box">
                  <span class="slip-lbl">ALLOCATED CAPITAL</span>
                  <span class="slip-val">${formatWealth(team.cash_balance)}</span>
                </div>
              </div>
            </div>
          </div>
        `;
        }

        // Multi-card layout for bulk team printing (2 cards per page with cut lines)
        return `
          <div class="multi-card">
            <div class="multi-header">
              <div class="multi-brand">🏛️ METIS 2026 · PARTICIPANT ACCESS PASS</div>
              <div class="multi-serial">PASS #${idx + 1}</div>
            </div>

            <div class="multi-body">
              <div class="multi-team-row">
                <div class="multi-avatar">${team.name.charAt(0)}</div>
                <div>
                  <div class="multi-team-name">${team.name}</div>
                  <div class="multi-members">${memberNames}</div>
                </div>
              </div>

              <div class="multi-creds-row">
                <div class="multi-cred-box highlight">
                  <span class="lbl">TEAM CODE</span>
                  <span class="val">${team.team_code}</span>
                </div>
                <div class="multi-cred-box">
                  <span class="lbl">SECURITY PIN</span>
                  <span class="val">${pin}</span>
                </div>
              </div>

              <div class="multi-meta-row">
                <div><strong>Capital:</strong> ${formatWealth(team.cash_balance)}</div>
                <div><strong>Portal:</strong> ${portalUrl.replace('https://', '')}</div>
              </div>
            </div>

            <div class="multi-footer">
              <span>Authorized for official Metis 2026 trading simulation</span>
              <span>✂️ CUT HERE</span>
            </div>
          </div>
        `;
      })
      .join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>METIS 2026 — Official Team Credentials Pass</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800;900&family=JetBrains+Mono:wght@500;700;800&display=swap');
            
            * { box-sizing: border-box; margin: 0; padding: 0; }
            @page {
              size: A4 portrait;
              margin: ${isSingle ? '10mm' : '8mm'};
            }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              background-color: #ffffff;
              color: #0f172a;
              padding: ${isSingle ? '0' : '10px'};
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* Single Team Executive Pass */
            .page-container {
              width: 100%;
              max-width: 190mm;
              margin: 0 auto;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }

            .executive-pass {
              width: 100%;
              border: 2px solid #0f172a;
              border-radius: 18px;
              overflow: hidden;
              background: #ffffff;
              box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
            }

            .pass-header-strip {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              color: #ffffff;
              padding: 14px 22px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              border-bottom: 3px solid #f97316;
            }
            .metis-logo {
              font-size: 20px;
              font-weight: 900;
              letter-spacing: -0.5px;
              display: block;
            }
            .sub-logo {
              font-size: 10px;
              font-weight: 700;
              color: #fdba74;
              letter-spacing: 1px;
              text-transform: uppercase;
              margin-top: 1px;
              display: block;
            }
            .badge-right {
              text-align: right;
            }
            .official-tag {
              display: inline-block;
              background: #f97316;
              color: #ffffff;
              font-size: 10px;
              font-weight: 800;
              padding: 3px 10px;
              border-radius: 6px;
              letter-spacing: 0.5px;
            }
            .serial-tag {
              display: block;
              font-family: 'JetBrains Mono', monospace;
              font-size: 10px;
              color: #94a3b8;
              font-weight: 700;
              margin-top: 2px;
            }

            .pass-content {
              padding: 18px 22px;
              display: flex;
              flex-direction: column;
              gap: 14px;
            }

            .team-spotlight {
              display: flex;
              align-items: center;
              gap: 14px;
              padding-bottom: 12px;
              border-bottom: 1.5px solid #f1f5f9;
            }
            .team-avatar-lg {
              width: 52px;
              height: 52px;
              border-radius: 14px;
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: #ffffff;
              font-size: 26px;
              font-weight: 900;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 12px rgba(249, 115, 22, 0.25);
            }
            .status-pill {
              display: inline-block;
              font-family: 'JetBrains Mono', monospace;
              font-size: 9px;
              font-weight: 800;
              color: #059669;
              background: #ecfdf5;
              border: 1px solid #a7f3d0;
              padding: 1px 8px;
              border-radius: 5px;
              margin-bottom: 4px;
            }
            .team-title-lg {
              font-size: 24px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: -0.5px;
              line-height: 1.1;
            }
            .members-lg {
              font-size: 12px;
              color: #475569;
              margin-top: 2px;
            }

            .key-credentials-box {
              display: grid;
              grid-template-columns: 1.3fr 0.9fr;
              gap: 12px;
            }
            .cred-cell {
              border-radius: 14px;
              padding: 12px 16px;
              border: 1.5px solid #e2e8f0;
            }
            .cred-cell.primary {
              background: #fff7ed;
              border-color: #f97316;
            }
            .cred-cell.secondary {
              background: #f8fafc;
              border-color: #cbd5e1;
            }
            .cell-label {
              font-family: 'JetBrains Mono', monospace;
              font-size: 9px;
              font-weight: 800;
              letter-spacing: 0.5px;
              display: block;
              margin-bottom: 4px;
            }
            .cred-cell.primary .cell-label { color: #c2410c; }
            .cred-cell.secondary .cell-label { color: #475569; }
            .cell-value-code {
              font-family: 'JetBrains Mono', monospace;
              font-size: 24px;
              font-weight: 900;
              color: #ea580c;
              letter-spacing: 1.5px;
            }
            .cell-value-pin {
              font-family: 'JetBrains Mono', monospace;
              font-size: 24px;
              font-weight: 900;
              color: #0f172a;
              letter-spacing: 3px;
            }
            .cell-sub {
              font-size: 10px;
              color: #64748b;
              margin-top: 2px;
              display: block;
            }

            .trading-parameters-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 10px;
            }
            .param-card {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 10px 14px;
            }
            .param-label {
              font-size: 8.5px;
              font-weight: 800;
              color: #64748b;
              letter-spacing: 0.5px;
              display: block;
              margin-bottom: 2px;
            }
            .param-value {
              font-family: 'JetBrains Mono', monospace;
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
              white-space: nowrap;
            }
            .param-value.link {
              color: #2563eb;
              font-size: 11.5px;
            }

            .login-guide-card {
              background: #f0fdf4;
              border: 1.5px solid #86efac;
              border-radius: 12px;
              padding: 12px 16px;
            }
            .login-guide-card h3 {
              font-size: 12px;
              font-weight: 800;
              color: #15803d;
              margin-bottom: 6px;
            }
            .login-guide-card ol {
              padding-left: 18px;
              font-size: 11px;
              color: #166534;
              line-height: 1.5;
            }

            .pass-seal-row {
              display: flex;
              align-items: flex-end;
              justify-content: space-between;
              gap: 16px;
              padding-top: 8px;
              border-top: 1px dashed #cbd5e1;
            }
            .rules-note {
              font-size: 10px;
              color: #64748b;
              max-width: 65%;
              line-height: 1.35;
            }
            .signature-box {
              text-align: center;
              min-width: 150px;
            }
            .sig-line {
              width: 100%;
              border-bottom: 1.5px solid #94a3b8;
              margin-bottom: 4px;
              height: 20px;
            }
            .signature-box span {
              font-size: 9px;
              font-weight: 700;
              color: #64748b;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .pass-footer-strip {
              background: #f8fafc;
              border-top: 1.5px solid #e2e8f0;
              padding: 8px 22px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 9.5px;
              color: #94a3b8;
              font-weight: 600;
            }

            /* Tear-off divider */
            .cut-divider {
              text-align: center;
              position: relative;
              margin: 6px 0;
            }
            .cut-divider::before {
              content: '';
              position: absolute;
              left: 0;
              right: 0;
              top: 50%;
              border-top: 1.5px dashed #94a3b8;
              z-index: 1;
            }
            .cut-label {
              position: relative;
              z-index: 2;
              background: #ffffff;
              padding: 0 14px;
              font-size: 9px;
              font-weight: 800;
              color: #64748b;
              font-family: 'JetBrains Mono', monospace;
              letter-spacing: 1px;
            }

            /* Secondary Tear-Off Slip */
            .slip-card {
              border: 1.5px dashed #94a3b8;
              border-radius: 14px;
              padding: 12px 18px;
              background: #f8fafc;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .slip-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .slip-title {
              font-size: 12px;
              font-weight: 900;
              color: #0f172a;
              display: block;
            }
            .slip-sub {
              font-size: 10px;
              color: #64748b;
              font-weight: 600;
            }
            .slip-portal {
              font-size: 10px;
              font-family: 'JetBrains Mono', monospace;
              color: #2563eb;
            }
            .slip-body {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 10px;
            }
            .slip-box {
              background: #ffffff;
              border: 1px solid #cbd5e1;
              border-radius: 10px;
              padding: 8px 12px;
            }
            .slip-box.highlight {
              border-color: #f97316;
              background: #fff7ed;
            }
            .slip-lbl {
              font-family: 'JetBrains Mono', monospace;
              font-size: 8px;
              font-weight: 800;
              color: #64748b;
              display: block;
            }
            .slip-box.highlight .slip-lbl { color: #c2410c; }
            .slip-val {
              font-family: 'JetBrains Mono', monospace;
              font-size: 15px;
              font-weight: 900;
              color: #0f172a;
            }
            .slip-box.highlight .slip-val { color: #ea580c; }

            /* Multi-pass Grid Layout */
            .multi-grid {
              display: grid;
              grid-template-columns: 1fr;
              gap: 24px;
            }
            .multi-card {
              border: 2px dashed #94a3b8;
              border-radius: 18px;
              overflow: hidden;
              background: #ffffff;
              page-break-inside: avoid;
              margin-bottom: 16px;
            }
            .multi-header {
              background: #0f172a;
              color: #ffffff;
              padding: 10px 16px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 11px;
              font-weight: 800;
            }
            .multi-body {
              padding: 16px;
              display: flex;
              flex-direction: column;
              gap: 12px;
            }
            .multi-team-row {
              display: flex;
              align-items: center;
              gap: 12px;
            }
            .multi-avatar {
              width: 42px;
              height: 42px;
              border-radius: 12px;
              background: #f97316;
              color: #ffffff;
              font-weight: 900;
              font-size: 18px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .multi-team-name {
              font-size: 18px;
              font-weight: 900;
              color: #0f172a;
            }
            .multi-members {
              font-size: 11px;
              color: #64748b;
            }
            .multi-creds-row {
              display: grid;
              grid-template-columns: 1.2fr 0.8fr;
              gap: 10px;
            }
            .multi-cred-box {
              padding: 10px 14px;
              border-radius: 12px;
              border: 1.5px solid #e2e8f0;
              background: #f8fafc;
            }
            .multi-cred-box.highlight {
              background: #fff7ed;
              border-color: #f97316;
            }
            .multi-cred-box .lbl {
              font-family: 'JetBrains Mono', monospace;
              font-size: 9px;
              font-weight: 800;
              display: block;
              color: #64748b;
            }
            .multi-cred-box.highlight .lbl { color: #c2410c; }
            .multi-cred-box .val {
              font-family: 'JetBrains Mono', monospace;
              font-size: 20px;
              font-weight: 900;
              color: #0f172a;
            }
            .multi-cred-box.highlight .val { color: #ea580c; }
            .multi-meta-row {
              display: flex;
              justify-content: space-between;
              font-size: 11px;
              color: #475569;
              padding-top: 8px;
              border-top: 1px dashed #e2e8f0;
            }
            .multi-footer {
              background: #f8fafc;
              padding: 8px 16px;
              border-top: 1px solid #e2e8f0;
              display: flex;
              justify-content: space-between;
              font-size: 9px;
              color: #94a3b8;
              font-weight: 700;
            }

            @media print {
              body { background: white; padding: 0; }
              .executive-pass { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          ${isSingle ? cardsHtml : `<div class="multi-grid">${cardsHtml}</div>`}
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth={singleTeam ? '2xl' : '3xl'}
      title={singleTeam ? `${singleTeam.name} — Access Credentials` : 'Team Access Credentials & Passes'}
      subtitle={
        singleTeam
          ? 'Official credentials pass with quick copy and print export'
          : `Export, print, or copy credentials for ${activeTeams.length} registered teams`
      }
    >
      <div className="space-y-4 pt-1 font-sans">
        {/* Action Header Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-white/10 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white font-mono font-extrabold text-[10px] uppercase tracking-wide">
                OFFICIAL PASS
              </span>
              <span className="font-extrabold text-sm text-slate-100">
                {singleTeam ? singleTeam.name : `${activeTeams.length} Teams`}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Print official passes or copy formatted text for WhatsApp/Email.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={handleCopyAll}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/10 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied All!' : 'Copy Invite Text'}</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-orange-500/25"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Passes Preview Box */}
        <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
          {singleTeam ? (
            // Single Team High-Visibility Card
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 space-y-4 shadow-sm text-slate-900">
              {/* Header */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-xl shadow-sm shadow-orange-500/30 shrink-0">
                    {singleTeam.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg text-slate-900 tracking-tight">
                        {singleTeam.name}
                      </h3>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 font-mono">
                        {singleTeam.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Members:{' '}
                      <span className="font-semibold text-slate-700">
                        {(membersMap[singleTeam.id] || []).map(m => m.full_name).join(', ') || '1 Registered Member'}
                      </span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleCopySingle(singleTeam)}
                  className={`px-3.5 py-2 rounded-xl border text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                    copiedTeamId === singleTeam.id
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                      : 'bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                  }`}
                >
                  {copiedTeamId === singleTeam.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-orange-600" />
                  )}
                  <span>{copiedTeamId === singleTeam.id ? 'Copied!' : 'Copy Full Pass'}</span>
                </button>
              </div>

              {/* Big Credentials Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Team Code */}
                <div className="p-3.5 rounded-2xl bg-orange-50/80 border-2 border-orange-200/90 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold text-orange-700 tracking-wider font-mono">
                      TEAM ACCESS CODE
                    </span>
                    <button
                      onClick={() => handleCopyCode(singleTeam.team_code, singleTeam.id)}
                      className="text-orange-600 hover:text-orange-800 p-1 cursor-pointer"
                      title="Copy Team Code"
                    >
                      {copiedCodeId === singleTeam.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="font-mono font-black text-2xl text-orange-600 tracking-wide mt-1">
                    {singleTeam.team_code}
                  </div>
                  <span className="text-[10px] text-orange-600/80 mt-0.5 block">
                    Use to log in at the participant portal
                  </span>
                </div>

                {/* Security PIN */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200/90 relative group">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-extrabold text-slate-500 tracking-wider font-mono">
                      SECURITY PIN
                    </span>
                    <button
                      onClick={() => handleCopyPin(singleTeam.pin_hash || '4821', singleTeam.id)}
                      className="text-slate-500 hover:text-slate-800 p-1 cursor-pointer"
                      title="Copy PIN"
                    >
                      {copiedPinId === singleTeam.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="font-mono font-black text-2xl text-slate-900 tracking-wider mt-1">
                    {singleTeam.pin_hash || '4821'}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    4-digit private authentication PIN
                  </span>
                </div>
              </div>

              {/* Meta Parameters */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-3 text-xs font-mono">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Allocated Capital</span>
                  <span className="font-black text-slate-900 text-sm">{formatWealth(singleTeam.cash_balance)}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Trading Portal</span>
                  <a
                    href={portalUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-bold text-orange-600 hover:underline flex items-center gap-1 mt-0.5"
                  >
                    <span>{portalUrl.replace('https://', '')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ) : (
            // Multiple Teams Grid
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {activeTeams.map((team) => {
                const pin = team.pin_hash || '4821';
                const members = membersMap[team.id] || [];
                const isCopied = copiedTeamId === team.id;

                return (
                  <div
                    key={team.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3 shadow-2xs hover:border-orange-200 transition-all text-slate-900"
                  >
                    {/* Top Team Profile */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-sm shadow-xs shadow-orange-500/20 shrink-0">
                          {team.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <span className="font-extrabold text-sm text-slate-900 truncate block">
                            {team.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {members.length === 1 ? '1 Member' : `${members.length} Members`}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleCopySingle(team)}
                        className={`p-1.5 px-2.5 rounded-lg border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                          isCopied
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            : 'bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border-slate-200'
                        }`}
                        title="Copy text"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span className="text-[10px]">{isCopied ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {/* Credentials Boxes */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/80">
                        <span className="text-[9px] uppercase font-extrabold text-orange-600 tracking-wider block font-mono">
                          Team Code
                        </span>
                        <span className="font-mono font-black text-sm text-orange-700 mt-0.5 block">
                          {team.team_code}
                        </span>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                        <span className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider block font-mono">
                          Security PIN
                        </span>
                        <span className="font-mono font-black text-sm text-slate-900 mt-0.5 block">
                          {pin}
                        </span>
                      </div>
                    </div>

                    {/* Footer Meta */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <div>
                        <span className="text-slate-400">Capital: </span>
                        <span className="font-bold text-slate-800">{formatWealth(team.cash_balance)}</span>
                      </div>
                      <div className="text-slate-400">
                        {portalUrl.replace('https://', '')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Ready for distribution to event participants</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default TeamCredentialsModal;
