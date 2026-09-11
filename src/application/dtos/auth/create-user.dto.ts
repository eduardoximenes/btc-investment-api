export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
}

export interface CreateUserRecordDTO {
  name: string;
  email: string;
  passwordHash: string;
}
