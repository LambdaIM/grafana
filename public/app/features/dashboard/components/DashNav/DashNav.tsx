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

import langconfig from './lang';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

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

export interface State {
  selectLang: Object;
  selectNet: Object;
  langlist: Array<{ value: string; label: string }>;
  netlist: Array<{ value: string; label: string }>;
}

type Props = StateProps & OwnProps;

var isopen = false;
var timeid: any;
var lang: string;
var pagelang: Object;
var selectLangNow: Object;

export class DashNav extends PureComponent<Props, State> {
  playlistSrv: PlaylistSrv;

  constructor(props: Props) {
    super(props);
    this.playlistSrv = this.props.$injector.get('playlistSrv');
    console.log(this.props.location.query);
    lang = this.props.location.query.lang || 'zh';
    pagelang = langconfig;
    if (['zh', 'en'].indexOf(lang) == -1) {
      lang = 'zh';
    }
    //====
    var netType: String = this.props.location.query.netType || 'main';
    var net1: any, lang1: any;
    const dashboardPermissionLevels: Array<{ value: string; label: string }> = [
      {
        value: 'zh',
        label: langconfig['lang_zh'],
      },
      {
        value: 'en',
        label: langconfig['lang_en'],
      },
    ];

    const dashboardNetLevels: Array<{ value: string; label: string }> = [
      {
        value: 'test',
        label: langconfig['testnet_' + lang],
        // label: 'xxxxxx'
      },
      // {
      //   value: 'main',
      //   label: langconfig['mainnet_' + lang],
      //   // label: 'yyy'
      // },
    ];

    dashboardNetLevels.forEach(item => {
      if (item.value == netType) {
        net1 = item;
      }
    });

    dashboardPermissionLevels.forEach(item => {
      if (item.value == lang) {
        selectLangNow = item;
        lang1 = item;
      }
    });

    this.state = {
      selectLang: lang1,
      selectNet: net1,
      langlist: dashboardPermissionLevels,
      netlist: dashboardNetLevels,
    };
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
  onLangChanged = (option: SelectableValue<String>) => {
    console.log('onLangChanged');
    console.log(option);
    selectLangNow = option;

    this.setState({ selectLang: selectLangNow });

    this.gotopage(option.value);
  };

  onNetChanged = (option: SelectableValue<String>) => {
    console.log('onNetChanged');

    this.setState({ selectNet: option });

    this.gotopageNet(option.value);
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
  gotopage = (lang: String) => {
    window.location.href = window.location.origin + '/' + lang + '/';
  };

  gotopageNet = (lang: String) => {
    if (lang == 'test') {
      window.location.href = 'http://teststats.lambdastorage.com/';
    } else {
      window.location.href = 'http://tstats.lambdastorage.com/';
    }
    //window.location.href = window.location.origin + '/' + lang + '/';
  };

  render() {
    const { dashboard, onAddPanel, location, $injector } = this.props;
    const { canStar, canSave, canShare, showSettings, isStarred } = dashboard.meta;
    const { snapshot } = dashboard;
    const snapshotUrl = snapshot && snapshot.originalUrl;

    console.log('isopen', isopen);
    console.log('多语言', langconfig, pagelang, langconfig['home_' + lang]);

    return (
      <div className="navbar">
        {this.renderDashboardTitleSearchButton()}
        <div onClick={this.onClickMENU.bind(this)} className="navbar-buttons mobilemenu">
          <i className="fa fa-bars" />
          <Drawer width="50vw" open={isopen} placement="right" handler={false} onClose={this.onClickMENU}>
            <div className="mobile-menu-ul">
              <ul>
                <li>
                  <a href="https://lambdastorage.com/">{langconfig['home_' + lang]}</a>
                </li>
                <li>
                  <a href="https://lambdastorage.com/about">{langconfig['About_' + lang]}</a>
                </li>
                {/* <li>
                  <a href="https://lambdastorage.com/ecology">Lambda Eco</a>
                </li>
                <li>
                  <a href="https://lambdastorage.com/technologies">技术探索</a>
                </li> */}
                <li>
                  <a href="https://lambdastorage.com/developer">{langconfig['doc_' + lang]}</a>
                </li>
                {/* <li>
                  <a href="http://faucet.lambdastorage.com/">{langconfig['testcoin_' + lang]}</a>
                </li> */}
                <li>
                  <a href="http://explorer.lambdastorage.com/">{langconfig['browser_' + lang]}</a>
                </li>
                <li>
                  <a href="http://s3.oneweb.one/minio/login">Lambda S3</a>
                </li>
                <li>
                  <Select
                    value={this.state.selectNet}
                    onChange={this.onNetChanged}
                    options={this.state.netlist}
                    isSearchable={false}
                    className="gf-form-select-box__control--menu-right uiSelect"
                  />
                </li>

                <li>
                  <Select
                    value={this.state.selectLang}
                    onChange={this.onLangChanged}
                    options={this.state.langlist}
                    isSearchable={false}
                    className="gf-form-select-box__control--menu-right uiSelect"
                  />
                </li>
              </ul>
            </div>
          </Drawer>
        </div>
        <div className="navbar-buttons navbar-buttons--tv">
          <a href="https://lambdastorage.com/" target="_blank">
            {langconfig['home_' + lang]}
          </a>
        </div>

        <div className="navbar-buttons navbar-buttons--tv">
          <a href="https://lambdastorage.com/about" target="_blank">
            {' '}
            {langconfig['About_' + lang]}
          </a>
        </div>

        {/* <div className="navbar-buttons navbar-buttons--tv">
          <a href="https://lambdastorage.com/ecology" target="_blank">
            {' '}
            Lambda Eco
          </a>
        </div>
        <div className="navbar-buttons navbar-buttons--tv">
          <a href="https://lambdastorage.com/technologies" target="_blank">
            {' '}
            技术探索
          </a>
        </div> */}
        <div className="navbar-buttons navbar-buttons--tv">
          <a href="https://lambdastorage.com/developer" target="_blank">
            {' '}
            {langconfig['doc_' + lang]}
          </a>
        </div>
        {/* <div className="navbar-buttons navbar-buttons--tv">
          <a href="http://faucet.lambdastorage.com/" target="_blank">
            {' '}
            {langconfig['testcoin_' + lang]}
          </a>
        </div> */}
        <div className="navbar-buttons navbar-buttons--tv">
          <a href="http://explorer.lambdastorage.com/" target="_blank">
            {' '}
            {langconfig['browser_' + lang]}
          </a>
        </div>
        <div className="navbar-buttons navbar-buttons--tv">
          <a href="http://s3.oneweb.one/minio/login" target="_blank">
            {' '}
            Lambda S3
          </a>
        </div>
        <div className="navbar-buttons navbar-buttons--tv">
          <Select
            value={this.state.selectNet}
            onChange={this.onNetChanged}
            options={this.state.netlist}
            isSearchable={false}
            className="gf-form-select-box__control--menu-right uiSelect"
          />
        </div>

        <div className="navbar-buttons navbar-buttons--tv">
          <Select
            value={this.state.selectLang}
            onChange={this.onLangChanged}
            options={this.state.langlist}
            isSearchable={false}
            className="gf-form-select-box__control--menu-right uiSelect"
          />
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
