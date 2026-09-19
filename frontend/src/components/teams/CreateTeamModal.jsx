import React, {
  useState,
} from 'react';

import axios from 'axios';

import { FiX } from 'react-icons/fi';

import { useOrganization } from '../../context/OrganizationContext';

const CreateTeamModal = ({
  onClose,
  onCreated,
}) => {
  const {
    currentOrganization,
  } = useOrganization();

  const [teamName, setTeamName] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const token =
    localStorage.getItem('token');

  // =========================================================
  // CREATE TEAM
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    const trimmedName =
      teamName.trim();

    if (!trimmedName) {
      setError(
        'Team name is required.'
      );
      return;
    }

    if (
      !currentOrganization?.organization_id
    ) {
      setError(
        'Please select an organization first.'
      );
      return;
    }

    try {
      setLoading(true);

      const organizationId =
        Number(
          currentOrganization.organization_id
        );

      const response =
        await axios.post(
          'http://localhost:3000/teams',
          {
            team_name:
              trimmedName,

            organization_id:
              organizationId,
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      onCreated(response.data);

    } catch (error) {
      console.error(
        'Error creating team:',
        error
      );

      setError(
        error.response?.data?.message ||
        'Failed to create team.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-modal-overlay">

      <div className="team-modal">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="team-modal-header">

          <div>

            <h2>
              Create Team
            </h2>

            <p>
              Create a new team for
              your workspace.
            </p>

          </div>

          <button
            type="button"
            className="team-modal-close"
            onClick={onClose}
            disabled={loading}
          >
            <FiX />
          </button>

        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form
          onSubmit={handleSubmit}
        >

          {/* TEAM NAME */}

          <div className="team-form-group">

            <label htmlFor="team-name">
              Team name
            </label>

            <input
              id="team-name"
              type="text"
              value={teamName}
              onChange={(e) =>
                setTeamName(
                  e.target.value
                )
              }
              placeholder="e.g. Development Team"
              disabled={loading}
              autoFocus
            />

          </div>

          {/* ORGANIZATION */}

          <div className="team-form-group">

            <label>
              Organization
            </label>

            <input
              type="text"
              value={
                currentOrganization?.name ||
                ''
              }
              disabled
            />

          </div>

          {/* ERROR */}

          {error && (
            <div className="team-form-error">
              {error}
            </div>
          )}

          {/* ACTIONS */}

          <div className="team-modal-actions">

            <button
              type="button"
              className="team-cancel-btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="teams-create-btn"
              disabled={
                loading ||
                !teamName.trim() ||
                !currentOrganization?.organization_id
              }
            >
              {loading
                ? 'Creating...'
                : 'Create Team'}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CreateTeamModal;