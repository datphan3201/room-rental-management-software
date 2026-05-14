import { getRevenueReport } from '../services/report.service.js';

export async function revenueReport(req, res) {
  const report = await getRevenueReport({
    from: req.query.from,
    to: req.query.to,
    month: req.query.month,
    year: req.query.year,
    status: req.query.status,
  });
  return res.json({ data: report });
}
