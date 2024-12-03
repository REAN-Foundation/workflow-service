import { logger } from '../../logger/logger';

///////////////////////////////////////////////////////////////////////////////////

export class ChatbotMessageService {

    send = async (toPhone: string, message: string): Promise<boolean> => {
        try {
            logger.info(`Sent message to \nPhone: '${toPhone}',\nMessage: '${message}'`);
            return Promise.resolve(true);
        } catch (error) {
            logger.info(error.message);
            return false;
        }
    };

    // sendWhatsappMessage = async (toPhone: string, message: string): Promise<boolean> => {
    //     try {
    //         logger.info(`Sent message to \nPhone: '${toPhone}',\nMessage: '${message}'`);
    //         return Promise.resolve(true);
    //     } catch (error) {
    //         logger.info(error.message);
    //         return false;
    //     }
    // };

}
