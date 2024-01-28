export interface connectedUsers {
    id: string;
    user: {
      id: string;
      name: string;
    };
    currentPosition: {
      lat: number;
      long: number;
    };
  }