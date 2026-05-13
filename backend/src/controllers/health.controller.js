import { getHealth } from '../services/health.service.js';

export function health(req, res) {
  return res.json(getHealth());
}

