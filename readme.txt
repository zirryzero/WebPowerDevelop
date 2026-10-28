PowerDevelop - Web corporativa (estática)

Estructura principal
- index.html (Inicio)
- servicios.html
- casos.html
- empresa.html
- contacto.html
- css/powerdevelop.css
- js/powerdevelop.js
- idiomas/es/textos.json
- idiomas/en/textos.json
- images/og-cover.jpg (preview redes/WhatsApp)

Cómo probar en local
1) Recomendado (por i18n vía fetch): desde esta carpeta ejecuta:
   - node dev-server.mjs
   - y visita http://127.0.0.1:8000
2) Si abres el HTML directamente (file://), el cambio de idioma puede no funcionar por restricciones del navegador al cargar JSON.

Formulario de contacto (hosting estático)
- En contacto.html reemplaza el atributo action del formulario por tu endpoint de Formspree/Getform.

Idiomas (ES/EN)
- Los textos están en `idiomas/es/textos.json` y `idiomas/en/textos.json`.
- En HTML, cada texto usa `data-i18n` o `data-i18n-attr` con claves.
