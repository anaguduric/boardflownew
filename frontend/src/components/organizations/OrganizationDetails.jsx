import {
  FaBuilding,
  FaUsers,
  FaUserShield,
  FaEdit,
  FaArrowLeft,
} from 'react-icons/fa';

import {
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';

import OrganizationMembers from './OrganizationMembers';

import './OrganizationDetails.css';

function OrganizationDetails({
  organization: organizationProp = null,
  onBack = null,
  onEdit = null,
}) {

  const {
    currentOrganization,
    selectOrganization,
  } = useOrganization();

  const { token } = useAuth();

  const { id } = useParams();

  const [organization, setOrganization] =
    useState(
      organizationProp ||
      currentOrganization
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [activeSection, setActiveSection] =
    useState('details');

  const navigate = useNavigate();

  // =========================================================
  // UČITAVANJE ORGANIZACIJE
  // =========================================================

  useEffect(() => {

    if (organizationProp) {

      setOrganization(
        organizationProp
      );

      setLoading(false);

      return;
    }


    if (!id) {

      setOrganization(
        currentOrganization
      );

      setLoading(false);

      return;
    }


    if (!token) {

      setLoading(false);

      return;
    }


    const loadOrganization = async () => {

      try {

        setLoading(true);
        setError(null);


        console.log(
          'UČITAVAM ORGANIZACIJU:',
          id
        );


        const res = await fetch(
          `http://localhost:3000/organizations/${id}`,
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


        console.log(
          'ORGANIZATION STATUS:',
          res.status
        );


        if (!res.ok) {

          if (res.status === 404) {

            throw new Error(
              'Organization not found'
            );
          }

          throw new Error(
            `HTTP error: ${res.status}`
          );
        }


        const data =
          await res.json();


        console.log(
          'ORGANIZACIJA IZ BAZE:',
          data
        );


        setOrganization(data);

        selectOrganization(data);


      } catch (err) {

        console.error(
          'GREŠKA PRI UČITAVANJU ORGANIZACIJE:',
          err
        );

        setError(
          err.message
        );

      } finally {

        setLoading(false);

      }

    };


    loadOrganization();

  }, [
    id,
    token,
    organizationProp,
  ]);


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (
      <div className="organization-details-empty">

        <div className="organization-details-empty-icon">
          <FaBuilding />
        </div>

        <h2>
          Loading organization...
        </h2>

        <p>
          Please wait while we load the organization details.
        </p>

      </div>
    );

  }


  // =========================================================
  // ERROR
  // =========================================================

  if (error) {

    return (
      <div className="organization-details-empty">

        <div className="organization-details-empty-icon">
          <FaBuilding />
        </div>

        <h2>
          Organization not found
        </h2>

        <p>
          {error}
        </p>

        {onBack && (

          <button
            type="button"
            onClick={onBack}
          >
            <FaArrowLeft />
            Back
          </button>

        )}

      </div>
    );

  }


  // =========================================================
  // NEMA ORGANIZACIJE
  // =========================================================

  if (!organization) {

    return (
      <div className="organization-details-empty">

        <div className="organization-details-empty-icon">
          <FaBuilding />
        </div>

        <h2>
          No organization selected
        </h2>

        <p>
          Select an organization to see its details.
        </p>

        {onBack && (

          <button
            type="button"
            onClick={onBack}
          >
            <FaArrowLeft />
            Back
          </button>

        )}

      </div>
    );

  }


  // =========================================================
  // PODACI
  // =========================================================

  const {
    name,
    description,
    logo,
    status,
    role,
    organization_id,
  } = organization;


  // =========================================================
  // LOGO
  // =========================================================

  const getLogo = () => {

    if (!logo) {
      return null;
    }


    if (typeof logo === 'string') {

      if (
        logo.startsWith('data:')
      ) {
        return logo;
      }

      return `data:image/jpeg;base64,${logo}`;
    }


    return null;

  };


  const logoSrc =
    getLogo();


  // =========================================================
  // STATUS
  // =========================================================

  const normalizedStatus =
    status?.toLowerCase() ||
    'active';


  // =========================================================
  // MEMBERS
  // =========================================================

  if (activeSection === 'members') {

    return (

      <div className="organization-details">

        <div className="organization-details-top">

          <button
            type="button"
            className="organization-back-button"
            onClick={() =>
              setActiveSection('details')
            }
          >

            <FaArrowLeft />

            <span>
              Back to organization
            </span>

          </button>

        </div>


        <OrganizationMembers
          organizationId={
            organization_id
          }
        />

      </div>

    );

  }


  // =========================================================
  // DETAILS
  // =========================================================

  return (

    <div className="organization-details">


      {/* =====================================================
          TOP BAR
      ====================================================== */}

      <div className="organization-details-top">

        {onBack && (

          <button
            type="button"
            className="organization-back-button"
            onClick={onBack}
          >

            <FaArrowLeft />

            <span>
              Back
            </span>

          </button>

        )}


        {onEdit && (

          <button
            type="button"
            className="organization-edit-button"
            onClick={() =>
              onEdit(organization)
            }
          >

            <FaEdit />

            <span>
              Edit organization
            </span>

          </button>

        )}

      </div>


      {/* =====================================================
          HEADER
      ====================================================== */}

      <section className="organization-details-header">

        <div className="organization-details-logo">

          {logoSrc ? (

            <img
              src={logoSrc}
              alt={`${name} logo`}
            />

          ) : (

            <FaBuilding />

          )}

        </div>


        <div className="organization-details-title">

          <div className="organization-details-name-row">

            <h1>
              {name}
            </h1>


            <span
              className={`organization-details-status organization-details-status-${normalizedStatus}`}
            >
              {status || 'ACTIVE'}
            </span>

          </div>


          {description && (

            <p>
              {description}
            </p>

          )}

        </div>

      </section>


      {/* =====================================================
          INFO
      ====================================================== */}

      <section className="organization-details-info">

        <div className="organization-info-item">

          <span className="organization-info-label">
            Organization ID
          </span>

          <strong>
            #{organization_id}
          </strong>

        </div>


        <div className="organization-info-item">

          <span className="organization-info-label">
            Your role
          </span>

          <strong>
            {role?.name || 'Member'}
          </strong>

        </div>


        <div className="organization-info-item">

          <span className="organization-info-label">
            Status
          </span>

          <strong>
            {status || 'ACTIVE'}
          </strong>

        </div>

      </section>


      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}

      <section className="organization-details-section">

        <h2>
          Organization
        </h2>

        <p className="organization-details-section-description">
          Manage your organization and its members.
        </p>


        <div className="organization-details-actions">


          {/* =================================================
              MEMBERS
          ================================================= */}

          <button
            type="button"
            className="organization-details-action"
            onClick={() =>
              navigate( `/organizations/${organization_id}/members`)
            }
          >

            <div className="organization-action-icon">
              <FaUsers />
            </div>

            <div className="organization-action-content">

              <strong>
                Members
              </strong>

              <span>
                View and manage organization members.
              </span>

            </div>

          </button>


          {/* =================================================
              ROLES
          ================================================= */}

          <button
            type="button"
            className="organization-details-action"
            onClick={() => {
              navigate(`/organizations/${organization_id}/roles`)
            }}
          >

            <div className="organization-action-icon">
              <FaUserShield />
            </div>

            <div className="organization-action-content">

              <strong>
                Roles
              </strong>

              <span>
                Manage organization roles and permissions.
              </span>

            </div>

          </button>


        </div>

      </section>

    </div>

  );
}

export default OrganizationDetails;