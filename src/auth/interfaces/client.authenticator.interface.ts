import express from 'express';
import { AuthenticationResult } from '../../domain.types/user/auth.domain.types';

export interface IClientAuthenticator {

    authenticate(request: express.Request) : Promise<AuthenticationResult>;

}
