import {
  changePassword,
  getAuthProfile,
  loginWithCredentials,
} from '../services/auth.service.js';

export async function login(req, res) {
  try {
    const result = await loginWithCredentials(req.body);
    return res.json(result);
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Login failed' });
  }
}

export async function me(req, res) {
  try {
    const profile = await getAuthProfile(req.user.sub);
    return res.json({ user: profile });
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Unauthorized' });
  }
}

export async function changeMyPassword(req, res) {
  try {
    const result = await changePassword(req.user.sub, req.body);
    return res.json({ data: result });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}
