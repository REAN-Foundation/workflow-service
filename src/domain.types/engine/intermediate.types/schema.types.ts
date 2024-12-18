// /* eslint-disable lines-between-class-members */
// import { uuid } from "../../miscellaneous/system.types";
// import {
//     SchemaType
// } from "../engine.enums";
// import { Almanac } from "../../../modules/engine.execution/almanac";
// import { XNode, XNodeInstance } from "./node.types";
// import { ContextParams } from "./params.types";

////////////////////////////////////////////////////////////////

// export interface XSchema {
//     id          : uuid;
//     Type        : SchemaType;
//     Name        : string;
//     Description : string;
//     Active      : boolean;
//     RootNode   ?: XNode;
//     Tenant      : {
//         id  : uuid;
//         Name: string;
//         Code: string;
//     };
//     Nodes        : XNode[];
//     ContextParams: ContextParams;
//     CreatedAt    : Date;
//     UpdatedAt    : Date;
// }

// export interface XSchemaInstance {
//     id                  : uuid;
//     SchemaId            : uuid;
//     Schema              : XSchema;
//     Name                : string;
//     Description         : string;
//     Exited              : boolean;
//     RootNode           ?: XNode;
//     RootNodeInstance    : XNodeInstance;
//     TenantId           ?: uuid;
//     Nodes               : XNode[];
//     NodeInstances       : XNodeInstance[];
//     CurrentNodeInstance : XNodeInstance;
//     ContextParams       : ContextParams;
//     ActiveListeningNodes: XNodeInstance[];
//     Almanac             : Almanac;
//     CurrentNode         : XNode;
//     CreatedAt           : Date;
//     UpdatedAt           : Date;
// }
