import iconSvg from '../../resources/icon.svg';
import useAppVersion from '../hooks/useAppVersion';

const GITHUB_REPO_URL = 'https://github.com/im-red/chengyujielong';

interface AboutPageProps {
    onBack: () => void;
}

function AboutPage({ onBack }: AboutPageProps) {
    const { fullString: versionString } = useAppVersion();

    const handleViewWebsite = () => {
        window.open(GITHUB_REPO_URL, '_blank');
    };

    return (
        <div className="settings-container">
            <header className="app-header">
                <button className="btn-back" onClick={onBack}>←</button>
                <div className="header-title">
                    <h1>关于</h1>
                </div>
            </header>

            <div className="settings-content">
                <div className="about-app-info">
                    <img className="about-app-icon" src={iconSvg} alt="成语接龙" />
                    <div className="about-app-name">成语接龙</div>
                    <div className="about-app-version">{versionString}</div>
                </div>

                <div className="settings-section">
                    <div className="settings-section-title">信息</div>
                    <button className="settings-item settings-item--clickable" onClick={handleViewWebsite}>
                        <div className="settings-item-icon">🌐</div>
                        <div className="settings-item-content">
                            <div className="settings-item-label">查看网站</div>
                            <div className="settings-item-hint">GitHub 仓库</div>
                        </div>
                        <div className="settings-item-arrow">›</div>
                    </button>
                    <div className="settings-item">
                        <div className="settings-item-icon">📄</div>
                        <div className="settings-item-content">
                            <div className="settings-item-label">许可协议</div>
                            <div className="settings-item-value">MIT License</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutPage;
