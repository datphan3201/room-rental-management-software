import { Announcement } from '../models/announcement.model.js';

function announcementPayload(data, actorId) {
  const isPinned = Boolean(data.isPinned);
  return {
    title: String(data.title || '').trim(),
    content: String(data.content || '').trim(),
    isPinned,
    pinnedAt: isPinned ? (data.pinnedAt ? new Date(data.pinnedAt) : new Date()) : null,
    updatedBy: actorId || null,
  };
}

function assertAnnouncementPayload(payload) {
  if (!payload.title || !payload.content) {
    throw new Error('Announcement title and content are required');
  }
  if (payload.title.length > 120) {
    throw new Error('Announcement title must be 120 characters or fewer');
  }
  if (payload.content.length > 2000) {
    throw new Error('Announcement content must be 2000 characters or fewer');
  }
}

export async function getAnnouncements() {
  return Announcement.find()
    .populate('createdBy', 'username phone role')
    .populate('updatedBy', 'username phone role')
    .sort({ isPinned: -1, pinnedAt: -1, createdAt: -1 })
    .lean();
}

export async function getPinnedAnnouncements() {
  return Announcement.find({ isPinned: true })
    .populate('createdBy', 'username phone role')
    .sort({ pinnedAt: -1, createdAt: -1 })
    .lean();
}

export async function createAnnouncement(data, actorId) {
  const payload = announcementPayload(data, actorId);
  assertAnnouncementPayload(payload);
  return Announcement.create({
    ...payload,
    createdBy: actorId,
    updatedBy: actorId,
  });
}

export async function updateAnnouncementById(id, data, actorId) {
  const current = await Announcement.findById(id).lean();
  if (!current) {
    throw new Error('Announcement not found');
  }

  const payload = announcementPayload({
    ...current,
    ...data,
    isPinned: data.isPinned === undefined ? current.isPinned : data.isPinned,
    pinnedAt: data.isPinned === true && !current.isPinned ? new Date() : current.pinnedAt,
  }, actorId);
  assertAnnouncementPayload(payload);

  return Announcement.findByIdAndUpdate(id, payload, { new: true });
}

export async function deleteAnnouncementById(id) {
  const deleted = await Announcement.findByIdAndDelete(id);
  if (!deleted) {
    throw new Error('Announcement not found');
  }
  return deleted;
}
