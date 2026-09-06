import { useEffect, useState } from 'react';

import {
  FaBuilding,
  FaPlus,
  FaCheck,
  FaChevronDown,
} from 'react-icons/fa';

import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';

import CreateOrganizationModal from './CreateOrganization';

import './OrganizationSelector.css';

function OrganizationSelector() {

  const {
    currentOrganization,
    selectOrganization,
  } = useOrganization();

  const { token } = useAuth();

  const [open, setOpen] = useState(false);

  const [organizations, setOrganizations] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showCreateModal, setShowCreateModal] =
    useState(false);


  // =========================================================
  // LOAD ORGANIZATIONS
  // =========================================================

  useEffect(() => {

    if (!token) {
      setLoading(false);
      return;
    }


    const loadOrganizations = async () => {

      try {

        const res = await fetch(
          'http://localhost:3000/organizations/my',
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

          throw new Error(
            `HTTP error: ${res.status}`
          );

        }


        const data = await res.json();


        console.log(
          'ORGANIZACIJE IZ BAZE:',
          JSON.stringify(data, null, 2)
        );


        setOrganizations(data);


        /*
         * Ako nema trenutno izabrane organizacije,
         * automatski biramo prvu iz baze.
         */
        if (
          !currentOrganization &&
          data.length > 0
        ) {

          selectOrganization(data[0]);

        }


      } catch (error) {

        console.error(
          'GREŠKA ORGANIZACIJE:',
          error
        );

      } finally {

        setLoading(false);

      }

    };


    loadOrganizations();

  }, [token]);


  // =========================================================
  // ORGANIZATION CREATED
  // =========================================================

  const handleOrganizationCreated = (
    newOrganization
  ) => {

    console.log(
      'NOVA ORGANIZACIJA:',
      newOrganization
    );


    /*
     * Dodajemo novu organizaciju
     * u postojeću listu.
     */
    setOrganizations((prev) => {

      /*
       * Zaštita od dupliranja.
       */
      const alreadyExists =
        prev.some(
          (organization) =>
            organization.organization_id ===
            newOrganization.organization_id
        );


      if (alreadyExists) {
        return prev;
      }


      return [
        ...prev,
        newOrganization,
      ];

    });


    /*
     * Odmah je postavljamo
     * kao aktivnu organizaciju.
     */
    selectOrganization(
      newOrganization
    );


    /*
     * Zatvaramo modal.
     */
    setShowCreateModal(false);


    /*
     * Otvaramo selector da korisnik
     * vidi novu organizaciju.
     */
    setOpen(true);

  };


  // =========================================================
  // SELECT ORGANIZATION
  // =========================================================

  const handleSelectOrganization = (
    organization
  ) => {

    selectOrganization(
      organization
    );

    setOpen(false);

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (
    <>
      <div className="organization-selector">

        {/* =================================================
            MAIN BUTTON
        ================================================== */}

        <button
          type="button"
          className="organization-selector-button"
          onClick={() =>
            setOpen((prev) => !prev)
          }
        >

          <span className="organization-icon">

            <FaBuilding />

          </span>


          <span className="organization-name">

            {loading
              ? 'Loading...'
              : currentOrganization
                ? currentOrganization.name
                : 'Select organization'}

          </span>


          <span className="organization-arrow">

            <FaChevronDown
              className={
                open
                  ? 'organization-arrow-open'
                  : ''
              }
            />

          </span>

        </button>


        {/* =================================================
            DROPDOWN
        ================================================== */}

        {open && (

          <div className="organization-dropdown">

            {organizations.length === 0 ? (

              <div className="organization-empty">

                No organizations

              </div>

            ) : (

              organizations.map(
                (organization) => {

                  const isSelected =
                    currentOrganization
                      ?.organization_id ===
                    organization.organization_id;


                  return (

                    <button
                      type="button"
                      key={
                        organization.organization_id
                      }
                      className={
                        `organization-option ${
                          isSelected
                            ? 'selected'
                            : ''
                        }`
                      }
                      onClick={() =>
                        handleSelectOrganization(
                          organization
                        )
                      }
                    >

                      <span className="organization-option-icon">

                        <FaBuilding />

                      </span>


                      <span className="organization-option-name">

                        {organization.name}

                      </span>


                      {isSelected && (

                        <span className="organization-check">

                          <FaCheck />

                        </span>

                      )}

                    </button>

                  );

                }
              )

            )}


            {/* =================================================
                DIVIDER
            ================================================== */}

            <div className="organization-dropdown-divider" />


            {/* =================================================
                CREATE
            ================================================== */}

            <button
              type="button"
              className="organization-create"
              onClick={() => {

                setOpen(false);

                setShowCreateModal(true);

              }}
            >

              <span>

                <FaPlus />

              </span>


              <span>
                Create organization
              </span>

            </button>

          </div>

        )}

      </div>


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

    </>
  );
}

export default OrganizationSelector;