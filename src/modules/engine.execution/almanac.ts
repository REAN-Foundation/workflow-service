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

    constructor(schemaInstanceId: uuid) {
        this._schemaInstanceId = schemaInstanceId;
        this.Facts = [];
    }

    public async addFact(name: string, data: any[] | any): Promise<boolean> {
        this.Facts.push({ Name: name, Data: data });
        await this.saveAlmanac();
        return true;
    }

    public async getFact(name: string): Promise<any[] | any | undefined> {
        await this.loadAlmanac();
        var fact = this.Facts.find(x => x.Name === name);
        if (fact) {
            return fact.Data;
        }
        return undefined;
    }

    private async saveAlmanac(): Promise<void> {
        await this._schemaInstanceService.updateAlmanac(this._schemaInstanceId, this.Facts);
    }

    public async loadAlmanac(): Promise<void> {
        var almanac = await this._schemaInstanceService.getAlmanac(this._schemaInstanceId);
        if (almanac) {
            this.Facts = almanac;
        }
    }

}
