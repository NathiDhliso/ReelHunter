import React, { useState, useRef } from 'react'
import { X, Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react'

interface ImportCandidatesModalProps {
  isOpen: boolean
  onClose: () => void
}

const ImportCandidatesModal: React.FC<ImportCandidatesModalProps> = ({ isOpen, onClose }) => {
  const [dragActive, setDragActive] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [importComplete, setImportComplete] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

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
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) return
    
    setImporting(true)
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000))
    setImporting(false)
    setImportComplete(true)
    
    // Auto close after success
    setTimeout(() => {
      onClose()
      setFile(null)
      setImportComplete(false)
    }, 2000)
  }

  const downloadTemplate = () => {
    // Create a sample CSV template
    const csvContent = `Name,Email,Phone,Position,Experience,Skills,Location
John Doe,john.doe@example.com,+1-555-0123,Software Engineer,5 years,"JavaScript,React,Node.js",San Francisco
Jane Smith,jane.smith@example.com,+1-555-0124,Product Manager,3 years,"Product Strategy,Analytics,Agile",New York`
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'candidate_import_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="relative bg-background-panel border border-gray-600 rounded-2xl p-8 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary-500/10 rounded-lg">
              <Upload className="w-6 h-6 text-primary-400" />
            </div>
            <h2 className="text-2xl font-semibold text-text-primary">Import Candidates</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary p-2 hover:bg-background-card rounded-lg transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {!importComplete ? (
          <div className="space-y-6">
            <div className="bg-background-card border border-gray-600 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-medium text-text-primary mb-2">Before you start</h3>
                  <ul className="text-sm text-text-secondary space-y-1">
                    <li>• Use CSV format with proper headers</li>
                    <li>• Maximum file size: 10MB</li>
                    <li>• Ensure email addresses are valid</li>
                    <li>• Download our template for best results</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-text-primary font-medium">Need a template?</span>
              <button
                onClick={downloadTemplate}
                className="flex items-center space-x-2 text-primary-400 hover:text-primary-300 transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Download CSV Template</span>
              </button>
            </div>

            <div
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
                dragActive 
                  ? 'border-primary-400 bg-primary-500/10' 
                  : 'border-gray-600 hover:border-gray-500'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              {file ? (
                <div className="space-y-4">
                  <div className="p-3 bg-primary-500/10 rounded-lg w-16 h-16 mx-auto flex items-center justify-center">
                    <FileText className="w-8 h-8 text-primary-400" />
                  </div>
                  <div>
                    <p className="text-text-primary font-medium">{file.name}</p>
                    <p className="text-text-muted text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-text-muted hover:text-text-primary text-sm transition-colors duration-200"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-gray-600/20 rounded-lg w-16 h-16 mx-auto flex items-center justify-center">
                    <Upload className="w-8 h-8 text-text-muted" />
                  </div>
                  <div>
                    <p className="text-text-primary font-medium mb-2">
                      Drag and drop your CSV file here
                    </p>
                    <p className="text-text-muted text-sm mb-4">or</p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-background-card hover:bg-gray-600 text-text-primary px-6 py-3 rounded-xl font-medium border border-gray-600 transition-colors duration-200"
                    >
                      Choose File
                    </button>
                  </div>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
            />

            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-600">
              <button
                onClick={onClose}
                className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!file || importing}
                className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {importing ? 'Importing...' : 'Import Candidates'}
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="p-4 bg-green-500/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-semibold text-text-primary mb-2">Import Successful!</h3>
            <p className="text-text-secondary">Your candidates have been imported successfully.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImportCandidatesModal