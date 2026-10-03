import React, { useState } from 'react'
import { useOutletContext } from 'react-router';
import { CheckCircle2, ImageIcon, UploadIcon } from 'lucide-react'
import { PROGRESS_INTERVAL_MS, PROGRESS_STEP, REDIRECT_DELAY_MS } from '../lib/constants';

type UploadProps = {
  onComplete?: (base64: string) => void;
};

const Upload = ({ onComplete = () => {} }: UploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isSignedIn } = useOutletContext<AuthContext>();

  const processFile = (selectedFile: File) => {
    if (!isSignedIn) return;

    setFile(selectedFile);
    setProgress(0);

    const reader = new FileReader();
    reader.onload = () => {
      if (!isSignedIn || typeof reader.result !== 'string') return;
      const base64 = reader.result;
      const interval = window.setInterval(() => {
        setProgress((currentProgress) => {
          const nextProgress = Math.min(currentProgress + PROGRESS_STEP, 100);
          if (nextProgress === 100) {
            window.clearInterval(interval);
            window.setTimeout(() => onComplete(base64), REDIRECT_DELAY_MS);
          }
          return nextProgress;
        });
      }, PROGRESS_INTERVAL_MS);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isSignedIn) return;
    const selectedFile = event.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isSignedIn) setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (!isSignedIn) return;
    const selectedFile = event.dataTransfer.files[0];
    if (selectedFile) processFile(selectedFile);
  };

  return (
    <div className='upload'>
      {!file ? (
        <div
          className={`dropzone ${isDragging ? 'is-dragging' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            className="drop-input"
            disabled={!isSignedIn}
            accept=".jpg,.jpeg,.png"
            onChange={handleChange}
          />
          <div className='drop-content'>
            <div className='drop-icon'>
              <UploadIcon size={20}/>
            </div>
            <p>
              {isSignedIn ? (
                "Click to upload or just drag and drop"
              ):(
              "Sign in or signup with Puter to upload")}
            </p>
            <p className="help">Maximum file size 10 MB</p>
          </div>
        </div>
      ) : (
        <div className='upload-status'>
          <div className="status-content">
            <div className="status-icon ">
              {progress === 100 ? (
                <CheckCircle2 className='check'/>
              ) : (
                <ImageIcon className='image'/>
              )}
            </div>
            <h3>{file.name}</h3>
            <div className='progress'>
              <div className='bar' style={{ width: `${progress}%` }}/>
              <p className='status-text'>
                {progress < 100 ? 'Analyzing Floor plan...' : 'Redirecting...'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Upload
