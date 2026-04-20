import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';

/**
 * Industrial-Grade API Hook Wrappers
 * Provides a unified, type-safe interface for TanStack Query across all cockpit screens.
 */

/**
 * Unified Query Hook
 * Used for fetching industrial-grade data (GET requests).
 */
export function useApiQuery<T>(
  queryKey: string[],
  fetchFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<T, Error>({
    queryKey,
    queryFn: fetchFn,
    ...options,
  });
}

/**
 * Unified Mutation Hook
 * Used for executing high-fidelity data updates (POST, PUT, DELETE).
 */
export function useApiMutation<TData, TVariables, TContext = unknown>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, Error, TVariables, TContext>
) {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables, TContext>({
    mutationFn,
    onSuccess: (data, variables, context, mutation) => {
      // Logic for global cache invalidation can be added here
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context, mutation);
      }
    },
    onError: (error, variables, context, mutation) => {
      if (options?.onError) {
        options.onError(error, variables, context, mutation);
      }
    },
    onSettled: (data, error, variables, context, mutation) => {
      if (options?.onSettled) {
        options.onSettled(data, error, variables, context, mutation);
      }
    },
    ...options,
  });
}
