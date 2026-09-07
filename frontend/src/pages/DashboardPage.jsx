import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardSummary, getDashboardSkills, getDashboardLocation, getDashboardExperience, getDashboardTraining, getDashboardAvailability } from '../api/dashboard';
import { getClusters } from '../api/clusters';
import { getSkills } from '../api/skills';
import { getLocations } from '../api/locations';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#10b981', '#059669', '#34d399', '#047857', '#065f46', '#18181b', '#3f3f46', '#71717a'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#09090b',
        color: '#ffffff',
        padding: '8px 14px',
        borderRadius: '8px',
        fontSize: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        border: '1px solid #27272a',
      }}>
        <p style={{ fontWeight: 600, color: '#34d399', marginBottom: '2px' }}>{label || payload[0].name}</p>
        <p style={{ margin: 0 }}>Count: <span style={{ fontWeight: 700 }}>{payload[0].value}</span></p>
      </div>
    );
  }
  return null;
};

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [skillsData, setSkillsData] = useState([]);
  const [locationData, setLocationData] = useState([]);
  const [experienceData, setExperienceData] = useState([]);
  const [trainingData, setTrainingData] = useState([]);
  const [availabilityData, setAvailabilityData] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [skills, setSkills] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filters, setFilters] = useState({
    cluster_id: '', skill_id: '', location_id: '', availability_status: '',
  });

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    try {
      const [c, s, l] = await Promise.all([getClusters(), getSkills(), getLocations()]);
      setClusters(c.data);
      setSkills(s.data);
      setLocations(l.data);
    } catch (err) {
      console.error('Failed to load filters', err);
    }
  };

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.cluster_id) params.cluster_id = filters.cluster_id;
      if (filters.skill_id) params.skill_id = filters.skill_id;
      if (filters.location_id) params.location_id = filters.location_id;
      if (filters.availability_status) params.availability_status = filters.availability_status;

      const [sumRes, skillRes, locRes, expRes, trainRes, availRes] = await Promise.all([
        getDashboardSummary(params),
        getDashboardSkills(params),
        getDashboardLocation(params),
        getDashboardExperience(params),
        getDashboardTraining(params),
        getDashboardAvailability(params),
      ]);

      setSummary(sumRes.data);
      setSkillsData(skillRes.data);
      setLocationData(locRes.data);
      setExperienceData(expRes.data);
      setTrainingData(trainRes.data);
      setAvailabilityData(availRes.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ cluster_id: '', skill_id: '', location_id: '', availability_status: '' });
  };

  if (loading && !summary) return <LoadingSpinner />;

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <select value={filters.cluster_id} onChange={e => handleFilterChange('cluster_id', e.target.value)}>
          <option value="">All Clusters</option>
          {clusters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filters.skill_id} onChange={e => handleFilterChange('skill_id', e.target.value)}>
          <option value="">All Skills</option>
          {skills.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filters.location_id} onChange={e => handleFilterChange('location_id', e.target.value)}>
          <option value="">All Locations</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.city}</option>)}
        </select>
        <select value={filters.availability_status} onChange={e => handleFilterChange('availability_status', e.target.value)}>
          <option value="">All Status</option>
          <option value="Available">Available</option>
          <option value="Allocated">Allocated</option>
          <option value="On Training">On Training</option>
          <option value="On Leave">On Leave</option>
        </select>
        <button className="btn-secondary btn-sm" onClick={clearFilters}>Clear Filters</button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="stat-grid">
          <StatCard title="Total Resources" value={summary.total || 0} color="#09090b" />
          <StatCard title="Available" value={summary.available || 0} color="#10b981" />
          <StatCard title="Allocated" value={summary.allocated || 0} color="#18181b" />
          <StatCard title="On Training" value={summary.on_training || 0} color="#059669" />
          <StatCard title="On Leave" value={summary.on_leave || 0} color="#71717a" />
        </div>
      )}

      {/* Charts */}
      <div className="chart-grid">
        {/* Skills Distribution */}
        <div className="chart-card">
          <h3>Technology Distribution</h3>
          {skillsData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={skillsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="skill_name" tick={{ fontSize: 11, fill: '#71717a' }} angle={-30} textAnchor="end" height={60} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No data available</div>}
        </div>

        {/* Location Distribution */}
        <div className="chart-card">
          <h3>Location Distribution</h3>
          {locationData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={locationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="location_name" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No data available</div>}
        </div>

        {/* Experience Distribution */}
        <div className="chart-card">
          <h3>Experience Distribution</h3>
          {experienceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={experienceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 12, fill: '#71717a' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#71717a' }} allowDecimals={false} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill="#047857" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No data available</div>}
        </div>

        {/* Availability Distribution */}
        <div className="chart-card">
          <h3>Availability Status</h3>
          {availabilityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={availabilityData} dataKey="count" nameKey="status" cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={4} label={({ status, count }) => `${status}: ${count}`}>
                  {availabilityData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state">No data available</div>}
        </div>
      </div>

      {/* Training Stats */}
      {trainingData.length > 0 && (
        <div className="chart-card" style={{ marginBottom: '20px' }}>
          <h3>Training Status Overview</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trainingData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#71717a' }} allowDecimals={false} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="status" tick={{ fontSize: 12, fill: '#71717a' }} width={100} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;