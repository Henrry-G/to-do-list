/* ============================================
   CloudDo · 今日待办 - 像素风核心逻辑
   ============================================ */

// ============ 音效系统 ============
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.vibrationEnabled = true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    } catch (e) {}
    if (!navigator.vibrate) this.vibrationEnabled = false;
  }
  resume() { if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); }
  play(type) {
    if (!this.enabled || !this.ctx) return;
    this.resume();
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain); gain.connect(this.ctx.destination);
    switch (type) {
      case 'select':
        osc.type = 'square'; osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);
        gain.gain.setValueAtTime(0.1, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1); break;
      case 'deselect':
        osc.type = 'square'; osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);
        gain.gain.setValueAtTime(0.08, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now); osc.stop(now + 0.1); break;
      case 'add':
        osc.type = 'triangle'; osc.frequency.setValueAtTime(523, now);
        osc.frequency.linearRampToValueAtTime(784, now + 0.12);
        gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now); osc.stop(now + 0.15); break;
      case 'complete':
        osc.type = 'square';
        osc.frequency.setValueAtTime(523, now); osc.frequency.setValueAtTime(659, now + 0.1);
        osc.frequency.setValueAtTime(784, now + 0.2); osc.frequency.setValueAtTime(1047, now + 0.3);
        gain.gain.setValueAtTime(0.15, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        osc.start(now); osc.stop(now + 0.4); break;
      case 'celebrate':
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523, now); osc.frequency.setValueAtTime(659, now + 0.12);
        osc.frequency.setValueAtTime(784, now + 0.24); osc.frequency.setValueAtTime(1047, now + 0.36);
        gain.gain.setValueAtTime(0.2, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
        osc.start(now); osc.stop(now + 0.5); break;
      case 'cardFlip':
        osc.type = 'sawtooth'; osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
        gain.gain.setValueAtTime(0.12, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now); osc.stop(now + 0.3); break;
      case 'click':
        osc.type = 'square'; osc.frequency.setValueAtTime(700, now);
        gain.gain.setValueAtTime(0.08, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        osc.start(now); osc.stop(now + 0.05); break;
      case 'drag':
        osc.type = 'square'; osc.frequency.setValueAtTime(300, now);
        gain.gain.setValueAtTime(0.04, now); gain.gain.exponentialRampToValueAtTime(0.01, now + 0.03);
        osc.start(now); osc.stop(now + 0.03); break;
    }
  }
  vibrate(p) { if (this.vibrationEnabled) try { navigator.vibrate(p); } catch (e) {} }
  feedback(type) {
    this.play(type);
    switch (type) {
      case 'select': this.vibrate(15); break;
      case 'deselect': this.vibrate(10); break;
      case 'add': this.vibrate(20); break;
      case 'complete': this.vibrate([15, 30, 15, 30, 15]); break;
      case 'celebrate': this.vibrate([30, 50, 30, 50, 30, 50, 60]); break;
      case 'cardFlip': this.vibrate([20, 30, 20]); break;
      case 'drag': this.vibrate(5); break;
      default: this.vibrate(10);
    }
  }
  jelly(el) {
    if (!el) return;
    el.classList.remove('jelly'); void el.offsetWidth; el.classList.add('jelly');
    setTimeout(() => el.classList.remove('jelly'), 300);
  }
}
const sound = new SoundManager();

// ============ 像素星星背景 ============
function generateStars() {
  const container = document.getElementById('bgStars');
  if (!container) return;
  for (let i = 0; i < 15; i++) {
    const star = document.createElement('div');
    star.className = 'pixel-star';
    star.style.left = Math.random() * 100 + '%';
    star.style.top = Math.random() * 100 + '%';
    star.style.animationDelay = Math.random() * 2 + 's';
    star.style.animationDuration = (1 + Math.random() * 2) + 's';
    container.appendChild(star);
  }
}

// ============ 数据 ============
const LUCKY_CARDS = [
  { icon: 'STAR', title: '闪耀之星', messages: ['今天你就是全场最亮的星!', '别小看自己, 你的光足以照亮一切.'] },
  { icon: 'MOON', title: '月之祝福', messages: ['即使是最黑的夜, 月亮也在发光.', '今天的你, 温柔但有力.'] },
  { icon: 'WAVE', title: '乘风破浪', messages: ['今天适合做一些平时不敢做的事.', '浪再大也挡不住你, 冲吧!'] },
  { icon: 'FIRE', title: '热情如火', messages: ['今天你的执行力爆表!', '燃烧吧, 别浪费这股劲!'] },
  { icon: 'LEAF', title: '幸运草', messages: ['今天运气在线, 买杯奶茶庆祝吧.', '小确幸正在路上, 请注意查收.'] },
  { icon: 'BOLT', title: '闪电行动', messages: ['快快快, 今天拼速度!', '别纠结了, 5秒内做决定.'] },
  { icon: 'BUTR', title: '蝶变之日', messages: ['今天的你正在蜕变.', '你的翅膀已经长好了, 试飞吧.'] },
  { icon: 'BLOM', title: '花开有时', messages: ['慢慢来, 花开有花期.', '不必和别的花比, 你开你的就好.'] },
  { icon: 'RAIN', title: '彩虹使者', messages: ['风雨过后必有彩虹.', '你的人生不需要别人定义颜色.'] },
  { icon: 'ROCK', title: '冲就完了', messages: ['别想太多了, 先冲再说!', '拖延症? 今天你是行动派.'] }
];

const PRESET_TASKS = [
  { name: '回邮件', time: 15, icon: 'MAIL', priority: 'mid' },
  { name: '写报告', time: 60, icon: 'DOCU', priority: 'high' },
  { name: '开会', time: 30, icon: 'CHAT', priority: 'high' },
  { name: '编程', time: 90, icon: 'CODE', priority: 'high' },
  { name: '看书', time: 30, icon: 'BOOK', priority: 'low' },
  { name: '运动', time: 45, icon: 'RUN!', priority: 'mid' },
  { name: '背单词', time: 20, icon: 'WORD', priority: 'mid' },
  { name: '做PPT', time: 45, icon: 'SLID', priority: 'high' },
  { name: '复习', time: 60, icon: 'STUD', priority: 'mid' },
  { name: '整理', time: 15, icon: 'CLEA', priority: 'low' },
  { name: '喝水', time: 10, icon: 'H2O!', priority: 'low' },
  { name: '打电话', time: 15, icon: 'CALL', priority: 'mid' }
];

const PRIORITY_CONFIG = {
  high: { icon: '!', label: '高', color: 'var(--neon-red)' },
  mid:  { icon: '~', label: '中', color: 'var(--neon-yellow)' },
  low:  { icon: '*', label: '低', color: 'var(--neon-green)' }
};

// ============ 状态 ============
const STORAGE_KEY = 'clouddo_v3';
const defaultState = { luckyCard: null, selectedTasks: [], todayList: [], date: null };
let state = loadState();
let selectedPriority = 'mid';
let selectedTimeBtn = null;

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const data = JSON.parse(saved);
      const today = new Date().toDateString();
      if (data.date !== today) return { ...defaultState, date: today };
      return data;
    }
  } catch (e) {}
  return { ...defaultState, date: new Date().toDateString() };
}
function saveState() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) {} }

// ============ 页面导航 ============
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.documentElement.scrollTop = 0;
}

// ============ 首页：塔罗牌 ============
function initHome() {
  // 重置所有区域
  document.getElementById('homeStartArea').style.display = 'flex';
  document.getElementById('tarotTable').style.display = 'none';
  document.getElementById('tarotReveal').style.display = 'none';

  // 如果已抽过卡，直接显示结果
  if (state.luckyCard) {
    document.getElementById('homeStartArea').style.display = 'none';
    showLuckyCard(state.luckyCard, false);
  }
}

// 第一步：点击开始 → 显示桌面卡牌
document.getElementById('btnStartDraw').addEventListener('click', function() {
  sound.feedback('cardFlip');
  document.getElementById('homeStartArea').style.display = 'none';
  const table = document.getElementById('tarotTable');
  table.style.display = 'flex';

  // 生成5张平铺卡牌
  const row = document.getElementById('cardsRow');
  row.innerHTML = '';

  const cardCount = 5;
  for (let i = 0; i < cardCount; i++) {
    const card = document.createElement('div');
    card.className = 'table-card';
    card.style.animationDelay = (i * -0.5) + 's';

    const back = document.createElement('div');
    back.className = 'table-card-back';
    card.appendChild(back);

    card.addEventListener('click', () => flipTableCard(card));
    row.appendChild(card);
  }
});

// 第二步：选择一张卡牌翻开
function flipTableCard(selectedCard) {
  sound.feedback('cardFlip');

  const allCards = document.querySelectorAll('.table-card');

  // 选中的卡牌3D向上翻 + 逐渐变大
  selectedCard.classList.add('flipping');

  // 其他卡牌淡出消失
  allCards.forEach(c => {
    if (c !== selectedCard) c.classList.add('fading');
  });

  // 1.2s翻牌动画完成后，显示翻开结果
  setTimeout(() => {
    document.getElementById('tarotTable').style.display = 'none';

    // 随机抽取
    const card = LUCKY_CARDS[Math.floor(Math.random() * LUCKY_CARDS.length)];
    const msg = card.messages[Math.floor(Math.random() * card.messages.length)];
    const lucky = { icon: card.icon, title: card.title, message: msg };
    state.luckyCard = lucky;
    saveState();

    showLuckyCard(lucky, true);
  }, 1200);
}

function showLuckyCard(card, animate) {
  document.getElementById('tarotTable').style.display = 'none';
  const reveal = document.getElementById('tarotReveal');
  reveal.style.display = 'flex';

  // 填充卡面内容
  document.getElementById('luckyIcon').textContent = card.icon;
  document.getElementById('luckyTitle').textContent = card.title;
  document.getElementById('luckyMessage').textContent = card.message;
  document.getElementById('luckyBigText').textContent = '开启元气满满的一天';

  const flipCard = document.getElementById('flipCard');
  const luckyText = document.getElementById('luckyBigText');

  if (animate) {
    // 重置wrapper出场动画
    const wrapper = document.getElementById('flipCardWrapper');
    wrapper.style.animation = 'none';
    void wrapper.offsetWidth;
    wrapper.style.animation = '';

    // 确保从背面开始
    flipCard.classList.remove('flipped');
    luckyText.classList.remove('drop');

    // 短暂延迟后触发翻转（让cardAppear动画先完成）
    setTimeout(() => {
      flipCard.classList.add('flipped');
      sound.play('cardFlip');
    }, 400);

    // 翻转完成后(0.4+1.0=1.4s)，吉利文字坠落
    setTimeout(() => {
      luckyText.classList.add('drop');
      sound.feedback('add');
      // 滚动到按钮可见位置（如果需要）
      setTimeout(() => {
        const btn = document.getElementById('btnGoSelect');
        if (btn) {
          const rect = btn.getBoundingClientRect();
          if (rect.bottom > window.innerHeight - 20) {
            document.documentElement.scrollTop += rect.bottom - window.innerHeight + 40;
          }
        }
      }, 400);
    }, 1400);
  } else {
    // 非动画模式，直接显示正面
    flipCard.classList.add('flipped');
    luckyText.classList.add('drop');
    luckyText.style.opacity = '1';
    luckyText.style.transform = 'translateY(0) scale(1)';
  }
}

document.getElementById('btnGoSelect').addEventListener('click', function() {
  sound.feedback('click');
  showPage('pageSelect');
  renderBubbles();
  renderScheduleList();
  updateTotalTime();
  updateGenerateBtn();
});

document.getElementById('btnBackHome').addEventListener('click', function() {
  sound.feedback('click');
  showPage('pageHome');
});

// ============ 任务选择页 ============
function renderBubbles() {
  const cloud = document.getElementById('bubbleCloud');
  // 已有气泡则只更新选中状态，不重建DOM
  if (cloud.children.length > 0) {
    PRESET_TASKS.forEach((task, i) => {
      const bubble = cloud.children[i];
      if (!bubble) return;
      const sel = state.selectedTasks.find(t => t.name === task.name);
      bubble.classList.toggle('selected', !!sel);
    });
    return;
  }
  // 首次渲染：创建所有气泡
  const frag = document.createDocumentFragment();
  PRESET_TASKS.forEach(task => {
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.dataset.name = task.name;
    const sel = state.selectedTasks.find(t => t.name === task.name);
    if (sel) bubble.classList.add('selected');
    bubble.innerHTML = `<span>${task.icon}</span><span>${task.name}</span><span class="bubble-time">${formatTime(task.time)}</span>`;
    bubble.addEventListener('click', () => togglePresetTask(task, bubble));
    frag.appendChild(bubble);
  });
  cloud.appendChild(frag);
}

function togglePresetTask(task, bubble) {
  const idx = state.selectedTasks.findIndex(t => t.name === task.name);
  if (idx >= 0) {
    // 已选中的，点击移除
    state.selectedTasks.splice(idx, 1);
    bubble.classList.remove('selected');
    sound.feedback('deselect');
    saveState();
    updateTotalTime();
    renderScheduleList();
    updateGenerateBtn();
  } else {
    // 未选中，打开自定义时间弹窗
    openBubbleEditor(task, bubble);
  }
}

// ============ 气泡自定义时间弹窗 ============
let bubbleEditorTarget = null;
let bubbleEditorBubble = null;
let bubbleEditorPriority = 'mid';

function openBubbleEditor(task, bubble) {
  bubbleEditorTarget = task;
  bubbleEditorBubble = bubble;

  document.getElementById('bubbleEditorName').textContent = task.icon + ' ' + task.name;
  document.getElementById('bubbleEditorTime').value = task.time;

  // 重置时间快捷按钮
  document.querySelectorAll('.bubble-time-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.bt) === task.time);
  });

  // 重置优先级
  bubbleEditorPriority = task.priority || 'mid';
  document.querySelectorAll('.be-priority-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.priority === bubbleEditorPriority);
  });

  document.getElementById('bubbleEditorOverlay').style.display = 'flex';
  sound.feedback('click');
}

function closeBubbleEditor() {
  document.getElementById('bubbleEditorOverlay').style.display = 'none';
  bubbleEditorTarget = null;
  bubbleEditorBubble = null;
}

// 时间快捷按钮
document.querySelectorAll('.bubble-time-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.bubble-time-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('bubbleEditorTime').value = this.dataset.bt;
    sound.feedback('click');
  });
});

// 优先级按钮
document.querySelectorAll('.be-priority-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.be-priority-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    bubbleEditorPriority = this.dataset.priority;
    sound.feedback('click');
  });
});

// 关闭弹窗
document.getElementById('bubbleEditorClose').addEventListener('click', closeBubbleEditor);
document.getElementById('bubbleEditorOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeBubbleEditor();
});

// 确认添加
document.getElementById('bubbleEditorConfirm').addEventListener('click', function() {
  if (!bubbleEditorTarget) return;
  const time = parseInt(document.getElementById('bubbleEditorTime').value);
  if (!time || time < 5) { showToast('时间至少5分钟'); return; }

  const task = bubbleEditorTarget;
  const bubble = bubbleEditorBubble;
  state.selectedTasks.push({
    name: task.name,
    time: time,
    icon: task.icon,
    priority: bubbleEditorPriority,
    id: Date.now() + Math.random()
  });
  bubble.classList.add('selected');
  sound.feedback('add');
  sound.jelly(bubble);
  saveState();
  updateTotalTime();
  renderScheduleList();
  updateGenerateBtn();
  closeBubbleEditor();
});

function formatTime(min) {
  if (min < 60) return min + '分';
  const h = Math.floor(min / 60); const m = min % 60;
  if (m === 0) return h + '小时';
  return h + '小时' + m + '分';
}

function updateTotalTime() {
  const total = state.selectedTasks.reduce((sum, t) => sum + t.time, 0);
  document.getElementById('totalTime').textContent = formatTime(total);
}

function updateGenerateBtn() {
  document.getElementById('btnGenerate').disabled = state.selectedTasks.length === 0;
}

// 优先级选择
document.querySelectorAll('.priority-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.priority-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    selectedPriority = this.dataset.priority;
    sound.feedback('click');
  });
});

// 时间选择
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    selectedTimeBtn = parseInt(this.dataset.time);
    if (selectedTimeBtn === 0) {
      document.getElementById('customTaskTime').style.display = 'block';
      document.getElementById('customTaskTime').focus();
    } else {
      document.getElementById('customTaskTime').style.display = 'none';
    }
    sound.feedback('click');
  });
});

// 添加任务
document.getElementById('btnAddTask').addEventListener('click', function() {
  const name = document.getElementById('customTaskName').value.trim();
  if (!name) { showToast('请输入任务名称'); return; }
  let time = selectedTimeBtn;
  if (!time || time === 0) {
    const ct = parseInt(document.getElementById('customTaskTime').value);
    if (!ct || ct < 5) { showToast('请选择或输入时间'); return; }
    time = ct;
  }
  if (state.selectedTasks.find(t => t.name === name)) { showToast('该任务已添加'); return; }
  state.selectedTasks.push({ name, time, icon: 'TASK', priority: selectedPriority, id: Date.now() + Math.random() });
  saveState(); sound.feedback('add'); sound.jelly(this);
  document.getElementById('customTaskName').value = '';
  document.getElementById('customTaskTime').value = '';
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
  selectedTimeBtn = null;
  renderScheduleList(); updateTotalTime(); updateGenerateBtn();
});

// ============ 任务编排列表 ============
function renderScheduleList() {
  const list = document.getElementById('scheduleList');
  if (state.selectedTasks.length === 0) {
    list.innerHTML = '<div class="schedule-empty">还没有任务, 从上方添加吧</div>';
    return;
  }
  const startTime = document.getElementById('scheduleStartTime').value || '09:00';
  let currentTime = startTime;
  const frag = document.createDocumentFragment();

  state.selectedTasks.forEach((task, i) => {
    const endTime = addMinutes(currentTime, task.time);
    const item = document.createElement('div');
    item.className = 'schedule-item';
    item.dataset.priority = task.priority;
    item.dataset.index = i;
    item.draggable = true;
    const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.mid;

    item.innerHTML = `
      <div class="drag-handle">::</div>
      <div class="priority-icon">${pc.icon}</div>
      <div class="schedule-item-info">
        <div class="schedule-item-name">${task.icon || 'TASK'} ${task.name}</div>
        <div class="schedule-item-time"><span>${currentTime} - ${endTime}</span><span>${formatTime(task.time)}</span></div>
      </div>
      <button class="schedule-item-remove" data-index="${i}">X</button>
    `;

    item.querySelector('.schedule-item-remove').addEventListener('click', function(e) {
      e.stopPropagation();
      const idx = parseInt(this.dataset.index);
      state.selectedTasks.splice(idx, 1);
      saveState();
      renderBubbles(); renderScheduleList(); updateTotalTime(); updateGenerateBtn();
      sound.feedback('deselect');
    });

    attachDragEvents(item);
    frag.appendChild(item);
    currentTime = endTime;
  });
  list.innerHTML = '';
  list.appendChild(frag);
}

function addMinutes(timeStr, minutes) {
  const [h, m] = timeStr.split(':').map(Number);
  let total = h * 60 + m + minutes;
  total = total % (24 * 60);
  return String(Math.floor(total / 60)).padStart(2, '0') + ':' + String(total % 60).padStart(2, '0');
}

document.getElementById('scheduleStartTime').addEventListener('change', function() {
  renderScheduleList(); sound.feedback('click');
});

// ============ 拖拽排序 ============
let dragSrcIndex = null;
function attachDragEvents(el) {
  el.addEventListener('dragstart', function(e) {
    dragSrcIndex = parseInt(this.dataset.index);
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    try { e.dataTransfer.setData('text/plain', dragSrcIndex); } catch (e2) {}
  });
  el.addEventListener('dragend', function() {
    this.classList.remove('dragging');
    document.querySelectorAll('.schedule-item').forEach(i => i.classList.remove('drag-over'));
  });
  el.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; this.classList.add('drag-over'); });
  el.addEventListener('dragleave', function() { this.classList.remove('drag-over'); });
  el.addEventListener('drop', function(e) {
    e.preventDefault();
    const t = parseInt(this.dataset.index);
    if (dragSrcIndex !== null && dragSrcIndex !== t) {
      const item = state.selectedTasks.splice(dragSrcIndex, 1)[0];
      state.selectedTasks.splice(t, 0, item);
      saveState(); renderScheduleList(); sound.feedback('drag');
    }
  });

  // 触摸拖拽
  let touchStartY = 0, isDragging = false, touchStartIndex = -1;
  let rafPending = false;
  let cachedItems = null;
  el.addEventListener('touchstart', function(e) {
    if (e.target.classList.contains('schedule-item-remove')) return;
    const t = e.touches[0]; touchStartY = t.clientY; touchStartIndex = parseInt(this.dataset.index);
    cachedItems = null; // 清缓存，下次touchmove时重建
  }, { passive: true });
  el.addEventListener('touchmove', function(e) {
    const t = e.touches[0]; const dy = t.clientY - touchStartY;
    if (!isDragging && Math.abs(dy) > 15) { isDragging = true; this.classList.add('dragging'); sound.feedback('drag'); }
    if (isDragging) {
      e.preventDefault();
      if (!rafPending) {
        rafPending = true;
        requestAnimationFrame(() => {
          rafPending = false;
          if (!cachedItems) cachedItems = document.querySelectorAll('.schedule-item');
          cachedItems.forEach(i => i.classList.remove('drag-over'));
          const target = document.elementFromPoint(t.clientX, t.clientY);
          if (target) { const ti = target.closest('.schedule-item'); if (ti && ti !== el) ti.classList.add('drag-over'); }
        });
      }
    }
  }, { passive: false });
  el.addEventListener('touchend', function(e) {
    if (isDragging) {
      const t = e.changedTouches[0];
      const target = document.elementFromPoint(t.clientX, t.clientY);
      if (target) {
        const ti = target.closest('.schedule-item');
        if (ti && ti !== this) {
          const targetIndex = parseInt(ti.dataset.index);
          if (touchStartIndex >= 0 && targetIndex >= 0 && touchStartIndex !== targetIndex) {
            const item = state.selectedTasks.splice(touchStartIndex, 1)[0];
            state.selectedTasks.splice(targetIndex, 0, item);
            saveState(); sound.feedback('drag');
          }
        }
      }
      renderScheduleList();
    }
    isDragging = false; this.classList.remove('dragging');
    document.querySelectorAll('.schedule-item').forEach(i => i.classList.remove('drag-over'));
  });
}

// 生成清单
document.getElementById('btnGenerate').addEventListener('click', function() {
  sound.feedback('add');
  const startTime = document.getElementById('scheduleStartTime').value || '09:00';
  state.todayList = state.selectedTasks.map(t => ({ ...t, done: false, startTime: startTime, endTime: null }));
  let ct = startTime;
  state.todayList.forEach(task => { task.startTime = ct; task.endTime = addMinutes(ct, task.time); ct = task.endTime; });
  saveState(); showPage('pageList'); renderTaskList(); updateStats();
});

document.getElementById('btnBackSelect').addEventListener('click', function() {
  sound.feedback('click'); showPage('pageSelect'); renderBubbles(); renderScheduleList();
});

// ============ 今日清单页 ============
function renderTaskList() {
  const list = document.getElementById('taskList');
  const celebration = document.getElementById('celebration');
  list.innerHTML = '';
  if (state.todayList.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-light);padding:40px 0;">还没有任务</p>';
    return;
  }
  const allDone = state.todayList.every(t => t.done);
  if (allDone && state.todayList.length > 0) {
    celebration.style.display = 'flex'; list.style.display = 'none'; return;
  } else { celebration.style.display = 'none'; list.style.display = 'flex'; }

  state.todayList.forEach((task, i) => {
    const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.mid;
    const card = document.createElement('div');
    card.className = 'task-card' + (task.done ? ' done' : '');
    card.dataset.priority = task.priority; card.dataset.index = i;
    card.innerHTML = `
      <div class="task-checkbox"></div>
      <div class="task-info">
        <div class="task-name">${pc.icon} ${task.name}</div>
        <div class="task-meta">
          <span class="task-time-slot"> ${task.startTime}-${task.endTime}</span>
          <span class="task-duration"> ${formatTime(task.time)}</span>
        </div>
      </div>`;
    card.addEventListener('click', e => toggleTaskDone(i, card, e));
    list.appendChild(card);
  });

  const now = new Date();
  const ms = ['1','2','3','4','5','6','7','8','9','10','11','12'];
  const ws = ['日','一','二','三','四','五','六'];
  document.getElementById('listDate').textContent = `${ms[now.getMonth()-1]}月${now.getDate()}日 周${ws[now.getDay()]}`;
}

function toggleTaskDone(index, card, e) {
  const task = state.todayList[index];
  if (!task.done) {
    task.done = true; sound.feedback('complete');
    const r = card.getBoundingClientRect();
    let cx = e.clientX, cy = e.clientY;
    // 兼容触摸事件
    if (cx === undefined && e.touches && e.touches.length) {
      cx = e.touches[0].clientX; cy = e.touches[0].clientY;
    } else if (cx === undefined && e.changedTouches && e.changedTouches.length) {
      cx = e.changedTouches[0].clientX; cy = e.changedTouches[0].clientY;
    }
    if (cx === undefined) { cx = r.left + r.width / 2; cy = r.top + r.height / 2; }
    const x = cx - r.left, y = cy - r.top;
    const ripple = document.createElement('div');
    ripple.className = 'ripple'; ripple.style.left = x + 'px'; ripple.style.top = y + 'px';
    ripple.style.width = '20px'; ripple.style.height = '20px'; ripple.style.marginLeft = '-10px'; ripple.style.marginTop = '-10px';
    card.appendChild(ripple); setTimeout(() => ripple.remove(), 600);
    spawnParticles(card); sound.jelly(card);
  } else { task.done = false; sound.feedback('deselect'); }
  saveState();
  requestAnimationFrame(() => {
    card.classList.toggle('done', task.done); updateStats();
    if (state.todayList.every(t => t.done) && state.todayList.length > 0) {
      setTimeout(() => { sound.feedback('celebrate'); spawnCelebrationParticles(); renderTaskList(); }, 300);
    }
  });
}

function updateStats() {
  const done = state.todayList.filter(t => t.done).length;
  const total = state.todayList.length;
  const time = state.todayList.reduce((s, t) => s + t.time, 0);
  document.getElementById('statDone').textContent = done;
  document.getElementById('statTotal').textContent = total;
  document.getElementById('statTime').textContent = formatTime(time);
  const pct = total > 0 ? Math.round(done / total * 100) : 0;
  const ring = document.getElementById('ringFill');
  ring.style.strokeDashoffset = 125.6 - (pct / 100) * 125.6;
  document.getElementById('ringText').textContent = pct + '%';
  ring.style.stroke = pct === 100 ? 'var(--neon-green)' : pct >= 50 ? 'var(--neon-yellow)' : 'var(--neon-cyan)';
}

// ============ 粒子 ============
function spawnParticles(card) {
  const r = card.getBoundingClientRect();
  const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const em = ['*', '+', '!', '#', '$'];
  for (let i = 0; i < 8; i++) {
    const p = document.createElement('div');
    p.className = 'particle'; p.textContent = em[Math.floor(Math.random() * em.length)];
    p.style.color = ['var(--neon-cyan)','var(--neon-yellow)','var(--neon-pink)','var(--neon-green)'][Math.floor(Math.random()*4)];
    p.style.left = cx + 'px'; p.style.top = cy + 'px';
    const a = (Math.PI * 2 / 8) * i, d = 60 + Math.random() * 40;
    p.style.setProperty('--particle-end', `translate(${Math.cos(a)*d}px, ${Math.sin(a)*d}px)`);
    document.getElementById('particleLayer').appendChild(p);
    setTimeout(() => p.remove(), 1000);
  }
}
function spawnCelebrationParticles() {
  const em = ['*', '+', '!', '#', '$', '%', '&'];
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  for (let i = 0; i < 24; i++) {
    setTimeout(() => {
      const p = document.createElement('div');
      p.className = 'particle'; p.textContent = em[Math.floor(Math.random() * em.length)];
      p.style.fontSize = (14 + Math.random() * 14) + 'px';
      p.style.color = ['var(--neon-cyan)','var(--neon-yellow)','var(--neon-pink)','var(--neon-green)','var(--neon-purple)'][Math.floor(Math.random()*5)];
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      const a = Math.random() * Math.PI * 2, d = 100 + Math.random() * 150;
      p.style.setProperty('--particle-end', `translate(${Math.cos(a)*d}px, ${Math.sin(a)*d}px)`);
      document.getElementById('particleLayer').appendChild(p);
      setTimeout(() => p.remove(), 1000);
    }, i * 40);
  }
}

// ============ Toast ============
function showToast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ============ 新的一天 ============
document.getElementById('btnNewDay').addEventListener('click', function() {
  sound.feedback('click');
  state = { ...defaultState, date: new Date().toDateString() };
  saveState(); showPage('pageHome'); initHome();
});

// ============ 启动画面 ============
function initSplash() {
  const splash = document.getElementById('splashScreen');
  if (!splash) return;

  let dismissed = false;
  const enterSplash = () => {
    if (dismissed) return;
    dismissed = true;
    splash.classList.add('hide');
    try { sound.resume(); } catch(e) {}
    setTimeout(() => { if (splash.parentNode) splash.parentNode.removeChild(splash); }, 500);
  };

  // 点击/触摸立即进入
  splash.addEventListener('click', enterSplash);
  splash.addEventListener('touchstart', enterSplash, { passive: true });

  // 3秒后自动进入（兜底）
  setTimeout(enterSplash, 3000);
}

// ============ 初始化 ============
function init() {
  generateStars();
  initSplash();
  // 仅当今日清单已生成时才直接跳到清单页；其他情况都留在首页显示抽卡画面
  if (state.todayList.length > 0 && state.luckyCard) {
    showPage('pageList'); renderTaskList(); updateStats();
  }
  initHome();
}
init();
