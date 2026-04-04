import { createClient } from '@libsql/client';
const c = createClient({ url: 'file:local.db' });
async function main() {
  const tables = ['questions','flashcards','voice_sessions','certifications','learning_paths'];
  for (const t of tables) {
    try {
      const r = await c.execute('SELECT COUNT(*) as n FROM ' + t);
      console.log(t + ':', r.rows[0].n);
    } catch(e: any) { console.log(t + ': ERROR -', e.message); }
  }
  // Also show questions by channel
  try {
    const r = await c.execute('SELECT channel, COUNT(*) as n FROM questions GROUP BY channel ORDER BY n DESC LIMIT 10');
    console.log('\nTop channels:');
    for (const row of r.rows) console.log(' ', row.channel, ':', row.n);
  } catch {}
  c.close();
}
main();
