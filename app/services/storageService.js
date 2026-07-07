import { initializeApp, getApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getDownloadURL, getStorage, ref, uploadBytes } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";
import { firebaseConfig } from "../firebase.js";
import { doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getDb } from "./firebaseService.js";
import { syncPublicProfile } from "./publicProfile.js";

function getFirebaseApp() {
  try {
    return getApp();
  } catch (_) {
    return initializeApp(firebaseConfig);
  }
}

function getStorageInstance() {
  return getStorage(getFirebaseApp(), firebaseConfig.storageBucket);
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function resizeToJpeg(img, maxSize, quality) {
  const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
  });
}

export async function uploadProfileImage(uid, file) {
  const img = await loadImage(file);
  const [fullBlob, thumbBlob] = await Promise.all([
    resizeToJpeg(img, 1536, 0.88),
    resizeToJpeg(img, 384, 0.8),
  ]);
  const ts = Date.now();
  const pathFull = `profiles/${uid}/${ts}_full.jpg`;
  const pathThumb = `profiles/${uid}/${ts}_thumb.jpg`;
  const storage = getStorageInstance();
  const fullRef = ref(storage, pathFull);
  const thumbRef = ref(storage, pathThumb);

  await uploadBytes(fullRef, fullBlob, { contentType: "image/jpeg" });
  await uploadBytes(thumbRef, thumbBlob, { contentType: "image/jpeg" });
  const [urlFull, urlThumb] = await Promise.all([getDownloadURL(fullRef), getDownloadURL(thumbRef)]);

  const payload = {
    profileImageUrlFull: urlFull,
    profileImagePathFull: pathFull,
    profileImageUrlThumb: urlThumb,
    profileImagePathThumb: pathThumb,
    profileImageVersionMs: ts,
  };
  await updateDoc(doc(getDb(), "users", uid), payload);
  await syncPublicProfile(uid, payload);
  return payload;
}

export async function clearProfileImage(uid) {
  const payload = {
    profileImageUrlFull: "",
    profileImagePathFull: "",
    profileImageUrlThumb: "",
    profileImagePathThumb: "",
    profileImageVersionMs: 0,
  };
  await updateDoc(doc(getDb(), "users", uid), payload);
  await syncPublicProfile(uid, payload);
}

export async function uploadWorkImage(uid, file) {
  const img = await loadImage(file);
  const [fullBlob, thumbBlob] = await Promise.all([
    resizeToJpeg(img, 1280, 0.8),
    resizeToJpeg(img, 480, 0.7),
  ]);
  const ts = Date.now();
  const pathFull = `works/${uid}/${ts}_full.jpg`;
  const pathThumb = `works/${uid}/${ts}_thumb.jpg`;
  const storage = getStorageInstance();
  const fullRef = ref(storage, pathFull);
  const thumbRef = ref(storage, pathThumb);

  await uploadBytes(fullRef, fullBlob, { contentType: "image/jpeg" });
  await uploadBytes(thumbRef, thumbBlob, { contentType: "image/jpeg" });
  const [urlFull, urlThumb] = await Promise.all([getDownloadURL(fullRef), getDownloadURL(thumbRef)]);

  return {
    urlFull,
    urlThumb,
    pathFull,
    pathThumb,
  };
}

export function profileAvatarUrl(user) {
  const thumb = user?.profileImageUrlThumb;
  const full = user?.profileImageUrlFull;
  const ver = user?.profileImageVersionMs;
  const base = thumb || full || "";
  if (!base) return "";
  if (ver) return `${base}${base.includes("?") ? "&" : "?"}v=${ver}`;
  return base;
}
