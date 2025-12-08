import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import UsersPage from "./pages/UsersPage";
import ItemTypesPage from "./pages/ItemTypesPage";
import ItemsPage from "./pages/ItemsPage";
import RoomsPage from "./pages/RoomsPage";
import ClientsPage from "./pages/ClientsPage";
import DrinkReportsPage from "./pages/DrinkReportsPage";
import SessionsReportsPage from "./pages/SessionsReportsPage";

function App() {
  const location = useLocation();
  const { isLogged } = useSelector((state) => state.login);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Routes>
          <Route
            path="/login"
            element={!isLogged ? <Login /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={isLogged ? <Home /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={isLogged ? <UsersPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/item-types"
            element={isLogged ? <ItemTypesPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/items"
            element={isLogged ? <ItemsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/rooms"
            element={isLogged ? <RoomsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/clients"
            element={isLogged ? <ClientsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/drink-reports"
            element={isLogged ? <DrinkReportsPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/sessions-reports"
            element={
              isLogged ? <SessionsReportsPage /> : <Navigate to="/login" />
            }
          />
          <Route
            path="*"
            element={<Navigate to={isLogged ? "/" : "/login"} />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
