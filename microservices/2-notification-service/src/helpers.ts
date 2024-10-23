import path from 'path';

import { IEmailLocals, winstonLogger } from '@thejuggernaut01/jobberapp-shared';
import { Logger } from 'winston';
import nodemailer, { Transporter } from 'nodemailer';
import Email from 'email-templates';

import { ENVIRONMENT } from './config';

const log: Logger = winstonLogger(`${ENVIRONMENT.ELASTIC_SEARCH.ELASTIC_SEARCH_URL}`, 'MailTransportHelper', 'debug');

const emailTemplates = async (template: string, receiver: string, locals: IEmailLocals): Promise<void> => {
  try {
    const smtpTransport: Transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: ENVIRONMENT.EMAIL.SENDER_EMAIL,
        pass: ENVIRONMENT.EMAIL.SENDER_EMAIL_PASSWORD
      }
    });

    const email: Email = new Email({
      message: {
        from: `Jobber App <${ENVIRONMENT.EMAIL.SENDER_EMAIL}>`
      },
      send: true,
      preview: false,
      transport: smtpTransport,
      views: {
        options: {
          extension: 'ejs'
        }
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '../build')
        }
      }
    });

    await email.send({
      template: path.join(__dirname, '..', 'src/emails', template),
      message: { to: receiver },
      locals
    });
  } catch (error) {
    log.error(error);
  }
};

export { emailTemplates };