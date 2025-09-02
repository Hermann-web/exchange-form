import ExcelJS from 'exceljs';
import type { SubmissionFormMeta } from '../src/types/submissionapi';

type Updates = Record<string, string | number | boolean | null>;

/**
 * Updates an Excel sheet with specified cell values.
 * @param filePath Path to the Excel file
 * @param updates Object mapping cell addresses (e.g., "A1") to new values
 * @param sheetName Optional sheet name; defaults to the first sheet
 */
export async function updateExcel(
  filePath: string,
  updates: Updates,
  sheetName?: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = sheetName ? workbook.getWorksheet(sheetName) : workbook.worksheets[0];

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook.`);
  }

  for (const [cell, value] of Object.entries(updates)) {
    worksheet.getCell(cell).value = value;
  }

  await workbook.xlsx.writeFile(filePath);
}

// ---------------- Helpers ----------------

/**
 * Finds the row number in column E for a given email (case-insensitive)
 * @param filePath Path to the Excel file
 * @param email Email to search for
 * @param sheetName Optional sheet name; defaults to first sheet
 * @returns Row number as string if found, null otherwise
 */
export async function findRowNumberByEmail(
  worksheet: ExcelJS.Worksheet,
  email: string
): Promise<string | null> {
  const targetEmail = email.toLowerCase();

  for (let row of worksheet.getRows(1, worksheet.rowCount) || []) {
    const cell = row.getCell('E'); // Column E
    if (cell.value && String(cell.value).toLowerCase() === targetEmail) {
      return String(row.number);
    }
  }

  return null; // Not found
}

/**
 * Maps SubmissionFormMeta keys to Excel columns
 */
export const UpdateToColMap: Record<keyof SubmissionFormMeta, string> = {
  firstName: 'N',
  lastName: 'O',
  nationality: 'P',
  email: 'Q',
  school1: 'J',
  thematicSequence1: 'K',
  electives1: 'K',
  school2: 'L',
  thematicSequence2: 'M',
  electives2: 'M',
};

/**
 * Updates Excel row based on SubmissionFormMeta using email to find the row
 */
export async function updateSubmissionForm(
  metadata: SubmissionFormMeta
): Promise<number> {
  const filePath = 'tools/liste-eleves-S7-2A-25-26-copy.xlsx';
  const sheetName = 'S7- 2A ECC';

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(filePath);

  const worksheet = sheetName ? workbook.getWorksheet(sheetName) : workbook.worksheets[0];

  if (!worksheet) {
    throw new Error(`Sheet "${sheetName}" not found in workbook.`);
  }

  // 1. Find row number by email
  const rowNumber = await findRowNumberByEmail(worksheet, metadata.email);

  if (!rowNumber) {
    return 0;
  }

  // 2. Build updates object for Excel
  const updates: Updates = {};
  const sep: string = '\n- ';
  updates[`J${rowNumber}`] = metadata.school1;
  updates[`K${rowNumber}`] = metadata.thematicSequence1 + '\n';
  updates[`K${rowNumber}`] += sep + metadata.electives1.split(';').join(sep);
  updates[`L${rowNumber}`] = metadata.school2;
  updates[`M${rowNumber}`] = metadata.thematicSequence2 + '\n';
  updates[`M${rowNumber}`] += sep + metadata.electives2.split(';').join(sep);

  // 3. Apply updates
  await updateExcel(filePath, updates, sheetName);

  console.log(`Row ${rowNumber} updated successfully for ${metadata.email}`);

  return 1;
}

// ---------------- Example Usage ----------------
async function someTest() {
  const updates: Updates = {
    J2: 'Updated Value',
    J3: 42,
    K4: 'Another Change',
  };

  const filePath = 'tools/liste-eleves-S7-2A-25-26.xlsx';
  const sheetName = 'S7- 2A ECC';

  try {
    await updateExcel(filePath, updates, sheetName);
    console.log('Excel updated successfully!');
  } catch (err) {
    console.error('Error updating Excel:', err);
  }
}

// ---------------- Example Usage ----------------
async function testUpdate() {
  const metadata: SubmissionFormMeta = {
    firstName: 'John',
    lastName: 'Doe',
    nationality: 'other',
    email: 'zakariae.achemlal@centrale-casablanca.ma',
    school1: 'centrale_supelec',
    thematicSequence1: 'TS1',
    electives1: 'Math;Physics',
    school2: 'em_lyon',
    thematicSequence2: '',
    electives2: 'Economics;Management',
  };

  try {
    await updateSubmissionForm(metadata);
  } catch (err) {
    console.error(err);
  }
}

const RUN_TEST = false;
if (RUN_TEST) {
  testUpdate()
    .then(() => console.log('Excel updated successfully!'))
    .catch((err) => console.error('Error updating Excel:', err));

  someTest()
    .then(() => console.log('Excel updated successfully!'))
    .catch((err) => console.error('Error updating Excel:', err));
}
