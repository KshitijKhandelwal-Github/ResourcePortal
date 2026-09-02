import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResource, createResource, updateResource } from '../api/resources';
import { getClusters } from '../api/clusters';
import { getSkills } from '../api/skills';
import { getLocations } from '../api/locations';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const ResourceFormPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const isEdit = !!employeeId;

  const [form, setForm] = useState({
    employee_id: '',
    name: '',
    email: '',
    cluster_id: '',
    designation: '',
    years_of_experience: '',
    current_location_id: '',
    preferred_location_id: '',
    availability_status: 'Available',
    primary_skill_id: '',
    secondary_skill_ids: [],
  });

  const [clusters, setClusters] = useState([]);
  const [skills, setSkills] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [c, s, l] = await Promise.all([getClusters(), getSkills(), getLocations()]);
      setClusters(c.data);
      setSkills(s.data);
      setLocations(l.data);

      if (isEdit) {
        const res = await getResource(employeeId);
        const r = res.data;
        const secSkills = (r.skills || r.secondary_skills || [])
          .filter(s => s.id !== r.primary_skill_id && s.id !== r.primary_skill?.id)
          .map(s => s.id);
        setForm({
          employee_id: r.employee_id || '',
          name: r.name || '',
          email: r.email || '',
          cluster_id: r.cluster_id || r.cluster?.id || '',
          designation: r.designation || '',
          years_of_experience: r.years_of_experience ?? '',
          current_location_id: r.current_location_id || r.current_location?.id || '',
          preferred_location_id: r.preferred_location_id || r.preferred_location?.id || '',
          availability_status: r.availability_status || 'Available',
          primary_skill_id: r.primary_skill_id || r.primary_skill?.id || '',
          secondary_skill_ids: secSkills,
        });
      }
    } catch (err) {
      console.error('Failed to load form options', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleSecondarySkills = (e) => {
    const options = Array.from(e.target.selectedOptions, opt => parseInt(opt.value));
    setForm(prev => ({ ...prev, secondary_skill_ids: options }));
  };

  const validate = () => {
    const errs = {};
    if (!form.employee_id.trim()) errs.employee_id = 'Employee ID is required';
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    if (!form.cluster_id) errs.cluster_id = 'Cluster is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const payload = {
        ...form,
        cluster_id: parseInt(form.cluster_id) || null,
        current_location_id: form.current_location_id ? parseInt(form.current_location_id) : null,
        preferred_location_id: form.preferred_location_id ? parseInt(form.preferred_location_id) : null,
        primary_skill_id: form.primary_skill_id ? parseInt(form.primary_skill_id) : null,
        years_of_experience: form.years_of_experience !== '' ? parseFloat(form.years_of_experience) : null,
        secondary_skill_ids: form.secondary_skill_ids.map(Number),
      };

      if (isEdit) {
        await updateResource(employeeId, payload);
        setToast({ message: 'Resource updated successfully', type: 'success' });
        setTimeout(() => navigate(`/resources/${employeeId}`), 1000);
      } else {
        await createResource(payload);
        setToast({ message: 'Resource created successfully', type: 'success' });
        setTimeout(() => navigate('/resources'), 1000);
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to save resource';
      setToast({ message: msg, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1>{isEdit ? 'Edit Resource' : 'Add New Resource'}</h1>
        <button className="btn-secondary" onClick={() => navigate(-1)}>← Back</button>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Employee ID *</label>
              <input
                value={form.employee_id}
                onChange={e => handleChange('employee_id', e.target.value)}
                disabled={isEdit}
                placeholder="e.g. EMP001"
              />
              {errors.employee_id && <span style={{ color: 'red', fontSize: '12px' }}>{errors.employee_id}</span>}
            </div>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                value={form.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Enter full name"
              />
              {errors.name && <span style={{ color: 'red', fontSize: '12px' }}>{errors.name}</span>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="email@example.com"
              />
              {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email}</span>}
            </div>
            <div className="form-group">
              <label>Designation</label>
              <input
                value={form.designation}
                onChange={e => handleChange('designation', e.target.value)}
                placeholder="e.g. Software Engineer"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cluster *</label>
              <select value={form.cluster_id} onChange={e => handleChange('cluster_id', e.target.value)}>
                <option value="">Select cluster</option>
                {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              {errors.cluster_id && <span style={{ color: 'red', fontSize: '12px' }}>{errors.cluster_id}</span>}
            </div>
            <div className="form-group">
              <label>Years of Experience</label>
              <input
                type="number" step="0.5" min="0"
                value={form.years_of_experience}
                onChange={e => handleChange('years_of_experience', e.target.value)}
                placeholder="e.g. 3.5"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Current Location</label>
              <select value={form.current_location_id} onChange={e => handleChange('current_location_id', e.target.value)}>
                <option value="">Select location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.city}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Preferred Location</label>
              <select value={form.preferred_location_id} onChange={e => handleChange('preferred_location_id', e.target.value)}>
                <option value="">Select location</option>
                {locations.map(l => <option key={l.id} value={l.id}>{l.city}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Availability Status</label>
              <select value={form.availability_status} onChange={e => handleChange('availability_status', e.target.value)}>
                <option value="Available">Available</option>
                <option value="Allocated">Allocated</option>
                <option value="On Training">On Training</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
            <div className="form-group">
              <label>Primary Skill</label>
              <select value={form.primary_skill_id} onChange={e => handleChange('primary_skill_id', e.target.value)}>
                <option value="">Select skill</option>
                {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Secondary Skills (hold Ctrl/Cmd to select multiple)</label>
            <select
              multiple
              value={form.secondary_skill_ids.map(String)}
              onChange={handleSecondarySkills}
              style={{ height: '120px' }}
            >
              {skills.filter(s => String(s.id) !== String(form.primary_skill_id)).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : (isEdit ? 'Update Resource' : 'Create Resource')}
            </button>
            <button type="button" className="btn-secondary" onClick={() => navigate(-1)}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResourceFormPage;