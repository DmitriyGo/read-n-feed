export interface TokenProps {
  id: string;
  token: string;
  userId: string;
  userAgent?: string | null;
  exp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class Token {
  private props: TokenProps;

  constructor(props: TokenProps) {
    this.props = props;
  }

  get id() {
    return this.props.id;
  }

  get token() {
    return this.props.token;
  }

  get userId() {
    return this.props.userId;
  }

  get exp() {
    return this.props.exp;
  }

  isExpired(): boolean {
    return new Date() > this.props.exp;
  }
}
