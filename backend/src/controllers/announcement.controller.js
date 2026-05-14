import {
  createAnnouncement,
  deleteAnnouncementById,
  getAnnouncements,
  getPinnedAnnouncements,
  updateAnnouncementById,
} from '../services/announcement.service.js';
import { writeAuditLog } from '../services/audit.service.js';

export async function listAnnouncements(req, res) {
  const announcements = await getAnnouncements();
  return res.json({ data: announcements });
}

export async function listPinnedAnnouncements(req, res) {
  const announcements = await getPinnedAnnouncements();
  return res.json({ data: announcements });
}

export async function createAnnouncementHandler(req, res) {
  try {
    const announcement = await createAnnouncement(req.body, req.user.sub);
    await writeAuditLog({
      actorId: req.user.sub,
      action: 'CREATE',
      entityType: 'Announcement',
      entityId: announcement._id,
      summary: `Created announcement ${announcement.title}`,
      metadata: { isPinned: announcement.isPinned },
    });
    return res.status(201).json({ data: announcement });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function updateAnnouncement(req, res) {
  try {
    const announcement = await updateAnnouncementById(req.params.id, req.body, req.user.sub);
    await writeAuditLog({
      actorId: req.user.sub,
      action: 'UPDATE',
      entityType: 'Announcement',
      entityId: announcement._id,
      summary: `${announcement.isPinned ? 'Pinned' : 'Updated'} announcement ${announcement.title}`,
      metadata: { isPinned: announcement.isPinned },
    });
    return res.json({ data: announcement });
  } catch (error) {
    const status = error.message === 'Announcement not found' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}

export async function deleteAnnouncement(req, res) {
  try {
    const announcement = await deleteAnnouncementById(req.params.id);
    await writeAuditLog({
      actorId: req.user.sub,
      action: 'DELETE',
      entityType: 'Announcement',
      entityId: announcement._id,
      summary: `Deleted announcement ${announcement.title}`,
    });
    return res.json({ data: announcement });
  } catch (error) {
    const status = error.message === 'Announcement not found' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}
