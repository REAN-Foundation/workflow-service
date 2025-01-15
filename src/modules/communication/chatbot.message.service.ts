import { logger } from '../../logger/logger';
import { Agent as HttpAgent } from 'http'; // For HTTP
import { Agent as HttpsAgent } from 'https'; // For HTTPS
import needle from 'needle';
import { WorkflowEvent } from '../../domain.types/engine/event.types';

///////////////////////////////////////////////////////////////////////////////////

export class ChatbotMessageService {

    send = async (toPhone: string, message: WorkflowEvent): Promise<boolean> => {
        try {
            const str = JSON.stringify(message);

            const botApiUrl = process.env.BOT_API_URL;
            const botApiKey = process.env.BOT_API_KEY;

            var agent = new HttpAgent({ keepAlive: true });
            if (botApiUrl.startsWith('https')) {
                agent = new HttpsAgent({ keepAlive: true });
            }
            const options = {
                httpAgent : agent,
                headers   : {
                    'Content-Type'    : 'application/json',
                    Accept            : '*/*',
                    'Cache-Control'   : 'no-cache',
                    'Accept-Encoding' : 'gzip, deflate, br',
                    Connection        : 'keep-alive',
                    'x-api-key'       : botApiKey,
                }
            };

            const url = `${botApiUrl}/message/send`;
            logger.info(url);

            const response = await needle('post', url, message, options);
            if (response.statusCode !== 200) {
                logger.error(`Failed to send message to \nPhone: '${toPhone}',\nMessage Payload: '${str}'`);
                return true;
            }
            // logger.info(`Bot message response: ${JSON.stringify(response.body)}`);

            return Promise.resolve(true);
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

}
