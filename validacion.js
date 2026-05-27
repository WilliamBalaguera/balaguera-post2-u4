"use strict";

// ─── Funciones de retroalimentación visual ──────────────────────────────────

const mostrarError = (campoId, mensaje) => {
  const campo = document.querySelector(`#${campoId}`);
  const span  = document.querySelector(`#error-${campoId}`);
  campo.classList.add("invalido");
  campo.classList.remove("valido");
  span.textContent = mensaje;
  span.classList.add("visible");
};

const limpiarError = (campoId) => {
  const campo = document.querySelector(`#${campoId}`);
  const span  = document.querySelector(`#error-${campoId}`);
  campo.classList.remove("invalido");
  campo.classList.add("valido");
  span.textContent = "";
  span.classList.remove("visible");
};

const limpiarTodo = () => {
  ["nombre", "email", "password", "confirmar", "telefono"].forEach(id => {
    const campo = document.querySelector(`#${id}`);
    const span  = document.querySelector(`#error-${id}`);
    campo.classList.remove("invalido", "valido");
    span.textContent = "";
    span.classList.remove("visible");
  });
};
// ─── Validadores por campo ──────────────────────────────────────────────────

const validarNombre = () => {
  const campo = document.querySelector("#nombre");
  if (campo.validity.valueMissing) {
    mostrarError("nombre", "El nombre es obligatorio.");
    return false;
  }
  if (campo.validity.tooShort) {
    mostrarError("nombre", `El nombre debe tener al menos ${campo.minLength} caracteres.`);
    return false;
  }
  limpiarError("nombre");
  return true;
};

const validarEmail = () => {
  const campo = document.querySelector("#email");
  if (campo.validity.valueMissing) {
    mostrarError("email", "El correo es obligatorio.");
    return false;
  }
  if (campo.validity.typeMismatch) {
    mostrarError("email", "El formato del correo no es válido.");
    return false;
  }
  limpiarError("email");
  return true;
};

const validarPassword = () => {
  const campo = document.querySelector("#password");
  if (campo.validity.valueMissing) {
    mostrarError("password", "La contraseña es obligatoria.");
    return false;
  }
  if (campo.validity.tooShort) {
    mostrarError("password", "La contraseña debe tener al menos 8 caracteres.");
    return false;
  }
  // Validación manual con expresión regular: mínimo 1 mayúscula y 1 número
  const regex = /^(?=.*[A-Z])(?=.*\d).+$/;
  if (!regex.test(campo.value)) {
    mostrarError("password", "Debe incluir al menos una mayúscula y un número.");
    return false;
  }
  limpiarError("password");
  return true;
};

const validarConfirmar = () => {
  const password  = document.querySelector("#password").value;
  const confirmar = document.querySelector("#confirmar").value;
  if (!confirmar) {
    mostrarError("confirmar", "La confirmación es obligatoria.");
    return false;
  }
  if (password !== confirmar) {
    mostrarError("confirmar", "Las contraseñas no coinciden.");
    return false;
  }
  limpiarError("confirmar");
  return true;
};

const validarTelefono = () => {
  const campo = document.querySelector("#telefono");
  // Campo opcional: si está vacío es válido
  if (!campo.value.trim()) { limpiarError("telefono"); return true; }
  if (campo.validity.patternMismatch) {
    mostrarError("telefono", "Solo dígitos, entre 7 y 15 caracteres.");
    return false;
  }
  limpiarError("telefono");
  return true;
};
// ─── Validación en tiempo real (blur por campo) ─────────────────────────────

document.querySelector("#nombre")   .addEventListener("blur", validarNombre);
document.querySelector("#email")    .addEventListener("blur", validarEmail);
document.querySelector("#password") .addEventListener("blur", validarPassword);
document.querySelector("#confirmar").addEventListener("blur", validarConfirmar);
document.querySelector("#telefono") .addEventListener("blur", validarTelefono);

// Limpiar error de confirmación al comenzar a corregir
document.querySelector("#confirmar").addEventListener("input", () => {
  if (document.querySelector("#confirmar").value) limpiarError("confirmar");
});

// ─── Manejo del evento submit ───────────────────────────────────────────────

const form = document.querySelector("#form-registro");

form.addEventListener("submit", (e) => {
  e.preventDefault(); // Siempre prevenir el envío por defecto

  // Ejecutar todas las validaciones
  const resultados = [
    validarNombre(),
    validarEmail(),
    validarPassword(),
    validarConfirmar(),
    validarTelefono(),
  ];

  const todoValido = resultados.every(r => r === true);

  if (todoValido) {
    const mensajeExito = document.querySelector("#mensaje-exito");
    mensajeExito.classList.remove("oculto");

    // Limpiar formulario después de 2 segundos
    setTimeout(() => {
      form.reset();
      limpiarTodo();
      document.querySelector("#barra-fortaleza").style.width = "0%";
      document.querySelector("#fortaleza-texto").textContent = "";
      mensajeExito.classList.add("oculto");
    }, 2000);

  } else {
    // Enfocar el primer campo con error
    const primerInvalido = form.querySelector(".invalido");
    if (primerInvalido) primerInvalido.focus();
  }
});
// ─── Indicador de fortaleza de contraseña ──────────────────────────────────

const evaluarFortaleza = (valor) => {
  let puntos = 0;
  if (valor.length >= 8)           puntos++;
  if (/[A-Z]/.test(valor))         puntos++;
  if (/[0-9]/.test(valor))         puntos++;
  if (/[^A-Za-z0-9]/.test(valor))  puntos++;

  const niveles     = ["", "Débil",   "Regular", "Buena",   "Fuerte" ];
  const colores     = ["", "#ff6584", "#f5a623", "#6c63ff", "#3ddc97"];
  const porcentajes = [0,   25,        50,        75,        100     ];

  return { nivel: niveles[puntos], color: colores[puntos], porcentaje: porcentajes[puntos] };
};

const campoPassword = document.querySelector("#password");

campoPassword.addEventListener("input", () => {
  const { nivel, color, porcentaje } = evaluarFortaleza(campoPassword.value);
  const barra = document.querySelector("#barra-fortaleza");
  const texto = document.querySelector("#fortaleza-texto");

  barra.style.width      = campoPassword.value ? `${porcentaje}%` : "0%";
  barra.style.background = color;
  texto.textContent      = campoPassword.value ? `Contraseña: ${nivel}` : "";
  texto.style.color      = color;
});