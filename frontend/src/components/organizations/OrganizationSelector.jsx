import { useEffect, useState } from 'react';

import {
  FaBuilding,
  FaCheck,
  FaChevronDown,
} from 'react-icons/fa';

import { useOrganization } from '../../context/OrganizationContext';
import { useAuth } from '../../context/AuthContext';

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

        setLoading(true);


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


        setOrganizations(
          Array.isArray(data)
            ? data
            : []
        );


        /*
         * Ako nema trenutno izabrane organizacije,
         * automatski biramo prvu iz baze.
         */

        if (
          !currentOrganization &&
          data.length > 0
        ) {

          selectOrganization(
            data[0]
          );

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

        </div>

      )}

    </div>

  );

}


export default OrganizationSelector;
