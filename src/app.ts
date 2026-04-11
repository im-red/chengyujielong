import { idiomLib } from './idiomLib';
import { GameManager } from './gameManager';
import { GameMode, GameSession, ChallengeConfig } from './types';

enum ViewState {
  Home = 'home',
  Game = 'game',
  ChallengeConfig = 'challengeConfig'
}

export class App {
  private gameManager: GameManager;
  private viewState: ViewState = ViewState.Home;
  private inputElement: HTMLInputElement | null = null;
  private updateInterval: number | null = null;
  private currentTurnStartTime: number = 0;
  private shouldRestoreFocus: boolean = false;
  private savedScrollPosition: number = 0;
  private lastRenderedMessageCount: number = 0;
  private isGameViewInitialized: boolean = false;
  private isSubmitting: boolean = false;

  constructor() {
    this.gameManager = new GameManager();
    this.gameManager.setOnGameEndCallback(() => {
      // Re-render when game ends (e.g., timeout)
      this.render();
    });
    this.render();
    this.startUpdateLoop();
    this.setupBackButtonHandler();
  }

  private setupBackButtonHandler() {
    // Handle Android back button
    document.addEventListener('backbutton', (e) => {
      e.preventDefault();
      this.handleBackButton();
    }, false);

    // Also handle browser back button for web
    window.addEventListener('popstate', () => {
      this.handleBackButton();
    });
  }

  private handleBackButton() {
    // Close any open modals first
    const detailModal = document.getElementById('detail-modal');
    const candidatesModal = document.getElementById('candidates-modal');

    if (detailModal && detailModal.classList.contains('show')) {
      detailModal.classList.remove('show');
      return;
    }

    if (candidatesModal && candidatesModal.classList.contains('show')) {
      candidatesModal.classList.remove('show');
      return;
    }

    // Navigate back based on current view
    if (this.viewState === ViewState.Game) {
      this.viewState = ViewState.Home;
      this.render();
    } else if (this.viewState === ViewState.ChallengeConfig) {
      this.viewState = ViewState.Home;
      this.render();
    } else if (this.viewState === ViewState.Home) {
      // On home screen, exit app (Capacitor will handle this)
      if ((window as any).navigator && (window as any).navigator.app) {
        (window as any).navigator.app.exitApp();
      }
    }
  }

  private startUpdateLoop() {
    // Update UI every 100ms for timer display
    this.updateInterval = window.setInterval(() => {
      const session = this.gameManager.getCurrentSession();
      if (session && session.isActive) {
        if (session.timeLimit && session.timeLimit > 0) {
          // Timer mode - show countdown
          this.updateTimerDisplay();
        } else {
          // Non-timer mode - show current elapsed time
          this.updateCurrentTimeDisplay();
        }
      }
    }, 100);
  }

  private updateTimerDisplay() {
    const timerElement = document.getElementById('timer-display');
    if (timerElement) {
      const remaining = this.gameManager.getRemainingTime();
      timerElement.textContent = `${remaining}s`;

      if (remaining <= 5) {
        timerElement.classList.add('timer-warning');
      } else {
        timerElement.classList.remove('timer-warning');
      }
    }
  }

  private updateCurrentTimeDisplay() {
    const timeElement = document.getElementById('current-time-display');
    if (timeElement && this.currentTurnStartTime > 0) {
      const elapsed = Math.floor((Date.now() - this.currentTurnStartTime) / 100) / 10;
      timeElement.textContent = `${elapsed.toFixed(1)}s`;
    }
  }

  private render() {
    const app = document.getElementById('app');
    if (!app) return;

    if (this.viewState === ViewState.Home) {
      this.isGameViewInitialized = false;
      this.lastRenderedMessageCount = 0;
      this.renderHome(app);
    } else if (this.viewState === ViewState.ChallengeConfig) {
      this.isGameViewInitialized = false;
      this.lastRenderedMessageCount = 0;
      this.renderChallengeConfig(app);
    } else {
      this.renderGame(app);
    }
  }

  private renderHome(container: HTMLElement) {
    const sessions = this.gameManager.getSessions();

    container.innerHTML = `
      <div class="home-container">
        <header class="app-header">
          <div class="header-title">
            <h1>成语接龙</h1>
          </div>
        </header>

        <div class="home-content">
          <p class="subtitle">选择游戏模式开始新游戏</p>

          <div class="mode-selection">
            <div class="mode-card" data-mode="${GameMode.Endless}">
              <div class="mode-icon">♾️</div>
              <h3>无尽模式</h3>
              <p>可放弃，永不结束</p>
            </div>
            
            <div class="mode-card" data-mode="${GameMode.Challenge}">
              <div class="mode-icon">🎯</div>
              <h3>挑战模式</h3>
              <p>自定义生命和时限</p>
            </div>
          </div>

          <div class="history-section">
            <div class="history-header">
              <h2>历史记录</h2>
              ${sessions.length > 0 ? `
                <button class="btn btn-text" id="clear-history">清空</button>
              ` : ''}
            </div>
            
            ${sessions.length === 0 ? `
              <div class="empty-state">
                <p>暂无游戏记录</p>
              </div>
            ` : `
              <div class="history-list">
                ${sessions.map(session => this.renderSessionCard(session)).join('')}
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    this.attachHomeListeners();
  }

  private renderSessionCard(session: GameSession): string {
    const duration = session.endTime
      ? Math.floor((session.endTime - session.startTime) / 1000)
      : 0;
    const date = new Date(session.startTime);
    const modeNames = {
      [GameMode.Endless]: '无尽',
      [GameMode.Challenge]: '挑战'
    };

    let configStr = '';
    if (session.mode === GameMode.Challenge && session.challengeConfig) {
      const parts = [];
      if (session.challengeConfig.lives > 0) {
        parts.push(`${session.challengeConfig.lives}命`);
      }
      if (session.challengeConfig.timeLimit > 0) {
        parts.push(`${session.challengeConfig.timeLimit}秒`);
      }
      if (parts.length > 0) {
        configStr = ` (${parts.join(', ')})`;
      }
    }

    return `
      <div class="session-card" data-session-id="${session.id}">
        <div class="session-info">
          <div class="session-mode">${modeNames[session.mode]}${configStr}</div>
          <div class="session-stats">
            <span>得分: ${session.score}</span>
            <span>回合: ${session.messages.length}</span>
            ${duration > 0 ? `<span>时长: ${duration}s</span>` : ''}
          </div>
          <div class="session-date">${date.toLocaleString('zh-CN')}</div>
        </div>
        <div class="session-actions">
          <button class="btn-icon view-session" title="查看">👁️</button>
          <button class="btn-icon delete-session" title="删除">🗑️</button>
        </div>
      </div>
    `;
  }

  private attachHomeListeners() {
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => {
      card.addEventListener('click', () => {
        const mode = (card as HTMLElement).dataset.mode as GameMode;
        if (mode === GameMode.Challenge) {
          this.viewState = ViewState.ChallengeConfig;
          this.render();
        } else {
          this.startGame(mode);
        }
      });
    });

    const clearBtn = document.getElementById('clear-history');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('确定要清空所有历史记录吗？')) {
          this.gameManager.clearAllSessions();
          this.render();
        }
      });
    }

    const viewButtons = document.querySelectorAll('.view-session');
    viewButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = (btn as HTMLElement).closest('.session-card');
        const sessionId = (card as HTMLElement).dataset.sessionId;
        // TODO: Implement view session details
        alert('查看详情功能开发中');
      });
    });

    const deleteButtons = document.querySelectorAll('.delete-session');
    deleteButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = (btn as HTMLElement).closest('.session-card');
        const sessionId = (card as HTMLElement).dataset.sessionId!;
        if (confirm('确定要删除这条记录吗？')) {
          this.gameManager.deleteSession(sessionId);
          this.render();
        }
      });
    });
  }

  private startGame(mode: GameMode, config?: ChallengeConfig) {
    this.gameManager.startNewGame(mode, config);
    this.currentTurnStartTime = Date.now(); // Initialize timer
    this.viewState = ViewState.Game;
    this.render();
  }

  private renderChallengeConfig(container: HTMLElement) {
    container.innerHTML = `
      <div class="home-container">
        <header class="app-header">
          <button class="btn-back" id="config-back-btn">←</button>
          <div class="header-title">
            <h1>挑战模式配置</h1>
          </div>
        </header>

        <div class="home-content">
          <p class="subtitle">自定义游戏难度</p>

          <div class="config-form">
            <div class="config-section">
              <label class="config-label">
                <span class="label-text">生命次数</span>
                <span class="label-hint">设为 0 表示答错即结束</span>
              </label>
              <div class="config-input-group">
                <button class="btn-adjust" id="lives-minus">-</button>
                <input type="number" id="lives-input" class="config-input" value="3" min="0" max="10" />
                <button class="btn-adjust" id="lives-plus">+</button>
              </div>
              <div class="preset-buttons">
                <button class="btn-preset" data-lives="0">经典 (0命)</button>
                <button class="btn-preset" data-lives="3">简单 (3命)</button>
                <button class="btn-preset" data-lives="5">中等 (5命)</button>
              </div>
            </div>

            <div class="config-section">
              <label class="config-label">
                <span class="label-text">时间限制 (秒)</span>
                <span class="label-hint">设为 0 表示无时间限制</span>
              </label>
              <div class="config-input-group">
                <button class="btn-adjust" id="time-minus">-</button>
                <input type="number" id="time-input" class="config-input" value="0" min="0" max="120" step="5" />
                <button class="btn-adjust" id="time-plus">+</button>
              </div>
              <div class="preset-buttons">
                <button class="btn-preset" data-time="0">无限制</button>
                <button class="btn-preset" data-time="15">快速 (15秒)</button>
                <button class="btn-preset" data-time="30">标准 (30秒)</button>
                <button class="btn-preset" data-time="60">宽松 (60秒)</button>
              </div>
            </div>

            <button class="btn btn-primary btn-large" id="start-challenge-btn">开始游戏</button>
          </div>
        </div>
      </div>
    `;

    this.attachChallengeConfigListeners();
  }

  private attachChallengeConfigListeners() {
    const backBtn = document.getElementById('config-back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.viewState = ViewState.Home;
        this.render();
      });
    }

    const livesInput = document.getElementById('lives-input') as HTMLInputElement;
    const timeInput = document.getElementById('time-input') as HTMLInputElement;

    const livesMinus = document.getElementById('lives-minus');
    const livesPlus = document.getElementById('lives-plus');
    const timeMinus = document.getElementById('time-minus');
    const timePlus = document.getElementById('time-plus');

    if (livesMinus && livesInput) {
      livesMinus.addEventListener('click', () => {
        const val = Math.max(0, parseInt(livesInput.value) - 1);
        livesInput.value = val.toString();
      });
    }

    if (livesPlus && livesInput) {
      livesPlus.addEventListener('click', () => {
        const val = Math.min(10, parseInt(livesInput.value) + 1);
        livesInput.value = val.toString();
      });
    }

    if (timeMinus && timeInput) {
      timeMinus.addEventListener('click', () => {
        const val = Math.max(0, parseInt(timeInput.value) - 5);
        timeInput.value = val.toString();
      });
    }

    if (timePlus && timeInput) {
      timePlus.addEventListener('click', () => {
        const val = Math.min(120, parseInt(timeInput.value) + 5);
        timeInput.value = val.toString();
      });
    }

    // Preset buttons
    const presetButtons = document.querySelectorAll('.btn-preset');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const livesVal = (btn as HTMLElement).dataset.lives;
        const timeVal = (btn as HTMLElement).dataset.time;

        if (livesVal && livesInput) {
          livesInput.value = livesVal;
        }
        if (timeVal && timeInput) {
          timeInput.value = timeVal;
        }
      });
    });

    const startBtn = document.getElementById('start-challenge-btn');
    if (startBtn && livesInput && timeInput) {
      startBtn.addEventListener('click', () => {
        const config: ChallengeConfig = {
          lives: parseInt(livesInput.value) || 0,
          timeLimit: parseInt(timeInput.value) || 0
        };
        this.startGame(GameMode.Challenge, config);
      });
    }
  }

  private renderGame(container: HTMLElement) {
    const session = this.gameManager.getCurrentSession();
    if (!session) {
      this.viewState = ViewState.Home;
      this.render();
      return;
    }

    // If game view is not initialized, do full render
    if (!this.isGameViewInitialized) {
      this.initializeGameView(container, session);
      this.isGameViewInitialized = true;
      this.lastRenderedMessageCount = session.messages.length;
      return;
    }

    // Otherwise, do incremental updates
    this.updateGameView(session);
  }

  private initializeGameView(container: HTMLElement, session: GameSession) {
    const modeNames = {
      [GameMode.Endless]: '无尽模式',
      [GameMode.Challenge]: '挑战模式'
    };

    let modeDisplay = modeNames[session.mode];
    if (session.mode === GameMode.Challenge && session.challengeConfig) {
      const parts = [];
      if (session.challengeConfig.lives > 0) {
        parts.push(`${session.challengeConfig.lives}命`);
      } else {
        parts.push('经典');
      }
      if (session.challengeConfig.timeLimit > 0) {
        parts.push(`${session.challengeConfig.timeLimit}秒`);
      }
      if (parts.length > 0) {
        modeDisplay += ` (${parts.join(', ')})`;
      }
    }

    container.innerHTML = `
      <div class="game-container">
        <header class="game-header">
          <button class="btn-back" id="back-btn">←</button>
          <div class="header-title">
            <h1>${modeDisplay}</h1>
            ${session.lives !== undefined ? `<p class="game-subtitle">${session.lives}/${session.maxLives} 命</p>` : ''}
          </div>
        </header>

        ${session.isActive ? `
          <div class="game-status-bar">
            <span id="score-display">得分: ${session.score}</span>
            ${session.timeLimit !== undefined && session.timeLimit > 0 ? `
              <span id="timer-display" class="timer-display">${this.gameManager.getRemainingTime()}s</span>
            ` : `
              <span id="current-time-display" class="timer-display">0.0s</span>
            `}
          </div>
        ` : ''}

        <div class="chat-container" id="chat-container"></div>

        ${session.isActive ? `
          <div class="input-section">
            <div class="input-group">
              <input 
                type="text" 
                id="idiom-input" 
                placeholder="请输入成语接龙..."
                autocomplete="off"
              />
              <button class="btn btn-primary" id="submit-btn">发送</button>
              ${session.mode === GameMode.Endless ? `
                <button class="btn btn-secondary" id="giveup-btn">放弃</button>
              ` : ''}
            </div>
          </div>
        ` : `
          <div class="game-over-section">
            <div class="game-final-score">最终得分: ${session.score}</div>
            <button class="btn btn-primary" id="new-game-btn">再来一局</button>
            <button class="btn btn-secondary" id="home-btn">返回主页</button>
          </div>
        `}
      </div>

      <div id="detail-modal" class="modal">
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <div id="modal-body"></div>
        </div>
      </div>

      <div id="candidates-modal" class="modal">
        <div class="modal-content">
          <span class="close-modal">&times;</span>
          <div id="candidates-modal-body"></div>
        </div>
      </div>
    `;

    // Render all messages
    this.renderAllMessages(session);

    this.attachGameListeners();

    // Scroll to bottom on initial render
    requestAnimationFrame(() => {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }

      // Focus input if needed
      if (this.shouldRestoreFocus && this.inputElement) {
        this.inputElement.focus();
        this.shouldRestoreFocus = false;
      }
    });
  }

  private updateGameView(session: GameSession) {
    // Update score
    const scoreDisplay = document.getElementById('score-display');
    if (scoreDisplay) {
      scoreDisplay.textContent = `得分: ${session.score}`;
    }

    // Update lives in subtitle
    const subtitle = document.querySelector('.game-subtitle');
    if (subtitle && session.lives !== undefined) {
      subtitle.textContent = `${session.lives}/${session.maxLives} 命`;
    }

    // Check if there are new messages to append
    if (session.messages.length > this.lastRenderedMessageCount) {
      const chatContainer = document.getElementById('chat-container');
      if (chatContainer) {
        // Check if user is at bottom before adding messages
        const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < 50;

        // Append only new messages
        for (let i = this.lastRenderedMessageCount; i < session.messages.length; i++) {
          const messageElement = this.createMessageElement(session.messages[i], i);
          chatContainer.appendChild(messageElement);
        }

        this.lastRenderedMessageCount = session.messages.length;

        // Scroll to bottom only if user was already at bottom
        if (isAtBottom) {
          requestAnimationFrame(() => {
            chatContainer.scrollTop = chatContainer.scrollHeight;
          });
        }
      }
    }

    // Check if game ended
    if (!session.isActive) {
      // Game ended, need to replace input section with game over section
      const inputSection = document.querySelector('.input-section');
      if (inputSection) {
        inputSection.outerHTML = `
          <div class="game-over-section">
            <div class="game-final-score">最终得分: ${session.score}</div>
            <button class="btn btn-primary" id="new-game-btn">再来一局</button>
            <button class="btn btn-secondary" id="home-btn">返回主页</button>
          </div>
        `;

        // Reattach listeners for game over buttons
        const newGameBtn = document.getElementById('new-game-btn');
        const homeBtn = document.getElementById('home-btn');

        if (newGameBtn) {
          newGameBtn.addEventListener('click', () => {
            if (session) {
              this.startGame(session.mode);
            }
          });
        }

        if (homeBtn) {
          homeBtn.addEventListener('click', () => {
            this.viewState = ViewState.Home;
            this.render();
          });
        }
      }

      // Remove status bar
      const statusBar = document.querySelector('.game-status-bar');
      if (statusBar) {
        statusBar.remove();
      }
    }
  }

  private renderAllMessages(session: GameSession) {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;

    chatContainer.innerHTML = '';
    session.messages.forEach((msg, index) => {
      const messageElement = this.createMessageElement(msg, index);
      chatContainer.appendChild(messageElement);
    });
  }

  private createMessageElement(msg: any, index: number): HTMLElement {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${msg.isUser ? 'user-message' : 'computer-message'}`;

    const isFirst = index === 0;
    const timeStr = this.formatTimeCost(msg.timeCost);

    messageDiv.innerHTML = `
      <div class="message-bubble ${msg.isError ? 'error-bubble' : ''}" data-idiom="${msg.idiom}">
        ${msg.idiom}
      </div>
      ${msg.isUser ? `<div class="message-time">${timeStr}</div>` : ''}
      ${isFirst && !msg.isUser ? `
        <div class="message-hint">点击查看详情 · 长按查看候选</div>
      ` : ''}
    `;

    // Attach event listeners to the bubble
    const bubble = messageDiv.querySelector('.message-bubble');
    if (bubble) {
      this.attachMessageBubbleListeners(bubble as HTMLElement);
    }

    return messageDiv;
  }

  private formatTimeCost(ms: number): string {
    if (ms === 0) return '0s';
    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;

    if (seconds > 0) {
      return `${seconds}.${Math.floor(milliseconds / 100)}s`;
    }
    return `${milliseconds}ms`;
  }

  private attachGameListeners() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (confirm('确定要退出当前游戏吗？')) {
          this.viewState = ViewState.Home;
          this.render();
        }
      });
    }

    this.inputElement = document.getElementById('idiom-input') as HTMLInputElement;
    const submitBtn = document.getElementById('submit-btn');
    const giveupBtn = document.getElementById('giveup-btn');
    const newGameBtn = document.getElementById('new-game-btn');
    const homeBtn = document.getElementById('home-btn');

    if (this.inputElement && submitBtn) {
      // Automatically refocus if blur happens during submission
      this.inputElement.addEventListener('blur', () => {
        if (this.isSubmitting && this.inputElement) {
          // Immediately refocus without any delay
          this.inputElement.focus();
        }
      });

      const handleSubmit = () => {
        if (this.inputElement && this.inputElement.value.trim()) {
          const inputValue = this.inputElement.value.trim();

          // Set submitting flag BEFORE clearing input
          this.isSubmitting = true;

          // Clear input
          this.inputElement.value = '';

          // Process the input
          this.handleUserInput(inputValue);

          // Clear submitting flag after a short delay
          setTimeout(() => {
            this.isSubmitting = false;
          }, 300);
        }
      };

      // Prevent mousedown from stealing focus, but handle submit on mousedown
      submitBtn.addEventListener('mousedown', (e) => {
        e.preventDefault(); // Prevent focus change
        handleSubmit();
      });

      // Handle touch events for mobile
      let touchHandled = false;
      submitBtn.addEventListener('touchstart', (e) => {
        e.preventDefault(); // Prevent focus change and mouse events
        touchHandled = true;
        handleSubmit();
        setTimeout(() => {
          touchHandled = false;
        }, 300);
      });

      // Click event as fallback (won't fire if mousedown/touchstart handled it)
      submitBtn.addEventListener('click', (e) => {
        if (!touchHandled) {
          e.preventDefault();
        }
      });

      this.inputElement.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          handleSubmit();
        }
      });
    }

    if (giveupBtn) {
      const handleGiveUp = () => {
        if (this.gameManager.giveUp()) {
          this.render();
          // Restore focus to input after render
          setTimeout(() => {
            if (this.inputElement) {
              this.inputElement.focus();
            }
          }, 100);
        }
      };

      // Prevent mousedown from stealing focus, but handle give up on mousedown
      giveupBtn.addEventListener('mousedown', (e) => {
        e.preventDefault();
        handleGiveUp();
      });

      // Handle touch events for mobile
      let touchHandled = false;
      giveupBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        touchHandled = true;
        handleGiveUp();
        setTimeout(() => {
          touchHandled = false;
        }, 300);
      });

      // Click event as fallback
      giveupBtn.addEventListener('click', (e) => {
        if (!touchHandled) {
          e.preventDefault();
        }
      });
    }

    if (newGameBtn) {
      newGameBtn.addEventListener('click', () => {
        const session = this.gameManager.getCurrentSession();
        if (session) {
          this.startGame(session.mode);
        }
      });
    }

    if (homeBtn) {
      homeBtn.addEventListener('click', () => {
        this.viewState = ViewState.Home;
        this.render();
      });
    }

    this.attachModalListeners();
  }

  private handleUserInput(input: string) {
    const result = this.gameManager.submitIdiom(input);
    this.render();

    // If submission was successful, trigger computer turn and re-render after
    if (result.success) {
      this.gameManager.triggerComputerTurn(() => {
        // Reset timer after computer's turn
        this.currentTurnStartTime = Date.now();
        this.render();
      });
    }
  }

  private attachMessageBubbleListeners(bubble: HTMLElement) {
    let longPressTimer: number | null = null;
    let isLongPress = false;
    const LONG_PRESS_DURATION = 500;

    bubble.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    bubble.addEventListener('touchstart', (e) => {
      e.preventDefault();
      isLongPress = false;
      longPressTimer = window.setTimeout(() => {
        isLongPress = true;
        const idiom = bubble.dataset.idiom;
        if (idiom) {
          this.showCandidatesModal(idiom);
        }
      }, LONG_PRESS_DURATION);
    });

    bubble.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();

      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (!isLongPress) {
        const idiom = bubble.dataset.idiom;
        if (idiom) {
          this.showDetailModal(idiom);
        }
      }
    });

    bubble.addEventListener('touchmove', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      isLongPress = false;
    });

    bubble.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      const idiom = bubble.dataset.idiom;
      if (idiom) {
        this.showCandidatesModal(idiom);
      }
    });

    bubble.addEventListener('click', (e) => {
      const idiom = bubble.dataset.idiom;
      if (idiom) {
        this.showDetailModal(idiom);
      }
    });
  }

  private attachModalListeners() {
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
      const closeModal = () => {
        document.querySelectorAll('.modal').forEach(modal => {
          modal.classList.remove('show');
        });
      };

      // Prevent focus stealing on close button
      btn.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
      });

      // Handle both click (desktop) and touchend (mobile)
      btn.addEventListener('click', closeModal);
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      });
    });

    document.querySelectorAll('.modal').forEach(modal => {
      let modalJustOpened = false;

      const closeModalIfBackdrop = (e: Event) => {
        // Prevent closing if modal just opened (within 300ms)
        if (modalJustOpened) {
          return;
        }

        if (e.target === modal) {
          modal.classList.remove('show');
        }
      };

      // Prevent focus stealing on modal backdrop
      modal.addEventListener('mousedown', (e) => {
        if (e.target === modal) {
          e.preventDefault();
        }
      });
      modal.addEventListener('touchstart', (e) => {
        if (e.target === modal) {
          e.preventDefault();
        }
      });

      // Handle both click (desktop) and touchend (mobile) for backdrop
      modal.addEventListener('click', closeModalIfBackdrop);
      modal.addEventListener('touchend', (e) => {
        if (e.target === modal) {
          e.preventDefault();
          e.stopPropagation();
          closeModalIfBackdrop(e);
        }
      });

      // Set flag when modal opens
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'class') {
            const target = mutation.target as HTMLElement;
            if (target.classList.contains('show')) {
              modalJustOpened = true;
              setTimeout(() => {
                modalJustOpened = false;
              }, 300);
            }
          }
        });
      });

      observer.observe(modal, { attributes: true });
    });

    // Add ESC key handler to close modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const openModal = document.querySelector('.modal.show');
        if (openModal) {
          openModal.classList.remove('show');
          e.preventDefault();
          e.stopPropagation();
        }
      }
    });
  }

  private showDetailModal(idiom: string) {
    const info = idiomLib.getExtraInfo(idiom);
    const modal = document.getElementById('detail-modal');
    const modalBody = document.getElementById('modal-body');

    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <h2>${idiom}</h2>
      <div class="detail-content">${info}</div>
    `;

    modal.classList.add('show');

    // Temporarily disable pointer events to allow a fast second tap (double tap) 
    // to pass through the modal and hit the message bubble underneath
    modal.style.pointerEvents = 'none';
    setTimeout(() => {
      modal.style.pointerEvents = 'auto';
    }, 300);
  }

  private showCandidatesModal(idiom: string) {
    const session = this.gameManager.getCurrentSession();
    if (!session) return;

    const allCandidates = idiomLib.getCandidateList(idiom);
    const unusedCandidates = idiomLib.getUnusedCandidateList(idiom);
    // Calculate used candidates as the difference between all and unused
    const usedCandidates = allCandidates.filter(c => !unusedCandidates.includes(c));

    const modal = document.getElementById('candidates-modal');
    const modalBody = document.getElementById('candidates-modal-body');

    if (!modal || !modalBody) return;

    modalBody.innerHTML = `
      <h2>候选成语统计</h2>
      <div class="candidates-stats">
        <div class="stat-item clickable" data-type="total">
          <span class="stat-label">总数</span>
          <span class="stat-value">${allCandidates.length}</span>
          <span class="stat-hint">点击查看</span>
        </div>
        <div class="stat-item clickable" data-type="used">
          <span class="stat-label">已使用</span>
          <span class="stat-value used">${usedCandidates.length}</span>
          <span class="stat-hint">点击查看</span>
        </div>
        <div class="stat-item clickable" data-type="unused">
          <span class="stat-label">未使用</span>
          <span class="stat-value unused">${unusedCandidates.length}</span>
          <span class="stat-hint">点击查看</span>
        </div>
      </div>

      <div id="candidates-detail" class="candidates-detail"></div>
    `;

    modal.classList.add('show');

    const statItems = modalBody.querySelectorAll('.stat-item.clickable');
    statItems.forEach(item => {
      const handleClick = () => {
        const type = (item as HTMLElement).dataset.type;
        this.showCandidatesList(type!, allCandidates, usedCandidates, unusedCandidates);
      };

      // Prevent focus stealing on stat items
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      item.addEventListener('touchstart', (e) => {
        e.preventDefault();
      });

      // Handle both click (desktop) and touchend (mobile)
      item.addEventListener('click', handleClick);
      item.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleClick();
      });
    });
  }

  private showCandidatesList(type: string, allCandidates: string[], usedCandidates: string[], unusedCandidates: string[]) {
    const detailContainer = document.getElementById('candidates-detail');
    if (!detailContainer) return;

    let title = '';
    let candidates: string[] = [];

    switch (type) {
      case 'total':
        title = '全部候选成语';
        candidates = allCandidates;
        break;
      case 'used':
        title = '已使用的候选成语';
        candidates = usedCandidates;
        break;
      case 'unused':
        title = '未使用的候选成语';
        candidates = unusedCandidates;
        break;
    }

    detailContainer.innerHTML = `
      <div class="candidates-section">
        <h3>${title} <span class="tap-hint">(点击查看详情)</span></h3>
        <div class="candidates-list">
          ${candidates.length > 0
        ? candidates.map(c => {
          const isThisUsed = usedCandidates.includes(c);
          return `<div class="candidate-item ${isThisUsed ? 'used-item' : ''}" data-idiom="${c}">${c}</div>`;
        }).join('')
        : '<p class="empty-message">没有候选成语</p>'
      }
        </div>
      </div>
    `;

    const candidateItems = detailContainer.querySelectorAll('.candidate-item');
    candidateItems.forEach(item => {
      const handleClick = () => {
        const candidateIdiom = (item as HTMLElement).dataset.idiom;
        if (candidateIdiom) {
          const modal = document.getElementById('candidates-modal');
          if (modal) modal.classList.remove('show');
          setTimeout(() => this.showDetailModal(candidateIdiom), 300);
        }
      };

      // Prevent focus stealing on candidate items
      item.addEventListener('mousedown', (e) => {
        e.preventDefault();
      });
      item.addEventListener('touchstart', (e) => {
        e.preventDefault();
      });

      // Handle both click (desktop) and touchend (mobile)
      item.addEventListener('click', handleClick);
      item.addEventListener('touchend', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleClick();
      });
    });
  }
}
