// src/utils/firebase/firebase-storage-db.ts
import { ref, uploadBytes, getDownloadURL, listAll, getMetadata } from 'firebase/storage';
import type {
  DataBaseApiInterface,
  SubmissionMetaDb,
  SubmissionData,
} from '@/types/submissionapi';
import { lazyFirebaseStorage } from './lib';

// Initialize Firebase services
// const storage = getStorage();

// Helper function to upload a single file
const uploadFile = async (file: File, path: string): Promise<string> => {
  const storage = lazyFirebaseStorage();
  const fileRef = ref(storage, path);
  const snapshot = await uploadBytes(fileRef, file);
  return await getDownloadURL(snapshot.ref);
};

// Helper function to download and parse JSON metadata from Firebase Storage
const downloadJsonMetadata = async (url: string): Promise<any> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error('Error downloading JSON metadata:', error);
    throw new Error('Failed to download or parse JSON metadata');
  }
};

// Helper function to extract email from metadata file path
const extractEmailFromPath = (path: string): string => {
  // Path format: submissions/metadatas/{email}.json
  const matches = path.match(/submissions\/metadatas\/(.+)\.json$/);
  return matches ? matches[1] : '';
};

// Implementation for getting user's submission from Firebase Storage metadata
const getMySubmissionFireBaseMeta = async (
  email: string
): Promise<SubmissionMetaDb | null> => {
  try {
    // Create reference to the specific user's metadata file
    const metadataPath = `submissions/metadatas/${email}.json`;
    const storage = lazyFirebaseStorage();
    const metadataRef = ref(storage, metadataPath);

    // Try to get the download URL - this will throw an error if file doesn't exist
    const downloadUrl = await getDownloadURL(metadataRef);

    // Get metadata information
    const metadata = await getMetadata(metadataRef);

    // Download and parse the JSON content
    const submissionData = await downloadJsonMetadata(downloadUrl);

    // Return the submission with metadata URL and a generated database ID
    const result: SubmissionMetaDb = {
      ...submissionData,
      databaseId: `storage_${email}_${metadata.timeCreated}`, // Generate a unique ID
      metadataUrl: downloadUrl,
    };

    return result;
  } catch (error: any) {
    // If file doesn't exist, return null instead of throwing
    if (error.code === 'storage/object-not-found') {
      return null;
    }
    console.error('Error fetching user submission from Firebase Storage:', error);
    throw new Error('Failed to fetch user submission from Firebase Storage');
  }
};

// Implementation for listing all submissions from Firebase Storage metadata
const listAllSubmissionsFireBaseMeta = async (): Promise<SubmissionMetaDb[]> => {
  try {
    // Create reference to the metadata directory
    const storage = lazyFirebaseStorage();
    const metadatasDirRef = ref(storage, 'submissions/metadatas/');

    // List all files in the metadata directory
    const listResult = await listAll(metadatasDirRef);

    // Process all metadata files concurrently
    const submissionPromises = listResult.items.map(async (itemRef) => {
      try {
        // Get download URL and metadata for each file
        const [downloadUrl, metadata] = await Promise.all([
          getDownloadURL(itemRef),
          getMetadata(itemRef),
        ]);

        // Download and parse the JSON content
        const submissionData = await downloadJsonMetadata(downloadUrl);

        // Extract email from the file path for ID generation
        const email = extractEmailFromPath(itemRef.fullPath);

        // Return the submission with metadata URL and generated database ID
        const result: SubmissionMetaDb = {
          ...submissionData,
          databaseId: `storage_${email}_${metadata.timeCreated}`, // Generate a unique ID
          metadataUrl: downloadUrl,
        };

        return result;
      } catch (error) {
        console.error(`Error processing metadata file ${itemRef.name}:`, error);
        return null; // Return null for failed files
      }
    });

    // Wait for all promises to resolve and filter out null results
    const submissions = await Promise.all(submissionPromises);
    const validSubmissions = submissions.filter(
      (submission): submission is SubmissionMetaDb => submission !== null
    );

    // Sort by creation date (newest first)
    return validSubmissions.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error('Error fetching all submissions from Firebase Storage:', error);
    throw new Error('Failed to fetch all submissions from Firebase Storage');
  }
};

export const databaseApi: DataBaseApiInterface = {
  // Save submission metadata to Firestore and optionally to Firebase Storage
  saveSubmission: async (submissionData: SubmissionData): Promise<SubmissionMetaDb> => {
    try {
      const email = submissionData.email;

      // Prepare submission data with timestamp
      const submissionWithTimestamp = submissionData;

      // Save metadata as JSON file in Storage
      const metadataPath = `submissions/metadatas/${email}.json`;
      const metadataBlob = new Blob([JSON.stringify(submissionWithTimestamp, null, 2)], {
        type: 'application/json',
      });
      const metadataFile = new File([metadataBlob], 'metadata.json');
      const metadataUrl = await uploadFile(metadataFile, metadataPath);

      const result: SubmissionMetaDb = {
        ...submissionWithTimestamp,
        databaseId: '',
        metadataUrl,
      };

      return result;
    } catch (error) {
      console.error('Error saving submission:', error);
      throw new Error('Failed to save submission metadata');
    }
  },

  getMySubmission: async (email: string): Promise<SubmissionMetaDb | null> => {
    return await getMySubmissionFireBaseMeta(email);
  },

  listAllSubmissions: async (): Promise<SubmissionMetaDb[]> => {
    return await listAllSubmissionsFireBaseMeta();
  },
};
