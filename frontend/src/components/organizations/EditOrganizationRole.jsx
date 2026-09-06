import { useEffect, useState } from 'react';
import {
  FaTimes,
  FaSave,
  FaSpinner,
  FaUserShield,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';

import './EditOrganizationRole.css';

function EditOrganizationRole({
  organizationId,
  role,
  onClose,
  onSaved,
}) {
  const { token } = useAuth();

  const [name, setName] = useState(
    role?.name || ''
  );

  const [description, setDescription] =
    useState(role?.description || '');

  const [permissions, setPermissions] =
    useState([]);

  const [selectedPermissions, setSelectedPermissions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  // =========================================================
  // LOAD PERMISSIONS
  // =========================================================

  useEffect(() => {

    if (!token || !organizationId || !role?.role_id) {
      setLoading(false);
      return;
    }

    const loadData = async () => {

      try {

        setLoading(true);
        setError('');

        // ---------------------------------------------------
        // SVE PERMISSIONS
        // ---------------------------------------------------

        const permissionsResponse =
          await fetch(
            'http://localhost:3000/permissions',
            {
              method: 'GET',

              headers: {
                Authorization:
                  `Bearer ${token}`,

                'Content-Type':
                  'application/json',
              },
            }
          );

        if (!permissionsResponse.ok) {
          throw new Error(
            `Permissions HTTP error: ${permissionsResponse.status}`
          );
        }

        const allPermissions =
          await permissionsResponse.json();

        // ---------------------------------------------------
        // PERMISSIONS OVE ROLE
        // ---------------------------------------------------

        const rolePermissionsResponse =
          await fetch(
            `http://localhost:3000/organizations/${organizationId}/roles/${role.role_id}/permissions`,
            {
              method: 'GET',

              headers: {
                Authorization:
                  `Bearer ${token}`,

                'Content-Type':
                  'application/json',
              },
            }
          );

        if (!rolePermissionsResponse.ok) {
          throw new Error(
            `Role permissions HTTP error: ${rolePermissionsResponse.status}`
          );
        }

        const rolePermissions =
          await rolePermissionsResponse.json();

        setPermissions(
          Array.isArray(allPermissions)
            ? allPermissions
            : []
        );

        setSelectedPermissions(
          Array.isArray(rolePermissions)
            ? rolePermissions.map(
                (permission) =>
                  permission.permission_id
              )
            : []
        );

      } catch (err) {

        console.error(
          'Greška pri učitavanju permissions:',
          err
        );

        setError(
          'Permissions could not be loaded.'
        );

      } finally {

        setLoading(false);

      }

    };

    loadData();

  }, [
    token,
    organizationId,
    role,
  ]);


  // =========================================================
  // GROUP PERMISSIONS BY MODULE
  // =========================================================

  const groupedPermissions =
    permissions.reduce(
      (groups, permission) => {

        const module =
          permission.module || 'Other';

        if (!groups[module]) {
          groups[module] = [];
        }

        groups[module].push(permission);

        return groups;

      },
      {}
    );


  // =========================================================
  // TOGGLE PERMISSION
  // =========================================================

  const togglePermission = (
    permissionId
  ) => {

    setSelectedPermissions(
      (current) => {

        if (
          current.includes(permissionId)
        ) {

          return current.filter(
            (id) =>
              id !== permissionId
          );

        }

        return [
          ...current,
          permissionId,
        ];

      }
    );

  };


  // =========================================================
  // TOGGLE MODULE
  // =========================================================

  const toggleModule = (
    modulePermissions
  ) => {

    const moduleIds =
      modulePermissions.map(
        (permission) =>
          permission.permission_id
      );

    const allSelected =
      moduleIds.every(
        (id) =>
          selectedPermissions.includes(id)
      );

    if (allSelected) {

      setSelectedPermissions(
        (current) =>
          current.filter(
            (id) =>
              !moduleIds.includes(id)
          )
      );

    } else {

      setSelectedPermissions(
        (current) => [
          ...new Set([
            ...current,
            ...moduleIds,
          ]),
        ]
      );

    }

  };


  // =========================================================
  // SAVE
  // =========================================================

  const handleSave = async (e) => {

    e.preventDefault();

    if (!name.trim()) {

      setError(
        'Role name is required.'
      );

      return;
    }

    try {

      setSaving(true);
      setError('');

      // ---------------------------------------------------
      // UPDATE ROLE
      // ---------------------------------------------------

      const roleResponse =
        await fetch(
          `http://localhost:3000/organizations/${organizationId}/roles/${role.role_id}`,
          {
            method: 'PATCH',

            headers: {
              Authorization:
                `Bearer ${token}`,

              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              name: name.trim(),

              description:
                description.trim() ||
                null,
            }),
          }
        );

      /*
       * Ako još nemaš PATCH endpoint za role,
       * permissions će se i dalje moći sačuvati.
       *
       * 404 / 405 ne prekida save.
       */

      if (
        !roleResponse.ok &&
        roleResponse.status !== 404 &&
        roleResponse.status !== 405
      ) {

        throw new Error(
          `Role update failed: ${roleResponse.status}`
        );

      }


      // ---------------------------------------------------
      // UPDATE PERMISSIONS
      // ---------------------------------------------------

      const permissionsResponse =
        await fetch(
          `http://localhost:3000/organizations/${organizationId}/roles/${role.role_id}/permissions`,
          {
            method: 'PUT',

            headers: {
              Authorization:
                `Bearer ${token}`,

              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              permission_ids:
                selectedPermissions,
            }),
          }
        );

      if (!permissionsResponse.ok) {

        throw new Error(
          `Permissions update failed: ${permissionsResponse.status}`
        );

      }


      // ---------------------------------------------------
      // UPDATED ROLE
      // ---------------------------------------------------

      const updatedRole = {
        ...role,

        name:
          name.trim(),

        description:
          description.trim() ||
          null,
      };


      if (onSaved) {
        onSaved(updatedRole);
      }

      onClose();

    } catch (err) {

      console.error(
        'Greška pri čuvanju role:',
        err
      );

      setError(
        'Changes could not be saved.'
      );

    } finally {

      setSaving(false);

    }

  };


  // =========================================================
  // NO ROLE
  // =========================================================

  if (!role) {
    return null;
  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div
      className="edit-role-overlay"
      onMouseDown={(e) => {

        if (
          e.target === e.currentTarget
        ) {
          onClose();
        }

      }}
    >

      <div
        className="edit-role-modal"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >

        {/* =================================================
            HEADER
        ================================================== */}

        <div className="edit-role-header">

          <div className="edit-role-header-left">

            <div className="edit-role-header-icon">
              <FaUserShield />
            </div>

            <div>

              <h2>
                Edit role
              </h2>

              <p>
                Update role details and permissions
              </p>

            </div>

          </div>


          <button
            type="button"
            className="edit-role-close"
            onClick={onClose}
            disabled={saving}
          >
            <FaTimes />
          </button>

        </div>


        {/* =================================================
            BODY
        ================================================== */}

        <form
          className="edit-role-form"
          onSubmit={handleSave}
        >

          {/* =================================================
              ROLE DETAILS
          ================================================== */}

          <section className="edit-role-section">

            <div className="edit-role-section-heading">

              <h3>
                Role details
              </h3>

              <span>
                Basic information
              </span>

            </div>


            <div className="edit-role-fields">

              <div className="edit-role-field">

                <label htmlFor="edit-role-name">
                  Role name
                </label>

                <input
                  id="edit-role-name"
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="e.g. Project Manager"
                  disabled={saving}
                />

              </div>


              <div className="edit-role-field">

                <label htmlFor="edit-role-description">
                  Description
                </label>

                <textarea
                  id="edit-role-description"
                  value={description}
                  onChange={(e) =>
                    setDescription(
                      e.target.value
                    )
                  }
                  placeholder="Describe what this role can do..."
                  rows={3}
                  disabled={saving}
                />

              </div>

            </div>

          </section>


          {/* =================================================
              PERMISSIONS
          ================================================== */}

          <section className="edit-role-section">

            <div className="edit-role-section-heading">

              <div>

                <h3>
                  Permissions
                </h3>

                <span>
                  Choose what members with this role can do.
                </span>

              </div>


              <div className="edit-role-selected-count">

                {selectedPermissions.length}

                {' '}

                selected

              </div>

            </div>


            {/* LOADING */}

            {loading && (

              <div className="edit-role-loading">

                <FaSpinner className="edit-role-spinner" />

                <span>
                  Loading permissions...
                </span>

              </div>

            )}


            {/* ERROR */}

            {!loading && error && (

              <div className="edit-role-error">

                {error}

              </div>

            )}


            {/* PERMISSIONS */}

            {!loading &&
              !error &&
              Object.keys(
                groupedPermissions
              ).length === 0 && (

                <div className="edit-role-empty">

                  <FaUserShield />

                  <p>
                    No permissions available.
                  </p>

                </div>

              )}


            {!loading &&
              !error &&
              Object.entries(
                groupedPermissions
              ).map(
                (
                  [
                    module,
                    modulePermissions,
                  ]
                ) => {

                  const moduleIds =
                    modulePermissions.map(
                      (permission) =>
                        permission.permission_id
                    );

                  const allSelected =
                    moduleIds.length > 0 &&
                    moduleIds.every(
                      (id) =>
                        selectedPermissions.includes(
                          id
                        )
                    );

                  return (

                    <div
                      key={module}
                      className="edit-role-permission-group"
                    >

                      {/* MODULE HEADER */}

                      <div className="edit-role-module-header">

                        <div>

                          <strong>
                            {module}
                          </strong>

                          <span>
                            {modulePermissions.length}{' '}
                            permissions
                          </span>

                        </div>


                        <button
                          type="button"
                          className="edit-role-module-toggle"
                          onClick={() =>
                            toggleModule(
                              modulePermissions
                            )
                          }
                          disabled={saving}
                        >

                          {allSelected
                            ? 'Clear all'
                            : 'Select all'}

                        </button>

                      </div>


                      {/* PERMISSION LIST */}

                      <div className="edit-role-permission-list">

                        {modulePermissions.map(
                          (permission) => {

                            const checked =
                              selectedPermissions.includes(
                                permission.permission_id
                              );

                            return (

                              <label
                                key={
                                  permission.permission_id
                                }
                                className={`edit-role-permission ${
                                  checked
                                    ? 'selected'
                                    : ''
                                }`}
                              >

                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    togglePermission(
                                      permission.permission_id
                                    )
                                  }
                                  disabled={saving}
                                />


                                <span className="edit-role-checkbox">
                                  {checked && '✓'}
                                </span>


                                <span className="edit-role-permission-content">

                                  <strong>
                                    {permission.name}
                                  </strong>

                                  {permission.description && (

                                    <small>
                                      {
                                        permission.description
                                      }
                                    </small>

                                  )}

                                </span>

                              </label>

                            );

                          }
                        )}

                      </div>

                    </div>

                  );

                }
              )}

          </section>


          {/* =================================================
              ERROR FOOTER
          ================================================== */}

          {error && (
            <div className="edit-role-footer-error">
              {error}
            </div>
          )}


          {/* =================================================
              FOOTER
          ================================================== */}

          <div className="edit-role-footer">

            <button
              type="button"
              className="edit-role-cancel"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>


            <button
              type="submit"
              className="edit-role-save"
              disabled={
                saving ||
                loading
              }
            >

              {saving ? (

                <>
                  <FaSpinner className="edit-role-spinner" />

                  Saving...
                </>

              ) : (

                <>
                  <FaSave />

                  Save changes
                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>

  );
}

export default EditOrganizationRole;