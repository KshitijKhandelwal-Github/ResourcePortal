import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getResources, deleteResource } from '../api/resources';
import { getClusters } from '../api/clusters';
import { getSkills } from '../api/skills';
import { getLocations } from '../api/locations';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';

const statusBadge = (status) => {
  const cls = {
    'Available': 'badge-available',
    'Allocated': 'badge-allocated',
    'On Training': 'badge-training',
    'On Leave': 'badge-leave',
  };
  return <span className={`badge ${cls[status] || ''}`}>{status}</span>;
};

const ResourcesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [clusterId, setClusterId] = useState('');
  const [skillId, setSkillId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [availabilityStatus, setAvailabilityStatus] = useState('');
  const [minExp, setMinExp] = useState('');
  const [maxExp, setMaxExp] = useState('');

  // Filter options
  const [clusters, setClusters] = useState([]);
  const [skills, setSkills] = useState([]);
  const [locations, setLocations] = useState([]);

  // Pagination
  const [page, setPage] = useState(0);
  const limit = 15;

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const [c, s, l] = await Promise.all([getClusters(), getSkills(), getLocations()]);
        setClusters(c.data);
        setSkills(s.data);
        setLocations(l.data);
      } catch (err) {
        console.error('Failed to load filter options', err);
      }
    };
    loadFilterOptions();
  }, []);

  const loadResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = { skip: page * limit, limit };
      if (search) params.search = search;
      if (clusterId) params.cluster_id = clusterId;
      if (skillId) params.skill_id = skillId;
      if (locationId) params.location_id = locationId;
      if (availabilityStatus) params.availability_status = availabilityStatus;
      if (minExp) params.min_experience = minExp;
      if (maxExp) params.max_experience = maxExp;

      const res = await getResources(params);
      setResources(res.data.items || res.data);
      setTotal(res.data.total || (res.data.items ? res.data.items.length : res.data.length));
    } catch (err) {
      console.error('Failed to load resources', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, clusterId, skillId, locationId, availabilityStatus, minExp, maxExp]);

  useEffect(() => {
    loadResources();
  }, [loadResources]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(0);
  };

  const handleDelete = async (employeeId, name) => {
    if (!window.confirm(`Are you sure you want to delete resource "${name}" (${employeeId})?`)) return;
    try {
      await deleteResource(employeeId);
      setToast({ message: `Resource ${employeeId} deleted`, type: 'success' });
      loadResources();
    } catch (err) {
      setToast({ message: 'Failed to delete resource', type: 'error' });
    }
  };

  const clearFilters = () => {
    setSearch(''); setClusterId(''); setSkillId(''); setLocationId('');
    setAvailabilityStatus(''); setMinExp(''); setMaxExp(''); setPage(0);
  };

  const totalPages = Math.ceil(total / limit);
  const canCreate = user?.role === 'admin' || user?.role === 'senior_associate';

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="page-header">
        <h1>Resources</h1>
        {canCreate && (
          <button className="btn-primary" onClick={() => navigate('/resources/new')}>
            + Add Resource
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by name or ID..."
          value={search}
          onChange={handleSearch}
          style={{ minWidth: '200px' }}
        />
        <select value={clusterId} onChange={e => { setClusterId(e.target.value); setPage(0); }}>
          <option value="">All Clusters</option>
          {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={skillId} onChange={e => { setSkillId(e.target.value); setPage(0); }}>
          <option value="">All Skills</option>
          {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={locationId} onChange={e => { setLocationId(e.target.value); setPage(0); }}>
          <option value="">All Locations</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.city}</option>)}
        </select>
        <select value={availabilityStatus} onChange={e => { setAvailabilityStatus(e.target.value); setPage(0); }}>
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Allocated">Allocated</option>
          <option value="On Training">On Training</option>
          <option value="On Leave">On Leave</option>
        </select>
        <input
          type="number" placeholder="Min Exp" value={minExp}
          onChange={e => { setMinExp(e.target.value); setPage(0); }}
          style={{ minWidth: '80px', width: '80px' }}
        />
        <input
          type="number" placeholder="Max Exp" value={maxExp}
          onChange={e => { setMaxExp(e.target.value); setPage(0); }}
          style={{ minWidth: '80px', width: '80px' }}
        />
        <button className="btn-secondary btn-sm" onClick={clearFilters}>Clear</button>
      </div>

      {/* Results */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
            Showing {resources.length} of {total} resources
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Cluster</th>
                <th>Primary Skill</th>
                <th>Experience</th>
                <th>Location</th>
                <th>Status</th>
                {canCreate && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {resources.length === 0 ? (
                <tr><td colSpan={canCreate ? 8 : 7} className="empty-state">No resources found</td></tr>
              ) : (
                resources.map(r => (
                  <tr key={r.employee_id} className="clickable" onClick={() => navigate(`/resources/${r.employee_id}`)}>
                    <td style={{ fontWeight: 500 }}>{r.employee_id}</td>
                    <td>{r.name}</td>
                    <td>{r.cluster?.name || r.cluster_name || '—'}</td>
                    <td>{r.primary_skill?.name || r.primary_skill_name || '—'}</td>
                    <td>{r.years_of_experience != null ? `${r.years_of_experience} yrs` : '—'}</td>
                    <td>{r.current_location?.city || r.current_location_name || '—'}</td>
                    <td>{statusBadge(r.availability_status)}</td>
                    {canCreate && (
                      <td onClick={e => e.stopPropagation()}>
                        <button className="btn-secondary btn-sm" style={{ marginRight: '4px' }}
                          onClick={() => navigate(`/resources/${r.employee_id}/edit`)}>Edit</button>
                        {user?.role === 'admin' && (
                          <button className="btn-danger btn-sm"
                            onClick={() => handleDelete(r.employee_id, r.name)}>Delete</button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn-secondary btn-sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
                ← Previous
              </button>
              <span className="pagination-info">
                Page {page + 1} of {totalPages}
              </span>
              <button className="btn-secondary btn-sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ResourcesPage;