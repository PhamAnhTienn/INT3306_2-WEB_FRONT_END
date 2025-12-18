import React, { useState } from 'react';
import { FaCalendar, FaMapMarkerAlt, FaUsers, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { createEvent } from '../services/events/eventsService';

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
    <div className="min-h-screen bg-gray-50 flex justify-center py-8 px-4">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-xl p-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-6">Create New Event</h1>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title<span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Tree planting campaign..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description<span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe the purpose, tasks, and expectations..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-md border border-gray-300 px-3 py-2">
                <FaMapMarkerAlt className="text-gray-400 mr-2" />
                <input
                  type="text"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="flex-1 text-sm focus:outline-none"
                  placeholder="UET, Cau Giay, Hanoi"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date &amp; Time<span className="text-red-500">*</span>
              </label>
              <div className="flex items-center rounded-md border border-gray-300 px-3 py-2">
                <FaCalendar className="text-gray-400 mr-2" />
                <input
                  type="datetime-local"
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  className="flex-1 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Max Participants
            </label>
            <div className="flex items-center rounded-md border border-gray-300 px-3 py-2">
              <FaUsers className="text-gray-400 mr-2" />
              <input
                type="number"
                min="1"
                name="maxParticipants"
                value={form.maxParticipants}
                onChange={handleChange}
                className="flex-1 text-sm focus:outline-none"
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-5 py-2.5 rounded-md bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
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
  );
};

export default CreateEvent;


