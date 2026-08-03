import React, { useState } from 'react';
import { User, Mail, Shield, Lock } from 'lucide-react';
import Card, { CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useAuthStore } from '../../store/authStore';

const AdminProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword, isLoading, error } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [location, setLocation] = useState((user as any)?.location || '');
  const [msg, setMsg] = useState<string | null>(null);
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!user) return null;

  const onSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profilePicture: profilePicture.trim() || null,
        location: location.trim() || null,
      });
      setMsg('Profile saved.');
    } catch {
      /* store sets error */
    }
  };

  const onChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (newPassword !== confirmPassword) {
      setPwdMsg('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setPwdMsg('New password must be at least 6 characters.');
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setPwdMsg('Password updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwdMsg(err instanceof Error ? err.message : 'Failed to change password');
    }
  };

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-1">
        <CardContent className="p-6 text-center">
          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt=""
              className="w-24 h-24 rounded-full object-cover mx-auto mb-3 border border-surface-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-3">
              <User className="h-12 w-12 text-brand-600" />
            </div>
          )}
          <h2 className="font-semibold text-lg text-surface-900">
            {user.firstName} {user.lastName}
          </h2>
          <div className="mt-3 space-y-2 text-sm text-surface-600 text-left">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-surface-400" /> {user.email}
            </div>
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-surface-400" />
              <span className="capitalize font-medium text-brand-700">{user.role}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-surface-900 mb-4">Edit profile</h3>
            <form onSubmit={onSaveProfile} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                <Input label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
              <Input
                label="Profile picture URL"
                value={profilePicture}
                onChange={(e) => setProfilePicture(e.target.value)}
                placeholder="https://…"
              />
              <Input label="Location" value={location} onChange={(e) => setLocation(e.target.value)} />
              {msg && <p className="text-sm text-emerald-600">{msg}</p>}
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" isLoading={isLoading}>
                Save profile
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-surface-900 mb-4 flex items-center gap-2">
              <Lock size={16} /> Change password
            </h3>
            <form onSubmit={onChangePassword} className="space-y-4 max-w-md">
              <Input
                label="Current password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <Input
                label="New password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <Input
                label="Confirm new password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              {pwdMsg && (
                <p className={`text-sm ${pwdMsg.includes('updated') ? 'text-emerald-600' : 'text-red-600'}`}>
                  {pwdMsg}
                </p>
              )}
              <Button type="submit" variant="secondary" isLoading={isLoading}>
                Update password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminProfilePage;
