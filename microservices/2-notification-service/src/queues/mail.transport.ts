import { ENVIRONMENT } from '@notifications/config';
import { emailTemplates } from '@notifications/helpers';
import { IEmailLocals, winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${ENVIRONMENT.ELASTIC_SEARCH.ELASTIC_SEARCH_URL}`, 'emailConsumer', 'debug');

const sendMail = async (template: string, receiverEmail: string, locals: IEmailLocals): Promise<void> => {
  try {
    // email templates
    emailTemplates(template, receiverEmail, locals);
    log.info('Email sent successfully');
  } catch (error) {
    log.log('error', 'NotificationService MailTransport sendEmail() method error', error);
  }
};

export { sendMail };
