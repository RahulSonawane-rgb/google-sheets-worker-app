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

function getWorkers() {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Workers');
  return sheet.getDataRange().getValues().slice(1);
}

function getWorkerNames() {
  const workers = getWorkers();
  return workers.map(worker => worker[0]);
}

// Attendance Management
function updateAttendance(date, attendanceData) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Attendance');
  const workers = getWorkerNames();
  
  workers.forEach(worker => {
    sheet.appendRow([
      new Date(date),
      worker,
      attendanceData[worker] || 0
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
      rowNumber: row.__rowIndex__ // Internal row reference
    }));
}

function getAttendanceForCorrection(date) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Attendance');
  const data = sheet.getDataRange().getValues().slice(1);
  
  return data
    .filter(row => {
      if (!date) return true;
      const rowDate = new Date(row[0]);  // Convert to Date object
      return Utilities.formatDate(rowDate, Session.getScriptTimeZone(), 'yyyy-MM-dd') === date;
    })
    .map(row => ({
      date: Utilities.formatDate(new Date(row[0]), Session.getScriptTimeZone(), 'yyyy-MM-dd'), // Ensure Date conversion
      worker: row[1],
      status: row[2]
    }));
}

// Modified updateAttendanceRecord function
function updateAttendanceRecord(originalDate, worker, newStatus) {
  const sheet = SpreadsheetApp.getActive().getSheetByName('Attendance');
  const data = sheet.getDataRange().getValues();
  
  const rowIndex = data.findIndex(row => {
    const rowDate = new Date(row[0]);  // Convert to Date object
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
  const workers = getWorkers();
  const attendanceSheet = SpreadsheetApp.getActive().getSheetByName('Attendance');
  const allAttendance = attendanceSheet.getDataRange().getValues().slice(1);
  
  // Filter by date range
  const filteredAttendance = allAttendance.filter(row => {
    const rowDate = new Date(row[0]);
    return rowDate >= new Date(startDate) && rowDate <= new Date(endDate);
  });

  const reportData = workers.map(worker => {
    const totalDays = filteredAttendance
      .filter(row => row[1] === worker[0])
      .reduce((sum, row) => sum + parseFloat(row[2]), 0);
      
    return {
      name: worker[0],
      days: totalDays,
      pay: totalDays * worker[1]
    };
  });

  // Calculate total amount
  const totalAmount = reportData.reduce((sum, worker) => sum + worker.pay, 0);
  
  // Update report sheet
  const reportSheet = SpreadsheetApp.getActive().getSheetByName('Reports');
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
}
