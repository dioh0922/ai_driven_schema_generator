export type SchemaFile = {
  name: string;
  content: string;
};

export type GenerateSuccessResponse = {
  message: string;
  files: SchemaFile[];
};

export type ErrorResponse = {
  error: string;
};
