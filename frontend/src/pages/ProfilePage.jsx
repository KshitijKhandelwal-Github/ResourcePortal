import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getCurrentUser } from '../api/users';
import { getResources } from '../api/resources';
import { getTraining, addTraining } from '../api/training';
import { getCertifications, addCertification } from '../api/certifications';
import { getSkills } from '../api/skills';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import Modal from '../components/Modal';

const statusBadge = (status) => {
  const cls = {
    'Available': 'badge-available', 'Allocated': 'badge-allocated',
    'On Training': 'badge-training', 'On Leave': 'badge-leave',
    'Completed': 'badge-completed', 'In Progress': 'badge-in-progress', 'Planned': 'badge-planned',
  };
  return <span className={`badge ${cls[status] || ''}`}>{status}</span>;
};

const ProfilePage = () => {
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [training, setTraining] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modal states
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    training_name: '', skill_id: '', status: 'Planned', start_date: '', completion_date: '',
  });
  const [certForm, setCertForm] = useState({
    name: '', issuing_organization: '', issue_date: '', expiry_date: '',
  });

  useEffect(() => {
    loadProfile();
    loadSkills();
  }, []);

  const loadSkills = async () => {
    try {
      const res = await getSkills();
      setSkills(res.data);
    } catch (err) { /* ignore */ }
  };

  const loadProfile = async () => {
    setLoading(true);
    try {
      // Find the resource linked to the current user
      const res = await getResources({ search: user?.username || '', limit: 100 });
      const items = res.data.items || res.data;
      // Try to match by user_id or by name/email
      const myResource = items.find(r => r.user_id === user?.id) || items[0];

      if (myResource) {
        setResource(myResource);
        try {
          const [trainRes, certRes] = await Promise.all([
            getTraining(myResource.employee_id),
            getCertifications(myResource.employee_id),
          ]);
          setTraining(trainRes.data);
          setCertifications(certRes.data);
        } catch (e) { /* empty */ }
      }
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTraining = async (e) => {
    e.preventDefault();
    if (!resource) return;
    try {
      const payload = { ...trainingForm };
      if (payload.skill_id) payload.skill_id = parseInt(payload.skill_id);
      else delete payload.skill_id;
      if (!payload.start_date) delete payload.start_date;
      if (!payload.completion_date) delete payload.completion_date;
      await addTraining(resource.employee_id, payload);
      setToast({ message: 'Training added', type: 'success' });
      setShowTrainingModal(false);
      setTrainingForm({ training_name: '', skill_id: '', status: 'Planned', start_date: '', completion_date: '' });
      // Reload
      const trainRes = await getTraining(resource.employee_id);
      setTraining(trainRes.data);
    } catch (err) {
      setToast({ message: 'Failed to add training', type: 'error' });
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!resource) return;
    try {
      const payload = { ...certForm };
      if (!payload.issue_date) delete payload.issue_date;
      if (!payload.expiry_date) delete payload.expiry_date;
      await addCertification(resource.employee_id, payload);
      setToast({ message: 'Certification added', type: 'success' });
      setShowCertModal(false);
      setCertForm({ name: '', issuing_organization: '', issue_date: '', expiry_date: '' });
      const certRes = await getCertifications(resource.employee_id);
      setCertifications(certRes.data);
    } catch (err) {
      setToast({ message: 'Failed to add certification', type: 'error' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      {/* User Info */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">Account Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label>Username</label>
            <div style={{ fontWeight: 500 }}>{user?.username}</div>
          </div>
          <div>
            <label>Email</label>
            <div>{user?.email}</div>
          </div>
          <div>
            <label>Role</label>
            <div><span className="badge badge-available">{user?.role}</span></div>
          </div>
        </div>
      </div>

      {resource ? (
        <>
          {/* Resource Info */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="card-header">Resource Profile</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div><label>Employee ID</label><div>{resource.employee_id}</div></div>
              <div><label>Name</label><div>{resource.name}</div></div>
              <div><label>Cluster</label><div>{resource.cluster?.name || '—'}</div></div>
              <div><label>Designation</label><div>{resource.designation || '—'}</div></div>
              <div><label>Experience</label><div>{resource.years_of_experience != null ? `${resource.years_of_experience} yrs` : '—'}</div></div>
              <div><label>Status</label><div>{statusBadge(resource.availability_status)}</div></div>
              <div><label>Current Location</label><div>{resource.current_location?.city || '—'}</div></div>
              <div><label>Preferred Location</label><div>{resource.preferred_location?.city || '—'}</div></div>
              <div><label>Primary Skill</label><div>{resource.primary_skill ? <span className="skill-tag primary">{resource.primary_skill.name}</span> : '—'}</div></div>
            </div>
          </div>

          {/* Training */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div className="card-header" style={{ margin: 0, border: 'none', padding: 0 }}>Training Records</div>
              <button className="btn-primary btn-sm" onClick={() => setShowTrainingModal(true)}>+ Add Training</button>
            </div>
            {training.length > 0 ? (
              <table className="data-table">
                <thead><tr><th>Training</th><th>Status</th><th>Start</th><th>Completion</th></tr></thead>
                <tbody>
                  {training.map(t => (
                    <tr key={t.id}>
                      <td>{t.training_name}</td>
                      <td>{statusBadge(t.status)}</td>
                      <td>{t.start_date || '—'}</td>
                      <td>{t.completion_date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state">No training records</div>}
          </div>

          {/* Certifications */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '16px' }}>
              <div className="card-header" style={{ margin: 0, border: 'none', padding: 0 }}>Certifications</div>
              <button className="btn-primary btn-sm" onClick={() => setShowCertModal(true)}>+ Add Certification</button>
            </div>
            {certifications.length > 0 ? (
              <table className="data-table">
                <thead><tr><th>Name</th><th>Organization</th><th>Issue Date</th><th>Expiry</th></tr></thead>
                <tbody>
                  {certifications.map(c => (
                    <tr key={c.id}>
                      <td>{c.name}</td>
                      <td>{c.issuing_organization || '—'}</td>
                      <td>{c.issue_date || '—'}</td>
                      <td>{c.expiry_date || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <div className="empty-state">No certifications</div>}
          </div>
        </>
      ) : (
        <div className="card">
          <div className="empty-state">
            <p>No resource profile linked to your account.</p>
            <p style={{ fontSize: '12px', marginTop: '8px' }}>Contact an administrator to link a resource profile to your user account.</p>
          </div>
        </div>
      )}

      {/* Add Training Modal */}
      <Modal isOpen={showTrainingModal} title="Add Training" onClose={() => setShowTrainingModal(false)}>
        <form onSubmit={handleAddTraining}>
          <div className="form-group">
            <label>Training Name *</label>
            <input value={trainingForm.training_name} onChange={e => setTrainingForm(p => ({ ...p, training_name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Related Skill</label>
            <select value={trainingForm.skill_id} onChange={e => setTrainingForm(p => ({ ...p, skill_id: e.target.value }))}>
              <option value="">None</option>
              {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={trainingForm.status} onChange={e => setTrainingForm(p => ({ ...p, status: e.target.value }))}>
              <option value="Planned">Planned</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input type="date" value={trainingForm.start_date} onChange={e => setTrainingForm(p => ({ ...p, start_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Completion Date</label>
              <input type="date" value={trainingForm.completion_date} onChange={e => setTrainingForm(p => ({ ...p, completion_date: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Add Training</button>
        </form>
      </Modal>

      {/* Add Certification Modal */}
      <Modal isOpen={showCertModal} title="Add Certification" onClose={() => setShowCertModal(false)}>
        <form onSubmit={handleAddCert}>
          <div className="form-group">
            <label>Certification Name *</label>
            <input value={certForm.name} onChange={e => setCertForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Issuing Organization</label>
            <input value={certForm.issuing_organization} onChange={e => setCertForm(p => ({ ...p, issuing_organization: e.target.value }))} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Issue Date</label>
              <input type="date" value={certForm.issue_date} onChange={e => setCertForm(p => ({ ...p, issue_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Expiry Date</label>
              <input type="date" value={certForm.expiry_date} onChange={e => setCertForm(p => ({ ...p, expiry_date: e.target.value }))} />
            </div>
          </div>
          <button type="submit" className="btn-primary">Add Certification</button>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;