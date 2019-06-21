/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/IResource.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/IQuantity.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/IProducer.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/ITrigger.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/ICrafter.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/interfaces/IPlayer.ts" />
/// <reference path="incrementum-ludus/IncrementumLudus/IncrementumLudus.ts" />
/// <reference path="./ICategorized.ts" />

class CategorizedItem extends Resource implements ICategorized {
    public $type : string = 'CategorizedItem';
    constructor(public name : string, public image : string, public category : string, public description : string){
        super(name);
    }
    public static load(data : any) : CategorizedItem {
        let r : CategorizedItem = new CategorizedItem(data.name, data.image, data.category, data.description);
        return r;
    }
    public show(quantity : number) : string {
        return "" + quantity;
    }
}
