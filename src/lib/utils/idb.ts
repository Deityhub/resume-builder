// Minimal IndexedDB wrapper for storing resumes
import type { ResumeData } from '../types/resume';

export type ResumeRecord = ResumeData;

const DB_NAME = 'resume-builder-db';
const STORE_NAME = 'resumes';
const DB_VERSION = 1;

export function isIndexedDBSupported(): boolean {
	// Check for IndexedDB support
	if (!window?.indexedDB) {
		return false;
	}

	// Check for required features
	try {
		return !!(
			window.indexedDB &&
			window.IDBTransaction &&
			window.IDBKeyRange &&
			window.IDBObjectStore
		);
	} catch {
		return false;
	}
}

function openDB(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		if (!isIndexedDBSupported()) {
			reject(new Error('IndexedDB not supported in this browser'));
			return;
		}

		const req = window.indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = () => {
			const db = req.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME, { keyPath: 'id' });
			}
		};
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

// Clean the resume data to ensure it can be stored in IndexedDB
function cleanResumeData(record: ResumeData): ResumeData {
	return JSON.parse(JSON.stringify(record));
}

export async function saveResume(record: ResumeData): Promise<void> {
	const db = await openDB();

	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');

		tx.oncomplete = () => {
			resolve();
		};

		tx.onerror = () => {
			reject(tx.error || new Error('Unknown transaction error'));
		};

		tx.onabort = () => {
			reject(new Error('Transaction was aborted'));
		};

		try {
			const store = tx.objectStore(STORE_NAME);
			// Clean the data and add updatedAt
			const cleanData = {
				...cleanResumeData(record),
				updatedAt: Date.now()
			};
			const request = store.put(cleanData);

			request.onsuccess = () => {
				resolve();
			};

			request.onerror = () => {
				reject(request.error || new Error('Unknown store error'));
			};
		} catch (error) {
			console.error('Error in transaction:', error);
			reject(error);
		}
	});
}

export async function getAllResumes(): Promise<ResumeData[]> {
	const db = await openDB();

	return new Promise((resolve, reject) => {
		const store = db.transaction(STORE_NAME).objectStore(STORE_NAME);
		const req = store.getAll();
		req.onsuccess = () => resolve(req.result as ResumeRecord[]);
		req.onerror = () => reject(req.error);
	});
}

export async function getResume(id: string): Promise<ResumeData | undefined> {
	const db = await openDB();

	return new Promise((resolve, reject) => {
		const store = db.transaction(STORE_NAME).objectStore(STORE_NAME);
		const req = store.get(id);
		req.onsuccess = () => resolve(req.result as ResumeRecord | undefined);
		req.onerror = () => reject(req.error);
	});
}

export async function deleteResume(id: string): Promise<void> {
	const db = await openDB();

	return new Promise((resolve, reject) => {
		const tx = db.transaction(STORE_NAME, 'readwrite');
		tx.objectStore(STORE_NAME).delete(id);
		tx.oncomplete = () => resolve();
		tx.onerror = () => reject(tx.error);
	});
}
