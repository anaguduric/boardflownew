import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import {
  FiUser,
  FiTrash2,
  FiEdit2,
  FiX,
} from 'react-icons/fi';

import AddTeamMemberModal
  from './AddTeamMemberModal';

const TeamMembers = ({ teamId }) => {
  const [members, setMembers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] =
    useState(true);

  const [showAddModal, setShowAddModal] =
    useState(false);

  const [editingMember, setEditingMember] =
    useState(null);

  const [editRole, setEditRole] =
    useState('');

  const [deletingMember, setDeletingMember] =
    useState(null);

  const [savingEdit, setSavingEdit] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const token =
    localStorage.getItem('token');

  /*
   * FETCH MEMBERS
   */
  const fetchMembers = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:3000/team-members/team/${teamId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMembers(response.data);
    } catch (error) {
      console.error(
        'Error fetching team members:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * FETCH ROLES
   */
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);

      const response = await axios.get(
        'http://localhost:3000/role-members',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRoles(response.data);
    } catch (error) {
      console.error(
        'Error fetching roles:',
        error
      );
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchMembers();
      fetchRoles();
    }
  }, [teamId]);

  /*
   * MEMBER ADDED
   */
  const handleMemberAdded = (
    newMember
  ) => {
    setMembers((prev) => [
      ...prev,
      newMember,
    ]);

    setShowAddModal(false);
  };

  /*
   * OPEN EDIT MODAL
   */
  const openEditModal = (member) => {
    setEditingMember(member);

    const currentRole =
      roles.find(
        (roleItem) =>
          roleItem.rolemember_name ===
          member.role
      );

    setEditRole(
      currentRole
        ? String(
            currentRole.rolemember_id
          )
        : ''
    );
  };

  /*
   * CLOSE EDIT MODAL
   */
  const closeEditModal = () => {
    if (savingEdit) {
      return;
    }

    setEditingMember(null);
    setEditRole('');
  };

  /*
   * SAVE EDIT
   */
  const handleEditSave = async () => {
    if (
      !editingMember ||
      !editRole
    ) {
      return;
    }

    const selectedRole =
      roles.find(
        (roleItem) =>
          String(
            roleItem.rolemember_id
          ) === String(editRole)
      );

    if (!selectedRole) {
      return;
    }

    try {
      setSavingEdit(true);

      const response =
        await axios.patch(
          `http://localhost:3000/team-members/${editingMember.team_member_id}`,
          {
            role:
              selectedRole.rolemember_name,

            rolemember_id:
              Number(
                selectedRole.rolemember_id
              ),
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      setMembers((prev) =>
        prev.map((member) =>
          member.team_member_id ===
          editingMember.team_member_id
            ? {
                ...member,
                ...response.data,
                username:
                  member.username,
                profilePic:
                  member.profilePic,
              }
            : member
        )
      );

      closeEditModal();
    } catch (error) {
      console.error(
        'Error updating team member:',
        error
      );

      alert(
        'Failed to update team member.'
      );
    } finally {
      setSavingEdit(false);
    }
  };

  /*
   * OPEN DELETE MODAL
   */
  const openDeleteModal = (
    member
  ) => {
    setDeletingMember(member);
  };

  /*
   * CLOSE DELETE MODAL
   */
  const closeDeleteModal = () => {
    if (deleting) {
      return;
    }

    setDeletingMember(null);
  };

  /*
   * DELETE MEMBER
   */
  const handleDelete = async () => {
    if (!deletingMember) {
      return;
    }

    try {
      setDeleting(true);

      await axios.delete(
        `http://localhost:3000/team-members/${deletingMember.team_member_id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      setMembers((prev) =>
        prev.filter(
          (member) =>
            member.team_member_id !==
            deletingMember.team_member_id
        )
      );

      setDeletingMember(null);
    } catch (error) {
      console.error(
        'Error removing team member:',
        error
      );

      alert(
        'Failed to remove team member.'
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="team-members-section">

      {/* HEADER */}

      <div className="team-section-header">

        <div>

          <h2>
            Team Members
          </h2>

          <p>
            Manage members of this team.
          </p>

        </div>

        <div className="team-section-actions">

          <div className="team-members-count">
            <FiUser />
            {members.length}
          </div>

          <button
            className="teams-create-btn"
            onClick={() =>
              setShowAddModal(true)
            }
          >
            + Add Member
          </button>

        </div>

      </div>

      {/* MEMBERS */}

      {loading ? (
        <div className="team-members-loading">
          Loading members...
        </div>
      ) : members.length === 0 ? (
        <div className="team-members-empty">

          <FiUser />

          <h3>
            No team members
          </h3>

          <p>
            This team doesn't have any
            members yet.
          </p>

        </div>
      ) : (
        <div className="team-members-list">

          {members.map((member) => (
            <div
              className="team-member-row"
              key={
                member.team_member_id
              }
            >

              {/* MEMBER INFO */}

              <div className="team-member-info">

                <div className="team-member-avatar">

                  {member.profilePic ? (
                    <img
                      src={
                        member.profilePic
                      }
                      alt={
                        member.username
                      }
                    />
                  ) : (
                    <FiUser />
                  )}

                </div>

                <div>

                  <strong>
                    {member.username}
                  </strong>

                  <span>
                    {member.role}
                  </span>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="team-member-actions">

                <button
                  className="team-member-edit"
                  onClick={() =>
                    openEditModal(
                      member
                    )
                  }
                  title="Edit member"
                >
                  <FiEdit2 />
                </button>

                <button
                  className="team-member-delete"
                  onClick={() =>
                    openDeleteModal(
                      member
                    )
                  }
                  title="Remove member"
                >
                  <FiTrash2 />
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ADD MEMBER MODAL */}

      {showAddModal && (
        <AddTeamMemberModal
          teamId={teamId}
          onClose={() =>
            setShowAddModal(false)
          }
          onAdded={handleMemberAdded}
        />
      )}

      {/* EDIT MEMBER MODAL */}

      {editingMember && (
        <div className="team-modal-overlay">

          <div className="team-modal">

            <div className="team-modal-header">

              <div>

                <h2>
                  Edit Team Member
                </h2>

                <p>
                  Change the member's role.
                </p>

              </div>

              <button
                type="button"
                className="team-modal-close"
                onClick={
                  closeEditModal
                }
                disabled={
                  savingEdit
                }
              >
                <FiX />
              </button>

            </div>

            <div className="team-form-group">

              <label>
                Member
              </label>

              <div className="team-edit-member-preview">

                <div className="team-member-avatar">

                  {editingMember.profilePic ? (
                    <img
                      src={
                        editingMember.profilePic
                      }
                      alt={
                        editingMember.username
                      }
                    />
                  ) : (
                    <FiUser />
                  )}

                </div>

                <div>
                  <strong>
                    {
                      editingMember.username
                    }
                  </strong>
                </div>

              </div>

            </div>

            <div className="team-form-group">

              <label>
                Role
              </label>

              {loadingRoles ? (
                <div className="team-select-loading">
                  Loading roles...
                </div>
              ) : (
                <select
                  value={editRole}
                  onChange={(e) =>
                    setEditRole(
                      e.target.value
                    )
                  }
                  disabled={
                    savingEdit
                  }
                >

                  <option value="">
                    Select a role
                  </option>

                  {roles.map(
                    (roleItem) => (
                      <option
                        key={
                          roleItem.rolemember_id
                        }
                        value={
                          roleItem.rolemember_id
                        }
                      >
                        {
                          roleItem.rolemember_name
                        }
                      </option>
                    )
                  )}

                </select>
              )}

            </div>

            <div className="team-modal-actions">

              <button
                type="button"
                className="team-cancel-btn"
                onClick={
                  closeEditModal
                }
                disabled={
                  savingEdit
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="teams-create-btn"
                onClick={
                  handleEditSave
                }
                disabled={
                  savingEdit ||
                  loadingRoles ||
                  !editRole
                }
              >
                {savingEdit
                  ? 'Saving...'
                  : 'Save Changes'}
              </button>

            </div>

          </div>

        </div>
      )}

      {/* DELETE MODAL */}

      {deletingMember && (
        <div className="team-modal-overlay">

          <div className="team-modal team-delete-modal">

            <div className="team-modal-header">

              <div>

                <h2>
                  Remove Team Member
                </h2>

                <p>
                  Are you sure you want to
                  remove this member from
                  the team?
                </p>

              </div>

              <button
                type="button"
                className="team-modal-close"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  deleting
                }
              >
                <FiX />
              </button>

            </div>

            <div className="team-delete-member-preview">

              <div className="team-member-avatar">

                {deletingMember.profilePic ? (
                  <img
                    src={
                      deletingMember.profilePic
                    }
                    alt={
                      deletingMember.username
                    }
                  />
                ) : (
                  <FiUser />
                )}

              </div>

              <div>

                <strong>
                  {
                    deletingMember.username
                  }
                </strong>

                <span>
                  {deletingMember.role}
                </span>

              </div>

            </div>

            <div className="team-modal-actions">

              <button
                type="button"
                className="team-cancel-btn"
                onClick={
                  closeDeleteModal
                }
                disabled={
                  deleting
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="team-delete-confirm-btn"
                onClick={
                  handleDelete
                }
                disabled={
                  deleting
                }
              >
                {deleting
                  ? 'Removing...'
                  : 'Remove Member'}
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};

export default TeamMembers;
