import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Save } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';
import { getErrorMessage } from '../../utils/helpers';

const EditStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [serverError, setServerError] = useState('');
  const [studentCode, setStudentCode] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  useEffect(() => {
    let active = true;
    const fetchStudent = async () => {
      setLoading(true);
      setLoadError('');
      try {
        const data = await studentService.getById(id);
        if (active && data.student) {
          setStudentCode(data.student.student_id);
          reset({
            name: data.student.name,
            email: data.student.email,
            phone: data.student.phone,
            gender: data.student.gender,
            date_of_birth: data.student.date_of_birth,
            address: data.student.address,
            class_type: data.student.class_type,
            joining_date: data.student.joining_date,
            monthly_fee: String(data.student.monthly_fee),
            status: data.student.status,
            password: '',
          });
        }
      } catch (err) {
        if (active) setLoadError(getErrorMessage(err, 'Failed to load student.'));
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchStudent();
    return () => {
      active = false;
    };
  }, [id, reset]);

  const onSubmit = async (values) => {
    setServerError('');
    try {
      const payload = {
        ...values,
        monthly_fee: Number(values.monthly_fee),
      };
      if (!payload.password) delete payload.password;
      await studentService.update(id, payload);
      showToast('Student updated successfully!');
      navigate('/admin/students');
    } catch (err) {
      setServerError(getErrorMessage(err, 'Failed to update student.'));
    }
  };

  if (loading) return <LoadingSpinner label="Loading student details..." />;
  if (loadError) return <ErrorMessage message={loadError} />;

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
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            {studentCode}
          </span>
          <h2 className="text-lg font-bold text-slate-900">Edit Student Profile</h2>
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
                className="input-field"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                New Password (optional)
              </label>
              <input
                type="password"
                placeholder="Leave blank to keep unchanged"
                className="input-field"
                {...register('password', {
                  validate: (v) =>
                    !v || v.length >= 6 || 'Password must be at least 6 characters',
                })}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-rose-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Phone Number *
              </label>
              <input
                type="text"
                className="input-field"
                {...register('phone', { required: 'Phone is required' })}
              />
              {errors.phone && (
                <p className="mt-1 text-xs text-rose-600">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Gender *
              </label>
              <select className="input-field" {...register('gender')}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Date of Birth *
              </label>
              <input type="date" className="input-field" {...register('date_of_birth')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Class Type *
              </label>
              <select className="input-field" {...register('class_type')}>
                <option value="karate">Karate</option>
                <option value="skating">Skating</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Joining Date *
              </label>
              <input type="date" className="input-field" {...register('joining_date')} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Monthly Fee (INR) *
              </label>
              <input
                type="number"
                min="1"
                className="input-field"
                {...register('monthly_fee', {
                  required: 'Monthly fee is required',
                  min: { value: 1, message: 'Must be greater than 0' },
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Status *
              </label>
              <select className="input-field" {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Address *
              </label>
              <textarea
                rows={3}
                className="input-field"
                {...register('address', { required: 'Address is required' })}
              />
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

export default EditStudent;
