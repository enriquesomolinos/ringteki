const _ = require('underscore');
const Phase = require('./phase.js');
const SimpleStep = require('./simplestep.js');
const MulliganDynastyPrompt = require('./setup/mulligandynastyprompt.js');
const MulliganConflictPrompt = require('./setup/mulliganconflictprompt.js');
const SetupProvincesPrompt = require('./setup/setupprovincesprompt.js');
const { Locations } = require('../Constants');

class SetupPhase extends Phase {
    constructor(game) {
        super(game, 'setup');
        this.initialise([
            new SimpleStep(game, () => this.setupBegin()),
            new SimpleStep(game, () => this.chooseFirstPlayer()),
            new SimpleStep(game, () => this.attachStronghold()),
            new SetupProvincesPrompt(game),
            new SimpleStep(game, () => this.fillProvinces()),
            new MulliganDynastyPrompt(game),
            new SimpleStep(game, () => this.drawStartingHands()),
            new MulliganConflictPrompt(game),
            new SimpleStep(game, () => this.startGame())
        ]);
    }

    startPhase() {
        // Don't raise any events without a determined first player
        this.game.currentPhase = this.name;
    }

    setupBegin() {
        let allPlayersShuffled = _.shuffle(this.game.getPlayers());

        let firstPlayer = allPlayersShuffled.shift();
        firstPlayer.firstPlayer = true;
    }

    chooseFirstPlayer() {
        let firstPlayer = this.game.getFirstPlayer();
        if(firstPlayer.opponent) {
            this.game.promptWithHandlerMenu(firstPlayer, {
                activePromptTitle: 'You won the flip. Do you want to be:',
                source: 'Choose First Player',
                choices: ['First Player', 'Second Player'],
                handlers: [
                    () => {},
                    () => {
                        this.game.setFirstPlayer(firstPlayer.opponent);
                    }
                ]
            });
        }
    }

    attachStronghold() {
        _.each(this.game.getPlayers(), player => {
            player.moveCard(player.stronghold, Locations.StrongholdProvince);
            if(player.role) {
                player.role.moveTo(Locations.Role);
            }
        });
    }

    fillProvinces() {
        _.each(this.game.getPlayers(), player => {
            for(let province of [Locations.ProvinceOne, Locations.ProvinceTwo, Locations.ProvinceThree, Locations.ProvinceFour]) {
                let card = player.dynastyDeck.first();
                if(card) {
                    player.moveCard(card, province);
                    card.facedown = false;
                }
            }
        });
        this.game.allCards.each(card => {
            card.applyAnyLocationPersistentEffects();
        });
    }

    drawStartingHands() {
        _.each(this.game.getPlayers(), player => player.drawCardsToHand(4));
    }

    startGame() {
        _.each(this.game.getPlayers(), player => {
            player.honor = player.stronghold.cardData.honor;
            player.readyToStart = true;
        });
    }
}

module.exports = SetupPhase;
