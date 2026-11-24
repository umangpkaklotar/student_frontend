import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, UserPlus } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage, getTodayISO } from '../../utils/helpers';

const AddStudent = () => {
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      gender: 'Male',
      date_of_birth: '',
      address: '',
      class_type: 'karate',
      joining_date: getTodayISO(),
      monthly_fee: '1000',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const res = await studentService.create({
        ...values,
        monthly_fee: Number(values.monthly_fee),
      });
      showToast(`Student ${res.student.student_id} created successfully!`);
      navigate('/admin/students');
    } catch (err) {
      setServerError(getErrorMessage(err, 'Failed to create student.'));
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex items-center justify-between">
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Students
        </Link>
      </div>

      <div className="card-surface p-6 sm:p-8">
        <div className="mb-6 border-b border-slate-200 pb-4">
          <h2 className="text-lg font-bold text-slate-900">Register New Student</h2>
          <p className="mt-1 text-sm text-slate-500">
            Create a student account and assign Karate or Skating class with monthly fee.
          </p>
        </div>

        {serverError && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Rahul Patel"
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Email Address *
              </label>
              <input
                type="email"
                placeholder="student@gmail.com"
                className="input-field"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email',
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Account Password *
              </label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                className="input-field"
                {...register('password', {
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Minimum 8 characters' },
                })}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Mobile Number *
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                className="input-field"
                {...register('phone', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^(\+91[\s-]?)?[6-9]\d{9}$/,
                    message: 'Enter a valid 10-digit Indian mobile number',
                  },
                })}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Gender *
              </label>
              <select className="input-field" {...register('gender', { required: true })}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date of Birth *
              </label>
              <input
                type="date"
                className="input-field"
                {...register('date_of_birth', { required: 'Date of birth is required' })}
              />
              {errors.date_of_birth && (
                <p className="mt-1 text-xs text-rose-600">{errors.date_of_birth.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Class Type *
              </label>
              <select className="input-field" {...register('class_type', { required: true })}>
                <option value="karate">Karate</option>
                <option value="skating">Skating</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Joining Date *
              </label>
              <input
                type="date"
                className="input-field"
                {...register('joining_date', { required: 'Joining date is required' })}
              />
              {errors.joining_date && (
                <p className="mt-1 text-xs text-rose-600">{errors.joining_date.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Monthly Fee (INR) *
              </label>
              <input
                type="number"
                min="1"
                step="1"
                className="input-field"
                {...register('monthly_fee', {
                  required: 'Monthly fee is required',
                  min: { value: 1, message: 'Fee must be greater than 0' },
                })}
              />
              {errors.monthly_fee && (
                <p className="mt-1 text-xs text-rose-600">{errors.monthly_fee.message}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Address *
              </label>
              <textarea
                rows={3}
                placeholder="Full residential address"
                className="input-field"
                {...register('address', {
                  required: 'Address is required',
                  minLength: { value: 3, message: 'Minimum 3 characters' },
                })}
              />
              {errors.address && (
                <p className="mt-1 text-xs text-rose-600">{errors.address.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
            <Link to="/admin/students" className="btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" />
                  Create Student
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStudent;
