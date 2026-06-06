import React, { useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonAlert,
} from '@ionic/react';
import { useApp } from '../data/AppContext';
import './PinyinPatchPage.scss';

const PinyinPatchPage: React.FC = () => {
  const { patches, removePatch, clearAllPatches } = useApp();
  const [showClearAllAlert, setShowClearAllAlert] = useState(false);
  const [deleteTargetIdiom, setDeleteTargetIdiom] = useState<string | null>(null);

  const handleClearAll = () => {
    setShowClearAllAlert(true);
  };

  const handleDelete = (idiom: string) => {
    setDeleteTargetIdiom(idiom);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString('zh-CN');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>拼音修正</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {patches.length === 0 ? (
          <div className="patch-empty">
            <p>暂无拼音修正记录</p>
            <p className="patch-empty-sub">在成语详情弹窗中点击"修正拼音"来添加</p>
          </div>
        ) : (
          <>
            <div className="patch-header">
              <span className="patch-count">共 {patches.length} 条修正</span>
              <button
                onClick={handleClearAll}
                className="btn-clear-patches"
              >
                清空
              </button>
            </div>

            {patches.map(patch => (
              <div key={patch.idiom} className="patch-card">
                <div className="patch-card-header">
                  <h3 className="patch-card-title">{patch.idiom}</h3>
                  <button
                    onClick={() => handleDelete(patch.idiom)}
                    className="btn-delete-patch"
                    title="删除"
                  >
                    🗑️
                  </button>
                </div>
                <div className="patch-card-details">
                  <div>
                    <span className="patch-label">原拼音:</span>
                    <span className="patch-original">{patch.originalPinyin}</span>
                  </div>
                  <div>
                    <span className="patch-label">修正后:</span>
                    <span className="patch-corrected">{patch.correctedPinyin}</span>
                  </div>
                </div>
                <div className="patch-date">
                  {formatDate(patch.createdAt)}
                </div>
              </div>
            ))}
          </>
        )}

        <IonAlert
          isOpen={showClearAllAlert}
          onDidDismiss={() => setShowClearAllAlert(false)}
          header="清空所有拼音修正"
          message="确定要清空所有拼音修正吗？"
          buttons={[
            { text: '取消', role: 'cancel' },
            { text: '确定', role: 'destructive', handler: () => clearAllPatches() }
          ]}
        />

        <IonAlert
          isOpen={deleteTargetIdiom !== null}
          onDidDismiss={() => setDeleteTargetIdiom(null)}
          header="删除拼音修正"
          message={`确定要删除"${deleteTargetIdiom}"的拼音修正吗？`}
          buttons={[
            { text: '取消', role: 'cancel' },
            {
              text: '确定', role: 'destructive',
              handler: () => {
                if (deleteTargetIdiom) {
                  removePatch(deleteTargetIdiom);
                }
              }
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default PinyinPatchPage;
