import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getResources, updateResource, createResource } from '../api/resources';
import { getTraining, addTraining } from '../api/training';
import { getCertifications, addCertification } from '../api/certifications';
import { getSkills } from '../api/skills';
import { getClusters } from '../api/clusters';
import { getLocations } from '../api/locations';
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
  const [clusters, setClusters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Create profile modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({});
  const [createLoading, setCreateLoading] = useState(false);

  // Edit profile modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  // Training modal
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [trainingForm, setTrainingForm] = useState({
    training_name: '', skill_id: '', status: 'Planned', start_date: '', completion_date: '',
  });

  // Certification modal
  const [showCertModal, setShowCertModal] = useState(false);
  const [certForm, setCertForm] = useState({
    certification_name: '', issuing_organization: '', issue_date: '', expiry_date: '',
  });

  const loadReferenceData = async () => {
    try {
      const [skillsRes, clustersRes, locationsRes] = await Promise.all([
        getSkills(),
        getClusters(),
        getLocations(),
      ]);
      setSkills(skillsRes.data);
      setClusters(clustersRes.data);
      setLocations(locationsRes.data);
    } catch (err) { /* ignore */ }
  };

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getResources({ limit: 1 });
      const items = res.data.items || res.data;
      const myResource = items[0];

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
  }, [user]);

  useEffect(() => {
    loadProfile();
    loadReferenceData();
  }, [loadProfile]);

  const openCreateModal = () => {
    setCreateForm({
      employee_id: user?.username || '',
      email: user?.email || '',
      name: '',
      designation: '',
      years_of_experience: '',
      cluster_id: '',
      current_location_id: '',
      preferred_location_id: '',
      availability_status: 'Available',
      primary_skill_id: '',
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      const payload = { ...createForm };
      
      // employee_id and email are passed from user context, ensure they aren't empty
      if (!payload.employee_id || !payload.email) {
          throw new Error('Employee ID and Email are required.');
      }
      
      // user_id MUST be set for profile creation
      payload.user_id = user.id;

      if (payload.years_of_experience !== '') payload.years_of_experience = parseFloat(payload.years_of_experience);
      else payload.years_of_experience = 0;
      if (payload.cluster_id) payload.cluster_id = parseInt(payload.cluster_id);
      else throw new Error("Cluster is required");
      if (payload.current_location_id) payload.current_location_id = parseInt(payload.current_location_id);
      else payload.current_location_id = null;
      if (payload.preferred_location_id) payload.preferred_location_id = parseInt(payload.preferred_location_id);
      else payload.preferred_location_id = null;
      if (payload.primary_skill_id) payload.primary_skill_id = parseInt(payload.primary_skill_id);
      else payload.primary_skill_id = null;

      await createResource(payload);
      setToast({ message: 'Profile created successfully', type: 'success' });
      setShowCreateModal(false);
      
      // Update local storage user token details if we could, 
      // but simpler is to just reload the profile
      await loadProfile();
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to create profile';
      setToast({ message: msg, type: 'error' });
    } finally {
      setCreateLoading(false);
    }
  };

  const openEditModal = () => {
    if (!resource) return;
    setEditForm({
      name: resource.name || '',
      email: resource.email || '',
      designation: resource.designation || '',
      years_of_experience: resource.years_of_experience ?? '',
      cluster_id: resource.cluster_id || '',
      current_location_id: resource.current_location_id || '',
      preferred_location_id: resource.preferred_location_id || '',
      availability_status: resource.availability_status || 'Available',
      primary_skill_id: resource.primary_skill_id || '',
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!resource) return;
    setEditLoading(true);
    try {
      const payload = { ...editForm };
      // Convert numeric fields
      if (payload.years_of_experience !== '') payload.years_of_experience = parseFloat(payload.years_of_experience);
      else delete payload.years_of_experience;
      if (payload.cluster_id) payload.cluster_id = parseInt(payload.cluster_id);
      else delete payload.cluster_id;
      if (payload.current_location_id) payload.current_location_id = parseInt(payload.current_location_id);
      else payload.current_location_id = null;
      if (payload.preferred_location_id) payload.preferred_location_id = parseInt(payload.preferred_location_id);
      else payload.preferred_location_id = null;
      if (payload.primary_skill_id) payload.primary_skill_id = parseInt(payload.primary_skill_id);
      else payload.primary_skill_id = null;

      await updateResource(resource.employee_id, payload);
      setToast({ message: 'Profile updated successfully', type: 'success' });
      setShowEditModal(false);
      await loadProfile();
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to update profile';
      setToast({ message: msg, type: 'error' });
    } finally {
      setEditLoading(false);
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
      setToast({ message: 'Training added successfully', type: 'success' });
      setShowTrainingModal(false);
      setTrainingForm({ training_name: '', skill_id: '', status: 'Planned', start_date: '', completion_date: '' });
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
      setToast({ message: 'Certification added successfully', type: 'success' });
      setShowCertModal(false);
      setCertForm({ certification_name: '', issuing_organization: '', issue_date: '', expiry_date: '' });
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div>
            <label>Username</label>
            <div style={{ fontWeight: 600, color: 'var(--black)' }}>{user?.username}</div>
          </div>
          <div>
            <label>Email</label>
            <div style={{ color: 'var(--dark-gray)' }}>{user?.email}</div>
          </div>
          <div>
            <label>Employee ID</label>
            <div style={{ fontWeight: 600, color: 'var(--black)' }}>
              {user?.employee_id || '—'}
            </div>
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
            <div className="flex-between" style={{ marginBottom: '18px' }}>
              <div className="card-header" style={{ marginBottom: 0 }}>Resource Profile</div>
              <button className="btn-primary btn-sm" onClick={openEditModal}>Edit Profile</button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div><label>Employee ID</label><div style={{ fontWeight: 600, color: 'var(--black)' }}>{resource.employee_id}</div></div>
              <div><label>Name</label><div style={{ fontWeight: 500 }}>{resource.name}</div></div>
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
            <div className="flex-between" style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Training Records</h3>
              <button className="btn-primary btn-sm" onClick={() => setShowTrainingModal(true)}>+ Add Training</button>
            </div>
            {training.length > 0 ? (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Training Name</th><th>Status</th><th>Start Date</th><th>Completion Date</th></tr></thead>
                  <tbody>
                    {training.map(t => (
                      <tr key={t.id}>
                        <td style={{ fontWeight: 500 }}>{t.training_name}</td>
                        <td>{statusBadge(t.status)}</td>
                        <td>{t.start_date || '—'}</td>
                        <td>{t.completion_date || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="empty-state">No training records found</div>}
          </div>

          {/* Certifications */}
          <div className="card">
            <div className="flex-between" style={{ marginBottom: '18px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>Certifications</h3>
              <button className="btn-primary btn-sm" onClick={() => setShowCertModal(true)}>+ Add Certification</button>
            </div>
            {certifications.length > 0 ? (
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead><tr><th>Certification Name</th><th>Issuing Organization</th><th>Issue Date</th><th>Expiry Date</th></tr></thead>
                  <tbody>
                    {certifications.map(c => (
                      <tr key={c.id}>
                        <td style={{ fontWeight: 500 }}>{c.certification_name}</td>
                        <td>{c.issuing_organization || '—'}</td>
                        <td>{c.issue_date || '—'}</td>
                        <td>{c.expiry_date || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <div className="empty-state">No certifications found</div>}
          </div>
        </>
      ) : (
        <div className="card">
          <div className="empty-state">
            <p style={{ fontWeight: 500, color: 'var(--black)' }}>No resource profile linked to your account.</p>
            <p style={{ fontSize: '12.5px', marginTop: '6px', marginBottom: '16px', color: 'var(--gray)' }}>You can create your resource profile now to track your skills and training.</p>
            <button className="btn-primary" onClick={openCreateModal}>Create Profile</button>
          </div>
        </div>
      )}

      {/* Create Profile Modal */}
      <Modal isOpen={showCreateModal} title="Create Resource Profile" onClose={() => setShowCreateModal(false)}>
        <form onSubmit={handleCreateSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Employee ID</label>
              <input value={createForm.employee_id || ''} disabled style={{ backgroundColor: '#f5f5f5', color: '#888' }} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={createForm.email || ''} disabled style={{ backgroundColor: '#f5f5f5', color: '#888' }} />
            </div>
          </div>
          <div className="form-group">
            <label>Name *</label>
            <input value={createForm.name || ''} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Designation *</label>
              <input value={createForm.designation || ''} onChange={e => setCreateForm(p => ({ ...p, designation: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label>Years of Experience</label>
              <input type="number" step="0.5" min="0" value={createForm.years_of_experience ?? ''} onChange={e => setCreateForm(p => ({ ...p, years_of_experience: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cluster *</label>
              <select value={createForm.cluster_id || ''} onChange={e => setCreateForm(p => ({ ...p, cluster_id: e.target.value }))} required>
                <option value="">Select cluster</option>
                {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Availability Status</label>
              <select value={createForm.availability_status || ''} onChange={e => setCreateForm(p => ({ ...p, availability_status: e.target.value }))}>
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="On Training">On Training</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Current Location</label>
              <select value={createForm.current_location_id || ''} onChange={e => setCreateForm(p => ({ ...p, current_location_id: e.target.value }))}>
                <option value="">Select location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.city}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Location</label>
              <select value={createForm.preferred_location_id || ''} onChange={e => setCreateForm(p => ({ ...p, preferred_location_id: e.target.value }))}>
                <option value="">Select location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.city}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Primary Skill</label>
            <select value={createForm.primary_skill_id || ''} onChange={e => setCreateForm(p => ({ ...p, primary_skill_id: e.target.value }))}>
              <option value="">Select skill</option>
              {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={createLoading}>
            {createLoading ? 'Creating...' : 'Create Profile'}
          </button>
        </form>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal isOpen={showEditModal} title="Edit Resource Profile" onClose={() => setShowEditModal(false)}>
        <form onSubmit={handleEditSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Name</label>
              <input value={editForm.name || ''} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" value={editForm.email || ''} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Designation</label>
              <input value={editForm.designation || ''} onChange={e => setEditForm(p => ({ ...p, designation: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Years of Experience</label>
              <input type="number" step="0.5" min="0" value={editForm.years_of_experience ?? ''} onChange={e => setEditForm(p => ({ ...p, years_of_experience: e.target.value }))} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Cluster</label>
              <select value={editForm.cluster_id || ''} onChange={e => setEditForm(p => ({ ...p, cluster_id: e.target.value }))}>
                <option value="">Select cluster</option>
                {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Availability Status</label>
              <select value={editForm.availability_status || ''} onChange={e => setEditForm(p => ({ ...p, availability_status: e.target.value }))}>
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="On Training">On Training</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Current Location</label>
              <select value={editForm.current_location_id || ''} onChange={e => setEditForm(p => ({ ...p, current_location_id: e.target.value }))}>
                <option value="">Select location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.city}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Location</label>
              <select value={editForm.preferred_location_id || ''} onChange={e => setEditForm(p => ({ ...p, preferred_location_id: e.target.value }))}>
                <option value="">Select location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.city}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Primary Skill</label>
            <select value={editForm.primary_skill_id || ''} onChange={e => setEditForm(p => ({ ...p, primary_skill_id: e.target.value }))}>
              <option value="">Select skill</option>
              {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={editLoading}>
            {editLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </Modal>

      {/* Add Training Modal */}
      <Modal isOpen={showTrainingModal} title="Add Training Record" onClose={() => setShowTrainingModal(false)}>
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
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Add Training</button>
        </form>
      </Modal>

      {/* Add Certification Modal */}
      <Modal isOpen={showCertModal} title="Add Certification" onClose={() => setShowCertModal(false)}>
        <form onSubmit={handleAddCert}>
          <div className="form-group">
            <label>Certification Name *</label>
            <input value={certForm.certification_name} onChange={e => setCertForm(p => ({ ...p, certification_name: e.target.value }))} required />
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
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>Add Certification</button>
        </form>
      </Modal>
    </div>
  );
};

export default ProfilePage;