import { Session } from './session.entity';

export interface ISessionRepository {
  create(session: Session): Promise<Session>;
  findById(sessionId: string): Promise<Session | null>;
  findByUser(userId: string): Promise<Session[]>;
  update(session: Session): Promise<Session>;
  delete(sessionId: string): Promise<void>;

  deleteAllByUser(userId: string): Promise<void>;
  countByUser(userId: string): Promise<number>;
  findActiveByUser(userId: string): Promise<Session[]>;
}
