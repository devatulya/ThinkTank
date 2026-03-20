import {
  collection, addDoc, getDocs, getDoc, doc,
  updateDoc, deleteDoc, query, where, orderBy,
  serverTimestamp, arrayUnion, arrayRemove
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from './config';

const IDEAS_COLLECTION = 'ideas';

// Upload thumbnail to Firebase Storage and return download URL
export const uploadThumbnail = async (file, userId) => {
  const storageRef = ref(storage, `thumbnails/${userId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(storageRef, file);
  return await getDownloadURL(snapshot.ref);
};

// Add new idea
export const addIdea = async (ideaData, userId, thumbnailFile = null) => {
  let thumbnailUrl = '';
  if (thumbnailFile) {
    thumbnailUrl = await uploadThumbnail(thumbnailFile, userId);
  }
  const docRef = await addDoc(collection(db, IDEAS_COLLECTION), {
    ...ideaData,
    userId,
    thumbnailUrl,
    bookmarkedBy: [],
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

// Get all ideas (optionally filter by userId)
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

// Update idea
export const updateIdea = async (ideaId, updates, thumbnailFile = null, userId = null) => {
  if (thumbnailFile && userId) {
    updates.thumbnailUrl = await uploadThumbnail(thumbnailFile, userId);
  }
  const docRef = doc(db, IDEAS_COLLECTION, ideaId);
  await updateDoc(docRef, updates);
};

// Delete idea
export const deleteIdea = async (ideaId) => {
  await deleteDoc(doc(db, IDEAS_COLLECTION, ideaId));
};

// Toggle bookmark
export const toggleBookmark = async (ideaId, userId, isBookmarked) => {
  const docRef = doc(db, IDEAS_COLLECTION, ideaId);
  await updateDoc(docRef, {
    bookmarkedBy: isBookmarked ? arrayRemove(userId) : arrayUnion(userId),
  });
};

// Get ideas bookmarked by user
export const getBookmarkedIdeas = async (userId) => {
  const q = query(
    collection(db, IDEAS_COLLECTION),
    where('bookmarkedBy', 'array-contains', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};
