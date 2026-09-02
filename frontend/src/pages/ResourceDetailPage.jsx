import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getResource, deleteResource } from '../api/resources';
import { getTraining } from '../api/training';
import { getCertifications } from '../api/certifications';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const statusBadge = (status) => {
  const cls = {
    'Available': 'badge-available', 'Allocated': 'badge-allocated',
    'On Training': 'badge-training', 'On Leave': 'badge-leave',
    'Completed': 'badge-completed', 'In Progress': 'badge-in-progress', 'Planned': 'badge-planned',
  };
  return <span className={`badge ${cls[status] || ''}`}>{status}</span>;
};

const ResourceDetailPage = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resource, setResource] = useState(null);
  const [training, setTraining] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadResource();
  }, [employeeId]);

  const loadResource = async () => {
    setLoading(true);
    try {
      const res = await getResource(employeeId);
      setResource(res.data);
      // Try to load training and certifications
      try {
        const [trainRes, certRes] = await Promise.all([
          getTraining(employeeId),
          getCertifications(employeeId),
        ]);
        setTraining(trainRes.data);
        setCertifications(certRes.data);
      } catch (e) {
        // Training/certs might be empty
      }
    } catch (err) {
      setToast({ message: 'Failed to load resource', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete resource ${resource.name} (${resource.employee_id})?`)) return;
    try {
      await deleteResource(employeeId);
      setToast({ message: 'Resource deleted', type: 'success' });
      setTimeout(() => navigate('/resources'), 1000);
    } catch (err) {
      setToast({ message: 'Failed to delete resource', type: 'error' });
    }
  };

  const canEdit = user?.role === 'admin' || user?.role === 'senior_associate';

  if (loading) return <LoadingSpinner />;
  if (!resource) return <div className="empty-state">Resource not found</div>;

  const secondarySkills = (resource.skills || resource.secondary_skills || []).filter(s =>
    s.id !== resource.primary_skill_id && s.id !== resource.primary_skill?.id
  );

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1>{resource.name}</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn-secondary" onClick={() => navigate('/resources')}>← Back</button>
          {canEdit && (
            <button className="btn-primary" onClick={() => navigate(`/resources/${employeeId}/edit`)}>Edit</button>
          )}
          {user?.role === 'admin' && (
            <button className="btn-danger" onClick={handleDelete}>Delete</button>
          )}
        </div>
      </div>

      {/* Resource Info */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">Resource Information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <div>
            <label>Employee ID</label>
            <div style={{ fontWeight: 500 }}>{resource.employee_id}</div>
          </div>
          <div>
            <label>Email</label>
            <div>{resource.email || '—'}</div>
          </div>
          <div>
            <label>Designation</label>
            <div>{resource.designation || '—'}</div>
          </div>
          <div>
            <label>Cluster</label>
            <div>{resource.cluster?.name || '—'}</div>
          </div>
          <div>
            <label>Experience</label>
            <div>{resource.years_of_experience != null ? `${resource.years_of_experience} years` : '—'}</div>
          </div>
          <div>
            <label>Availability</label>
            <div>{statusBadge(resource.availability_status)}</div>
          </div>
          <div>
            <label>Current Location</label>
            <div>{resource.current_location?.city || '—'}</div>
          </div>
          <div>
            <label>Preferred Location</label>
            <div>{resource.preferred_location?.city || '—'}</div>
          </div>
        </div>
      </div>

      {/* Skills */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">Skills</div>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ marginBottom: '6px' }}>Primary Skill</label>
          {resource.primary_skill ? (
            <span className="skill-tag primary">{resource.primary_skill.name}</span>
          ) : <span style={{ color: '#999' }}>Not set</span>}
        </div>
        <div>
          <label style={{ marginBottom: '6px' }}>Secondary Skills</label>
          <div>
            {secondarySkills.length > 0
              ? secondarySkills.map(s => <span key={s.id} className="skill-tag">{s.name}</span>)
              : <span style={{ color: '#999' }}>None</span>
            }
          </div>
        </div>
      </div>

      {/* Training */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-header">Training Records</div>
        {training.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Training Name</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>Completion Date</th>
              </tr>
            </thead>
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
        <div className="card-header">Certifications</div>
        {certifications.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>Certification</th>
                <th>Issuing Organization</th>
                <th>Issue Date</th>
                <th>Expiry Date</th>
              </tr>
            </thead>
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
    </div>
  );
};

export default ResourceDetailPage;