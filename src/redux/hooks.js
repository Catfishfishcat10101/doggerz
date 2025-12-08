// src/redux/hooks.js
import { useDispatch, useSelector } from "react-redux";

/**
 * useAppDispatch
 * Returns the store dispatch but centrally casts to `any` so components
 * that need to dispatch thunks don't need to perform individual casts.
 * This keeps casts in one place and is easier to maintain.
 *
 * @returns {any}
 */
export function useAppDispatch() {
  // Cast to any to allow dispatching thunks (createAsyncThunk)
  return /** @type {any} */ (useDispatch());
}

/**
 * useAppSelector
 * Thin wrapper around useSelector to keep usage consistent.
 * @template T
 * @param {(state: any) => T} selector
 * @returns {T}
 */
export function useAppSelector(selector) {
  return useSelector(selector);
}

export default { useAppDispatch, useAppSelector };
