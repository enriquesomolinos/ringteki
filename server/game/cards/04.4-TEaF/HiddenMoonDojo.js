const DrawCard = require('../../drawcard.js');
const PlayCharacterAction = require('../../playcharacteraction.js');
const _ = require('underscore');
const { Locations, Players } = require('../../Constants');

class HiddenMoonDojoPlayAction extends PlayCharacterAction {
    meetsRequirements(context, ignoredRequirements = []) {
        return super.meetsRequirements(context, _.uniq(ignoredRequirements.concat('location')));
    }
}

class HiddenMoonDojo extends DrawCard {
    setupCardAbilities(ability) {
        this.persistentEffect({
            targetLocation: Locations.Provinces,
            match: (card, context) => card.isDynasty && !card.facedown && context.player.areLocationsAdjacent(context.source.location, card.location),
            effect: ability.effects.gainPlayAction(HiddenMoonDojoPlayAction)
        });

        this.action({
            title: 'Turn an adjacent card face up',
            condition: () => this.game.isDuringConflict(),
            gameAction: ability.actions.flipDynasty({
                promptForSelect: {
                    location: Locations.Provinces,
                    controller: Players.Self,
                    cardCondition: (card, context) => context.player.areLocationsAdjacent(context.source.location, card.location)
                }
            })
        });
    }
}

HiddenMoonDojo.id = 'hidden-moon-dojo';

module.exports = HiddenMoonDojo;
