import React, { useMemo, useState } from 'react';
import { Plus, ShieldCheck, Phone, Mail, Users as UsersIcon, MessageCircle } from 'lucide-react';
import { StorageService } from '../services/storage';
import { TeamMember } from '../types';

const statusClasses: Record<TeamMember['status'], string> = {
  Active: 'bg-emerald-100 text-emerald-700',
  Invited: 'bg-amber-100 text-amber-700',
  Suspended: 'bg-rose-100 text-rose-700',
};

const inviteText = (member: TeamMember) =>
  `Hi ${member.name}, you have been added to EVW Cloud ERP as ${member.role}. Sign in with ${member.authProvider} to access stock, invoices, and reports.`;

export const Team: React.FC = () => {
  const [team, setTeam] = useState<TeamMember[]>(() => StorageService.getTeamMembers());
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Manager' as TeamMember['role'],
    location: 'Karachi, PK',
    authProvider: 'Google' as TeamMember['authProvider'],
  });

  const activeCount = useMemo(() => team.filter((m) => m.status === 'Active').length, [team]);

  const handleAdd = () => {
    if (!form.name || !form.email) return;
    const newMember: TeamMember = {
      id: `u-${Date.now()}`,
      name: form.name,
      email: form.email,
      phone: form.phone,
      role: form.role,
      location: form.location,
      status: 'Invited',
      authProvider: form.authProvider,
      lastLogin: new Date().toISOString(),
    };

    StorageService.addTeamMember(newMember);
    setTeam(StorageService.getTeamMembers());
    setForm({ ...form, name: '', email: '', phone: '' });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-800 text-white rounded-2xl p-6 shadow-lg">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-emerald-200">Team & Access</p>
            <h2 className="text-3xl font-bold mt-2">Manage everyone in EVW Cloud</h2>
            <p className="text-slate-200 mt-2 max-w-2xl">
              Keep branch staff, auditors, and cashiers aligned. Control roles, login methods, and WhatsApp invites from one screen.
            </p>
          </div>
          <div className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm flex items-center space-x-2">
            <ShieldCheck size={18} className="text-emerald-200" />
            <span>{activeCount} active · {team.length} total</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <UsersIcon size={18} className="text-emerald-600" />
              <h3 className="font-semibold text-slate-800">Team members</h3>
            </div>
            <span className="text-xs text-slate-500">Roles: Owner, Manager, Cashier, Auditor</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3">Auth</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Last login</th>
                  <th className="px-4 py-3 text-right">Invite</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {team.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900">{member.name}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail size={12} /> {member.email}
                      </p>
                      {member.phone && (
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Phone size={12} /> {member.phone}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{member.role}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2 py-1 rounded">
                        {member.authProvider}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${statusClasses[member.status]}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{member.location}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {member.lastLogin ? new Date(member.lastLogin).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={`https://wa.me/${member.phone ? member.phone.replace(/[^\d]/g, '') : ''}?text=${encodeURIComponent(inviteText(member))}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-emerald-600 text-xs font-semibold hover:text-emerald-700"
                      >
                        <MessageCircle size={14} className="mr-1" /> WhatsApp
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 space-y-4">
          <div className="flex items-center space-x-2">
            <Plus size={18} className="text-emerald-600" />
            <h4 className="font-semibold text-slate-800">Add team member</h4>
          </div>
          <div className="space-y-3">
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200"
            />
            <input
              placeholder="Work email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200"
            />
            <input
              placeholder="WhatsApp (optional)"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as TeamMember['role'] })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200"
              >
                <option value="Owner">Owner</option>
                <option value="Manager">Manager</option>
                <option value="Cashier">Cashier</option>
                <option value="Auditor">Auditor</option>
              </select>
              <select
                value={form.authProvider}
                onChange={(e) => setForm({ ...form, authProvider: e.target.value as TeamMember['authProvider'] })}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200"
              >
                <option value="Google">Google SSO</option>
                <option value="Email">Email + Password</option>
              </select>
            </div>
            <input
              placeholder="Location"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-200"
            />
            <button
              onClick={handleAdd}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl py-2 font-semibold shadow"
            >
              Save & send invite
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
