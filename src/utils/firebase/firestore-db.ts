// src/utils/firebase/firestore-db.ts
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
// import { auth } from '@/lib/firebase';
import type {
  DataBaseApiInterface,
  SubmissionMetaDb,
  SubmissionData,
} from '../../types/submissionapi';

// Initialize Firebase services
const firestore = getFirestore();
// const auth = getAuth();

//   // Helper function to get current user email
//   const getCurrentUserEmail = (): string => {
//     const user = auth.currentUser;
//     if (!user?.email) {
//       throw new Error('User not authenticated');
//     }
//     return user.email;
//   };

// Fetch submissions for the currently logged-in user
const getMySubmissionFireStore = async (
  email: string
): Promise<SubmissionMetaDb | null> => {
  try {
    // Query Firestore for submissions by current user
    const q = query(collection(firestore, 'submissions'), where('email', '==', email));

    const querySnapshot = await getDocs(q);
    const submissions: SubmissionMetaDb[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      submissions.push({
        ...data,
        databaseId: doc.id,
      } as SubmissionMetaDb);
    });

    if (!submissions.length) return null;

    // Sort by creation date (newest first)
    return submissions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];
  } catch (error) {
    console.error('Error fetching user submissions:', error);
    throw new Error('Failed to fetch user submissions');
  }
};

// Admin function: list all submissions (requires admin privileges)
const listAllSubmissionsFirestore = async (): Promise<SubmissionMetaDb[]> => {
  try {
    // Note: In a real implementation, you should check admin privileges here
    // For example: await checkAdminRole(getCurrentUserEmail());

    const querySnapshot = await getDocs(collection(firestore, 'submissions'));
    const submissions: SubmissionMetaDb[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      submissions.push({
        ...data,
        databaseId: doc.id,
      } as SubmissionMetaDb);
    });

    // Sort by creation date (newest first)
    return submissions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching all submissions:', error);
    throw new Error('Failed to fetch all submissions');
  }
};

export const databaseApi: DataBaseApiInterface = {
  // Save submission metadata to Firestore and optionally to Firebase Storage
  saveSubmission: async (submissionData: SubmissionData): Promise<SubmissionMetaDb> => {
    try {
      // Generate database ID
      const databaseId = doc(collection(firestore, 'submissions')).id;

      // Prepare submission data with timestamp
      const {
        residencePermitUrl,
        motivationLetterChoice2Url,
        otherFilesPdfUrl,
        ...others
      } = submissionData;
      const submissionWithTimestamp = {
        ...others,
        ...(residencePermitUrl ? { residencePermitUrl } : {}), // only add if defined
        ...(motivationLetterChoice2Url ? { motivationLetterChoice2Url } : {}), // only add if defined
        ...(otherFilesPdfUrl ? { otherFilesPdfUrl } : {}), // only add if defined
      };

      // Save to Firestore
      await setDoc(doc(firestore, 'submissions', databaseId), submissionWithTimestamp);

      const result: SubmissionMetaDb = {
        ...submissionWithTimestamp,
        databaseId,
        metadataUrl: '',
      };

      return result;
    } catch (error) {
      console.error('Error saving submission:', error);
      throw new Error('Failed to save submission metadata');
    }
  },

  getMySubmission: async (email: string): Promise<SubmissionMetaDb | null> => {
    return await getMySubmissionFireStore(email);
  },

  listAllSubmissions: async (): Promise<SubmissionMetaDb[]> => {
    return await listAllSubmissionsFirestore();
  },
};
