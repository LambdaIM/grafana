// Libaries
import React, { PureComponent, FC, ReactNode } from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { css } from 'emotion';
// Utils & Services
import { appEvents } from 'app/core/app_events';
import { PlaylistSrv } from 'app/features/playlist/playlist_srv';
// Components
import { DashNavButton } from './DashNavButton';
import { DashNavTimeControls } from './DashNavTimeControls';
import { Icon, ModalsController } from '@grafana/ui';
import { textUtil } from '@grafana/data';
import { BackButton } from 'app/core/components/BackButton/BackButton';
// State
import { updateLocation } from 'app/core/actions';
import { updateTimeZoneForSession } from 'app/features/profile/state/reducers';
// Types
import { DashboardModel } from '../../state';
import { StoreState, CoreEvents } from 'app/types';
import Drawer from 'rc-drawer';

import langconfig from './lang';
import { Select } from '@grafana/ui';
import { SelectableValue } from '@grafana/data';

export interface OwnProps {
  dashboard: DashboardModel;
  isFullscreen: boolean;
  $injector: any;
  onAddPanel: () => void;
}

interface DispatchProps {
  updateTimeZoneForSession: typeof updateTimeZoneForSession;
  updateLocation: typeof updateLocation;
}

interface DashNavButtonModel {
  show: (props: Props) => boolean;
  component: FC<Partial<Props>>;
  index?: number | 'end';
}

const customLeftActions: DashNavButtonModel[] = [];
const customRightActions: DashNavButtonModel[] = [];

export function addCustomLeftAction(content: DashNavButtonModel) {
  customLeftActions.push(content);
}

export function addCustomRightAction(content: DashNavButtonModel) {
  customRightActions.push(content);
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
      {
        value: 'main',
        label: langconfig['mainnet_' + lang],
        // label: 'yyy'
      },
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

  onFolderNameClick = () => {
    this.props.updateLocation({
      query: { search: 'open', folder: 'current' },
      partial: true,
    });
  };

  onClose = () => {
    this.props.updateLocation({
      query: { viewPanel: null },
      partial: true,
    });
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

  onDashboardNameClick = () => {
    this.props.updateLocation({
      query: { search: 'open' },
      partial: true,
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

  addCustomContent(actions: DashNavButtonModel[], buttons: ReactNode[]) {
    actions.map((action, index) => {
      const Component = action.component;
      const element = <Component {...this.props} key={`button-custom-${index}`} />;
      typeof action.index === 'number' ? buttons.splice(action.index, 0, element) : buttons.push(element);
    });
  }

  renderLeftActionsButton() {
    const { dashboard } = this.props;
    const { canStar, canShare, isStarred } = dashboard.meta;

    const buttons: ReactNode[] = [];
    if (canStar) {
      buttons.push(
        <DashNavButton
          tooltip="Mark as favorite"
          classSuffix="star"
          icon={isStarred ? 'favorite' : 'star'}
          iconType={isStarred ? 'mono' : 'default'}
          iconSize="lg"
          noBorder={true}
          onClick={this.onStarDashboard}
          key="button-star"
        />
      );
    }

    if (canShare) {
      buttons.push(
        <ModalsController key="button-share">
          {({ showModal, hideModal }) => (
            <DashNavButton
              tooltip="Share dashboard"
              classSuffix="share"
              icon="share-alt"
              iconSize="lg"
              noBorder={true}
              onClick={() => {
                showModal(ShareModal, {
                  dashboard,
                  onDismiss: hideModal,
                });
              }}
            />
          )}
        </ModalsController>
      );
    }

    this.addCustomContent(customLeftActions, buttons);
    return buttons;
  }

  renderDashboardTitleSearchButton() {
    const { dashboard, isFullscreen } = this.props;

    const folderSymbol = css`
      margin-right: 0 4px;
    `;
    const mainIconClassName = css`
      margin-right: 8px;
      margin-bottom: 3px;
    `;

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
      window.location.href = 'http://stats.lambdastorage.com/';
    }
    //window.location.href = window.location.origin + '/' + lang + '/';
  };

  renderRightActionsButton() {
    const { dashboard, onAddPanel } = this.props;
    const { canSave, showSettings } = dashboard.meta;
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

const mapDispatchToProps: MapDispatchToProps<DispatchProps, OwnProps> = {
  updateLocation,
  updateTimeZoneForSession,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(DashNav);
