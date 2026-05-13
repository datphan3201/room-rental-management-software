import { getAuthProfile, loginWithCredentials } from '../services/auth.service.js';

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
