const pool = require('../db');
const { DEFAULT_EMPRESA } = require('../constants/product');

const DEFAULTS = {
    precio_canasto: String(process.env.PRECIO_CANASTO || 500),
    nombre_empresa: DEFAULT_EMPRESA,
    stock_minimo_default: '10'
};

const ALLOWED_KEYS = Object.keys(DEFAULTS);

let cache = { ...DEFAULTS };
let loaded = false;

const loadCache = async () => {
    try {
        const resultado = await pool.query('SELECT clave, valor FROM empresa_config');
        cache = { ...DEFAULTS };
        for (const row of resultado.rows) {
            if (ALLOWED_KEYS.includes(row.clave)) {
                cache[row.clave] = row.valor;
            }
        }
    } catch {
        cache = { ...DEFAULTS };
    }
    loaded = true;
};

const ensureLoaded = async () => {
    if (!loaded) await loadCache();
};

const getPrecioCanasto = () => Number(cache.precio_canasto) || Number(DEFAULTS.precio_canasto);

const getConfigValue = (clave) => cache[clave] ?? DEFAULTS[clave];

const getAllConfig = async () => {
    await ensureLoaded();
    return {
        precio_canasto: getPrecioCanasto(),
        nombre_empresa: getConfigValue('nombre_empresa'),
        stock_minimo_default: Number(getConfigValue('stock_minimo_default') || 10)
    };
};

const updateConfig = async (updates) => {
    await ensureLoaded();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const [clave, valor] of Object.entries(updates)) {
            if (!ALLOWED_KEYS.includes(clave)) continue;
            await client.query(
                `INSERT INTO empresa_config (clave, valor, actualizado_en)
                 VALUES ($1, $2, NOW())
                 ON CONFLICT (clave) DO UPDATE
                 SET valor = EXCLUDED.valor, actualizado_en = NOW()`,
                [clave, String(valor)]
            );
            cache[clave] = String(valor);
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
    return getAllConfig();
};

module.exports = {
    ALLOWED_KEYS,
    loadCache,
    getPrecioCanasto,
    getConfigValue,
    getAllConfig,
    updateConfig
};
