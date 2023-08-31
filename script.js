class TimerElement extends HTMLElement {
  constructor() {
    super();
    this._timerValue = null;
    this._startBtn = null;
    this._pauseBtn = null;
    this._resetBtn = null;
    this._secondsValue = this.getAttribute('seconds');
    this._initialSecondsValue = this._secondsValue;
    this._toTimeValue = this.getAttribute('to-time');
    this._initialToTimeValue - this._toTimeValue;

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
  }

  _addInnerMarkup() {
    const innerMarkup = `
    <span class="timer__value">00:00:00</span>
    <button type="button" class="timer__btn timer__btn_start">Start</button>
    <button type="button" class="timer__btn timer__btn_pause">Pause</button>
    <button type="button" class="timer__btn timer__btn_reset">Reset</button>`;

    this.innerHTML = innerMarkup;
  }

  _setProps() {
    this._timerValue = this.querySelector('.timer__value');
    this._startBtn = this.querySelector('.timer__btn_start');
    this._pauseBtn = this.querySelector('.timer__btn_pause');
    this._resetBtn = this.querySelector('.timer__btn_reset');
  }

  _setEventListeners() {
    this._pauseBtn.addEventListener('click', () => {
      this.dispatchEvent(this._pauseTimerEvent);
    });

    this._startBtn.addEventListener('click', () => {
      this.dispatchEvent(this._startTimerEvent);
    });

    this._resetBtn.addEventListener('click', () => {
      this.dispatchEvent(this._resetTimerEvent);
    });
  }

  _renderTimeValue() {
    if (this._hours) {
      this._timerValue.textContent = `${this._hours}:${this._minutes > 9 ? '' : '0'}${this._minutes}:${this._seconds > 9 ? '' : '0'}${this._seconds}`;
    } else {
      this._timerValue.textContent = `${this._minutes > 9 ? '' : '0'}${this._minutes}:${this._seconds > 9 ? '' : '0'}${this._seconds}`;
    }
  }

  _setSecondsTime(time) {
    this._hours = Math.floor(time / 3600);
    this._minutes = Math.floor((time - this._hours * 3600) / 60);
    this._seconds = time - (this._hours * 3600) - (this._minutes * 60);
    this._renderTimeValue();
  }

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

    if (secondsDiff > 0) {
      this._setSecondsTime(secondsDiff);
    }
  }

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
  }

  _stopTimer() {
    clearInterval(this._interval);
  }

  _resetTimer() {
    this._stopTimer();

    this._secondsValue = this._initialSecondsValue;
    this._toTimeValue = this._initialToTimeValue;
    this._checkTimerType();
  }

  _checkTimerType() {
    if (this._secondsValue) {
      this._setSecondsTime(this._secondsValue);
    }

    if (this._toTimeValue) {
      this._setToTime(this._toTimeValue);
    }
  }

  connectedCallback() {

    // this._shadow = this.attachShadow({ mode: 'open' });
    // this._shadow.append('<span class="timer__value">00:00:00</span>')

    this._addInnerMarkup();
    this._setProps();
    this._setEventListeners();
    this._checkTimerType();
  }

  static get observedAttributes() {
    return ['seconds', 'to-time'];
  }

  attributeChangedCallback() {
    this._stopTimer();
    this._secondsValue = this.getAttribute('seconds');
    this._toTimeValue = this.getAttribute('to-time');

    if (!this._timerValue) {
      return;
      // Почему-то весь этот коллбэк вызывается раньше, чем connectedCallback => this._timerValue при таком порядке вызовов не будет определён и выбросится ошибка
    }

    this._checkTimerType();
  }
}


customElements.define('timer-view', TimerElement);
