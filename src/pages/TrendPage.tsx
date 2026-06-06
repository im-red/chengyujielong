import React, { useState, useMemo } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonBackButton,
  IonContent,
  IonSegment,
  IonSegmentButton,
  IonLabel,
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
  const [viewMode, setViewMode] = useState<'session' | 'day'>('session');
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

  const dailyStats = useMemo(() => {
    const dayMap = new Map<string, { total: number; count: number }>();
    filteredSessions.forEach(session => {
      const date = new Date(session.startTime);
      const dayStr = date.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
      if (!dayMap.has(dayStr)) {
        dayMap.set(dayStr, { total: 0, count: 0 });
      }
      const stat = dayMap.get(dayStr)!;
      stat.total += session.score;
      stat.count += 1;
    });

    const days: string[] = [];
    const averages: number[] = [];
    dayMap.forEach((stat, day) => {
      days.push(day);
      averages.push(Math.round(stat.total / stat.count));
    });

    return { days, averages };
  }, [filteredSessions]);

  const chartData = useMemo(() => {
    let labels: string[];
    let data: number[];

    if (viewMode === 'session') {
      labels = filteredSessions.map((_, i) => `#${i + 1}`);
      data = filteredSessions.map(s => s.score);
    } else {
      labels = dailyStats.days;
      data = dailyStats.averages;
    }

    // Get primary color from document or use fallback
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--ion-color-primary').trim() || '#3880ff';

    return {
      labels,
      datasets: [
        {
          label: viewMode === 'session' ? '得分' : '平均分',
          data,
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
  }, [filteredSessions, viewMode, dailyStats]);

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
            return viewMode === 'session' ? `#${tooltipItems[0].dataIndex + 1}` : tooltipItems[0].label;
          },
          label: (context: any) => {
            return viewMode === 'session' ? `得分: ${context.parsed.y}` : `平均分: ${context.parsed.y}`;
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

  // Store reference to the chart instance to allow testing to access it
  const chartRef = React.useRef<any>(null);

  React.useEffect(() => {
    // Expose chart instance to window for testing
    if (chartRef.current) {
      (window as any).__trendChartInstance = chartRef.current;
    }
    return () => {
      (window as any).__trendChartInstance = null;
    };
  }, [chartData]);

  const dayBackgroundPlugin = useMemo(() => {
    return {
      id: 'dayBackground',
      beforeDraw: (chart: any) => {
        const { ctx, chartArea } = chart;
        if (!chartArea) return;
        const { top, bottom, left, right } = chartArea;

        const meta = chart.getDatasetMeta(0);
        if (!meta || !meta.data || meta.data.length === 0) return;

        const dataPoints = meta.data;

        const colors: string[] = [];
        let currentDay = '';
        let colorToggle = false;
        filteredSessions.forEach(session => {
          const date = new Date(session.startTime);
          const dayStr = date.toLocaleDateString('zh-CN');
          if (dayStr !== currentDay) {
            currentDay = dayStr;
            colorToggle = !colorToggle;
          }
          // Alternate between transparent and a light grey for days
          colors.push(colorToggle ? 'rgba(0, 0, 0, 0)' : 'rgba(0, 0, 0, 0.1)');
        });

        ctx.save();
        for (let i = 0; i < dataPoints.length; i++) {
          if (i >= colors.length) break;
          const xPos = dataPoints[i].x;
          const startX = i === 0 ? left : (dataPoints[i - 1].x + xPos) / 2;
          const endX = i === dataPoints.length - 1 ? right : (xPos + dataPoints[i + 1].x) / 2;

          ctx.fillStyle = colors[i];
          ctx.fillRect(startX, top, endX - startX, bottom - top);
        }
        ctx.restore();
      }
    };
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

          <div className="trend-view-segment">
            <IonSegment value={viewMode} onIonChange={e => {
              setViewMode(e.detail.value as 'session' | 'day');
            }}>
              <IonSegmentButton value="session">
                <IonLabel>按局</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="day">
                <IonLabel>按天</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>

          <div className="trend-chart-container">
            <Line ref={chartRef} data={chartData} options={chartOptions} plugins={viewMode === 'session' ? [dayBackgroundPlugin] : []} />
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
