import React from 'react';
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon,
  IonMenuToggle,
  IonFooter,
} from '@ionic/react';
import { star, trendingUp, book, create, cloudUpload, cloudDownload, settings } from 'ionicons/icons';
import useAppVersion from '../hooks/useAppVersion';
import { useApp } from '../data/AppContext';

const SideMenu: React.FC = () => {
  const versionInfo = useAppVersion();
  const { favoritesCount, patches, exportData, importData } = useApp();
  const patchesCount = patches.length;

  return (
    <IonMenu contentId="main" menuId="side-menu" side="start">
      <IonHeader>
        <IonToolbar>
          <IonTitle>菜单</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList lines="full">
          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/favorites" routerDirection="root">
              <IonIcon icon={star} slot="start" />
              <IonLabel>收藏夹</IonLabel>
              {favoritesCount > 0 && (
                <IonLabel slot="end" color="medium">{favoritesCount}</IonLabel>
              )}
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/trend" routerDirection="root">
              <IonIcon icon={trendingUp} slot="start" />
              <IonLabel>成绩趋势</IonLabel>
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/idiom-library" routerDirection="root">
              <IonIcon icon={book} slot="start" />
              <IonLabel>成语词典</IonLabel>
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/pinyin-patch" routerDirection="root">
              <IonIcon icon={create} slot="start" />
              <IonLabel>拼音修正</IonLabel>
              {patchesCount > 0 && (
                <IonLabel slot="end" color="medium">{patchesCount}</IonLabel>
              )}
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem button onClick={() => exportData()} routerDirection="none">
              <IonIcon icon={cloudUpload} slot="start" />
              <IonLabel>导出数据</IonLabel>
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem button onClick={() => importData()} routerDirection="none">
              <IonIcon icon={cloudDownload} slot="start" />
              <IonLabel>导入数据</IonLabel>
            </IonItem>
          </IonMenuToggle>
          <IonMenuToggle autoHide={false}>
            <IonItem button routerLink="/settings" routerDirection="root">
              <IonIcon icon={settings} slot="start" />
              <IonLabel>设置</IonLabel>
            </IonItem>
          </IonMenuToggle>
        </IonList>
      </IonContent>
      <IonFooter>
        <IonToolbar>
          <IonTitle size="small" className="ion-text-center">{versionInfo.fullString}</IonTitle>
        </IonToolbar>
      </IonFooter>
    </IonMenu>
  );
};

export default SideMenu;
