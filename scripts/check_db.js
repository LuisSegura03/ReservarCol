(async () => {
  try {
    const supabaseUrl = 'https://peusaakbgqmreqcfeqqr.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBldXNhYWtiZ3FtcmVxY2ZlcXFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNTc5MjUsImV4cCI6MjA4NzczMzkyNX0.GrW_0d3PIELrU0KnIQjOSDB6peVTMWV6PVx-O0p2PLU';

    const headers = {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Accept': 'application/json'
    };

    console.log('Checking Supabase REST endpoints...');

    // Destinations
    const dRes = await fetch(`${supabaseUrl}/rest/v1/destinations?select=id,name,category`, { headers });
    console.log('destinations status:', dRes.status);
    const dJson = await dRes.json();
    console.log('destinations count:', Array.isArray(dJson) ? dJson.length : 'N/A');
    if (Array.isArray(dJson)) {
      const cats = [...new Set(dJson.map(d => d.category))];
      console.log('distinct categories:', cats);
      console.log('sample destination:', dJson.slice(0,5));
    } else {
      console.log('destinations response:', dJson);
    }

    // Plans
    const pRes = await fetch(`${supabaseUrl}/rest/v1/plans?select=*&limit=10`, { headers });
    console.log('plans status:', pRes.status);
    const pJson = await pRes.json();
    console.log('plans count (sample):', Array.isArray(pJson) ? pJson.length : 'N/A');
    if (Array.isArray(pJson)) {
      console.log('sample plan:', pJson.slice(0,5));
    } else {
      console.log('plans response:', pJson);
    }

  } catch (err) {
    console.error('Script error:', err);
    throw err;
  }
})();
