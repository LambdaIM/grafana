// Libaries
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

// Utils & Services
import { appEvents } from 'app/core/app_events';
import { PlaylistSrv } from 'app/features/playlist/playlist_srv';

// Components
import { DashNavButton } from './DashNavButton';
import { DashNavTimeControls } from './DashNavTimeControls';
import { Tooltip } from '@grafana/ui';

// State
import { updateLocation } from 'app/core/actions';

// Types
import { DashboardModel } from '../../state';
import { StoreState, CoreEvents } from 'app/types';
import Drawer from 'rc-drawer';

export interface OwnProps {
  dashboard: DashboardModel;
  editview: string;
  isEditing: boolean;
  isFullscreen: boolean;
  $injector: any;
  updateLocation: typeof updateLocation;
  onAddPanel: () => void;
}

export interface StateProps {
  location: any;
}

type Props = StateProps & OwnProps;

var isopen = false;
var timeid: any;
export class DashNav extends PureComponent<Props> {
  playlistSrv: PlaylistSrv;

  constructor(props: Props) {
    super(props);
    this.playlistSrv = this.props.$injector.get('playlistSrv');
    console.log(this.props.location.query);
  }

  onDahboardNameClick = () => {
    appEvents.emit(CoreEvents.showDashSearch);
  };

  onFolderNameClick = () => {
    appEvents.emit(CoreEvents.showDashSearch, {
      query: 'folder:current',
    });
  };

  onClose = () => {
    if (this.props.editview) {
      this.props.updateLocation({
        query: { editview: null },
        partial: true,
      });
    } else {
      this.props.updateLocation({
        query: { panelId: null, edit: null, fullscreen: null, tab: null },
        partial: true,
      });
    }
  };
  onClickMENU = () => {
    clearTimeout(timeid);
    var _this = this;
    timeid = setTimeout(() => {
      isopen = !isopen;
      _this.forceUpdate();
    }, 100);
  };

  openMenu = () => {};

  onToggleTVMode = () => {
    appEvents.emit(CoreEvents.toggleKioskMode);
  };

  onSave = () => {
    const { $injector } = this.props;
    const dashboardSrv = $injector.get('dashboardSrv');
    dashboardSrv.saveDashboard();
  };

  onOpenSettings = () => {
    this.props.updateLocation({
      query: { editview: 'settings' },
      partial: true,
    });
  };

  onStarDashboard = () => {
    const { dashboard, $injector } = this.props;
    const dashboardSrv = $injector.get('dashboardSrv');

    dashboardSrv.starDashboard(dashboard.id, dashboard.meta.isStarred).then((newState: any) => {
      dashboard.meta.isStarred = newState;
      this.forceUpdate();
    });
  };

  onPlaylistPrev = () => {
    this.playlistSrv.prev();
  };

  onPlaylistNext = () => {
    this.playlistSrv.next();
  };

  onPlaylistStop = () => {
    this.playlistSrv.stop();
    this.forceUpdate();
  };

  onOpenShare = () => {
    const $rootScope = this.props.$injector.get('$rootScope');
    const modalScope = $rootScope.$new();
    modalScope.tabIndex = 0;
    modalScope.dashboard = this.props.dashboard;

    appEvents.emit(CoreEvents.showModal, {
      src: 'public/app/features/dashboard/components/ShareModal/template.html',
      scope: modalScope,
    });
  };

  renderDashboardTitleSearchButton() {
    const { dashboard } = this.props;

    const folderTitle = dashboard.meta.folderTitle;
    const haveFolder = dashboard.meta.folderId > 0;

    return (
      <>
        <div>
          <div className="navbar-page-btn">
            <img className="lambdalogo" src="/public/img/lambdalogow.svg" />
          </div>
        </div>
        <div className="navbar__spacer">
          <a className="innerlink">{dashboard.title}</a>
        </div>
      </>
    );
  }

  get isInFullscreenOrSettings() {
    return this.props.editview || this.props.isFullscreen;
  }

  get isSettings() {
    return this.props.editview;
  }

  renderBackButton() {
    return (
      <div className="navbar-edit">
        <Tooltip content="Go back (Esc)">
          <button className="navbar-edit__back-btn" onClick={this.openMenu}>
            <i className="fa fa-arrow-left" />
          </button>
        </Tooltip>
      </div>
    );
  }

  render() {
    const { dashboard, onAddPanel, location, $injector } = this.props;
    const { canStar, canSave, canShare, showSettings, isStarred } = dashboard.meta;
    const { snapshot } = dashboard;
    const snapshotUrl = snapshot && snapshot.originalUrl;

    console.log('isopen', isopen);

    return (
      <div className="navbar">
        {this.renderDashboardTitleSearchButton()}
        <div onClick={this.onClickMENU.bind(this)} className="navbar-buttons mobilemenu">
          <i className="fa fa-bars" />
          <Drawer open={isopen} placement="right" handler={false} onClose={this.onClickMENU}>
            <div className="mobile-menu-ul">
              <ul>
                <li>
                  <a>首页</a>
                </li>
                <li>
                  <a>文档</a>
                </li>
                <li>
                  <a>领取测试币</a>
                </li>
                <li>
                  <a>浏览器</a>
                </li>
                <li>
                  <a>主网</a>
                </li>
                <li>
                  <a>测试网</a>
                </li>

                <li>
                  <a>
                    <img width="30" src="public/img/Nationalzhch.svg" />
                  </a>
                </li>
                <li>
                  <a>
                    <img width="30" src="public/img/Nationalen.svg" />
                  </a>
                </li>
              </ul>
            </div>
          </Drawer>
        </div>
        <div className="navbar-buttons navbar-buttons--tv">
          <a href="http://www.lambdastorage.com/" target="_blank">
            首页
          </a>
        </div>
        <div className="navbar-buttons navbar-buttons--tv">
          <a href="http://faucet.lambda.im/" target="_blank">
            {' '}
            测试币
          </a>
        </div>
        <div className="navbar-buttons navbar-buttons--tv">
          <a href="http://docs.lambdastorage.com/" target="_blank">
            {' '}
            文档
          </a>
        </div>
        <div className="navbar-buttons navbar-buttons--tv">
          <a href="http://docs.lambdastorage.com/" target="_blank">
            {' '}
            浏览器
          </a>
        </div>
        <div className="navbar-buttons navbar-buttons--tv">
          <a href="http://docs.lambdastorage.com/" target="_blank">
            {' '}
            主网
          </a>
        </div>
        <div className="navbar-buttons navbar-buttons--tv">
          <a href="http://docs.lambdastorage.com/" target="_blank">
            {' '}
            测试网
          </a>
        </div>

        <div className="navbar-buttons navbar-buttons--tv">
          <a>
            <img width="30" src="public/img/Nationalen.svg" />
          </a>
        </div>
        <div className="navbar-buttons navbar-buttons--tv">
          <a>
            <img width="30" src="public/img/Nationalzhch.svg" />
          </a>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state: StoreState) => ({
  location: state.location,
  open: state.open,
});

const mapDispatchToProps = {
  updateLocation,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashNav);
