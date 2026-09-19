import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import {
  FaUserShield,
  FaArrowLeft,
  FaSpinner,
  FaEdit,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';

import EditOrganizationRole from './EditOrganizationRole';

import './OrganizationRoles.css';


function OrganizationRoles() {

  const { id } = useParams();

  const navigate = useNavigate();

  const { token } = useAuth();


  // =========================================================
  // STATE
  // =========================================================

  const [roles, setRoles] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [editingRole, setEditingRole] =
    useState(null);


  // =========================================================
  // LOAD ROLES
  // =========================================================

  useEffect(() => {

    if (!token || !id) {

      setLoading(false);

      return;
    }


    const loadRoles = async () => {

      try {

        setLoading(true);

        setError('');


        const res = await fetch(
          `http://localhost:3000/organizations/${id}/roles`,
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


        if (!res.ok) {

          const data = await res.json()
            .catch(() => null);

          throw new Error(
            data?.message ||
            `HTTP error: ${res.status}`
          );

        }


        const data =
          await res.json();


        console.log(
          'ROLES ORGANIZACIJE:',
          data
        );


        /*
         * Role redosled držimo fiksnim.
         *
         * Ovo znači da se role na stranici
         * uvek prikazuju ovim redom:
         *
         * Owner
         * Admin
         * Project Manager
         * Member
         * Viewer
         */

        const roleOrder = {
          Owner: 1,
          Admin: 2,
          'Project Manager': 3,
          Member: 4,
          Viewer: 5,
        };


        const sortedRoles =
          Array.isArray(data)
            ? [...data].sort(
                (a, b) =>
                  (roleOrder[a.name] || 999) -
                  (roleOrder[b.name] || 999)
              )
            : [];


        setRoles(sortedRoles);


      } catch (err) {

        console.error(
          'GREŠKA PRI UČITAVANJU ROLA:',
          err
        );


        setError(
          err.message ||
          'Roles could not be loaded.'
        );


      } finally {

        setLoading(false);

      }

    };


    loadRoles();

  }, [token, id]);


  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================

  const handleEditRole = (
    role
  ) => {

    console.log(
      'EDIT ROLE:',
      role
    );


    setEditingRole(role);

  };


  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================

  const handleCloseEdit = () => {

    setEditingRole(null);

  };


  // =========================================================
  // ROLE SAVED
  // =========================================================

  const handleRoleSaved = (
    updatedRole
  ) => {

    console.log(
      'IZMENJENA ROLA:',
      updatedRole
    );


    setRoles(
      (prevRoles) =>
        prevRoles.map(
          (role) =>
            role.role_id ===
            updatedRole.role_id
              ? {
                  ...role,
                  ...updatedRole,
                }
              : role
        )
    );


    setEditingRole(null);

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <main className="organization-roles-page-wrapper">

        <div className="organization-roles-page">

          <div className="organization-roles-loading">

            <FaSpinner className="roles-spinner" />

            <span>
              Loading roles...
            </span>

          </div>

        </div>

      </main>

    );

  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (

      <main className="organization-roles-page-wrapper">

        <div className="organization-roles-page">

          <button
            type="button"
            className="organization-roles-back"
            onClick={() =>
              navigate(
                `/organizations/${id}`
              )
            }
          >

            <FaArrowLeft />

            <span>
              Back to organization
            </span>

          </button>


          <div className="organization-roles-error">

            <FaUserShield />

            <div>

              <h2>
                Unable to load roles
              </h2>

              <p>
                {error}
              </p>

            </div>

          </div>

        </div>

      </main>

    );

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <main className="organization-roles-page-wrapper">

      <div className="organization-roles-page">


        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="organization-roles-header">

          <div className="organization-roles-header-left">

            <button
              type="button"
              className="organization-roles-back"
              onClick={() =>
                navigate(
                  `/organizations/${id}`
                )
              }
            >

              <FaArrowLeft />

              <span>
                Back to organization
              </span>

            </button>


            <div className="organization-roles-title">

              <div className="organization-roles-title-icon">

                <FaUserShield />

              </div>


              <div>

                <h1>
                  Organization Roles
                </h1>

                <p>
                  Manage roles and permissions for this organization.
                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================================
            ROLE COUNT
        ====================================================== */}

        <div className="organization-roles-count">

          <strong>
            {roles.length}
          </strong>

          <span>
            {roles.length === 1
              ? 'role'
              : 'roles'}
          </span>

        </div>


        {/* =====================================================
            EMPTY
        ====================================================== */}

        {roles.length === 0 ? (

          <div className="organization-roles-empty">

            <div className="organization-roles-empty-icon">

              <FaUserShield />

            </div>


            <h2>
              No roles found
            </h2>


            <p>
              This organization does not have any roles yet.
            </p>

          </div>

        ) : (

          /* ===================================================
             ROLE LIST
          ==================================================== */

          <div className="organization-roles-list">

            {roles.map((role) => (

              <div
                key={role.role_id}
                className="organization-role-card"
              >


                {/* =================================================
                    ICON
                ================================================== */}

                <div className="organization-role-icon">

                  <FaUserShield />

                </div>


                {/* =================================================
                    CONTENT
                ================================================== */}

                <div className="organization-role-content">

                  <div className="organization-role-name-row">

                    <h3>
                      {role.name}
                    </h3>


                    {role.is_default && (

                      <span className="organization-role-default">

                        Default

                      </span>

                    )}

                  </div>


                  {role.description && (

                    <p>
                      {role.description}
                    </p>

                  )}


                  <span className="organization-role-id">

                    Role ID: #{role.role_id}

                  </span>

                </div>


                {/* =================================================
                    ACTIONS
                ================================================== */}

                <div className="organization-role-actions">

                  <button
                    type="button"
                    onClick={() =>
                      handleEditRole(role)
                    }
                  >

                    <FaEdit />

                    <span>
                      Edit
                    </span>

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}


        {/* =====================================================
            EDIT ROLE MODAL
        ====================================================== */}

        {editingRole && (

          <EditOrganizationRole

            organizationId={id}

            role={editingRole}

            onClose={
              handleCloseEdit
            }

            onSaved={
              handleRoleSaved
            }

          />

        )}

      </div>

    </main>

  );

}


export default OrganizationRoles;