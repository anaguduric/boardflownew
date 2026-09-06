import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBuilding,
  FaPlus,
  FaSearch,
  FaSpinner,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import { useOrganization } from '../../context/OrganizationContext';

import OrganizationCard from './OrganizationCard';
import CreateOrganizationModal from './CreateOrganization';

import './OrganizationList.css';

function OrganizationList() {

  // =========================================================
  // CONTEXT
  // =========================================================

  const { token } = useAuth();

  const {
    currentOrganization,
    selectOrganization,
  } = useOrganization();

  const navigate = useNavigate();


  // =========================================================
  // STATE
  // =========================================================

  const [organizations, setOrganizations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const [showCreateModal, setShowCreateModal] =
    useState(false);


  // =========================================================
  // LOAD ORGANIZATIONS
  // =========================================================

  const loadOrganizations = async () => {

    if (!token) {
      setLoading(false);
      return;
    }

    try {

      setLoading(true);
      setError('');

      const res = await fetch(
        'http://localhost:3000/organizations/my',
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );


      if (!res.ok) {
        throw new Error(
          `HTTP error: ${res.status}`
        );
      }


      const data = await res.json();

      console.log(
        'ORGANIZACIJE:',
        data
      );


      setOrganizations(data);


      // =====================================================
      // AUTOMATSKI IZBOR PRVE ORGANIZACIJE
      // =====================================================

      if (
        !currentOrganization &&
        data.length > 0
      ) {

        selectOrganization(data[0]);

      }


    } catch (err) {

      console.error(
        'Greška pri učitavanju organizacija:',
        err
      );

      setError(
        'Organizacije nije moguće učitati.'
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // USE EFFECT
  // =========================================================

  useEffect(() => {

    loadOrganizations();

  }, [token]);


  // =========================================================
  // SEARCH
  // =========================================================

  const filteredOrganizations =
    organizations.filter(
      (organization) =>
        organization.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );


  // =========================================================
  // SELECT ORGANIZATION
  // =========================================================

  const handleSelectOrganization = (
    organization
  ) => {

    // Postavljamo aktivnu organizaciju
    selectOrganization(
      organization
    );


    // Otvaramo detalje
    navigate(
      `/organizations/${organization.organization_id}`
    );

  };


  // =========================================================
  // CREATE SUCCESS
  // =========================================================

  const handleOrganizationCreated = (
    organization
  ) => {

    console.log(
      'Kreirana organizacija:',
      organization
    );


    // Dodaj novu organizaciju u listu
    setOrganizations(
      (prev) => [
        ...prev,
        organization,
      ]
    );


    // Automatski je postavi kao aktivnu
    selectOrganization(
      organization
    );


    // Zatvori modal
    setShowCreateModal(false);


    // Otvori detalje nove organizacije
    navigate(
      `/organizations/${organization.organization_id}`
    );

  };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <main className="organizations-page">

        <div className="organizations-loading">

          <FaSpinner className="loading-spinner" />

          <span>
            Loading organizations...
          </span>

        </div>

      </main>

    );

  }


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <main className="organizations-page">


      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="organizations-header">

        <div className="organizations-title">

          <div className="organizations-title-icon">

            <FaBuilding />

          </div>


          <div>

            <h1>
              Organizations
            </h1>

            <p>
              Manage your organizations and
              workspaces.
            </p>

          </div>

        </div>


        <button
          type="button"
          className="organizations-create-button"
          onClick={() =>
            setShowCreateModal(true)
          }
        >

          <FaPlus />

          <span>
            Create organization
          </span>

        </button>

      </div>


      {/* =====================================================
          SEARCH
      ====================================================== */}

      <div className="organizations-toolbar">

        <div className="organizations-search">

          <FaSearch />

          <input
            type="text"
            placeholder="Search organizations..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>


        <div className="organizations-count">

          {organizations.length}{' '}

          {organizations.length === 1
            ? 'organization'
            : 'organizations'}

        </div>

      </div>


      {/* =====================================================
          ERROR
      ====================================================== */}

      {error && (

        <div className="organizations-error">

          {error}

        </div>

      )}


      {/* =====================================================
          EMPTY
      ====================================================== */}

      {!error &&
        filteredOrganizations.length === 0 && (

          <div className="organizations-empty">

            <div className="organizations-empty-icon">

              <FaBuilding />

            </div>


            <h2>

              {search
                ? 'No organizations found'
                : 'No organizations yet'}

            </h2>


            <p>

              {search
                ? 'Try a different search.'
                : 'Create your first organization to get started.'}

            </p>


            {!search && (

              <button
                type="button"
                onClick={() =>
                  setShowCreateModal(true)
                }
              >

                <FaPlus />

                Create organization

              </button>

            )}

          </div>

        )}


      {/* =====================================================
          ORGANIZATION GRID
      ====================================================== */}

      {filteredOrganizations.length > 0 && (

        <div className="organizations-grid">

          {filteredOrganizations.map(
            (organization) => (

              <OrganizationCard
                key={
                  organization.organization_id
                }

                organization={
                  organization
                }

                isSelected={
                  currentOrganization
                    ?.organization_id ===
                  organization.organization_id
                }

                onSelect={
                  handleSelectOrganization
                }

              />

            )
          )}

        </div>

      )}


      {/* =====================================================
          CREATE ORGANIZATION MODAL
      ====================================================== */}

      {showCreateModal && (

        <CreateOrganizationModal

          onClose={() =>
            setShowCreateModal(false)
          }

          onCreated={
            handleOrganizationCreated
          }

        />

      )}

    </main>

  );

}

export default OrganizationList;