/* eslint-disable lines-between-class-members */

export enum ActionType {
    SendMessage    = 'SendMessage',
    SendEmail      = 'SendEmail',
    SendSms        = 'SendSms',
    RestApiCall    = 'RestApiCall',
    PythonFunCall  = 'PythonFunCall',
    LambdaFunCall  = 'LambdaFunCall',
    StoreDataSqlDb = 'StoreDataSqlDb',
    Exit           = 'Exit',
    Continue       = 'Continue',
}

export class XAction {

    Type       : ActionType;
    Name       : string;
    Description: string;
    RawInput   : any | undefined;
    RawOutput  : any | undefined;
    Input      : Map<string, any> | undefined | null;
    Output     : Map<string, any> | undefined | null;

    public constructor(
        type       : ActionType,
        name       : string,
        description: string,
        input      : Map<string, any> | undefined | null,
        output     : Map<string, any> | undefined | null,
        rawInput   : any | undefined,
        rawOutput  : any | undefined) {
        this.Type = type;
        this.Name = name;
        this.Description = description;
        this.RawInput = rawInput;
        this.RawOutput = rawOutput;
        this.Input = input;
        this.Output = output;
    }

}

export class XSendMessageAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : Map<string, any> | undefined | null,
        output     : Map<string, any> | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.SendMessage, name, description, input, output, rawInput, rawOutput);
    }

}

export class XSendEmailAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : Map<string, any> | undefined | null,
        output     : Map<string, any> | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.SendEmail, name, description, input, output, rawInput, rawOutput);
    }

}

export class XSendSmsAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : Map<string, any> | undefined | null,
        output     : Map<string, any> | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.SendSms, name, description, input, output, rawInput, rawOutput);
    }

}

export class XRestApiCallAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : Map<string, any> | undefined | null,
        output     : Map<string, any> | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.RestApiCall, name, description, input, output, rawInput, rawOutput);
    }

}

export class XPythonFunCallAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : Map<string, any> | undefined | null,
        output     : Map<string, any> | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.PythonFunCall, name, description, input, output, rawInput, rawOutput);
    }

}

export class XLambdaFunCallAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : Map<string, any> | undefined | null,
        output     : Map<string, any> | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.LambdaFunCall, name, description, input, output, rawInput, rawOutput);
    }

}

export class XStoreDataSqlDbAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : Map<string, any> | undefined | null,
        output     : Map<string, any> | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.StoreDataSqlDb, name, description, input, output, rawInput, rawOutput);
    }

}

export class XExitAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : Map<string, any> | undefined | null,
        output     : Map<string, any> | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.Exit, name, description, input, output, rawInput, rawOutput);
    }

}

export class XContinueAction extends XAction {

    public constructor(
        name       : string,
        description: string,
        input      : Map<string, any> | undefined | null,
        output     : Map<string, any> | undefined | null,
        rawInput   : any | undefined | null = undefined,
        rawOutput  : any | undefined | null = undefined) {
        super(ActionType.Continue, name, description, input, output, rawInput, rawOutput);
    }

}
