import axios from "axios";

export async function obtenerTasaBCRA() {
  try {
    const url = "https://api.bcra.gob.ar/estadisticas/v3.0/Monetarias/14";

    const headers = {
      "Authorization": "Bearer eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3ODA2ODUyMjcsInR5cGUiOiJleHRlcm5hbCIsInVzZXIiOiJwbGF5bWFydHUxOEBnbWFpbC5jb20ifQ.uFWlbUryqQJYCnelGF9amd-y6R7Qdkq02JRR4lo-s-3q9fNjAao680gthXrnk_QqHySzIQenulsfHnfq-pncWg"
    };

    const response = await axios.get(url, { headers });

    if (response.status !== 200) {
      console.log("❌ Error en la respuesta del BCRA:", response.data);
      return null;
    }

    const datos = response.data;

    if (!datos.results || datos.results.length === 0) {
      console.log("❌ Lista vacía desde BCRA");
      return null;
    }

    const ultimo = datos.results[0];  // El más nuevo

    return {
      fecha: ultimo.fecha,
      valor: ultimo.valor
    };

  } catch (error) {
    console.error("❌ Error obteniendo tasa BCRA:", error.message);
    return null;
  }
}
