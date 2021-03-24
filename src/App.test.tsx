import ReactDOM from 'react-dom';
import { MemoryRouter as Router, Route, withRouter } from 'react-router-dom';
import App from './App';

it('renders without crashing', () => {
  const div = document.createElement('div');

  ReactDOM.render(
    <Router>
      <Route component={withRouter(App)} />
    </Router>,
    div,
  );

  ReactDOM.unmountComponentAtNode(div);
});
