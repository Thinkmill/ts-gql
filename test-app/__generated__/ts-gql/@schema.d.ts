/*
ts-gql-meta-begin
{
  "hash": "d827e8e5423bd4762c1edc18858c6e75"
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

export type Mutation = {
  readonly __typename: 'Mutation';
  readonly hello: Scalars['String'];
  readonly other: Scalars['Boolean'];
  readonly another: Scalars['String'];
  readonly something: Maybe<Scalars['String']>;
  readonly optional: Scalars['String'];
  readonly oneMore: Scalars['String'];
};


export type MutationoptionalArgs = {
  thing: Maybe<Scalars['String']>;
};


export type MutationoneMoreArgs = {
  thing: Maybe<Scalars['String']>;
  other: Something;
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

export interface TSGQLDocuments extends Record<string, import('@ts-gql').TypedDocumentNode<import('@ts-gql').BaseDocumentTypes>> {}