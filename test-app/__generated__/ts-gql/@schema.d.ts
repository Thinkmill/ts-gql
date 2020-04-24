/*
ts-gql-meta-begin
{
  "hash": "9b7a64ffd1fb96bb69d63c72ed4c463c"
}
ts-gql-meta-end
*/
export type Maybe<T> = T | null;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Query = {
   __typename?: 'Query';
  hello: Scalars['String'];
  other: Scalars['Boolean'];
  another: Scalars['String'];
  oneMore: Scalars['String'];
};


export type QueryOneMoreArgs = {
  thing?: Maybe<Scalars['String']>;
};
