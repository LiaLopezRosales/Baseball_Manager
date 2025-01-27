// tables.js
const tables = {
    Team: ['name', 'color', 'initials', 'representative_entity'],
    Game: ['date','local','rival', 'series', 'score'],
    Series: ['name', 'init_date'],
    // Agrega más tablas y sus campos aquí
};

const getFieldsForTable = (tableName) => {
    return tables[tableName] || [];
};

export { tables, getFieldsForTable };
