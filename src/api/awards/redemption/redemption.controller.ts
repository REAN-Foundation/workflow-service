// import express from 'express';
// import {
//     ResponseHandler
// } from '../../../common/response.handler';
// import {
//     RedemptionControllerDelegate
// } from './redemption.controller.delegate';

// ///////////////////////////////////////////////////////////////////////////////////////

// export class RedemptionController {

//     //#region member variables and constructors

//     _delegate: RedemptionControllerDelegate = null;

//     constructor() {
//         super();
//         this._delegate = new RedemptionControllerDelegate();
//     }

//     //#endregion

//     create = async (request: express.Request, response: express.Response): Promise < void > => {
//         try {
//             const record = await this._delegate.create(request.body);
//             const message = 'Redemption added successfully!';
//             ResponseHandler.success(request, response, message, 201, record);
//         } catch (error) {
//             ResponseHandler.handleError(request, response, error);
//         }
//     }

//     getById = async (request: express.Request, response: express.Response): Promise < void > => {
//         try {
//             const record = await this._delegate.getById(request.params.id);
//             const message = 'Redemption retrieved successfully!';
//             ResponseHandler.success(request, response, message, 200, record);
//         } catch (error) {
//             ResponseHandler.handleError(request, response, error);
//         }
//     }

//     search = async (request: express.Request, response: express.Response): Promise < void > => {
//         try {
//             const searchResults = await this._delegate.search(request.query);
//             const message = 'Redemption records retrieved successfully!';
//             ResponseHandler.success(request, response, message, 200, searchResults);
//         } catch (error) {
//             ResponseHandler.handleError(request, response, error);
//         }
//     }

//     update = async (request: express.Request, response: express.Response): Promise < void > => {
//         try {
//             const updatedRecord = await this._delegate.update(request.params.id, request.body);
//             const message = 'Redemption updated successfully!';
//             ResponseHandler.success(request, response, message, 200, updatedRecord);
//         } catch (error) {
//             ResponseHandler.handleError(request, response, error);
//         }
//     }

//     delete = async (request: express.Request, response: express.Response): Promise < void > => {
//         try {
//             const result = await this._delegate.delete(request.params.id);
//             const message = 'Redemption deleted successfully!';
//             ResponseHandler.success(request, response, message, 200, result);
//         } catch (error) {
//             ResponseHandler.handleError(request, response, error);
//         }
//     };

// }
