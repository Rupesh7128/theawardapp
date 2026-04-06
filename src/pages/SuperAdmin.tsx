import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Activity, Lock, Mail, Shield, Trophy, Users } from 'lucide-react';

type AdminUser = {
  id: string;
  email?: string;
  name?: string;
  role?: string;
  billingBypass?: boolean;
  createdAt?: any;
  adminPasscodeHash?: string;
};

type AwardRecord = {
  id: string;
  name?: string;
  ownerId?: string;
  status?: string;
  createdAt?: any;
};

type WaitlistEntry = {
  id: string;
  email?: string;
  source?: string;
  createdAt?: any;
};

const unlockStorageKey = (uid: string) => `taa-superadmin-unlocked:${uid}`;

async function hashValue(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await window.crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function formatDate(value: any) {
  if (!value) return 'N/A';
  if (typeof value?.toDate === 'function') return value.toDate().toLocaleString();
  if (typeof value?.seconds === 'number') return new Date(value.seconds * 1000).toLocaleString();
  if (typeof value === 'string' || typeof value === 'number') {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed.toLocaleString();
  }
  return 'N/A';
}

export default function SuperAdmin() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [awards, setAwards] = useState<AwardRecord[]>([]);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [adminPasscodeHash, setAdminPasscodeHash] = useState('');
  const [unlockPasscode, setUnlockPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [savingPasscode, setSavingPasscode] = useState(false);

  const hasStoredPasscode = Boolean(adminPasscodeHash);

  const sortedUsers = useMemo(
    () =>
      [...users].sort((a, b) => {
        const aRole = a.role === 'superadmin' ? 0 : 1;
        const bRole = b.role === 'superadmin' ? 0 : 1;
        if (aRole !== bRole) return aRole - bRole;
        return (a.name || a.email || '').localeCompare(b.name || b.email || '');
      }),
    [users]
  );

  const sortedWaitlist = useMemo(
    () =>
      [...waitlistEntries].sort((a, b) => {
        const aDate = typeof a.createdAt?.seconds === 'number' ? a.createdAt.seconds : new Date(a.createdAt || 0).getTime() / 1000;
        const bDate = typeof b.createdAt?.seconds === 'number' ? b.createdAt.seconds : new Date(b.createdAt || 0).getTime() / 1000;
        return bDate - aDate;
      }),
    [waitlistEntries]
  );

  const loadAdminData = async () => {
    const [usersSnap, awardsSnap, waitlistSnap] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'awards')),
      getDocs(collection(db, 'waitlist')),
    ]);

    setUsers(usersSnap.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<AdminUser, 'id'>) })));
    setAwards(awardsSnap.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<AwardRecord, 'id'>) })));
    setWaitlistEntries(waitlistSnap.docs.map((entry) => ({ id: entry.id, ...(entry.data() as Omit<WaitlistEntry, 'id'>) })));
  };

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const currentUserSnap = await getDoc(doc(db, 'users', user.uid));
        const currentUserData = currentUserSnap.exists() ? (currentUserSnap.data() as AdminUser) : null;
        const allowed = currentUserData?.role === 'superadmin';
        const passcodeHash = currentUserData?.adminPasscodeHash || '';
        const unlocked = !passcodeHash || sessionStorage.getItem(unlockStorageKey(user.uid)) === 'true';

        setAdminPasscodeHash(passcodeHash);
        setIsAdmin(Boolean(allowed));
        setIsUnlocked(Boolean(allowed && unlocked));

        if (!allowed) return;

        if (unlocked) {
          await loadAdminData();
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user]);

  const toggleUserRole = async (userId: string, currentRole: string) => {
    try {
      setUpdatingUserId(userId);
      const newRole = currentRole === 'superadmin' ? 'user' : 'superadmin';
      await updateDoc(doc(db, 'users', userId), { role: newRole });
      setUsers((current: AdminUser[]) =>
        current.map((entry: AdminUser) => (entry.id === userId ? { ...entry, role: newRole } : entry))
      );
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update role.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const toggleBillingBypass = async (userId: string, currentBypass: boolean) => {
    try {
      setUpdatingUserId(userId);
      const nextBypass = !currentBypass;
      await updateDoc(doc(db, 'users', userId), { billingBypass: nextBypass });
      setUsers((current: AdminUser[]) =>
        current.map((entry: AdminUser) => (entry.id === userId ? { ...entry, billingBypass: nextBypass } : entry))
      );
    } catch (error) {
      console.error('Error updating billing bypass:', error);
      alert('Failed to update billing bypass.');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const unlockAdmin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    try {
      setSavingPasscode(true);
      const hash = await hashValue(unlockPasscode.trim());
      if (hash !== adminPasscodeHash) {
        alert('Incorrect passcode.');
        return;
      }

      sessionStorage.setItem(unlockStorageKey(user.uid), 'true');
      setIsUnlocked(true);
      setUnlockPasscode('');
      await loadAdminData();
    } catch (error) {
      console.error('Error unlocking super admin:', error);
      alert('Unable to unlock super admin.');
    } finally {
      setSavingPasscode(false);
    }
  };

  const saveAdminPasscode = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user) return;

    const trimmedPasscode = newPasscode.trim();
    const trimmedConfirmation = confirmPasscode.trim();

    if (trimmedPasscode.length < 10) {
      alert('Use a passcode with at least 10 characters.');
      return;
    }

    if (trimmedPasscode !== trimmedConfirmation) {
      alert('Passcodes do not match.');
      return;
    }

    try {
      setSavingPasscode(true);
      const hash = await hashValue(trimmedPasscode);
      await updateDoc(doc(db, 'users', user.uid), { adminPasscodeHash: hash });
      sessionStorage.setItem(unlockStorageKey(user.uid), 'true');
      setAdminPasscodeHash(hash);
      setIsUnlocked(true);
      setNewPasscode('');
      setConfirmPasscode('');
      await loadAdminData();
    } catch (error) {
      console.error('Error saving admin passcode:', error);
      alert('Failed to save passcode.');
    } finally {
      setSavingPasscode(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#666666]">Loading...</div>;

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFAFA] px-6 text-center">
        <Shield className="h-16 w-16 text-[#EAEAEA] mb-4" />
        <h2 className="text-2xl font-bold text-[#111111]">Access Denied</h2>
        <p className="text-[#666666] mt-2 max-w-md">
          Super admin is only available to accounts with the superadmin role in Firestore. The route stays at /admin.
        </p>
      </div>
    );
  }

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-xl rounded-2xl border border-[#EAEAEA] bg-white p-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-xl border border-[#EAEAEA] bg-[#FAFAFA] p-3">
              <Lock className="h-5 w-5 text-[#111111]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#111111]">Super Admin Security</h1>
              <p className="mt-1 text-sm text-[#666666]">
                {hasStoredPasscode ? 'Enter your super admin passcode to continue.' : 'Set a passcode to protect the super admin panel.'}
              </p>
            </div>
          </div>

          {hasStoredPasscode ? (
            <form onSubmit={unlockAdmin} className="mt-8 space-y-4">
              <input
                type="password"
                value={unlockPasscode}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setUnlockPasscode(event.target.value)}
                placeholder="Enter super admin passcode"
                className="w-full rounded-xl border border-[#EAEAEA] px-4 py-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#111111]"
                required
              />
              <button
                type="submit"
                disabled={savingPasscode}
                className="w-full rounded-xl bg-[#111111] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
              >
                {savingPasscode ? 'Unlocking...' : 'Unlock Super Admin'}
              </button>
            </form>
          ) : (
            <form onSubmit={saveAdminPasscode} className="mt-8 space-y-4">
              <input
                type="password"
                value={newPasscode}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewPasscode(event.target.value)}
                placeholder="Create super admin passcode"
                className="w-full rounded-xl border border-[#EAEAEA] px-4 py-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#111111]"
                required
              />
              <input
                type="password"
                value={confirmPasscode}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConfirmPasscode(event.target.value)}
                placeholder="Confirm passcode"
                className="w-full rounded-xl border border-[#EAEAEA] px-4 py-3 text-sm text-[#111111] outline-none transition-colors focus:border-[#111111]"
                required
              />
              <button
                type="submit"
                disabled={savingPasscode}
                className="w-full rounded-xl bg-[#111111] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
              >
                {savingPasscode ? 'Saving...' : 'Set Super Admin Passcode'}
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#111111] flex items-center gap-3">
            <Shield className="h-8 w-8" />
            Super Admin Panel
          </h1>
          <p className="text-[#666666] mt-2">Manage users, protect access, review beta signups, and oversee all campaigns.</p>
        </div>
        <form onSubmit={saveAdminPasscode} className="grid gap-3 rounded-2xl border border-[#EAEAEA] bg-white p-4 sm:grid-cols-3">
          <input
            type="password"
            value={newPasscode}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setNewPasscode(event.target.value)}
            placeholder="New admin passcode"
            className="rounded-xl border border-[#EAEAEA] px-4 py-2.5 text-sm text-[#111111] outline-none transition-colors focus:border-[#111111]"
          />
          <input
            type="password"
            value={confirmPasscode}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setConfirmPasscode(event.target.value)}
            placeholder="Confirm passcode"
            className="rounded-xl border border-[#EAEAEA] px-4 py-2.5 text-sm text-[#111111] outline-none transition-colors focus:border-[#111111]"
          />
          <button
            type="submit"
            disabled={savingPasscode || !newPasscode || !confirmPasscode}
            className="rounded-xl bg-[#111111] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-black disabled:opacity-60"
          >
            {savingPasscode ? 'Saving...' : hasStoredPasscode ? 'Change Passcode' : 'Set Passcode'}
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-8">
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
                <dd className="text-2xl font-bold text-[#111111]">{awards.filter((entry: AwardRecord) => entry.status === 'published').length}</dd>
              </dl>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-[#EAEAEA] px-6 py-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-[#FAFAFA] rounded-md p-3 border border-[#EAEAEA]">
              <Mail className="h-6 w-6 text-[#111111]" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-[#666666] truncate">Beta Waitlist</dt>
                <dd className="text-2xl font-bold text-[#111111]">{waitlistEntries.length}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-sm sm:rounded-xl border border-[#EAEAEA] mb-8 overflow-hidden">
        <div className="px-6 py-5 border-b border-[#EAEAEA]">
          <h3 className="text-lg font-semibold leading-6 text-[#111111]">Beta Waitlist Signups</h3>
          <p className="mt-1 text-sm text-[#666666]">Everyone who joined the private beta waitlist appears here.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#EAEAEA]">
            <thead className="bg-[#FAFAFA]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Source</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-[#666666] uppercase tracking-wider">Joined</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#EAEAEA]">
              {sortedWaitlist.length > 0 ? (
                sortedWaitlist.map((entry: WaitlistEntry) => (
                  <tr key={entry.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111111]">{entry.email || 'Unknown'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">{entry.source || 'landing'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">{formatDate(entry.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-6 text-sm text-[#666666]">No waitlist signups yet.</td>
                </tr>
              )}
            </tbody>
          </table>
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
              {sortedUsers.map((entry: AdminUser) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111111]">{entry.name || 'Unknown'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">{entry.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.role === 'superadmin' ? 'bg-[#111111] text-white' : 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA]'}`}>
                      {entry.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.billingBypass ? 'bg-green-100 text-green-800' : 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA]'}`}>
                      {entry.billingBypass ? 'Bypassed' : 'Standard'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">{formatDate(entry.createdAt)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-4">
                      <button
                        onClick={() => toggleBillingBypass(entry.id, Boolean(entry.billingBypass))}
                        disabled={updatingUserId === entry.id}
                        className="text-[#111111] hover:underline disabled:opacity-50 disabled:no-underline"
                      >
                        {entry.billingBypass ? 'Remove Bypass' : 'Approve (Bypass Billing)'}
                      </button>
                      <button
                        onClick={() => toggleUserRole(entry.id, entry.role || 'user')}
                        disabled={entry.id === user?.uid || updatingUserId === entry.id}
                        className="text-[#111111] hover:underline disabled:opacity-50 disabled:no-underline"
                      >
                        {entry.role === 'superadmin' ? 'Revoke Admin' : 'Make Admin'}
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
              {awards.map((entry: AwardRecord) => (
                <tr key={entry.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#111111]">{entry.name || 'Untitled Campaign'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666] font-mono text-xs">{entry.ownerId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${entry.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA]'}`}>
                      {entry.status || 'draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#666666]">{formatDate(entry.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
