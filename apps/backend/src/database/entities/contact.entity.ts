import { Entity, PrimaryKey, Property, Enum } from '@mikro-orm/core';

export enum ContactType {
  NEWSLETTER = 'NEWSLETTER',
  CONTACT_FORM = 'CONTACT_FORM',
}

export enum ContactStatus {
  UNREAD = 'UNREAD',
  READ = 'READ',
  REPLIED = 'REPLIED',
}

@Entity({ tableName: 'contacts' })
export class Contact {
  @PrimaryKey()
  id!: number;

  /**
   * The name of the person submitting the form (if applicable)
   */
  @Property({ nullable: true })
  name?: string;

  /**
   * The email address of the person (required for both newsletter and contact form)
   */
  @Property()
  email!: string;

  /**
   * The phone number of the person (if applicable)
   */
  @Property({ nullable: true })
  phone?: string;

  /**
   * The actual message sent in the contact form
   */
  @Property({ type: 'text', nullable: true })
  message?: string;

  @Enum(() => ContactType)
  type!: ContactType;

  /**
   * Additional flexible metadata associated with the submission
   */
  @Property({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  /**
   * UTM Source (e.g. google, facebook)
   */
  @Property({ nullable: true })
  utmSource?: string;

  /**
   * UTM Medium (e.g. cpc, banner, email)
   */
  @Property({ nullable: true })
  utmMedium?: string;

  /**
   * UTM Campaign Name
   */
  @Property({ nullable: true })
  utmCampaign?: string;

  /**
   * UTM Term (usually search keywords)
   */
  @Property({ nullable: true })
  utmTerm?: string;

  /**
   * UTM Content (used to differentiate similar content or links)
   */
  @Property({ nullable: true })
  utmContent?: string;

  @Enum(() => ContactStatus)
  status: ContactStatus = ContactStatus.UNREAD;

  @Property({ onCreate: () => new Date() })
  createdAt!: Date;

  @Property({ onUpdate: () => new Date() })
  updatedAt!: Date;
}
