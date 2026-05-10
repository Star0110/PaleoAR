import { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getDinosaurs } from "../services/dinosaurService";
import {
  subscribeToVisitas,
  calcularNivel,
  calcularProgreso,
  sincronizarNivel,
  NIVELES,
} from "../services/gamificationService";

export default function useGamification() {
  const { user } = useContext(AuthContext);
  const [visitas, setVisitas] = useState([]);
  const [totalFosiles, setTotalFosiles] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDinosaurs().then((d) => setTotalFosiles(d.length));
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToVisitas(user.uid, async (v) => {
      setVisitas(v);
      setLoading(false);
      // Sincroniza nivel en Firestore automáticamente
      await sincronizarNivel(user.uid, v.length, totalFosiles).catch(() => {});
    });
    return unsub;
  }, [user, totalFosiles]);

  const nivel = calcularNivel(visitas.length, totalFosiles);
  const progreso = calcularProgreso(visitas.length, totalFosiles);
  const insigniaActual = NIVELES.find((n) => n.nivel === nivel) ?? null;
  const insigniaSiguiente = NIVELES.find((n) => n.nivel === nivel + 1) ?? null;

  return {
    visitas,
    totalFosiles,
    nivel,
    progreso,
    insigniaActual,
    insigniaSiguiente,
    loading,
  };
}
