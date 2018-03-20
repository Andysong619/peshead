import { History } from 'history';
import { Paper } from 'material-ui';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';
import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { withRouter } from 'react-router';
import { createSelector } from 'reselect';

import * as playerActions from '../../actions/players';
import { ComparePlayersLabelColumn } from '../../components/ComparePlayersLabelColumn';
import { ComparePlayersStatColumn } from '../../components/ComparePlayersStatColumn';
import { Loading } from '../../components/Loading';
import * as fromRoot from '../../reducers';
import * as fromPlayers from '../../reducers/players';
import { PlayerCompareOption } from '../../reducers/ui/routing';
import { assert } from '../../shared/assert';
import { Player as PlayerModel, Position } from '../../shared/service/api';
import { SuggestPlayer } from '../../components/SuggestPlayer';

export interface ViewModel {
  players: PlayerViewModel[];
  position?: Position;
  history: History;
}

export interface PlayerViewModel extends PlayerCompareOption {
  data?: PlayerModel;
  isLoading: boolean;
}

export interface Actions {
  getPlayer: typeof playerActions.getPlayer;
  dispatch: Dispatch<fromRoot.State>;
}

const createPlayerViewModel = (
  state: fromPlayers.State,
  playerOptions: PlayerCompareOption
): PlayerViewModel => {
  const player = fromPlayers.getPlayerById(state, playerOptions.id);
  return {
    id: playerOptions.id,
    data: player,
    isLoading: !player,
    form: 'A',
    level: 30
  };
};

export class ComparePlayers extends React.PureComponent<ViewModel & Actions> {
  componentDidMount() {
    this.props.players.forEach(p => this.props.getPlayer(p.id));
  }

  componentWillReceiveProps(nextProps: ViewModel) {
    if (nextProps.players !== this.props.players) {
      nextProps.players.forEach(p => this.props.getPlayer(p.id));
    }
  }

  render() {
    const { players } = this.props;
    return (
      <Grid className="ComparePlayers" container={true} spacing={24}>
        <Grid item={true} xs={12} sm={12}>
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
              {players.map(player => (
                <Grid item={true} xs={2} md={3} key={player.id}>
                  <Loading
                    when={player.isLoading}
                    render={() => this.renderPlayer(player)}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    );
  }

  private renderPlayer(viewModel: PlayerViewModel) {
    const player = assert(
      viewModel.data,
      'Player should exist when !isLoading'
    );
    return <ComparePlayersStatColumn player={player} />;
  }

  private handlePlayerSelect = (id: string) => {
    const { players } = this.props;
    const ids = players.map(p => p.id).concat([id]);
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