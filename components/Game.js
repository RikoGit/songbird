import Gallery from './Gallery.js';
import Level from './Level.js';

class Game {
  constructor({data}) {
    this.initdata = data;
    this.length = data.length;
    this.data = data;
    this.level = 0;
    this.score = 0;
    this.currentPage = 'preview';
    this.levelNames = [
      'Разминка',
      'Воробьиные',
      'Лесные птицы',
      'Певчие птицы',
      'Хищные птицы',
      'Морские птицы',
    ];
    this.maxLevelScore = 5;
    this.levels = [];
    this.gallery = null;
    this.isGameOver = false;
    this.currentAudio = null;
    this.audioErrorElement = null;
    this.audioCorrectElement = null;
    this.init();
  }

  switchPage(name = this.currentPage) {
    const navElement = document.querySelector(`.nav__item[data-name = ${name}]`);
    if (this.currentPage === name) return;

    this.currentPage = name;
    if (this.currentAudio) this.currentAudio.pause();
    document
      .querySelectorAll(`.nav__item:not([data-name = ${name}])`)
      .forEach((elem) => elem.classList.remove('nav__item_active'));
    navElement.classList.add('nav__item_active');
    document.querySelector('.main:not([hidden])').setAttribute('hidden', true);
    document.querySelector(`.main.${name}`).removeAttribute('hidden');
  }

  onClickHandler() {
    document.querySelector('.app').addEventListener('click', (event) => {
      const {target} = event;
      if (target.play) {
        console.log('fudio');
      }
      if (target.classList.contains('list__button')) {
        if (
          !document
            .querySelector(`.tabpanel[aria-labelledby = ${target.id}]`)
            .hasAttribute('hidden')
        ) {
          return;
        }
        document.querySelectorAll('.list__button').forEach((elem) => {
          elem.setAttribute('aria-selected', false);
        });
        target.setAttribute('aria-selected', true);
        document.querySelectorAll('.tabpanel').forEach((elem) => {
          elem.setAttribute('hidden', true);
          if (elem.id === target.getAttribute('aria-controls')) {
            elem.removeAttribute('hidden');
          }
        });
        if (this.levels[this.level - 1].getLevelState() === 'complete') {
          return;
        }
        if (
          !target.classList.contains('list__button_type_correct') &&
          !target.classList.contains('list__button_type_incorrect')
        ) {
          if (this.levels[this.level - 1].checkResult(Number(target.dataset.id))) {
            this.audioErrorElement.currentTime = 0;
            this.audioErrorElement.pause();
            this.audioCorrectElement.play();
            target.classList.add('list__button_type_correct');
            this.currentAudio.pause();
          } else {
            this.audioErrorElement.currentTime = 0;
            this.audioCorrectElement.pause();
            this.audioErrorElement.play();
            target.classList.add('list__button_type_incorrect');
          }
          if (this.isGameOver) {
            document.querySelector('.next-level-button').textContent = 'Show result';

            return;
          }
        }
      }

      if (target.classList.contains('nav__item')) {
        this.switchPage(target.dataset.name);
        if (this.gallery) return;

        this.gallery = new Gallery({
          data: this.data,
          levelNames: this.levelNames,
          onAudioPlay: (audioElement) => {
            if (this.currentAudio && this.currentAudio !== audioElement) this.currentAudio.pause();
            this.currentAudio = audioElement;
          },
        });
      }

      if (target.classList.contains('next-level-button')) {
        if (this.isGameOver) {
          this.end();

          return;
        }
        this.newLevel();
      }
      if (target.classList.contains('start-button')) {
        this.switchPage('game');
        this.start();
      }
    });
  }

  init() {
    this.data = this.data.map((x) => x.map((elem) => ({...elem})));
    this.audioErrorElement = new Audio();
    this.audioErrorElement.src = './sounds/error.mp3';
    this.audioCorrectElement = new Audio();
    this.audioCorrectElement.src = './sounds/correct.mp3';
    this.onClickHandler();
    this.printLevelNames();
    this.start();
  }

  printLevelNames() {
    let content = '';
    for (let index = 0; index < this.length; index++) {
      const name = this.levelNames[index] ? this.levelNames[index] : `Level ${index + 1}`;
      content += `<li class='completeness__item' aria-label='${name}' title='Level ${
        index + 1
      }'></li>`;
    }
    document.querySelector('.completeness').innerHTML = content;
  }

  start() {
    this.level = 0;
    this.score = 0;
    this.printScore();
    this.isGameOver = false;
    document.querySelector('.next-level-button').textContent = 'Next level';
    this.newLevel();
  }

  printScore() {
    document.querySelector('.game__score-value').textContent = this.score;
  }

  newLevel() {
    this.audioErrorElement.pause();
    this.audioCorrectElement.pause();
    this.audioErrorElement.currentTime = 0;
    this.audioCorrectElement.currentTime = 0;
    if (this.level === 0) {
      document
        .querySelectorAll('.completeness__item_active')
        .forEach((elem) => elem.classList.remove('completeness__item_active'));
    }
    if (this.level !== 0) {
      document
        .querySelectorAll('.completeness__item')
        [this.level - 1].classList.remove('completeness__item_active');
    }
    document
      .querySelectorAll('.completeness__item')
      [this.level].classList.add('completeness__item_active');
    document.querySelector('.next-level-button').setAttribute('disabled', true);
    document.querySelectorAll('.list__button').forEach((elem) => {
      elem.classList.remove('list__button_type_correct');
      elem.classList.remove('list__button_type_incorrect');
      elem.setAttribute('aria-selected', false);
    });
    document.querySelectorAll('.tabpanel').forEach((elem) => {
      elem.setAttribute('hidden', true);
    });
    document.querySelector('.description').classList.remove('description_active');
    document.querySelector('.description__title').textContent = '******';
    document.querySelector('.description__img').src = './images/birds/default.jpg';
    if (!this.levels[this.level]) {
      this.levels[this.level] = new Level({
        data: this.data[this.level],
        maxScore: this.maxLevelScore,
        onComplete: (score) => {
          this.score += score;
          this.printScore();
          if (this.length === this.level) this.isGameOver = true;
          document.querySelector('.next-level-button').removeAttribute('disabled');
        },
        onAudioPlay: (audioElement) => {
          if (this.currentAudio && this.currentAudio !== audioElement) this.currentAudio.pause();
          this.currentAudio = audioElement;
        },
      });
    }
    this.levels[this.level].start();
    document.querySelector('.tabpanel_type_preview').removeAttribute('hidden');
    this.level += 1;
  }

  end() {
    const maxScore = this.length * this.maxLevelScore;
    document.querySelector('.result-score__value').textContent = `${this.score} / ${maxScore}`;
    document.querySelector('.game').setAttribute('hidden', true);
    document.querySelector('.start-button').removeAttribute('hidden');
    document.querySelector('.main.result').removeAttribute('hidden');
    if (this.score === maxScore) {
      document.querySelector('.result-page__win').removeAttribute('hidden');
    } else document.querySelector('.result-page__win').setAttribute('hidden', true);
  }
}

export default Game;
