import {
  createContract,
  deleteContractById,
  getContracts,
  getContractsForTenant,
  updateContractById,
} from '../services/contract.service.js';

export async function listContracts(req, res) {
  const contracts = await getContracts();
  return res.json({ data: contracts });
}

export async function listMyContracts(req, res) {
  const contracts = await getContractsForTenant(req.user.sub);
  return res.json({ data: contracts });
}

export async function createContractHandler(req, res) {
  try {
    const contract = await createContract(req.body);
    return res.status(201).json({ data: contract });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
}

export async function updateContract(req, res) {
  try {
    const contract = await updateContractById(req.params.id, req.body);
    return res.json({ data: contract });
  } catch (error) {
    const status = error.message === 'Contract not found' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}

export async function deleteContract(req, res) {
  try {
    await deleteContractById(req.params.id);
    return res.status(204).send();
  } catch (error) {
    const status = error.message === 'Contract not found' ? 404 : 400;
    return res.status(status).json({ message: error.message });
  }
}
