import React, { useState, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Sparkles, 
  Check, 
  X, 
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { StudentProfile } from '../types';

interface ChangePhotoModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentProfile;
  onSaveAvatar: (newAvatarUrl: string) => void;
}

const PRESET_AVATARS = [
  {
    label: 'Design & UI',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'AI & Engineering',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Full Stack',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Product Lead',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Data Science',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Hardware & Robotics',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Biotech',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Cybersecurity',
    url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'FinTech',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Creative Tech',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Game Dev',
    url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=400&q=80',
  },
  {
    label: 'Mobile Dev',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
];

export const ChangePhotoModal: React.FC<ChangePhotoModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveAvatar,
}) => {
  if (!isOpen) return null;

  const [activeMode, setActiveMode] = useState<'upload' | 'preset' | 'url'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string>(currentUser.avatar);
  const [urlInput, setUrlInput] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle local image file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    setUploadError(null);
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (JPEG, PNG, WebP, GIF).');
      return;
    }
    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image size should be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setPreviewUrl(event.target.result);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      setUploadError('Please enter a valid image URL.');
      return;
    }
    setUploadError(null);
    setPreviewUrl(urlInput.trim());
  };

  const handleSave = () => {
    if (!previewUrl) return;
    setSavedSuccess(true);
    onSaveAvatar(previewUrl);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleResetToCurrent = () => {
    setPreviewUrl(currentUser.avatar);
    setUrlInput('');
    setUploadError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-labelledby="change-photo-title"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 id="change-photo-title" className="text-base font-bold text-stone-900 leading-tight">
                Change Profile Photo
              </h3>
              <p className="text-xs text-stone-500">Update your student avatar across TeamForge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-200/70 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {/* Live Avatar Preview Card */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
            <div className="relative group flex-shrink-0">
              <img
                src={previewUrl}
                alt={currentUser.name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md"
                onError={() => {
                  setUploadError('Could not load image from this source. Reverting to previous.');
                  setPreviewUrl(currentUser.avatar);
                }}
              />
              <div className="absolute inset-0 rounded-full bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                Preview
              </div>
            </div>

            <div className="text-center sm:text-left flex-1 min-w-0">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-bold text-sm text-stone-900 truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-1.5 py-0.5 rounded">
                  {currentUser.specialty}
                </span>
              </div>
              <p className="text-xs text-stone-500 truncate mt-0.5">
                {currentUser.university}
              </p>
              
              {previewUrl !== currentUser.avatar && (
                <button
                  type="button"
                  onClick={handleResetToCurrent}
                  className="mt-2 text-[11px] text-amber-700 hover:text-amber-800 font-semibold flex items-center gap-1 mx-auto sm:mx-0"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reset to current photo
                </button>
              )}
            </div>
          </div>

          {/* Source Tabs */}
          <div className="flex bg-stone-100 p-1 rounded-xl gap-1">
            <button
              type="button"
              id="tab-photo-upload"
              onClick={() => setActiveMode('upload')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'upload' 
                  ? 'bg-white text-stone-900 shadow-sm' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload File</span>
            </button>

            <button
              type="button"
              id="tab-photo-presets"
              onClick={() => setActiveMode('preset')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'preset' 
                  ? 'bg-white text-stone-900 shadow-sm' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Student Avatars</span>
            </button>

            <button
              type="button"
              id="tab-photo-url"
              onClick={() => setActiveMode('url')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeMode === 'url' 
                  ? 'bg-white text-stone-900 shadow-sm' 
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Image URL</span>
            </button>
          </div>

          {/* Feedback error message */}
          {uploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {uploadError}
            </div>
          )}

          {/* MODE 1: UPLOAD FROM DEVICE */}
          {activeMode === 'upload' && (
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="profile-file-input"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-amber-500 bg-amber-50/50' 
                    : 'border-stone-300 hover:border-amber-400 bg-stone-50/50 hover:bg-stone-50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-xs font-bold text-stone-800">
                  Click to choose a photo or drag and drop
                </p>
                <p className="text-[11px] text-stone-500 mt-1">
                  PNG, JPG, WebP or GIF (Up to 5MB)
                </p>
                <button
                  type="button"
                  id="browse-file-btn"
                  className="mt-3 px-3.5 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 text-xs font-bold rounded-lg shadow-2xs transition-colors"
                >
                  Browse Device Files
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: PRESET AVATARS */}
          {activeMode === 'preset' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500">
                Choose a professional student avatar that matches your discipline:
              </p>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto p-1">
                {PRESET_AVATARS.map((preset, idx) => {
                  const isSelected = previewUrl === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setUploadError(null);
                        setPreviewUrl(preset.url);
                      }}
                      className={`p-2 rounded-xl border text-center transition-all group flex flex-col items-center gap-1.5 cursor-pointer ${
                        isSelected 
                          ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400/40' 
                          : 'border-stone-200 hover:border-stone-300 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-12 h-12 rounded-full object-cover group-hover:scale-105 transition-transform"
                        />
                        {isSelected && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-semibold text-stone-700 group-hover:text-stone-900 truncate max-w-full">
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE 3: IMAGE URL */}
          {activeMode === 'url' && (
            <div className="space-y-3">
              <p className="text-xs text-stone-500">
                Paste any publicly accessible image link (from GitHub, Google, LinkedIn, etc.):
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="avatar-url-input"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                />
                <button
                  type="button"
                  id="preview-avatar-url-btn"
                  onClick={handleApplyUrl}
                  className="px-3 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Preview
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="button"
            id="save-profile-photo-btn"
            onClick={handleSave}
            disabled={savedSuccess}
            className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-70"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Photo Updated!</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5" />
                <span>Save Profile Photo</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
