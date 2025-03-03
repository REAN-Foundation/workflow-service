import { logger } from '../../logger/logger';
import { Agent as HttpAgent } from 'http'; // For HTTP
import { Agent as HttpsAgent } from 'https'; // For HTTPS
import needle from 'needle';
import { WorkflowEvent } from '../../domain.types/engine/event.types';

///////////////////////////////////////////////////////////////////////////////////

export class ChatbotMessageService {

    send = async (tenantCode: string, toPhone: string, message: WorkflowEvent): Promise<boolean> => {
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

            const url = `${botApiUrl}/${tenantCode}/message/send`;

            var msg = message.UserMessage?.TextMessage;
            var location = message.UserMessage?.Location;
            var question = message.UserMessage?.QuestionText;

            logger.info(`Sending message through chatbot`);
            logger.info(`Phone   : ${toPhone}`);
            logger.info(`url     : ${url}`);
            logger.info(`Message : ${msg}`);
            logger.info(`Location: ${location}`);
            logger.info(`Question: ${question}`);

            const response = await needle('post', url, message, options);
            if (response.statusCode !== 200) {
                logger.error(`Failed to send message to \nPhone: '${toPhone}',\nMessage Payload: '${str}'`);
                return false;
            }
            return true;
        } catch (error) {
            logger.error(error.message);
            return false;
        }
    };

}
