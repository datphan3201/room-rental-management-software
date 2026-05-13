import React from 'react';
import { api } from '../../api/client.js';
import { formatCurrency, formatDate } from '../../utils/format.js';

export function TenantContractPage() {
  const [contracts, setContracts] = React.useState([]);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let mounted = true;
    api
      .get('/contracts/me')
      .then(({ data }) => {
        if (mounted) setContracts(data.data || []);
      })
      .catch((requestError) => {
        if (mounted) setError(requestError?.response?.data?.message || 'Failed to load contract data');
      });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <section className="panel wide">
      <h2>My Contract</h2>
      <p className="muted">View your own active and historical rental contracts.</p>
      {error ? <div className="error-box">{error}</div> : null}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Room</th>
              <th>Period</th>
              <th>Status</th>
              <th>Deposit</th>
              <th>Rent</th>
              <th>Note</th>
            </tr>
          </thead>
          <tbody>
            {contracts.length ? contracts.map((contract) => (
              <tr key={contract._id}>
                <td>{contract.roomId?.roomNumber || '-'}</td>
                <td>{formatDate(contract.startDate)} to {formatDate(contract.endDate)}</td>
                <td>{contract.status}</td>
                <td>{formatCurrency(contract.depositAmount)}</td>
                <td>{formatCurrency(contract.monthlyRent)}</td>
                <td>{contract.note || '-'}</td>
              </tr>
            )) : <tr><td colSpan="6" className="muted">No contract found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}
