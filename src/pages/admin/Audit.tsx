import React, { useState, useEffect, useCallback } from 'react';
import { getActiveEvent } from '../../services/event';
import { getAuditLogs } from '../../services/audit';
import { Event, AuditLog } from '../../types';
import { formatClockTime } from '../../lib/formatting';
import { History, Search } from 'lucide-react';

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
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold font-display text-slate-900 tracking-tight flex items-center gap-2.5">
          <History className="w-7 h-7 text-orange-500" />
          Immutable Audit Trail
        </h1>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
        <input
          type="text"
          placeholder="Filter audit entries by action, actor or reason..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white text-slate-900 placeholder:text-slate-400 border border-slate-200/80 rounded-2xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-orange-500 transition-colors shadow-xs"
        />
      </div>

      {/* Audit Log Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase text-slate-400 tracking-wider font-mono">
              <tr>
                <th className="py-3.5 px-6">Timestamp</th>
                <th className="py-3.5 px-6">Actor</th>
                <th className="py-3.5 px-6">Action</th>
                <th className="py-3.5 px-6">Entity</th>
                <th className="py-3.5 px-6">Reason / Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 text-sm font-sans font-medium">
                    No audit records match query.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Timestamp */}
                    <td className="py-4 px-6 text-slate-500 font-semibold whitespace-nowrap">
                      {formatClockTime(log.created_at)}
                    </td>

                    {/* Actor */}
                    <td className="py-4 px-6 font-sans">
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                        {log.actor_type}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 font-bold text-slate-900 font-sans">
                      {log.action}
                    </td>

                    {/* Entity */}
                    <td className="py-4 px-6 text-slate-500">
                      {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)})` : ''}
                    </td>

                    {/* Reason */}
                    <td className="py-4 px-6 font-sans text-slate-600 max-w-md truncate">
                      {log.reason || (log.new_value ? JSON.stringify(log.new_value) : '—')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAudit;
