import 'reflect-metadata';
import { ModuleInjector } from '../modules/module.injector';
import { DependencyContainer, container } from 'tsyringe';
import { AuthInjector } from '../auth/auth.injector';
// import { DatabaseInjector } from '../database/database.injector';

//////////////////////////////////////////////////////////////////////////////////////////////////

export class Injector {

    private static _container: DependencyContainer = container;

    public static get Container() {
        return Injector._container;
    }
    
    static registerInjections() {
        // DatabaseInjector.registerInjections(Injector.Container);
        AuthInjector.registerInjections(Injector.Container);
        ModuleInjector.registerInjections(Injector.Container);
    }

}
