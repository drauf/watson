import EmptyState from '../Errors/EmptyState';
import { groupSimilarStacks, SimilarStacksFilters } from './similarStacksGrouping';
import Thread from '../../types/Thread';
import NoThreadDumpsError from '../Errors/NoThreadDumpsError';
import PageWithSettings from '../PageWithSettings';
import PaginatedCollection from '../common/PaginatedCollection';
import SimilarStacksGroup from './SimilarStacksGroup';
import SimilarStacksSettings from './SimilarStacksSettings';
import { WithThreadDumpsProps, withThreadDumps } from '../../common/withThreadDumps';

interface State {
  linesToConsider: number;
  minimumGroupSize: number;
  withoutIdle: boolean;
  nameFilter: string;
  stackFilter: string;
}

class SimilarStacksPage extends PageWithSettings<WithThreadDumpsProps, State> {
  public override state: State = {
    linesToConsider: 30,
    minimumGroupSize: 5,
    withoutIdle: true,
    nameFilter: '',
    stackFilter: '',
  };

  public override render(): JSX.Element {
    const filters: SimilarStacksFilters = this.state;
    const threadGroups = groupSimilarStacks(this.props.threadDumps, filters)
      .filter((group) => group.length >= this.state.minimumGroupSize);

    if (!this.props.threadDumps.some((dump) => dump.threads.length > 0)) {
      return <NoThreadDumpsError />;
    }

    return (
      <main>
        <SimilarStacksSettings
          linesToConsider={this.state.linesToConsider}
          minimumGroupSize={this.state.minimumGroupSize}
          withoutIdle={this.state.withoutIdle}
          nameFilter={this.state.nameFilter}
          stackFilter={this.state.stackFilter}
          onFilterChange={this.handleFilterChange}
          onIntegerChange={this.handleIntegerChange}
          onRegExpChange={this.handleTextChange}
        />

        {this.renderThreadGroups(threadGroups)}
      </main>
    );
  }

  private renderThreadGroups = (threadGroups: Thread[][]) => {
    if (threadGroups.length === 0) {
      return (
        <EmptyState description="Adjust the filters or grouping settings and try again." />
      );
    }
    return (
      <PaginatedCollection
        items={threadGroups}
        resetKey={`${this.state.linesToConsider}:${this.state.minimumGroupSize}:${this.state.withoutIdle}:${this.state.nameFilter}:${this.state.stackFilter}:${this.props.threadDumps.length}`}
        getKey={(group) => group[0].uniqueId}
        renderItem={(group) => (
          <SimilarStacksGroup
            threadGroup={group}
            linesToConsider={this.state.linesToConsider}
          />
        )}
      />
    );
  };
}

export default withThreadDumps(SimilarStacksPage);
