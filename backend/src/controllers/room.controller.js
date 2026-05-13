import { createRoom as createRoomService, deleteRoomById, getRooms, updateRoomById } from '../services/room.service.js';

function roomPayload(body) {
  return {
    roomNumber: body.roomNumber,
    floor: Number(body.floor),
    roomType: body.roomType,
    monthlyRent: Number(body.monthlyRent),
    maxOccupants: Number(body.maxOccupants),
    status: body.status || 'Available',
    description: body.description || '',
  };
}

export async function listRooms(req, res) {
  const rooms = await getRooms();
  return res.json({ data: rooms });
}

export async function createRoom(req, res) {
  try {
    const room = await createRoomService(roomPayload(req.body));
    return res.status(201).json({ data: room });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function updateRoom(req, res) {
  try {
    const room = await updateRoomById(req.params.id, roomPayload(req.body));
    return res.json({ data: room });
  } catch (error) {
    const status = error.message === 'Room not found' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}

export async function deleteRoom(req, res) {
  try {
    await deleteRoomById(req.params.id);
    return res.status(204).send();
  } catch (error) {
    const status = error.message === 'Room not found' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}

