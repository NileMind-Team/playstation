import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Home from "./pages/Home";
import UsersPage from "./pages/UsersPage";

function App() {
  const location = useLocation();
  const { isLogged } = useSelector((state) => state.login);

  const shouldShowNavbarFooter = location.pathname !== "/login";

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
            path="*"
            element={<Navigate to={isLogged ? "/" : "/login"} />}
          />
        </Routes>
      </main>
      {shouldShowNavbarFooter && <Footer />}
    </div>
  );
}

export default App;
