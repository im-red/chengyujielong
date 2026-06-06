import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonAlert,
} from '@ionic/react';
import { globeOutline, documentTextOutline, refreshOutline } from 'ionicons/icons';
import iconSvg from '../../resources/icon.svg';
import useAppVersion from '../hooks/useAppVersion';
import './AboutPage.scss';

const GITHUB_REPO_URL = 'https://github.com/im-red/chengyujielong';
const GITHUB_RELEASES_URL = 'https://github.com/im-red/chengyujielong/releases';
const GITHUB_API_LATEST_RELEASE_URL = 'https://api.github.com/repos/im-red/chengyujielong/releases/latest';

function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  const len = Math.max(partsA.length, partsB.length);
  for (let i = 0; i < len; i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA > numB) return 1;
    if (numA < numB) return -1;
  }
  return 0;
}

const AboutPage: React.FC = () => {
  const { versionName: currentVersion, fullString: versionString } = useAppVersion();
  const [checking, setChecking] = useState(false);
  const [updateAlert, setUpdateAlert] = useState<{
    show: boolean;
    hasUpdate: boolean;
    latestVersion: string;
    currentVersion: string;
  }>({ show: false, hasUpdate: false, latestVersion: '', currentVersion: '' });

  const handleCheckUpdate = async () => {
    setChecking(true);
    try {
      const response = await fetch(GITHUB_API_LATEST_RELEASE_URL);
      const data = await response.json();
      const latestVersion = data.tag_name?.replace(/^v/, '') || '';

      if (!latestVersion) {
        setUpdateAlert({
          show: true,
          hasUpdate: false,
          latestVersion: '',
          currentVersion: versionString,
        });
        return;
      }

      const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;
      setUpdateAlert({
        show: true,
        hasUpdate,
        latestVersion,
        currentVersion: versionString,
      });
    } catch {
      setUpdateAlert({
        show: true,
        hasUpdate: false,
        latestVersion: '',
        currentVersion: versionString,
      });
    } finally {
      setChecking(false);
    }
  };

  const handleViewRelease = () => {
    window.open(GITHUB_RELEASES_URL, '_blank');
    setUpdateAlert(prev => ({ ...prev, show: false }));
  };

  const handleViewWebsite = () => {
    window.open(GITHUB_REPO_URL, '_blank');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/settings" />
          </IonButtons>
          <IonTitle>关于</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-text-center">
        <div className="about-app-info">
          <img className="about-app-icon" src={iconSvg} alt="成语接龙" />
          <div className="about-app-name">成语接龙</div>
          <div className="about-app-version">{versionString}</div>
        </div>

        <IonList lines="full" className="ion-text-left">
          <IonItem button onClick={handleCheckUpdate} disabled={checking}>
            <IonIcon icon={refreshOutline} slot="start" />
            <IonLabel>
              <h2>{checking ? '正在检查...' : '检查更新'}</h2>
            </IonLabel>
          </IonItem>

          <IonItem button onClick={handleViewWebsite}>
            <IonIcon icon={globeOutline} slot="start" />
            <IonLabel>
              <h2>查看网站</h2>
              <p>GitHub 仓库</p>
            </IonLabel>
          </IonItem>

          <IonItem>
            <IonIcon icon={documentTextOutline} slot="start" />
            <IonLabel>
              <h2>许可协议</h2>
              <p>MIT License</p>
            </IonLabel>
          </IonItem>
        </IonList>

        <IonAlert
          isOpen={updateAlert.show}
          onDidDismiss={() => setUpdateAlert(prev => ({ ...prev, show: false }))}
          header={updateAlert.hasUpdate ? '发现新版本' : '已是最新版本'}
          cssClass="update-alert"
          message={
            updateAlert.hasUpdate
              ? `当前版本: ${updateAlert.currentVersion}\n最新版本: v${updateAlert.latestVersion}`
              : `当前版本 ${updateAlert.currentVersion} 已是最新版本`
          }
          buttons={
            updateAlert.hasUpdate
              ? [
                { text: '取消', role: 'cancel' },
                { text: '查看发布', handler: handleViewRelease },
              ]
              : [{ text: '确定', role: 'cancel' }]
          }
        />
      </IonContent>
    </IonPage>
  );
};

export default AboutPage;
