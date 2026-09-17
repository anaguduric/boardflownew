import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import {
  FiUsers,
  FiTrash2,
  FiArrowRight,
  FiEdit2,
  FiX,
} from 'react-icons/fi';

const TeamCard = ({
  team,
  onDeleted,
  onUpdated,
}) => {
  const navigate = useNavigate();

  const token = localStorage.getItem('token');

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [showDeleteModal, setShowDeleteModal] =
    useState(false);

  const [teamName, setTeamName] =
    useState(team.team_name || '');

  const [saving, setSaving] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const openEditModal = (e) => {
    e.stopPropagation();

    setTeamName(team.team_name || '');
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    if (saving) {
      return;
    }

    setShowEditModal(false);
    setTeamName(team.team_name || '');
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const trimmedName = teamName.trim();

    if (!trimmedName) {
      return;
    }

    try {
      setSaving(true);

      const response = await axios.patch(
        `http://localhost:3000/teams/${team.team_id}`,
        {
          team_name: trimmedName,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onUpdated(response.data);

      setShowEditModal(false);
    } catch (error) {
      console.error(
        'Error updating team:',
        error
      );

      alert('Failed to update team.');
    } finally {
      setSaving(false);
    }
  };

  const openDeleteModal = (e) => {
    e.stopPropagation();

    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setShowDeleteModal(false);
  };

  const handleDelete = async () => {
    if (deleting) {
      return;
    }

    try {
      setDeleting(true);

      await axios.delete(
        `http://localhost:3000/teams/${team.team_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onDeleted(team.team_id);

      setShowDeleteModal(false);
    } catch (error) {
      console.error(
        'Error deleting team:',
        error
      );

      alert('Failed to delete team.');
    } finally {
      setDeleting(false);
    }
  };

  const handleViewTeam = () => {
    navigate(`/teams/${team.team_id}`);
  };

  return (
    <>
      <div className="team-card">

        <div className="team-card-top">

          <div className="team-icon">
            <FiUsers />
          </div>

          <div className="team-card-actions">

            <button
              type="button"
              className="team-edit-btn"
              onClick={openEditModal}
              title="Edit team"
            >
              <FiEdit2 />
            </button>

            <button
              type="button"
              className="team-delete-btn"
              onClick={openDeleteModal}
              title="Delete team"
            >
              <FiTrash2 />
            </button>

          </div>

        </div>

        <div className="team-card-content">

          <h3>{team.team_name}</h3>

          <p>
            Team created on{' '}
            {team.created_at
              ? new Date(
                  team.created_at
                ).toLocaleDateString()
              : '-'}
          </p>

        </div>

        <button
          className="team-view-btn"
          onClick={handleViewTeam}
        >
          View Team
          <FiArrowRight />
        </button>

      </div>

      {/* =========================
          EDIT TEAM MODAL
      ========================= */}

      {showEditModal && (
        <div
          className="team-modal-overlay"
          onClick={closeEditModal}
        >
          <div
            className="team-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="team-modal-header">

              <div>
                <h2>Edit Team</h2>

                <p>
                  Change the name of this team.
                </p>
              </div>

              <button
                type="button"
                className="team-modal-close"
                onClick={closeEditModal}
                disabled={saving}
              >
                <FiX />
              </button>

            </div>

            <form onSubmit={handleEditSave}>

              <div className="team-form-group">

                <label htmlFor={`team-name-${team.team_id}`}>
                  Team Name
                </label>

                <input
                  id={`team-name-${team.team_id}`}
                  type="text"
                  value={teamName}
                  onChange={(e) =>
                    setTeamName(e.target.value)
                  }
                  placeholder="Enter team name"
                  disabled={saving}
                  autoFocus
                />

              </div>

              <div className="team-modal-actions">

                <button
                  type="button"
                  className="team-cancel-btn"
                  onClick={closeEditModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="teams-create-btn"
                  disabled={
                    saving ||
                    !teamName.trim()
                  }
                >
                  {saving
                    ? 'Saving...'
                    : 'Save Changes'}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

      {/* =========================
          DELETE TEAM MODAL
      ========================= */}

      {showDeleteModal && (
        <div
          className="team-modal-overlay"
          onClick={closeDeleteModal}
        >
          <div
            className="team-modal team-delete-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="team-modal-header">

              <div>
                <h2>Delete Team</h2>

                <p>
                  Are you sure you want to
                  delete this team?
                </p>
              </div>

              <button
                type="button"
                className="team-modal-close"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                <FiX />
              </button>

            </div>

            <div className="team-delete-member-preview">

              <div className="team-icon">
                <FiUsers />
              </div>

              <div>
                <strong>
                  {team.team_name}
                </strong>

                <span>
                  This action cannot be undone.
                </span>
              </div>

            </div>

            <div className="team-modal-actions">

              <button
                type="button"
                className="team-cancel-btn"
                onClick={closeDeleteModal}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="team-delete-confirm-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? 'Deleting...'
                  : 'Delete Team'}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default TeamCard;