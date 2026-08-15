import React, { useState } from 'react';
import { Team, TeamMember } from '../../types';
import { Modal } from '../ui/Modal';
import { Printer, Copy, Check, FileText, Share2, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
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

  const activeTeams = singleTeam ? [singleTeam] : teams;
  const portalUrl = 'https://metis-bvx.pages.dev';

  const formatTeamText = (team: Team) => {
    const pin = team.pin_hash || '4821';
    return `🏛️ *METIS 2026 — Team Access Credentials*
━━━━━━━━━━━━━━━━━━━━━━━━━━
👥 *Team Name:* ${team.name}
🎟️ *Team Code:* \`${team.team_code}\`
🔑 *Access PIN:* \`${pin}\`
💰 *Starting Capital:* ${formatWealth(team.cash_balance)}
🌐 *Participant Portal:* ${portalUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━
_Keep your credentials confidential. Log in at the portal to trade._`;
  };

  const handleCopySingle = (team: Team) => {
    navigator.clipboard.writeText(formatTeamText(team));
    setCopiedTeamId(team.id);
    setTimeout(() => setCopiedTeamId(null), 2000);
  };

  const handleCopyAll = () => {
    const allText = activeTeams.map((team, idx) => {
      const pin = team.pin_hash || '4821';
      return `[Team ${idx + 1}] ${team.name}
Code: ${team.team_code} | PIN: ${pin} | Capital: ${formatWealth(team.cash_balance)}`;
    }).join('\n' + '─'.repeat(40) + '\n');

    const fullSummary = `🏛️ METIS 2026 — ALL REGISTERED TEAM CREDENTIALS (${activeTeams.length} Teams)
Portal: ${portalUrl}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${allText}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
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

    const cardsHtml = activeTeams.map((team, idx) => {
      const pin = team.pin_hash || '4821';
      const members = membersMap[team.id] || [];
      const memberNames = members.map(m => m.full_name).join(', ') || 'Registered Team Member';

      return `
        <div class="pass-card">
          <div class="pass-header">
            <div class="brand-badge">METIS 2026</div>
            <div class="event-title">OFFICIAL PARTICIPANT ACCESS PASS</div>
          </div>
          
          <div class="pass-body">
            <div class="team-hero">
              <div class="team-avatar">${team.name.charAt(0)}</div>
              <div>
                <div class="team-label">COMPETING TEAM</div>
                <div class="team-name">${team.name}</div>
                <div class="team-members">Members: ${memberNames}</div>
              </div>
            </div>

            <div class="credentials-grid">
              <div class="cred-box highlight">
                <span class="cred-label">TEAM ACCESS CODE</span>
                <span class="cred-value">${team.team_code}</span>
              </div>
              <div class="cred-box">
                <span class="cred-label">SECURITY PIN</span>
                <span class="cred-value">${pin}</span>
              </div>
            </div>

            <div class="meta-row">
              <div>
                <span class="meta-label">STARTING CAPITAL</span>
                <span class="meta-value">${formatWealth(team.cash_balance)}</span>
              </div>
              <div>
                <span class="meta-label">TRADING PORTAL</span>
                <span class="meta-value link">${portalUrl}</span>
              </div>
            </div>
          </div>

          <div class="pass-footer">
            <span>⚠️ Keep this pass confidential. Authorized participant use only.</span>
            <span>Pass #${idx + 1}</span>
          </div>
        </div>
      `;
    }).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>METIS 2026 — Team Credentials Pass</title>
          <meta charset="utf-8" />
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&family=JetBrains+Mono:wght@500;700;800&display=swap');
            
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
              font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
              background-color: #f8fafc;
              color: #0f172a;
              padding: 24px;
            }

            .header-banner {
              text-align: center;
              margin-bottom: 24px;
              padding-bottom: 16px;
              border-bottom: 2px solid #e2e8f0;
            }
            .header-banner h1 {
              font-size: 22px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .header-banner p {
              font-size: 12px;
              color: #64748b;
              margin-top: 4px;
            }

            .passes-container {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 20px;
            }

            .pass-card {
              background: #ffffff;
              border: 2px solid #e2e8f0;
              border-radius: 18px;
              overflow: hidden;
              page-break-inside: avoid;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
              position: relative;
            }

            .pass-header {
              background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
              color: #ffffff;
              padding: 12px 18px;
              display: flex;
              align-items: center;
              justify-content: space-between;
            }
            .brand-badge {
              font-family: 'JetBrains Mono', monospace;
              font-weight: 800;
              font-size: 12px;
              background: #f97316;
              color: #ffffff;
              padding: 3px 10px;
              border-radius: 8px;
              letter-spacing: 0.5px;
            }
            .event-title {
              font-size: 10px;
              font-weight: 700;
              color: #94a3b8;
              letter-spacing: 0.5px;
            }

            .pass-body {
              padding: 18px;
            }

            .team-hero {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 16px;
            }
            .team-avatar {
              width: 44px;
              height: 44px;
              border-radius: 14px;
              background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
              color: #ffffff;
              font-size: 20px;
              font-weight: 800;
              display: flex;
              align-items: center;
              justify-content: center;
              box-shadow: 0 4px 10px rgba(249, 115, 22, 0.25);
            }
            .team-label {
              font-size: 9px;
              font-weight: 800;
              color: #94a3b8;
              letter-spacing: 0.5px;
            }
            .team-name {
              font-size: 17px;
              font-weight: 800;
              color: #0f172a;
              line-height: 1.2;
            }
            .team-members {
              font-size: 11px;
              color: #64748b;
              margin-top: 2px;
            }

            .credentials-grid {
              display: grid;
              grid-template-columns: 1.2fr 0.8fr;
              gap: 10px;
              margin-bottom: 14px;
            }
            .cred-box {
              background: #f8fafc;
              border: 1.5px solid #e2e8f0;
              border-radius: 12px;
              padding: 10px 14px;
            }
            .cred-box.highlight {
              background: #fff7ed;
              border-color: #fdba74;
            }
            .cred-label {
              font-family: 'JetBrains Mono', monospace;
              font-size: 9px;
              font-weight: 800;
              color: #64748b;
              display: block;
              margin-bottom: 4px;
            }
            .cred-box.highlight .cred-label {
              color: #c2410c;
            }
            .cred-value {
              font-family: 'JetBrains Mono', monospace;
              font-size: 17px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 0.5px;
            }
            .cred-box.highlight .cred-value {
              color: #ea580c;
            }

            .meta-row {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding-top: 10px;
              border-top: 1px dashed #cbd5e1;
            }
            .meta-label {
              font-size: 9px;
              font-weight: 700;
              color: #94a3b8;
              display: block;
            }
            .meta-value {
              font-family: 'JetBrains Mono', monospace;
              font-size: 12px;
              font-weight: 800;
              color: #0f172a;
            }
            .meta-value.link {
              color: #2563eb;
            }

            .pass-footer {
              background: #f8fafc;
              border-top: 1px solid #e2e8f0;
              padding: 8px 18px;
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 9px;
              color: #94a3b8;
              font-weight: 600;
            }

            @media print {
              body { background: white; padding: 0; }
              .header-banner { margin-bottom: 16px; }
              .pass-card { box-shadow: none; border-color: #cbd5e1; }
            }
          </style>
        </head>
        <body>
          <div class="header-banner">
            <h1>🏛️ METIS 2026 — Official Team Access Credentials</h1>
            <p>Generated on ${new Date().toLocaleString()} · Participant Trading Portal: <strong>${portalUrl}</strong></p>
          </div>

          <div class="passes-container">
            ${cardsHtml}
          </div>

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
      title={singleTeam ? `${singleTeam.name} — Access Credentials` : 'Team Access Credentials & Passes'}
      subtitle={singleTeam ? 'Ready-to-share credentials pass for this team' : `Export or print credential passes for ${activeTeams.length} registered teams`}
    >
      <div className="space-y-5 pt-2 font-sans">
        {/* Action Header Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-orange-500 text-white font-mono font-extrabold text-[10px] uppercase">
                Official Passes
              </span>
              <span className="font-extrabold text-sm text-slate-100">
                {singleTeam ? singleTeam.name : `${activeTeams.length} Registered Teams`}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Print high-graphic PDF passes or copy formatted text for WhatsApp/email.
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopyAll}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
            >
              {copiedAll ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedAll ? 'Copied All!' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
          </div>
        </div>

        {/* Passes Grid Preview */}
        <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeTeams.map((team) => {
              const pin = team.pin_hash || '4821';
              const members = membersMap[team.id] || [];
              const isCopied = copiedTeamId === team.id;

              return (
                <div
                  key={team.id}
                  className="bg-white rounded-2xl border border-slate-200/90 p-4 space-y-3.5 shadow-2xs hover:border-orange-200 transition-all group relative overflow-hidden"
                >
                  {/* Top Team Profile */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-base shadow-xs shadow-orange-500/20 shrink-0">
                        {team.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="font-extrabold text-sm text-slate-900 truncate block">
                          {team.name}
                        </span>
                        <span className="text-[11px] text-slate-400 block font-medium">
                          {members.length === 1 ? '1 Member' : `${members.length} Members`}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopySingle(team)}
                      className={`p-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        isCopied
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                          : 'bg-slate-50 hover:bg-orange-50 text-slate-600 hover:text-orange-600 border-slate-200 hover:border-orange-200'
                      }`}
                      title="Copy WhatsApp Message"
                    >
                      {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{isCopied ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Credentials Boxes */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 rounded-xl bg-orange-50/80 border border-orange-200/80">
                      <span className="text-[9px] uppercase font-extrabold text-orange-600 tracking-wider block font-mono">
                        Team Code
                      </span>
                      <span className="font-mono font-black text-sm text-orange-700 mt-0.5 block truncate">
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
                    <div className="text-slate-400 truncate max-w-[150px]">
                      {portalUrl.replace('https://', '')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer info & Done */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
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
