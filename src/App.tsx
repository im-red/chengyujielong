import React from 'react';
import { Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  IonModal,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { SplashScreen } from '@capacitor/splash-screen';
import { BackButtonEvent } from '@ionic/core';
import { useIonRouter } from '@ionic/react';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';

import { AppProvider, useApp } from './data/AppContext';
import SideMenu from './components/SideMenu';
import DetailModal from './components/DetailModal';
import CandidatesModal from './components/CandidatesModal';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import LimitedTimeConfigPage from './pages/LimitedTimeConfigPage';
import PlayerSetupPage from './pages/PlayerSetupPage';
import MultiplayerGamePage from './pages/MultiplayerGamePage';
import HistoryDetailPage from './pages/HistoryDetailPage';
import PinyinPatchPage from './pages/PinyinPatchPage';
import IdiomLibraryPage from './pages/IdiomLibraryPage';
import TrendPage from './pages/TrendPage';
import FavoritesPage from './pages/FavoritesPage';
import SettingsPage from './pages/SettingsPage';
import AboutPage from './pages/AboutPage';

import './theme/variables.css';
import './App.scss';

setupIonicReact({
  mode: 'md',
});

const BackButtonHandler: React.FC = () => {
  const ionRouter = useIonRouter();

  React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const handleBackButton = (event: Event) => {
      const backButtonEvent = event as BackButtonEvent;
      backButtonEvent.detail.register(-1, () => {
        if (!ionRouter.canGoBack()) {
          CapacitorApp.exitApp();
        }
      });
    };

    document.addEventListener('ionBackButton', handleBackButton);

    return () => {
      document.removeEventListener('ionBackButton', handleBackButton);
    };
  }, [ionRouter]);

  return null;
};

const Modals: React.FC = () => {
  const {
    detailModalIdiom, detailModalSearchQuery, setDetailModalIdiom,
    candidatesModalIdiom, setCandidatesModalIdiom,
    addPatch, removePatch, getPatch, isFavorite, toggleFavorite,
  } = useApp();

  return (
    <>
      {detailModalIdiom && (
        <IonModal
          className="dialog-modal"
          isOpen={true}
          onDidDismiss={() => setDetailModalIdiom(null)}
        >
          <div className="dialog-container">
            <div className="dialog-header">
              <h2>成语详情</h2>
              <button
                className="dialog-close-btn"
                onClick={() => setDetailModalIdiom(null)}
                type="button"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <div className="dialog-body">
              <DetailModal
                idiom={detailModalIdiom}
                onClose={() => setDetailModalIdiom(null)}
                onAddPatch={addPatch}
                onRemovePatch={removePatch}
                getPatch={getPatch}
                searchQuery={detailModalSearchQuery}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
              />
            </div>
          </div>
        </IonModal>
      )}

      {candidatesModalIdiom && (
        <IonModal
          className="dialog-modal"
          isOpen={true}
          onDidDismiss={() => setCandidatesModalIdiom(null)}
        >
          <div className="dialog-container">
            <div className="dialog-header">
              <h2>候选成语</h2>
              <button
                className="dialog-close-btn"
                onClick={() => setCandidatesModalIdiom(null)}
                type="button"
                aria-label="关闭"
              >
                ×
              </button>
            </div>
            <div className="dialog-body">
              <CandidatesModal
                idiom={candidatesModalIdiom}
                onClose={() => setCandidatesModalIdiom(null)}
                onShowDetail={(idiom) => setDetailModalIdiom(idiom)}
                isFavorite={isFavorite}
                toggleFavorite={toggleFavorite}
              />
            </div>
          </div>
        </IonModal>
      )}
    </>
  );
};

const App: React.FC = () => {
  React.useEffect(() => {
    const hideSplash = async () => {
      try {
        await SplashScreen.hide();
      } catch (err) {
        console.warn('Error hiding splash screen', err);
      }
    };
    hideSplash();
  }, []);

  return (
    <IonApp>
      <AppProvider>
        <IonReactRouter>
          <BackButtonHandler />
          <SideMenu />
          <IonRouterOutlet id="main">
            <Route exact path="/" component={HomePage} />
            <Route exact path="/game" component={GamePage} />
            <Route exact path="/limited-time-config" component={LimitedTimeConfigPage} />
            <Route exact path="/player-setup" component={PlayerSetupPage} />
            <Route exact path="/multiplayer-game" component={MultiplayerGamePage} />
            <Route exact path="/history/:sessionId" component={HistoryDetailPage} />
            <Route exact path="/pinyin-patch" component={PinyinPatchPage} />
            <Route exact path="/idiom-library" component={IdiomLibraryPage} />
            <Route exact path="/trend" component={TrendPage} />
            <Route exact path="/favorites" component={FavoritesPage} />
            <Route exact path="/settings" component={SettingsPage} />
            <Route exact path="/about" component={AboutPage} />
          </IonRouterOutlet>
          <Modals />
        </IonReactRouter>
      </AppProvider>
    </IonApp>
  );
};

export default App;
