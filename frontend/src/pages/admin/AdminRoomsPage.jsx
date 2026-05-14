import React from 'react';
import { api } from '../../api/client.js';
import { ActionButton, ActionDialog } from '../../components/ActionDialog.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';

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

function getEntityId(value) {
  return String(value?._id || value || '');
}

export function AdminRoomsPage() {
  const [rooms, setRooms] = React.useState([]);
  const [contracts, setContracts] = React.useState([]);
  const [invoices, setInvoices] = React.useState([]);
  const [form, setForm] = React.useState(emptyRoom);
  const [editingId, setEditingId] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [roomView, setRoomView] = React.useState('board');
  const [roomSearch, setRoomSearch] = React.useState('');
  const [roomStatus, setRoomStatus] = React.useState('');
  const [roomFloor, setRoomFloor] = React.useState('');
  const [showRoomForm, setShowRoomForm] = React.useState(false);
  const [actionRoom, setActionRoom] = React.useState(null);

  const roomFloors = React.useMemo(() => {
    return [...new Set(rooms.map((room) => room.floor).filter((floor) => floor !== null && floor !== undefined && floor !== ''))]
      .sort((left, right) => Number(left) - Number(right));
  }, [rooms]);

  const filteredRooms = React.useMemo(() => {
    const search = roomSearch.trim().toLowerCase();
    return rooms.filter((room) => {
      const matchesSearch = !search || String(room.roomNumber || '').toLowerCase().includes(search);
      const matchesStatus = !roomStatus || room.status === roomStatus;
      const matchesFloor = !roomFloor || String(room.floor) === String(roomFloor);
      return matchesSearch && matchesStatus && matchesFloor;
    });
  }, [rooms, roomSearch, roomStatus, roomFloor]);

  const roomsByFloor = React.useMemo(() => {
    return filteredRooms.reduce((groups, room) => {
      const floor = room.floor === null || room.floor === undefined || room.floor === '' ? 'No floor' : `Floor ${room.floor}`;
      const current = groups.get(floor) || [];
      current.push(room);
      groups.set(floor, current);
      return groups;
    }, new Map());
  }, [filteredRooms]);

  function getRoomBoardInfo(room) {
    const activeContract = contracts.find((contract) => (
      contract.status === 'Active' && getEntityId(contract.roomId) === String(room._id)
    ));
    const hasTenant = Boolean(activeContract) || room.status === 'Occupied';
    const roomInvoices = activeContract
      ? invoices.filter((invoice) => getEntityId(invoice.contractId) === String(activeContract._id))
      : [];
    const latestInvoice = [...roomInvoices].sort((left, right) => (
      String(right.billingMonth || '').localeCompare(String(left.billingMonth || ''))
        || new Date(right.createdAt || right.dueDate || 0) - new Date(left.createdAt || left.dueDate || 0)
    ))[0];

    let paymentLabel = 'N/A';
    let paymentTone = 'neutral';
    if (hasTenant) {
      if (!latestInvoice) {
        paymentLabel = 'No invoice';
        paymentTone = 'warning';
      } else if (latestInvoice.status === 'Paid') {
        paymentLabel = 'Paid';
        paymentTone = 'success';
      } else {
        paymentLabel = latestInvoice.status === 'Overdue' ? 'Overdue' : 'Unpaid';
        paymentTone = latestInvoice.status === 'Overdue' ? 'danger' : 'warning';
      }
    }

    return {
      paymentLabel,
      paymentTone,
    };
  }

  async function loadRooms() {
    setLoading(true);
    setError('');
    try {
      const [roomsRes, contractsRes, invoicesRes] = await Promise.all([
        api.get('/rooms'),
        api.get('/contracts'),
        api.get('/invoices'),
      ]);
      setRooms(roomsRes.data.data || []);
      setContracts(contractsRes.data.data || []);
      setInvoices(invoicesRes.data.data || []);
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
    setShowRoomForm(true);
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
    setShowRoomForm(false);
  }

  function startCreate() {
    setEditingId(null);
    setForm(emptyRoom);
    setShowRoomForm(true);
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
        <button type="button" className="button secondary" onClick={startCreate}>
          New room
        </button>
      </div>

      {error ? <div className="error-box">{error}</div> : null}

      <div className="panel-subsection room-board-section">
        <div className="panel-header compact">
          <div>
            <h3>Room Status</h3>
            <p className="muted">Switch between board and list using the same search, filters, and actions.</p>
          </div>
          <div className="view-switch" aria-label="Room view mode">
            <button type="button" className={roomView === 'board' ? 'active' : ''} onClick={() => setRoomView('board')}>
              Board
            </button>
            <button type="button" className={roomView === 'list' ? 'active' : ''} onClick={() => setRoomView('list')}>
              List
            </button>
          </div>
        </div>

        <div className="room-board-toolbar">
          <input
            value={roomSearch}
            onChange={(event) => setRoomSearch(event.target.value)}
            placeholder="Search room number"
          />
          <select value={roomStatus} onChange={(event) => setRoomStatus(event.target.value)}>
            <option value="">All status</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
            <option value="Maintenance">Maintenance</option>
          </select>
          {roomFloors.length ? (
            <select value={roomFloor} onChange={(event) => setRoomFloor(event.target.value)}>
              <option value="">All floors</option>
              {roomFloors.map((floor) => (
                <option key={floor} value={floor}>Floor {floor}</option>
              ))}
            </select>
          ) : null}
          <button
            type="button"
            className="button secondary"
            onClick={() => {
              setRoomSearch('');
              setRoomStatus('');
              setRoomFloor('');
            }}
          >
            Clear
          </button>
        </div>

        {loading ? (
          <p className="muted">Loading rooms...</p>
        ) : roomView === 'board' && roomsByFloor.size ? (
          <div className="room-board">
            {[...roomsByFloor.entries()].map(([floor, floorRooms]) => (
              <section key={floor} className="floor-group">
                <div className="floor-heading">
                  <h4>{floor}</h4>
                  <span>{floorRooms.length} rooms</span>
                </div>
                <div className="room-card-grid">
                  {floorRooms.map((room) => (
                    (() => {
                      const boardInfo = getRoomBoardInfo(room);
                      return (
                        <article
                          key={room._id}
                          className={`room-card room-card-${String(room.status || '').toLowerCase()}`}
                        >
                          <div className="room-card-topline">
                            <strong>{room.roomNumber}</strong>
                            <div className="room-card-badges">
                              <StatusBadge value={room.status} />
                              <span className="room-type-badge">{room.roomType || '-'}</span>
                            </div>
                          </div>
                          <dl className="room-card-details">
                            <div>
                              <dt>Rent</dt>
                              <dd>{formatCurrency(room.monthlyRent)}</dd>
                            </div>
                            <div>
                              <dt>Payment</dt>
                              <dd><span className={`info-chip info-${boardInfo.paymentTone}`}>{boardInfo.paymentLabel}</span></dd>
                            </div>
                          </dl>
                          <div className="room-card-actions">
                            <ActionButton onClick={() => setActionRoom(room)} />
                          </div>
                        </article>
                      );
                    })()
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : roomView === 'list' && filteredRooms.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Floor</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Rent</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {filteredRooms.map((room) => {
                  const boardInfo = getRoomBoardInfo(room);
                  return (
                    <tr key={room._id}>
                      <td>
                        <div className="record-primary">
                          <strong>{room.roomNumber}</strong>
                          <ActionButton onClick={() => setActionRoom(room)} />
                        </div>
                      </td>
                      <td>{room.floor}</td>
                      <td><StatusBadge value={room.status} /></td>
                      <td>{room.roomType}</td>
                      <td>{formatCurrency(room.monthlyRent)}</td>
                      <td><span className={`info-chip info-${boardInfo.paymentTone}`}>{boardInfo.paymentLabel}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="muted">No matching rooms.</p>
        )}
      </div>

      <Modal open={showRoomForm} title={editingId ? 'Edit room' : 'Create room'} onClose={resetForm}>
        <div className="room-form-layout">
          <form className="form-grid" onSubmit={handleSubmit}>
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
              <button type="button" className="button secondary" onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
      <ActionDialog
        open={Boolean(actionRoom)}
        title={actionRoom ? `Room ${actionRoom.roomNumber}` : 'Room actions'}
        description="Choose a room action."
        onClose={() => setActionRoom(null)}
        actions={[
          {
            label: 'Edit room',
            hint: 'Update room information',
            onClick: () => startEdit(actionRoom),
          },
          {
            label: 'Delete room',
            hint: 'Remove this room',
            variant: 'danger',
            onClick: () => handleDelete(actionRoom._id),
          },
        ]}
      />
    </section>
  );
}
