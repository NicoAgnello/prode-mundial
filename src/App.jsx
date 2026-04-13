import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { useState, useEffect } from "react";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Partidos from "./pages/Partidos";
import Ranking from "./pages/Ranking";
import MisPredicciones from "./pages/MisPredicciones";
import Admin from "./pages/Admin";
import Cuadro from "./pages/Cuadro";
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
      .then((data) => {
        if (data.grupo) setGrupo(data.grupo);
      })
      .catch(() => {})
      .finally(() => {
        setVerificandoGrupo(false);
        setGrupoVerificado(true);
      });
  }, [isAuthenticated, user]);

  if (isLoading || verificandoGrupo) return <Cargando />;

  const esAdmin = user?.email === "nikoagnello1@gmail.com";

  // Usuario logueado sin grupo → pantalla de código (excepto admin)
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
        <Route path="/partidos" element={<Partidos />} />
        <Route path="/cruces" element={<Cuadro />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/mis-predicciones" element={<MisPredicciones />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Layout>
  );
}
