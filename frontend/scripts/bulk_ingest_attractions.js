/**
 * Bulk Ingestion Script for Tourist Attractions
 * Usage: node scripts/bulk_ingest_attractions.js <JWT_TOKEN>
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TOKEN = process.argv[2];
if (!TOKEN) {
  console.error('❌ Error: Please provide a SuperAdmin JWT token as an argument.');
  console.log('Usage: node scripts/bulk_ingest_attractions.js YOUR_TOKEN_HERE');
  process.exit(1);
}

const API_BASE_URL = 'https://blackbear-api.kindhill-9a9eea44.italynorth.azurecontainerapps.io/api';
const DATA_FILE = path.join(__dirname, '../src/data/attractions_data.json');

async function bulkIngest() {
  try {
    const attractions = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log(`🚀 Starting bulk ingestion of ${attractions.length} attractions...`);

    for (const attr of attractions) {
      try {
        // Map the attraction data to the Venue model expected by the API
        const payload = {
          name: attr.name,
          type: 'Attraction',
          subType: attr.subType,
          latitude: attr.latitude,
          longitude: attr.longitude,
          description: attr.description,
          address: attr.name + ', Albanian Riviera',
          isSight: true,
          isActive: true
        };

        const response = await axios.post(`${API_BASE_URL}/business/Venues`, payload, {
          headers: {
            'Authorization': `Bearer ${TOKEN}`,
            'Content-Type': 'application/json'
          }
        });

        console.log(`✅ Success: Added ${attr.name} (ID: ${response.data.id})`);
      } catch (err) {
        console.error(`❌ Failed: Could not add ${attr.name}. Error: ${err.message}`);
        if (err.response) console.error('   API Error:', err.response.data);
      }
    }

    console.log('\n✨ Ingestion complete!');
  } catch (err) {
    console.error('💥 Fatal error:', err.message);
  }
}

bulkIngest();
