import {
  FaBuilding,
  FaUsers,
  FaUserShield,
  FaEdit,
  FaArrowLeft,
} from 'react-icons/fa';

import { useEffect, useState } from 'react';
import {
  useNavigate,
  useParams,
} from 'react-router-dom';

import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';

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
  const navigate = useNavigate();

  const [organization, setOrganization] = useState(
    organizationProp || currentOrganization
  );

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================================================
  // UČITAVANJE ORGANIZACIJE
  // =========================================================

  useEffect(() => {
    // Ako je organizacija prosleđena kroz props
    if (organizationProp) {
      setOrganization(organizationProp);
      setLoading(false);
      return;
    }

    // Ako nema ID-a, koristi trenutno izabranu organizaciju
    if (!id) {
      setOrganization(currentOrganization);
      setLoading(false);
      return;
    }

    // Ako nema tokena, ne pokušavaj zahtev
    if (!token) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadOrganization = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch(
          `http://localhost:3000/organizations/${id}`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Organization not found');
          }

          throw new Error(`HTTP error: ${res.status}`);
        }

        const data = await res.json();

        // Ako je komponenta u međuvremenu unmountovana
        if (cancelled) {
          return;
        }

        setOrganization(data);

        // Postavi organizaciju u context
        selectOrganization(data);
      } catch (err) {
        if (cancelled) {
          return;
        }

        console.error(
          'GREŠKA PRI UČITAVANJU ORGANIZACIJE:',
          err
        );

        setError(err.message);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadOrganization();

    return () => {
      cancelled = true;
    };

    // NAMERNO:
    // currentOrganization i selectOrganization nisu dependency
    // jer bi selectOrganization promenio currentOrganization
    // i napravio beskonačno ponovno učitavanje.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <main className="organization-details-page-wrapper">
        <div className="organization-details">
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
        </div>
      </main>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <main className="organization-details-page-wrapper">
        <div className="organization-details">
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
                <span>Back</span>
              </button>
            )}

          </div>
        </div>
      </main>
    );
  }

  // =========================================================
  // NEMA ORGANIZACIJE
  // =========================================================

  if (!organization) {
    return (
      <main className="organization-details-page-wrapper">
        <div className="organization-details">
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
                <span>Back</span>
              </button>
            )}

          </div>
        </div>
      </main>
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
      if (logo.startsWith('data:')) {
        return logo;
      }

      return `data:image/jpeg;base64,${logo}`;
    }

    return null;
  };

  const logoSrc = getLogo();

  // =========================================================
  // STATUS
  // =========================================================

  const normalizedStatus =
    status?.toLowerCase() || 'active';

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <main className="organization-details-page-wrapper">
      <div className="organization-details">

        {/* =====================================================
            TOP BAR
        ====================================================== */}

        {(onBack || onEdit) && (
          <div className="organization-details-top">

            {onBack && (
              <button
                type="button"
                className="organization-back-button"
                onClick={onBack}
              >
                <FaArrowLeft />
                <span>Back</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                className="organization-edit-button"
                onClick={() => onEdit(organization)}
              >
                <FaEdit />
                <span>Edit organization</span>
              </button>
            )}

          </div>
        )}

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

          <div className="organization-details-section-heading">

            <h2>
              Organization
            </h2>

            <p>
              Manage your organization and its members.
            </p>

          </div>

          <div className="organization-details-actions">

            {/* MEMBERS */}

            <button
              type="button"
              className="organization-details-action"
              onClick={() =>
                navigate(
                  `/organizations/${organization_id}/members`
                )
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

              <span className="organization-action-arrow">
                →
              </span>

            </button>

            {/* ROLES */}

            <button
              type="button"
              className="organization-details-action"
              onClick={() =>
                navigate(
                  `/organizations/${organization_id}/roles`
                )
              }
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

              <span className="organization-action-arrow">
                →
              </span>

            </button>

          </div>

        </section>

      </div>
    </main>
  );
}

export default OrganizationDetails;