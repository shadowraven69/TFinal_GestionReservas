# Pruebas Funcionales — Sistema de Reservas

Documento de verificación para la sustentación. Marcar cada caso a medida que se prueba.

## Requisitos previos

- Sistema corriendo con `docker compose up --build` o en desarrollo local
- Backend en http://localhost:8000
- Frontend en http://localhost:3000
- Swagger en http://localhost:8000/docs

---

## Casos de Prueba

### Autenticación

- [ ] **CP01 — Login con usuario válido**
  1. Ir a http://localhost:3000/login
  2. Ingresar: admin / admin123
  3. **Esperado**: Redirige al panel admin, muestra "admin" en navbar
  4. ✅ / ❌

- [ ] **CP02 — Login con credenciales incorrectas**
  1. Ir a http://localhost:3000/login
  2. Ingresar: admin / contraseña_incorrecta
  3. **Esperado**: Muestra mensaje de error, no redirige
  4. ✅ / ❌

- [ ] **CP03 — Registro de nuevo usuario**
  1. Ir a http://localhost:3000/register
  2. Completar formulario con datos válidos
  3. **Esperado**: Redirige a login, usuario creado
  4. ✅ / ❌

### Reservas

- [ ] **CP04 — Usuario crea reserva válida**
  1. Iniciar sesión como usuario normal
  2. Ir a "Nueva Reserva"
  3. Seleccionar espacio, fecha futura (+24hs), horario válido
  4. **Esperado**: Reserva creada en estado "esperando"
  5. ✅ / ❌

- [ ] **CP05 — Usuario intenta reservar espacio ocupado**
  1. Crear una reserva en un espacio/fecha/horario
  2. Intentar crear otra reserva en el mismo espacio/fecha/horario
  3. **Esperado**: Error por conflicto de horario
  4. ✅ / ❌

- [ ] **CP06 — Reserva con menos de 24 horas de anticipación**
  1. Intentar crear reserva para hoy o mañana con menos de 24hs
  2. **Esperado**: Error por anticipación insuficiente
  3. ✅ / ❌

- [ ] **CP07 — Reserva en domingo**
  1. Intentar crear reserva para un domingo
  2. **Esperado**: Error por día no permitido
  3. ✅ / ❌

- [ ] **CP08 — Reserva fuera de horario permitido**
  1. Intentar crear reserva a las 21:00 (lunes a viernes)
  2. **Esperado**: Error por horario no permitido
  3. ✅ / ❌

- [ ] **CP09 — Reserva supera capacidad del espacio**
  1. Crear reserva con asistentes > capacidad del espacio
  2. **Esperado**: Error por capacidad excedida
  3. ✅ / ❌

- [ ] **CP10 — Reserva en espacio inactivo**
  1. Como admin, cambiar un espacio a "inactivo"
  2. Como usuario, intentar reservar ese espacio
  3. **Esperado**: Error por espacio no disponible
  4. ✅ / ❌

### Administración

- [ ] **CP11 — Admin aprueba reserva**
  1. Como admin, ir a "Reservas" en panel admin
  2. Aprobar una reserva en estado "esperando"
  3. **Esperado**: Estado cambia a "aprobada"
  4. ✅ / ❌

- [ ] **CP12 — Admin rechaza reserva**
  1. Como admin, rechazar una reserva en estado "esperando"
  2. **Esperado**: Estado cambia a "rechazada"
  3. ✅ / ❌

### Consultas

- [ ] **CP13 — Usuario consulta sus reservas**
  1. Como usuario, ir a "Mis Reservas"
  2. **Esperado**: Solo ve sus propias reservas
  3. ✅ / ❌

- [ ] **CP14 — Admin consulta todas las reservas**
  1. Como admin, ir a "Reservas" en panel admin
  2. **Esperado**: Ve todas las reservas del sistema
  3. ✅ / ❌

---

## Resumen

| Total casos | Aprobados | Fallidos | Porcentaje |
|-------------|-----------|----------|------------|
| 14 | — | — | — % |
