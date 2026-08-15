import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getAuditLogs } from '../../services/audit';
import { Event, AuditLog } from '../../types';
import { formatClockTime } from '../../lib/formatting';
import { History, Shield, Search } from 'lucide-react';

export const AdminAudit: React.FC = () => {
  const [event, setEvent] = useState<Event | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLogs = useCallback(async () => {
    try {
      const activeEvent = await getActiveEvent();
      setEvent(activeEvent);
      const list = await getAuditLogs(activeEvent.id);
      setLogs(list);
    } catch (err) {
      console.error('Error loading audit logs:', err);
    }
  }, []);

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 4000);
    return () => clearInterval(interval);
  }, [loadLogs]);

  const filteredLogs = logs.filter((l) =>
    l.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.reason || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.actor_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-display text-white tracking-tight flex items-center gap-2">
          <History className="w-8 h-8 text-orange-500" />
          Immutable Audit Trail
        </h1>
        <p className="text-xs text-slate-400">
          Append-only administrative log of every trade, price revision, cash adjustment, and market state toggle.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          placeholder="Filter audit entries by action, actor or reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-900/80 text-white placeholder:text-slate-500 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-500"
        />
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-900/90 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Actor</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Entity</th>
                <th className="py-3.5 px-4">Description / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {filteredLogs.map((log) => {
                const isAdmin = log.actor_type === 'ADMIN';
                const isSystem = log.actor_type === 'SYSTEM';

                return (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      · {formatClockTime(log.created_at)}
                    </td>

                    <td className="py-3.5 px-4 font-sans">
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                          isAdmin
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                            : isSystem
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {log.actor_type}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      {log.action}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 font-sans">
                      {log.entity_type}
                    </td>

                    <td className="py-3.5 px-4 font-sans text-slate-300">
                      {log.reason || '---'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
