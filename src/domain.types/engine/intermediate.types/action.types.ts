import { ActionType } from "../engine.enums";
import { ActionInputParams, ActionOutputParams } from "./params.types";

export interface XAction {
    Type       : ActionType;
    Name       : string;
    Description: string;
    RawInput   : any | undefined;
    RawOutput  : any | undefined;
    Input      : ActionInputParams | undefined | null;
    Output     : ActionOutputParams | undefined | null;
}

// export class XSendMessageAction implements XAction {

//     public Type       : ActionType;

//     public Name       : string;

//     public Description: string;

//     public RawInput   : any | undefined;

//     public RawOutput  : any | undefined;

//     public Input      : ActionInputParams | undefined | null;

//     public Output     : ActionOutputParams | undefined | null;

//     public constructor(
//         name       : string,
//         description: string,
//         input      : ActionInputParams | undefined | null,
//         output     : ActionOutputParams | undefined | null,
//             rawInput   : any | undefined | null = undefined,
//             rawOutput  : any | undefined | null = undefined) {
//         this.Type        = ActionType.SendMessage;
//         this.Name        = name;
//         this.Description = description;
//         this.Input       = input;
//         this.Output      = output;
//         this.RawInput    = rawInput;
//         this.RawOutput   = rawOutput;
//     }

// }

// export class XSendEmailAction extends XAction {

//     public constructor(
//         name       : string,
//         description: string,
//         input      : ActionInputParams | undefined | null,
//         output     : ActionOutputParams | undefined | null,
//         rawInput   : any | undefined | null = undefined,
//         rawOutput  : any | undefined | null = undefined) {
//         super(ActionType.SendEmail, name, description, input, output, rawInput, rawOutput);
//     }

// }

// export class XSendSmsAction extends XAction {

//     public constructor(
//         name       : string,
//         description: string,
//         input      : ActionInputParams | undefined | null,
//         output     : ActionOutputParams | undefined | null,
//         rawInput   : any | undefined | null = undefined,
//         rawOutput  : any | undefined | null = undefined) {
//         super(ActionType.SendSms, name, description, input, output, rawInput, rawOutput);
//     }

// }

// export class XRestApiCallAction extends XAction {

//     public constructor(
//         name       : string,
//         description: string,
//         input      : ActionInputParams | undefined | null,
//         output     : ActionOutputParams | undefined | null,
//         rawInput   : any | undefined | null = undefined,
//         rawOutput  : any | undefined | null = undefined) {
//         super(ActionType.RestApiCall, name, description, input, output, rawInput, rawOutput);
//     }

// }

// export class XPythonFunCallAction extends XAction {

//     public constructor(
//         name       : string,
//         description: string,
//         input      : ActionInputParams | undefined | null,
//         output     : ActionOutputParams | undefined | null,
//         rawInput   : any | undefined | null = undefined,
//         rawOutput  : any | undefined | null = undefined) {
//         super(ActionType.PythonFunCall, name, description, input, output, rawInput, rawOutput);
//     }

// }

// export class XLambdaFunCallAction extends XAction {

//     public constructor(
//         name       : string,
//         description: string,
//         input      : ActionInputParams | undefined | null,
//         output     : ActionOutputParams | undefined | null,
//         rawInput   : any | undefined | null = undefined,
//         rawOutput  : any | undefined | null = undefined) {
//         super(ActionType.LambdaFunCall, name, description, input, output, rawInput, rawOutput);
//     }

// }

// export class XStoreDataSqlDbAction extends XAction {

//     public constructor(
//         name       : string,
//         description: string,
//         input      : ActionInputParams | undefined | null,
//         output     : ActionOutputParams | undefined | null,
//         rawInput   : any | undefined | null = undefined,
//         rawOutput  : any | undefined | null = undefined) {
//         super(ActionType.StoreToSqlDb, name, description, input, output, rawInput, rawOutput);
//     }

// }

// export class XExitAction extends XAction {

//     public constructor(
//         name       : string,
//         description: string,
//         input      : ActionInputParams | undefined | null,
//         output     : ActionOutputParams | undefined | null,
//         rawInput   : any | undefined | null = undefined,
//         rawOutput  : any | undefined | null = undefined) {
//         super(ActionType.Exit, name, description, input, output, rawInput, rawOutput);
//     }

// }

// export class XContinueAction extends XAction {

//     public constructor(
//         name       : string,
//         description: string,
//         input      : ActionInputParams | undefined | null,
//         output     : ActionOutputParams | undefined | null,
//         rawInput   : any | undefined | null = undefined,
//         rawOutput  : any | undefined | null = undefined) {
//         super(ActionType.Continue, name, description, input, output, rawInput, rawOutput);
//     }

// }
