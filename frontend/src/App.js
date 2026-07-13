import React, { useEffect, useState } from 'react';
import NameListManager from './components/NameListManager';
import SpinWheel from './components/SpinWheel';
import AuthPanel from './components/AuthPanel';
import UserCrudManager from './components/UserCrudManager';
import { pickRandomEntry } from './utils/randomPicker';
import { deleteUser, fetchUsers, loginUser, signupUser, updateUser } from './utils/api';
import './styles/App.css';
import './styles/AuthPanel.css';
import './styles/UserCrudManager.css';

function App() {
  const [entries, setEntries] = useState(['Avery', 'Jordan', 'Riley', 'Kai', 'Morgan']);
  const [selectedEntry, setSelectedEntry] = useState('');
  const [winnerIndex, setWinnerIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [spinTrigger, setSpinTrigger] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Add entries to build your list.');
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = async () => {
    setUsersLoading(true);
    try {
      const list = await fetchUsers();
      setUsers(list || []);
    } catch (error) {
      setAuthMessage(error.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const handleLogin = async (payload) => {
    try {
      const result = await loginUser(payload);
      setCurrentUser(result.user);
      setAuthMessage(result.message);
      return { success: true, message: result.message };
    } catch (error) {
      setAuthMessage(error.message);
      return { success: false, message: error.message };
    }
  };

  const handleSignup = async (payload) => {
    try {
      const newUser = await signupUser(payload);
      setCurrentUser(newUser);
      setAuthMessage(`Signed up as ${newUser.name}`);
      await refreshUsers();
      return { success: true, message: `Signed up as ${newUser.name}` };
    } catch (error) {
      setAuthMessage(error.message);
      return { success: false, message: error.message };
    }
  };

  const handleUpdateUser = async (userId, updates) => {
    try {
      const updated = await updateUser(userId, updates);
      setAuthMessage(`Updated ${updated.name}`);
      if (currentUser?.id === updated.id) {
        setCurrentUser(updated);
      }
      await refreshUsers();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await deleteUser(userId);
      setAuthMessage('User removed.');
      if (currentUser?.id === userId) {
        setCurrentUser(null);
      }
      await refreshUsers();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  const handleAddEntry = (entry) => {
    setEntries((prev) => [...prev, entry]);
    setStatusMessage('Entry added! Spin whenever you are ready.');
  };

  const handleRemoveEntry = (index) => {
    const entryToRemove = entries[index];
    setEntries((prev) => prev.filter((_, idx) => idx !== index));
    setStatusMessage('Entry removed.');
    if (entryToRemove === selectedEntry) {
      setSelectedEntry('');
    }
  };

  const handleClearList = () => {
    setEntries([]);
    setSelectedEntry('');
    setStatusMessage('List cleared. Add new entries to spin again.');
  };

  const handleSpin = () => {
    if (isSpinning || entries.length === 0) {
      return;
    }
    const { entry, index } = pickRandomEntry(entries);
    setSelectedEntry(entry);
    setWinnerIndex(index);
    setIsSpinning(true);
    setStatusMessage('Spinning the wheel...');
    setSpinTrigger((prev) => prev + 1);
  };

  const handleSpinEnd = () => {
    setIsSpinning(false);
    if (selectedEntry) {
      setStatusMessage(`${selectedEntry} was selected!`);
    } else {
      setStatusMessage('Spin complete.');
    }
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="eyebrow">Classroom · Event · Contest</p>
        <h1>Random Picker Wheel</h1>
        <p className="subtitle">
          Add names, students, or winners, then press spin to see who the wheel lands on. The
          animated wheel gives everyone a fun moment while ensuring the choice stays fair.
        </p>
      </header>
      <main className="app-grid">
        <section className="wheel-card card">
          <h2>Spin the wheel</h2>
          <SpinWheel
            entries={entries}
            spinTrigger={spinTrigger}
            selectedIndex={winnerIndex}
            onSpinEnd={handleSpinEnd}
            isSpinning={isSpinning}
          />
          <div className="controls">
            <button
              className="primary-btn"
              type="button"
              onClick={handleSpin}
              disabled={isSpinning || entries.length === 0}
            >
              {isSpinning ? 'Spinning…' : 'Spin now'}
            </button>
            <p className="status-text">{statusMessage}</p>
            {selectedEntry && !isSpinning && <div className="result-badge">{selectedEntry}</div>}
          </div>
        </section>
        <section className="list-card card">
          <h2>Manage the list</h2>
          <NameListManager
            entries={entries}
            onAddEntry={handleAddEntry}
            onRemoveEntry={handleRemoveEntry}
            onClear={handleClearList}
          />
        </section>
        <section className="auth-card card">
          <AuthPanel currentUser={currentUser} onLogin={handleLogin} onSignup={handleSignup} message={authMessage} />
        </section>
        <section className="users-card card">
          <UserCrudManager
            users={users}
            loading={usersLoading}
            onDeleteUser={handleDeleteUser}
            onUpdateUser={handleUpdateUser}
            currentUser={currentUser}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
