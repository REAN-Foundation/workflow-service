import { WorkflowMessageEvent } from '../../domain.types/engine/user.event.types';
import { logger } from '../../logger/logger';
import needle = require('needle');

///////////////////////////////////////////////////////////////////////////////////

export class ChatbotMessageService {

    send = async (toPhone: string, message: WorkflowMessageEvent): Promise<boolean> => {
        try {
            const str = JSON.stringify(message);
            logger.info(`Sending message to \nPhone: '${toPhone}',\nMessage Payload: '${str}'`);

            const botApiUrl = process.env.BOT_API_URL;
            const botApiKey = process.env.BOT_API_KEY;

            const headers = {
                'Content-Type'    : 'application/json',
                Accept            : '*/*',
                'Cache-Control'   : 'no-cache',
                'Accept-Encoding' : 'gzip, deflate, br',
                Connection        : 'keep-alive',
                'x-api-key'       : botApiKey,
            };
            const options = {
                headers    : headers,
                compressed : true,
                json       : true,
            };

            const url = `${botApiUrl}/message/send`;
            const response = await needle.post(url, message, options);
            if (response.statusCode !== 200) {
                logger.error(`Failed to send message to \nPhone: '${toPhone}',\nMessage Payload: '${str}'`);
                return true;
            }
            logger.info(`Bot message response: ${JSON.stringify(response.body)}`);

            return Promise.resolve(true);
        } catch (error) {
            logger.info(error.message);
            return false;
        }
    };

}
