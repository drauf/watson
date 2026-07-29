import { MemoryRouter } from 'react-router-dom';
import FullPageError from './FullPageError';

const Default = () => (
  <MemoryRouter>
    <FullPageError
      title="Unable to analyze the uploaded files"
      message="The uploaded files could not be parsed. Check that they are complete thread dumps and try again."
    />
  </MemoryRouter>
);

export default Default;
