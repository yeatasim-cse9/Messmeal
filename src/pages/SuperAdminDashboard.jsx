import React, { useState } from 'react';
import { Building2, Plus, Users, Search, Edit2, Trash2, X, MapPin, CheckCircle, XCircle, ChevronRight, Shield, Zap } from 'lucide-react';
import { useSuperAdmin } from '../hooks/useSuperAdmin';
import { useAuth } from '../contexts/AuthContext';

export default function SuperAdminDashboard() {
  const { messes, loading, createMess, updateMessStatus, updateMess, deleteMess } = useSuperAdmin();
  const { createUserByAdmin } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessId, setEditingMessId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [messId, setMessId] = useState('');
  const [messName, setMessName] = useState('');
  const [address, setAddress] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEditMess = (mess) => {
    setIsEditing(true);
    setEditingMessId(mess.id);
    setMessId(mess.id);
    setMessName(mess.name);
    setAddress(mess.address || '');
    setShowCreateModal(true);
  };

  const handleDeleteMess = async (id) => {
    if (window.confirm("Are you sure you want to delete this mess? This action cannot be undone.")) {
      try {
        await deleteMess(id);
      } catch (err) {
        alert("Failed to delete mess: " + err.message);
      }
    }
  };

  const handleCreateMess = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await updateMess(editingMessId, { name: messName, address });
        alert('Mess updated successfully!');
      } else {
        await createMess(messId, { name: messName, address, isActive: true });
        await createUserByAdmin(adminEmail, adminPassword, adminName, messId, 'admin');
        alert('Mess created successfully!');
      }
      closeModal();
    } catch (error) {
      alert("Failed to save mess: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeModal = () => {
    setShowCreateModal(false);
    setIsEditing(false);
    setEditingMessId(null);
    setMessId(''); setMessName(''); setAddress('');
    setAdminName(''); setAdminEmail(''); setAdminPassword('');
  };

  const filteredMesses = messes.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeMesses = messes.filter(m => m.isActive).length;

  return (
    <div className="min-h-screen p-3 sm:p-6 lg:p-8 space-y-4 sm:space-y-6" style={{ backgroundColor: 'var(--bg-primary)' }}>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-5 sm:p-8 lg:p-10"
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #10b981, transparent)' }}></div>
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }}></div>
        </div>
        <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Shield size={14} className="text-white" />
              </div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">সুপার অ্যাডমিন</span>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
              মেস <span className="text-emerald-400">কন্ট্রোল</span> প্যানেল
            </h1>
            <p className="text-slate-400 text-sm mt-1">আপনার সকল মেস এখন আপনার নিয়ন্ত্রণে</p>
          </div>
          <button
            onClick={() => { closeModal(); setShowCreateModal(true); }}
            className="flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-white transition-all active:scale-95 shadow-lg shadow-emerald-500/30 shrink-0 w-full sm:w-auto justify-center"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}
          >
            <Plus size={18} />
            নতুন মেস তৈরি করুন
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="p-4 sm:p-6 rounded-2xl border flex items-center gap-3 sm:gap-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-emerald-500" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black" style={{ color: 'var(--text-primary)' }}>{messes.length}</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>মোট মেস</p>
          </div>
        </div>
        <div className="p-4 sm:p-6 rounded-2xl border flex items-center gap-3 sm:gap-4"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Zap size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-blue-500">{activeMesses}</p>
            <p className="text-[10px] sm:text-xs font-bold uppercase" style={{ color: 'var(--text-muted)' }}>এক্টিভ মেস</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search messes by name or ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 rounded-2xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-sm"
          style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)', color: 'var(--text-primary)' }}
        />
      </div>

      {/* Messes List — Mobile Cards / Desktop Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Loading messes...</p>
        </div>
      ) : filteredMesses.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <Building2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-bold">No messes found</p>
        </div>
      ) : (
        <>
          {/* Mobile: Card Layout */}
          <div className="flex flex-col gap-3 lg:hidden">
            {filteredMesses.map(mess => (
              <div key={mess.id} className="rounded-2xl border overflow-hidden transition-all"
                style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
                <div className="p-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${mess.isActive ? 'bg-emerald-500/10' : 'bg-slate-500/10'}`}>
                      <Building2 size={18} className={mess.isActive ? 'text-emerald-500' : 'text-slate-400'} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-black text-base truncate" style={{ color: 'var(--text-primary)' }}>{mess.name}</p>
                      <p className="text-xs font-mono mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{mess.id}</p>
                      {mess.address && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin size={10} style={{ color: 'var(--text-muted)' }} />
                          <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>{mess.address}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold shrink-0 ${mess.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-400'}`}>
                    {mess.isActive ? '● Active' : '● Inactive'}
                  </span>
                </div>
                <div className="flex border-t" style={{ borderColor: 'var(--border-primary)' }}>
                  <button onClick={() => handleEditMess(mess)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all hover:bg-blue-500/10 hover:text-blue-500"
                    style={{ color: 'var(--text-muted)' }}>
                    <Edit2 size={13} /> Edit
                  </button>
                  <div className="w-px" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                  <button onClick={() => updateMessStatus(mess.id, !mess.isActive)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all ${mess.isActive ? 'hover:bg-amber-500/10 hover:text-amber-500' : 'hover:bg-emerald-500/10 hover:text-emerald-500'}`}
                    style={{ color: 'var(--text-muted)' }}>
                    {mess.isActive ? <><XCircle size={13} /> Deactivate</> : <><CheckCircle size={13} /> Activate</>}
                  </button>
                  <div className="w-px" style={{ backgroundColor: 'var(--border-primary)' }}></div>
                  <button onClick={() => handleDeleteMess(mess.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold transition-all hover:bg-rose-500/10 hover:text-rose-500"
                    style={{ color: 'var(--text-muted)' }}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Table Layout */}
          <div className="hidden lg:block rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-primary)' }}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg-secondary)' }}>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>মেস আইডি</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>নাম</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>ঠিকানা</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>স্ট্যাটাস</th>
                  <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredMesses.map(mess => (
                  <tr key={mess.id} className="border-t hover:bg-black/5 dark:hover:bg-white/5 transition-colors" style={{ borderColor: 'var(--border-primary)' }}>
                    <td className="px-6 py-4 font-mono text-sm" style={{ color: 'var(--text-secondary)' }}>{mess.id}</td>
                    <td className="px-6 py-4 font-bold" style={{ color: 'var(--text-primary)' }}>{mess.name}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: 'var(--text-muted)' }}>{mess.address || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-bold ${mess.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-400'}`}>
                        {mess.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEditMess(mess)} className="p-2 rounded-lg hover:bg-blue-500/10 hover:text-blue-500 transition-all" style={{ color: 'var(--text-muted)' }}>
                          <Edit2 size={15} />
                        </button>
                        <button onClick={() => handleDeleteMess(mess.id)} className="p-2 rounded-lg hover:bg-rose-500/10 hover:text-rose-500 transition-all" style={{ color: 'var(--text-muted)' }}>
                          <Trash2 size={15} />
                        </button>
                        <button onClick={() => updateMessStatus(mess.id, !mess.isActive)}
                          className="text-xs font-bold px-3 py-1.5 rounded-lg border transition-all"
                          style={{ color: mess.isActive ? '#f43f5e' : '#10b981', borderColor: mess.isActive ? 'rgba(244,63,94,0.2)' : 'rgba(16,185,129,0.2)' }}>
                          {mess.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full sm:max-w-lg flex flex-col rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh]"
            style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-primary)' }}>

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b" style={{ borderColor: 'var(--border-primary)' }}>
              <div>
                <div className="w-1 h-5 rounded-full bg-emerald-500 inline-block mr-3 align-middle"></div>
                <h2 className="text-lg font-black inline-block" style={{ color: 'var(--text-primary)' }}>
                  {isEditing ? 'Edit Mess' : 'Create New Mess'}
                </h2>
              </div>
              <button onClick={closeModal} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-rose-500/10 hover:text-rose-500" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)' }}>
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
              <form id="mess-form" onSubmit={handleCreateMess} className="space-y-4">
                <div className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Mess Details</p>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Mess ID (unique, no spaces)</label>
                    <input disabled={isEditing} required type="text" value={messId} onChange={e => setMessId(e.target.value)}
                      placeholder="e.g. boys_hostel_01"
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium disabled:opacity-50"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Mess Name</label>
                    <input required type="text" value={messName} onChange={e => setMessName(e.target.value)}
                      placeholder="e.g. Green Valley Mess"
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)}
                      placeholder="e.g. Dhanmondi, Dhaka"
                      className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
                      style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }} />
                  </div>
                </div>

                {!isEditing && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Manager Account</p>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Manager Name</label>
                      <input required type="text" value={adminName} onChange={e => setAdminName(e.target.value)}
                        placeholder="e.g. Rahim Uddin"
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Manager Email</label>
                      <input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)}
                        placeholder="manager@example.com"
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-muted)' }}>Password (min 6 chars)</label>
                      <input required minLength={6} type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
                        style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-secondary)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                )}
              </form>
            </div>

            <div className="p-5 sm:p-6 border-t flex gap-3" style={{ borderColor: 'var(--border-primary)', backgroundColor: 'var(--bg-secondary)' }}>
              <button type="button" onClick={closeModal}
                className="flex-1 py-3 rounded-xl font-bold text-sm transition-all border"
                style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-secondary)' }}>
                Cancel
              </button>
              <button form="mess-form" disabled={isSubmitting} type="submit"
                className="flex-1 py-3 rounded-xl text-white font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                {isSubmitting ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Saving...</> : isEditing ? 'Update Mess' : 'Create Mess'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
