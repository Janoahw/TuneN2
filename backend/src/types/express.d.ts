declare namespace Express {
  interface Request {
    user?: {
      id: string;
      email: string;
      isArtist: boolean;
      isAdmin: boolean;
    };
  }
}
