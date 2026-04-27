import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Fixture from "./pages/Fixture";
import Ranking from "./pages/Ranking";
import MiProde from "./pages/MiProde";
import Admin from "./pages/Admin";
import UnirseGrupo from "./pages/UnirseGrupo";
import Cargando from "./components/layout/Cargando";
import { useRegistrarUsuario } from "./hooks/useRegistrarUsuario";

export default function App() {
  const { isLoading, isAuthenticated, user } = useAuth0();
  const [grupo, setGrupo] = useState(null);
  const [verificandoGrupo, setVerificandoGrupo] = useState(false);
  const [grupoVerificado, setGrupoVerificado] = useState(false);

  useRegistrarUsuario();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    setVerificandoGrupo(true);
    fetch(`/api/grupos?userId=${encodeURIComponent(user.sub)}`)
      .then((r) => r.json())
      .then((data) => { if (data.grupo) setGrupo(data.grupo); })
      .catch(() => {})
      .finally(() => {
        setVerificandoGrupo(false);
        setGrupoVerificado(true);
      });
  }, [isAuthenticated, user]);

  if (isLoading || verificandoGrupo || (isAuthenticated && !grupoVerificado)) return <Cargando />;

  const esAdmin = user?.email === "nikoagnello1@gmail.com";

  if (isAuthenticated && grupoVerificado && !grupo && !esAdmin) {
    return (
      <Layout>
        <UnirseGrupo onUnirse={setGrupo} />
      </Layout>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fixture" element={<Fixture />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/mi-prode" element={<MiProde />} />
        <Route path="/admin" element={<Admin />} />
        {/* Redirects rutas viejas */}
        <Route path="/partidos" element={<Navigate to="/fixture" replace />} />
        <Route path="/cruces" element={<Navigate to="/fixture" replace />} />
        <Route path="/mis-predicciones" element={<Navigate to="/mi-prode" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
