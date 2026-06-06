import React, { useState, useMemo } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
} from '@ionic/react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useApp } from '../data/AppContext';
import { GameMode, GameSession, LimitedTimeConfig } from '../models';
import './TrendPage.scss';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TrendPage: React.FC = () => {
  const { gameState } = useApp();
  const { sessions } = gameState;

  const limitedTimeSessions = useMemo(() =>
    sessions.filter(s => s.mode === GameMode.LimitedTime && s.endTime),
    [sessions]
  );

  const currentSessions = limitedTimeSessions;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/" />
          </IonButtons>
          <IonTitle>成绩趋势</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        {currentSessions.length === 0 ? (
          <div className="trend-empty">
            <p>暂无限时模式的游戏记录</p>
          </div>
        ) : (
          <TrendChart sessions={currentSessions} />
        )}
      </IonContent>
    </IonPage>
  );
};

interface TrendChartProps {
  sessions: GameSession[];
}

function TrendChart({ sessions }: TrendChartProps) {
  const configs = useMemo(() => {
    const configMap = new Map<string, { label: string; config: LimitedTimeConfig }>();

    sessions.forEach(session => {
      if (session.limitedTimeConfig) {
        const key = `${session.limitedTimeConfig.gameTimeLimit}`;
        if (!configMap.has(key)) {
          const mins = Math.floor(session.limitedTimeConfig.gameTimeLimit / 60);
          const secs = session.limitedTimeConfig.gameTimeLimit % 60;
          let label: string;
          if (mins > 0 && secs > 0) {
            label = `${mins}分${secs}秒`;
          } else if (mins > 0) {
            label = `${mins}分钟`;
          } else {
            label = `${secs}秒`;
          }
          configMap.set(key, { label, config: session.limitedTimeConfig });
        }
      }
    });

    return Array.from(configMap.values()).sort((a, b) => a.config.gameTimeLimit - b.config.gameTimeLimit);
  }, [sessions]);

  const [selectedConfigIndex, setSelectedConfigIndex] = useState(0);
  const selectedConfig = configs[selectedConfigIndex]?.config;

  const filteredSessions = useMemo(() => {
    if (!selectedConfig) return [];

    return sessions.filter(session => {
      if (session.limitedTimeConfig) {
        return session.limitedTimeConfig.gameTimeLimit === (selectedConfig as LimitedTimeConfig).gameTimeLimit;
      }
      return false;
    }).sort((a, b) => a.startTime - b.startTime);
  }, [sessions, selectedConfig]);

  const chartData = useMemo(() => {
    const labels = filteredSessions.map((_, i) => `#${i + 1}`);
    const scores = filteredSessions.map(s => s.score);

    // Get primary color from document or use fallback
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary').trim() || '#3880ff';

    return {
      labels,
      datasets: [
        {
          label: '得分',
          data: scores,
          fill: true,
          borderColor: primaryColor,
          backgroundColor: 'rgba(56, 128, 255, 0.1)',
          pointBackgroundColor: primaryColor,
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: primaryColor,
          pointHoverBorderColor: '#ffffff',
          pointBorderWidth: 2,
          tension: 0.3,
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    };
  }, [filteredSessions]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 13 },
        bodyFont: { size: 14 },
        padding: 10,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (tooltipItems: any[]) => {
            return `#${tooltipItems[0].dataIndex + 1}`;
          },
          label: (context: any) => {
            return `得分: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const stats = useMemo(() => {
    if (filteredSessions.length === 0) return null;
    const scores = filteredSessions.map(s => s.score);
    const count = scores.length;
    const total = scores.reduce((sum, s) => sum + s, 0);
    const average = Math.round(total / count);
    const max = Math.max(...scores);
    const min = Math.min(...scores);
    return { count, average, max, min };
  }, [filteredSessions]);

  return (
    <div>
      {configs.length > 1 && (
        <div className="trend-filters">
          {configs.map((c, i) => (
            <button
              key={c.label}
              onClick={() => setSelectedConfigIndex(i)}
              className={`trend-filter-btn ${i === selectedConfigIndex ? 'trend-filter-btn-active' : 'trend-filter-btn-inactive'}`}
            >
              {c.label} ({sessions.filter(s => {
                if (s.limitedTimeConfig) {
                  return s.limitedTimeConfig.gameTimeLimit === (c.config as LimitedTimeConfig).gameTimeLimit;
                }
                return false;
              }).length}局)
            </button>
          ))}
        </div>
      )}

      {filteredSessions.length > 0 && stats ? (
        <>
          <div className="trend-stats-panel">
            <div className="trend-stat-item">
              <div className="trend-stat-value">{stats.count}</div>
              <div className="trend-stat-label">游戏次数</div>
            </div>
            <div className="trend-stat-item">
              <div className="trend-stat-value">{stats.average}</div>
              <div className="trend-stat-label">平均分</div>
            </div>
            <div className="trend-stat-item">
              <div className="trend-stat-value trend-stat-highlight">{stats.max}</div>
              <div className="trend-stat-label">最高分</div>
            </div>
            <div className="trend-stat-item">
              <div className="trend-stat-value">{stats.min}</div>
              <div className="trend-stat-label">最低分</div>
            </div>
          </div>

          <div className="trend-chart-container">
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="trend-history-section">
            <h2 className="trend-history-title">历史记录</h2>
            <div className="trend-history-list">
              {[...filteredSessions].reverse().map((session, index) => {
                const globalIndex = filteredSessions.length - index;
                const date = new Date(session.startTime);
                return (
                  <div key={session.id} className="trend-history-card">
                    <div className="trend-history-left">
                      <span className="trend-history-index">#{globalIndex}</span>
                      <span className="trend-history-score">得分: {session.score}</span>
                    </div>
                    <div className="trend-history-date">
                      {date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'numeric', day: 'numeric' })} {date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="trend-empty">
          暂无此配置的游戏记录
        </div>
      )}
    </div>
  );
}

export default TrendPage;
