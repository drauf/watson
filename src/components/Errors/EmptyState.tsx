import '../Container.css';
import './EmptyState.css';

export interface EmptyStateContent {
  title: string;
  description: string;
}

interface Props extends EmptyStateContent {
  fullPage: boolean;
}

const EmptyState = ({ title, description, fullPage }: Props): JSX.Element => {
  const content = (
    <div className="empty-state-content">
      <h2 className="empty-state-title">{title}</h2>
      <p className="empty-state-description">{description}</p>
    </div>
  );

  return fullPage ? <main id="centered">{content}</main> : content;
};
export default EmptyState;
