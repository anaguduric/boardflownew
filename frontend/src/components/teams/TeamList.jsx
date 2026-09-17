import React, { useEffect, useState } from 'react';
import axios from 'axios';

import TeamCard from './TeamCard';
import CreateTeamModal from './CreateTeamModal';

import './Teams.css';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const token = localStorage.getItem('token');

  const fetchTeams = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        'http://localhost:3000/teams',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleTeamCreated = (newTeam) => {
    setTeams((prev) => [newTeam, ...prev]);
    setShowCreateModal(false);
  };

  const handleTeamDeleted = (teamId) => {
    setTeams((prev) =>
      prev.filter((team) => team.team_id !== teamId)
    );
  };

  const handleTeamUpdated = (updatedTeam) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.team_id === updatedTeam.team_id
          ? {
              ...team,
              ...updatedTeam,
            }
          : team
      )
    );
  };

  return (
    <div className="teams-page">

      <div className="teams-header">
        <div>
          <h1>Teams</h1>
          <p>Manage your teams and team members.</p>
        </div>

        <button
          className="teams-create-btn"
          onClick={() => setShowCreateModal(true)}
        >
          + Create Team
        </button>
      </div>

      {loading ? (
        <div className="teams-loading">
          Loading teams...
        </div>
      ) : teams.length === 0 ? (
        <div className="teams-empty">
          <h3>No teams yet</h3>

          <p>
            Create your first team to get started.
          </p>

          <button
            className="teams-create-btn"
            onClick={() => setShowCreateModal(true)}
          >
            + Create Team
          </button>
        </div>
      ) : (
        <div className="teams-grid">
          {teams.map((team) => (
            <TeamCard
              key={team.team_id}
              team={team}
              onDeleted={handleTeamDeleted}
              onUpdated={handleTeamUpdated}
            />
          ))}
        </div>
      )}

      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTeamCreated}
        />
      )}

    </div>
  );
};

export default TeamList;