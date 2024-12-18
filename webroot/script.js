/* class App {
  constructor() {
    const output = document.querySelector('#messageOutput');
    const increaseButton = document.querySelector('#btn-increase');
    const decreaseButton = document.querySelector('#btn-decrease');
    const usernameLabel = document.querySelector('#username');
    const counterLabel = document.querySelector('#counter');
    var counter = 0;

    // When the Devvit app sends a message with `context.ui.webView.postMessage`, this will be triggered
    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;

      // Reserved type for messages sent via `context.ui.webView.postMessage`
      if (type === 'devvit-message') {
        const { message } = data;

        // Always output full message
        output.replaceChildren(JSON.stringify(message, undefined, 2));

        // Load initial data
        if (message.type === 'initialData') {
          const { username, currentCounter } = message.data;
          usernameLabel.innerText = username;
          counterLabel.innerText = counter = currentCounter;
        }

        // Update counter
        if (message.type === 'updateCounter') {
          const { currentCounter } = message.data;
          counterLabel.innerText = counter = currentCounter;
        }
      }
    });

    increaseButton.addEventListener('click', () => {
      // Sends a message to the Devvit app
      window.parent?.postMessage(
        { type: 'setCounter', data: { newCounter: Number(counter + 1) } },
        '*'
      );
    });

    decreaseButton.addEventListener('click', () => {
      // Sends a message to the Devvit app
      window.parent?.postMessage(
        { type: 'setCounter', data: { newCounter: Number(counter - 1) } },
        '*'
      );
    });
  }
}

new App();
 */

class App {
  constructor() {
    // DOM Elements
    this.prologueSection = document.querySelector('#prologue');
    this.gameplaySection = document.querySelector('#gameplay');
    this.epilogueSection = document.querySelector('#epilogue');
    this.output = document.querySelector('#messageOutput');
    this.usernameLabel = document.querySelector('#username');
    this.counterLabel = document.querySelector('#counter');
    this.canvas = document.querySelector('#game-canvas');
    this.increaseButton = document.querySelector('#btn-increase');
    this.decreaseButton = document.querySelector('#btn-decrease');
    this.startGameButton = document.querySelector('#btn-start-game');
    this.finishGameButton = document.querySelector('#btn-finish-game');
    this.retryGameButton = document.querySelector('#btn-retry-game');

    this.counter = 0;

    // Initialize events
    this.addEventListeners();
    this.initializeGame();
  }

  addEventListeners() {
    // Listen for messages from Devvit
    window.addEventListener('message', (ev) => {
      const { type, data } = ev.data;

      if (type === 'devvit-message') {
        const { message } = data;

        // Always output the full message
        this.output.replaceChildren(JSON.stringify(message, undefined, 2));

        // Handle initial data
        if (message.type === 'initialData') {
          const { username, currentCounter } = message.data;
          this.usernameLabel.innerText = username;
          this.counterLabel.innerText = this.counter = currentCounter;
        }

        // Handle counter updates
        if (message.type === 'updateCounter') {
          const { currentCounter } = message.data;
          this.counterLabel.innerText = this.counter = currentCounter;
        }
      }
    });

    // Counter buttons
    this.increaseButton.addEventListener('click', () => {
      this.updateCounter(1);
    });

    this.decreaseButton.addEventListener('click', () => {
      this.updateCounter(-1);
    });

    // Start game
    this.startGameButton.addEventListener('click', () => {
      this.transitionToSection(this.gameplaySection);
    });

    // Finish game
    this.finishGameButton.addEventListener('click', () => {
      this.showEpilogue();
    });

    // Retry game
    this.retryGameButton.addEventListener('click', () => {
      this.resetGame();
    });
  }

  initializeGame() {
    // Show the prologue by default
    this.transitionToSection(this.prologueSection);
  }

  transitionToSection(section) {
    // Hide all sections
    [this.prologueSection, this.gameplaySection, this.epilogueSection].forEach((sec) => {
      sec.classList.remove('active');
    });

    // Show the selected section
    section.classList.add('active');
  }

  updateCounter(delta) {
    this.counter += delta;
    this.counterLabel.innerText = this.counter;

    // Send updated counter to Devvit app
    window.parent?.postMessage(
      { type: 'setCounter', data: { newCounter: this.counter } },
      '*'
    );
  }

  showEpilogue() {
    // Generate epilogue message based on the counter
    const epilogueMessage = this.counter > 0
      ? 'You successfully repaired the Dreamweaver threads and brought harmony to the dream world!'
      : 'The Dreamweaver threads remain fragile. Perhaps another attempt will succeed.';

    // Update epilogue text
    this.epilogueSection.querySelector('#epilogue-message').innerText = epilogueMessage;

    // Transition to epilogue
    this.transitionToSection(this.epilogueSection);
  }

  resetGame() {
    this.counter = 0;
    this.counterLabel.innerText = this.counter;

    // Reset game state and transition to prologue
    this.transitionToSection(this.prologueSection);
  }
}

new App();
