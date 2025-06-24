import React, { useRef, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Box, Slider, Button, IconButton } from '@mui/material';

interface OverlayItem {
  id: number;
  type: 'text' | 'emoji' | 'sticker';
  value: string;
  x: number;
  y: number;
  fontSize?: number;
}

interface ImageEditorProps {
  image: string;
  onSave: (editedDataUrl: string) => void;
  onCancel: () => void;
}

const filters = [
  { name: 'None', value: '' },
  { name: 'Grayscale', value: 'grayscale(1)' },
  { name: 'Sepia', value: 'sepia(1)' },
  { name: 'Brightness+', value: 'brightness(1.2)' },
  { name: 'Contrast+', value: 'contrast(1.5)' },
  { name: 'Blur', value: 'blur(2px)' },
];

export const ImageEditor: React.FC<ImageEditorProps> = ({ image, onSave, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [filter, setFilter] = useState('');
  const [overlays, setOverlays] = useState<OverlayItem[]>([]);
  const [textInput, setTextInput] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);

  // Crop complete handler
  const onCropComplete = (_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // Add text overlay
  const addText = () => {
    if (textInput.trim()) {
      setOverlays([...overlays, { id: Date.now(), type: 'text', value: textInput, x: 50, y: 50, fontSize: 24 }]);
      setTextInput('');
    }
  };

  // Move overlay
  const moveOverlay = (id: number, dx: number, dy: number) => {
    setOverlays(overlays.map(o => o.id === id ? { ...o, x: o.x + dx, y: o.y + dy } : o));
  };

  // Remove overlay
  const removeOverlay = (id: number) => {
    setOverlays(overlays.filter(o => o.id !== id));
  };

  // Save edited image
  const saveImage = async () => {
    if (!croppedAreaPixels) return;
    const img = new window.Image();
    img.src = image;
    await img.decode();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const { width, height, x, y } = croppedAreaPixels;
    canvas.width = width;
    canvas.height = height;
    ctx.filter = filter;
    ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
    // Draw overlays
    overlays.forEach(o => {
      ctx.save();
      ctx.font = `${o.fontSize || 24}px sans-serif`;
      ctx.textBaseline = 'top';
      if (o.type === 'text') {
        ctx.fillText(o.value, o.x, o.y);
      }
      ctx.restore();
    });
    onSave(canvas.toDataURL('image/png'));
  };

  return (
    <Box sx={{ position: 'relative', width: 400, height: 400, background: '#222', borderRadius: 2, overflow: 'hidden', margin: '0 auto' }}>
      <Cropper
        image={image}
        crop={crop}
        zoom={zoom}
        aspect={1}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        onCropComplete={onCropComplete}
        cropShape="rect"
        showGrid={false}
        style={{ containerStyle: { filter } }}
      />
      {/* Overlays */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {overlays.map(o => (
          <div
            key={o.id}
            style={{
              position: 'absolute',
              left: o.x,
              top: o.y,
              fontSize: o.fontSize,
              pointerEvents: 'auto',
              cursor: 'move',
              userSelect: 'none',
            }}
            draggable
            onDrag={e => {
              if (e.clientX && e.clientY) moveOverlay(o.id, e.movementX, e.movementY);
            }}
            onDoubleClick={() => removeOverlay(o.id)}
          >
            {o.value}
          </div>
        ))}
      </div>
      {/* Controls */}
      <Box sx={{ mt: 2, p: 2, background: '#fff', borderRadius: 2 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <span>Zoom</span>
          <Slider min={1} max={3} step={0.01} value={zoom} onChange={(_, v) => setZoom(Number(v))} sx={{ width: 120 }} />
          <span>Filter</span>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            {filters.map(f => <option key={f.name} value={f.value}>{f.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input
            type="text"
            placeholder="Add text..."
            value={textInput}
            onChange={e => setTextInput(e.target.value)}
            style={{ padding: 4, borderRadius: 4, border: '1px solid #ccc' }}
          />
          <Button onClick={addText} size="small" variant="contained">Add Text</Button>
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <Button onClick={saveImage} variant="contained" color="primary">Save</Button>
          <Button onClick={onCancel} variant="outlined">Cancel</Button>
        </div>
        <div style={{ fontSize: 12, color: '#888', marginTop: 8 }}>
          Double-click overlay to remove. Drag to move.
        </div>
      </Box>
    </Box>
  );
};

export default ImageEditor; 