const STORAGE_KEY = 'pilotlab-public-mvp-v1';

const missions = [
  {
    short: 'Безопасная задача',
    title: 'Поставьте задачу без личных данных',
    lead: 'Сильный запрос начинается не с магической формулы, а с понятного результата и безопасного контекста.',
    metaphor: 'ИИ — приглашённый помощник. Перед встречей со стола убирают документы, которые ему видеть не нужно.',
    type: 'text',
    prompt: 'Попросите составить три коротких правила бережного обращения с учебными файлами.',
    placeholder: 'Например: составь три коротких правила…',
    validate(value) {
      const unsafe = /@|паспорт|адрес|телефон|фамил|снилс|\+?\d[\d\s()\-]{7,}/i.test(value);
      if (unsafe) {
        return { ok: false, message: 'Похоже, в запросе есть персональные данные. Удалите их или замените учебным примером.' };
      }
      if (value.trim().length < 20) {
        return { ok: false, message: 'Добавьте действие, тему и формат результата: что нужно получить и сколько пунктов.' };
      }
      const hasAction = /(состав|напиш|предлож|подготов|сформулир)/i.test(value);
      const hasFormat = /(три|3|пункт|правил|спис)/i.test(value);
      if (!hasAction || !hasFormat) {
        return { ok: false, message: 'Уточните действие и формат: например, три правила или список из трёх пунктов.' };
      }
      return { ok: true, message: 'Задача понятна, формат задан, персональные данные не обнаружены. Решением по-прежнему управляете вы.' };
    },
    hints: [
      'Начните с глагола: «составь», «предложи» или «подготовь».',
      'Добавьте тему и формат: правила об учебных файлах, три пункта.',
      'Пример: «Составь три коротких правила бережного обращения с учебными файлами. Не используй личные данные».',
    ],
    curator: 'Спросите: «Что должно получиться на выходе?» Не диктуйте готовую фразу и не печатайте за участника.',
    branches: [
      ['Не вижу, куда писать', 'Поле ввода находится в голубой карточке под формулировкой задачи. Нажмите внутри белого прямоугольника.'],
      ['Кнопка не помогает', 'Сначала введите запрос. Если появилась обратная связь, измените только то условие, о котором она говорит.'],
      ['Я ввёл личные данные', 'Удалите имя, телефон, адрес и номера документов. Замените человека словами «учебный участник».'],
    ],
  },
  {
    short: 'Версия или факт',
    title: 'Найдите утверждение, которое требует проверки',
    lead: 'Модель уверенно ответила: «Библиотека закрывается в 18:00 — это указано в расписании на 2026 год».',
    metaphor: 'Уверенный голос — это громкость, а не справка из архива.',
    type: 'single',
    prompt: 'Какое действие будет правильным первым шагом?',
    options: [
      'Сразу переслать ответ другим людям',
      'Проверить актуальное расписание на официальном источнике',
      'Попросить модель повторить ответ более уверенно',
    ],
    correct: 1,
    success: 'Верно. Конкретное утверждение о времени работы нужно связать с актуальным независимым источником.',
    retry: 'Выберите действие, которое уменьшает неопределённость до публикации или пересылки.',
    hints: [
      'Найдите часть ответа, которая может быть истинной или ложной.',
      'Проверяемые элементы: время закрытия, год и источник расписания.',
      'Сначала откройте официальный источник и сравните сведения.',
    ],
    curator: 'Попросите участника дословно назвать проверяемое утверждение и источник, который мог бы его подтвердить.',
    branches: [
      ['Не понимаю, что здесь факт', 'Факт допускает независимую проверку. Здесь можно проверить время работы и наличие расписания на 2026 год.'],
      ['Все варианты кажутся похожими', 'Спросите: какое действие даёт новое основание, а не просто ещё одну формулировку?'],
      ['Я выбрал не то', 'Ничего страшного. Повтор не отнимает XP: измените выбор и проверьте ещё раз.'],
    ],
  },
];

const defaultState = {
  started: false,
  mode: 'self',
  index: 0,
  completed: [],
  xp: 0,
  attempts: 0,
  hints: {},
  largeType: false,
};

let state = loadState();

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultState, ...saved } : { ...defaultState };
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Некоторые браузеры ограничивают localStorage для локальных file:// страниц.
    // Демо продолжает работать, но прогресс не сохраняется после закрытия вкладки.
  }
}

function showWorkspace() {
  $('#welcome').hidden = true;
  $('#workspace').hidden = false;
  render();
}

function render() {
  document.body.classList.toggle('large-type', state.largeType);
  $('#font-toggle').setAttribute('aria-pressed', String(state.largeType));
  $$('.mode-switch button').forEach((button) => {
    button.classList.toggle('active', button.dataset.mode === state.mode);
  });
  renderMap();
  renderMission();
  renderHelp();
}

function renderMap() {
  $('#xp').textContent = String(state.xp);
  $('#progress-text').textContent = `${state.completed.length} из ${missions.length} миссий`;
  $('#progress-bar').style.width = `${(state.completed.length / missions.length) * 100}%`;

  const map = $('#mission-map');
  map.innerHTML = '';
  missions.forEach((mission, index) => {
    const item = document.createElement('li');
    const button = document.createElement('button');
    const complete = state.completed.includes(index);
    const available = index === 0 || complete || state.completed.includes(index - 1);
    button.type = 'button';
    button.disabled = !available;
    button.className = `${index === state.index ? 'current ' : ''}${complete ? 'complete' : ''}`.trim();
    button.setAttribute('aria-current', index === state.index ? 'step' : 'false');
    button.innerHTML = `<span class="mission-number">${complete ? '✓' : index + 1}</span><span><strong>${mission.short}</strong><small>${complete ? 'готово' : available ? 'доступно' : 'сначала завершите предыдущую'}</small></span>`;
    button.addEventListener('click', () => {
      state.index = index;
      saveState();
      render();
      $('#mission').focus();
    });
    item.appendChild(button);
    map.appendChild(item);
  });
}

function renderMission() {
  const content = $('#mission-content');
  const feedback = $('#feedback');
  $('#different-button').hidden = false;
  feedback.hidden = true;
  feedback.className = 'feedback';
  $('#retry-button').hidden = true;
  $('#next-button').hidden = true;
  $('#check-button').hidden = false;

  if (state.completed.length === missions.length && state.index >= missions.length) {
    renderSummary();
    return;
  }

  const mission = missions[state.index];
  content.innerHTML = `
    <p class="mission-kicker">Миссия ${state.index + 1} из ${missions.length}</p>
    <h2>${mission.title}</h2>
    <p class="lead">${mission.lead}</p>
    <p class="metaphor"><strong>Метафора:</strong> ${mission.metaphor}</p>
    <section class="task-box">
      <p><strong>Задача:</strong> ${mission.prompt}</p>
      ${mission.type === 'text' ? `
        <label for="answer-text">Ваш учебный запрос</label>
        <input id="answer-text" type="text" autocomplete="off" placeholder="${mission.placeholder}">
      ` : `
        <fieldset class="choices">
          <legend class="section-label">Выберите один вариант</legend>
          ${mission.options.map((option, index) => `
            <label class="choice"><input type="radio" name="answer" value="${index}"><span>${option}</span></label>
          `).join('')}
        </fieldset>
      `}
    </section>
  `;
}

function renderHelp() {
  const mission = missions[Math.min(state.index, missions.length - 1)];
  const count = state.hints[state.index] || 0;
  $('#mode-card').innerHTML = state.mode === 'self'
    ? '<strong>Самостоятельный режим</strong><p>Сначала попробуйте сами. Подсказки можно открывать без потери XP.</p>'
    : `<strong>Режим куратора</strong><p>${mission.curator}</p>`;
  $$('.hint-list button').forEach((button, index) => {
    button.classList.toggle('used', index < count);
  });
  $('#hint-output').textContent = count
    ? mission.hints[count - 1]
    : 'Открывайте подсказки по одной. XP не уменьшается.';
}

function checkAnswer() {
  const mission = missions[state.index];
  let result;
  if (mission.type === 'text') {
    result = mission.validate($('#answer-text').value);
  } else {
    const selected = document.querySelector('input[name="answer"]:checked');
    result = selected
      ? { ok: Number(selected.value) === mission.correct, message: Number(selected.value) === mission.correct ? mission.success : mission.retry }
      : { ok: false, message: 'Сначала выберите один вариант.' };
  }

  state.attempts += 1;
  const feedback = $('#feedback');
  feedback.hidden = false;
  feedback.textContent = result.message;
  feedback.className = `feedback ${result.ok ? 'success' : 'retry'}`;

  if (result.ok) {
    if (!state.completed.includes(state.index)) {
      state.completed.push(state.index);
      state.completed.sort((a, b) => a - b);
      state.xp += 10;
    }
    $('#check-button').hidden = true;
    $('#retry-button').hidden = true;
    $('#next-button').hidden = false;
    $('#next-button').textContent = state.index === missions.length - 1 ? 'Посмотреть результат' : 'Следующая миссия';
    renderMap();
  } else {
    $('#retry-button').hidden = false;
  }
  saveState();
}

function retry() {
  $('#feedback').hidden = true;
  $('#retry-button').hidden = true;
  if (missions[state.index].type === 'text') {
    $('#answer-text').focus();
  }
}

function nextMission() {
  if (state.index < missions.length - 1) {
    state.index += 1;
    saveState();
    render();
    $('#mission').focus();
    return;
  }
  state.index = missions.length;
  saveState();
  renderSummary();
}

function renderSummary() {
  $('#mission-content').innerHTML = `
    <section class="summary">
      <p class="eyebrow">Демо завершено</p>
      <h2>Ты не пассажир. Ты — пилот.</h2>
      <p class="lead"><strong>Вы управляли. ИИ помогал.</strong> Вы поставили безопасную задачу и выбрали проверку вместо доверия к уверенной формулировке.</p>
      <div class="summary-grid">
        <div><strong>${state.xp} XP</strong><span>личный опыт</span></div>
        <div><strong>${state.attempts}</strong><span>попыток</span></div>
        <div><strong>${Object.values(state.hints).reduce((sum, value) => sum + value, 0)}</strong><span>подсказок</span></div>
      </div>
      <p class="safety-note"><strong>Ключевой вывод</strong><span>Ответ ИИ — материал для проверки и решения человека, а не команда к действию.</span></p>
    </section>
  `;
  $('#feedback').hidden = true;
  $('#check-button').hidden = true;
  $('#retry-button').hidden = true;
  $('#next-button').hidden = true;
  $('#different-button').hidden = true;
  renderMap();
}

function showDifferent() {
  const mission = missions[Math.min(state.index, missions.length - 1)];
  const options = $('#branch-options');
  options.innerHTML = '';
  $('#branch-answer').textContent = 'Выберите наиболее похожую ситуацию.';
  mission.branches.forEach(([label, answer]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = label;
    button.addEventListener('click', () => {
      $('#branch-answer').textContent = answer;
    });
    options.appendChild(button);
  });
  $('#different-dialog').showModal();
}

function resetDemo() {
  const confirmed = window.confirm('Сбросить демонстрационный прогресс на этом устройстве?');
  if (!confirmed) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Если хранилище недоступно, сбрасываем только текущее состояние.
  }
  state = { ...defaultState };
  $('#workspace').hidden = true;
  $('#welcome').hidden = false;
  $('#different-button').hidden = false;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

$('#start-button').addEventListener('click', () => {
  state.started = true;
  saveState();
  showWorkspace();
  $('#mission').focus();
});

$('#check-button').addEventListener('click', checkAnswer);
$('#retry-button').addEventListener('click', retry);
$('#next-button').addEventListener('click', nextMission);
$('#different-button').addEventListener('click', showDifferent);
$('#reset-button').addEventListener('click', resetDemo);

$('#font-toggle').addEventListener('click', () => {
  state.largeType = !state.largeType;
  saveState();
  render();
});

$$('.mode-switch button').forEach((button) => {
  button.addEventListener('click', () => {
    state.mode = button.dataset.mode;
    saveState();
    render();
  });
});

$$('.hint-list button').forEach((button) => {
  button.addEventListener('click', () => {
    const hintIndex = Number(button.dataset.hint);
    const used = state.hints[state.index] || 0;
    if (hintIndex > used) {
      $('#hint-output').textContent = 'Сначала откройте предыдущую подсказку.';
      return;
    }
    state.hints[state.index] = Math.max(used, hintIndex + 1);
    saveState();
    renderHelp();
  });
});

if (state.started) {
  showWorkspace();
} else {
  document.body.classList.toggle('large-type', state.largeType);
}
