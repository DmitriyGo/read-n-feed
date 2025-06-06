import { NavigatorScreenParams } from '@react-navigation/native';
import { BookRequestResponseDto } from '@read-n-feed/application';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<DrawerParamList>;
  CreateBookRequest: undefined;
  BookReader: {
    fileId: string;
    bookId: string;
  };
  EditBookRequest: { bookRequest: BookRequestResponseDto };
};

export type AuthStackParamList = {
  HomeLogin: undefined;
  HomeRegister: undefined;
};

export type DrawerParamList = {
  Home: undefined;
  Profile: undefined;
  BookRequests: undefined;
};

declare module '@react-navigation/native' {
  export type RootParamList = RootStackParamList;
}
