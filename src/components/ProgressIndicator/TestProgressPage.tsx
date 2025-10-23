import React, { useState } from 'react';
import { ParseProgress } from '../../parser/AsyncParser';
import ProgressIndicator from './ProgressIndicator';
import './ProgressIndicator.css';

const TestProgressPage: React.FC = () => {
  const [percentage, setPercentage] = useState(0);
  const [phase, setPhase] = useState<ParseProgress['phase']>('reading');
  const [fileName, setFileName] = useState('thread_dump_001.txt');
  const [filesProcessed, setFilesProcessed] = useState(0);
  const [totalFiles, setTotalFiles] = useState(10);
  const [linesProcessed, setLinesProcessed] = useState(0);
  const [totalLines, setTotalLines] = useState(50000);

  const mockProgress: ParseProgress = {
    phase,
    fileName,
    filesProcessed,
    totalFiles,
    linesProcessed,
    totalLines,
    percentage,
  };

  const presets = {
    reading: () => {
      setPhase('reading');
      setPercentage(5);
      setFileName('thread_dump_001.txt');
      setFilesProcessed(0);
      setLinesProcessed(0);
    },
    parsing: () => {
      setPhase('parsing');
      setPercentage(45);
      setFileName('thread_dump_005.txt');
      setFilesProcessed(4);
      setLinesProcessed(15000);
    },
    grouping: () => {
      setPhase('grouping');
      setPercentage(95);
      setFileName('');
      setFilesProcessed(10);
      setLinesProcessed(50000);
    },
    complete: () => {
      setPhase('complete');
      setPercentage(100);
      setFileName('');
      setFilesProcessed(10);
      setLinesProcessed(50000);
    },
  };

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Progress Indicator Test Page</h1>
      <p style={{ marginBottom: '40px' }}>
        Use this page to test the progress indicator in different states for visual regression testing.
      </p>

      <div data-testid="progress-container" style={{ marginBottom: '40px' }}>
        <ProgressIndicator progress={mockProgress} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div>
          <h5>Quick Presets</h5>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button type="button" onClick={presets.reading}>Reading Files</button>
            <button type="button" onClick={presets.parsing}>Parsing (45%)</button>
            <button type="button" onClick={presets.grouping}>Grouping (95%)</button>
            <button type="button" onClick={presets.complete}>Complete</button>
          </div>
        </div>

        <div>
          <h5>Manual Controls</h5>

          <div style={{
            display: 'grid', gridTemplateColumns: '200px 1fr', gap: '16px', alignItems: 'center',
          }}
          >
            <label htmlFor="percentage">
              Percentage:
              {' '}
              {percentage}
              %
            </label>
            <input
              id="percentage"
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              style={{ width: '100%' }}
            />

            <label htmlFor="phase">Phase:</label>
            <select
              id="phase"
              value={phase}
              onChange={(e) => setPhase(e.target.value as ParseProgress['phase'])}
              style={{ padding: '6px', fontSize: '14px' }}
            >
              <option value="reading">Reading</option>
              <option value="parsing">Parsing</option>
              <option value="grouping">Grouping</option>
              <option value="complete">Complete</option>
            </select>

            <label htmlFor="fileName">File Name:</label>
            <input
              id="fileName"
              type="text"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
            />

            <label htmlFor="filesProcessed">Files Processed:</label>
            <input
              id="filesProcessed"
              type="number"
              min="0"
              value={filesProcessed}
              onChange={(e) => setFilesProcessed(Number(e.target.value))}
            />

            <label htmlFor="totalFiles">Total Files:</label>
            <input
              id="totalFiles"
              type="number"
              min="1"
              value={totalFiles}
              onChange={(e) => setTotalFiles(Number(e.target.value))}
            />

            <label htmlFor="linesProcessed">Lines Processed:</label>
            <input
              id="linesProcessed"
              type="number"
              min="0"
              value={linesProcessed}
              onChange={(e) => setLinesProcessed(Number(e.target.value))}
            />

            <label htmlFor="totalLines">Total Lines:</label>
            <input
              id="totalLines"
              type="number"
              min="0"
              value={totalLines}
              onChange={(e) => setTotalLines(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <h5>Progress Data (for debugging)</h5>
          <pre
            data-testid="progress-data"
            style={{
              padding: '12px',
              background: 'var(--ds-background-accent-gray-subtlest)',
              borderRadius: '3px',
              fontSize: '12px',
              overflow: 'auto',
            }}
          >
            {JSON.stringify(mockProgress, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default TestProgressPage;
