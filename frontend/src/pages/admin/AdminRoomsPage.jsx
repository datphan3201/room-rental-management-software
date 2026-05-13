import React from 'react';
import { api } from '../../api/client.js';

const emptyRoom = {
  roomNumber: '',
  floor: 1,
  roomType: '',
  monthlyRent: 0,
  maxOccupants: 1,
  status: 'Available',
  description: '',
};

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function AdminRoomsPage() {
  const [rooms, setRooms] = React.useState([]);
  const [form, setForm] = React.useState(emptyRoom);
  const [editingId, setEditingId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  async function loadRooms() {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/rooms');
      setRooms(data.data || []);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    loadRooms();
  }, []);

  function startEdit(room) {
    setEditingId(room._id);
    setForm({
      roomNumber: room.roomNumber || '',
      floor: room.floor ?? 1,
      roomType: room.roomType || '',
      monthlyRent: room.monthlyRent ?? 0,
      maxOccupants: room.maxOccupants ?? 1,
      status: room.status || 'Available',
      description: room.description || '',
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyRoom);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        floor: Number(form.floor),
        monthlyRent: Number(form.monthlyRent),
        maxOccupants: Number(form.maxOccupants),
      };
      if (editingId) {
        await api.put(`/rooms/${editingId}`, payload);
      } else {
        await api.post('/rooms', payload);
      }
      await loadRooms();
      resetForm();
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to save room');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this room?')) {
      return;
    }
    setError('');
    try {
      await api.delete(`/rooms/${id}`);
      await loadRooms();
      if (editingId === id) {
        resetForm();
      }
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Failed to delete room');
    }
  }

  return (
    <section className="panel wide">
      <div className="panel-header">
        <div>
          <h2>Rooms</h2>
          <p className="muted">Admin CRUD for room inventory and status control.</p>
        </div>
        <button type="button" className="button secondary" onClick={resetForm}>
          New room
        </button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="grid-two">
        <div className="panel-subsection">
          <h3>Room list</h3>
          {loading ? (
            <p className="muted">Loading...</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Room</th>
                    <th>Floor</th>
                    <th>Type</th>
                    <th>Rent</th>
                    <th>Max</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rooms.length ? (
                    rooms.map((room) => (
                      <tr key={room._id}>
                        <td>{room.roomNumber}</td>
                        <td>{room.floor}</td>
                        <td>{room.roomType}</td>
                        <td>{formatCurrency(room.monthlyRent)}</td>
                        <td>{room.maxOccupants}</td>
                        <td>
                          <span className={`pill status-${String(room.status || '').toLowerCase()}`}>
                            {room.status}
                          </span>
                        </td>
                        <td className="row-actions">
                          <button type="button" className="text-button dark" onClick={() => startEdit(room)}>
                            Edit
                          </button>
                          <button type="button" className="text-button danger" onClick={() => handleDelete(room._id)}>
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="muted">
                        No rooms yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <form className="panel-subsection form-grid" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit room' : 'Create room'}</h3>
          <label>
            Room Number
            <input
              value={form.roomNumber}
              onChange={(event) => setForm((prev) => ({ ...prev, roomNumber: event.target.value }))}
              required
            />
          </label>
          <label>
            Floor
            <input
              type="number"
              min="1"
              value={form.floor}
              onChange={(event) => setForm((prev) => ({ ...prev, floor: event.target.value }))}
              required
            />
          </label>
          <label>
            Room Type
            <input
              value={form.roomType}
              onChange={(event) => setForm((prev) => ({ ...prev, roomType: event.target.value }))}
              required
            />
          </label>
          <label>
            Monthly Rent
            <input
              type="number"
              min="0"
              value={form.monthlyRent}
              onChange={(event) => setForm((prev) => ({ ...prev, monthlyRent: event.target.value }))}
              required
            />
          </label>
          <label>
            Max Occupants
            <input
              type="number"
              min="1"
              value={form.maxOccupants}
              onChange={(event) => setForm((prev) => ({ ...prev, maxOccupants: event.target.value }))}
              required
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </label>
          <label>
            Description
            <textarea
              rows="4"
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
          </label>
          <div className="button-row">
            <button type="submit" className="button" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update room' : 'Create room'}
            </button>
            {editingId ? (
              <button type="button" className="button secondary" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </section>
  );
}
