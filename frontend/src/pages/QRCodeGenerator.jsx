import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import businessApi from '../services/businessApi';

export default function QRCodeGenerator() {
  const [venues, setVenues] = useState([]);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef();

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      console.log('Fetching venues...');
      const venuesData = await businessApi.venues.list();
      console.log('Venues data:', venuesData);
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError(`Failed to load venues: ${err.message}`);
      setLoading(false);
    }
  };

  const fetchZones = async (venueId) => {
    try {
      console.log('Fetching zones for venue:', venueId);
      const zonesData = await businessApi.zones.list(venueId);
      console.log('Zones data:', zonesData);
      
      // Fetch units for each zone
      const zonesWithUnits = await Promise.all(
        zonesData.map(async (zone) => {
          try {
            const units = await businessApi.units.list(venueId);
            // Filter units for this specific zone
            const zoneUnits = units.filter(u => u.venueZoneId === zone.id);
            return { ...zone, units: zoneUnits };
          } catch (err) {
            console.error(`Error fetching units for zone ${zone.id}:`, err);
            return { ...zone, units: [] };
          }
        })
      );
      
      console.log('Zones with units:', zonesWithUnits);
      setZones(zonesWithUnits);
    } catch (err) {
      console.error('Error fetching zones:', err);
      setError('Failed to load zones');
    }
  };

  const handleVenueSelect = (venue) => {
    setSelectedVenue(venue);
    fetchZones(venue.id);
  };

  const getSpotUrl = (venueId, zoneId, unitLabel) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/spot?v=${venueId}&z=${zoneId}&u=${unitLabel}`;
  };

  const handlePrintAll = () => {
    window.print();
  };

  const handleDownloadQR = (unitLabel, venueId, zoneId) => {
    const svg = document.getElementById(`qr-${unitLabel}`);
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');
      
      const downloadLink = document.createElement('a');
      downloadLink.download = `QR-${selectedVenue.name}-${unitLabel}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading venues...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="text-center">
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-6 py-4 rounded-lg mb-4">
            {error}
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Screen View */}
      <div className="print:hidden">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">QR Code Generator</h1>
            <p className="text-zinc-400">Generate QR codes for sunbeds and tables</p>
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {/* Venue Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Select Venue</h2>
            {venues.length === 0 ? (
              <div className="text-center py-12 text-zinc-400">
                <p className="mb-4">No venues found.</p>
                <p className="text-sm">Create a venue in the Business Dashboard first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {venues.map((venue) => (
                  <button
                    key={venue.id}
                    onClick={() => handleVenueSelect(venue)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${
                      selectedVenue?.id === venue.id
                        ? 'border-white bg-zinc-800'
                        : 'border-zinc-700 hover:border-zinc-500'
                    }`}
                  >
                    <h3 className="text-lg font-bold mb-2">{venue.name}</h3>
                    <p className="text-sm text-zinc-400">{venue.type}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Zones and QR Codes */}
          {selectedVenue && zones.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">QR Codes for {selectedVenue.name}</h2>
                <button
                  onClick={handlePrintAll}
                  className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Print All QR Codes
                </button>
              </div>

              {zones.map((zone) => (
                <div key={zone.id} className="mb-8">
                  <h3 className="text-lg font-bold mb-4 text-zinc-300">
                    {zone.name} - {zone.zoneType}
                  </h3>
                  {!zone.units || zone.units.length === 0 ? (
                    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-8 text-center">
                      <p className="text-zinc-400 mb-2">No units in this zone yet.</p>
                      <p className="text-sm text-zinc-500">
                        Go to Business Dashboard → Venues → {selectedVenue.name} → {zone.name} → Create Units
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {zone.units.map((unit) => (
                        <div
                          key={unit.id}
                          className="bg-zinc-900 rounded-lg p-4 border border-zinc-700"
                        >
                          <div className="bg-white p-4 rounded-lg mb-3">
                            <QRCodeSVG
                              id={`qr-${unit.unitLabel}`}
                              value={getSpotUrl(selectedVenue.id, zone.id, unit.unitLabel)}
                              size={150}
                              level="H"
                              includeMargin={true}
                            />
                          </div>
                          <div className="text-center">
                            <p className="font-bold text-lg mb-1">{unit.unitLabel}</p>
                            <p className="text-sm text-zinc-400 mb-3">{zone.name}</p>
                            <button
                              onClick={() => handleDownloadQR(unit.unitLabel, selectedVenue.id, zone.id)}
                              className="text-xs px-3 py-1 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
                            >
                              Download PNG
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {selectedVenue && zones.length === 0 && (
            <div className="text-center py-12 text-zinc-400">
              <p>No zones found for this venue.</p>
              <p className="text-sm mt-2">Create zones in the Business Dashboard first.</p>
            </div>
          )}
        </div>
      </div>

      {/* Print View */}
      <div className="hidden print:block" ref={printRef}>
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              .qr-print-card {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          `
        }} />
        
        {selectedVenue && zones.map((zone) => (
          <div key={zone.id} className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-black">
              {selectedVenue.name} - {zone.name}
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {zone.units?.map((unit) => (
                <div
                  key={unit.id}
                  className="qr-print-card border-2 border-black rounded-lg p-6 text-center bg-white"
                >
                  <div className="mb-4">
                    <QRCodeSVG
                      value={getSpotUrl(selectedVenue.id, zone.id, unit.unitLabel)}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <div className="border-t-2 border-black pt-4">
                    <p className="text-3xl font-bold text-black mb-2">{unit.unitLabel}</p>
                    <p className="text-lg text-black">{zone.name}</p>
                    <p className="text-sm text-gray-600 mt-2">{selectedVenue.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
