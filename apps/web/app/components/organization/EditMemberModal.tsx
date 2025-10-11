'use client';

import React, { useState, useEffect } from 'react';
import { updateOrganizationMember, getRoles } from '@/app/all-actions/organization/members/actions';
import { useAppDispatch } from '@/store';
import { fetchUserDetails } from '@/store/userSlice';

interface EditMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: {
    id: string;
    name: string;
    email: string;
    organizationRoleId: string;
    isVerified?: boolean;
  } | null;
  onMemberUpdated: () => void;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

export default function EditMemberModal({ 
  isOpen, 
  onClose, 
  member, 
  onMemberUpdated 
}: EditMemberModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    roleId: '',
    isVerified: true
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const [error, setError] = useState('');

  useEffect(() => {
    if (member) {
      setFormData({
        name: member.name,
        email: member.email,
        roleId: member.organizationRoleId,
        isVerified: member.isVerified ?? true
      });
    }
  }, [member]);

  useEffect(() => {
    if (isOpen) {
      loadRoles();
    }
  }, [isOpen]);

  const loadRoles = async () => {
    try {
      const result = await getRoles();
      if (result.success) {
        setRoles(result.data);
      } else {
        setError(result.error || 'Failed to load roles');
      }
    } catch (error) {
      setError('Failed to load roles');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setLoading(true);
    setError('');

    try {
      const result = await updateOrganizationMember(member.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        roleId: formData.roleId,
        isVerified: formData.isVerified
      });

      if (result.success) {
        onMemberUpdated();
        onClose();
        
        // If the current user's role was updated, refresh their data
        if ('needsUserRefresh' in result && result.needsUserRefresh) {
          // Refresh user data to get the latest role and permissions
          dispatch(fetchUserDetails());
          alert('Your role has been updated successfully! If you don\'t see all changes immediately, try switching to another organization and back.');
        }
      }
      // Error handling is now done automatically by the action function
    } catch (error) {
      // Error handling is now done automatically by the action function
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Edit Member</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="roleId" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="roleId"
              name="roleId"
              value={formData.roleId}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isVerified"
              name="isVerified"
              checked={formData.isVerified}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-700">
              Verified Member
            </label>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}