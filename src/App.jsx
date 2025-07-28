import { useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser } from "./redux/userSlice";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import MainGame from "./components/UI/MainGame";
import Splash from "./components/UI/Splash";

function App() {
  const loggedIn = useSelector((s) => s.user.loggedIn);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setUser({ uid: user.uid, email: user.email }));
      } else {
        dispatch(clearUser());
      }
    });

    return () => unsub();
  }, []);

  return (
    <Routes>
      <Route index element={<Navigate to={Routes.HOME} replace />} />
      <Route path="doggerz" element={<Splash />} />
      <Route path="doggerz/login" element={<Login />} />
      <Route path="doggerz/signup" element={<Signup />} />
      <Route
        path="doggerz/game"
        element={
          loggedIn ? <MainGame /> : <Navigate to={Routes.LOGIN} replace />
        }
      />
      <Route path="*" element={<Navigate to={Routes.HOME} replace />} />
    </Routes>
  );
}

export default App;
