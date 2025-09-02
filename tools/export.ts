// tools/export.ts
import { auth } from '../src/lib/firebase.ts';
import { databaseApi } from '../src/utils/firebase/firestore-db.ts';
import type { SubmissionMetaDb, SubmissionFormMeta } from '../src/types/submissionapi.ts';
import { updateSubmissionForm } from './update-excel.ts';

/**
 * Fills the Excel file with all submissions from DB
 */
export async function fillExcelFile(): Promise<void> {
  const submissions: SubmissionMetaDb[] = await databaseApi.listAllSubmissions();
  console.log('Submissions:', submissions);

  const results: Map<string, number> = new Map();

  console.log('Browsing submissions...');

  const total = submissions.length;
  let step = 0;

  for (const submission of submissions) {
    step++;
    console.log(`[${step}/${total}] Processing email: ${submission.email}`);

    // Sequential update to avoid Excel corruption
    const rowNumber = await updateSubmissionForm(submission as SubmissionFormMeta);
    results.set(submission.email, rowNumber);
  }

  console.log('All submissions written to Excel.');
  console.log('Results:', results);
}

(async () => {
  try {
    await fillExcelFile();
    console.log('Done!');
  } catch (err) {
    console.error('Error:', err);
  }
})();
