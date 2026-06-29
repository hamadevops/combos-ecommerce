import { Injectable } from '@nestjs/common';
import { createHash, createHmac } from 'crypto';

@Injectable()
export class EmTemplateCompilerService {
  /**
   * Compile template for actual sending (with tracking links and open pixel)
   */
  compile(
    htmlContent: string,
    subject: string,
    contact: Record<string, any>,
    logId: number,
    campaignId: number,
    trackingDomain: string,
  ): {
    html: string;
    subject: string;
    trackedLinks: { originalUrl: string; hash: string }[];
  } {
    // 1. Personalize subject
    let compiledSubject = this.replaceVariables(subject, contact);

    // 2. Personalize HTML
    let compiledHtml = this.replaceVariables(htmlContent, contact);

    // 3. Rewrite links for click tracking
    const trackedLinks: { originalUrl: string; hash: string }[] = [];
    compiledHtml = compiledHtml.replace(
      /href\s*=\s*"(https?:\/\/[^"]+)"/gi,
      (_match, url: string) => {
        // Don't track unsubscribe links (they have their own tracking)
        if (url.includes('/em-tracking/unsubscribe')) {
          return `href="${url}"`;
        }
        const hash = this.generateLinkHash(campaignId, url);
        trackedLinks.push({ originalUrl: url, hash });
        const trackUrl = `${trackingDomain}/em-tracking/click/${hash}?lid=${logId}`;
        return `href="${trackUrl}"`;
      },
    );

    // 4. Inject open pixel before </body>
    const openPixelUrl = `${trackingDomain}/em-tracking/open/${logId}.gif`;
    const openPixel = `<img src="${openPixelUrl}" width="1" height="1" style="display:none" alt="" />`;

    if (compiledHtml.includes('</body>')) {
      compiledHtml = compiledHtml.replace('</body>', `${openPixel}</body>`);
    } else {
      compiledHtml += openPixel;
    }

    // 5. Inject unsubscribe link
    const unsubToken = this.generateUnsubscribeToken(contact.id || 0);
    const unsubUrl = `${trackingDomain}/em-tracking/unsubscribe/${contact.id || 0}/${unsubToken}`;
    const unsubHtml = `<div style="text-align:center;margin-top:20px;padding:10px;font-size:12px;color:#999;">
      <a href="${unsubUrl}" style="color:#999;text-decoration:underline;">Hủy đăng ký nhận email</a>
    </div>`;

    if (compiledHtml.includes('</body>')) {
      compiledHtml = compiledHtml.replace('</body>', `${unsubHtml}</body>`);
    } else {
      compiledHtml += unsubHtml;
    }

    return { html: compiledHtml, subject: compiledSubject, trackedLinks };
  }

  /**
   * Compile for preview mode — no tracking, just personalization
   */
  compileForPreview(
    htmlContent: string,
    subject: string,
    contactData: Record<string, any>,
  ): { html: string; subject: string } {
    return {
      subject: this.replaceVariables(subject, contactData),
      html: this.replaceVariables(htmlContent, contactData),
    };
  }

  /**
   * Replace {contact.fieldName} variables with actual values
   */
  private replaceVariables(
    content: string,
    contact: Record<string, any>,
  ): string {
    return content.replace(/\{contact\.(\w+)\}/g, (_match, field: string) => {
      return contact[field] ?? '';
    });
  }

  /**
   * Generate SHA-256 hash for a tracked link
   */
  generateLinkHash(campaignId: number, url: string): string {
    return createHash('sha256')
      .update(`${campaignId}:${url}`)
      .digest('hex')
      .substring(0, 16); // Shortened for cleaner URLs
  }

  /**
   * Generate HMAC token for unsubscribe link (prevent abuse)
   */
  generateUnsubscribeToken(contactId: number): string {
    const secret = process.env.JWT_SECRET || 'em-unsub-secret';
    return createHmac('sha256', secret)
      .update(`unsub:${contactId}`)
      .digest('hex')
      .substring(0, 32);
  }

  /**
   * Verify unsubscribe token
   */
  verifyUnsubscribeToken(contactId: number, token: string): boolean {
    const expected = this.generateUnsubscribeToken(contactId);
    return expected === token;
  }
}
