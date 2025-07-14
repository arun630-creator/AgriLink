# TanStack Query v5 Migration Guide

## Overview

This project uses TanStack Query v5, which requires object-based syntax for all query and mutation hooks.

## Key Changes from v4 to v5

### useQuery Hook

**❌ Old v4 Syntax (No longer supported):**

```typescript
const { data, isLoading, error } = useQuery(["products"], () =>
  apiService.getProducts()
);
```

**✅ New v5 Syntax (Required):**

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["products"],
  queryFn: () => apiService.getProducts(),
});
```

### useMutation Hook

**❌ Old v4 Syntax (No longer supported):**

```typescript
const mutation = useMutation((data) => apiService.createProduct(data));
```

**✅ New v5 Syntax (Required):**

```typescript
const mutation = useMutation({
  mutationFn: (data) => apiService.createProduct(data),
});
```

## Best Practices

### 1. Use TypeScript Types

Import and use the provided types for better type safety:

```typescript
import { createQueryConfig, createMutationConfig } from "@/types/query";

// For queries
const queryConfig = createQueryConfig({
  queryKey: ["products"],
  queryFn: () => apiService.getProducts(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});

const { data } = useQuery(queryConfig);

// For mutations
const mutationConfig = createMutationConfig({
  mutationFn: (data) => apiService.createProduct(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
});

const mutation = useMutation(mutationConfig);
```

### 2. Common Patterns

#### Basic Query

```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ["products"],
  queryFn: () => apiService.getProducts(),
});
```

#### Query with Parameters

```typescript
const { data } = useQuery({
  queryKey: ["product", id],
  queryFn: () => apiService.getProduct(id),
  enabled: !!id,
});
```

#### Mutation with Success/Error Handling

```typescript
const mutation = useMutation({
  mutationFn: (data) => apiService.createProduct(data),
  onSuccess: (response) => {
    toast.success("Product created successfully!");
    queryClient.invalidateQueries({ queryKey: ["products"] });
  },
  onError: (error) => {
    toast.error(error.message || "Failed to create product");
  },
});
```

#### Infinite Query

```typescript
const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useInfiniteQuery({
    queryKey: ["products"],
    queryFn: ({ pageParam = 1 }) => apiService.getProducts({ page: pageParam }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.currentPage + 1
        : undefined,
  });
```

## Error Prevention

### ESLint Rules

The project includes ESLint rules that will catch incorrect syntax:

- `no-restricted-syntax` rule prevents array syntax for `useQuery` and `useMutation`
- TypeScript will provide type checking for query configurations

### Common Mistakes to Avoid

1. **Using array syntax instead of object syntax**
2. **Forgetting to wrap queryFn in a function**
3. **Not providing required properties (queryKey, queryFn)**
4. **Using old v4 options that are no longer supported**

## Migration Checklist

When migrating from v4 to v5:

- [ ] Update all `useQuery` calls to use object syntax
- [ ] Update all `useMutation` calls to use object syntax
- [ ] Update all `useInfiniteQuery` calls to use object syntax
- [ ] Remove any deprecated options
- [ ] Test all query and mutation functionality
- [ ] Update any custom query hooks

## Resources

- [TanStack Query v5 Migration Guide](https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5)
- [TanStack Query v5 Documentation](https://tanstack.com/query/latest/docs/react/overview)
- [Breaking Changes in v5](https://tanstack.com/query/latest/docs/react/guides/migrating-to-v5#breaking-changes)
