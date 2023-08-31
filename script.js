class TimerElement extends HTMLElement {
  constructor() {
    super();
    this._startBtn = null;
    this._pauseBtn = null;
    this._resetBtn = null;

    this._secondsValue = this.getAttribute('seconds');
    this._toTimeValue = this.getAttribute('to-time');
    this._initialSecondsValue = this._secondsValue;
    this._initialToTimeValue - null;

    this._hours = null;
    this._minutes = null;
    this._seconds = null;

    this._interval = null;

    this._startTimerEvent = new CustomEvent('starttimer', { composed: true });
    this._pauseTimerEvent = new CustomEvent('pausetimer', { composed: true });
    this._resetTimerEvent = new CustomEvent('resettimer', { composed: true });
    this._endTimerEvent = new CustomEvent('endtimer', { composed: true });

    this.addEventListener('starttimer', this._startTimer);
    this.addEventListener('pausetimer', this._stopTimer);
    this.addEventListener('resettimer', this._resetTimer);
    this.addEventListener('endtimer', this._stopTimer);

    this._isTimerStarted = false;
  }

  // Добавление элемента значения таймера в теневой дом
  _addShadowDOM() {
    this._shadow = this.attachShadow({ mode: 'open' });
    this._shadow.innerHTML = `
    <style>
      .timer__value {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        background-color: var(--primary);
        border-radius: 15px;
        box-sizing: border-box;
        border: 3px solid var(--accent);
        color: var(--background);
        font-weight: 700;
        font-size: 2.5em;
        grid-column: span 3;
      }
    </style>
    <span class="timer__value"></span>`;
    this._timerValue = this._shadow.querySelector('.timer__value');
  }

  // Добавление теневых слотов
  _addShadowSlots() {
    const buttonStartSlot = document.createElement('slot');
    buttonStartSlot.setAttribute('name', 'button-start');

    const buttonPauseSlot = document.createElement('slot');
    buttonPauseSlot.setAttribute('name', 'button-pause');

    const buttonResetSlot = document.createElement('slot');
    buttonResetSlot.setAttribute('name', 'button-reset');

    this._shadow.append(buttonStartSlot, buttonPauseSlot, buttonResetSlot);
  }

  // Добавление разметки внутрь компонента
  _addInnerMarkup() {
    const innerMarkup = `
    <button type="button" slot="button-start" class="timer__btn timer__btn_start">Start</button>
    <button type="button" slot="button-pause" class="timer__btn timer__btn_pause">Pause</button>
    <button type="button" slot="button-reset" class="timer__btn timer__btn_reset">Reset</button>`;

    this.innerHTML = innerMarkup;
  }

  // Поиск кнопок
  _setProps() {
    this._startBtn = this.querySelector('.timer__btn_start');
    this._pauseBtn = this.querySelector('.timer__btn_pause');
    this._resetBtn = this.querySelector('.timer__btn_reset');
  }

  // Отключение/включение кнопки при старте/остановке таймера
  _checkIsTimerStarter() {
    if (this._isTimerStarted) {
      this._startBtn.classList.add('timer__btn_inactive');
      this._startBtn.setAttribute('disabled', 'true');
    } else {
      this._startBtn.classList.remove('timer__btn_inactive');
      this._startBtn.removeAttribute('disabled');
    }
  }

  // Установление события кнопок
  _setEventListeners() {
    this._pauseBtn.addEventListener('click', () => {
      this.dispatchEvent(this._pauseTimerEvent);
      this._checkIsTimerStarter();
    });

    this._startBtn.addEventListener('click', () => {
      this.dispatchEvent(this._startTimerEvent);
      this._checkIsTimerStarter();
    });

    this._resetBtn.addEventListener('click', () => {
      this.dispatchEvent(this._resetTimerEvent);
      this._checkIsTimerStarter();
    });
  }

  // Отрендерить зачение таймера
  _renderTimeValue() {
    if (this._hours) {
      this._timerValue.textContent = `${this._hours}:${this._minutes > 9 ? '' : '0'}${this._minutes}:${this._seconds > 9 ? '' : '0'}${this._seconds}`;
    } else {
      this._timerValue.textContent = `${this._minutes > 9 ? '' : '0'}${this._minutes}:${this._seconds > 9 ? '' : '0'}${this._seconds}`;
    }
  }

  // Вычислить параметры таймера при указании атрибута "seconds"
  _setSecondsTime(time) {
    this._hours = Math.floor(time / 3600);
    this._minutes = Math.floor((time - this._hours * 3600) / 60);
    this._seconds = time - (this._hours * 3600) - (this._minutes * 60);
    this._renderTimeValue();
  }

  // Вычислить параметры таймера при указании атрибута "to-time"
  _setToTime(timeString) {
    const date = new Date();

    const currHours = Number(date.getHours());
    const currMinuntes = Number(date.getMinutes());
    const currSeconds = Number(date.getSeconds());

    let targetHours;
    let targetMinutes;
    let targetSeconds;

    const timeStringArr = timeString.split(':');

    if (timeStringArr.length === 3) {
      targetHours = Number(timeStringArr[0]);
      targetMinutes = Number(timeStringArr[1]);
      targetSeconds = Number(timeStringArr[2]);
    } else {
      targetMinutes = Number(timeStringArr[0]);
      targetSeconds = Number(timeStringArr[1]);
    }

    const secondsDiff = (targetHours * 3600 + targetMinutes * 60 + targetSeconds) - (currHours * 3600 + currMinuntes * 60 + currSeconds);
    this._initialToTimeValue = secondsDiff;

    if (secondsDiff > 0) {
      this._setSecondsTime(secondsDiff);
    }
  }

  // Запустить таймер
  _startTimer() {
    const timer = () => {
      this._seconds--;

      if (this._seconds === 0 && this._minutes === 0 && this._hours === 0) {
        this.dispatchEvent(this._endTimerEvent);
      }

      this._renderTimeValue();

      if (this._seconds === 0) {
        this._minutes--;
        this._seconds = 60;

        if (this._minutes === -1 && this._hours) {
          this._hours--;
          this._minutes = 59;
        }
      }

    }

    this._interval = setInterval(timer, 1000);
    this._isTimerStarted = true;
  }

  // Остановить таймер
  _stopTimer() {
    clearInterval(this._interval);
    this._isTimerStarted = false;
  }

  // Сбросить таймер
  _resetTimer() {
    this._stopTimer();

    this._secondsValue = this._initialSecondsValue;
    this._checkTimerType();
  }

  // Проверить, какой атрибут таймера используется
  _checkTimerType() {
    if (this._secondsValue) {
      this._setSecondsTime(this._secondsValue);
    }

    if (this._toTimeValue) {
      this._setToTime(this._toTimeValue);
    }
  }

  connectedCallback() {
    this._addShadowDOM();
    this._addShadowSlots();
    this._addInnerMarkup();
    this._setProps();
    this._setEventListeners();
    this._checkTimerType();
  }

  static get observedAttributes() {
    return ['seconds', 'to-time'];
  }

  attributeChangedCallback() {
    if (!this._timerValue) {
      return;
      // Почему-то весь этот коллбэк вызывается раньше, чем connectedCallback => this._timerValue при таком порядке вызовов не будет определён и выбросится ошибка
    }

    this._stopTimer();
    this._secondsValue = this.getAttribute('seconds');
    this._toTimeValue = this.getAttribute('to-time');
    this._initialSecondsValue = this._secondsValue;

    this._checkTimerType();
  }
}


customElements.define('timer-view', TimerElement);
