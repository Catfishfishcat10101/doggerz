import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/Home";
import Game from "../pages/Game";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Settings from "../pages/Settings";
import Shop from "../pages/Shop";
import NotFound from "../pages/NotFound";
import Leaderboard from "../pages/Leaderboard";

export const router = createBrowserRouter([
	{
	path: "/",
	element: <App />,
	children: [
		{index: true, element:<Home />},
		{path: "game/dogid?", element:<Game />},
		{path: "shop", element:<Shop />},
		{path: "login", element:<Login />},
		{path: "signup", element:<Signup />},
		{path: "*", element:<NotFound />},
	],
	},
]);