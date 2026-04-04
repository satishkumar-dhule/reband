import { createClient } from '@libsql/client';
const c = createClient({ url: 'file:local.db' });
async function main() {
  const lp = await c.execute('SELECT path_type, COUNT(*) as n FROM learning_paths GROUP BY path_type');
  console.log('Learning paths by type:');
  for (const r of lp.rows) console.log(' ', r.path_type, ':', r.n);

  const vs = await c.execute('SELECT channel, COUNT(*) as n FROM voice_sessions GROUP BY channel ORDER BY n DESC');
  console.log('\nVoice sessions by channel:');
  for (const r of vs.rows) console.log(' ', r.channel, ':', r.n);

  const fl = await c.execute('SELECT channel, COUNT(*) as n FROM flashcards GROUP BY channel ORDER BY n DESC');
  console.log('\nFlashcards by channel:');
  for (const r of fl.rows) console.log(' ', r.channel, ':', r.n);
  c.close();
}
main();
