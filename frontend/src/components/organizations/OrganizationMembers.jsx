import { useEffect, useState } from 'react';
import {
  FaArrowLeft,
  FaUserCircle,
  FaSpinner,
  FaUserShield,
  FaUserPlus,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';

import InviteMemberModal from '../../components/organizations/InviteMemberModal';

import './OrganizationMembers.css';

function OrganizationMembers({
  organization: organizationProp = null,
  onBack = null,
}) {
  const { token } = useAuth();

  const { currentOrganization } = useOrganization();

  const organization =
    organizationProp || currentOrganization;

  const [members, setMembers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [showInviteModal, setShowInviteModal] =
    useState(false);


  // =========================================================
  // LOAD MEMBERS
  // =========================================================

  useEffect(() => {
    if (!token || !organization?.organization_id) {
      setMembers([]);
      setLoading(false);
      return;
    }

    const loadMembers = async () => {
      try {
        setLoading(true);
        setError('');

        const organizationId =
          organization.organization_id;

        console.log(
          'UČITAVAM ČLANOVE ORGANIZACIJE:',
          organizationId,
        );

        const res = await fetch(
          `http://localhost:3000/organizations/${organizationId}/members`,
          {
            method: 'GET',

            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          },
        );

        console.log(
          'MEMBERS STATUS:',
          res.status,
        );

        if (!res.ok) {
          throw new Error(
            `HTTP error: ${res.status}`,
          );
        }

        const data = await res.json();

        console.log(
          'ČLANOVI:',
          data,
        );

        setMembers(
          Array.isArray(data)
            ? data
            : [],
        );
      } catch (err) {
        console.error(
          'Greška pri učitavanju članova:',
          err,
        );

        setError(
          'Members could not be loaded.',
        );
      } finally {
        setLoading(false);
      }
    };

    loadMembers();
  }, [
    token,
    organization?.organization_id,
  ]);


  // =========================================================
  // NO ORGANIZATION
  // =========================================================

  if (!organization) {
    return (
      <div className="organization-members-empty">

        <FaUserCircle />

        <h2>
          No organization selected
        </h2>

        <p>
          Select an organization first.
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
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="organization-members-page">

        <div className="organization-members-loading">

          <FaSpinner className="organization-members-spinner" />

          <span>
            Loading members...
          </span>

        </div>

      </div>
    );
  }


  // =========================================================
  // INVITATION CREATED
  // =========================================================

  const handleInvited = () => {
    /*
     * Za sada samo zatvaramo modal.
     *
     * Kasnije ćemo ovde moći da učitamo
     * pending invitations.
     */
  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="organization-members-page">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="organization-members-header">

        <div className="organization-members-title">

          {onBack && (
            <button
              type="button"
              className="organization-members-back"
              onClick={onBack}
            >
              <FaArrowLeft />
            </button>
          )}

          <div className="organization-members-title-icon">
            <FaUserShield />
          </div>

          <div>
            <h1>
              Members
            </h1>

            <p>
              {organization.name}
            </p>
          </div>

        </div>


        {/* ===================================================
            RIGHT SIDE
        ==================================================== */}

        <div className="organization-members-header-right">

          <div className="organization-members-count">

            <strong>
              {members.length}
            </strong>

            <span>
              {members.length === 1
                ? 'member'
                : 'members'}
            </span>

          </div>


          {/* INVITE BUTTON */}

          <button
            type="button"
            className="organization-members-invite"
            onClick={() =>
              setShowInviteModal(true)
            }
          >
            <FaUserPlus />

            <span>
              Invite member
            </span>
          </button>

        </div>

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (
        <div className="organization-members-error">
          {error}
        </div>
      )}


      {/* =====================================================
          EMPTY
      ====================================================== */}

      {!error && members.length === 0 && (
        <div className="organization-members-empty">

          <div className="organization-members-empty-icon">
            <FaUserCircle />
          </div>

          <h2>
            No members
          </h2>

          <p>
            This organization doesn't have any members yet.
          </p>

        </div>
      )}


      {/* =====================================================
          MEMBERS LIST
      ====================================================== */}

      {!error && members.length > 0 && (
        <div className="organization-members-list">

          {members.map((member) => {

            const username =
              member.username ||
              'Unknown user';

            const email =
              member.email ||
              '';

            const role =
              member.role?.name ||
              'Member';

            const status =
              member.status ||
              'ACTIVE';

            return (
              <div
                key={member.membership_id}
                className="organization-member-card"
              >

                {/* AVATAR */}

                <div className="organization-member-avatar">
                  <FaUserCircle />
                </div>


                {/* USER */}

                <div className="organization-member-info">

                  <div className="organization-member-name">
                    {username}
                  </div>

                  {email && (
                    <div className="organization-member-email">
                      {email}
                    </div>
                  )}

                </div>


                {/* ROLE */}

                <div className="organization-member-role">

                  <FaUserShield />

                  <span>
                    {role}
                  </span>

                </div>


                {/* STATUS */}

                <div
                  className={`organization-member-status organization-member-status-${status.toLowerCase()}`}
                >
                  {status}
                </div>

              </div>
            );
          })}

        </div>
      )}


      {/* =====================================================
          INVITE MEMBER MODAL
      ====================================================== */}

      {showInviteModal && (
        <InviteMemberModal
          organizationId={
            organization.organization_id
          }
          onClose={() =>
            setShowInviteModal(false)
          }
          onInvited={handleInvited}
        />
      )}

    </div>
  );
}

export default OrganizationMembers;