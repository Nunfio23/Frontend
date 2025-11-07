// URL base del servicio de autenticación
const AUTH_API = "https://accounts.beckysflorist.site/api/auth";

// ======== LOGIN ========
async function login(email, password) {
  try {
    const response = await fetch(AUTH_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include", // importante para recibir la cookie "token"
    });

    if (!response.ok) {
      alert("Usuario o contraseña incorrectos");
      return;
    }

    alert("Inicio de sesión exitoso ✅");
    // Redirigir al home o dashboard
    window.location.href = "pages/home.html";
  } catch (err) {
    console.error("Error en login:", err);
  }
}

// ======== VALIDAR COOKIE ========
async function validarSesion() {
  try {
    const response = await fetch(`${AUTH_API}/validation/cookie`, {
      method: "GET",
      credentials: "include", // envía la cookie al servidor
    });

    if (response.ok) {
      const user = await response.json();
      console.log("Usuario autenticado:", user);
      return user;
    } else {
      console.warn("Sesión no válida, redirigiendo al login...");
      window.location.href = "../index.html";
    }
  } catch (err) {
    console.error("Error validando cookie:", err);
  }
}
