import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const supabaseUrl = 'https://kjdoiozqefbjkbsimvbs.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtqZG9pb3pxZWZiamtic2ltdmJzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDE4Njg1OCwiZXhwIjoyMDc1NzYyODU4fQ.GJ1uET42Wjp35VJOvPXFm7VFkh2Xsui63CE10JzkRCg';
const r2PublicBase = 'https://pub-a0f86dca503044cda0278eb6bafbe7d9.r2.dev';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function extractLegacyUrls() {
  console.log('🔍 Querying Supabase for legacy URLs...');

  // Try both possible table names
  let { data, error } = await supabase
    .from('wallpeypers.images')
    .select('url')
    .not('url', 'like', `%${r2PublicBase}%`);

  // If that fails, try just 'images'
  if (error) {
    console.log('⚠️  Trying alternate table name...');
    const result = await supabase
      .from('images')
      .select('url')
      .not('url', 'like', `%${r2PublicBase}%`);
    data = result.data;
    error = result.error;
  }

  if (error) {
    console.error('❌ Error querying Supabase:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('✅ No legacy URLs found - all images already on R2!');
    writeFileSync('legacy-urls.txt', '');
    process.exit(0);
  }

  const urls = data.map(row => row.url).filter(Boolean);
  writeFileSync('legacy-urls.txt', urls.join('\n'));

  console.log(`✅ Extracted ${urls.length} legacy URLs to legacy-urls.txt`);
  console.log(`📊 First few URLs:`);
  urls.slice(0, 5).forEach(url => console.log(`   - ${url}`));
}

extractLegacyUrls().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
