import { ConditionOperand } from "../../domain.types/engine/rule.types";
import { ConditionService } from "../../database/services/engine/condition.service";
import { RuleService } from "../../database/services/engine/rule.service";
import { uuid } from "../../domain.types/miscellaneous/system.types";
import {
    CompositionOperatorType,
    InputSourceType,
    LogicalOperatorType,
    OperandDataType,
    OperatorType,
    QuestionResponseType,
    UserMessageType } from "../../domain.types/engine/engine.enums";
import { ConditionResponseDto } from "../../domain.types/engine/condition.types";
import { Almanac } from "./almanac";
import { EventResponseDto } from "../../domain.types/engine/event.types";

/////////////////////////////////////////////////////////////////////////////////////////////////////////

export class ConditionProcessor {

    private _schemaInstanceId: uuid = null;

    private _conditionService: ConditionService = new ConditionService();

    private _ruleService: RuleService = new RuleService();

    private _almanac: Almanac = null;

    _event: EventResponseDto | null = null;

    constructor(almanac: Almanac, event?: EventResponseDto) {
        this._almanac = almanac;
        this._event = event;
    }

    public processCondition = async (condition: ConditionResponseDto, argument?: any): Promise<boolean> => {

        if (!condition) {
            throw new Error(`Invalid condition to process!`);
        }

        if (condition.OperatorType === OperatorType.Logical) {
            var first = condition.FirstOperand;
            if (argument) {
                first.Value = argument;
            }
            return this.operate(condition.LogicalOperatorType, first, condition.SecondOperand, condition.ThirdOperand);
        }
        else {
            const childrenConditions: ConditionResponseDto[] =
                await this._conditionService.getChildrenConditions(condition.id);
            if (childrenConditions.length === 0) {
                return false;
            }
            if (condition.CompositionOperatorType === CompositionOperatorType.None) {
                return false;
            }
            if (condition.CompositionOperatorType === CompositionOperatorType.And) {
                for (var i = 0; i < childrenConditions.length; i++) {
                    var childCondition = childrenConditions[i];
                    var result = await this.processCondition(childCondition, argument);
                    if (!result) {
                        return false;
                    }
                }
                return true;
            }
            else if (condition.CompositionOperatorType === CompositionOperatorType.Or) {
                for (var i = 0; i < childrenConditions.length; i++) {
                    var childCondition = childrenConditions[i];
                    var result = await this.processCondition(childCondition, argument);
                    if (result) {
                        return true;
                    }
                }
                return false;
            }
        }

        return false;
    };

    //#region Privates

    private async operate(
        operator: LogicalOperatorType,
        first: ConditionOperand,
        second: ConditionOperand,
        third?: ConditionOperand): Promise<boolean> {

        if (!first.Value) {
            first.Value = await this.fetchOperandValue(first, first.Value);
        }
        if (!second.Value) {
            second.Value = await this.fetchOperandValue(second, second.Value);
        }
        if (third && !third.Value) {
            third.Value = await this.fetchOperandValue(third, third.Value);
        }

        var resolved = false;

        switch (operator) {
            case LogicalOperatorType.Equal: {
                resolved = this.isEqualTo(first, second);
                break;
            }
            case LogicalOperatorType.NotEqual: {
                resolved = this.isNotEqualTo(first, second);
                break;
            }
            case LogicalOperatorType.In: {
                resolved = this.in(first, second);
                break;
            }
            case LogicalOperatorType.IsFalse: {
                resolved = this.isFalse(first);
                break;
            }
            case LogicalOperatorType.IsTrue: {
                resolved = this.isTrue(first);
                break;
            }
            case LogicalOperatorType.GreaterThan: {
                resolved = this.greaterThan(first, second);
                break;
            }
            case LogicalOperatorType.LessThan: {
                resolved = this.lessThan(first, second);
                break;
            }
            case LogicalOperatorType.GreaterThanOrEqual: {
                resolved = this.greaterThanEqualTo(first, second);
                break;
            }
            case LogicalOperatorType.LessThanOrEqual: {
                resolved = this.lessThanEqualTo(first, second);
                break;
            }
            case LogicalOperatorType.Between: {
                resolved = this.between(first, second, third);
                break;
            }
            default: {
                break;
            }
        }

        return resolved;
    }

    private async fetchOperandValue(operand: ConditionOperand, value: string | number | boolean | any[])
        : Promise<string | number | boolean | any[]> {

        if (operand.Source === InputSourceType.Almanac) {
            value = await this._almanac.getFact(operand.Key);
            if (operand.DataType === OperandDataType.Boolean) {
                var isBoolean = typeof value === 'boolean';
                value = isBoolean ? value : value !== null && value !== undefined;
            }
        }
        else if (operand.Source === InputSourceType.UserEvent) {

            var message = this._event.UserMessage;
            const isQuestionResponse = message &&
                message.QuestionResponse &&
                message.MessageType === UserMessageType.Question;

            if (isQuestionResponse) {
                const isSingleChoice = message.QuestionResponse.ResponseType === QuestionResponseType.SingleChoiceSelection;
                if (isSingleChoice) {
                    value = message.QuestionResponse.SingleChoiceChosenOption;
                }
                else {
                    value = message.QuestionResponse.ResponseContent;
                }
            }
            else {
                if (message.MessageType === UserMessageType.Text) {
                    value = message.TextMessage;
                }
                else if (message.MessageType === UserMessageType.Image) {
                    value = message.ImageUrl;
                }
                else if (message.MessageType === UserMessageType.Audio) {
                    value = message.AudioUrl;
                }
                else if (message.MessageType === UserMessageType.Video) {
                    value = message.VideoUrl;
                }
                else if (message.MessageType === UserMessageType.File) {
                    value = message.FileUrl;
                }
            }
        }
        else {
            value = operand.Value;
        }
        return value;
    }

    private compareArray(first: ConditionOperand, second: ConditionOperand): boolean {
        const firstArray: any[] = first.Value as any[];
        const secondArray: any[] = second.Value as any[];
        if (firstArray.length === 0 || secondArray.length === 0) {
            return false;
        }
        if (firstArray.length !== secondArray.length) {
            return false;
        }
        for (var i = 0; i < firstArray.length; i++) {
            if (secondArray[i] !== firstArray[i]) {
                return false;
            }
        }
        return true;
    }

    private isEqualTo(first: ConditionOperand, second: ConditionOperand): boolean {
        if (first.DataType !== second.DataType) {
            return false;
        }
        if (first.DataType === OperandDataType.Float ||
            first.DataType === OperandDataType.Integer ||
            first.DataType === OperandDataType.Boolean) {
            return first.Value === second.Value;
        }
        if (first.DataType === OperandDataType.Array) {
            return this.compareArray(first, second);
        }
        if (first.DataType === OperandDataType.Text) {
            const firstValue = first.Value.toString().toLowerCase();
            const secondValue = second.Value.toString().toLowerCase();
            if (firstValue === secondValue) {
                return true;
            }
        }
        return false;
    }

    private isNotEqualTo(first: ConditionOperand, second: ConditionOperand): boolean {
        return first.Value !== second.Value;
    }

    private in(first: ConditionOperand, second: ConditionOperand): boolean {
        const secondArray: any[] = second.Value as any[];
        return secondArray.includes(first);
    }

    private isFalse(first: ConditionOperand): boolean {
        return first.Value === false;
    }

    private isTrue(first: ConditionOperand): boolean {
        return first.Value === true;
    }

    private greaterThan(first: ConditionOperand, second: ConditionOperand): boolean {
        return first.Value > second.Value;
    }

    private lessThan(first: ConditionOperand, second: ConditionOperand): boolean {
        return first.Value < second.Value;
    }

    private greaterThanEqualTo(first: ConditionOperand, second: ConditionOperand): boolean {
        return first.Value >= second.Value;
    }

    private lessThanEqualTo(first: ConditionOperand, second: ConditionOperand): boolean {
        return first.Value <= second.Value;
    }

    private between(first: ConditionOperand, second: ConditionOperand, third: ConditionOperand): boolean {
        return first.Value >= second.Value && first.Value <= third.Value;
    }

    //#endregion

}
