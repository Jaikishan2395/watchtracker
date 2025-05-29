import React from 'react';
import { Editor } from '@monaco-editor/react';

interface CodeEditorProps {
  code: string;
  onChange: (value: string | undefined) => void;
  language?: string;
  theme?: string;
  readOnly?: boolean;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  onChange,
  language = 'typescript',
  theme = 'vs-dark',
  readOnly = false
}) => {
  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      defaultValue={code}
      theme={theme}
      onChange={onChange}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        readOnly,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        tabSize: 2,
        wordWrap: 'on'
      }}
    />
  );
}; 