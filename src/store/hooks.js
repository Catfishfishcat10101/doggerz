// src/redux/hooks.js
import { useDispatch, useSelector } from "react-redux";

/**
 * Custom hook to dispatch actions.
 * Use this instead of plain `useDispatch` for better IDE support.
 */
export const useAppDispatch = () => useDispatch();

/**
 * Custom hook to select data from the store.
 * Usage: const dog = useAppSelector(state => state.dog);
 */
export const useAppSelector = useSelector;
