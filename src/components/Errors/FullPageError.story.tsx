import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../context/ThemeContext';
import FullPageError from './FullPageError';

const Default = () => (
  <ThemeProvider>
    <MemoryRouter>
      <FullPageError
        title="Unable to analyze the uploaded files"
        message="The uploaded files could not be parsed. Check that they are complete thread dumps and try again."
      />
    </MemoryRouter>
  </ThemeProvider>
);

export default Default;
