import React, { useState } from 'react';
import axios from 'axios';
import { FiX } from 'react-icons/fi';

const CreateTeamModal = ({ onClose, onCreated }) => {
  const [teamName, setTeamName] = useState('');
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!teamName.trim()) {
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        'http://localhost:3000/teams',
        {
          team_name: teamName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onCreated(response.data);

    } catch (error) {
      console.error('Error creating team:', error);
      alert('Failed to create team.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-modal-overlay">

      <div className="team-modal">

        <div className="team-modal-header">
          <div>
            <h2>Create Team</h2>
            <p>Create a new team for your workspace.</p>
          </div>

          <button
            className="team-modal-close"
            onClick={onClose}
          >
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className="team-form-group">
            <label>Team name</label>

            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g. Development Team"
              autoFocus
            />
          </div>

          <div className="team-modal-actions">

            <button
              type="button"
              className="team-cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="teams-create-btn"
              disabled={loading || !teamName.trim()}
            >
              {loading ? 'Creating...' : 'Create Team'}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CreateTeamModal;