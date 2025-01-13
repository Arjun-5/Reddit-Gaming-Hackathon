var ScreenTransition = pc.createScript("screenTransition");
ScreenTransition.attributes.add("logoScreen", { type: "entity" }),
  ScreenTransition.attributes.add("menuScreen", { type: "entity" }),
  (ScreenTransition.prototype.initialize = async function () {
    (this.logoScreen.enabled = !0),
      (this.menuScreen.enabled = !1),
      this.setOpacity(this.logoScreen, 0),
      this.setOpacity(this.menuScreen, 0),
      await this.fadeIn(this.logoScreen),
      await this.wait(3),
      await this.fadeOut(this.logoScreen),
      (this.menuScreen.enabled = !0),
      this.setOpacity(this.menuScreen, 0),
      await this.fadeIn(this.menuScreen);
  }),
  (ScreenTransition.prototype.setOpacity = function (e, t) {
    e.findComponents("element").forEach((e) => {
      e.opacity = t;
    });
  }),
  (ScreenTransition.prototype.fadeIn = function (e) {
    return new Promise((t) => {
      this.setOpacity(e, 0);
      var n = 0,
        i = this.app.on("update", (a) => {
          n += a;
          var r = Math.min(n / 1, 1),
            s = r;
          this.setOpacity(e, s), 1 === r && (this.app.off("update", i), t());
        });
    });
  }),
  (ScreenTransition.prototype.fadeOut = function (e) {
    return new Promise((t) => {
      this.setOpacity(e, 1);
      var n = 0,
        i = this.app.on("update", (a) => {
          n += a;
          var r = Math.min(n / 1, 1),
            s = 1 - r;
          this.setOpacity(e, s),
            1 === r && (this.app.off("update", i), (e.enabled = !1), t());
        });
    });
  }),
  (ScreenTransition.prototype.wait = function (e) {
    return new Promise((t) => {
      setTimeout(t, 1e3 * e);
    });
  });
var InstantiateCoins = pc.createScript("instantiateCoins");
InstantiateCoins.attributes.add("spawnLocations", {
  title: "Spawn Locations",
  type: "entity",
  array: !0,
}),
  InstantiateCoins.attributes.add("maxCoinsPerHole", {
    title: "Max Coins per Hole",
    type: "number",
    default: 5,
  }),
  InstantiateCoins.attributes.add("holeCount", {
    title: "Hole Count",
    type: "number",
    default: 2,
  }),
  InstantiateCoins.attributes.add("delayTimer", {
    title: "Delay Timer (ms)",
    type: "number",
    default: 3e3,
  }),
  InstantiateCoins.attributes.add("coins", {
    title: "Preloaded Coins",
    type: "entity",
    array: !0,
  }),
  InstantiateCoins.attributes.add("coinsCountUI", {
    title: "Coins Count UI",
    type: "entity",
  }),
  InstantiateCoins.attributes.add("particleEffects", {
    title: "Particle Effectss",
    type: "entity",
    array: !0,
  }),
  (InstantiateCoins.prototype.initialize = function () {
    this.spawnLocations.length === this.holeCount
      ? this.coins.length < this.maxCoinsPerHole * this.holeCount
        ? console.error("Not enough preloaded coins to distribute.")
        : (this.cleanupCoins(), this.distributeCoins())
      : console.error(
          "The number of spawn locations does not match the expected hole count.",
        );
  }),
  (InstantiateCoins.prototype.distributeCoins = async function () {
    let t = 0;
    for (let n = 0; n < this.spawnLocations.length; n++) {
      const e = this.spawnLocations[n];
      for (let n = 0; n < this.maxCoinsPerHole; n++) {
        if (t >= this.coins.length)
          return void console.warn("Ran out of coins while distributing.");
        const n = this.coins[t];
        n.enabled = !0;
        const i = e.getPosition();
        n.rigidbody.teleport(i.x, i.y + 1, i.z), t++;
      }
      console.log(`Distributed ${this.maxCoinsPerHole} coins to ${e.name}`);
    }
    (this.coinsCountUI.enabled = !0), await this.playInstantiationSound();
    for (let t of this.particleEffects) t.enabled = !0;
  }),
  (InstantiateCoins.prototype.playInstantiationSound = async function () {
    this.entity.sound &&
      (this.entity.sound.play("seaShell"),
      await this.delay(1e3),
      this.entity.sound.stop("seaShell"));
  }),
  (InstantiateCoins.prototype.cleanupCoins = function () {
    this.coins.forEach((t) => {
      t.enabled = !1;
    }),
      console.log("All coins hidden.");
  }),
  (InstantiateCoins.prototype.delay = function (t) {
    return new Promise((n) => setTimeout(n, t));
  }),
  (InstantiateCoins.prototype.update = function (t) {});
var UserAction = pc.createScript("userAction");
(UserAction.prototype.initialize = function () {}),
  (UserAction.prototype.update = function (t) {});
var GameTurnManager = pc.createScript("gameTurnManager");
GameTurnManager.attributes.add("playerHoles", { type: "entity", array: !0 }),
  GameTurnManager.attributes.add("aiHoles", { type: "entity", array: !0 }),
  GameTurnManager.attributes.add("allHoles", { type: "entity", array: !0 }),
  GameTurnManager.attributes.add("cameraEntity", { type: "entity" }),
  GameTurnManager.attributes.add("holeTextElements", {
    type: "entity",
    array: !0,
  }),
  GameTurnManager.attributes.add("playerPocket", { type: "entity" }),
  GameTurnManager.attributes.add("aiPocket", { type: "entity" }),
  GameTurnManager.attributes.add("specialEffectManager", { type: "entity" }),
  GameTurnManager.attributes.add("playerScoreText", { type: "entity" }),
  GameTurnManager.attributes.add("aiScoreText", { type: "entity" }),
  GameTurnManager.attributes.add("playerTurnIndicator", { type: "entity" }),
  GameTurnManager.attributes.add("aiTurnIndicator", { type: "entity" }),
  GameTurnManager.attributes.add("gameOverPlayerScoreText", { type: "entity" }),
  GameTurnManager.attributes.add("gameOveraiScoreText", { type: "entity" }),
  GameTurnManager.attributes.add("gameOverText", { type: "entity" }),
  GameTurnManager.attributes.add("gameOverUI", { type: "entity" }),
  GameTurnManager.attributes.add("userControlUI", { type: "entity" }),
  (GameTurnManager.prototype.initialize = function () {
    (this.currentTurn = "player"),
      (this.isMovingCoins = !1),
      (this.playerPocketedCoins = 0),
      (this.aiPocketedCoins = 0),
      (this.isFirstAITurn = !0),
      this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this),
      this.on("destroy", function () {
        this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
      }),
      console.log("Game initialized. Player's turn starts.");
  }),
  (GameTurnManager.prototype.onMouseDown = async function (e) {
    if (!this.isMovingCoins && "player" === this.currentTurn) {
      var t = this.cameraEntity.getPosition(),
        n = this.cameraEntity.camera.screenToWorld(
          e.x,
          e.y,
          this.cameraEntity.camera.farClip,
        ),
        r = this.app.systems.rigidbody.raycastFirst(t, n);
      if (r && this.playerHoles.includes(r.entity)) {
        var i = r.entity;
        console.log(`Player clicked on hole: ${i.name}`),
          await this.moveCoins(i),
          this.checkAndPocketCoins(),
          this.endTurn();
      }
    }
  }),
  (GameTurnManager.prototype.moveCoins = async function (e) {
    this.isMovingCoins = !0;
    var t = [...e.script.coinTrigger.getCoinsInTrigger()];
    if (0 === t.length)
      return console.log("No coins to move."), void (this.isMovingCoins = !1);
    let n = this.allHoles.indexOf(e);
    const r = this.allHoles.length;
    for (let i = 0; i < t.length; i++) {
      n = (n + 1) % r;
      let a = this.allHoles[n];
      this.teleportCoin(t[i], a),
        await this.delay(600),
        this.updateHoleCount(
          e,
          this.holeTextElements[this.allHoles.indexOf(e)],
        ),
        this.updateHoleCount(a, this.holeTextElements[n]);
    }
    (this.lastHole = this.allHoles[n]), (this.isMovingCoins = !1);
  }),
  (GameTurnManager.prototype.teleportCoin = function (e, t) {
    var n = t.getPosition();
    e.rigidbody.teleport(n);
  }),
  (GameTurnManager.prototype.checkAndPocketCoins = function () {
    const e = this.allHoles.length;
    let t = (this.allHoles.indexOf(this.lastHole) + 1) % e;
    if (0 === this.allHoles[t].script.coinTrigger.getCoinsInTrigger().length) {
      let n = this.allHoles[(t + 1) % e],
        r = n.script.coinTrigger.getCoinsInTrigger();
      if (r.length > 0) {
        let e =
            "player" === this.currentTurn ? this.playerPocket : this.aiPocket,
          t = [],
          i = 0;
        r.forEach((n) => {
          n.rigidbody.teleport(e.getPosition()),
            "none" !== n.script.coinEffect.effectType ? t.push(n) : i++;
        }),
          n.script.coinTrigger.clearCoins(),
          this.updateHoleCount(
            n,
            this.holeTextElements[this.allHoles.indexOf(n)],
          ),
          t.length > 0 && this.triggerSpecialEffects(t),
          "player" === this.currentTurn
            ? ((this.playerPocketedCoins += i),
              console.log(`Player pocketed ${i} normal coin(s), +${i} points`),
              this.updateScoreDisplay())
            : ((this.aiPocketedCoins += i),
              console.log(`AI pocketed ${i} normal coin(s), +${i} points`),
              this.updateScoreDisplay());
      }
    }
  }),
  (GameTurnManager.prototype.triggerSpecialEffects = function (e) {
    let t = { radiant: 0, shadow: 0, fortune: 0, cursed: 0, elemental: 0 };
    e.forEach((e) => {
      let n = e.script.coinEffect.effectType;
      "radiant" === n
        ? (t.radiant += 1)
        : "shadow" === n
          ? (t.shadow += 1)
          : "fortune" === n
            ? (t.fortune += 1)
            : "cursed" === n
              ? (t.cursed += 1)
              : "elemental" === n && (t.elemental += 1);
    }),
      "player" === this.currentTurn
        ? ((this.playerPocketedCoins +=
            5 * t.radiant + 10 * t.fortune - 3 * t.shadow - 5 * t.cursed),
          console.log(
            `Player pocketed: +${5 * t.radiant} points (Radiant), +${10 * t.fortune} points (Fortune), -${3 * t.shadow} points (Shadow), -${5 * t.cursed} points (Cursed)`,
          ),
          this.updateScoreDisplay())
        : ((this.aiPocketedCoins +=
            5 * t.radiant + 10 * t.fortune - 3 * t.shadow - 5 * t.cursed),
          console.log(
            `AI pocketed: +${5 * t.radiant} points (Radiant), +${10 * t.fortune} points (Fortune), -${3 * t.shadow} points (Shadow), -${5 * t.cursed} points (Cursed)`,
          ),
          this.updateScoreDisplay()),
      console.log("Total Points:", t);
  }),
  (GameTurnManager.prototype.updateHoleCount = function (e, t) {
    var n = e.script.coinTrigger.getCoinsInTrigger();
    t.element.text = n.length.toString();
  }),
  (GameTurnManager.prototype.updateScoreDisplay = function () {
    (this.playerScoreText.element.text = this.playerPocketedCoins.toString()),
      (this.aiScoreText.element.text = this.aiPocketedCoins.toString()),
      (this.gameOverPlayerScoreText.element.text =
        this.playerPocketedCoins.toString()),
      (this.gameOveraiScoreText.element.text = this.aiPocketedCoins.toString());
  }),
  (GameTurnManager.prototype.endTurn = async function () {
    "player" === this.currentTurn
      ? ((this.currentTurn = "ai"),
        (this.playerTurnIndicator.element.color = new pc.Color(1, 0, 0)),
        (this.playerTurnIndicator.element.text = "You"),
        (this.aiTurnIndicator.element.color = new pc.Color(0, 1, 0)),
        (this.aiTurnIndicator.element.text = "Opponent"),
        console.log("AI's turn starts."),
        await this.delay(2e3),
        await this.aiTurn())
      : ((this.currentTurn = "player"),
        (this.aiTurnIndicator.element.color = new pc.Color(1, 0, 0)),
        (this.aiTurnIndicator.element.text = "Opponent"),
        (this.playerTurnIndicator.element.color = new pc.Color(0, 1, 0)),
        (this.playerTurnIndicator.element.text = "You"),
        console.log("Player's turn starts.")),
      this.checkForGameOver();
  }),
  (GameTurnManager.prototype.checkForGameOver = function () {
    let e = 0;
    this.allHoles.forEach((t) => {
      e += t.script.coinTrigger.getCoinsInTrigger().length;
    }),
      1 === e && this.endGame();
  }),
  (GameTurnManager.prototype.endGame = function () {
    let e =
      this.playerPocketedCoins > this.aiPocketedCoins ? "You" : "Opponent";
    (this.gameOverText.element.text = `${e} Won!`),
      (this.userControlUI.enabled = !1),
      (this.gameOverUI.enabled = !0);
  }),
  (GameTurnManager.prototype.aiTurn = async function () {
    var e = this.aiHoles.filter(
      (e) => e.script.coinTrigger.getCoinsInTrigger().length > 0,
    );
    if (this.isFirstAITurn) {
      let t = e[Math.floor(Math.random() * e.length)];
      console.log(`AI selected random hole: ${t.name}`),
        (this.isFirstAITurn = !1),
        await this.moveCoins(t);
    } else {
      let t = this.findBestAIHole(e);
      console.log(`AI selected best hole: ${t.name}`), await this.moveCoins(t);
    }
    this.checkAndPocketCoins(), this.endTurn();
  }),
  (GameTurnManager.prototype.findBestAIHole = function (e) {
    let t = null,
      n = -1;
    return (
      e.forEach((e) => {
        let r = this.simulateMove(e);
        r > n && ((n = r), (t = e));
      }),
      t
    );
  }),
  (GameTurnManager.prototype.simulateMove = function (e) {
    const t = this.allHoles.length;
    let n = e.script.coinTrigger.getCoinsInTrigger().length,
      r = this.allHoles.indexOf(e);
    for (let e = 0; e < n; e++) r = (r + 1) % t;
    return this.allHoles[(r + 2) % t].script.coinTrigger.getCoinsInTrigger()
      .length;
  }),
  (GameTurnManager.prototype.delay = function (e) {
    return new Promise((t) => setTimeout(t, e));
  });
var CoinTrigger = pc.createScript("coinTrigger");
CoinTrigger.attributes.add("queryRadius", {
  title: "Query Radius",
  type: "number",
  default: 0.55,
}),
  (CoinTrigger.prototype.initialize = function () {
    this.coinsInTrigger = [];
  }),
  (CoinTrigger.prototype.update = function (i) {
    var r = this.entity.getPosition(),
      t = this.app.root.findByTag("coin");
    this.coinsInTrigger = [];
    for (var n = 0; n < t.length; n++) {
      var e = t[n],
        o = e.getPosition();
      r.distance(o) <= this.queryRadius && this.coinsInTrigger.push(e);
    }
  }),
  (CoinTrigger.prototype.getCoinsInTrigger = function () {
    return this.coinsInTrigger;
  }),
  (CoinTrigger.prototype.clearCoins = function () {
    this.coinsInTrigger = [];
  });
var SpecialEffectManager = pc.createScript("specialEffectManager");
SpecialEffectManager.attributes.add("gameTurnManager", { type: "entity" }),
  (SpecialEffectManager.prototype.initialize = function () {
    console.log("SpecialEffectManager initialized");
  }),
  (SpecialEffectManager.prototype.handleSpecialEffects = function (e, a) {
    console.log(`Handling special effects for ${a}:`, e);
    const t = { steal: !1, fire: !1, swap: !1, freeze: !1, double: !1 };
    for (let a of e) {
      let e = a.script.coinEffect.effectType;
      console.log("Effect type: " + e),
        e === EffectType.FIRE
          ? (t.fire = !0)
          : e === EffectType.STEAL
            ? (t.steal = !0)
            : e === EffectType.SWAP
              ? (t.swap = !0)
              : e === EffectType.FREEZE
                ? (t.freeze = !0)
                : e === EffectType.DOUBLE && (t.double = !0);
    }
    t.steal
      ? this.applyStealEffect(a)
      : t.fire
        ? this.applyFireEffect(a)
        : (t.swap && this.applySwapEffect(a),
          t.freeze && this.applyFreezeEffect(a, 2),
          t.double && this.applyDoubleEffect(a));
  }),
  (SpecialEffectManager.prototype.applyFireEffect = function (e) {
    if (
      (console.log(`${e} triggered "Fire" effect! Burning opponent's coins.`),
      "player" === e)
    ) {
      let e = this.gameTurnManager.aiPocketedCoins;
      (this.gameTurnManager.aiPocketedCoins = 0),
        console.log(`AI lost all coins due to Fire effect. Burned: ${e}.`);
    } else if ("ai" === e) {
      let e = this.gameTurnManager.playerPocketedCoins;
      (this.gameTurnManager.playerPocketedCoins = 0),
        console.log(`Player lost all coins due to Fire effect. Burned: ${e}.`);
    }
  }),
  (SpecialEffectManager.prototype.applyFreezeEffect = function (e, a) {
    console.log(`${e} triggered "Freeze" effect! Opponent loses ${a} turns.`),
      "player" === e
        ? ((this.gameTurnManager.freezeAiTurns = a),
          console.log(`AI's turns are frozen for ${a} rounds.`))
        : "ai" === e &&
          ((this.gameTurnManager.freezePlayerTurns = a),
          console.log(`Player's turns are frozen for ${a} rounds.`));
  }),
  (SpecialEffectManager.prototype.applyDoubleEffect = function (e) {
    console.log(
      `${e} triggered "Double Points" effect! Doubling pocketed coins.`,
    ),
      "player" === e
        ? (this.gameTurnManager.playerPocketedCoins *= 2)
        : "ai" === e && (this.gameTurnManager.aiPocketedCoins *= 2);
  }),
  (SpecialEffectManager.prototype.applyStealEffect = function (e) {
    if (
      (console.log(
        `${e} triggered "Steal" effect! Stealing all coins from the opponent.`,
      ),
      "player" === e)
    ) {
      let e = this.gameTurnManager.aiPocketedCoins;
      (this.gameTurnManager.aiPocketedCoins = 0),
        (this.gameTurnManager.playerPocketedCoins += e),
        console.log(`Player stole ${e} coins from AI.`);
    } else if ("ai" === e) {
      let e = this.gameTurnManager.playerPocketedCoins;
      (this.gameTurnManager.playerPocketedCoins = 0),
        (this.gameTurnManager.aiPocketedCoins += e),
        console.log(`AI stole ${e} coins from Player.`);
    }
  }),
  (SpecialEffectManager.prototype.applySwapEffect = function (e) {
    console.log(`${e} triggered "Swap" effect! Swapping pocketed coins.`);
    let a = this.gameTurnManager.playerPocketedCoins;
    (this.gameTurnManager.playerPocketedCoins =
      this.gameTurnManager.aiPocketedCoins),
      (this.gameTurnManager.aiPocketedCoins = a),
      console.log("Player and AI swapped pocketed coins.");
  });
var CoinEffect = pc.createScript("coinEffect"),
  EffectType = {
    NONE: "none",
    FIRE: "fire",
    FREEZE: "freeze",
    SWAP: "swap",
    STEAL: "steal",
    DOUBLE: "double",
  };
CoinEffect.attributes.add("effectType", {
  type: "string",
  default: EffectType.NONE,
  title: "Coin Effect Type",
  description: "The special effect associated with this coin.",
}),
  (CoinEffect.prototype.initialize = function () {
    console.log("CoinEffect initialized with effect type:", this.effectType);
  });
var UserControlButtonAction = pc.createScript("userControlButtonAction");
UserControlButtonAction.attributes.add("buttonEntity", { type: "entity" }),
  UserControlButtonAction.attributes.add("entitiesToEnable", {
    type: "entity",
    array: !0,
  }),
  UserControlButtonAction.attributes.add("entitiesToDisable", {
    type: "entity",
    array: !0,
  }),
  (UserControlButtonAction.prototype.initialize = function () {
    this.buttonEntity.button.on("click", this.onButtonClick, this);
  }),
  (UserControlButtonAction.prototype.onButtonClick = function () {
    console.log(`Button clicked: ${this.buttonEntity.name}`),
      this.handleButtonClick();
  }),
  (UserControlButtonAction.prototype.handleButtonClick = function () {
    this.enableEntities(this.entitiesToEnable),
      this.disableEntities(this.entitiesToDisable);
  }),
  (UserControlButtonAction.prototype.enableEntities = function (t) {
    t.forEach((t) => {
      t && ((t.enabled = !0), console.log(`Enabled entity: ${t.name}`));
    });
  }),
  (UserControlButtonAction.prototype.disableEntities = function (t) {
    t.forEach((t) => {
      t && ((t.enabled = !1), console.log(`Disabled entity: ${t.name}`));
    });
  });
var UiPanelCloseAction = pc.createScript("uiPanelCloseAction");
UiPanelCloseAction.attributes.add("buttonEntity", { type: "entity" }),
  UiPanelCloseAction.attributes.add("entitiesToEnable", {
    type: "entity",
    array: !0,
  }),
  UiPanelCloseAction.attributes.add("entitiesToDisable", {
    type: "entity",
    array: !0,
  }),
  (UiPanelCloseAction.prototype.initialize = function () {
    this.buttonEntity.button.on("click", this.onButtonClick, this);
  }),
  (UiPanelCloseAction.prototype.onButtonClick = function () {
    console.log(`Button clicked: ${this.buttonEntity.name}`),
      this.handleButtonClick();
  }),
  (UiPanelCloseAction.prototype.handleButtonClick = function () {
    this.enableEntities(this.entitiesToEnable),
      this.disableEntities(this.entitiesToDisable);
  }),
  (UiPanelCloseAction.prototype.enableEntities = function (t) {
    t.forEach((t) => {
      t && ((t.enabled = !0), console.log(`Enabled entity: ${t.name}`));
    });
  }),
  (UiPanelCloseAction.prototype.disableEntities = function (t) {
    t.forEach((t) => {
      t && ((t.enabled = !1), console.log(`Disabled entity: ${t.name}`));
    });
  });
