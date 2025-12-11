import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaArrowLeft } from 'react-icons/fa';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import { createEvent } from '../services/events/eventsService';
import { tagsAPI } from '../services/tags/tagsService';
import TagSelector from '../components/tags/TagSelector';
import './CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    maxParticipants: '',
    tags: [],
  });
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loadingTags, setLoadingTags] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      setLoadingTags(true);
      const response = await tagsAPI.getAllTags();
      if (response.success && response.data) {
        setAvailableTags(response.data);
      }
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoadingTags(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleTagToggle = (tagName) => {
    setSelectedTags(prev => {
      if (prev.includes(tagName)) {
        return prev.filter(t => t !== tagName);
      } else {
        return [...prev, tagName];
      }
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 10 || formData.title.length > 50) {
      newErrors.title = 'Title must be between 10 and 50 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 10 || formData.description.length > 2000) {
      newErrors.description = 'Description must be between 10 and 2000 characters';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.date = 'Date must be in the future';
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    if (!formData.maxParticipants) {
      newErrors.maxParticipants = 'Max participants is required';
    } else if (parseInt(formData.maxParticipants) < 1) {
      newErrors.maxParticipants = 'Must have at least 1 participant';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);

      const eventData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: new Date(formData.date).toISOString(),
        location: formData.location.trim(),
        maxParticipants: parseInt(formData.maxParticipants),
        tags: selectedTags,
      };

      const response = await createEvent(eventData);

      if (response.success) {
        // Redirect to manager events page
        navigate('/manager/events');
      } else {
        setErrors({ submit: response.message || 'Failed to create event' });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to create event. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout
      userRole="manager"
      title="Create Event"
      breadcrumbs={['Manager', 'Events', 'Create']}
    >
      <div className="create-event-page">
        <div className="create-event-container">
          <div className="create-event-header">
            <button
              className="btn-back"
              onClick={() => navigate('/manager/events')}
            >
              <FaArrowLeft />
              <span>Back to Events</span>
            </button>
            <h1>Create New Event</h1>
            <p>Fill in the details below to create a new volunteer event</p>
          </div>

          <form className="create-event-form" onSubmit={handleSubmit}>
            {errors.submit && (
              <div className="form-error">
                {errors.submit}
              </div>
            )}

            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">
                Event Title <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter event title (10-50 characters)"
                className={errors.title ? 'error' : ''}
                maxLength={50}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
              <span className="char-count">{formData.title.length}/50</span>
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe your event (10-2000 characters)"
                className={errors.description ? 'error' : ''}
                rows={6}
                maxLength={2000}
              />
              {errors.description && <span className="field-error">{errors.description}</span>}
              <span className="char-count">{formData.description.length}/2000</span>
            </div>

            {/* Date and Location Row */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">
                  <FaCalendar />
                  Event Date & Time <span className="required">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className={errors.date ? 'error' : ''}
                />
                {errors.date && <span className="field-error">{errors.date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="location">
                  <FaMapMarkerAlt />
                  Location <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter event location"
                  className={errors.location ? 'error' : ''}
                />
                {errors.location && <span className="field-error">{errors.location}</span>}
              </div>
            </div>

            {/* Max Participants */}
            <div className="form-group">
              <label htmlFor="maxParticipants">
                <FaUsers />
                Maximum Participants <span className="required">*</span>
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                placeholder="Enter maximum number of participants"
                className={errors.maxParticipants ? 'error' : ''}
                min="1"
              />
              {errors.maxParticipants && (
                <span className="field-error">{errors.maxParticipants}</span>
              )}
            </div>

            {/* Tags */}
            <div className="form-group">
              <TagSelector
                label="Tags (Optional)"
                availableTags={availableTags}
                selectedTags={selectedTags}
                onToggle={handleTagToggle}
                loading={loadingTags}
              />
            </div>

            {/* Submit Buttons */}
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate('/manager/events')}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <FaSpinner className="spinning" />
                    <span>Creating...</span>
                  </>
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CreateEvent;




