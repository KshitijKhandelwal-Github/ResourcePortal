import React, { useState, useEffect } from 'react';
import { getUsers, updateUser } from '../api/users';
import { getClusters, createCluster, updateCluster, deleteCluster } from '../api/clusters';
import { getLocations, createLocation, updateLocation, deleteLocation } from '../api/locations';
import { getSkills, createSkill, updateSkill, deleteSkill } from '../api/skills';
import { registerUser } from '../api/auth';
import Modal from '../components/Modal';
import Toast from '../components/Toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [toast, setToast] = useState(null);

  const tabs = [
    { key: 'users', label: 'Users' },
    { key: 'clusters', label: 'Clusters' },
    { key: 'locations', label: 'Locations' },
    { key: 'skills', label: 'Skills' },
  ];

  return (
    <div>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="page-header">
        <h1>Administration</h1>
      </div>
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.key} className={`tab ${activeTab === t.key ? 'active' : ''}`}
            onClick={() => setActiveTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>
      {activeTab === 'users' && <UsersTab setToast={setToast} />}
      {activeTab === 'clusters' && <CrudTab entity="cluster" fetchFn={getClusters} createFn={createCluster} updateFn={updateCluster} deleteFn={deleteCluster} fields={[{key:'name',label:'Name',required:true},{key:'description',label:'Description'}]} displayCols={['name','description']} setToast={setToast} />}
      {activeTab === 'locations' && <CrudTab entity="location" fetchFn={getLocations} createFn={createLocation} updateFn={updateLocation} deleteFn={deleteLocation} fields={[{key:'city',label:'City',required:true},{key:'state',label:'State'},{key:'country',label:'Country'}]} displayCols={['city','state','country']} setToast={setToast} />}
      {activeTab === 'skills' && <CrudTab entity="skill" fetchFn={getSkills} createFn={createSkill} updateFn={updateSkill} deleteFn={deleteSkill} fields={[{key:'name',label:'Name',required:true},{key:'category',label:'Category'}]} displayCols={['name','category']} setToast={setToast} />}
    </div>
  );
};

/* Users Tab */
const UsersTab = ({ setToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      setToast({ message: 'User created', type: 'success' });
      setShowModal(false);
      setForm({ username: '', email: '', password: '', role: 'user' });
      loadUsers();
    } catch (err) {
      setToast({ message: err.response?.data?.detail || 'Failed to create user', type: 'error' });
    }
  };

  const toggleActive = async (u) => {
    try {
      await updateUser(u.id, { is_active: !u.is_active });
      loadUsers();
    } catch (err) {
      setToast({ message: 'Failed to update user', type: 'error' });
    }
  };

  const changeRole = async (u, role) => {
    try {
      await updateUser(u.id, { role });
      loadUsers();
    } catch (err) {
      setToast({ message: 'Failed to update role', type: 'error' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="flex-between mb-16">
        <span style={{ fontSize: '13px', color: '#666' }}>{users.length} users</span>
        <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add User</button>
      </div>

      <table className="data-table">
        <thead>
          <tr><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td style={{ fontWeight: 500 }}>{u.username}</td>
              <td>{u.email}</td>
              <td>
                <select value={u.role} onChange={e => changeRole(u, e.target.value)}
                  style={{ width: 'auto', padding: '4px 8px', fontSize: '12px' }}>
                  <option value="admin">Admin</option>
                  <option value="senior_associate">Senior Associate</option>
                  <option value="user">User</option>
                </select>
              </td>
              <td>
                <span className={`badge ${u.is_active ? 'badge-available' : 'badge-leave'}`}>
                  {u.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td>
                <button className="btn-secondary btn-sm" onClick={() => toggleActive(u)}>
                  {u.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal isOpen={showModal} title="Create New User" onClose={() => setShowModal(false)}>
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Username</label>
            <input value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
              <option value="admin">Admin</option>
              <option value="senior_associate">Senior Associate</option>
              <option value="user">User</option>
            </select>
          </div>
          <button type="submit" className="btn-primary">Create User</button>
        </form>
      </Modal>
    </>
  );
};

/* Generic CRUD Tab */
const CrudTab = ({ entity, fetchFn, createFn, updateFn, deleteFn, fields, displayCols, setToast }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(() => fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {}));

  useEffect(() => { loadItems(); }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res = await fetchFn();
      setItems(res.data);
    } catch (err) {
      console.error(`Failed to load ${entity}s`, err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditItem(null);
    setForm(fields.reduce((acc, f) => ({ ...acc, [f.key]: '' }), {}));
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm(fields.reduce((acc, f) => ({ ...acc, [f.key]: item[f.key] || '' }), {}));
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await updateFn(editItem.id, form);
        setToast({ message: `${entity} updated`, type: 'success' });
      } else {
        await createFn(form);
        setToast({ message: `${entity} created`, type: 'success' });
      }
      setShowModal(false);
      loadItems();
    } catch (err) {
      setToast({ message: err.response?.data?.detail || `Failed to save ${entity}`, type: 'error' });
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete this ${entity}?`)) return;
    try {
      await deleteFn(item.id);
      setToast({ message: `${entity} deleted`, type: 'success' });
      loadItems();
    } catch (err) {
      setToast({ message: `Failed to delete ${entity}`, type: 'error' });
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      <div className="flex-between mb-16">
        <span style={{ fontSize: '13px', color: '#666' }}>{items.length} {entity}s</span>
        <button className="btn-primary" onClick={openCreate}>+ Add {entity}</button>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            {displayCols.map(col => <th key={col}>{col.charAt(0).toUpperCase() + col.slice(1)}</th>)}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr><td colSpan={displayCols.length + 2} className="empty-state">No {entity}s found</td></tr>
          ) : (
            items.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                {displayCols.map(col => <td key={col}>{item[col] || '—'}</td>)}
                <td>
                  <button className="btn-secondary btn-sm" style={{ marginRight: '4px' }} onClick={() => openEdit(item)}>Edit</button>
                  <button className="btn-danger btn-sm" onClick={() => handleDelete(item)}>Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <Modal isOpen={showModal} title={editItem ? `Edit ${entity}` : `Add ${entity}`} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div className="form-group" key={f.key}>
              <label>{f.label} {f.required && '*'}</label>
              <input
                value={form[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                required={f.required}
              />
            </div>
          ))}
          <button type="submit" className="btn-primary">{editItem ? 'Update' : 'Create'}</button>
        </form>
      </Modal>
    </>
  );
};

export default AdminPage;