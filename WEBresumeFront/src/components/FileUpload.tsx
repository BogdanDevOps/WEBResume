
import React, { useState } from 'react';
import { Upload, X, File, Image } from 'lucide-react';

interface FileUploadProps {
  onFileUpload: (file: File, type: 'photo' | 'pdf') => void;
  accept: string;
  type: 'photo' | 'pdf';
  label: string;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, accept, type, label }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onFileUpload(files[0], type);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFileUpload(files[0], type);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-300 ${
        isDragOver 
          ? 'border-blue-500 bg-blue-50' 
          : 'border-gray-300 hover:border-gray-400'
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center space-y-3">
        {type === 'photo' ? (
          <Image className="w-12 h-12 text-gray-400" />
        ) : (
          <File className="w-12 h-12 text-gray-400" />
        )}
        <div>
          <label className="cursor-pointer text-blue-600 hover:text-blue-700 font-medium">
            {label}
            <input
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
          <p className="text-gray-500 text-sm mt-1">or drag and drop</p>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
