// ── PASTE YOUR FIREBASE CONFIG HERE ──
// Get it from: Firebase Console → Project Overview → pos-web app → SDK setup
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// ── Firebase SDK (loaded as module) ──
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const app = initializeApp(firebaseConfig);
const db  = getFirestore(app);

// ── PRODUCTS ──
async function getProducts() {
  const snap = await getDocs(collection(db, "products"));
  return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
}

async function saveProduct(product) {
  // product must have: name, qty (stock), price, category
  if (product._id) {
    const { _id, ...data } = product;
    await setDoc(doc(db, "products", _id), data);
    return _id;
  } else {
    const ref = await addDoc(collection(db, "products"), product);
    return ref.id;
  }
}

async function deleteProduct(id) {
  await deleteDoc(doc(db, "products", id));
}

async function updateProductStock(id, newQty) {
  await updateDoc(doc(db, "products", id), { qty: newQty });
}

// ── SALES ──
async function getSales() {
  const snap = await getDocs(query(collection(db, "sales"), orderBy("billNo", "desc")));
  return snap.docs.map(d => ({ _id: d.id, ...d.data() }));
}

async function saveSale(sale) {
  const ref = await addDoc(collection(db, "sales"), { ...sale, createdAt: serverTimestamp() });
  return ref.id;
}

async function deleteSale(id) {
  await deleteDoc(doc(db, "sales", id));
}

// ── LIVE LISTENERS ──
function onProductsChange(callback) {
  return onSnapshot(collection(db, "products"), snap => {
    const products = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
    callback(products);
  });
}

function onSalesChange(callback) {
  return onSnapshot(query(collection(db, "sales"), orderBy("billNo", "desc")), snap => {
    const sales = snap.docs.map(d => ({ _id: d.id, ...d.data() }));
    callback(sales);
  });
}

export {
  db,
  getProducts, saveProduct, deleteProduct, updateProductStock,
  getSales, saveSale, deleteSale,
  onProductsChange, onSalesChange
};
