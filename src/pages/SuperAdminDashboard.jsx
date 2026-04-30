import React, { useState } from 'react';
import { Building2, Plus, Users, Search, Edit2, Trash2 } from 'lucide-react';
import { useSuperAdmin } from '../hooks/useSuperAdmin';
import { useAuth } from '../contexts/AuthContext';

export default function SuperAdminDashboard() {
  const { messes, loading, createMess, updateMessStatus, updateMess, deleteMess } = useSuperAdmin();
  const { createUserByAdmin } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingMessId, setEditingMessId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create Mess Form State
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
        await updateMess(editingMessId, {
          name: messName,
          address,
        });
        alert('Mess updated successfully!');
      } else {
        // 1. Create the mess document
        await createMess(messId, {
          name: messName,
          address,
          isActive: true,
        });

        // 2. Create the admin user for this mess
        await createUserByAdmin(adminEmail, adminPassword, adminName, messId, 'admin');
        alert('Mess created successfully!');
      }

      closeModal();
    } catch (error) {
      console.error("Error saving mess:", error);
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Super Admin Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage all messes across the platform</p>
        </div>
        <button
          onClick={() => { closeModal(); setShowCreateModal(true); }}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white shadow-lg transition-transform hover:scale-105 active:scale-95 bg-emerald-600 dark:bg-emerald-500"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Mess</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Total Messes</p>
              <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{messes.length}</h3>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(52, 211, 153, 0.1)' }}>
              <Building2 className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
        </div>
        <div className="p-6 rounded-2xl border" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Active Messes</p>
              <h3 className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{messes.filter(m => m.isActive).length}</h3>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Messes List */}
      <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
        <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div className="relative max-w-md">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500"
              style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading messes...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)' }}>
                  <th className="p-3 sm:p-4 font-medium text-xs sm:text-sm text-gray-500 border-b whitespace-nowrap" style={{ borderColor: 'var(--border-color)' }}>Mess ID</th>
                  <th className="p-3 sm:p-4 font-medium text-xs sm:text-sm text-gray-500 border-b whitespace-nowrap" style={{ borderColor: 'var(--border-color)' }}>Name</th>
                  <th className="p-3 sm:p-4 font-medium text-xs sm:text-sm text-gray-500 border-b whitespace-nowrap" style={{ borderColor: 'var(--border-color)' }}>Address</th>
                  <th className="p-3 sm:p-4 font-medium text-xs sm:text-sm text-gray-500 border-b whitespace-nowrap" style={{ borderColor: 'var(--border-color)' }}>Status</th>
                  <th className="p-3 sm:p-4 font-medium text-xs sm:text-sm text-gray-500 border-b whitespace-nowrap" style={{ borderColor: 'var(--border-color)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMesses.map(mess => (
                  <tr key={mess.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                    <td className="p-3 sm:p-4 border-b whitespace-nowrap text-xs sm:text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{mess.id}</td>
                    <td className="p-3 sm:p-4 border-b font-medium whitespace-nowrap text-xs sm:text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}>{mess.name}</td>
                    <td className="p-3 sm:p-4 border-b whitespace-nowrap text-xs sm:text-sm" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>{mess.address || 'N/A'}</td>
                    <td className="p-3 sm:p-4 border-b whitespace-nowrap" style={{ borderColor: 'var(--border-color)' }}>
                      <span className={`px-2 py-1 text-[10px] sm:text-xs rounded-full font-medium ${mess.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {mess.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-3 sm:p-4 border-b whitespace-nowrap" style={{ borderColor: 'var(--border-color)' }}>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleEditMess(mess)}
                          className="text-gray-500 hover:text-blue-500 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteMess(mess.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => updateMessStatus(mess.id, !mess.isActive)}
                          className="text-sm font-medium hover:underline whitespace-nowrap"
                          style={{ color: mess.isActive ? 'var(--danger)' : 'var(--accent-primary)' }}
                        >
                          {mess.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredMesses.length === 0 && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">No messes found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Create/Edit Mess Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div className="p-4 sm:p-6 border-b shrink-0" style={{ borderColor: 'var(--border-color)' }}>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{isEditing ? 'Edit Mess' : 'Create New Mess'}</h2>
            </div>
            
            <div className="overflow-y-auto p-4 sm:p-6">
              <form id="mess-form" onSubmit={handleCreateMess} className="space-y-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm uppercase tracking-wider text-emerald-500">Mess Details</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Mess ID (Unique string, no spaces)</label>
                    <input disabled={isEditing} required type="text" value={messId} onChange={e => setMessId(e.target.value)} placeholder="e.g. boys_hostel_01" className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Mess Name</label>
                    <input required type="text" value={messName} onChange={e => setMessName(e.target.value)} placeholder="e.g. Green Valley Mess" className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. Dhanmondi, Dhaka" className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                  </div>

                  {!isEditing && (
                    <>
                      <h3 className="font-semibold text-sm uppercase tracking-wider text-emerald-500 mt-6">Manager (Admin) Account</h3>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Manager Name</label>
                        <input required type="text" value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="e.g. Rahim Uddin" className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Manager Email</label>
                        <input required type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="manager@example.com" className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Manager Password (Min 6 chars)</label>
                        <input required minLength={6} type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="••••••••" className="w-full p-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }} />
                      </div>
                    </>
                  )}
                </div>
              </form>
            </div>
            
            <div className="p-4 sm:p-6 border-t shrink-0 bg-black/5 dark:bg-white/5" style={{ borderColor: 'var(--border-color)' }}>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl font-medium transition-colors" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>
                  Cancel
                </button>
                <button form="mess-form" disabled={isSubmitting} type="submit" className="px-4 py-2 rounded-xl text-white font-medium disabled:opacity-50 flex items-center transition-colors" style={{ backgroundColor: 'var(--accent-primary)' }}>
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : isEditing ? 'Update Mess' : 'Create Mess'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
