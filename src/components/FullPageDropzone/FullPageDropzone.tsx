import * as React from 'react';
import Dropzone from 'react-dropzone';

interface FullPageDropzoneProps {
  onDrop: (files: File[]) => void
}

const FullPageDropzone: React.SFC<FullPageDropzoneProps> = ({ onDrop }) => (
  <Dropzone accept=".txt" multiple={true} onDrop={onDrop}>
    {({ getRootProps, getInputProps, isDragActive }) => (
      <div className="dropzone" {...getRootProps()}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <h4>Drop files here...</h4> :
            <h4>Try dropping some files here, or click to select files to upload.</h4>
        }
      </div>
    )}
  </Dropzone>
)

export default FullPageDropzone;
