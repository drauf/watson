import React from 'react';
import Dropzone from 'react-dropzone';
import DropzoneGuide from './DropzoneGuide';
import './FullPageDropzone.css';

type FullPageDropzoneProps = {
  onDrop: (files: File[]) => void;
};

const FullPageDropzone: React.SFC<FullPageDropzoneProps> = ({ onDrop }) => (
  <Dropzone accept=".txt" multiple={true} onDrop={onDrop}>
    {({ getRootProps, getInputProps, isDragActive }) => (
      <div id="dropzone" {...getRootProps()}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <h4>Drop files here...</h4> :
            <h4>Try dropping some files here, or click to select files to upload.</h4>
        }
        <DropzoneGuide />
      </div>
    )}
  </Dropzone>
);

export default FullPageDropzone;
