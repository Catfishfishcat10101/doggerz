// src/redux/memorialsSlice.js
// @ts-nocheck

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { announce } from "@/utils/announcer.js";
import { db, auth } from "@/firebase.js";
import {
  collection as fsCollection,
  addDoc,
  getDocs,
  deleteDoc,
  doc as fsDoc,
} from "firebase/firestore";

// Thunks: save, fetch, delete memorials from Firestore with local fallback
export const fetchMemorials = createAsyncThunk(
  "memorials/fetch",
  async (_, { rejectWithValue }) => {
    try {
      const user = auth?.currentUser;
      if (!user) {
        // read from localStorage fallback
        const raw = localStorage.getItem("doggerz:memorials") || "[]";
        return JSON.parse(raw);
      }
      // modular firestore API
      const colRef = fsCollection(db, `users/${user.uid}/memorials`);
      const snap = await getDocs(colRef);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      return docs;
    } catch (err) {
      return rejectWithValue(err.message || String(err));
    }
  }
);

export const saveMemorial = createAsyncThunk(
  "memorials/save",
  async (memorial, { rejectWithValue }) => {
    try {
      const user = auth?.currentUser;
      const payload = { ...memorial, savedAt: Date.now() };
      if (!user) {
        // local fallback
        const existing = JSON.parse(localStorage.getItem("doggerz:memorials") || "[]");
        existing.unshift(payload);
        localStorage.setItem("doggerz:memorials", JSON.stringify(existing));
        return payload;
      }
      const colRef = fsCollection(db, `users/${user.uid}/memorials`);
      const ref = await addDoc(colRef, payload);
      return { id: ref.id, ...payload };
    } catch (err) {
      return rejectWithValue(err.message || String(err));
    }
  }
);

export const deleteMemorial = createAsyncThunk(
  "memorials/delete",
  async (id, { rejectWithValue }) => {
    try {
      const user = auth?.currentUser;
      if (!user) {
        const existing = JSON.parse(localStorage.getItem("doggerz:memorials") || "[]");
        const filtered = existing.filter((m) => m.id !== id);
        localStorage.setItem("doggerz:memorials", JSON.stringify(filtered));
        return id;
      }
      const docRef = fsDoc(db, `users/${user.uid}/memorials/${id}`);
      await deleteDoc(docRef);
      return id;
    } catch (err) {
      return rejectWithValue(err.message || String(err));
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const memorialsSlice = createSlice({
  name: "memorials",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemorials.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchMemorials.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload || [];
      })
      .addCase(fetchMemorials.rejected, (s, a) => {
        s.loading = false;
        s.error = a.payload || a.error?.message;
      })
      .addCase(saveMemorial.fulfilled, (s, a) => {
        s.items.unshift(a.payload);
        try {
          announce({ message: "Memorial saved.", type: "success" });
        } catch (e) {}
      })
      .addCase(deleteMemorial.fulfilled, (s, a) => {
        s.items = s.items.filter((m) => m.id !== a.payload);
        try {
          announce({ message: "Memorial deleted.", type: "info" });
        } catch (e) {}
      });
  },
});

export default memorialsSlice.reducer;
