import React, { useState } from 'react';
import '../styles/NameListManager.css';

const NameListManager = ({ entries, onAddEntry, onRemoveEntry, onClear }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please add a valid name first.');
      return;
    }
    const isDuplicate = entries.some((entry) => entry.toLowerCase() === trimmed.toLowerCase());
    if (isDuplicate) {
      setError('That name is already in the list.');
      return;
    }
    onAddEntry(trimmed);
    setInput('');
    setError('');
  };

  const handleRemove = (index) => {
    onRemoveEntry(index);
    setError('');
  };

  return (
    <>
      <form className="name-manager" onSubmit={handleSubmit}>
        <div className="input-row">
          <label htmlFor="entryName" className="sr-only">
            Name
          </label>
          <input
            id="entryName"
            type="text"
            value={input}
            placeholder="e.g. Maya, Student 12"
            onChange={(event) => setInput(event.target.value)}
            aria-label="Name entry"
          />
          <button type="submit" className="secondary-btn">
            Add
          </button>
        </div>
        {error && <p className="error-text">{error}</p>}
      </form>
      <div className="entry-list">
        {entries.length === 0 ? (
          <p className="empty-state">The list is empty. Add names to give the wheel something to spin.</p>
        ) : (
          entries.map((entry, index) => (
            <div key={`${entry}-${index}`} className="entry-row">
              <span>{entry}</span>
              <button type="button" onClick={() => handleRemove(index)} aria-label={`Remove ${entry}`}>
                ✕
              </button>
            </div>
          ))
        )}
      </div>
      {entries.length > 0 && (
        <button type="button" className="text-btn" onClick={onClear}>
          Clear list
        </button>
      )}
    </>
  );
};

export default NameListManager;
