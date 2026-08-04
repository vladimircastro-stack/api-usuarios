/**
 * Programa backup diario e inicio de VC DistribuidorPro al encender Windows.
 * Ejecutar como Administrador: node scripts/instalar-automatizacion.js
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.join(__dirname, '..');
const backupScript = path.join(root, 'scripts', 'backup-db.ps1');
const inicioBat = path.join(root, 'scripts', 'iniciar-sistema.bat');

if (process.platform !== 'win32') {
    console.log('Este script es solo para Windows.');
    process.exit(0);
}

if (!fs.existsSync(backupScript)) {
    console.error('No se encontró backup-db.ps1');
    process.exit(1);
}

const crearTarea = (nombre, args, hora, alInicio) => {
    try {
        execSync(`schtasks /Delete /TN "${nombre}" /F`, { stdio: 'ignore' });
    } catch {
        // no existía
    }

    const trigger = alInicio
        ? '/SC ONSTART /RU SYSTEM /RL HIGHEST /DELAY 0001:00'
        : `/SC DAILY /ST ${hora}`;

    const cmd = `schtasks /Create /TN "${nombre}" /TR "${args}" ${trigger} /F`;
    execSync(cmd, { stdio: 'inherit' });
    console.log(`Tarea creada: ${nombre}`);
};

console.log('=== Instalando automatización VC DistribuidorPro ===\n');
console.log('Proyecto:', root);
console.log('(Ejecuta esta ventana como Administrador si falla)\n');

try {
    crearTarea(
        'VC-DistribuidorPro-Backup-Diario',
        `powershell.exe -ExecutionPolicy Bypass -File "${backupScript}"`,
        '20:00',
        false
    );

    crearTarea(
        'VC-DistribuidorPro-Inicio',
        `"${inicioBat}"`,
        null,
        true
    );

    console.log('\nListo:');
    console.log('- Backup diario a las 8:00 PM');
    console.log('- VC DistribuidorPro intentará iniciar al encender la PC');
    console.log('\nVerifica en Programador de tareas de Windows.');
} catch (err) {
    console.error('\nError:', err.message);
    console.error('Abre PowerShell como Administrador y vuelve a ejecutar:');
    console.error('  node scripts/instalar-automatizacion.js');
    process.exit(1);
}
