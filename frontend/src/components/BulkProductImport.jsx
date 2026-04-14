import React, { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Image as ImageIcon, Check, AlertCircle, Loader2 } from 'lucide-react';
import { categoryApi, productApi } from '../services/superAdminApi';

const CLOUDINARY_UPLOAD_PRESET = 'xixa_products'; // We will assume they created this

export default function BulkProductImport({ businessId, existingCategories, onImportComplete }) {
  const [excelData, setExcelData] = useState(null);
  const [images, setImages] = useState({}); // mapping fileName -> File object
  const [previewProducts, setPreviewProducts] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, parsing, processing_ai, creating, complete
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [bgColor, setBgColor] = useState('#1A1A1A'); // Dynamic background color picker

  // 1. Handle Excel Upload
  const handleExcelUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus('parsing');
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Transform and validate data
        const transformed = data.map((row, index) => ({
          _id: index.toString(),
          name: row.Name || row.name || '',
          description: row.Description || row.description || '',
          price: parseFloat(row.Price || row.price || 0),
          categoryName: row.Category || row.category || 'Uncategorized',
          isAlcohol: String(row.isAlcohol || row.IsAlcohol || 'false').toLowerCase() === 'true' || String(row.isAlcohol) === 'yes',
          imageFile: row.ImageFile || row.imageFile || row.Image || row.image || '',
          imageUrl: '', // Will be filled after Cloudinary upload
          status: 'pending', // pending, ai_processing, uploading, created, error
          errorMsg: ''
        })).filter(p => p.name); // Filter out empty rows

        setPreviewProducts(transformed);
        setExcelData(file);
        setStatus('idle');
      } catch (err) {
        console.error(err);
        setError('Failed to parse Excel file');
        setStatus('idle');
      }
    };
    reader.readAsBinaryString(file);
  };

  // 2. Handle Image Folder Upload
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = { ...images };
    files.forEach(file => {
      newImages[file.name] = file;
    });
    setImages(newImages);
  };

  // Helper to add uniform background color to transparent PNG (Wolt-style)
  const addUniformBackground = (transparentBlob, hexColor = '#1A1A1A') => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(transparentBlob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Add 10% padding so products sit nicely in the center like Wolt/UberEats
        const padding = Math.max(img.width, img.height) * 0.1;
        canvas.width = img.width + padding * 2;
        canvas.height = img.height + padding * 2;
        
        const ctx = canvas.getContext('2d');
        // 1. Fill solid background
        ctx.fillStyle = hexColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 2. Draw the transparent product centered on top
        const x = (canvas.width - img.width) / 2;
        const y = (canvas.height - img.height) / 2;
        ctx.drawImage(img, x, y, img.width, img.height);
        
        // 3. Export as high-quality JPEG (smaller file size, perfect support)
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          resolve(blob);
        }, 'image/jpeg', 0.95);
      };
      img.src = url;
    });
  };

  // 3. Photoroom API call
  const processImageWithAI = async (file) => {
    const formData = new FormData();
    formData.append('image_file', file);
    formData.append('size', 'preview');

    try {
      const response = await fetch('https://sdk.photoroom.com/v1/segment', {
        method: 'POST',
        headers: {
          'x-api-key': import.meta.env.VITE_PHOTOROOM_API_KEY
        },
        body: formData
      });

      if (!response.ok) throw new Error('Photoroom API failed');
      
      const transparentBlob = await response.blob();
      
      // Paint the transparent product onto a uniform colored canvas
      const finalBlob = await addUniformBackground(transparentBlob, bgColor);
      
      return new File([finalBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
    } catch (err) {
      console.error('AI Processing Error:', err);
      return file; // fallback to original file if AI fails
    }
  };

  // 4. Cloudinary Upload
  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) throw new Error('Cloudinary Cloud Name not configured');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    
    // We try to upload to standard unsigned endpoint
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (data.secure_url) {
      return data.secure_url;
    }
    throw new Error(data.error?.message || 'Upload failed');
  };

  // 5. The Main Import Function
  const handleImportAll = async () => {
    if (!previewProducts.length) return;
    setStatus('creating');
    setError('');

    // Step 1: Extract and create missing categories
    const uniqueCategoryNames = [...new Set(previewProducts.map(p => p.categoryName))];
    const categoryMap = {}; // mapping name to backend category object
    
    // Auto-map existing categories by ignoring case
    existingCategories?.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat;
    });

    for (let catName of uniqueCategoryNames) {
      if (!categoryMap[catName.toLowerCase()]) {
        try {
          console.log(`Creating new category: ${catName}`);
          const newCat = await categoryApi.business.create(businessId, {
            name: catName,
            sortOrder: Object.keys(categoryMap).length,
            isActive: true
          });
          categoryMap[catName.toLowerCase()] = newCat;
        } catch (e) {
          console.error("Error creating category:", e);
          setError(`Failed to create category: ${catName}`);
          setStatus('idle');
          return;
        }
      }
    }

    // Step 2: Process each product
    let newPreview = [...previewProducts];
    let createdCount = 0;

    for (let i = 0; i < newPreview.length; i++) {
      let p = newPreview[i];
      let finalImageUrl = p.imageUrl || ''; // Might already have a URL string

      try {
        // AI Photo Pipeline
        if (p.imageFile && images[p.imageFile]) {
          p.status = 'ai_processing';
          setPreviewProducts([...newPreview]);
          
          // Remove Background
          const processedFile = await processImageWithAI(images[p.imageFile]);
          
          p.status = 'uploading';
          setPreviewProducts([...newPreview]);

          // Upload to Cloudinary
          finalImageUrl = await uploadToCloudinary(processedFile);
          p.imageUrl = finalImageUrl;
        }

        // Call backend APIm
        p.status = 'uploading';
        setPreviewProducts([...newPreview]);

        const catId = categoryMap[p.categoryName.toLowerCase()]?.id;
        if (!catId) throw new Error('Category missing');

        await productApi.create(catId, {
          name: p.name,
          description: p.description,
          price: parseFloat(p.price),
          oldPrice: null,
          imageUrl: finalImageUrl,
          isAvailable: true,
          isAlcohol: p.isAlcohol
        });

        p.status = 'created';
        createdCount++;
        setProgress((createdCount / newPreview.length) * 100);
        setPreviewProducts([...newPreview]);

      } catch (err) {
        console.error(`Error processing ${p.name}:`, err);
        p.status = 'error';
        p.errorMsg = err.message || 'Error occurred';
        setPreviewProducts([...newPreview]);
      }
    }

    if (createdCount === newPreview.length) {
      setStatus('complete');
      setTimeout(() => {
        onImportComplete?.();
      }, 1500);
    } else {
      setStatus('idle');
    }
  };

  return (
    <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700">
      <h2 className="text-xl font-bold text-white mb-6">Bulk Product Import</h2>
      
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6 flex items-start gap-3">
          <AlertCircle className="shrink-0 text-red-500" />
          <p className="text-red-200 text-sm">{error}</p>
        </div>
      )}

      {/* Upload Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Excel Upload */}
        <div className="border-2 border-dashed border-zinc-600 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-zinc-900/50 hover:bg-zinc-800/80 transition-colors">
          <Upload className="w-8 h-8 text-zinc-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">1. Upload Excel File</h3>
          <p className="text-sm text-zinc-400 mb-4">.xlsx or .csv files only</p>
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={handleExcelUpload}
            className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 relative z-10 cursor-pointer"
          />
        </div>

        {/* Image Folder Upload */}
        <div className="border-2 border-dashed border-zinc-600 rounded-xl p-6 flex flex-col items-center justify-center text-center bg-zinc-900/50 hover:bg-zinc-800/80 transition-colors">
          <ImageIcon className="w-8 h-8 text-zinc-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">2. Upload Photos</h3>
          <p className="text-sm text-zinc-400 mb-4">Select all product photos at once</p>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 relative z-10 cursor-pointer"
          />
          <p className="text-xs text-zinc-500 mt-3">{Object.keys(images).length} images selected</p>
        </div>
      </div>

      {/* Action Bar (Color Picker & Submit) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-zinc-900/50 p-4 rounded-xl border border-zinc-700">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-zinc-400 mb-1 uppercase tracking-wider">Product Background</label>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer shrink-0 bg-transparent"
              />
              <input 
                type="text" 
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-sm text-white w-24 focus:outline-none focus:border-zinc-500 font-mono"
              />
            </div>
          </div>
          <div className="text-xs text-zinc-500 max-w-[200px] leading-tight">
            AI will remove original backgrounds and apply this color behind all items.
          </div>
        </div>

        <button
          onClick={handleImportAll}
          disabled={!previewProducts.length || status !== 'idle'}
          className="px-6 py-3 bg-[#10FF88] hover:bg-[#00e074] text-zinc-950 disabled:opacity-50 disabled:bg-zinc-700 disabled:text-zinc-500 rounded-xl font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-2 w-full sm:w-auto shrink-0"
        >
          {status === 'creating' ? (
            <><Loader2 className="animate-spin w-5 h-5" /> Importing...</>
          ) : (
            'START BULK IMPORT'
          )}
        </button>
      </div>

      {/* Progress Bar (visible during create) */}
      {status === 'creating' && (
        <div className="w-full bg-zinc-700 rounded-full h-2.5 mb-6">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      )}

      {/* Preview Table */}
      {previewProducts.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="text-xs uppercase bg-zinc-900/50 text-zinc-500 rounded-t-lg">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Alcohol</th>
                <th className="px-4 py-3">File Match</th>
              </tr>
            </thead>
            <tbody>
              {previewProducts.map((p, i) => (
                <tr key={i} className="border-b border-zinc-700/50 hover:bg-zinc-800/50">
                  <td className="px-4 py-3">
                    {p.status === 'pending' && <span className="text-yellow-500">Wait</span>}
                    {p.status === 'ai_processing' && <span className="text-blue-400 animate-pulse">AI</span>}
                    {p.status === 'uploading' && <span className="text-purple-400 animate-pulse">Up</span>}
                    {p.status === 'created' && <Check className="w-4 h-4 text-green-500" />}
                    {p.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" title={p.errorMsg} />}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-10 h-10 bg-zinc-900 rounded flex items-center justify-center overflow-hidden">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-zinc-600" />
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-white">{p.name}</td>
                  <td className="px-4 py-3">{p.categoryName}</td>
                  <td className="px-4 py-3">€{p.price.toFixed(2)}</td>
                  <td className="px-4 py-3">{p.isAlcohol ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3">
                    {p.imageFile ? (
                      images[p.imageFile] ? <span className="text-green-400">Found ✅</span> : <span className="text-red-400">Missing ❌</span>
                    ) : (
                      <span className="text-zinc-500">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
