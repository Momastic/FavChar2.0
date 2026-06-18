# FavChar — Tu colección de personajes organizados

Una app para agregar y organizar tus personajes favoritos de películas, series, videojuegos, anime y más. Crea listas, grupos, agrega información completa y galería de imágenes.

## ✨ Características

- **Archivos (Listas)**: Organiza tus personajes en diferentes colecciones
- **Grupos dentro de archivos**: Sub-categorías por serie, película, equipo, etc.
- **Fichas completas**: Nombre, descripción, altura, peso, apodos, estilos/prendas
- **Galería de imágenes**: Foto de perfil cuadrada + galería de estilos
- **Números de catálogo**: Cada personaje recibe un ID único (001, 002...) que nunca cambia
- **Orden flexible**: Por entrada, alfabético, o manual (arrastra y suelta)
- **Favoritos**: Marca personajes como favoritos y aparecen automáticamente en una lista especial
- **Persistencia**: Todo se guarda automáticamente en tu navegador

## 🚀 Deploy a Vercel (La forma más fácil)

### Paso 1: Crear una cuenta en GitHub (si no tienes)
1. Ve a https://github.com
2. Click en "Sign up"
3. Completa tu email, contraseña y username
4. Verifica tu email

### Paso 2: Crear un repositorio en GitHub
1. Inicia sesión en GitHub
2. Haz click en el `+` arriba a la derecha → "New repository"
3. Dale el nombre: `favchar`
4. Descripción: "Mi colección de personajes favoritos"
5. Selecciona "Public" (importante: debe ser público para que Vercel pueda acceder)
6. Click en "Create repository"

### Paso 3: Subir el código a GitHub
Abre PowerShell (o Git Bash si tienes) y ejecuta estos comandos **uno por uno**:

```powershell
# Navega a donde tengas el proyecto (reemplaza la ruta si es necesario)
cd C:\ruta\donde\bajaste\el\proyecto

# Inicializa Git
git init

# Agrega todos los archivos
git add .

# Crea un commit
git commit -m "Primer commit: FavChar inicial"

# Cambia el nombre de la rama a "main"
git branch -M main

# Conecta con el repositorio de GitHub (reemplaza TU_USUARIO con tu username)
git remote add origin https://github.com/TU_USUARIO/favchar.git

# Sube el código a GitHub
git push -u origin main
```

**Nota**: Si te pide usuario y contraseña:
- Usuario: tu username de GitHub
- Contraseña: un "Personal Access Token" (ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token → Dale permisos a `repo` → Copia el token y úsalo como contraseña)

### Paso 4: Conectar a Vercel y deployar
1. Ve a https://vercel.com
2. Click en "Sign up"
3. Selecciona "Continue with GitHub"
4. Autoriza que Vercel acceda a tu GitHub
5. Una vez dentro, click en "Add New..." → "Project"
6. Verás tu repositorio `favchar` → Haz click en él
7. Vercel detectará automáticamente que es un proyecto Vite (React)
8. Deja todo como está y click en "Deploy"
9. **¡Listo!** En unos 30-60 segundos tu app estará viva en internet

Una vez desplegada, Vercel te dará una URL como `https://favchar-abc123.vercel.app` — esa es tu app en vivo.

### Paso 5: Cada vez que quieras hacer cambios
1. Edita los archivos locales
2. Sube a GitHub:
```powershell
git add .
git commit -m "Descripción de lo que cambiaste"
git push
```
3. Vercel automáticamente detectará los cambios y redeploy la app (sin hacer nada)

---

## 🛠️ Desarrollo local (opcional, si quieres probar antes de subir)

Si tienes Node.js instalado:

```bash
# Instala dependencias
npm install

# Corre la app en tu navegador (http://localhost:5173)
npm run dev

# Para crear la versión de producción
npm run build
```

---

## 📝 Notas importantes

- **Los datos se guardan en tu navegador** (localStorage): son privados, no se envían a ningún servidor
- **Si limpias el cache del navegador**, se borran los datos → pero puedes exportar manualmente si quieres
- **Las imágenes se comprimen automáticamente** para que no pesen demasiado
- Si encuentras bugs, avísame y los arreglamos

---

## 🎨 Personalización futura

Una vez esté funcionando, podemos:
- Cambiar colores y diseño
- Agregar más campos a los personajes
- Exportar e importar datos en JSON
- Agregar busca avanzada
- Hacer una app de escritorio con Electron

---

¿Preguntas? Avísame en cualquier paso.
