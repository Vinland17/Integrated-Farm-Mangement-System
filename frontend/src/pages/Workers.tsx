import React, { useEffect, useState } from 'react';
import { Users, Plus, Phone, Mail, Clock, Briefcase, UserCheck, UserX, Activity, Edit3, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { StatusBadge } from '../components/common/StatusBadge';
import { FormModal } from '../components/common/FormModal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SearchBar } from '../components/common/SearchBar';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { EmptyState } from '../components/common/EmptyState';
import { workerService } from '../services/workerService';
import { Worker, WorkerStatus } from '../types';
import { useToast } from '../hooks/useToast';

export const Workers: React.FC = () => {
  const { showToast } = useToast();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State (for both Add and Edit)
  const [name, setName] = useState('');
  const [role, setRole] = useState('Field Technician');
  const [assignedField, setAssignedField] = useState('Field A');
  const [currentTask, setCurrentTask] = useState('General Inspection');
  const [hoursLogged, setHoursLogged] = useState('0');
  const [status, setStatus] = useState<WorkerStatus>('Available');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [email, setEmail] = useState('tech@farm.agri');
  const [avatar, setAvatar] = useState('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');

  useEffect(() => {
    loadWorkers();
  }, []);

  const loadWorkers = async () => {
    setLoading(true);
    try {
      const data = await workerService.getWorkers();
      setWorkers(data);
    } catch (err: any) {
      showToast('Failed to load workers', err?.response?.data?.message || 'Database error fetching workforce records.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingWorker(null);
    setName('');
    setRole('Field Technician');
    setAssignedField('Field A');
    setCurrentTask('Routine Inspection');
    setHoursLogged('0');
    setStatus('Available');
    setPhone('+1 (555) 123-4567');
    setEmail('worker@farm.agri');
    setAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');
    setIsAddOpen(true);
  };

  const handleOpenEditModal = (worker: Worker) => {
    setEditingWorker(worker);
    setName(worker.name);
    setRole(worker.role);
    setAssignedField(worker.assignedField);
    setCurrentTask(worker.currentTask);
    setHoursLogged(String(worker.hoursLogged || 0));
    setStatus(worker.status);
    setPhone(worker.phone || '');
    setEmail(worker.email || '');
    setAvatar(worker.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80');
    setIsAddOpen(true);
  };

  const handleSubmitWorker = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const workerData: Partial<Worker> = {
      name: name.trim(),
      role: role.trim(),
      assignedField: assignedField.trim(),
      currentTask: currentTask.trim(),
      hoursLogged: parseFloat(hoursLogged) || 0,
      status,
      phone: phone.trim(),
      email: email.trim(),
      avatar,
    };

    try {
      if (editingWorker) {
        const workerId = (editingWorker._id || editingWorker.id) as string;
        const updated = await workerService.updateWorker(workerId, workerData);
        showToast('Worker Updated', `Personnel record for "${updated.name}" updated successfully.`, 'success');
      } else {
        const created = await workerService.createWorker(workerData);
        showToast('Worker Onboarded', `Personnel record for "${created.name}" registered in database.`, 'success');
      }
      setIsAddOpen(false);
      loadWorkers();
    } catch (err: any) {
      showToast('Action Failed', err?.response?.data?.message || 'Failed to save worker profile.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickStatusToggle = async (worker: Worker) => {
    const workerId = (worker._id || worker.id) as string;
    let nextStatus: WorkerStatus = 'Available';
    if (worker.status === 'Available') nextStatus = 'Working';
    else if (worker.status === 'Working') nextStatus = 'On Leave';
    else if (worker.status === 'On Leave') nextStatus = 'Available';

    try {
      await workerService.updateWorker(workerId, { status: nextStatus });
      showToast('Status Updated', `${worker.name}'s status changed to ${nextStatus}.`, 'info');
      loadWorkers();
    } catch (err: any) {
      showToast('Status Update Failed', err?.response?.data?.message || 'Could not update status.', 'error');
    }
  };

  const handleDeleteWorker = async () => {
    if (!deleteId) return;
    try {
      await workerService.deleteWorker(deleteId);
      showToast('Worker Removed', 'Personnel record deleted from database.', 'info');
      setDeleteId(null);
      loadWorkers();
    } catch (err: any) {
      showToast('Delete Failed', err?.response?.data?.message || 'Failed to delete worker.', 'error');
    }
  };

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.role.toLowerCase().includes(search.toLowerCase()) ||
      w.currentTask.toLowerCase().includes(search.toLowerCase()) ||
      w.assignedField.toLowerCase().includes(search.toLowerCase())
  );

  // Workforce KPI Metrics Calculation
  const totalPersonnel = workers.length;
  const activeWorkers = workers.filter((w) => w.status === 'Working').length;
  const availableWorkers = workers.filter((w) => w.status === 'Available').length;
  const totalHoursLogged = workers.reduce((sum, w) => sum + (w.hoursLogged || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      <PageHeader
        title="Workforce & Task Assignments"
        subtitle="Manage field personnel, labor hours, task scheduling, and operational availability."
        icon={<Users className="w-6 h-6" />}
        action={
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Worker / Assign Task
          </button>
        }
      />

      {/* Workforce Dashboard Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-agri-50 text-agri-700 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Personnel</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{totalPersonnel}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Working</p>
              <h3 className="text-xl font-extrabold text-emerald-700 mt-0.5">{activeWorkers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-50 text-sky-700 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available</p>
              <h3 className="text-xl font-extrabold text-sky-700 mt-0.5">{availableWorkers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-700 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Hours</p>
              <h3 className="text-xl font-extrabold text-amber-800 mt-0.5">{totalHoursLogged} hrs</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <SearchBar value={search} onChange={setSearch} placeholder="Search worker name, role, or task..." />
      </div>

      {/* Grid of Worker Cards or Loading / Empty States */}
      {loading ? (
        <LoadingSkeleton count={4} height="h-48" />
      ) : filteredWorkers.length === 0 ? (
        <EmptyState
          icon={<Users className="w-10 h-10 text-slate-400" />}
          title="No Workforce Records Found"
          description={search ? `No personnel matched search query "${search}".` : "You haven't added any workers or assigned tasks yet."}
          action={
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 bg-agri-700 hover:bg-agri-800 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer"
            >
              Add Worker Profile
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredWorkers.map((worker) => {
            const workerId = (worker._id || worker.id) as string;
            return (
              <div
                key={workerId}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={worker.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                        alt={worker.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-agri-500/30 shrink-0"
                      />
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900">{worker.name}</h3>
                        <span className="text-xs font-semibold text-agri-700">{worker.role}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuickStatusToggle(worker)}
                        title="Click to toggle status (Available -> Working -> On Leave)"
                        className="cursor-pointer transition-transform hover:scale-105"
                      >
                        <StatusBadge status={worker.status} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5" /> Assigned Field:
                      </span>
                      <strong className="text-slate-800">{worker.assignedField}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block mb-0.5">Current Task:</span>
                      <span className="font-bold text-slate-900 bg-white px-2.5 py-1 rounded-md border border-slate-200 block">
                        {worker.currentTask}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    {worker.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {worker.phone}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-semibold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-agri-600" /> {worker.hoursLogged} hrs logged
                    </span>
                    <button
                      onClick={() => handleOpenEditModal(worker)}
                      className="p-1.5 text-slate-400 hover:text-agri-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      title="Edit Worker Profile"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(workerId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete Worker Profile"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Worker Modal */}
      <FormModal
        isOpen={isAddOpen}
        title={editingWorker ? 'Edit Worker Profile & Task' : 'Register Worker / Assign Task'}
        onClose={() => setIsAddOpen(false)}
      >
        <form onSubmit={handleSubmitWorker} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Role Title</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Field Technician"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Assigned Field</label>
              <input
                type="text"
                required
                value={assignedField}
                onChange={(e) => setAssignedField(e.target.value)}
                placeholder="e.g. Field A - Tomato Plot"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Current Task Description</label>
            <textarea
              rows={2}
              required
              value={currentTask}
              onChange={(e) => setCurrentTask(e.target.value)}
              placeholder="e.g. Irrigation manifold inspection and fertilizer application"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Hours Logged</label>
              <input
                type="number"
                min="0"
                step="0.5"
                required
                value={hoursLogged}
                onChange={(e) => setHoursLogged(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WorkerStatus)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              >
                <option value="Available">Available</option>
                <option value="Working">Working</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ramesh@farm.agri"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-agri-700 hover:bg-agri-800 rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingWorker ? 'Save Changes' : 'Save Worker Profile'}
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Remove Worker Record"
        message="Are you sure you want to remove this personnel profile and task assignment from MongoDB Atlas?"
        onConfirm={handleDeleteWorker}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
