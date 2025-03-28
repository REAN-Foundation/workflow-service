
export type DatabaseType = 'SQL' | 'NoSQL';
export type DatabaseORM = 'Sequelize' | 'Knex' | 'Mongoose';
export type DatabaseFlavour = 'MySQL' | 'PostGreSQL' | 'MongoDB';
export type FileStorageProvider = 'AWS-S3' | 'GCP-FileStore' | 'Custom';
export type SMSServiceProvider = 'Twilio' | 'Mock';
export type EmailServiceProvider = 'SendGrid' | 'Mock';
export type InAppNotificationServiceProvider = 'Firebase' | 'Mock';
export type ProcessorsProvider = 'Custom' | 'Mock';
export type AuthorizationType = 'Custom'; //TBD: Other options need to be supported
export type AuthenticationType = 'Custom'; //TBD: Other options need to be supported

///////////////////////////////////////////////////////////////////////////////////////////

export interface AuthConfig {
    Authentication: AuthenticationType;
    Authorization : AuthorizationType;
}

export interface DatabaseConfig {
    Type   : DatabaseType;
    ORM    : DatabaseORM;
    Flavour: DatabaseFlavour;
}

export interface Processor {
    Provider   : ProcessorsProvider;
}

export interface FileStorageConfig {
    Provider: FileStorageProvider;
}

export interface CommunicationConfig {
    SMSProvider              : SMSServiceProvider,
    EmailProvider            : EmailServiceProvider
}

export interface TemporaryFoldersConfig {
    Upload                    : string,
    Download                  : string,
    CleanupFolderBeforeMinutes: number
}

export interface CareplanConfig {
    Provider            : string;
    Name                : string;
    Code                : string;
    DisplayName         : string;
    DefaultDurationDays?: number;
    Description         : string;
}

export interface FormServiceProvider {
    Provider: string;
    Code    : string;
}

export interface Configurations {
    SystemIdentifier    : string;
    BaseUrl             : string;
    Auth                : AuthConfig;
    Processor          : Processor;
    FileStorage         : FileStorageConfig;
    TemporaryFolders    : TemporaryFoldersConfig;
    MaxUploadFileSize   : number;
    JwtExpiresIn        : number;
    Logger              : string; //'Custom' | 'Winston' | 'Pino' | 'Bunyan',
    UseHTTPLogging      : boolean;
}
