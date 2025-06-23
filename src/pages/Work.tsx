import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Download, ArrowLeft } from 'lucide-react';

const Work: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // assignment: {id, title, ...}, upload: {file, name}
  const { assignment, upload } = location.state || {};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-green-100 py-12 px-4">
      <Card className="w-full max-w-xl shadow-2xl border-0 bg-white/95 rounded-3xl">
        <CardHeader className="flex flex-row items-center gap-3 pb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-2xl font-bold text-gray-900">Assignment Work</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {!assignment ? (
            <div className="text-center text-gray-500">No assignment selected.</div>
          ) : (
            <>
              <div className="mb-4">
                <div className="text-lg font-semibold text-blue-900 mb-1">{assignment.title}</div>
                <div className="text-gray-600 text-sm mb-2">Due: {assignment.due}</div>
                <div className="text-gray-700 text-base mb-4">{assignment.description}</div>
              </div>
              {upload && upload.name ? (
                <div className="mb-4">
                  <div className="font-medium text-green-700 mb-2">Your Uploaded Work:</div>
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
                    <span className="text-sm font-semibold text-green-900">{upload.name}</span>
                    {upload.file ? (
                      <a
                        href={URL.createObjectURL(upload.file)}
                        download={upload.name}
                        className="ml-2 text-blue-600 hover:underline flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Download className="w-4 h-4" /> Download
                      </a>
                    ) : null}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No file uploaded for this assignment.</div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Work; 