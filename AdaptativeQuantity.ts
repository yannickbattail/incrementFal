/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/IResource.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/IQuantity.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/IProducer.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/ITrigger.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/ICrafter.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/IPlayer.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/IncrementumLudus.ts" />

class AdaptativeQuantity implements IQuantity {
    $type : string = 'AdaptativeQuantity';
    protected quantityIfYes: Quantity = EMPTY_QUANTITY;
    protected quantityIfNot: Quantity = EMPTY_QUANTITY;
    protected quantityStep: Quantity = EMPTY_QUANTITY;
    protected showQuantityIfNot: boolean = true;

    constructor() {
    }

    public static load(data : any) : AdaptativeQuantity {
        let curContext : any = window;
        let rq : AdaptativeQuantity = new AdaptativeQuantity();
        rq.quantityIfYes = curContext[data.quantityIfYes.$type].load(data.quantityIfYes);
        rq.quantityIfNot = curContext[data.quantityIfNot.$type].load(data.quantityIfNot);
        rq.quantityStep = curContext[data.quantityStep.$type].load(data.quantityStep);
        rq.showQuantityIfNot = data.showQuantityIfNot;
        return rq;
    }
    private getVariableQuanity() : Quantity {
        let e : IncrementumLudus = engine;
        if (e.player.hasResources([this.quantityStep])) {
            return this.quantityIfYes;
        }
        return this.quantityIfNot;
    }
    getQuantity() : number {
        return this.getVariableQuanity().getQuantity();
    }
    getResource() : IResource{
        return this.getVariableQuanity().getResource();
    }
    show() : string {
        return this.getResource().show(this.getQuantity());
        /*
        if (this.showQuantityIfNot) {
            return this.quantityIfNot.getResource().show(this.quantityIfNot.getQuantity());
        }
        return this.quantityIfYes.getResource().show(this.quantityIfYes.getQuantity());
        */
    }

    getDetails() : string {
        return '<div class="chanceOf">mais pas toujours</div>';
    }

    // builder methods
    ifHas(quantityStep : Quantity) : AdaptativeQuantity {
        this.quantityStep = quantityStep;
        return this;
    }

    give(quantityIfYes : Quantity) : AdaptativeQuantity {
        this.quantityIfYes = quantityIfYes;
        return this;
    }
    
    elseGive(quantityIfNot : Quantity) : AdaptativeQuantity {
        this.quantityIfNot = quantityIfNot;
        return this;
    }
    showTheQuantityIfNot() {
        this.showQuantityIfNot = true;
        return this;
    }

}