import React, { useRef, useState } from 'react';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FileText, Calendar, Upload, X, CheckCircle } from 'lucide-react';

const dummyAssignment = {
  title: 'Math Assignment 1',
  description: 'Solve the problems in Chapter 2, pages 34-36.',
  due: '2024-06-10',
  status: 'Assigned',
};

const ViewCreate: React.FC = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = () => {
    if (!file) {
      toast.error('Please upload a file before submitting.');
      return;
    }
    setSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
      toast.success('Assignment submitted successfully!');
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-green-100 px-2 py-8">
      <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 flex flex-col items-center w-full max-w-lg animate-fade-in">
        {/* Assignment Details */}
        <div className="w-full mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-7 h-7 text-blue-500" />
            <h1 className="text-2xl md:text-3xl font-bold text-blue-700">{dummyAssignment.title}</h1>
          </div>
          <p className="text-gray-600 mb-2">{dummyAssignment.description}</p>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <Calendar className="w-4 h-4" />
            <span>Due: {dummyAssignment.due}</span>
            <span className="ml-4 px-2 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold text-xs">{dummyAssignment.status}</span>
          </div>
        </div>

        {/* Submission Status */}
        <div className="w-full mb-4 flex items-center gap-2">
          {submitted ? (
            <span className="flex items-center gap-1 text-green-600 font-semibold"><CheckCircle className="w-5 h-5" /> Submitted</span>
          ) : (
            <span className="text-yellow-600 font-semibold">Not submitted</span>
          )}
        </div>

        {/* File Upload */}
        <div className="w-full mb-4">
          <label className="block text-gray-700 font-medium mb-2">Upload your work</label>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={submitted}
            />
            <Button
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-full shadow hover:from-green-600 hover:to-blue-600"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitted}
            >
              <Upload className="w-4 h-4" />
              {file ? 'Change File' : 'Upload File'}
            </Button>
            {file && !submitted && (
              <span className="flex items-center gap-2 bg-gray-100 border border-gray-200 rounded px-2 py-1 text-xs">
                {file.name}
                <Button size="icon" variant="ghost" className="h-5 w-5 p-0 text-red-500" onClick={handleRemoveFile}>
                  <X className="w-3 h-3" />
                </Button>
              </span>
            )}
            {file && submitted && (
              <span className="flex items-center gap-2 bg-green-100 border border-green-200 rounded px-2 py-1 text-xs text-green-700">
                {file.name}
              </span>
            )}
          </div>
        </div>

        {/* Comments/Notes */}
        <div className="w-full mb-6">
          <label className="block text-gray-700 font-medium mb-2">Comments/Notes (optional)</label>
          <textarea
            className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 text-gray-700 resize-none min-h-[60px]"
            placeholder="Add any notes for your teacher..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            disabled={submitted}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 w-full justify-between">
          <Button
            className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-6 py-2 rounded-full"
            variant="outline"
            onClick={() => navigate(-1)}
            disabled={submitting}
          >
            Back to Classroom
          </Button>
          <Button
            className="bg-blue-500 text-white px-6 py-2 rounded-full shadow hover:bg-blue-600 disabled:opacity-60"
            onClick={handleSubmit}
            disabled={submitted || submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewCreate; 