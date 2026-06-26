/**
 * Export data to a JSON file
 */
export function exportDataToJSON(habits, settings) {
  const dataStr = JSON.stringify({
    version: '1.0',
    exportedAt: new Date().toISOString(),
    habits,
    settings,
  }, null, 2);
  
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `keepmeontrack-backup-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import data from a JSON file. Returns parsed object if valid, throws error if invalid.
 */
export function parseImportedJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (!data.habits || !Array.isArray(data.habits)) {
      throw new Error('Invalid backup format: Missing habits array');
    }
    return {
      habits: data.habits,
      settings: data.settings || {},
    };
  } catch (e) {
    throw new Error('Failed to parse backup file: ' + e.message);
  }
}
