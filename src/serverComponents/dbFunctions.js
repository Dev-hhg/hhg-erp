'use server';
import { Pool } from 'pg';
import 'dotenv/config';

//*****Old runquery function*****
async function runQuery(query, values) {
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString: connectionString,
  });

  try {
    const client = await pool.connect();
    const result = await client.query(query, values);
    client.release();
    console.log('Query executed successfully:\n', query, values);
    return result.rows;
  } catch (err) {
    console.error('Error executing query:', err);
    throw err;
  }
}

// async function runQuery(query, values) {
//   const ec2ProxyUrl = process.env.EC2_PROXY_URL; // Configure this in your .env file

//   try {
//     const response = await fetch(`${ec2ProxyUrl}/query`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ query, values }),
//     });

//     if (!response.ok) {
//       throw new Error(`Failed to execute query: ${response.statusText}`);
//     }

//     const result = await response.json();
//     console.log("Query executed successfully:\n", query, values);
//     return result;
//   } catch (err) {
//     console.error("Error executing query:", err);
//     throw err;
//   }
// }

async function updateEntryData({
  vendor,
  date,
  newData,
  refund,
  transportDetails: { transporterName, vehicleNo },
}) {
  let updateQuery = '';
  console.log(vendor, date, newData);
  const data = await getEntriesByDateVendor({ date, vendor });
  const refundData = await getRefundByDateVendor({ date, vendor });
  const updates = {};
  data.sort((a, b) => a.transactionid > b.transactionid);
  newData.sort((a, b) => a.transactionid > b.transactionid);
  data.forEach((entry, i) => {
    if (Number(entry.transportrate) !== Number(newData[i].transportrate))
      updates[entry.transactionid] = newData[i].transportrate;
  });
  if (Object.keys(updates).length !== 0) {
    updateQuery += 'UPDATE ENTRY SET transportrate = CASE ';

    for (const transactionid in updates) {
      updateQuery += `WHEN transactionid = ${transactionid} THEN ${updates[transactionid]} `;
    }
    updateQuery += 'ELSE transportrate END;\n';
  }
  if (refundData.length === 0) {
    updateQuery += `INSERT INTO Refund (vendorName, date, value, transporterName, vehicleNo) VALUES ('${sanitizeString(
      vendor
    )}', '${date}', ${Number(refund)}, '${sanitizeString(
      transporterName
    )}', '${vehicleNo}')`;
  } else if (refundData.length !== 0) {
    updateQuery += `UPDATE Refund SET value = ${Number(
      refund
    )}, transporterName = '${sanitizeString(
      transporterName
    )}', vehicleNo = '${vehicleNo}' WHERE date = '${date}' AND vendorName = '${sanitizeString(
      vendor
    )}';`;
  }

  runQuery(updateQuery);
}

// async function updateVmData({ vendor, date, records, refund }) {
// 	let updateQuery = "";
// 	console.log(vendor, date, records, refund);
// 	const data = await getEntriesVmDataByDateVendor({ date, vendor });
// 	data.sort((a, b) => a.transactionid > b.transactionid);
// 	records.sort((a, b) => a.transactionid > b.transactionid);
// 	const refundData = await getRefundByDateVendor({ date, vendor });
// 	console.log("pay", data);
// 	if (data[0].payable != null) {
// 		const updates = {};
// 		data.forEach(({ transactionid, payable, commision, rate }, i) => {
// 			let flag = false;
// 			const update = {};
// 			if (Number(payable) !== Number(records[i].payable)) {
// 				flag = true;
// 				update.payable = records[i].payable;
// 			}
// 			if (Number(commision) !== Number(records[i].commision)) {
// 				flag = true;
// 				update.commision = records[i].commision;
// 			}
// 			if (Number(rate) !== Number(records[i].rate)) {
// 				flag = true;
// 				update.rate = records[i].rate;
// 			}
// 			if (flag) updates[transactionid] = update;
// 		});
// 		const tempQuery = await updateVMData(updates);
// 		updateQuery += tempQuery;
// 	} else {
// 		const temp = await addVmData(records);
// 		updateQuery += temp;
// 	}
// 	if (refundData.length === 0) {
// 		// updateQuery += `\nINSERT INTO Refund (vendorName, date, value, transporterName, vehicleNo, vmdata) VALUES ('${sanitizeString(
// 		//   vendor
// 		// )}', '${date}', ${Number(refund)}, '', '',true)`;
// 		throw new Error("Refund data not present for the date and vendor");
// 		console.log("refundData IDK", refundData);
// 	} else if (refundData.length !== 0) {
// 		console.log("heloo", refundData[0].value, refund);
// 		// update vmdata only if
// 		updateQuery += `\nUPDATE Refund SET  vmdata = true, value = ${Number(
// 			refund
// 		)} WHERE date = '${date}' AND vendorName = '${sanitizeString(vendor)}';`;
// 	}
// 	if (updateQuery !== "") {
// 		await runQuery(updateQuery);
// 		return { message: "Updated Successfully" };
// 	}
// 	return { message: "Nothing to update" };
// }

async function updateVmData({ vendor, date, updates, additions, refund }) {
  let updateQuery = '';
  console.log(vendor, date, updates, additions, refund);
  try {
    // Handle updates
    if (updates.length > 0) {
      // Construct update queries for each updated record
      updates.forEach((record) => {
        updateQuery += `UPDATE vendorMemo SET payable = ${record.payable}, commision = ${record.commision}, rate = ${record.rate} WHERE entryid = ${record.transactionid};\n`;
      });
    }

    // Handle additions
    if (additions.length > 0) {
      // Construct insert query for new records
      const insertValues = additions
        .map(
          (record) =>
            `('${record.transactionid}', ${record.payable}, ${record.rate}, ${record.commision})`
        )
        .join(', ');
      updateQuery += `INSERT INTO vendorMemo (entryid, payable, rate, commision) VALUES ${insertValues};\n`;
    }

    // Update refund data
    const refundData = await getRefundByDateVendor({ date, vendor });

    updateQuery += `\nUPDATE Refund SET  vmdata = true WHERE date = '${date}' AND vendorName = '${sanitizeString(vendor)}';`;

    console.log('refundData', refundData);
    if (refundData[0]?.value === refund) {
      // If the refund value is the same as the existing value, do nothing
    } else {
      updateQuery += `\nUPDATE Refund SET  vmdata = true, value = ${Number(refund)} WHERE date = '${date}' AND vendorName = '${sanitizeString(vendor)}';`;
    }

    // Execute the update query if necessary
    if (updateQuery !== '') {
      await runQuery(updateQuery);
      return { message: 'Updated Successfully' };
    } else {
      return { message: 'Nothing to update' };
    }
  } catch (error) {
    throw new Error(`Error updating data: ${error.message}`);
  }
}

async function updateTransportRate(updates) {
  let updateQuery = 'UPDATE ENTRY SET transportrate = CASE ';
  for (const transactionid in updates) {
    updateQuery += `WHEN transactionid = ${transactionid} THEN ${updates[transactionid]} `;
  }
  updateQuery += 'ELSE transportrate END;';

  await runQuery(updateQuery);
}

async function getTodayEntries(date) {
  const getDataQuery = `SELECT * FROM Entry LEFT OUTER JOIN FARMERS ON ENTRY.farmerid = FARMERS.farmerid WHERE date =$1;`;
  return await runQuery(getDataQuery, [date]);
}

async function getEntriesByDateVendor({ date, vendor }) {
  const getDataQuery =
    'SELECT * FROM Entry LEFT OUTER JOIN FARMERS ON ENTRY.farmerid = FARMERS.farmerid WHERE date = $1 AND vendorName = $2 ORDER BY farmername ASC;';
  console.log(getDataQuery);

  return await runQuery(getDataQuery, [date, sanitizeString(vendor)]);
}

// if vendor is not present in the vendor table, add it
async function addVendor({ vendorName, mobileNumber, galanumber }) {
  const checkVendorQuery = `
	SELECT * FROM Vendor WHERE vendorName = $1;
	`;

  const values = [sanitizeString(vendorName)];

  const result = await runQuery(checkVendorQuery, values);

  if (result.length === 0) {
    const insertDataQuery = `
		INSERT INTO Vendor (vendorName, mobileNumber, galanumber)
		VALUES ($1, $2, $3)
		RETURNING *;
		`;

    const values = [
      sanitizeString(vendorName),
      mobileNumber,
      sanitizeString(galanumber),
    ];

    await runQuery(insertDataQuery, values);
  } else {
    console.log('vendor already present');
    return { error: 'Vendor Already Present' };
  }
}

async function getVendors() {
  const getDataQuery = `SELECT * FROM Vendor ORDER BY vendorpriority ASC ;`;
  return await runQuery(getDataQuery);
}

// Refund
async function addRefund({ vendor, date, value, transporterName, vehicleNo }) {
  const insertDataQuery = `
    INSERT INTO Refund (vendorName, date, value, transporterName, vehicleNo)
    VALUES ($1, $2, $3, $4, $5)
  `;

  const values = [
    sanitizeString(vendor),
    date,
    Number(value),
    sanitizeString(transporterName),
    vehicleNo,
  ];
  console.log(insertDataQuery, values);

  await runQuery(insertDataQuery, values);
}

async function getRefundByDateVendor({ date, vendor }) {
  const getDataQuery =
    'SELECT * FROM Refund WHERE date = $1 AND vendorName = $2;';

  return await runQuery(getDataQuery, [date, sanitizeString(vendor)]);
}
async function getRefundByVendor({ vendor, fromDate, toDate }) {
  const getDataQuery =
    'SELECT date, value FROM Refund WHERE  vendorName = $1 AND date >= $2 AND date <= $3 ;';

  return await runQuery(getDataQuery, [
    sanitizeString(vendor),
    fromDate,
    toDate,
  ]);
}

async function updateRefundByDateVendor({
  vendor,
  date,
  value,
  transporterName,
  vehicleNo,
}) {
  let updateDataQuery = `UPDATE Refund SET value = $1, transporterName = $2, vehicleNo = $3 WHERE date = $4 AND vendorName = $5;`;
  console.log(updateDataQuery);

  await runQuery(updateDataQuery, [
    Number(value),
    sanitizeString(transporterName),
    vehicleNo,
    date,
    sanitizeString(vendor),
  ]);
}
async function getFarmer({ farmerName }) {
  const getDataQuery = `SELECT * FROM Entry WHERE farmerName = $1;`;
  console.log(getDataQuery);
  return await runQuery(getDataQuery, [sanitizeString(farmerName)]);
}
// // fetch mobile number
// async function getMobileNumber({ farmerName }) {
// 	const getDataQuery = `SELECT DISTINCT mobileNumber, uid FROM Entry WHERE farmerName = $1;`;
// 	return await runQuery(getDataQuery, [sanitizeString(farmerName)]);
// }
// fetch farmer name
async function getFarmerUsingMobile({ mobileNumber }) {
  const getDataQuery = `SELECT DISTINCT farmerName FROM Entry WHERE mobileNumber = $1;`;
  return await runQuery(getDataQuery, [mobileNumber]);
}

// //search similar farmer
// async function searchFarmer({ farmerName }) {
// 	const getDataQuery = `SELECT DISTINCT farmerName FROM Entry WHERE farmerName LIKE '%${sanitizeString(
// 		farmerName
// 	)}%';`;
// 	console.log(getDataQuery);
// 	return await runQuery(getDataQuery);
// }

//vendor memo
async function addVmData(records) {
  const insertMemoValues = records
    .map(({ transactionid, payable, rate, commision }) => {
      return `(${Number(transactionid)}, ${Number(payable)}, ${Number(
        rate
      )}, ${Number(commision)})`;
    })
    .join(', ');

  const insertMemoQuery = `
    INSERT INTO vendorMemo (entryid, payable, rate, commision)
    VALUES ${insertMemoValues};
  `;

  return insertMemoQuery;
}

async function updateVMData(updates) {
  const updateQueries = [];
  for (const id in updates) {
    const updateCols = Object.entries(updates[id])
      .map(([col, val]) => `${col} = ${val}`)
      .join(', ');

    const subQuery = `UPDATE vendorMemo SET ${updateCols} WHERE entryid = ${id};`;
    updateQueries.push(subQuery);
  }

  const updateVendorMemoQuery = updateQueries.join('\n');

  return updateVendorMemoQuery;
}

async function getEntriesVmDataByDateVendor({ date, vendor }) {
  const getDataQuery = `SELECT transactionid, farmername, item, quantity, weight, payable, rate, commision FROM entry 
    LEFT OUTER JOIN vendormemo ON entry.transactionid = vendormemo.entryid LEFT OUTER JOIN FARMERS ON ENTRY.farmerid = FARMERS.farmerid WHERE date = $1 AND vendorname = $2 ORDER BY farmerName ASC; `;
  return await runQuery(getDataQuery, [date, sanitizeString(vendor)]);
}
async function getEntriesVmDataByVendor({ vendor, fromDate, toDate }) {
  const getDataQuery = `SELECT date,transactionid, payable, commision FROM entry 
    LEFT OUTER JOIN vendormemo ON entry.transactionid = vendormemo.entryid
    WHERE  vendorname = $1 AND date >= $2 AND date <= $3 ;`;
  return await runQuery(getDataQuery, [
    sanitizeString(vendor),
    fromDate,
    toDate,
  ]);
}

async function getLastFewEntries({ date }) {
  const getDataQuery =
    'SELECT uid, farmername, item, vendorname, quantity FROM ENTRY LEFT OUTER JOIN FARMERS ON ENTRY.farmerid = FARMERS.farmerid WHERE date = $1 ORDER BY transactionid desc LIMIT 5 ;';
  return await runQuery(getDataQuery, [date]);
}

async function updatePaidStatus({
  update,
  today,
  paymentDescription,
  paymentMode,
  paidBy,
}) {
  try {
    // perform all the updates in a single query to avoid multiple connections and same timestamp should be registered for all the updates.
    // prepraing the query check if escription has any escape characters like ' or "
    paymentDescription = paymentDescription.replace(/'/g, "''");
    let updateQuery = '';
    for (const id in update) {
      updateQuery += `UPDATE vendormemo SET paid = ${update[id]}, paiddate = '${today}', paymenttype = '${paymentMode}', paidby = '${paidBy}', description = '${paymentDescription}' WHERE entryid = ${id};`;
    }
    return await runQuery(updateQuery);
  } catch (err) {
    console.log(err);
    throw err;
  }
}

// Add payment entry
async function addPayment({ vendorName, amount, date, paymentMode }) {
  const insertDataQuery = `
    INSERT INTO Payment (vendorName, received, date, modeofpayment)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;

  const values = [
    sanitizeString(vendorName),
    Number(amount),
    date,
    sanitizeString(paymentMode),
  ];

  await runQuery(insertDataQuery, values);
}

async function getPaymentDetails({ vendor, fromDate, toDate }) {
  const getDataQuery = `SELECT received, date, modeofpayment FROM payment WHERE vendorName = $1 AND date >= $2 AND date <= $3;`;

  return runQuery(getDataQuery, [sanitizeString(vendor), fromDate, toDate]);
}

function sanitizeString(str) {
  try {
    return str.trim().toLowerCase().replace(/\s+/g, ' ');
  } catch (err) {
    console.log(str);
  }
}
async function deleteEntry({ transactionId }) {
  try {
    await runQuery('BEGIN');
    const deleteDataQuery1 = `
		DELETE FROM vendormemo 
		WHERE entryid = $1
		RETURNING *;
	`;
    const deletedEntry1 = await runQuery(deleteDataQuery1, [transactionId]);
    console.log('VendorMemo Deleted', deletedEntry1);

    const deleteDataQuery = `
		DELETE FROM Entry 
		WHERE transactionId = $1
		RETURNING *;
	`;

    const deletedEntry = await runQuery(deleteDataQuery, [transactionId]);

    // Check if deletedEntry1[0] exists and set default values if not
    const rate = deletedEntry1[0]?.rate || 0;
    const commission = deletedEntry1[0]?.commision || 0;
    const payable = deletedEntry1[0]?.payable || 0;
    const paid = deletedEntry1[0]?.paid || false;
    const paidDate = deletedEntry1[0]?.paiddate || null;

    // add to deleted entries table
    const insertDataQuery = `
    INSERT INTO deletedentry (transactionId, date, vendorName, item, quantity, weight, farmerid, rate, commision, payable, paid, paiddate)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
  `;
    const values = [
      deletedEntry[0].transactionid,
      deletedEntry[0].date,
      deletedEntry[0].vendorname,
      deletedEntry[0].item,
      deletedEntry[0].quantity,
      deletedEntry[0].weight,
      deletedEntry[0].farmerid,
      Number(rate),
      Number(commission),
      Number(payable),
      paid,
      paidDate,
    ];
    await runQuery(insertDataQuery, values);
    await runQuery('COMMIT');
  } catch (err) {
    console.log('TRANSACTION FAILED', err);
    await runQuery('ROLLBACK');
  }
}

//update entry details
async function updateEntry({
  transactionId,
  farmerid,
  vendorName,
  item,
  quantity,
  weight,
}) {
  const updateDataQuery = `
		UPDATE Entry
		SET farmerid = $1, vendorName = $2, item = $3, quantity = $4, weight = $5, edited = $6, entrytime = NOW()
		WHERE transactionId = $7
		RETURNING *;
	`;

  const values = [
    farmerid,
    sanitizeString(vendorName),
    sanitizeString(item),
    Number(quantity),
    Number(weight),
    true,
    transactionId,
  ];

  await runQuery(updateDataQuery, values);
}

// async function getRecentEntries({ date }) {
// 	const getDataQuery = `SELECT * FROM Entry WHERE date = $1 ORDER BY transactionId DESC LIMIT 5;`;
// 	return await runQuery(getDataQuery, [date]);
// }
// get galanumber from vendor table
async function getGalaNumber({ vendorName }) {
  const getDataQuery = `SELECT galanumber FROM Vendor WHERE vendorName = $1;`;
  return await runQuery(getDataQuery, [sanitizeString(vendorName)]);
}

// get farmerid using uid
async function getFarmerid({ uid }) {
  const getDataQuery = `SELECT farmerid FROM farmers WHERE uid = $1;`;
  return await runQuery(getDataQuery, [uid]);
}

// getFarmerUsingUid
async function getFarmerUsingUid({ uid }) {
  const getidQuery = `SELECT farmerid FROM farmers WHERE uid = $1;`;
  const farmerid = await runQuery(getidQuery, [uid]);

  if (farmerid.length === 0) return [];
  else {
    const getDataQuery = `SELECT 
							Entry.farmerid, 
							transactionid as entryid,
							date, 
							vendorName, 
							quantity, 
							weight, 
							item, 
							farmers.farmerName, 
							farmers.mobileNumber, 
							farmers.uid,
							vendorMemo.payable, 
							vendorMemo.paid, 
							vendorMemo.paiddate
							FROM 
							Entry
							LEFT OUTER JOIN 
							vendorMemo ON Entry.transactionid = vendorMemo.entryid 
							LEFT OUTER JOIN 
							FARMERS ON ENTRY.farmerid = FARMERS.farmerid

							WHERE 
							Entry.farmerid = $1;

													`;
    const farmerData = await runQuery(getDataQuery, [farmerid[0].farmerid]);
    if (farmerData.length === 0) {
      const tempID = farmerid[0].farmerid;
      return [{ tempID }];
    } else {
      return farmerData;
    }
  }
}
// // getEntryUsingUid
// async function getEntryUsingUid({ uid }) {
// 	const getDataQuery = `SELECT * FROM Entry WHERE uid = $1;`;
// 	return await runQuery(getDataQuery, [uid]);
// }

// get advance data using farmerid
async function getAdvanceData({ farmerid }) {
  const getDataQuery = `SELECT * FROM farmerpayments WHERE farmerid = $1;`;
  return await runQuery(getDataQuery, [farmerid]);
}

//update uid of all the entries for particular farmer
async function updateUid({ uid, farmerName }) {
  const updateDataQuery = `
		UPDATE Entry
		SET uid = $1
		WHERE farmerName = $2 AND uid = '00000' OR uid = '' OR uid NOT IN (SELECT DISTINCT uid FROM Entry WHERE uid != '00000' AND uid !='')
		RETURNING *;
	`;

  const values = [uid, sanitizeString(farmerName)];

  await runQuery(updateDataQuery, values);
}
// mark the entry of vm data in refund table
// async function markVmData({ date, vendor }) {
//   console.log("markcalled", date, vendor);
//   const updateDataQuery = `
// 		UPDATE Refund
// 		SET vmdata = true
// 		WHERE date = $1 AND vendorName = $2
// 		RETURNING *;
// 	`;

//   const values = [date, sanitizeString(vendor)];

//   await runQuery(updateDataQuery, values);
// }

// get all entries from refund table where vmdata is false
async function getRefundVmData() {
  const getDataQuery = `WITH RankedEntries AS (
		SELECT *,
			ROW_NUMBER() OVER(PARTITION BY date, vendorname ORDER BY id) AS RowNum
		FROM Refund
		WHERE vmdata = FALSE
	 )
	 SELECT * FROM RankedEntries WHERE RowNum = 1;`;
  return await runQuery(getDataQuery);
}
// ////////////////////////////////////////////// v2 functions ///////////////////////////////////////////////////////////////////////

// Create famrer account
async function createFarmerAccount({
  farmerName,
  mobileNumber,
  farmerAddress,
  uid,
}) {
  const insertDataQuery = `
	INSERT INTO farmers (farmerName, mobileNumber, farmerAddress, uid)
	VALUES ($1, $2, $3, $4)
	RETURNING *;
  `;

  const values = [
    sanitizeString(farmerName),
    mobileNumber,
    sanitizeString(farmerAddress),
    uid || '-----',
  ];

  await runQuery(insertDataQuery, values);
}

// get all famrers where uid exits and is not 00000
async function getFarmerAcc() {
  const getDataQuery = `SELECT * FROM farmers;`;
  return await runQuery(getDataQuery);
}

async function addEntry({
  farmerName,
  mobileNumber,
  vendorName,
  item,
  quantity,
  weight,
  date,
  uid,
  farmerid,
  farmerAddress,
}) {
  // if farmerid is not -1 then farmer is already present so insert into entry table otherwise create a new farmer and then insert into entry table
  if (farmerid === -1) {
    // create a new farmer
    let insertDataQuery = `
		INSERT INTO farmers (farmerName, mobileNumber, uid, farmerAddress)
		VALUES ($1, $2, $3, $4)
		RETURNING *;
	  `;

    let values = [
      sanitizeString(farmerName),
      mobileNumber,
      uid || '-----',
      farmerAddress,
    ];

    const result = await runQuery(insertDataQuery, values);
    console.log(result, 'New Farmer Created');
    farmerid = result[0].farmerid;
  }

  // Insert a new entry into the entries table using the retrieved farmerId
  let insertDataQuery = `
		INSERT INTO Entry (farmerid, vendorName, item, quantity, weight, date)
		VALUES ($1, $2, $3, $4, $5, $6) RETURNING transactionid;
	`;
  let values = [
    farmerid,
    sanitizeString(vendorName),
    sanitizeString(item),
    Number(quantity),
    Number(weight),
    date,
  ];
  console.log(farmerid, 'Farmer ID');
  const a = await runQuery(insertDataQuery, values);
  console.log(a);
  return a;
}
// Add late entry
async function addLateEntry({
  farmerName,
  mobileNumber,
  vendorName,
  item,
  quantity,
  weight,
  date,
  uid,
  farmerid,
  transportrate,
}) {
  // if farmerid is not -1 then farmer is already present so insert into entry table otherwise create a new farmer and then insert into entry table
  if (farmerid === -1) {
    // create a new farmer
    let insertDataQuery = `
		INSERT INTO farmers (farmerName, mobileNumber, uid)
		VALUES ($1, $2, $3)
		RETURNING *;
	  `;

    let values = [sanitizeString(farmerName), mobileNumber, uid || '-----'];

    const result = await runQuery(insertDataQuery, values);
    console.log(result, 'New Farmer Created');
    farmerid = result[0].farmerid;
  }

  // Insert a new entry into the entries table using the retrieved farmerId
  let insertDataQuery = `
		INSERT INTO Entry (farmerid, vendorName, item, quantity, weight, date, transportrate, postdated)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8);
	`;
  let values = [
    farmerid,
    sanitizeString(vendorName),
    sanitizeString(item),
    Number(quantity),
    Number(weight),
    date,
    Number(transportrate),
    true,
  ];
  console.log(farmerid, 'Farmer ID');
  await runQuery(insertDataQuery, values);
}

// getEntryUsingUid
async function getDetailsUsingUid({ uid }) {
  const getDataQuery = `SELECT DISTINCT  farmerName, farmerid, uid, mobileNumber FROM farmers WHERE uid = $1;`;
  return await runQuery(getDataQuery, [uid]);
}

// getDetailsusingName
async function getDetailsUsingName({ farmerName }) {
  const getDataQuery = `SELECT DISTINCT  farmerName, uid, mobileNumber FROM farmers WHERE farmerName = $1;`;
  return await runQuery(getDataQuery, [sanitizeString(farmerName)]);
}

////search similar farmer
async function searchFarmer({ farmerName }) {
  const getDataQuery = `SELECT DISTINCT farmerName FROM farmers WHERE farmerName LIKE '%${sanitizeString(
    farmerName
  )}%';`;
  console.log(getDataQuery);
  return await runQuery(getDataQuery);
}
// Get all recent entries for the day with farmer name
async function getRecentEntries({ date }) {
  const getDataQuery = `
		SELECT farmerName,uid, mobileNumber, vendorName, item, quantity
		FROM Entry
		INNER JOIN farmers ON Entry.farmerId = farmers.farmerId
		WHERE date = $1
		ORDER BY transactionId DESC
		LIMIT 5;
	`;
  return await runQuery(getDataQuery, [date]);
}

// get all farmers and save in context
async function getFarmers() {
  const getDataQuery = `SELECT * FROM farmers;`;
  return await runQuery(getDataQuery);
}

// edit farmer account
async function editFarmerAccount({
  farmerName,
  mobileNumber,
  farmerAddress,
  uid,
  farmerid,
}) {
  const updateDataQuery = `
		UPDATE farmers
		SET farmerName = $1, mobileNumber = $2, farmerAddress = $3, uid = $4, lastupdated = NOW()
		WHERE farmerid = $5
		RETURNING *;
	`;

  const values = [
    sanitizeString(farmerName),
    mobileNumber,
    sanitizeString(farmerAddress),
    uid,
    farmerid,
  ];

  await runQuery(updateDataQuery, values);
}

// delete farmer account, first add to deletedfarmer table adn then delete from farmer table
async function deleteFarmerAccount({ farmerid, reason }) {
  // const insertDataQuery = `
  //   INSERT INTO deletedfarmers (farmerid, farmerName, uid, mobilenumber, farmeraddress, reason)
  //   SELECT farmerid, farmerName, uid, mobilenumber, farmeraddress, $2 FROM farmers WHERE farmerid = $1
  // `;

  // await runQuery(insertDataQuery, [farmerid, reason]);
  try {
    const deleteDataQuery = `
		DELETE FROM farmers
		WHERE farmerid = $1
		RETURNING *;
	`;

    const deletedfarmer = await runQuery(deleteDataQuery, [farmerid]);
    if (deletedfarmer.length === 0)
      return {
        error:
          'शेतकऱ्याच्या नोंदी असल्या मुळे, शेतकरी डिलीट होणार नाही. एडिट करा ',
      };
    else {
      const insertDataQuery = `
    INSERT INTO deletedfarmers (farmerid, farmerName, uid, mobilenumber, farmeraddress, reason)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;
      const values = [
        farmerid,
        deletedfarmer[0].farmername,
        deletedfarmer[0].uid,
        deletedfarmer[0].mobilenumber,
        deletedfarmer[0].farmeraddress,
        reason,
      ];
      await runQuery(insertDataQuery, values);
      return 'शेतकरी डिलीट केला';
    }
  } catch (err) {
    console.log(err);
    return {
      error:
        'शेतकऱ्याच्या नोंदी असल्या मुळे, शेतकरी डिलीट होणार नाही. एडिट करा ',
    };
  }
}

// add advance
async function addAdvance({ farmerid, date, amount, paymentMode }) {
  const insertDataQuery = `
	INSERT INTO farmerpayments (farmerid, date, amount, description, time)
	VALUES ($1, $2, $3, $4, $5)
	RETURNING *;
  `;
  let currentTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });
  const values = [
    farmerid,
    date,
    Number(amount),
    sanitizeString(paymentMode),
    currentTime,
  ];

  await runQuery(insertDataQuery, values);
}

// get recent 2 advance for the farmerid by date
async function getAdvanceDetails({ farmerid }) {
  const getDataQuery = `SELECT * FROM farmerpayments WHERE farmerid = $1 ORDER BY farmerpaymentid DESC LIMIT 2;`;
  return await runQuery(getDataQuery, [farmerid]);
}

async function updateAdvancePaidStatus({
  update,
  today,
  paymentDescription,
  paymentMode,
  paidBy,
}) {
  console.log('updating advance');
  try {
    for (const id in update) {
      const updateDataQuery = `UPDATE farmerpayments 
                                SET paid = $1, 
                                    paidtimestamp = NOW(), 
                                    paymenttype = $2, 
                                    collectedby = $3, 
                                    paiddate = $4, 
                                    paiddescription = $5 
                                WHERE farmerpaymentid = $6;`;

      const queryParams = [
        update[id], // for paid
        paymentMode, // for paymenttype
        paidBy, // for collectedby
        today, // for paiddate
        paymentDescription, // for paiddescription
        id, // for farmerpaymentid
      ];

      // Run the parameterized query for each id
      await runQuery(updateDataQuery, queryParams);
    }
  } catch (err) {
    console.log(err);
  }
}

// //farmer and vendormemo
async function getFarmersALlData({ farmerid }) {
  const getDataQuery = `SELECT 
  Entry.farmerid, 
  transactionid as entryid,
  date, 
  vendorName, 
  quantity, 
  weight, 
  item, 
  farmers.farmerName, 
  farmers.mobileNumber, 
  farmers.uid,
  vendorMemo.payable, 
  vendorMemo.paid, 
  vendorMemo.paiddate
FROM 
  Entry
LEFT OUTER JOIN 
  vendorMemo ON Entry.transactionid = vendorMemo.entryid 
LEFT OUTER JOIN 
  FARMERS ON ENTRY.farmerid = FARMERS.farmerid

WHERE 
  Entry.farmerid = $1;

  `;
  return await runQuery(getDataQuery, [farmerid]);
}

// getTransDetailsFromPrevious entries that exist for today in refund table
async function getTransDetailsFromPrevious({ date }) {
  const getDataQuery = `SELECT transportername, vehicleno 
FROM Refund 
WHERE date = $1 
AND transportername IS NOT NULL 
AND transportername != '' 
AND vehicleno IS NOT NULL 
AND vehicleno != '' 
LIMIT 1;
`;
  return await runQuery(getDataQuery, [date]);
}

// login
async function logUser({ username }) {
  const getDataQuery = `SELECT * FROM users WHERE username = $1;`;
  return await runQuery(getDataQuery, [username]);
}
// last login info
async function lastLogin({ user_id, device }) {
  const insertDataQuery = `
    INSERT INTO last_logins (user_id, device, login_time)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const dateTimeString = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });

  const values = [user_id, device, dateTimeString];

  await runQuery(insertDataQuery, values);
}

// sum of commision and refund for a particular date
async function getSum({ date }) {
  const getDataQuery = `SELECT 
  SUM(value) as refund
FROM
  Refund
WHERE
  date = $1;`;
  return await runQuery(getDataQuery, [date]);
}

// sum of transport rate for a particular date with distinct vendor
async function getTransportRateSum({ date }) {
  const getDataQuery = `
        SELECT  
            e.vendorName,
            v.token_no,
            SUM(e.quantity) AS totalQuantity,  
            SUM(e.weight) AS totalWeight,  
            SUM(e.transportRate)-r.value AS totalTransportCost,  
            r.printed,  
            r.value,
            r.transporterName,
            r.vehicleno
        FROM  
            entry e
        LEFT JOIN  
            refund r ON e.vendorName =  r.vendorName AND r.date = $1
        LEFT JOIN  
            vendor v ON e.vendorName = v.vendorName
        WHERE  
            e.date = $1
        GROUP BY  
            e.vendorName, v.token_no, r.printed, r.value, r.transporterName, r.vehicleno;
    `;
  return await runQuery(getDataQuery, [date]);
}

// mark printed as true in refund table for the date and vendor
async function updateRefundPrinted({ date, vendor }) {
  const updateDataQuery = `
    UPDATE Refund
    SET printed = true
    WHERE date = $1 AND vendorName = $2
    RETURNING *;
  `;
  const values = [date, sanitizeString(vendor)];
  return await runQuery(updateDataQuery, values);
}

// get weekly report
async function getWeeklyReport() {
  const getDataQuery = `SELECT 
							COALESCE(cm.week_start_date, rf.week_start_date) AS week_start_date,
							weekly_commision,
							weekly_refund_value
							FROM 
								(SELECT DATE_TRUNC('week', date) AS week_start_date, 
										SUM(commision) AS weekly_commision
								FROM VendorMemo
								JOIN Entry ON VendorMemo.entryid = Entry.transactionId
								GROUP BY DATE_TRUNC('week', date)) AS cm
							FULL JOIN 
								(SELECT DATE_TRUNC('week', date) AS week_start_date, 
										SUM(value) AS weekly_refund_value
								FROM Refund
								GROUP BY DATE_TRUNC('week', date)) AS rf
							ON cm.week_start_date = rf.week_start_date
							ORDER BY week_start_date;`;
  return await runQuery(getDataQuery);
}

// getDailyItemReportVendorWise
async function getDailyItemReportVendorWise({ date }) {
  const getDataQuery = `SELECT
						e.vendorName,
						e.item,
						MAX(vm.rate) AS highest_rate,
						MIN(vm.rate) AS lowest_rate,
						AVG(vm.rate) AS average_rate
					FROM
						entry e
					JOIN
						VendorMemo vm ON e.transactionId = vm.entryid
					WHERE
						e.date = $1
						AND vm.rate != 0
					GROUP BY
						e.vendorName,
						e.item,
						e.date
					ORDER BY 
						e.item;
					`;
  return await runQuery(getDataQuery, [date]);
}

// getMonthlyRefundAndQuantity
async function getMonthlyRefundAndQuantity({ date }) {
  const getDataQuery = `SELECT
        DATE_TRUNC('month', date) AS start_of_month,
        SUM(value) AS total_refund_value,
        SUM(quantity) AS total_quantity
    FROM (
        SELECT
            date,
            value,
            0 AS quantity
        FROM
            Refund
        UNION ALL
        SELECT
            date,
            0 AS value,
            quantity
        FROM
            entry
    ) AS combined_data
    WHERE
        date >= $1
    GROUP BY
        start_of_month;
    `;
  return await runQuery(getDataQuery, [date]);
}

async function getLast30DaysSummary({ date }) {
  const getDataQuery = `
	SELECT
    date,
    SUM(value) AS total_refund_value,
    SUM(quantity) AS total_quantity,
    SUM(weight) AS total_weight
FROM (
    SELECT
        date,
        value,
        0 AS quantity,
        0 AS weight
    FROM
        Refund
    UNION ALL
    SELECT
        date,
        0 AS value,
        quantity,
        weight
    FROM
        entry
) AS combined_data
WHERE
    date >= TO_DATE($1, 'YYYY-MM-DD') - INTERVAL '30 days'
    AND date <= TO_DATE($1, 'YYYY-MM-DD')
GROUP BY
    date
ORDER BY
    date;

    `;

  return await runQuery(getDataQuery, [date]);
}

async function getAllUsers() {
  const getDataQuery = `SELECT username FROM users;`;
  return await runQuery(getDataQuery);
}

async function deleteFromRefundTable({ date, vendorName }) {
  console.log('deleteFromRefundTable', date, vendorName);
  const deleteDataQuery = `
	DELETE FROM Refund
	WHERE date = $1 AND vendorName = $2
	RETURNING *;
	`;

  const del = await runQuery(deleteDataQuery, [date, vendorName]);
  console.log('deleted', del);
  // add to deleted refund entries column
  const insertDataQuery = `
	INSERT INTO deletedRefundData (vendorName, date, value, transporterName, vehicleNo, vmdata, printed, deltedon)
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	RETURNING *;
  `;
  const today = new Date().toLocaleDateString('en-IN', {
    timeZone: 'Asia/Kolkata',
  });
  const values = [
    del[0].vendorname,
    del[0].date,
    del[0].value,
    del[0].transportername,
    del[0].vehicleno,
    del[0].vmdata,
    del[0].printed,
    today,
  ];
  return await runQuery(insertDataQuery, values);
}

async function getTopFarmersWeekly({ date }) {
  const getDataQuery = `SELECT
    f.farmerName,
    f.farmerAddress,
    f.mobileNumber,
    SUM(e.quantity) AS total_quantity
FROM
    farmers f
JOIN
    entry e ON f.farmerId = e.farmerId
WHERE
    e.date >= TO_DATE($1, 'YYYY-MM-DD') - INTERVAL '7 days'
GROUP BY
    f.farmerName,
    f.farmerAddress,
    f.mobileNumber
ORDER BY
    total_quantity DESC
LIMIT
    5;
	`;
  return await runQuery(getDataQuery, [date]);
}

async function getTransportRemaining({ date }) {
  // count the non printed refund entries for the date
  const getDataQuery = `SELECT COUNT(DISTINCT e.vendorName) AS vendorCount
	FROM entry e
	LEFT JOIN refund r ON e.vendorName = r.vendorName AND r.date = $1 
	WHERE e.date = $1  AND (r.printed = false OR r.printed IS NULL);`;
  return await runQuery(getDataQuery, [date]);
}
// async function  getMonthlyCommision({date}){
// 	const getDataQuery = `SELECT
// 	DATE_TRUNC('month', date) AS start_of_month,
// 	SUM(commision) AS total_commision
// 	FROM
// 		VendorMemo
// 	JOIN
// 		Entry ON VendorMemo.entryid = Entry.transactionId
// 	WHERE
// 		date >= $1
// 	GROUP BY
// 		start_of_month;
// `;
// 	return await runQuery(getDataQuery, [date]);
// }

async function getDailyComissionSumForMonth({ date }) {
  const getDataQuery = `SELECT
	date,
	SUM(commision) AS total_commision
	FROM
		VendorMemo
	JOIN
		Entry ON VendorMemo.entryid = Entry.transactionId
	WHERE
		date >= TO_DATE($1, 'YYYY-MM-DD') - INTERVAL '30 days'
		AND date <= TO_DATE($1, 'YYYY-MM-DD')
	GROUP BY
		date
	ORDER BY
		date;
	`;
  return await runQuery(getDataQuery, [date]);
}
async function getItems() {
  const getDataQuery = `SELECT * from items;`;
  return await runQuery(getDataQuery);
}

async function getSetEntryScan({ entryid }) {
  const setDataQuery = `UPDATE entry SET scanned = true WHERE transactionid = $1;`;
  await runQuery(setDataQuery, [entryid]);
  const getDataQuery = `SELECT * FROM entry WHERE transactionid = $1;`;
  return await runQuery(getDataQuery, [entryid]);
}
async function setRefundMarked({ date, vendorName }) {
  const setDataQuery = `UPDATE refund SET vmdata = true WHERE date = $1 AND vendorName = $2;`;
  await runQuery(setDataQuery, [date, vendorName]);
}

//get all entries from vendormemo which have been paid today, return farmername, payable, transactionid, uid, vendorname, quantity, weight
async function getDailyPaidEntries({ date }) {
  const getDataQuery = `SELECT 
	f.farmerName,
	f.uid,
	f.mobileNumber,
	SUM(vm.payable) AS totalPayable,
	COUNT(*) AS entryCount,
	vm.paidtimestamp AS paidtimestamp_ist,
  vm.paymenttype,
  vm.paidby,
  vm.description
	FROM 
		vendormemo vm
	JOIN 
		entry e ON vm.entryid = e.transactionid
	JOIN 
		farmers f ON e.farmerid = f.farmerid
	WHERE 
		vm.paiddate = $1
	GROUP BY 
			vm.paidtimestamp, f.farmername, f.mobilenumber, f.uid, vm.paymenttype, vm.description, vm.paidBy
	ORDER BY 
			vm.paidtimestamp ASC;

`;
  const paidEntries = await runQuery(getDataQuery, [date]);

  // get all advances from farmerpayments which have been paid today, return farmername, payable, transactionid, uid, vendorname, quantity, weight
  const getAdvanceDataQuery = `SELECT
  f.farmerName,
  f.uid,
  f.mobileNumber,
  SUM(fp.amount) AS totalAdvance,
  COUNT(*) AS advanceCount,
  DATE_TRUNC('minute', fp.paidtimestamp) - INTERVAL '1 minute' * (EXTRACT(MINUTE FROM fp.paidtimestamp) % 2) AS paidtimestamp_ist,
  fp.paiddescription,
  fp.paymenttype,
  fp.collectedby
FROM
  farmerpayments fp
JOIN
  farmers f ON fp.farmerid = f.farmerid
WHERE
  DATE(fp.paidtimestamp) = $1
GROUP BY
   f.farmerName, f.mobileNumber, f.uid, fp.paymenttype, fp.paiddescription, fp.collectedby, 
   DATE_TRUNC('minute', fp.paidtimestamp) - INTERVAL '1 minute' * (EXTRACT(MINUTE FROM fp.paidtimestamp) % 2);

`;
  const paidAdvances = await runQuery(getAdvanceDataQuery, [date]);
  return { paidEntries, paidAdvances };
}

async function setNewUser({ username, password }) {
  const setDataQuery = `INSERT INTO users (username, password, role) VALUES ($1, $2, $3);`;
  await runQuery(setDataQuery, [username, password, 'guest']);
}

async function refreshMaterializedView() {
  const setDataQuery = `REFRESH MATERIALIZED VIEW vendor_item_rates;`;
  await runQuery(setDataQuery);
}

async function getAdvanceDetailsByDate({ date }) {
  try {
    const getDataQuery = `SELECT 
    f.farmerName,
    f.mobileNumber,
    f.uid,
    SUM(fp.amount) AS totalAdvance,
    COUNT(*) AS advanceCount
  FROM
    farmers f
  JOIN
    farmerpayments fp ON f.farmerId = fp.farmerId
  WHERE
    fp.date = $1
  GROUP BY
    f.farmerName,
    f.mobileNumber,
    f.uid
  ORDER BY
    f.farmerName;
  `;
    return await runQuery(getDataQuery, [date]);
  } catch (err) {
    console.log(err);
  }
}

export {
  // v2
  createFarmerAccount,
  setNewUser,
  getAllUsers,
  getDetailsUsingUid,
  getDetailsUsingName,
  getDailyPaidEntries,
  getFarmers,
  updateEntryData,
  editFarmerAccount,
  deleteFarmerAccount,
  addAdvance,
  getAdvanceDetails,
  getAdvanceData,
  updateAdvancePaidStatus,
  getFarmersALlData,
  getTransDetailsFromPrevious,
  logUser,
  lastLogin,
  getTransportRemaining,
  getSum,
  getTransportRateSum,
  updateRefundPrinted,
  getWeeklyReport,
  getDailyItemReportVendorWise,
  getMonthlyRefundAndQuantity,
  getLast30DaysSummary,
  deleteFromRefundTable,
  getTopFarmersWeekly,
  getDailyComissionSumForMonth,
  addLateEntry,
  getItems,
  getSetEntryScan,
  setRefundMarked,
  refreshMaterializedView,
  getAdvanceDetailsByDate,
  // v1
  addEntry,
  getFarmerAcc,
  getRefundVmData,
  getGalaNumber,
  getFarmerUsingUid,
  updateEntry,
  getRecentEntries,
  getTodayEntries,
  addVendor,
  getVendors,
  getEntriesByDateVendor,
  addRefund,
  getRefundByVendor,
  getRefundByDateVendor,
  updateTransportRate,
  updateRefundByDateVendor,
  getFarmer,
  getFarmerUsingMobile,
  getEntriesVmDataByDateVendor,
  getEntriesVmDataByVendor,
  addVmData,
  updateVmData,
  updatePaidStatus,
  addPayment,
  getPaymentDetails,
  deleteEntry,
  searchFarmer,
  getLastFewEntries,
};
