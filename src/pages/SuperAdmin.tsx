import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Shield, Users, Trophy, Activity } from 'lucide-react';

export default function SuperAdmin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      if (!user) return;
      
      try {
        const currentUserSnap = await getDoc(doc(db, 'users', user.uid));
        const currentUserData = currentUserSnap.exists() ? (currentUserSnap.data() as any) : null;
        const allowed = currentUserData?.role === 'superadmin';
        setIsAdmin(Boolean(allowed));
        if (!allowed) return;

        const [usersSnap, awardsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'awards')),
        ]);

        setUsers(usersSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
        setAwards(awardsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching admin data:", error);
        // If permission denied, they are not admin
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchData();
  }, [user]);

  const toggleUserRole = async (userId: string, currentRole: string) => {
    try {
      setUpdatingUserId(userId);
      const newRole = currentRole === 'superadmin' ? 'user' : 'superadmin';
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      console.error("Error updating user role:", error);
      alert("Failed to update role.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const toggleBillingBypass = async (userId: string, currentBypass: boolean) => {
    try {
      setUpdatingUserId(userId);
      const nextBypass = !currentBypass;
      await updateDoc(doc(db, 'users', userId), { billingBypass: nextBypass });
      setUsers(users.map(u => u.id === userId ? { ...u, billingBypass: nextBypass } : u));
    } catch (error) {
      console.error("Error updating billing bypass:", error);
      alert("Failed to update billing bypass.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#666666]">Loading...</div>;
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA]">
        <Shield className="h-16 w-16 text-[#EAEAEA] mb-4" />
        <h2 className="text-2xl font-bold text-[#111111]">Access Denied</h2>
        <p className="text-[#666666] mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#111111] flex items-center gap-3">
          <Shield className="h-8 w-8" />
          Super Admin Panel
        </h1>
        <p className="text-[#666666] mt-2">Manage users, monitor platform activity, and oversee all campaigns.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#EAEAEA] px-6 py-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-[#FAFAFA] rounded-md p-3 border border-[#EAEAEA]">
              <Users className="h-6 w-6 text-[#111111]" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-[#666666] truncate">Total Users</dt>
                <dd className="text-2xl font-bold text-[#111111]">{users.length}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#EAEAEA] px-6 py-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-[#FAFAFA] rounded-md p-3 border border-[#EAEAEA]">
              <Trophy className="h-6 w-6 text-[#111111]" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-[#666666] truncate">Total Campaigns</dt>
                <dd className="text-2xl font-bold text-[#111111]">{awards.length}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#EAEAEA] px-6 py-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-[#FAFAFA] rounded-md p-3 border border-[#EAEAEA]">
              <Activity className="h-6 w-6 text-[#111111]" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-[#666666] truncate">Active Campaigns</dt>
                <dd className="text-2xl font-bold text-[#111111]">{awards.filter(a => a.status === 'published').length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm sm:rounded-xl border border-[#EAEAEA] mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EAEAEA]">
          <h3 className="text-lg font-semibold leading-6 text-[#111111]">Users Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#EAEAEA]">
            <thead className="bg-[#FAFAFA]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">User</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Billing</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Joined</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-[#666666] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#EAEAEA]">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111111]">{u.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === 'superadmin' ? 'bg-[#111111] text-white' : 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA]'}`}>
                      {u.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.billingBypass ? 'bg-green-100 text-green-800' : 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA]'}`}>
                      {u.billingBypass ? 'Bypassed' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => toggleBillingBypass(u.id, Boolean(u.billingBypass))}
                        disabled={updatingUserId === u.id}
                        className="text-[#111111] hover:underline disabled:opacity-50 disabled:no-underline"
                      >
                        {u.billingBypass ? 'Remove Bypass' : 'Approve (Bypass Billing)'}
                      </button>
                      <button
                        onClick={() => toggleUserRole(u.id, u.role)}
                        disabled={u.id === user?.uid || updatingUserId === u.id}
                        className="text-[#111111] hover:underline disabled:opacity-50 disabled:no-underline"
                      >
                        {u.role === 'superadmin' ? 'Revoke Admin' : 'Make Admin'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-white shadow-sm sm:rounded-xl border border-[#EAEAEA] overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EAEAEA]">
          <h3 className="text-lg font-semibold leading-6 text-[#111111]">Platform Campaigns</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#EAEAEA]">
            <thead className="bg-[#FAFAFA]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Campaign Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Owner ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#EAEAEA]">
              {awards.map((a) => (
                <tr key={a.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111111]">{a.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666] font-mono text-xs">{a.ownerId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${a.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA]'}`}>
                      {a.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">
                    {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
