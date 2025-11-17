import axios from "axios";

const BCRA_URL = "https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias/14";
const BCRA_TOKEN = "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODA2ODUyMjcsInR5cGUiOiJleHRlcm5hbCIsInVzZXIiOiJwbGF5bWFydHUxOEBnbWFpbC5jb20ifQ.uFWlbUryqQJYCnelGF9amd-y6R7Qdkq02JRR4lo-s-3q9fNjAao680gthXrnk_QqHySzIQenulsfHnfq-pncWg";

export async function obtenerTasaBCRA() {
  try {
    const response = await axios.get(BCRA_URL, {
      headers: { Authorization: BCRA_TOKEN }
    });

    if (!response.data?.results?.length) return null;

    const dato = response.data.results[0];

    return {
      fecha: dato.fecha,
      valor: dato.valor
    };

  } catch (error) {
    console.error("❌ Error al obtener tasa BCRA:", error.message);
    return null;
  }
}