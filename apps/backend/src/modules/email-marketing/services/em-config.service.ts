import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { EmConfig } from 'src/database/entities/email-marketing/em-config.entity';
import { UpdateEmConfigDto, TestEmConfigDto } from '../dto/em-config.dto';
import * as nodemailer from 'nodemailer';
import { encrypt, decrypt } from 'src/common/utils/crypto.util';

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  replyTo: string;
  trackingDomain: string;
}

@Injectable()
export class EmConfigService {
  constructor(
    @InjectRepository(EmConfig)
    private readonly configRepo: EntityRepository<EmConfig>,
  ) {}

  async findAll(): Promise<Record<string, any>[]> {
    const configs = await this.configRepo.findAll();
    // Return masked password to frontend
    return configs.map((config) => {
      const dto = { ...config } as Record<string, any>;
      if (dto.key === 'smtp_pass' && dto.value) {
        dto.value = '********';
      }
      return dto;
    });
  }

  async updateBatch(dto: UpdateEmConfigDto) {
    const em = this.configRepo.getEntityManager();
    for (const item of dto.items) {
      if (item.key === 'smtp_pass' && item.value === '********') {
        // Bỏ qua nếu user không đổi password (đang hiển thị dạng sao)
        continue;
      }

      let config = await this.configRepo.findOne({ key: item.key });
      const valueToSave =
        item.key === 'smtp_pass'
          ? encrypt(item.value ?? '')
          : (item.value ?? '');

      if (config) {
        config.value = valueToSave;
      } else {
        config = em.create(EmConfig, {
          key: item.key,
          value: valueToSave,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      em.persist(config);
    }
    await em.flush();
    return { success: true };
  }

  async getSmtpConfig(em?: EntityManager): Promise<SmtpConfig> {
    const repo = em ? em.getRepository(EmConfig) : this.configRepo;
    const configs = await repo.findAll();
    const map = new Map(configs.map((c) => [c.key, c.value || '']));

    const smtpPass = map.get('smtp_pass') || '';

    return {
      host: map.get('smtp_host') || '',
      port: parseInt(map.get('smtp_port') || '587', 10),
      secure: map.get('smtp_secure') === 'true',
      user: map.get('smtp_user') || '',
      pass: decrypt(smtpPass),
      fromName: map.get('from_name') || '',
      fromEmail: map.get('from_email') || '',
      replyTo: map.get('reply_to') || '',
      trackingDomain: map.get('tracking_domain') || '',
    };
  }

  async sendTestEmail(dto: TestEmConfigDto) {
    const smtp = await this.getSmtpConfig();
    if (!smtp.host || !smtp.user || !smtp.pass) {
      throw new BadRequestException(
        'Chưa cấu hình SMTP. Vui lòng cập nhật cấu hình trước.',
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    });

    const senderEmail = smtp.fromEmail || smtp.user;
    const senderField = smtp.fromName
      ? `"${smtp.fromName}" <${senderEmail}>`
      : senderEmail;

    try {
      await transporter.sendMail({
        from: senderField,
        to: dto.testEmail,
        subject: '[Test] Email Marketing - Kiểm tra cấu hình SMTP',
        html: `<html><body>
          <h2>✅ Cấu hình SMTP thành công!</h2>
          <p>Email này được gửi từ hệ thống Email Marketing CMS.</p>
          <p>Thời gian: ${new Date().toISOString()}</p>
        </body></html>`,
      });
      return {
        success: true,
        message: `Email test đã gửi tới ${dto.testEmail}`,
      };
    } catch (error: any) {
      throw new BadRequestException(`Gửi email thất bại: ${error.message}`);
    }
  }

  createTransporter(smtp: SmtpConfig) {
    return nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: { user: smtp.user, pass: smtp.pass },
    });
  }
}
