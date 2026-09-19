import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import TeamCard from './TeamCard';
import CreateTeamModal from './CreateTeamModal';

import { useOrganization } from '../../context/OrganizationContext';

import './Teams.css';

const TeamList = () => {
  const {
    currentOrganization,
  } = useOrganization();

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [error, setError] = useState('');

  const token =
    localStorage.getItem('token');

  // =========================================================
  // FETCH TEAMS
  // =========================================================

  const fetchTeams = async () => {
    if (
      !currentOrganization?.organization_id
    ) {
      setTeams([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const organizationId =
        Number(
          currentOrganization.organization_id
        );

      const response =
        await axios.get(
          `http://localhost:3000/teams?organizationId=${organizationId}`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setTeams(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        'Error fetching teams:',
        error
      );

      setError(
        error.response?.data?.message ||
        'Failed to load teams.'
      );

      setTeams([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [
    token,
    currentOrganization?.organization_id,
  ]);

  // =========================================================
  // TEAM CREATED
  // =========================================================

  const handleTeamCreated = (
    newTeam
  ) => {
    setTeams((prev) => [
      newTeam,
      ...prev,
    ]);

    setShowCreateModal(false);
  };

  // =========================================================
  // TEAM DELETED
  // =========================================================

  const handleTeamDeleted = (
    teamId
  ) => {
    setTeams((prev) =>
      prev.filter(
        (team) =>
          team.team_id !== teamId
      )
    );
  };

  // =========================================================
  // TEAM UPDATED
  // =========================================================

  const handleTeamUpdated = (
    updatedTeam
  ) => {
    setTeams((prev) =>
      prev.map((team) =>
        team.team_id ===
        updatedTeam.team_id
          ? {
              ...team,
              ...updatedTeam,
            }
          : team
      )
    );
  };

  // =========================================================
  // NO ORGANIZATION
  // =========================================================

  if (
    !currentOrganization?.organization_id
  ) {
    return (
      <div className="teams-page">

        <div className="teams-header">
          <div>
            <h1>Teams</h1>

            <p>
              Manage your teams and
              team members.
            </p>
          </div>
        </div>

        <div className="teams-empty">

          <h3>
            No organization selected
          </h3>

          <p>
            Select an organization to
            view its teams.
          </p>

        </div>

      </div>
    );
  }

  return (
    <div className="teams-page">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="teams-header">

        <div>
          <h1>Teams</h1>

          <p>
            Manage your teams and
            team members.
          </p>
        </div>

        <button
          className="teams-create-btn"
          onClick={() =>
            setShowCreateModal(true)
          }
        >
          + Create Team
        </button>

      </div>

      {/* =====================================================
          ERROR
      ===================================================== */}

      {error ? (
        <div className="teams-empty">

          <h3>
            Something went wrong
          </h3>

          <p>
            {error}
          </p>

        </div>
      ) : loading ? (
        /* ===================================================
           LOADING
        =================================================== */

        <div className="teams-loading">
          Loading teams...
        </div>
      ) : teams.length === 0 ? (
        /* ===================================================
           EMPTY
        =================================================== */

        <div className="teams-empty">

          <h3>
            No teams yet
          </h3>

          <p>
            Create your first team to
            get started.
          </p>

          <button
            className="teams-create-btn"
            onClick={() =>
              setShowCreateModal(true)
            }
          >
            + Create Team
          </button>

        </div>
      ) : (
        /* ===================================================
           TEAMS
        =================================================== */

        <div className="teams-grid">

          {teams.map((team) => (
            <TeamCard
              key={team.team_id}
              team={team}
              onDeleted={
                handleTeamDeleted
              }
              onUpdated={
                handleTeamUpdated
              }
            />
          ))}

        </div>
      )}

      {/* =====================================================
          CREATE TEAM MODAL
      ===================================================== */}

      {showCreateModal && (
        <CreateTeamModal
          onClose={() =>
            setShowCreateModal(false)
          }
          onCreated={
            handleTeamCreated
          }
        />
      )}

    </div>
  );
};

export default TeamList;