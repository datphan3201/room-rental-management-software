import React from 'react';
import { api } from '../../api/client.js';
import { ListToolbar, useListView } from '../../components/ListTools.jsx';
import { Modal } from '../../components/Modal.jsx';
import { StatusBadge } from '../../components/StatusBadge.jsx';
import { formatCurrency, formatDate } from '../../utils/format.js';

export function TenantContractPage() {
  const [contracts, setContracts] = React.useState([]);
  const [selectedContract, setSelectedContract] = React.useState(null);
  const [error, setError] = React.useState('');
  const listView = useListView(contracts, {
    searchFields: ['roomId.roomNumber', 'status', 'note'],
    statusField: 'status',
  });

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
      {error ? <div className="error-box">{error}</div> : null}
      <ListToolbar view={listView} searchPlaceholder="Search room, status, note..." />
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {listView.items.length ? listView.items.map((contract) => (
              <tr
                key={contract._id}
                className="clickable-row"
                onClick={() => setSelectedContract(contract)}
                tabIndex="0"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setSelectedContract(contract);
                }}
              >
                <td>{contract.roomId?.roomNumber || '-'}</td>
                <td>{formatDate(contract.startDate)} to {formatDate(contract.endDate)}</td>
                <td><StatusBadge value={contract.status} /></td>
                <td>{formatCurrency(contract.depositAmount)}</td>
                <td>{formatCurrency(contract.monthlyRent)}</td>
                <td>{contract.note || '-'}</td>
                <td className="row-action-cell">
                  <button
                    type="button"
                    className="text-button dark"
                    onClick={(event) => {
                      event.stopPropagation();
                      setSelectedContract(contract);
                    }}
                  >
                    View
                  </button>
                </td>
              </tr>
            )) : <tr><td colSpan="7" className="muted">No matching contracts.</td></tr>}
          </tbody>
        </table>
      </div>
      <Modal
        open={Boolean(selectedContract)}
        title={selectedContract ? `Contract ${selectedContract.roomId?.roomNumber || ''}`.trim() : 'Contract'}
        onClose={() => setSelectedContract(null)}
      >
        {selectedContract ? (
          <div className="room-detail-layout">
            <div className="room-summary-grid">
              <div><span>Room</span><strong>{selectedContract.roomId?.roomNumber || '-'}</strong></div>
              <div><span>Status</span><strong>{selectedContract.status || '-'}</strong></div>
              <div><span>Deposit</span><strong>{formatCurrency(selectedContract.depositAmount)}</strong></div>
              <div><span>Monthly Rent</span><strong>{formatCurrency(selectedContract.monthlyRent)}</strong></div>
            </div>
            <div className="detail-lines">
              <span><b>Start date</b>{formatDate(selectedContract.startDate)}</span>
              <span><b>End date</b>{formatDate(selectedContract.endDate)}</span>
              <span><b>Room type</b>{selectedContract.roomId?.roomType || '-'}</span>
              <span><b>Note</b>{selectedContract.note || '-'}</span>
              <span>
                <b>Attachment</b>
                {selectedContract.contractImageUrl ? (
                  <a className="inline-link" href={selectedContract.contractImageUrl} target="_blank" rel="noreferrer">
                    Open contract attachment
                  </a>
                ) : '-'}
              </span>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
