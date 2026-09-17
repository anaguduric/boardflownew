import React, {
  useEffect,
  useState,
} from 'react';

import axios from 'axios';

import { FiX } from 'react-icons/fi';

const AddTeamMemberModal = ({
  teamId,
  onClose,
  onAdded,
}) => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);

  const [selectedUser, setSelectedUser] =
    useState('');

  const [selectedRole, setSelectedRole] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loadingRoles, setLoadingRoles] =
    useState(true);

  const token =
    localStorage.getItem('token');

  /*
   * Fetch users
   */
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);

        const response = await axios.get(
          'http://localhost:3000/users',
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

        setUsers(response.data);
      } catch (error) {
        console.error(
          'Error fetching users:',
          error
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [token]);

  /*
   * Fetch roles
   */
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoadingRoles(true);

        const response = await axios.get(
          'http://localhost:3000/role-members',
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
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

    fetchRoles();
  }, [token]);

  /*
   * Add member
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !selectedUser ||
      !selectedRole
    ) {
      return;
    }

    /*
     * Find selected role object.
     *
     * Example:
     * {
     *   rolemember_id: 2,
     *   rolemember_name: "Developer"
     * }
     */
    const selectedRoleObject =
      roles.find(
        (roleItem) =>
          String(
            roleItem.rolemember_id
          ) === String(selectedRole)
      );

    if (!selectedRoleObject) {
      alert('Please select a valid role.');
      return;
    }

    try {
      setLoading(true);

      const response =
        await axios.post(
          'http://localhost:3000/team-members',
          {
            team_id: Number(teamId),

            user_id:
              Number(selectedUser),

            role:
              selectedRoleObject.rolemember_name,

            rolemember_id:
              Number(
                selectedRoleObject.rolemember_id
              ),
          },
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      onAdded(response.data);

    } catch (error) {
      console.error(
        'Error adding team member:',
        error
      );

      alert(
        'Failed to add team member.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="team-modal-overlay">

      <div className="team-modal">

        {/* HEADER */}

        <div className="team-modal-header">

          <div>

            <h2>
              Add Team Member
            </h2>

            <p>
              Add a user to this team.
            </p>

          </div>

          <button
            type="button"
            className="team-modal-close"
            onClick={onClose}
          >
            <FiX />
          </button>

        </div>

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
        >

          {/* USER */}

          <div className="team-form-group">

            <label>
              User
            </label>

            {loadingUsers ? (
              <div className="team-select-loading">
                Loading users...
              </div>
            ) : (
              <select
                value={selectedUser}
                onChange={(e) =>
                  setSelectedUser(
                    e.target.value
                  )
                }
                disabled={
                  loading ||
                  users.length === 0
                }
              >

                <option value="">
                  Select a user
                </option>

                {users.map((user) => (
                  <option
                    key={user.user_id}
                    value={user.user_id}
                  >
                    {user.username ||
                      user.email}
                  </option>
                ))}

              </select>
            )}

          </div>

          {/* ROLE */}

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
                value={selectedRole}
                onChange={(e) =>
                  setSelectedRole(
                    e.target.value
                  )
                }
                disabled={
                  loading ||
                  roles.length === 0
                }
              >

                <option value="">
                  Select a role
                </option>

                {roles.map((roleItem) => (
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
                ))}

              </select>
            )}

          </div>

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
                loadingUsers ||
                loadingRoles ||
                !selectedUser ||
                !selectedRole
              }
            >
              {loading
                ? 'Adding...'
                : 'Add Member'}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default AddTeamMemberModal;
