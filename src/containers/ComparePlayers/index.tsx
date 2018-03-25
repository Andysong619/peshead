import { History } from 'history';
import { Paper } from 'material-ui';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import * as React from 'react';
import { Helmet } from 'react-helmet';
import { connect, Dispatch } from 'react-redux';
import { withRouter } from 'react-router';
import { createSelector } from 'reselect';

import * as playerActions from '../../actions/players';
import { ComparePlayersLabelColumn } from '../../components/ComparePlayersLabelColumn';
import { ComparePlayersStatColumn } from '../../components/ComparePlayersStatColumn';
import { Loading } from '../../components/Loading';
import { SuggestPlayer } from '../../components/SuggestPlayer';
import * as fromRoot from '../../reducers';
import * as fromPlayers from '../../reducers/players';
import { PlayerCompareOption } from '../../reducers/ui/routing';
import { assert } from '../../shared/assert';
import { Position } from '../../shared/service/api';
import { AbilityFlags, getHighestAbilities } from '../../shared/utils/player';

export interface ViewModel {
  players: PlayerViewModel[];
  position?: Position;
  history: History;
}

export interface PlayerViewModel
  extends PlayerCompareOption,
    fromPlayers.BaseViewModel {}

export interface Actions {
  getPlayer: typeof playerActions.getPlayer;
  dispatch: Dispatch<fromRoot.State>;
}

const createPlayerViewModel = (
  state: fromPlayers.State,
  playerOptions: PlayerCompareOption
): PlayerViewModel => {
  const baseView = fromPlayers.getPlayerBaseView(state, playerOptions.id);
  return {
    ...baseView,
    form: 'A',
    level: 30
  };
};

export class ComparePlayers extends React.PureComponent<ViewModel & Actions> {
  componentDidMount() {
    this.fetchMissingPlayers(this.props);
  }

  componentWillReceiveProps(nextProps: ViewModel) {
    if (nextProps.players !== this.props.players) {
      this.fetchMissingPlayers(nextProps);
    }
  }

  render() {
    const { players } = this.props;
    const highlights = this.calculateHighlights(players);
    return (
      <Grid className="ComparePlayers" container={true} spacing={24}>
        <Grid item={true} xs={12} sm={12}>
          <Helmet>
            <title>PESto - {this.getSummary()}</title>
          </Helmet>
          <Typography type="title">Compare players</Typography>
          <div className="search-input flex">
            <SuggestPlayer onSelect={this.handlePlayerSelect} />
          </div>
        </Grid>
        <Grid item={true} xs={12} sm={12}>
          <Paper>
            <Grid container={true} spacing={0}>
              <Grid item={true} xs={6} md={3}>
                <ComparePlayersLabelColumn />
              </Grid>
              {players.map((player, index) => (
                <Grid item={true} xs={2} md={3} key={player.id}>
                  <Loading
                    when={!player.player || player.isLoading}
                    render={() => this.renderPlayer(player, highlights[index])}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  private renderPlayer(viewModel: PlayerViewModel, highlights: AbilityFlags) {
    const player = assert(
      viewModel.player,
      'Player should exist when !isLoading'
    );
    return (
      <ComparePlayersStatColumn
        player={player}
        highlights={highlights}
        onDelete={this.handlePlayerDelete}
      />
    );
  }

  /** Fetch any missing players. */
  private fetchMissingPlayers(props: ViewModel) {
    props.players.forEach(player => {
      if (!player.player && !player.isLoading) {
        this.props.getPlayer(player.id);
      }
    });
  }

  private getSummary() {
    const { players } = this.props;
    const summary = players
      .map(player => player.player && player.player.name)
      .filter(name => !!name)
      .join(' / ');
    return summary ? `Compare: ${summary}` : 'Compare';
  }

  private calculateHighlights(viewModels: PlayerViewModel[]) {
    const players = viewModels.map(vm => vm.player!).filter(p => !!p);
    return getHighestAbilities(players);
  }

  private handlePlayerSelect = (id: string) => {
    const { players } = this.props;
    const ids = players.map(p => p.id).concat([id]);
    this.props.history.push(`/players/compare/${ids.join('/')}`);
  };

  private handlePlayerDelete = (id: string) => {
    const { players } = this.props;
    const ids = players.map(p => p.id).filter(playerId => playerId !== id);
    this.props.history.push(`/players/compare/${ids.join('/')}`);
  };
}

const getViewModel = createSelector(
  [
    fromRoot.getRoutePlayerCompareOptions,
    fromRoot.getPlayersState,
    fromRoot.getRouterHistory
  ],
  (
    playerOptions: PlayerCompareOption[],
    state: fromPlayers.State,
    history: History
  ): ViewModel => {
    const viewModels = playerOptions.map(options =>
      createPlayerViewModel(state, options)
    );
    return {
      players: viewModels,
      history
    };
  }
);

const getActions = (dispatch: Dispatch<fromRoot.State>): Actions => {
  return {
    getPlayer: (id: string) => dispatch(playerActions.getPlayer(id)),
    dispatch
  };
};

// tslint:disable-next-line:variable-name
export const ConnectedComparePlayers = withRouter(
  connect(getViewModel, getActions)(ComparePlayers)
);
