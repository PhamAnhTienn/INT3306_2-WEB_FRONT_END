import React, { useState } from 'react';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/events/eventsService';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import './CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    date: '',
    maxParticipants: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.title || !form.description || !form.location || !form.date) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        date: form.date, // ISO string from input[type=datetime-local]
        maxParticipants: form.maxParticipants ? Number(form.maxParticipants) : null,
      };

      await createEvent(payload);
      navigate('/manager/events');
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Failed to create event. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      userRole="manager"
      title="Create New Event"
      breadcrumbs={['Pages', 'Events', 'Create Event']}
    >
      <div className="create-event-page">
        <div className="create-event-container">
          <div className="create-event-header">
            <button
              type="button"
              onClick={() => navigate('/manager/events')}
              className="btn-back"
            >
              <FaArrowLeft />
              Back to Events
            </button>
            <h1>Create New Event</h1>
            <p>Fill in the details below to create a new volunteer event</p>
          </div>

          <div className="create-event-form">
            {error && (
              <div className="form-error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Title <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Tree planting campaign..."
                />
              </div>

              <div className="form-group">
                <label>
                  Description <span className="required">*</span>
                </label>
                <textarea
                  name="description"
                  rows={4}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the purpose, tasks, and expectations..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <FaMapMarkerAlt />
                    Location <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="UET, Cau Giay, Hanoi"
                  />
                </div>

                <div className="form-group">
                  <label>
                    <FaCalendar />
                    Date &amp; Time <span className="required">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>
                  <FaUsers />
                  Max Participants
                </label>
                <input
                  type="number"
                  min="1"
                  name="maxParticipants"
                  value={form.maxParticipants}
                  onChange={handleChange}
                  placeholder="Optional - Leave empty for unlimited"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/manager/events')}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-submit"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="spinning" />
                      Creating...
                    </>
                  ) : (
                    'Create Event'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;


