
export interface AlmanacObject {
    Name: string;
    Data: any[] | any;
}

export class Almanac {

    Facts: AlmanacObject[];

    constructor() {
        this.Facts = [];
    }

    public addFact(name: string, data: any[] | any): void {
        this.Facts.push({ Name: name, Data: data });
    }

    public getFact(name: string): any[] | any | undefined {
        var fact = this.Facts.find(x => x.Name === name);
        if (fact) {
            return fact.Data;
        }
        return undefined;
    }

}
