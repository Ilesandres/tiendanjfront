const fs = require('fs');
const path = require('path');

// Leer el archivo .env
const envPath = path.join(__dirname, '..', '.env');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  });
}

// Valores por defecto
const devApiUrl = envVars.API_URL || 'http://localhost:8080';
const prodApiUrl = envVars.API_URL_PROD || envVars.API_URL || 'http://localhost:8080';

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

console.log('Archivos de environment generados correctamente.');