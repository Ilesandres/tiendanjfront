const fs = require('fs');
const path = require('path');

// Cargar variables de entorno desde .env en desarrollo
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
    console.log('📁 Variables de entorno cargadas desde .env');
  } catch (error) {
    console.log('⚠️  No se pudo cargar dotenv, usando process.env');
  }
}

// Leer variables desde process.env (funciona en desarrollo y producción)
const devApiUrl = process.env.API_URL || 'http://localhost:8080';
const prodApiUrl = process.env.API_URL_PROD || process.env.API_URL || 'http://localhost:8080';

console.log(`📡 API_URL: ${devApiUrl}`);
console.log(`📡 API_URL_PROD: ${prodApiUrl}`);

// Contenido de los archivos
const devEnv = `export const environment = {
  production: false,
  apiUrl: '${devApiUrl}'
};
`;

const prodEnv = `export const environment = {
  production: true,
  apiUrl: '${prodApiUrl}'
};
`;

// Escribir los archivos
fs.writeFileSync(path.join(__dirname, '../src/environments/environment.ts'), devEnv);
fs.writeFileSync(path.join(__dirname, '../src/environments/environment.prod.ts'), prodEnv);

console.log('✅ Archivos de environment generados correctamente.');
