import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { FiArrowLeft, FiUsers } from 'react-icons/fi';

import TeamMembers from './TeamMembers';

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const fetchTeam = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `http://localhost:3000/teams/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTeam(response.data);
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, [id]);

  if (loading) {
    return (
      <div className="teams-page">
        <div className="teams-loading">
          Loading team...
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="teams-page">
        <div className="teams-empty">
          <h3>Team not found</h3>

          <button
            className="teams-create-btn"
            onClick={() => navigate('/teams')}
          >
            Back to Teams
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="teams-page">

      <button
        className="team-back-btn"
        onClick={() => navigate('/teams')}
      >
        <FiArrowLeft />
        Back to Teams
      </button>

      <div className="team-details-header">

        <div className="team-details-title">

          <div className="team-details-icon">
            <FiUsers />
          </div>

          <div>
            <h1>{team.team_name}</h1>

            <p>
              Created{' '}
              {team.created_at
                ? new Date(team.created_at).toLocaleDateString()
                : '-'}
            </p>
          </div>

        </div>

      </div>

      <TeamMembers teamId={team.team_id} />

    </div>
  );
};

export default TeamDetails;