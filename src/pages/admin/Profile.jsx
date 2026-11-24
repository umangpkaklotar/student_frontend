import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { ShieldCheck, Save, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { getErrorMessage } from '../../utils/helpers';

const AdminProfile = () => {
  const { user, updateUser, showToast } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      current_password: '',
      new_password: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const payload = { name: values.name };
      if (values.new_password) {
        payload.current_password = values.current_password;
        payload.new_password = values.new_password;
      }
      const res = await authService.updateProfile(payload);
      updateUser(res.user);
      reset({
        name: res.user.name,
        current_password: '',
        new_password: '',
      });
      showToast('Profile updated successfully!');
    } catch (err) {
      setServerError(getErrorMessage(err, 'Failed to update profile.'));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="card-surface p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-bold text-white">
            {(user?.name || 'A').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                <ShieldCheck className="h-3.5 w-3.5" />
                Admin
              </span>
            </div>
            <p className="text-sm text-slate-500">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="card-surface p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">Account Settings</h3>

        {serverError && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Full Name
            </label>
            <input
              type="text"
              className="input-field"
              {...register('name', {
                required: 'Name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
              })}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                placeholder="Required only if changing password"
                className="input-field"
                {...register('current_password')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="Minimum 6 characters"
                className="input-field"
                {...register('new_password', {
                  validate: (v) =>
                    !v || v.length >= 6 || 'New password must be at least 6 characters',
                })}
              />
              {errors.new_password && (
                <p className="mt-1 text-xs text-rose-600">{errors.new_password.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;

