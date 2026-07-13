import React, { useEffect, useState } from 'react';
import '../styles/UserCrudManager.css';

const formatDate = (value) => {
  try {
    return new Date(value).toLocaleString();
  } catch (error) {
    return '-';
  }
};

const UserCrudManager = ({ users, onUpdateUser, onDeleteUser, loading, currentUser }) => {
  const [editingId, setEditingId] = useState(null);
  const [formValue, setFormValue] = useState({ name: '', email: '', role: '' });
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    if (!editingId) {
      return;
    }
    const target = users.find((user) => user.id === editingId);
    if (target) {
      setFormValue({ name: target.name, email: target.email, role: target.role });
    }
  }, [editingId, users]);

  const handleEditClick = (userId) => {
    setStatusMessage('');
    setEditingId(userId);
  };

  const handleSave = async () => {
    if (!formValue.name || !formValue.email) {
      setStatusMessage('Name and email cannot be empty.');
      return;
    }
    const result = await onUpdateUser(editingId, {
      name: formValue.name,
      email: formValue.email,
      role: formValue.role,
    });
    if (result.success) {
      setStatusMessage('User saved successfully.');
      setEditingId(null);
    } else {
      setStatusMessage(result.message);
    }
  };

  const handleDelete = async (user) => {
    if (currentUser?.id === user.id) {
      setStatusMessage('You cannot delete your own account while logged in.');
      return;
    }
    const confirmed = window.confirm(`Delete ${user.name}? This is permanent.`);
    if (!confirmed) {
      return;
    }
    const result = await onDeleteUser(user.id);
    if (!result.success) {
      setStatusMessage(result.message);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setStatusMessage('');
  };

  return (
    <div className="user-crud">
      <header>
        <h3>User directory</h3>
        <p>Track who is registered, adjust roles, and remove duplicates when needed.</p>
      </header>
      <div className="user-table">
        {loading && <p className="muted">Loading users...</p>}
        {!loading && users.length === 0 && (
          <p className="muted">No users yet. Signup to start the roster.</p>
        )}
        {users.map((user) => (
          <div key={user.id} className={`user-row ${editingId === user.id ? 'editing' : ''}`}>
            <div>
              <strong>{user.name}</strong>
              <p className="muted">{user.email}</p>
              <p className="muted">Role: {user.role}</p>
              <p className="muted">
                Created {formatDate(user.created_at)} · Updated {formatDate(user.updated_at)}
              </p>
            </div>
            <div className="user-actions">
              {editingId === user.id ? (
                <>
                  <label htmlFor="editName">Name</label>
                  <input
                    id="editName"
                    type="text"
                    value={formValue.name}
                    onChange={(event) => setFormValue((prev) => ({ ...prev, name: event.target.value }))}
                  />
                  <label htmlFor="editEmail">Email</label>
                  <input
                    id="editEmail"
                    type="email"
                    value={formValue.email}
                    onChange={(event) => setFormValue((prev) => ({ ...prev, email: event.target.value }))}
                  />
                  <label htmlFor="editRole">Role</label>
                  <input
                    id="editRole"
                    type="text"
                    value={formValue.role}
                    onChange={(event) => setFormValue((prev) => ({ ...prev, role: event.target.value }))}
                  />
                  <div className="row-actions">
                    <button className="secondary-btn" type="button" onClick={handleSave}>
                      Save
                    </button>
                    <button className="text-btn" type="button" onClick={handleCancel}>
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button className="secondary-btn" type="button" onClick={() => handleEditClick(user.id)}>
                    Edit
                  </button>
                  <button className="text-btn" type="button" onClick={() => handleDelete(user)}>
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
      {statusMessage && <p className="form-error">{statusMessage}</p>}
    </div>
  );
};

export default UserCrudManager;
