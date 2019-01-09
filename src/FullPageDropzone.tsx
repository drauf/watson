import * as React from 'react';
import { GetInputPropsFn, GetRootPropsFn } from 'react-dropzone';

interface DropzoneProps {
  getRootProps: GetRootPropsFn;
  getInputProps: GetInputPropsFn;
  isDragActive: boolean;
}

const FullPageDropzone: React.SFC<DropzoneProps> = ({ getRootProps, getInputProps, isDragActive }) => (
  <div className="dropzone" {...getRootProps()}>
    <input {...getInputProps()} />
    {
      isDragActive ?
        <h3>Drop files here...</h3> :
        <h3>Try dropping some files here, or click to select files to upload.</h3>
    }
  </div>
)

export default FullPageDropzone;
