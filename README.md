# Worker Management System (Google Apps Script)

This is a simple yet effective Worker Management System built using Google Apps Script. It provides a web-based interface for managing worker details, tracking daily attendance, correcting past entries, and generating pay reports for specified date ranges.

## Features

* **Worker Management:**
    * Add new workers with their daily pay rates.
    * Update existing worker's pay rates.
    * View a list of all registered workers.
* **Attendance Tracking:**
    * Record daily attendance for all workers (Present, Half Day, One and Half, Two Days, Absent).
    * User-friendly dropdowns for easy status selection.
* **Attendance Correction:**
    * Search and filter attendance records by date and worker name.
    * Edit existing attendance entries to correct mistakes.
    * Delete individual attendance records.
* **Reporting:**
    * Generate pay reports for any custom date range, showing total days worked and total pay per worker.
    * View a detailed attendance history for the selected period.
    * Calculates a grand total pay for the entire report.
* **Modern UI:** Clean and responsive interface with a glassmorphism design.

## How It Works

This system leverages Google Apps Script to connect a web-based user interface (HTML, CSS, JavaScript) with a Google Sheet that acts as its database.

* **Frontend:** `page.html` (includes CSS and JavaScript) provides the user interface.
* **Backend:** `code.js` contains the Google Apps Script functions that interact with Google Sheets to store, retrieve, update, and delete data.
* **Database:** A Google Sheet with specific tabs (`Workers`, `Attendance`, `Reports`) is used to store all your data.

## Setup Guide (For Beginners)

Follow these steps carefully to get your Worker Management System up and running in your Google Drive.

### Step 1: Prepare Your Google Sheet

1.  **Create a New Google Sheet:**
    * Go to [Google Sheets](https://sheets.google.com/).
    * Click `+ Blank` to create a new spreadsheet.
    * Rename the spreadsheet to something descriptive, e.g., `Worker Management Data`.

2.  **Create Required Tabs (Sheets):**
    * At the bottom of the spreadsheet, you'll see `Sheet1`. Rename it.
    * **Rename `Sheet1` to `Workers`**
        * Right-click on `Sheet1` tab.
        * Select `Rename`.
        * Type `Workers` and press Enter.
    * **Add a new sheet and name it `Attendance`:**
        * Click the `+` icon (Add sheet) at the bottom left.
        * Rename the new sheet to `Attendance`.
    * **Add another new sheet and name it `Reports`:**
        * Click the `+` icon again.
        * Rename the new sheet to `Reports`.

3.  **Add Headers to Your Sheets:**
    * **`Workers` Sheet:**
        * In cell `A1`, type `Worker Name`
        * In cell `B1`, type `Daily Pay Rate`
    * **`Attendance` Sheet:**
        * In cell `A1`, type `Date`
        * In cell `B1`, type `Worker`
        * In cell `C1`, type `Status`
    * **`Reports` Sheet:**
        * In cell `A1`, type `Worker Name`
        * In cell `B1`, type `Total Days`
        * In cell `C1`, type `Total Pay`

    *Your Google Sheet is now ready for the Apps Script to interact with it.*

### Step 2: Create and Deploy the Google Apps Script Project

1.  **Open Apps Script Editor:**
    * From your newly created Google Sheet (`Worker Management Data`), go to `Extensions` > `Apps Script`.
    * This will open a new browser tab with the Google Apps Script editor.

2.  **Paste `code.js`:**
    * In the Apps Script editor, you'll see a default file named `Code.gs`.
    * Delete all the content inside `Code.gs`.
    * Copy all the content from your `code.js` file (from your GitHub repo or local file) and paste it into `Code.gs`.
    * Click the `Save project` icon (floppy disk) in the toolbar.

3.  **Create and Paste `page.html`:**
    * In the Apps Script editor, go to `File` > `New` > `HTML file`.
    * Name the new file `page` (make sure it's `page.html`).
    * Delete all the default content inside `page.html`.
    * Copy all the content from your `page.html` file (from your GitHub repo or local file) and paste it into `page.html`.
    * Click the `Save project` icon.

4.  **Connect Script to Sheet (Important!):**
    * In `code.js`, locate the line `const sheet = SpreadsheetApp.getActive().getSheetByName('Workers');` (and similar lines for 'Attendance' and 'Reports').
    * **Ensure that the Apps Script project is bound to your *active* Google Sheet.** When you open Apps Script from a Google Sheet (as described in Step 2.1), it is automatically "bound" to that sheet. This means `SpreadsheetApp.getActive()` will correctly refer to your `Worker Management Data` sheet. If you create the script independently, you'd need to use `SpreadsheetApp.openById('YOUR_SHEET_ID')`. Since you opened it from the sheet, you're good!

5.  **Run `doGet()` (for Authorization):**
    * In the Apps Script editor, from the dropdown menu next to the `Run` button (looks like a play icon), select the `doGet` function.
    * Click the `Run` button.
    * **Authorization Prompt:** The first time you run any function that accesses your Google services (like `SpreadsheetApp`), you'll be prompted for authorization.
        * Click `Review permissions`.
        * Select your Google account.
        * You might see a warning "Google hasn't verified this app." This is normal because it's your own app. Click `Advanced` > `Go to Worker Management System (unsafe)`.
        * Click `Allow` to grant the necessary permissions.
    * After authorization, the `doGet` function will run successfully (it just returns the HTML, so nothing visible will happen in the editor).

### Step 3: Deploy as a Web App

1.  **Open Deployment Options:**
    * In the Apps Script editor, click on `Deploy` > `New deployment`.

2.  **Configure Deployment:**
    * Click the "Select type" icon (looks like a gear) and choose `Web app`.
    * **Description (Optional):** Enter a brief description, e.g., `Initial deployment of Worker Management System`.
    * **Execute as:** Keep this as `Me` (your Google account).
    * **Who has access:** Select `Anyone`. (This means anyone with the URL can access it. If you want to restrict it to only people in your Google Workspace domain, choose `Anyone in your organization`.)
    * Click the **`Deploy`** button.

3.  **Get Web App URL:**
    * After successful deployment, you'll see a dialog box.
    * Copy the **`Web app` URL**. This is the link to your Worker Management System!
    * Click `Done`.

### Step 4: Access and Use Your System

1.  **Open the Web App:**
    * Paste the copied `Web app` URL into your browser's address bar and press Enter.
    * Your Worker Management System should now load!

2.  **Start Managing!**
    * **Manage Workers Tab:** Add a few worker names and their daily pay rates. Make sure the names are consistent, as they are used for attendance tracking.
    * **Update Attendance Tab:** Select a date, and then mark attendance for your workers.
    * **View Reports Tab:** Select a date range and click "Generate Report" to see the pay calculations and attendance history.
    * **Correct Attendance (under Update Attendance Tab):** Use the search filters to find and correct any attendance entries.

## Important Notes:

* **Do not share your Google Sheet URL directly.** Always use the **Web app URL** obtained from the deployment.
* **Changes to `code.js` or `page.html`:** If you make any changes to your script files, you must **create a `New deployment`** (or manage existing deployments to update to a new version) for the changes to reflect in your live web app.
    * Go to `Deploy` > `Manage deployments`.
    * Click the pencil icon (`Edit`) on your current deployment.
    * For "Version," select `New version`.
    * Click `Deploy`.
* **Permissions:** If you encounter any "Permission Denied" errors, it usually means you need to re-authorize the script. Try running a function like `doGet()` or `addOrUpdateWorker()` directly from the Apps Script editor again, and follow any permission prompts.
* **Error Handling:** The current script provides basic error messages. For a production system, more robust error handling and user feedback would be beneficial.

---

Feel free to open an issue on this GitHub repository if you encounter any problems or have questions!
