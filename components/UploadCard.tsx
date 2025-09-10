'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Upload, X, CheckCircle } from 'lucide-react'

interface UploadCardProps {
  onUpload: (file: File) => void
  isUploading: boolean
  uploadProgress: number
}

export default function UploadCard({ onUpload, isUploading, uploadProgress }: UploadCardProps) {
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [imageAspectRatio, setImageAspectRatio] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = (file: File) => {
    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
      alert('Please upload a JPEG or PNG image')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setPreview(result)
      
      // Calculate aspect ratio
      const img = new Image()
      img.onload = () => {
        const aspectRatio = img.width / img.height
        setImageAspectRatio(aspectRatio)
      }
      img.src = result
    }
    reader.readAsDataURL(file)

    onUpload(file)
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const clearPreview = () => {
    setPreview(null)
    setImageAspectRatio(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <motion.div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${isUploading ? 'pointer-events-none opacity-75' : 'hover:border-gray-400'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-96 object-contain rounded-lg mb-4"
              style={{ 
                aspectRatio: imageAspectRatio ? `${imageAspectRatio}` : 'auto',
                maxWidth: '100%',
                height: 'auto'
              }}
            />
            {!isUploading && (
              <button
                onClick={clearPreview}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                aria-label="Remove image"
              >
                <X size={16} />
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <motion.div
              animate={{ rotate: isUploading ? 360 : 0 }}
              transition={{ duration: 2, repeat: isUploading ? Infinity : 0 }}
            >
              <Upload size={48} className="mx-auto text-gray-400" />
            </motion.div>
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isUploading ? 'Processing...' : 'Upload a photo'}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPEG or PNG, max 5MB
              </p>
            </div>
          </div>
        )}

        {/* Progress bar */}
        {isUploading && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-blue-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">
              {uploadProgress.toFixed(2)}% complete
            </p>
          </div>
        )}

        {/* Success indicator */}
        {uploadProgress === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-4 flex items-center justify-center space-x-2 text-green-600"
          >
            <CheckCircle size={20} />
            <span className="text-sm font-medium">Emoji generated!</span>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
