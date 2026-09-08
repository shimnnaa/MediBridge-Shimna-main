const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DB_DIR, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Generate 24-character hex ID (MongoDB ObjectId format)
const generateId = () => {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
};

// Seed initial database state if not present
const getInitialData = () => {
  const salt = bcrypt.genSaltSync(10);
  const adminPass = bcrypt.hashSync('admin123', salt);
  const donorPass = bcrypt.hashSync('donor123', salt);
  const ngoPass = bcrypt.hashSync('ngo123', salt);

  const futureDate1 = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000); // 6 months
  const futureDate2 = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
  const futureDate3 = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);  // 3 months

  const donorId = '66a000000000000000000002';
  const ngoId = '66a000000000000000000003';
  const medId1 = '66b000000000000000000001';
  const medId2 = '66b000000000000000000002';
  const medId3 = '66b000000000000000000003';

  return {
    users: [
      {
        _id: '66a000000000000000000001',
        name: 'System Administrator',
        email: 'admin@medibridge.com',
        password: adminPass,
        role: 'admin',
        status: 'active',
        phone: '1234567890',
        address: 'MediBridge Central Headquarters',
        createdAt: new Date().toISOString(),
      },
      {
        _id: donorId,
        name: 'Dr. Rahul Sharma',
        email: 'donor@medibridge.com',
        password: donorPass,
        role: 'donor',
        status: 'active',
        phone: '9876543210',
        address: '45 Marine Drive, Mumbai',
        createdAt: new Date().toISOString(),
      },
      {
        _id: ngoId,
        name: 'Ananya Verma (NGO Lead)',
        email: 'ngo@medibridge.com',
        password: ngoPass,
        role: 'beneficiary',
        status: 'approved',
        organizationName: 'Hope Care Rural Health Mission',
        registrationNumber: 'NGO-IND-9842',
        website: 'https://hopecare.org',
        phone: '9123456780',
        address: '12 Relief Road, Bangalore',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '66a000000000000000000004',
        name: 'Siddharth Rao (Community Aid)',
        email: 'pending_ngo@medibridge.com',
        password: ngoPass,
        role: 'beneficiary',
        status: 'pending',
        organizationName: 'Seva Care Foundation',
        registrationNumber: 'NGO-SEVA-1102',
        website: 'https://sevacare.org',
        phone: '9888776655',
        address: '78 Public Health Avenue, Kochi',
        createdAt: new Date().toISOString(),
      },
    ],
    medicines: [
      {
        _id: medId1,
        name: 'Paracetamol 500mg Tablets',
        manufacturer: 'GSK Pharmaceuticals',
        batchNumber: 'BT-9081',
        expiryDate: futureDate2.toISOString(),
        quantity: 50,
        originalQuantity: 50,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'approved',
        verificationDetails: {
          verifiedBy: '66a000000000000000000001',
          verifiedAt: new Date().toISOString(),
          remarks: 'Batch verified. Packaging sealed and expiry verified.',
        },
        description: 'Blister pack of 50 tablets. Store in cool, dry place.',
        createdAt: new Date().toISOString(),
      },
      {
        _id: medId2,
        name: 'Amoxicillin 250mg Capsules',
        manufacturer: 'Pfizer Health',
        batchNumber: 'AMX-4421',
        expiryDate: futureDate1.toISOString(),
        quantity: 30,
        originalQuantity: 30,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'approved',
        verificationDetails: {
          verifiedBy: '66a000000000000000000001',
          verifiedAt: new Date().toISOString(),
          remarks: 'Approved for clinical redistribution.',
        },
        description: 'Unopened box of 30 antibiotic capsules.',
        createdAt: new Date().toISOString(),
      },
      {
        _id: medId3,
        name: 'Cetirizine 10mg Allergy Strips',
        manufacturer: 'Cipla Ltd',
        batchNumber: 'CTZ-1022',
        expiryDate: futureDate3.toISOString(),
        quantity: 25,
        originalQuantity: 25,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'approved',
        description: 'Sealed strips, unexpired allergy relief medicine.',
        createdAt: new Date().toISOString(),
        verificationDetails: {
          verifiedBy: '66a000000000000000000001',
          verifiedAt: new Date().toISOString(),
          remarks: 'Approved for distribution.',
        },
      },
      {
        _id: '66b000000000000000000010',
        name: 'Metformin 500mg (Glycomet)',
        manufacturer: 'USV Pvt Ltd',
        batchNumber: 'GLY-8841',
        expiryDate: futureDate2.toISOString(),
        quantity: 60,
        originalQuantity: 60,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'approved',
        description: 'Antidiabetic oral medication for type 2 diabetes management.',
        createdAt: new Date().toISOString(),
        verificationDetails: {
          verifiedBy: '66a000000000000000000001',
          verifiedAt: new Date().toISOString(),
          remarks: 'Blister packaging sealed and authentic.',
        },
      },
      {
        _id: '66b000000000000000000011',
        name: 'Azithromycin 500mg (Azee 500)',
        manufacturer: 'Cipla Ltd',
        batchNumber: 'AZI-3012',
        expiryDate: futureDate1.toISOString(),
        quantity: 40,
        originalQuantity: 40,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'approved',
        description: 'Broad spectrum macrolide antibiotic strip. Store below 25°C.',
        createdAt: new Date().toISOString(),
        verificationDetails: {
          verifiedBy: '66a000000000000000000001',
          verifiedAt: new Date().toISOString(),
          remarks: 'Batch and expiry verified.',
        },
      },
      {
        _id: '66b000000000000000000012',
        name: 'Pantoprazole 40mg (Pan 40)',
        manufacturer: 'Alkem Laboratories',
        batchNumber: 'PAN-9021',
        expiryDate: futureDate2.toISOString(),
        quantity: 50,
        originalQuantity: 50,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'approved',
        description: 'Proton pump inhibitor for acidity, GERD, and peptic ulcer relief.',
        createdAt: new Date().toISOString(),
        verificationDetails: {
          verifiedBy: '66a000000000000000000001',
          verifiedAt: new Date().toISOString(),
          remarks: 'Authentic blister strips verified.',
        },
      },
      {
        _id: '66b000000000000000000013',
        name: 'Amlodipine 5mg (Amlong)',
        manufacturer: 'Micro Labs',
        batchNumber: 'AML-1192',
        expiryDate: futureDate1.toISOString(),
        quantity: 45,
        originalQuantity: 45,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'approved',
        description: 'Calcium channel blocker prescribed for hypertension & angina.',
        createdAt: new Date().toISOString(),
        verificationDetails: {
          verifiedBy: '66a000000000000000000001',
          verifiedAt: new Date().toISOString(),
          remarks: 'Approved for NGO requests.',
        },
      },
      {
        _id: '66b000000000000000000014',
        name: 'Telmisartan 40mg (Telma 40)',
        manufacturer: 'Glenmark Pharmaceuticals',
        batchNumber: 'TEL-4431',
        expiryDate: futureDate2.toISOString(),
        quantity: 30,
        originalQuantity: 30,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'approved',
        description: 'Angiotensin II receptor antagonist for blood pressure control.',
        createdAt: new Date().toISOString(),
        verificationDetails: {
          verifiedBy: '66a000000000000000000001',
          verifiedAt: new Date().toISOString(),
          remarks: 'Inspected and approved.',
        },
      },
      {
        _id: '66b000000000000000000018',
        name: 'Dolo 650mg Paracetamol',
        manufacturer: 'Micro Labs',
        batchNumber: 'DLO-1029',
        expiryDate: futureDate2.toISOString(),
        quantity: 100,
        originalQuantity: 100,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'approved',
        description: 'High-strength antipyretic and analgesic for pain and fever relief.',
        createdAt: new Date().toISOString(),
        verificationDetails: {
          verifiedBy: '66a000000000000000000001',
          verifiedAt: new Date().toISOString(),
          remarks: 'Approved and listed in stock.',
        },
      },
      {
        _id: '66b000000000000000000019',
        name: 'Ciprofloxacin 500mg (Ciplox 500)',
        manufacturer: 'Cipla Ltd',
        batchNumber: 'CIP-8819',
        expiryDate: futureDate1.toISOString(),
        quantity: 20,
        originalQuantity: 20,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'pending',
        description: 'Fluoroquinolone antibiotic for bacterial infections.',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '66b000000000000000000020',
        name: 'Vitamin D3 60,000 IU (Calcirol)',
        manufacturer: 'Cadila Healthcare',
        batchNumber: 'VTD-9943',
        expiryDate: futureDate2.toISOString(),
        quantity: 80,
        originalQuantity: 80,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'pending',
        description: 'High potency Cholecalciferol capsules for bone health and immunity.',
        createdAt: new Date().toISOString(),
      },
      {
        _id: '66b000000000000000000021',
        name: 'Asthalin Inhaler 100mcg (Salbutamol)',
        manufacturer: 'Cipla Ltd',
        batchNumber: 'AST-3321',
        expiryDate: futureDate1.toISOString(),
        quantity: 15,
        originalQuantity: 15,
        donor: donorId,
        condition: 'Sealed & Unopened',
        status: 'approved',
        description: 'Metered dose inhaler for quick relief from bronchospasm and asthma.',
        createdAt: new Date().toISOString(),
        verificationDetails: {
          verifiedBy: '66a000000000000000000001',
          verifiedAt: new Date().toISOString(),
          remarks: 'Inhaler sealed in original blister wrap.',
        },
      },
    ],
    requests: [
      {
        _id: '66c000000000000000000001',
        medicine: medId1,
        requester: ngoId,
        quantity: 10,
        status: 'pending',
        reason: 'Free distribution camp for seasonal fever patients in rural village center.',
        adminRemarks: '',
        requestDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
};

// Read Database
const readData = () => {
  try {
    if (!fs.existsSync(DB_FILE)) {
      const init = getInitialData();
      fs.writeFileSync(DB_FILE, JSON.stringify(init, null, 2));
      return init;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading local db:', err);
    return getInitialData();
  }
};

// Write Database
const writeData = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error writing local db:', err);
  }
};

// Ensure DB file exists
if (!fs.existsSync(DB_FILE)) {
  writeData(getInitialData());
}

// Wrap single document to provide Mongoose-like instance methods (.save, .matchPassword)
const wrapDoc = (doc, collectionName) => {
  if (!doc) return null;
  const wrapped = { ...doc };

  wrapped.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  };

  wrapped.save = async function () {
    const data = readData();
    const list = data[collectionName] || [];
    const index = list.findIndex((item) => String(item._id) === String(this._id));

    // Handle password hashing if changed
    if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }

    const { save, matchPassword, ...cleanDoc } = this;

    // Normalize populated fields before persisting so IDs remain consistent
    if (cleanDoc.medicine && typeof cleanDoc.medicine === 'object' && cleanDoc.medicine._id) {
      cleanDoc.medicine = String(cleanDoc.medicine._id);
    }
    if (cleanDoc.requester && typeof cleanDoc.requester === 'object' && cleanDoc.requester._id) {
      cleanDoc.requester = String(cleanDoc.requester._id);
    }
    if (cleanDoc.donor && typeof cleanDoc.donor === 'object' && cleanDoc.donor._id) {
      cleanDoc.donor = String(cleanDoc.donor._id);
    }

    if (index !== -1) {
      list[index] = cleanDoc;
    } else {
      list.push(cleanDoc);
    }
    data[collectionName] = list;
    writeData(data);
    return wrapDoc(cleanDoc, collectionName);
  };

  return wrapped;
};

// Populate helper
const populateDoc = (doc, data) => {
  if (!doc) return doc;
  const populated = { ...doc };

  // Populate donor in medicine
  if (populated.donor && typeof populated.donor === 'string') {
    const donorObj = (data.users || []).find((u) => String(u._id) === String(populated.donor));
    if (donorObj) {
      const { password, ...safeDonor } = donorObj;
      populated.donor = safeDonor;
    }
  }

  // Populate medicine and requester in request
  if (populated.requester && typeof populated.requester === 'string') {
    const reqObj = (data.users || []).find((u) => String(u._id) === String(populated.requester));
    if (reqObj) {
      const { password, ...safeReq } = reqObj;
      populated.requester = safeReq;
    }
  }

  if (populated.medicine && typeof populated.medicine === 'string') {
    const medObj = (data.medicines || []).find((m) => String(m._id) === String(populated.medicine));
    if (medObj) {
      populated.medicine = wrapDoc(populateDoc(medObj, data), 'medicines');
    }
  } else if (populated.medicine && typeof populated.medicine === 'object') {
    populated.medicine = wrapDoc(populateDoc(populated.medicine, data), 'medicines');
  }

  return populated;
};

// Filter helper
const matchesQuery = (item, query = {}) => {
  if (!query || Object.keys(query).length === 0) return true;

  if (query.$or && Array.isArray(query.$or)) {
    return query.$or.some((subQuery) => matchesQuery(item, subQuery));
  }

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined) continue;

    if (key === 'quantity' && typeof value === 'object') {
      if (value.$gt !== undefined && !(item.quantity > value.$gt)) return false;
      if (value.$gte !== undefined && !(item.quantity >= value.$gte)) return false;
      continue;
    }

    if (key === 'expiryDate' && typeof value === 'object') {
      const itemExpiry = new Date(item.expiryDate);
      if (value.$gt !== undefined && !(itemExpiry > new Date(value.$gt))) return false;
      if (value.$gte !== undefined && !(itemExpiry >= new Date(value.$gte))) return false;
      continue;
    }

    if (key === 'name' && typeof value === 'object' && value.$regex) {
      const regex = new RegExp(value.$regex, value.$options || 'i');
      if (!regex.test(item.name)) return false;
      continue;
    }

    if (String(item[key]) !== String(value)) {
      return false;
    }
  }
  return true;
};

// Query Chain Builder
const createQueryChain = (results, collectionName, data) => {
  const chain = {
    _results: results,
    populate: function () {
      this._results = this._results.map((item) => populateDoc(item, data));
      return this;
    },
    sort: function (sortObj) {
      if (!sortObj) return this;
      const [field, direction] = Object.entries(sortObj)[0] || [];
      if (field) {
        const dir = direction === -1 ? -1 : 1;
        this._results.sort((a, b) => {
          if (a[field] < b[field]) return -1 * dir;
          if (a[field] > b[field]) return 1 * dir;
          return 0;
        });
      }
      return this;
    },
    select: function () {
      return this;
    },
    then: function (resolve, reject) {
      return Promise.resolve(this._results.map((r) => wrapDoc(r, collectionName))).then(resolve, reject);
    },
  };
  return chain;
};

// Model Factory for In-Memory / File Database
const createLocalModel = (collectionName) => {
  return {
    find: function (query = {}) {
      const data = readData();
      const list = (data[collectionName] || []).filter((item) => matchesQuery(item, query));
      return createQueryChain(list, collectionName, data);
    },

    findOne: function (query = {}) {
      const data = readData();
      const item = (data[collectionName] || []).find((it) => matchesQuery(it, query));
      
      const chain = {
        _item: item,
        select: function () {
          return this;
        },
        populate: function () {
          if (this._item) {
            this._item = populateDoc(this._item, data);
          }
          return this;
        },
        then: function (resolve, reject) {
          return Promise.resolve(wrapDoc(this._item, collectionName)).then(resolve, reject);
        },
      };
      return chain;
    },

    findById: function (id) {
      return this.findOne({ _id: String(id) });
    },

    countDocuments: async function (query = {}) {
      const data = readData();
      return (data[collectionName] || []).filter((item) => matchesQuery(item, query)).length;
    },

    create: async function (docData) {
      const data = readData();
      const list = data[collectionName] || [];

      let defaultStatus = 'approved';
      if (collectionName === 'medicines' || collectionName === 'requests') {
        defaultStatus = 'pending';
      }

      let newDoc = {
        _id: generateId(),
        status: docData.status || defaultStatus,
        ...docData,
        createdAt: docData.createdAt || new Date().toISOString(),
      };

      if (collectionName === 'requests' && !newDoc.requestDate) {
        newDoc.requestDate = newDoc.createdAt;
      }

      if (newDoc.password) {
        const salt = await bcrypt.genSalt(10);
        newDoc.password = await bcrypt.hash(newDoc.password, salt);
      }

      list.push(newDoc);
      data[collectionName] = list;
      writeData(data);
      return wrapDoc(newDoc, collectionName);
    },
  };
};

module.exports = {
  LocalUser: createLocalModel('users'),
  LocalMedicine: createLocalModel('medicines'),
  LocalRequest: createLocalModel('requests'),
  readData,
  writeData,
};
