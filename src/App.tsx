import * as React from 'react';
import { Uploader } from './uploader/Uploader';

class App extends React.Component {
  handleFilesParsed = () => { }

  render() {
    return (
      <Uploader onFilesParsed={this.handleFilesParsed} />
    )
  }
}

export default App;
