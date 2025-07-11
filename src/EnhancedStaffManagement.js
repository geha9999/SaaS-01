import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Edit3, Trash2, Mail, Phone, Shield, 
  MoreVertical, Search, Filter, CheckCircle, Clock, X,
  Eye, EyeOff, Settings, Crown, User, Stethoscope
} from 'lucide-react';
import { 
  collection, query, where, onSnapshot, addDoc, updateDoc, 
  deleteDoc, doc, serverTimestamp 
} from 'firebase/firestore';

const EnhancedStaffManagement = ({ user, db, clinic, userProfile }) => {
  const [staff, setStaff] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Role definitions with permissions
  const roles = {
    owner: {
      label: 'Owner',
      icon: Crown,
      color: 'purple',
      permissions: ['all'],
      description: 'Full access to all clinic functions'
    },
    manager: {
      label: 'Manager',
      icon: Settings,
      color: 'blue',
      permissions: ['staff_manage', 'patient_manage', 'appointment_manage', 'payment_view', 'settings_edit'],
      description: 'Manage staff, patients, and appointments'
    },
    doctor: {
      label: 'Doctor',
      icon: Stethoscope,
      color: 'green',
      permissions: ['patient_manage', 'appointment_manage', 'medical_records'],
      description: 'Patient care and medical records'
    },
    nurse: {
      label: 'Nurse',
      icon: User,
      color: 'pink',
      permissions: ['patient_view', 'appointment_view', 'medical_assist'],
      description: 'Patient assistance and basic care'
    },
    admin: {
      label: 'Admin',
      icon: Shield,
      color: 'orange',
      permissions: ['appointment_manage', 'payment_manage', 'patient_view'],
      description: 'Administrative tasks and scheduling'
    },
    cashier: {
      label: 'Cashier',
      icon: User,
      color: 'yellow',
      permissions: ['payment_manage', 'patient_view'],
      description: 'Payment processing and basic patient info'
    }
  };

  // Fetch staff and invitations
  useEffect(() => {
    if (!db || !clinic?.id) return;

    const unsubscribers = [];

    // Listen to staff (users in this clinic)
    const staffQuery = query(
      collection(db, 'users'),
      where('clinicId', '==', clinic.id)
    );
    unsubscribers.push(onSnapshot(staffQuery, (snapshot) => {
      const staffData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setStaff(staffData);
      setIsLoading(false);
    }));

    // Listen to pending invitations
    const invitationsQuery = query(
      collection(db, 'invitations'),
      where('clinicId', '==', clinic.id),
      where('status', '==', 'pending')
    );
    unsubscribers.push(onSnapshot(invitationsQuery, (snapshot) => {
      const invitationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setInvitations(invitationsData);
    }));

    return () => unsubscribers.forEach(unsub => unsub());
  }, [db, clinic?.id]);

  // Check if current user can perform action
  const canPerformAction = (action) => {
    if (userProfile?.role === 'owner') return true;
    if (userProfile?.role === 'manager' && ['invite', 'edit', 'view'].includes(action)) return true;
    return false;
  };

  // Filter staff
  const filteredStaff = staff.filter(member => {
    const matchesSearch = member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || member.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Invite new staff member
  const handleInviteStaff = async (inviteData) => {
    try {
      await addDoc(collection(db, 'invitations'), {
        clinicId: clinic.id,
        clinicName: clinic.name,
        invitedBy: user.uid,
        inviterName: userProfile?.name || user.email,
        email: inviteData.email.toLowerCase(),
        role: inviteData.role,
        permissions: roles[inviteData.role]?.permissions || [],
        status: 'pending',
        createdAt: serverTimestamp(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      });
      
      setShowInviteModal(false);
      alert(`✅ Invitation sent to ${inviteData.email}`);
    } catch (error) {
      console.error('Error sending invitation:', error);
      alert('❌ Error sending invitation');
    }
  };

  // Update staff member
  const handleUpdateStaff = async (staffId, updates) => {
    try {
      await updateDoc(doc(db, 'users', staffId), {
        ...updates,
        updatedAt: serverTimestamp(),
        updatedBy: user.uid
      });
      setEditingStaff(null);
      alert('✅ Staff member updated successfully');
    } catch (error) {
      console.error('Error updating staff:', error);
      alert('❌ Error updating staff member');
    }
  };

  // Remove staff member (soft delete)
  const handleRemoveStaff = async (staffId, staffName) => {
    if (!window.confirm(`Are you sure you want to remove ${staffName} from the clinic?`)) return;
    
    try {
      await updateDoc(doc(db, 'users', staffId), {
        status: 'removed',
        removedAt: serverTimestamp(),
        removedBy: user.uid
      });
      alert(`✅ ${staffName} has been removed from the clinic`);
    } catch (error) {
      console.error('Error removing staff:', error);
      alert('❌ Error removing staff member');
    }
  };

  // Cancel invitation
  const handleCancelInvitation = async (invitationId) => {
    try {
      await updateDoc(doc(db, 'invitations', invitationId), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
        cancelledBy: user.uid
      });
      alert('✅ Invitation cancelled');
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      alert('❌ Error cancelling invitation');
    }
  };

  const InviteStaffModal = () => {
    const [formData, setFormData] = useState({
      email: '',
      role: 'nurse',
      name: '',
      phone: ''
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleInviteStaff(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Invite New Staff Member</h3>
            <button 
              onClick={() => setShowInviteModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                required
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="colleague@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(roles).filter(([key]) => key !== 'owner').map(([key, role]) => (
                  <option key={key} value={key}>{role.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {roles[formData.role]?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Full Name (Optional)</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Dr. John Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone (Optional)</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="+62 812 3456 7890"
              />
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Permissions for {roles[formData.role]?.label}:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                {roles[formData.role]?.permissions.map(permission => (
                  <li key={permission}>• {permission.replace('_', ' ').toUpperCase()}</li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleInviteStaff(formData)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const EditStaffModal = () => {
    const [formData, setFormData] = useState({
      name: editingStaff?.name || '',
      role: editingStaff?.role || '',
      phone: editingStaff?.phone || '',
      status: editingStaff?.status || 'active'
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      handleUpdateStaff(editingStaff.id, formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Edit Staff Member</h3>
            <button 
              onClick={() => setEditingStaff(null)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData(prev => ({...prev, role: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={editingStaff?.role === 'owner'}
              >
                {Object.entries(roles).map(([key, role]) => (
                  <option key={key} value={key}>{role.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({...prev, status: e.target.value}))}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                disabled={editingStaff?.role === 'owner'}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="button"
                onClick={() => setEditingStaff(null)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleUpdateStaff(editingStaff.id, formData)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Update
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getRoleBadge = (role) => {
    const roleInfo = roles[role] || roles.nurse;
    const IconComponent = roleInfo.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${roleInfo.color}-100 text-${roleInfo.color}-800`}>
        <IconComponent className="w-3 h-3" />
        {roleInfo.label}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.active}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600">Manage your clinic team and permissions</p>
        </div>
        {canPerformAction('invite') && (
          <button
            onClick={() => setShowInviteModal(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Invite Staff
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search staff members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            {Object.entries(roles).map(([key, role]) => (
              <option key={key} value={key}>{role.label}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-yellow-500" />
            Pending Invitations ({invitations.length})
          </h3>
          <div className="space-y-3">
            {invitations.map(invitation => (
              <div key={invitation.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{invitation.email}</span>
                    {getRoleBadge(invitation.role)}
                  </div>
                  <p className="text-sm text-gray-600">
                    Invited {invitation.createdAt?.toLocaleDateString()} by {invitation.inviterName}
                  </p>
                </div>
                {canPerformAction('invite') && (
                  <button
                    onClick={() => handleCancelInvitation(invitation.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Cancel
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Staff Member
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStaff.map(member => (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {member.name || 'Name not set'}
                        </div>
                        <div className="text-sm text-gray-500">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(member.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(member.status || 'active')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {member.phone || 'Not provided'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.createdAt?.toLocaleDateString() || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      {canPerformAction('edit') && member.role !== 'owner' && (
                        <>
                          <button
                            onClick={() => setEditingStaff(member)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleRemoveStaff(member.id, member.name || member.email)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStaff.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No staff members found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Modals */}
      {showInviteModal && <InviteStaffModal />}
      {editingStaff && <EditStaffModal />}
    </div>
  );
};

export default EnhancedStaffManagement;
