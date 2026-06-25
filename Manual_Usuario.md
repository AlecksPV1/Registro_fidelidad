# Manual de Usuario: Sistema de Fidelidad QR

Bienvenido al manual de uso y configuración de tu **App de Fidelidad**. Este documento te guiará paso a paso sobre cómo operar el panel de administrador, registrar clientes, escanear códigos y configurar tus reglas de WhatsApp.

---

## 1. Acceso al Panel de Administrador

Para garantizar la seguridad de tus datos, el panel de administración está protegido con contraseña.

1. Ve a la página principal de la aplicación.
2. En la esquina inferior derecha (footer), encontrarás un pequeño **ícono de candado**. Haz clic en él.
3. Se abrirá la pantalla de inicio de sesión. Ingresa tus credenciales:
   - **Usuario:** `FidelidadAdmin`
   - **Contraseña:** `ConteoContraseña`

---

## 2. Configurar el Bot de WhatsApp

Para que la aplicación pueda enviar los códigos QR de bienvenida y las alertas automáticas de visitas, debes vincular el número de WhatsApp de tu negocio.

1. Dentro del panel de Administrador, dirígete a la pestaña **WhatsApp**.
2. Verás un mensaje de "Esperando Código QR...". Tras unos segundos, aparecerá un **Código QR grande** en la pantalla.
3. Toma tu teléfono móvil (el que tiene la cuenta de WhatsApp de tu negocio).
4. Abre WhatsApp, ve a **Configuración > Dispositivos Vinculados > Vincular un dispositivo**.
5. Escanea el código QR de la pantalla.
6. ¡Listo! El indicador cambiará a un **Check Verde** diciendo "¡WhatsApp Conectado!".

---

## 3. Configurar Reglas de Mensajería (Promociones)

Puedes definir en qué visitas se enviarán mensajes automáticos (por ejemplo, alertas de premio).

1. En el panel de Administrador, ve a la pestaña **Reglas**.
2. En la sección **"Agregar Regla"**:
   - **Número de Visita:** Escribe el número en el que quieres disparar el mensaje (ej. `5`, `8`, o `9`).
   - **Mensaje:** Escribe el texto. Usa la etiqueta `{nombre}` para que el bot inserte automáticamente el nombre del cliente. (Ej: *"¡Hola {nombre}! En tu próxima visita tu café es gratis."*)
   - **Reiniciar Contador:** Marca esta casilla si esta regla representa el premio final. Al marcarla, cuando el cliente alcance esta visita, su contador volverá a `0` para iniciar el ciclo nuevamente.
3. Haz clic en **Guardar Regla**.

---

## 4. Registro y Consulta de Clientes

### Para nuevos clientes:
Tus clientes pueden registrarse ellos mismos desde su celular escaneando un código QR que lleve a la página principal de la app, o puedes registrarles tú mismo.
1. Al llenar Nombre y Teléfono, el sistema les mostrará su QR personal en pantalla y les enviará un mensaje de bienvenida por WhatsApp.

### Para clientes ya registrados:
Si un cliente olvidó su QR o quiere saber cuántas visitas tiene:
1. En la página principal, haz clic en el botón inferior: **"¿Ya estás registrado? Consulta tu código"**.
2. Ingresa el número de teléfono.
3. La app mostrará el QR original y la cantidad de visitas acumuladas.

---

## 5. Escaneo en el Local

Cuando un cliente llegue a tu local, el proceso es muy rápido:
1. Desde tu tablet o celular como cajero, inicia sesión en el **Administrador** y ve a la pestaña **Escanear**.
2. Permite el acceso a la cámara si el navegador te lo pide.
3. Apunta la cámara al QR del cliente.
4. El sistema pitará o mostrará un mensaje verde de éxito (Ej: *Visita registrada para Juan Pérez. Total: 4*). 
5. Si el cliente alcanzó una meta configurada en las reglas, recibirá automáticamente su mensaje de WhatsApp.
6. Haz clic en **"Escanear de Nuevo"** para prepararte para el siguiente cliente.
