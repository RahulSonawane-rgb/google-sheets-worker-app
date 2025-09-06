function doGet() {
  return HtmlService.createHtmlOutputFromFile('page.html');
}

// Workers Management
function addOrUpdateWorker(name, payRate) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Workers');
  const data = sheet.getDataRange().getValues();
  
  // Check if worker exists
  const row = data.findIndex(row => row[0] === name) + 1;
  
  if(row > 0) {
    sheet.getRange(row, 2).setValue(payRate);
  } else {
    sheet.appendRow([name, payRate]);
  }
}

function editWorker(originalName, newName, newPayRate) {
  const spreadsheet = SpreadsheetApp.getActive();
  const workerSheet = spreadsheet.getSheetByName('Workers');
  const workerData = workerSheet.getDataRange().getValues();
  const workerRowIndex = workerData.findIndex(row => row[0] === originalName) + 1;
  
  if (workerRowIndex > 0) {
    // Update Workers sheet
    workerSheet.getRange(workerRowIndex, 1).setValue(newName);
    workerSheet.getRange(workerRowIndex, 2).setValue(newPayRate);
    
    // If name changed, update DeletedWorkers sheet
    if (originalName !== newName) {
      let deletedSheet = spreadsheet.getSheetByName('DeletedWorkers');
      if (deletedSheet) {
        const deletedData = deletedSheet.getDataRange().getValues();
        const deletedRowIndex = deletedData.findIndex(row => row[0] === originalName) + 1;
        if (deletedRowIndex > 0) {
          deletedSheet.getRange(deletedRowIndex, 1).setValue(newName);
          deletedSheet.getRange(deletedRowIndex, 2).setValue(newPayRate);
        }
      }
    }
    return true;
  }
  return false;
}

function getWorkers() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Workers');
  return sheet.getDataRange().getValues().slice(1);
}

function getWorkerNames() {
  const workers = getWorkers();
  return workers.map(worker => worker[0]);
}

function deleteWorker(workerName) {
  const spreadsheet = SpreadsheetApp.getActive();
  const workerSheet = spreadsheet.getSheetByName('Workers');
  const workerData = workerSheet.getDataRange().getValues();
  const workerRowIndex = workerData.findIndex(row => row[0] === workerName) + 1;
  
  if (workerRowIndex > 0) {
    // Get worker's pay rate before deleting
    const payRate = workerData[workerRowIndex - 1][1];
    
    // Save to DeletedWorkers sheet
    let deletedSheet = spreadsheet.getSheetByName('DeletedWorkers');
    if (!deletedSheet) {
      deletedSheet = spreadsheet.insertSheet('DeletedWorkers');
      deletedSheet.appendRow(['Name', 'Pay Rate']);
    }
    deletedSheet.appendRow([workerName, payRate]);
    
    // Delete from Workers sheet
    workerSheet.deleteRow(workerRowIndex);
    return true;
  }
  return false;
}

// Attendance Management
function updateAttendance(date, attendanceData) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Attendance');
  const workers = getWorkers();
  const workerPayRates = {};
  workers.forEach(worker => {
    workerPayRates[worker[0]] = parseFloat(worker[1]) || 0;
  });
  
  Object.keys(attendanceData).forEach(worker => {
    const payRate = workerPayRates[worker] || 0;
    sheet.appendRow([
      new Date(date),
      worker,
      parseFloat(attendanceData[worker]) || 0,
      payRate
    ]);
  });
}

function getAttendanceRecords(date, workerName) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Attendance');
  const data = sheet.getDataRange().getValues().slice(1);
  
  return data
    .filter(row => {
      const matchDate = date ? 
        Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM-dd') === date :
        true;
      
      const matchWorker = workerName ?
        row[1].toLowerCase().includes(workerName.toLowerCase()) :
        true;
      
      return matchDate && matchWorker;
    })
    .map(row => ({
      date: Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      worker: row[1],
      status: row[2],
      rowNumber: row.__rowIndex__
    }));
}

function getAttendanceForCorrection(date) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Attendance');
  const data = sheet.getDataRange().getValues().slice(1);
  
  return data
    .filter(row => {
      if (!date) return true;
      const rowDate = new Date(row[0]);
      return Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') === date;
    })
    .map(row => ({
      date: Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      worker: row[1],
      status: row[2]
    }));
}

function updateAttendanceRecord(originalDate, worker, newStatus) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Attendance');
  const data = sheet.getDataRange().getValues();
  
  const rowIndex = data.findIndex(row => {
    const rowDate = new Date(row[0]);
    return (
      Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') === originalDate &&
      row[1] === worker
    );
  });

  if (rowIndex > 0) {
    sheet.getRange(rowIndex + 1, 3).setValue(newStatus);
    return true;
  }
  return false;
}

function deleteAttendanceRecord(date, worker) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Attendance');
  const data = sheet.getDataRange().getValues();
  
  const rowIndex = data.findIndex(row => 
    Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'yyyy-MM-dd') === date &&
    row[1] === worker
  );
  
  if(rowIndex > 0) {
    sheet.deleteRow(rowIndex + 1);
    return true;
  }
  return false;
}

// Report Generation
function calculateTotalPay(startDate, endDate) {
  try {
    const spreadsheet = SpreadsheetApp.getActive();
    const attendanceSheet = spreadsheet.getSheetByName('Attendance');
    const workers = getWorkers();
    const workerPayRates = {};
    const workerNames = new Set(workers.map(worker => worker[0]));
    workers.forEach(worker => {
      workerPayRates[worker[0]] = parseFloat(worker[1]) || 0;
    });
    
    // Load DeletedWorkers sheet
    let deletedSheet = spreadsheet.getSheetByName('DeletedWorkers');
    const deletedWorkerPayRates = {};
    if (deletedSheet) {
      const deletedData = deletedSheet.getDataRange().getValues().slice(1);
      deletedData.forEach(row => {
        deletedWorkerPayRates[row[0]] = parseFloat(row[1]) || 0;
      });
    }
    
    const allAttendance = attendanceSheet.getDataRange().getValues().slice(1);
    
    // Filter by date range
    const filteredAttendance = allAttendance.filter(row => {
      const rowDate = new Date(row[0]);
      return rowDate >= new Date(startDate) && rowDate <= new Date(endDate);
    });

    // Get unique worker names from attendance records
    const uniqueWorkers = [...new Set(filteredAttendance.map(row => row[1]))];
    
    // Calculate report data for all workers in attendance records
    const reportData = uniqueWorkers.map(workerName => {
      const workerAttendance = filteredAttendance.filter(row => row[1] === workerName);
      const totalDays = workerAttendance.reduce((sum, row) => sum + (parseFloat(row[2]) || 0), 0);
      
      // Try pay rate from attendance sheet, then Workers sheet, then DeletedWorkers sheet
      const lastAttendance = workerAttendance[workerAttendance.length - 1];
      let payRate = 0;
      if (workerAttendance.length > 0 && lastAttendance[3] !== undefined && lastAttendance[3] !== '') {
        payRate = parseFloat(lastAttendance[3]) || 0;
      } else if (workerPayRates[workerName]) {
        payRate = workerPayRates[workerName];
      } else if (deletedWorkerPayRates[workerName]) {
        payRate = deletedWorkerPayRates[workerName];
      }
      
      // Append "(deleted)" if worker is not in Workers sheet
      const displayName = workerNames.has(workerName) ? workerName : `${workerName} (deleted)`;
      
      return {
        name: displayName,
        days: totalDays,
        pay: totalDays * payRate
      };
    });

    // Calculate total amount
    const totalAmount = reportData.reduce((sum, worker) => sum + worker.pay, 0);
    
    // Update report sheet
    const reportSheet = spreadsheet.getSheetByName('Reports');
    reportSheet.clear();
    reportSheet.appendRow(['Worker Name', 'Total Days', 'Total Pay']);
    reportData.forEach(row => {
      reportSheet.appendRow([row.name, row.days, row.pay]);
    });
    
    // Return data for attendance history
    const attendanceHistory = filteredAttendance.map(row => ({
      date: Utilities.formatDate(row[0], Session.getScriptTimeZone(), 'dd-MMM-yyyy'),
      worker: row[1],
      status: row[2]
    }));
    
    return {
      reportData: reportData,
      attendanceHistory: attendanceHistory,
      totalAmount: totalAmount
    };
  } catch (error) {
    Logger.log('Error in calculateTotalPay: ' + error.message);
    return {
      reportData: [],
      attendanceHistory: [],
      totalAmount: 0,
      error: 'Failed to generate report: ' + error.message
    };
  }
}
