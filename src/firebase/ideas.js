import {
  collection, addDoc, getDocs, getDoc, doc,
  updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp, arrayUnion, arrayRemove,
  setDoc
} from 'firebase/firestore';
import { db } from './config';

const IDEAS_COLLECTION = 'ideas';

// Add new idea (no manual thumbnail upload)
export const addIdea = async (ideaData, userId) => {
  const docRef = await addDoc(collection(db, IDEAS_COLLECTION), {
    ...ideaData,
    userId,
    bookmarkedBy: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get all ideas
export const getIdeas = async () => {
  const q = query(collection(db, IDEAS_COLLECTION), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Get single idea
export const getIdea = async (ideaId) => {
  const docRef = doc(db, IDEAS_COLLECTION, ideaId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

// Update idea (no manual thumbnail upload)
export const updateIdea = async (ideaId, updates) => {
  const docRef = doc(db, IDEAS_COLLECTION, ideaId);
  await updateDoc(docRef, updates);
};

// Delete idea
export const deleteIdea = async (ideaId) => {
  await deleteDoc(doc(db, IDEAS_COLLECTION, ideaId));
};

// Toggle bookmark — updates both the user's subcollection and the idea's bookmarkedBy array
export const toggleBookmark = async (ideaId, userId, isCurrentlyBookmarked) => {
  const bookmarkRef = doc(db, 'users', userId, 'bookmarks', ideaId);
  const ideaRef = doc(db, IDEAS_COLLECTION, ideaId);

  if (isCurrentlyBookmarked) {
    await deleteDoc(bookmarkRef);
    await updateDoc(ideaRef, { bookmarkedBy: arrayRemove(userId) });
  } else {
    await setDoc(bookmarkRef, {
      ideaId,
      createdAt: serverTimestamp(),
    });
    await updateDoc(ideaRef, { bookmarkedBy: arrayUnion(userId) });
  }
};

// Get ideas bookmarked by user — reads from user's bookmarks subcollection,
// then fetches the actual idea documents
export const getBookmarkedIdeas = async (userId) => {
  // First try the new subcollection approach
  try {
    const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
    const bookmarkSnap = await getDocs(bookmarksRef);

    if (bookmarkSnap.empty) {
      // Fallback: try legacy array-contains query
      return await getBookmarkedIdeasLegacy(userId);
    }

    // Fetch each bookmarked idea
    const ideas = [];
    for (const bookmarkDoc of bookmarkSnap.docs) {
      const ideaId = bookmarkDoc.data().ideaId || bookmarkDoc.id;
      try {
        const ideaSnap = await getDoc(doc(db, IDEAS_COLLECTION, ideaId));
        if (ideaSnap.exists()) {
          ideas.push({ id: ideaSnap.id, ...ideaSnap.data() });
        }
      } catch (err) {
        // Idea might have been deleted — skip it
      }
    }
    return ideas;
  } catch (err) {
    // If subcollection approach fails, fall back to legacy
    return await getBookmarkedIdeasLegacy(userId);
  }
};

// Legacy: Get bookmarked ideas from the bookmarkedBy array on idea documents
const getBookmarkedIdeasLegacy = async (userId) => {
  const q = query(
    collection(db, IDEAS_COLLECTION),
    where('bookmarkedBy', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

// Check if a user has bookmarked a specific idea (checks subcollection)
export const isIdeaBookmarked = async (ideaId, userId) => {
  const bookmarkRef = doc(db, 'users', userId, 'bookmarks', ideaId);
  const snap = await getDoc(bookmarkRef);
  return snap.exists();
};

// Get all bookmarked idea IDs for a user (for batch checking)
export const getUserBookmarks = async (userId) => {
  const bookmarksRef = collection(db, 'users', userId, 'bookmarks');
  const snap = await getDocs(bookmarksRef);
  return new Set(snap.docs.map(d => d.data().ideaId || d.id));
};
