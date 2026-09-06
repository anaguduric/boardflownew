import { useState } from 'react';
import {
  FaUserShield,
  FaTimes,
  FaPlus,
} from 'react-icons/fa';

import { useAuth } from '../../context/AuthContext';

import './CreateOrganizationRole.css';

function CreateOrganizationRole({
  organizationId,
  onClose,
  onCreated,
}) {
  const { token } = useAuth();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');

    if (!name.trim()) {
      setError('Role name is required.');
      return;
    }

    if (!organizationId) {
      setError('Organization ID is missing.');
      return;
    }

    if (!token) {
      setError('You are not authenticated.');
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        `http://localhost:3000/organizations/${organizationId}/roles`,
        {
          method: 'POST',

          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            is_default: isDefault,
          }),
        }
      );

      const data = await res.json();

      console.log(
        'CREATE ROLE STATUS:',
        res.status
      );

      console.log(
        'CREATE ROLE RESPONSE:',
        data
      );

      if (!res.ok) {
        throw new Error(
          data?.message ||
          'Role could not be created.'
        );
      }

      // Prosleđujemo novu rolu parent komponenti
      if (onCreated) {
        onCreated(data);
      }

      // Zatvaramo modal
      onClose();

    } catch (err) {
      console.error(
        'GREŠKA PRI KREIRANJU ROLE:',
        err
      );

      setError(
        err.message ||
        'Role could not be created.'
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="create-role-overlay"
      onMouseDown={(e) => {
        if (
          e.target === e.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >

      <div
        className="create-role-modal"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >

        {/* HEADER */}

        <div className="create-role-header">

          <div className="create-role-title">

            <div className="create-role-icon">
              <FaUserShield />
            </div>

            <div>
              <h2>
                Create role
              </h2>

              <p>
                Add a new role to this organization.
              </p>
            </div>

          </div>

          <button
            type="button"
            className="create-role-close"
            onClick={onClose}
            disabled={loading}
          >
            <FaTimes />
          </button>

        </div>


        {/* FORM */}

        <form
          className="create-role-form"
          onSubmit={handleSubmit}
        >

          {/* NAME */}

          <div className="create-role-field">

            <label htmlFor="role-name">
              Role name
            </label>

            <input
              id="role-name"
              type="text"
              placeholder="e.g. Developer"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              disabled={loading}
              autoFocus
            />

          </div>


          {/* DESCRIPTION */}

          <div className="create-role-field">

            <label htmlFor="role-description">
              Description
            </label>

            <textarea
              id="role-description"
              placeholder="Describe what this role is responsible for..."
              value={description}
              onChange={(e) =>
                setDescription(
                  e.target.value
                )
              }
              disabled={loading}
              rows={4}
            />

          </div>


          {/* DEFAULT */}

          <label className="create-role-checkbox">

            <input
              type="checkbox"
              checked={isDefault}
              onChange={(e) =>
                setIsDefault(
                  e.target.checked
                )
              }
              disabled={loading}
            />

            <span className="create-role-checkbox-content">

              <strong>
                Default role
              </strong>

              <small>
                New members can use this role by default.
              </small>

            </span>

          </label>


          {/* ERROR */}

          {error && (
            <div className="create-role-error">
              {error}
            </div>
          )}


          {/* ACTIONS */}

          <div className="create-role-actions">

            <button
              type="button"
              className="create-role-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="create-role-submit"
              disabled={loading}
            >

              {loading ? (
                'Creating...'
              ) : (
                <>
                  <FaPlus />
                  Create role
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateOrganizationRole;