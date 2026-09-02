import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { getDashboardSummary, getDashboardSkills, getDashboardLocation, getDashboardExperience, getDashboardTraining, getDashboardAvailability } from '../api/dashboard';
import { getClusters } from '../api/clusters';
import { getSkills } from '../api/skills';
import { getLocations } from '../api/locations';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';

const COLORS = ['#2E7D32', '#4CAF50', '#1B5E20', '#66BB6A', '#388E3C', '#81C784', '#A5D6A7', '#C8E6C9', '#1a1a1a', '#333'];

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

  useEffect(() => {
    loadDashboard();
  }, [filters]);

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

  const loadDashboard = async () => {
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
  };

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
          <StatCard title="Total Resources" value={summary.total || 0} color="#1a1a1a" />
          <StatCard title="Available" value={summary.available || 0} color="#2E7D32" />
          <StatCard title="Allocated" value={summary.allocated || 0} color="#1976d2" />
          <StatCard title="On Training" value={summary.on_training || 0} color="#f57c00" />
          <StatCard title="On Leave" value={summary.on_leave || 0} color="#d32f2f" />
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
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="skill_name" tick={{ fontSize: 11 }} angle={-30} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#2E7D32" radius={[4, 4, 0, 0]} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="location_name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4CAF50" radius={[4, 4, 0, 0]} />
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
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#1B5E20" radius={[4, 4, 0, 0]} />
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
                <Pie data={availabilityData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={({ status, count }) => `${status}: ${count}`}>
                  {availabilityData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
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
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
              <YAxis type="category" dataKey="status" tick={{ fontSize: 12 }} width={100} />
              <Tooltip />
              <Bar dataKey="count" fill="#388E3C" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;