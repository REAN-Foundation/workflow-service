import { uuid } from "../../domain.types/miscellaneous/system.types";
import { SchemaInstanceService } from "../../database/services/engine/schema.instance.service";

////////////////////////////////////////////////////////////////

export interface AlmanacObject {
    Name: string;
    Data: any[] | any;
}

////////////////////////////////////////////////////////////////

export class Almanac {

    _schemaInstanceService: SchemaInstanceService = new SchemaInstanceService();

    Facts: AlmanacObject[];

    _schemaInstanceId: uuid = null;

    private constructor(schemaInstanceId: uuid, facts: AlmanacObject[] = []) {
        this._schemaInstanceId = schemaInstanceId;
        this.Facts = facts;
    }

    public static async getAlmanac(schemaInstanceId: uuid): Promise<Almanac> {
        var facts = await this.getAlmanacObjects(schemaInstanceId);
        if (!facts) {
            facts = [];
        }
        return new Almanac(schemaInstanceId, facts);
    }

    updateOrInsert(arr, name, newData) {
        const index = arr.findIndex(obj => obj.Name === name);
        if (index !== -1) {
            arr[index].Data = newData; // Update existing
        } else {
            arr.push({ Name: name, Data: newData }); // Insert new
        }
    }

    public async addFact(name: string, data: any[] | any): Promise<boolean> {
        await this.load();
        const index = this.Facts.findIndex(x => x.Name === name);
        if (index !== -1) {
            this.Facts[index].Data = data; // Update existing
        }
        else {
            this.Facts.push({ Name: name, Data: data }); // Insert new
        }
        await this.save();
        return true;
    }

    public async getFact(name: string): Promise<any[] | any | undefined> {
        await this.load();
        var fact = this.Facts.find(x => x.Name === name);
        if (fact) {
            return fact.Data;
        }
        return undefined;
    }

    private async save(): Promise<void> {
        await this._schemaInstanceService.updateAlmanacObjects(this._schemaInstanceId, this.Facts);
    }

    private async load(): Promise<void> {
        var almanacObjects = await this._schemaInstanceService.getAlmanacObjects(this._schemaInstanceId);
        if (almanacObjects) {
            this.Facts = almanacObjects;
        }
    }

    public static async getAlmanacObjects(schemaInstanceId: uuid): Promise<AlmanacObject[]> {
        var schemaInstanceService = new SchemaInstanceService();
        var almanacObjects = await schemaInstanceService.getAlmanacObjects(schemaInstanceId);
        return almanacObjects;
    }

}
