import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, '..', '..', 'data');
const DATA_FILE = join(DATA_DIR, 'db.json');

const EMPTY_STATE = {
  accounts: [],
  tenants: [],
  rooms: [],
  contracts: [],
  invoices: [],
  payments: [],
  maintenanceRequests: [],
};

const RELATIONS = {
  accounts: {},
  tenants: { accountId: { collection: 'accounts' } },
  rooms: {},
  contracts: {
    tenantId: { collection: 'tenants' },
    roomId: { collection: 'rooms' },
  },
  invoices: {
    tenantId: { collection: 'tenants' },
    roomId: { collection: 'rooms' },
    contractId: { collection: 'contracts' },
  },
  payments: {
    invoiceId: { collection: 'invoices' },
    tenantId: { collection: 'tenants' },
    confirmedBy: { collection: 'accounts' },
  },
  maintenanceRequests: {
    tenantId: { collection: 'tenants' },
    roomId: { collection: 'rooms' },
  },
};

let state = null;
let loadPromise = null;
let writeChain = Promise.resolve();

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function makeEmptyState() {
  return clone(EMPTY_STATE);
}

async function loadState() {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await readFile(DATA_FILE, 'utf8');
    return { ...makeEmptyState(), ...JSON.parse(raw) };
  } catch {
    return makeEmptyState();
  }
}

async function ensureState() {
  if (state) {
    return state;
  }
  if (!loadPromise) {
    loadPromise = loadState().then((loaded) => {
      state = loaded;
      return state;
    });
  }
  return loadPromise;
}

async function persistState() {
  await ensureState();
  const tmpFile = `${DATA_FILE}.tmp`;
  await writeFile(tmpFile, JSON.stringify(state, null, 2), 'utf8');
  await rename(tmpFile, DATA_FILE);
}

async function queueWrite(task) {
  const next = writeChain.then(async () => {
    await ensureState();
    const result = await task();
    await persistState();
    return result;
  });

  writeChain = next.catch(() => {});
  return next;
}

function getCollectionState(name) {
  if (!state) {
    throw new Error('Store not initialized');
  }
  return state[name];
}

function getByPath(doc, path) {
  return path.split('.').reduce((value, key) => {
    if (value == null) {
      return undefined;
    }
    return value[key];
  }, doc);
}

function normalizeValue(value) {
  if (value === null || value === undefined) {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'object') {
    if (value._id !== undefined) {
      return String(value._id);
    }
    return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, normalizeValue(entry)]));
  }
  return value;
}

function matchesCondition(actual, condition) {
  if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
    if ('$in' in condition) {
      return condition.$in.map(String).includes(String(actual));
    }
    if ('$nin' in condition) {
      return !condition.$nin.map(String).includes(String(actual));
    }
    if ('$ne' in condition) {
      return String(actual) !== String(condition.$ne);
    }
    if ('$exists' in condition) {
      const exists = actual !== undefined && actual !== null;
      return condition.$exists ? exists : !exists;
    }
  }
  return String(actual) === String(condition);
}

function matchesFilter(doc, filter = {}) {
  return Object.entries(filter).every(([key, value]) => {
    if (key === '$or') {
      return Array.isArray(value) && value.some((item) => matchesFilter(doc, item));
    }
    const actual = getByPath(doc, key);
    return matchesCondition(actual, value);
  });
}

function applySort(docs, sortSpec = {}) {
  const entries = Object.entries(sortSpec);
  if (entries.length === 0) {
    return docs;
  }
  return [...docs].sort((left, right) => {
    for (const [field, direction] of entries) {
      const leftValue = getByPath(left, field);
      const rightValue = getByPath(right, field);
      if (String(leftValue) === String(rightValue)) {
        continue;
      }
      const result = String(leftValue) < String(rightValue) ? -1 : 1;
      return direction < 0 ? -result : result;
    }
    return 0;
  });
}

function applySelect(doc, select) {
  if (!select) {
    return clone(doc);
  }
  const fields = Array.isArray(select)
    ? select
    : String(select)
      .split(/\s+/)
      .map((field) => field.trim())
      .filter(Boolean);
  const allowed = new Set([...fields, '_id']);
  return Object.fromEntries(Object.entries(doc).filter(([key]) => allowed.has(key)));
}

function getRelatedCollectionName(collectionName, path) {
  return RELATIONS[collectionName]?.[path]?.collection || null;
}

function populateDocument(collectionName, doc, population = []) {
  let current = clone(doc);
  for (const spec of population) {
    const path = spec.path;
    const relationCollection = getRelatedCollectionName(collectionName, path);
    if (!relationCollection) {
      continue;
    }
    const rawValue = current[path];
    if (rawValue === null || rawValue === undefined) {
      continue;
    }
    const related = state[relationCollection].find((item) => String(item._id) === String(rawValue));
    current[path] = related ? applySelect(related, spec.select) : null;
  }
  return current;
}

function hydrate(collectionName, rawDoc) {
  const doc = clone(rawDoc);
  Object.defineProperties(doc, {
    toObject: {
      enumerable: false,
      value: () => clone(doc),
    },
    save: {
      enumerable: false,
      value: async () => queueWrite(async () => {
        const collection = getCollectionState(collectionName);
        const index = collection.findIndex((item) => String(item._id) === String(doc._id));
        if (index === -1) {
          throw new Error('Document not found');
        }
        const updated = {
          ...clone(doc),
          _id: String(doc._id),
          updatedAt: new Date().toISOString(),
        };
        collection[index] = normalizeValue(updated);
        return hydrate(collectionName, collection[index]);
      }),
    },
    populate: {
      enumerable: false,
      value: async (path, select) => {
        const relationCollection = getRelatedCollectionName(collectionName, path);
        if (!relationCollection) {
          return hydrate(collectionName, doc);
        }
        const populated = populateDocument(collectionName, doc, [{ path, select }]);
        return hydrate(collectionName, populated);
      },
    },
  });
  return doc;
}

class Query {
  constructor(collectionName, filter = {}, single = false) {
    this.collectionName = collectionName;
    this.filter = filter;
    this.single = single;
    this.sortSpec = {};
    this.skipValue = 0;
    this.limitValue = null;
    this.populateSpecs = [];
    this.shouldLean = false;
  }

  sort(sortSpec) {
    this.sortSpec = sortSpec || {};
    return this;
  }

  skip(value) {
    this.skipValue = Number(value) || 0;
    return this;
  }

  limit(value) {
    this.limitValue = Number(value);
    return this;
  }

  populate(path, select) {
    this.populateSpecs.push({ path, select });
    return this;
  }

  lean() {
    this.shouldLean = true;
    return this;
  }

  async exec() {
    await ensureState();
    let docs = getCollectionState(this.collectionName).filter((doc) => matchesFilter(doc, this.filter));
    docs = applySort(docs, this.sortSpec);
    if (this.skipValue > 0) {
      docs = docs.slice(this.skipValue);
    }
    if (this.limitValue !== null && this.limitValue !== undefined) {
      docs = docs.slice(0, this.limitValue);
    }
    if (this.populateSpecs.length > 0) {
      docs = docs.map((doc) => populateDocument(this.collectionName, doc, this.populateSpecs));
    }
    if (this.single) {
      const first = docs[0] || null;
      if (!first) {
        return null;
      }
      return clone(first);
    }
    return docs.map(clone);
  }

  then(resolve, reject) {
    return this.exec().then(resolve, reject);
  }

  catch(reject) {
    return this.exec().catch(reject);
  }
}

function buildDocument(collectionName, input) {
  const now = new Date().toISOString();
  const raw = normalizeValue(input);
  return {
    ...raw,
    _id: raw._id ? String(raw._id) : randomUUID(),
    createdAt: raw.createdAt || now,
    updatedAt: raw.updatedAt || now,
  };
}

function getCollectionApi(collectionName) {
  return {
    async create(input) {
      return queueWrite(async () => {
        await ensureState();
        const entries = Array.isArray(input) ? input : [input];
        const created = entries.map((item) => {
          const doc = buildDocument(collectionName, item);
          getCollectionState(collectionName).push(doc);
          return clone(doc);
        });
        return Array.isArray(input) ? created : created[0];
      });
    },
    find(filter = {}) {
      return new Query(collectionName, filter, false);
    },
    findOne(filter = {}) {
      return new Query(collectionName, filter, true);
    },
    findById(id) {
      return new Query(collectionName, { _id: String(id) }, true);
    },
    async countDocuments(filter = {}) {
      await ensureState();
      return getCollectionState(collectionName).filter((doc) => matchesFilter(doc, filter)).length;
    },
    async exists(filter = {}) {
      await ensureState();
      const doc = getCollectionState(collectionName).find((item) => matchesFilter(item, filter));
      return doc ? { _id: doc._id } : null;
    },
    async deleteMany(filter = {}) {
      return queueWrite(async () => {
        await ensureState();
        const collection = getCollectionState(collectionName);
        const before = collection.length;
        state[collectionName] = collection.filter((doc) => !matchesFilter(doc, filter));
        return { acknowledged: true, deletedCount: before - state[collectionName].length };
      });
    },
    async findByIdAndDelete(id) {
      return queueWrite(async () => {
        await ensureState();
        const collection = getCollectionState(collectionName);
        const index = collection.findIndex((item) => String(item._id) === String(id));
        if (index === -1) {
          return null;
        }
        const [removed] = collection.splice(index, 1);
        return clone(removed);
      });
    },
    async findByIdAndUpdate(id, update = {}) {
      return queueWrite(async () => {
        await ensureState();
        const collection = getCollectionState(collectionName);
        const index = collection.findIndex((item) => String(item._id) === String(id));
        if (index === -1) {
          return null;
        }
        const current = collection[index];
        const changes = update.$set ? update.$set : update;
        const next = {
          ...current,
          ...normalizeValue(changes),
          updatedAt: new Date().toISOString(),
        };
        collection[index] = next;
        return clone(next);
      });
    },
    async findOneAndUpdate(filter = {}, update = {}) {
      return queueWrite(async () => {
        await ensureState();
        const collection = getCollectionState(collectionName);
        const index = collection.findIndex((item) => matchesFilter(item, filter));
        if (index === -1) {
          return null;
        }
        const current = collection[index];
        const changes = update.$set ? update.$set : update;
        const next = {
          ...current,
          ...normalizeValue(changes),
          updatedAt: new Date().toISOString(),
        };
        collection[index] = next;
        return clone(next);
      });
    },
  };
}

export async function initStore() {
  await ensureState();
  return state;
}

export async function resetStore() {
  await queueWrite(async () => {
    state = makeEmptyState();
  });
  return state;
}

export async function closeStore() {
  state = null;
  loadPromise = null;
}

export function createRepository(collectionName) {
  return getCollectionApi(collectionName);
}
