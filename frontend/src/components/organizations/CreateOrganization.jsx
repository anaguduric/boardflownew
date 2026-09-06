import { useState } from 'react';

import {
  FaBuilding,
  FaTimes,
  FaPlus,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';
import './CreateOrganization.css';

function CreateOrganizationModal({
  onClose,
  onCreated,
}) {

  const { token } = useAuth();


  // =========================================================
  // STATE
  // =========================================================

  const [name, setName] = useState('');

  const [description, setDescription] =
    useState('');

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');


  // =========================================================
  // CREATE ORGANIZATION
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');


    // -------------------------------------------------------
    // VALIDACIJA
    // -------------------------------------------------------

    if (!name.trim()) {

      setError(
        'Organization name is required.'
      );

      return;
    }


    if (!token) {

      setError(
        'You are not authenticated.'
      );

      return;
    }


    try {

      setLoading(true);


      console.log(
        'KREIRAM ORGANIZACIJU:',
        {
          name: name.trim(),
          description:
            description.trim() || null,
        }
      );


      // -----------------------------------------------------
      // POST
      // -----------------------------------------------------

      const response = await fetch(
        'http://localhost:3000/organizations',
        {
          method: 'POST',

          headers: {
            Authorization:
              `Bearer ${token}`,

            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            name: name.trim(),

            description:
              description.trim() || null,
          }),
        }
      );


      // -----------------------------------------------------
      // RESPONSE
      // -----------------------------------------------------

      const data =
        await response.json();


      console.log(
        'RESPONSE:',
        data
      );


      // -----------------------------------------------------
      // ERROR
      // -----------------------------------------------------

      if (!response.ok) {

        throw new Error(
          Array.isArray(data.message)
            ? data.message.join(', ')
            : data.message ||
              'Failed to create organization.'
        );
      }


      // -----------------------------------------------------
      // SUCCESS
      // -----------------------------------------------------

      console.log(
        'ORGANIZACIJA USPESNO KREIRANA:',
        data
      );


      /*
       * Šaljemo novu organizaciju
       * nazad OrganizationSelector-u.
       *
       * OrganizationSelector će:
       *
       * 1. dodati je u listu
       * 2. postaviti je kao aktivnu
       * 3. zatvoriti modal
       */
      onCreated(data);


    } catch (error) {

      console.error(
        'CREATE ORGANIZATION ERROR:',
        error
      );


      setError(
        error.message ||
        'Something went wrong.'
      );


    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // CLICK NA OVERLAY
  // =========================================================

  const handleOverlayClick = (e) => {

    if (
      e.target === e.currentTarget
    ) {
      onClose();
    }

  };


  // =========================================================
  // RENDER
  // =========================================================

  return (

    <div
      className="organization-modal-overlay"
      onMouseDown={handleOverlayClick}
    >

      <div className="organization-modal">


        {/* =================================================
            HEADER
        ================================================== */}

        <div className="organization-modal-header">

          <div className="organization-modal-title-wrapper">

            <div className="organization-modal-icon">

              <FaBuilding />

            </div>


            <div>

              <h2>
                Create organization
              </h2>

              <p>
                Set up a new workspace for your team.
              </p>

            </div>

          </div>


          <button
            type="button"
            className="organization-modal-close"
            onClick={onClose}
          >

            <FaTimes />

          </button>

        </div>


        {/* =================================================
            FORM
        ================================================== */}

        <form
          className="organization-modal-form"
          onSubmit={handleSubmit}
        >


          {/* =================================================
              ORGANIZATION NAME
          ================================================== */}

          <div className="organization-form-group">

            <label htmlFor="organization-name">

              Organization name

            </label>


            <input
              id="organization-name"

              type="text"

              value={name}

              onChange={(e) =>
                setName(e.target.value)
              }

              placeholder="e.g. BoardFlow"

              autoFocus

              disabled={loading}
            />


            <span className="organization-input-hint">

              Choose a name your team will recognize.

            </span>

          </div>


          {/* =================================================
              DESCRIPTION
          ================================================== */}

          <div className="organization-form-group">

            <label htmlFor="organization-description">

              Description

              <span>
                Optional
              </span>

            </label>


            <textarea
              id="organization-description"

              value={description}

              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }

              placeholder="What is this organization about?"

              rows="4"

              disabled={loading}
            />

          </div>


          {/* =================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="organization-form-error">

              {error}

            </div>

          )}


          {/* =================================================
              BUTTONS
          ================================================== */}

          <div className="organization-modal-actions">


            {/* CANCEL */}

            <button
              type="button"

              className="organization-cancel-button"

              onClick={onClose}

              disabled={loading}
            >

              Cancel

            </button>


            {/* CREATE */}

            <button
              type="submit"

              className="organization-create-button"

              disabled={loading}
            >

              {loading ? (

                <>
                  <span className="organization-spinner" />

                  Creating...
                </>

              ) : (

                <>
                  <FaPlus />

                  Create organization
                </>

              )}

            </button>

          </div>

        </form>

      </div>

    </div>

  );
}

export default CreateOrganizationModal;