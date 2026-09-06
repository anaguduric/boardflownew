import {
  FaBuilding,
  FaCheckCircle,
  FaChevronRight,
} from 'react-icons/fa';

import './OrganizationCard.css';

function OrganizationCard({
  organization,
  isSelected = false,
  onSelect,
}) {
  if (!organization) {
    return null;
  }

  const {
    organization_id,
    name,
    description,
    logo,
    status,
    role,
  } = organization;

  const getLogo = () => {
    if (!logo) {
      return null;
    }

    if (typeof logo === 'string') {
      return logo.startsWith('data:')
        ? logo
        : `data:image/jpeg;base64,${logo}`;
    }

    return null;
  };

  const logoSrc = getLogo();

  const handleClick = () => {
    if (onSelect) {
      onSelect(organization);
    }
  };

  return (
    <button
      type="button"
      className={`organization-card ${
        isSelected
          ? 'organization-card-selected'
          : ''
      }`}
      onClick={handleClick}
    >
      {/* LOGO */}

      <div className="organization-card-logo">

        {logoSrc ? (
          <img
            src={logoSrc}
            alt={`${name} logo`}
          />
        ) : (
          <FaBuilding />
        )}

      </div>


      {/* CONTENT */}

      <div className="organization-card-content">

        <div className="organization-card-top">

          <h3>
            {name}
          </h3>

          {isSelected && (
            <FaCheckCircle className="organization-selected-icon" />
          )}

        </div>


        {description && (
          <p className="organization-card-description">
            {description}
          </p>
        )}


        <div className="organization-card-meta">

          {role?.name && (
            <span className="organization-card-role">
              {role.name}
            </span>
          )}

          {status && (
            <span
              className={`organization-card-status organization-status-${status.toLowerCase()}`}
            >
              {status}
            </span>
          )}

        </div>

      </div>


      {/* ARROW */}

      <div className="organization-card-arrow">

        <FaChevronRight />

      </div>

    </button>
  );
}

export default OrganizationCard;