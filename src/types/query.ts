// TanStack Query v5 Type Definitions
// This file provides type safety for query and mutation configurations

import { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

// Query configuration type
export type QueryConfig<TData = unknown, TError = unknown> = Omit<
  UseQueryOptions<TData, TError>,
  'queryKey' | 'queryFn'
> & {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
};

// Mutation configuration type
export type MutationConfig<TData = unknown, TError = unknown, TVariables = unknown> = Omit<
  UseMutationOptions<TData, TError, TVariables>,
  'mutationFn'
> & {
  mutationFn: (variables: TVariables) => Promise<TData>;
};

// Helper function to ensure correct query syntax
export function createQueryConfig<TData = unknown, TError = unknown>(
  config: QueryConfig<TData, TError>
): QueryConfig<TData, TError> {
  return config;
}

// Helper function to ensure correct mutation syntax
export function createMutationConfig<TData = unknown, TError = unknown, TVariables = unknown>(
  config: MutationConfig<TData, TError, TVariables>
): MutationConfig<TData, TError, TVariables> {
  return config;
} 