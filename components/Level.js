class Level {
  constructor({data, onComplete, maxScore = 5, onAudioPlay}) {
    this.score = 0;
    this.maxScore = maxScore;
    this.data = data;
    this.target = null;
    this.listNode = null;
    this.onComplete = onComplete;
    this.isComplete = false;
    this.onAudioPlay = onAudioPlay;
    this.init();
  }

  init() {
    for (let i = 0; i < this.data.length; i++) {
      const audioElement = new Audio(`./sounds/birds/${this.data[i].audio}`);
      audioElement.controls = true;
      this.data[i].audioElement = audioElement;
      audioElement.onplay = () => {
        document.querySelector(`#tab-${i + 1}`).classList.add('list__button_state_play');
        this.onAudioPlay(audioElement);
      };
      audioElement.onpause = () => {
        document.querySelector(`#tab-${i + 1}`).classList.remove('list__button_state_play');
      };
      audioElement.onended = () => {
        document.querySelector(`#tab-${i + 1}`).classList.remove('list__button_state_play');
      };
    }
    this.listNode = this.getListNode();
  }

  getTarget() {
    const randomIndex = Math.floor(Math.random() * this.data.length);
    this.target = this.data[randomIndex];

    return this;
  }

  start() {
    this.isComplete = false;
    this.score = this.maxScore;
    this.getTarget();
    if (document.querySelector('.description').querySelector('audio')) {
      document
        .querySelector('.description')
        .querySelector('audio').src = `./sounds/birds/${this.target.audio}`;
    } else {
      const audioElement = new Audio(`./sounds/birds/${this.target.audio}`);
      audioElement.className = 'description__audio';
      audioElement.controls = true;
      audioElement.onplay = () => this.onAudioPlay(audioElement);
      document.querySelector('.description').append(audioElement);
    }
    document.querySelector('.list').replaceWith(this.listNode);
  }

  checkResult(id) {
    if (this.target.id === id) {
      this.complete();

      return true;
    }
    if (this.score !== 0) this.score -= 1;

    return false;
  }

  getLevelState() {
    return this.isComplete ? 'complete' : 'process';
  }

  complete() {
    this.isComplete = true;
    document.querySelector('.description').classList.add('description_active');
    document.querySelector('.description').querySelector('h3').textContent = this.target.name;
    document.querySelector('.description__img').src = `./images/birds/${this.target.image}`;
    this.onComplete(this.score);
  }

  getListNode() {
    const element = document.createElement('article');
    element.className = 'list';
    element.setAttribute('aria-label', 'list of response options');
    const tablistButtons = this.data.reduce((str, {id, name}) => {
      str =
        str +
        `<button id='tab-${id}' role='tab' class='list__button' type='button' data-id='${id}'\
         aria-selected='false' aria-controls='tabpanel-${id}'>${name}</button>`;

      return str;
    }, '');
    const tabpanel = this.data.reduce((str, {id, name, species, description, image}) => {
      str =
        str +
        `<div id="tabpanel-${id}" role='tabpanel' aria-labelledby='tab-${id}' class='tabpanel' hidden>\
        <h4 class='tabpanel__name'>${name}</h4>\
        <img src='./images/birds/${image}' class='tabpanel__img' data-id='${
          id + name
        }' alt='${name}'/>\
        <p class='tabpanel__species'>${species}</p>\
        <p>${description}</p>\
        </div>`;

      return str;
    }, `<div class='tabpanel tabpanel_type_preview'><p class='tabpanel__default'>Послушайте плеер. Выберите птицу из списка</p></div>`);

    element.innerHTML = `<div role="tablist" class='tablist'>${tablistButtons}</div>${tabpanel}`;
    this.data.forEach(({id, audioElement}) => {
      element.querySelector(`#tabpanel-${id}`).append(audioElement);
    });

    return element;
  }
}

export default Level;
