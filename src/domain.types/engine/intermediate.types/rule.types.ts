import { uuid } from "../../../domain.types/miscellaneous/system.types";
import { StringUtils } from "../../../common/utilities/string.utils";
import { CompositionOperatorType, InputSourceType, OperandDataType, OperatorType } from "../engine.enums";

////////////////////////////////////////////////////////////////

export interface ConditionOperand {
    DataType?: OperandDataType;
    Name ?   : string | null;
    Value?   : string | number | boolean | any[] | null;
    Source? : InputSourceType;
    Key?    : string;
}

export class XConditionOperand {

    DataType?: OperandDataType;

    Name ?   : string | null;

    Value?   : string | number | boolean | any[] | null;

    Source? : InputSourceType;

    Key?    : string;

    constructor(
        dataType: OperandDataType,
        name: string | null,
        value: string | number | boolean | any[] | null,
        source?: InputSourceType,
        key?: string,
    ) {
        this.DataType = dataType;
        this.Name = name;
        this.Value = value;
        this.Source = source;
        this.Key = key;

        if (StringUtils.isStr(this.Value) && this.DataType !== OperandDataType.Text) {
            if (this.DataType === OperandDataType.Integer) {
                this.Value = parseInt(this.Value as string);
            }
            if (this.DataType === OperandDataType.Float) {
                this.Value = parseFloat(this.Value as string);
            }
            if (this.DataType === OperandDataType.Boolean) {
                this.Value = parseInt(this.Value as string);
                if (this.Value === 0) {
                    this.Value = false;
                }
                else {
                    this.Value = true;
                }
            }
            if (this.DataType === OperandDataType.Array) {
                this.Value = JSON.parse(this.Value as string);
            }
        }
    }

}

export interface XCondition {
    id            : uuid;
    Name          : string;
    Code          : string;
    PathId        : uuid;
    ParentNodeId  : uuid;
    ParentNodeCode: string;

    IsCompositeCondition?: boolean;
    CompositionType?     : CompositionOperatorType;
    ParentConditionId?   : uuid;
    OperatorType?        : OperatorType;

    FirstOperand ?: XConditionOperand;
    SecondOperand?: XConditionOperand;
    ThirdOperand ?: XConditionOperand;

    Children?     : XCondition[];
}

export interface XRule {
    id          : uuid;
    Name        : string;
    Description : string;
    ParentNodeId: uuid;
    Condition   : XCondition;
    NodePathId ?: uuid;
}
