import { useState } from 'react';
import useAppVersion from '../hooks/useAppVersion';

const GITHUB_RELEASES_URL = 'https://github.com/im-red/chengyujielong/releases';

interface SettingsPageProps {
    onBack: () => void;
    onViewAbout: () => void;
}

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

function SettingsPage({ onBack, onViewAbout }: SettingsPageProps) {
    const [checking, setChecking] = useState(false);
    const { versionName: currentVersion, fullString: versionString } = useAppVersion();
    const [updateModal, setUpdateModal] = useState<{
        show: boolean;
        hasUpdate: boolean;
        latestVersion: string;
        currentVersion: string;
    }>({ show: false, hasUpdate: false, latestVersion: '', currentVersion: '' });

    const handleCheckUpdate = async () => {
        setChecking(true);
        try {
            const response = await fetch('https://api.github.com/repos/im-red/chengyujielong/releases/latest');
            const data = await response.json();
            const latestVersion = data.tag_name?.replace(/^v/, '') || '';

            if (!latestVersion) {
                setUpdateModal({
                    show: true,
                    hasUpdate: false,
                    latestVersion: '',
                    currentVersion
                });
                return;
            }

            const hasUpdate = compareVersions(latestVersion, currentVersion) > 0;
            setUpdateModal({
                show: true,
                hasUpdate,
                latestVersion,
                currentVersion
            });
        } catch {
            alert('检查更新失败，请检查网络连接。');
        } finally {
            setChecking(false);
        }
    };

    const handleViewRelease = () => {
        window.open(GITHUB_RELEASES_URL, '_blank');
        setUpdateModal(prev => ({ ...prev, show: false }));
    };

    return (
        <div className="settings-container">
            <header className="app-header">
                <button className="btn-back" onClick={onBack}>←</button>
                <div className="header-title">
                    <h1>设置</h1>
                </div>
            </header>

            <div className="settings-content">
                <div className="settings-section">
                    <button className="settings-item settings-item--clickable" onClick={handleCheckUpdate} disabled={checking}>
                        <div className="settings-item-icon">🔄</div>
                        <div className="settings-item-content">
                            <div className="settings-item-label">{checking ? '正在检查...' : '检查更新'} <span className="settings-item-version">{versionString}</span></div>
                        </div>
                        <div className="settings-item-arrow">›</div>
                    </button>
                    <button className="settings-item settings-item--clickable" onClick={onViewAbout}>
                        <div className="settings-item-icon">ℹ️</div>
                        <div className="settings-item-content">
                            <div className="settings-item-label">关于</div>
                        </div>
                        <div className="settings-item-arrow">›</div>
                    </button>
                </div>
            </div>

            {updateModal.show && (
                <div className="modal show" onClick={() => setUpdateModal(prev => ({ ...prev, show: false }))}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="update-modal-body">
                            <div className="update-modal-icon">{updateModal.hasUpdate ? '🆕' : '✅'}</div>
                            {updateModal.hasUpdate ? (
                                <>
                                    <h2 className="update-modal-title">发现新版本</h2>
                                    <p className="update-modal-text">
                                        最新版本: v{updateModal.latestVersion}<br />
                                        当前版本: v{updateModal.currentVersion}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <h2 className="update-modal-title">已是最新版本</h2>
                                    <p className="update-modal-text">
                                        当前版本: v{updateModal.currentVersion}
                                    </p>
                                </>
                            )}
                            <div className="update-modal-buttons">
                                <button className={`btn ${updateModal.hasUpdate ? 'btn-primary' : 'btn-secondary'}`} onClick={handleViewRelease}>
                                    {updateModal.hasUpdate ? '查看更新' : '查看发布页'}
                                </button>
                                <button className="btn btn-secondary" onClick={() => setUpdateModal(prev => ({ ...prev, show: false }))}>
                                    关闭
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default SettingsPage;
