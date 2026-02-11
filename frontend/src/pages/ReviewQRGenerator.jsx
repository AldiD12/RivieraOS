import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import businessApi from '../services/businessApi';

export default function ReviewQRGenerator() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchVenues();
  }, []);

  const fetchVenues = async () => {
    try {
      const venuesData = await businessApi.venues.list();
      setVenues(Array.isArray(venuesData) ? venuesData : []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching venues:', err);
      setError('Failed to load venues');
      setLoading(false);
    }
  };

  const getReviewUrl = (venueId) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/review?v=${venueId}`;
  };

  const handleDownloadQR = (venueName, venueId) => {
    const svg = document.getElementById(`review-qr-${venueId}`);
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
      downloadLink.download = `Review-QR-${venueName.replace(/\s+/g, '-')}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const handlePrintAll = () => {
    window.print();
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
            <h1 className="text-4xl font-bold mb-2">Review QR Codes</h1>
            <p className="text-zinc-400">Generate QR codes for customers to leave reviews</p>
          </div>

          {venues.length === 0 ? (
            <div className="text-center py-12 text-zinc-400">
              <p className="mb-4">No venues found.</p>
              <p className="text-sm">Create a venue in the Business Dashboard first.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-end mb-6">
                <button
                  onClick={handlePrintAll}
                  className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Print All QR Codes
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {venues.map((venue) => (
                  <div
                    key={venue.id}
                    className="bg-zinc-900 rounded-lg p-6 border border-zinc-700"
                  >
                    <div className="bg-white p-6 rounded-lg mb-4">
                      <QRCodeSVG
                        id={`review-qr-${venue.id}`}
                        value={getReviewUrl(venue.id)}
                        size={200}
                        level="H"
                        includeMargin={true}
                      />
                    </div>
                    <div className="text-center">
                      <h3 className="text-xl font-bold mb-2">{venue.name}</h3>
                      <p className="text-sm text-zinc-400 mb-4">{venue.type}</p>
                      <p className="text-xs text-zinc-500 mb-4 break-all">
                        {getReviewUrl(venue.id)}
                      </p>
                      <button
                        onClick={() => handleDownloadQR(venue.name, venue.id)}
                        className="w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded transition-colors"
                      >
                        Download PNG
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Print View */}
      <div className="hidden print:block">
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
              .review-qr-print-card {
                page-break-inside: avoid;
                break-inside: avoid;
              }
            }
          `
        }} />
        
        <div className="grid grid-cols-2 gap-8">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className="review-qr-print-card border-2 border-black rounded-lg p-8 text-center bg-white"
            >
              <div className="mb-6">
                <QRCodeSVG
                  value={getReviewUrl(venue.id)}
                  size={250}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <div className="border-t-2 border-black pt-6">
                <p className="text-3xl font-bold text-black mb-2">{venue.name}</p>
                <p className="text-xl text-gray-700 mb-4">Leave a Review</p>
                <p className="text-sm text-gray-600">Scan to rate your experience</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
