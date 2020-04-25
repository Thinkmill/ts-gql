/*
ts-gql-meta-begin
{
  "hash": "7250c827cd504dee0fa159223c6fbb96"
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
  readonly __typename: 'Query';
  readonly hello: Scalars['String'];
  readonly other: Scalars['Boolean'];
  readonly another: Scalars['String'];
  readonly something: Maybe<Scalars['String']>;
  readonly optional: Scalars['String'];
  readonly oneMore: Scalars['String'];
};


export type QueryoptionalArgs = {
  thing: Maybe<Scalars['String']>;
};


export type QueryoneMoreArgs = {
  thing: Maybe<Scalars['String']>;
  other: Something;
};

export type Something = {
  readonly yes: Maybe<Scalars['Boolean']>;
  readonly no: Scalars['String'];
};
